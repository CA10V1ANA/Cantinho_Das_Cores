# Módulo 8 — Relatório de Auditoria, Estabilização e Produção

Relatório técnico de auditoria, estabilização e preparação para produção do projeto **Cantinho das Cores** (`Cantinho_Das_Cores`).

---

## 1. Resumo da Auditoria e Testes Automatizados

- **Suíte de Testes do Back-End (`pytest`):** **99 testes automatizados passando** (`backend/tests/`), utilizando banco SQLite temporário isolado (`tests/conftest.py`) para nunca afetar `backend/data/cantinho_das_cores.sqlite3`.
  - `test_auth.py`: cadastro, login case-insensitive, aceite obrigatório de termos, visitante, `/me` e `/logout`.
  - `test_children.py`: CRUD completo de perfis de crianças (3 a 18 anos) e isolamento por responsável.
  - `test_games.py`: catálogo dos 6 jogos (`cores`, `encaixe`, `ligar`, `corforma`, `falar`, `frutas`).
  - `test_sessions.py`: registro de partidas concluídas e abandonadas, cálculo de tentativas, precisão e exclusão em cascata.
  - `test_dashboard.py`: indicadores agregados (`summary`, `games`, `evolution`, `history`), separando contagens gerais de métricas de desempenho (exclusivas de partidas concluídas).
  - `test_reports.py`: geração de relatórios por período, listagem, filtros (`sent=true/false`) e marcação de envio.
  - `test_integracao_front.py`: fluxos ponta a ponta compatíveis com `src/services/`.
  - `test_estabilizacao.py`: auditoria de segurança, rejeição de tokens forjados/expirados, IDs malformados retornando `404` (nunca `500`), sanitização de erros inesperados (`500` genérico sem vazar SQL ou caminhos), conversão de `played_at` para UTC e validação de configuração de produção.
  - `test_requisitos_producao.py`: testes dedicados aos 5 requisitos finais de produção.
- **Qualidade do Front-End (`oxlint` + `vite build`):**
  - `npm run lint`: **0 warnings e 0 errors** em todos os 43 arquivos de `src/`.
  - `npm run build`: build de produção gerado com sucesso em `dist/`.

---

## 2. Resolução dos 5 Requisitos de Produção

### 2.1. Regra definitiva de pontuação do Bloquinho de Frutas (`frutas`)
- **Normalização compatível com `schema.sql`:** o progresso em estrelas (`0..5`) e as metas concluídas (`goals_completed / total_goals`) são normalizados para `0..5` acertos, respeitando `CHECK(acertos BETWEEN 0 AND 5)` e `CHECK(concluida = 0 OR acertos = 5)`.
- **Fórmula de pontuação (`0..100`):**
  - Base: `70%` precisão das jogadas (`acertos / tentativas`) + `30%` proporção de metas concluídas.
  - Bônus de Quadrado Mágico: `+5` pontos por quadrado fechado (`squares_closed`), até `+15` pontos.
  - Bônus de eficiência: `+2` pontos por jogada restante ao concluir (`moves_remaining`), até `+10` pontos.
  - Teto garantido em `100` pontos (`CHECK(pontuacao BETWEEN 0 AND 100)`).

### 2.2. Canal real de envio dos relatórios
- Implementado em [`backend/app/modules/reports/delivery.py`](backend/app/modules/reports/delivery.py) com suporte a 3 modos configuráveis via `REPORT_DELIVERY_MODE`:
  1. `smtp` / `email`: envio real via servidor SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_USE_TLS`).
  2. `webhook`: envio via `POST` JSON para `REPORT_WEBHOOK_URL` ou URL destinatária.
  3. `console`: registro auditável na caixa de saída (`outbox`) e log estruturado.
- Integrado às rotas `POST /api/reports/{id}/send` e `POST /api/reports/{id}/sent` e ao botão **"Enviar relatório"** na interface [`src/pages/Relatorios.jsx`](src/pages/Relatorios.jsx).

### 2.3. Hospedagem, domínio e HTTPS
- Middleware HTTP em [`backend/app/main.py`](backend/app/main.py) adicionando `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` e `Referrer-Policy`.
- Validação estrita em produção (`APP_ENV=production`): recusa inicialização se `JWT_SECRET` for padrão/curto (`< 32` caracteres) ou se `CORS_ORIGINS` contiver `*`.
- Infraestrutura pronta com [`backend/Dockerfile`](backend/Dockerfile), [`docker-compose.yml`](docker-compose.yml), proxy reverso HTTPS automático com Let's Encrypt em [`deploy/Caddyfile`](deploy/Caddyfile) e deploy em nuvem com disco persistente em [`render.yaml`](render.yaml).

### 2.4. Backup e persistência do banco de dados
- SQLite configurado com `PRAGMA journal_mode = WAL`, `PRAGMA synchronous = NORMAL`, `PRAGMA foreign_keys = ON` e `PRAGMA busy_timeout = 15000`.
- Backup online consistente sem parar a API usando `sqlite3.Connection.backup()`, com rotação automática mantendo os últimos `BACKUP_KEEP_COUNT` arquivos.
- Disponível via endpoints protegidos (`POST /api/system/backup` e `GET /api/system/backups`) e via script CLI [`backend/scripts/backup_db.py`](backend/scripts/backup_db.py) (`create`, `list`, `restore`).

### 2.5. Segurança da autenticação e das sessões
- Senhas armazenadas exclusivamente com hash **Argon2** (`argon2-cffi`).
- **Revogação server-side de tokens no logout:** tabela `tokens_revogados` armazena o `jti` do JWT no `POST /api/auth/logout`, impedindo qualquer reuso do token.
- **Rotação de sessão:** `POST /api/auth/refresh` emite novo token e revoga o `jti` anterior.
- **Proteção contra força bruta (Rate Limiting):** bloqueio temporário por IP + e-mail após `AUTH_RATE_LIMIT_MAX_ATTEMPTS` falhas na janela `AUTH_RATE_LIMIT_WINDOW_SECONDS`, respondendo `429 Too Many Requests` com cabeçalho `Retry-After`.
- **Invalidação de responsável excluído:** verificação ativa da existência do responsável no banco em todas as rotas privadas, retornando `401 Unauthorized` caso a conta tenha sido removida.
