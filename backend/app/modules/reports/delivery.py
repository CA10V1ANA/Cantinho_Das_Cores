"""Canal real de envio dos relatórios pedagógicos (SMTP / E-mail, Webhook HTTP ou Caixa de saída auditável)."""
from datetime import datetime, timezone
from email.message import EmailMessage
import logging
import smtplib
import httpx
from app.core.config import settings

logger = logging.getLogger("cantinho.delivery")

# Histórico em memória das entregas processadas para auditoria e testes
_delivery_outbox: list[dict] = []


def get_outbox() -> list[dict]:
    return list(_delivery_outbox)


def clear_outbox() -> None:
    _delivery_outbox.clear()


def _send_via_smtp(recipient_email: str, subject: str, body: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from or "no-reply@cantinhodascores.com.br"
    msg["To"] = recipient_email
    msg.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)


def _send_via_webhook(url: str, payload: dict) -> None:
    response = httpx.post(url, json=payload, timeout=15)
    response.raise_for_status()


def deliver_report(
    report: dict,
    *,
    owner_email: str,
    channel: str | None = None,
    recipient: str | None = None,
) -> dict:
    """Envia o relatório pelo canal configurado ou solicitado:
    - `smtp` / `email`: envia via servidor SMTP configurado (em produção exige SMTP_HOST; em desenvolvimento cai na outbox se ausente).
    - `webhook`: envia POST JSON para `recipient` (URL) ou `settings.report_webhook_url`.
    - `console`: registra na caixa de saída auditável e no log estruturado (bloqueado em produção).
    """
    mode = (channel or settings.report_delivery_mode or "console").strip().lower()
    target = (recipient or owner_email or "").strip()
    subject = f"Relatório Pedagógico — {report['child_name']} ({report['period_start']} a {report['period_end']})"
    now_iso = datetime.now(timezone.utc).isoformat()

    envelope = {
        "report_id": report["id"],
        "child_id": report["child_id"],
        "child_name": report["child_name"],
        "recipient": target,
        "channel": mode,
        "subject": subject,
        "text": report["text"],
        "delivered_at": now_iso,
    }

    if mode in {"smtp", "email"}:
        if not target or "@" not in target:
            raise ValueError("E-mail de destino inválido para envio do relatório.")
        if settings.smtp_host:
            _send_via_smtp(target, subject, report["text"])
            envelope["provider"] = "smtp"
        elif settings.is_production:
            raise ValueError("Envio por e-mail não configurado em produção: defina SMTP_HOST no servidor ou utilize webhook.")
        else:
            logger.info("Relatório #%s registrado na caixa de saída local (dev) para %s", report["id"], target)
            envelope["provider"] = "outbox"
    elif mode == "webhook":
        webhook_url = target if target.startswith(("http://", "https://")) else settings.report_webhook_url
        if not webhook_url:
            raise ValueError("URL de webhook não configurada para envio do relatório.")
        _send_via_webhook(webhook_url, envelope)
        envelope["recipient"] = webhook_url
        envelope["provider"] = "webhook"
    elif mode == "console":
        if settings.is_production:
            raise ValueError("Canal 'console' não é permitido em produção. Configure SMTP ou Webhook.")
        logger.info("Relatório #%s enviado para %s via canal %s", report["id"], target, mode)
        envelope["provider"] = "outbox"
    else:
        raise ValueError(f"Canal de envio não suportado: {mode}")

    _delivery_outbox.append(envelope)
    return envelope
