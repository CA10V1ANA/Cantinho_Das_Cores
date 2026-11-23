# Cantinho das Cores (`Cantinho_Das_Cores`)

Aplicação web educativa completa (**React + Vite + CSS puro** no Front-End e **Python + FastAPI + SQLite** no Back-End), com foco em acessibilidade, síntese de voz em português (`SpeechSynthesis`), interações táteis e acompanhamento pedagógico para pais e professores.

**Demo publicada (GitHub Pages):** https://ca10v1ana.github.io/Cantinho_Das_Cores/

---

## Jogos disponíveis

1. **Acerte a cor** — Associe e arraste a bolinha até a cor correspondente.
2. **Encaixe as formas** — Arraste ou selecione cada forma geométrica até seu encaixe.
3. **Ligue ao nome** — Relacione cada figura à palavra escrita.
4. **Cor e forma** — Identifique a combinação de cor e forma solicitada pela Nuvi.
5. **Vamos falar** — Treino de fala por sílabas com leitura em voz suave e sílabas clicáveis.
6. **Bloquinho de Frutas (Estilo Dots)** — Ligue duas ou mais frutinhas iguais vizinhas (ou feche um quadrado mágico) para colher as metas antes de acabar as jogadas.

---

## Arquitetura Completa (Front-End + Back-End)

- **Front-End (`src/`):**
  - Níveis por faixa etária (`8 anos · Fácil`, `9 anos · Médio`, `10 anos · Avançado`).
  - Aba `🧩 Bloquinhos` com `ShapePhysics` (Canvas2D nas cores clássicas do autismo).
  - Aba `📊 Pais e Professores` com gráficos de evolução, matriz por jogo e idade, exportação CSV, **envio real de relatórios pedagógicos** (`📧 Enviar relatório`) e **acionamento de backup online do banco** (`💾 Backup BD`).
  - Integração em [`src/services/api.js`](src/services/api.js) e [`src/services/partidas.js`](src/services/partidas.js) com fallback offline transparente em `localStorage`.
- **Back-End (`backend/`):**
  - **Regra definitiva de pontuação do Bloquinho de Frutas (`frutas`):** normaliza os acertos de `0` a `5` (compatível com as constraints do `schema.sql`), pondera precisão das conexões (70%) + progresso de metas (30%) e soma bônus por **Quadrados Mágicos** fechados (+5 pts cada, até +15) e **jogadas restantes** ao concluir (+2 pts cada, até +10), limitado a `0..100`.
  - **Canal real de envio dos relatórios (`backend/app/modules/reports/delivery.py`):** suporta envio via **SMTP / E-mail**, **Webhook HTTP** ou **Caixa de saída auditável** (`POST /api/reports/{id}/send` e `POST /api/reports/{id}/sent`).
  - **Segurança de autenticação e sessões:** hashes Argon2, JWT HS256 com `jti`, **revogação server-side de tokens no logout** (`tokens_revogados`), renovação com rotação em `POST /api/auth/refresh`, **rate limiting contra força bruta** no login (`HTTP 429` com `Retry-After`) e invalidação imediata de tokens de responsáveis excluídos.
  - **Persistência e backup do SQLite:** banco em modo `WAL` (`Write-Ahead Logging`), endpoints `POST /api/system/backup` e `GET /api/system/backups` usando `sqlite3.Connection.backup()` com rotação automática, além do utilitário CLI `python -m scripts.backup_db`.
  - **Hospedagem, domínio e HTTPS:** configurado com [`backend/Dockerfile`](backend/Dockerfile), [`docker-compose.yml`](docker-compose.yml), proxy reverso HTTPS automático em [`deploy/Caddyfile`](deploy/Caddyfile) (Let's Encrypt + HSTS + cabeçalhos de segurança) e blueprint [`render.yaml`](render.yaml) com disco persistente.

---

## Como executar localmente

### 1. Front-End (Vite + React)
```bash
cp .env.example .env
npm install
npm run dev
```
O Front-End sobe na porta `5185` (`http://localhost:5185`).

### 2. Back-End (FastAPI + SQLite)
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- Healthcheck: `http://127.0.0.1:8000/health`

### 3. Testes automatizados do Back-End
```bash
cd backend
pytest -q
```
