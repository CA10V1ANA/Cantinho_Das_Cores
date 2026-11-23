# Cantinho das Cores — Back-End (FastAPI + SQLite)

API Python + FastAPI com autenticação, perfis, catálogo, partidas, dashboard e relatórios persistidos em **SQLite**, usando o `schema.sql` fornecido pela equipe.

## Requisitos
- Python 3.11 ou superior
- SQLite (já incluído na biblioteca padrão do Python)

## Instalação — Windows / PowerShell
```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```
Configure `JWT_SECRET` em `.env` com um segredo aleatório e privado (veja "Configuração e variáveis de ambiente"). Opcionalmente, configure `DATABASE_PATH` para indicar outro caminho para o arquivo SQLite.

## Executar
```powershell
uvicorn app.main:app --reload --port 8000
```
- API: http://127.0.0.1:8000
- Swagger: http://127.0.0.1:8000/docs
- Saúde: http://127.0.0.1:8000/health

Na primeira inicialização, a API cria `data/cantinho_das_cores.sqlite3`, executa o `schema.sql` e insere o jogo `frutas`, que existe no Front-End mas não estava na lista inicial de INSERTs entregue pela equipe. A inicialização é idempotente.

## Módulo 1 — Autenticação
- `POST /api/auth/register` — recebe `name`, `email`, `password` e `accepted_terms` (obrigatório e precisa ser `true`). O campo `name` é aceito para compatibilidade com o contrato atual da API, mas o schema da equipe não possui coluna para nome do responsável; o nome público é apresentado usando a parte anterior ao `@` do e-mail.
- `POST /api/auth/login` — e-mail e senha; a busca de e-mail não diferencia maiúsculas/minúsculas.
- `POST /api/auth/guest` — token temporário de visitante.
- `GET /api/auth/me` — usuário atual.
- `POST /api/auth/logout` — logout stateless; o cliente deve descartar o token.

Senhas são armazenadas exclusivamente como hash Argon2. O token JWT contém o ID numérico do responsável do SQLite.

## Módulo 2 — Perfis das crianças
- `POST /api/children`
- `GET /api/children`
- `GET /api/children/{child_id}`
- `PUT /api/children/{child_id}`
- `DELETE /api/children/{child_id}`

Os campos são mapeados para `apelido`, `idade` e `id_responsavel`. A idade segue a restrição do SQL (3 a 18 anos). O ID do responsável vem exclusivamente do token. O SQLite aplica `ON DELETE CASCADE`.

## Módulo 3 — Catálogo de jogos
- `GET /api/games`
- `GET /api/games/{game_id}`

A listagem consulta a tabela `jogos`. A inicialização acrescenta `frutas` para compatibilidade com os seis jogos do Front-End.

## Módulo 4 — Partidas e resultados
- `POST /api/sessions` — registra partidas concluídas ou abandonadas.
- `GET /api/sessions` — lista somente partidas concluídas (para relatórios); filtros `child_id` e `game_id` são opcionais.
- `GET /api/sessions/{session_id}` — consulta partida concluída pertencente ao responsável.

O payload de criação usa `child_id`, `game_id`, `correct_answers`, `incorrect_answers`, `completed`, `duration_seconds` e `played_at` opcional. A pontuação é calculada como `acertos / (acertos + erros) * 100`; quando o total de tentativas é zero, a pontuação é zero. Partida concluída exige exatamente cinco acertos. Partidas abandonadas (`completed=false`) são gravadas, mas não aparecem nas consultas usadas pelos relatórios. A duração zero é permitida pelo SQL.

## Regras de banco e segurança
- `aceito_termo=1` é gravado somente quando o responsável envia `accepted_terms=true`.
- `email` tem unicidade `COLLATE NOCASE` no SQLite.
- Constraints e conflitos são convertidos em mensagens HTTP amigáveis (409 para conflito/duplicidade e 422 para dados inválidos/relações inválidas).
- Toda consulta de crianças e partidas é limitada ao responsável autenticado. Visitantes não gerenciam perfis nem consultam partidas.
- O schema da equipe não possui tabela de usuários separada: `responsaveis` é a identidade de autenticação.

## Observações sobre o schema recebido
- O Modelo Lógico mostra `relatorios.texto` como `INT`, mas o `schema.sql` define `TEXT`; a implementação considera o SQL executável como fonte do tipo.
- O SQL inicial insere cinco jogos, enquanto o Front-End possui seis; a inicialização inclui `frutas` sem modificar as outras definições do schema.
- O schema não tem coluna para nome do responsável. Não armazenamos esse dado em coluna improvisada.
- O banco local é SQLite. Para uso compartilhado/produção, será necessário definir hospedagem e estratégia de backup/concorrência do arquivo ou migração para banco servidor.

## Testes
```powershell
pytest -q
```

## Módulo 5 — Dashboard pedagógico
Rotas somente leitura, protegidas por Bearer JWT (apenas responsáveis). Todas aceitam `child_id` opcional (sem ele, agrega todos os perfis do responsável).

- `GET /api/dashboard/summary` — total de partidas, concluídas, taxa de conclusão, pontuação média, tempo médio, acertos e erros, última partida. Aceita `days`.
- `GET /api/dashboard/games` — desempenho por jogo (os seis, mesmo sem partidas). Aceita `days`.
- `GET /api/dashboard/evolution` — série diária (partidas, concluídas, pontuação e tempo médios). Aceita `game_id` e `days`.
- `GET /api/dashboard/history` — histórico paginado (`limit` até 100, `offset`), inclui partidas abandonadas.

Pontuação, tempo, acertos e erros consideram só partidas concluídas (veja "Regra dos indicadores").

## Módulo 6 — Relatórios pedagógicos
Rotas protegidas por Bearer JWT (apenas responsáveis). Os relatórios ficam na tabela `relatorios` e são apagados junto com o perfil da criança.

- `POST /api/reports` — gera e armazena o relatório de uma criança (`child_id`, `period_start`, `period_end`; período máximo de 366 dias). O texto é montado por regras fixas a partir das partidas do período.
- `GET /api/reports` — relatórios anteriores, mais recentes primeiro; filtros `child_id` e `sent` (`true` enviados, `false` pendentes).
- `GET /api/reports/{id}` — relatório completo.
- `GET /api/reports/{id}/status` — status de envio (`sent`, `sent_at`, `generated_at`).
- `POST /api/reports/{id}/sent` — preenche `enviado_em` com o horário atual; retorna 409 se já estiver enviado. A API só registra o envio; o envio em si (e-mail etc.) é feito fora dela.

## Regra dos indicadores (módulos 5 e 6)
Contagens de partidas (total, concluídas, abandonadas, taxa de conclusão) usam todas as partidas. Pontuação, tempo, acertos e erros dos dashboards e dos relatórios usam somente partidas concluídas; abandonadas aparecem nas contagens e no histórico.

## Configuração e variáveis de ambiente (`backend/.env`, modelo em `.env.example`)
| Variável | Padrão | Observação |
|---|---|---|
| `APP_ENV` | `development` | `production` ativa as validações abaixo. |
| `JWT_SECRET` | segredo de desenvolvimento | **Obrigatório em produção**: ≥ 32 caracteres, aleatório, privado e diferente do exemplo. Gere com `python -c "import secrets; print(secrets.token_urlsafe(48))"`. |
| `JWT_EXPIRE_MINUTES` | `60` | Validade do token. |
| `CORS_ORIGINS` | `http://localhost:5185,http://localhost:5173` | Origens do front separadas por vírgula. Em produção, só os domínios reais; `*` é recusado. |
| `DATABASE_PATH` | `backend/data/cantinho_das_cores.sqlite3` | Caminho do SQLite (relativo à pasta de onde o `uvicorn` é iniciado). Lido via `.env` ou variável de ambiente. |

Com `APP_ENV=production`, a API **não inicia** se `JWT_SECRET` for o padrão/de exemplo ou tiver menos de 32 caracteres, ou se `CORS_ORIGINS` contiver `*`.

## Testes
```powershell
cd backend
pytest -q
```
A suíte usa um **banco SQLite temporário** (`tests/conftest.py` define `DATABASE_PATH` antes de importar a aplicação e apaga a pasta ao final); ela não lê nem altera `backend/data/`. Cobre autenticação, perfis, catálogo, partidas, dashboard, relatórios, isolamento entre responsáveis, configuração de produção e tratamento de erros.

## Segurança — o que existe
- Senhas só como hash Argon2; JWT HS256 com expiração (`exp`), `jti` e verificação de assinatura.
- Toda rota privada filtra por responsável (`id_responsavel` do token); recurso de outro responsável responde 404. Visitante recebe 403 nas rotas restritas.
- Consultas SQLite parametrizadas (`?`); identificadores inválidos (texto, decimais, números fora da faixa) respondem 404.
- Erros não previstos respondem `500` com mensagem genérica em JSON (o detalhe vai só para o log do servidor); violações de constraint viram 409/422 amigáveis.
- `played_at` com fuso é convertido para UTC antes de gravar.

## Implantação, backup e persistência do SQLite
- O banco é **um arquivo**. Guarde-o em disco persistente (em hospedagens com disco efêmero ele se perde a cada deploy/reinício).
- Backup: com a API parada, copie o arquivo; com a API no ar, use `sqlite3 arquivo ".backup destino.sqlite3"`. Faça backups periódicos e teste a restauração.
- SQLite aceita bem poucas escritas simultâneas; para uso compartilhado/produção real, a equipe deve decidir hospedagem, backup e uma eventual migração para banco servidor (decisão externa a este módulo).
- Rode a API atrás de HTTPS e defina `APP_ENV=production`, `JWT_SECRET` e `CORS_ORIGINS` reais.

## Limitações conhecidas
- Logout é stateless: o token não é revogado no servidor (expira por tempo).
- Não há limitação de tentativas de login (rate limiting) nem bloqueio de conta.
- O cadastro não grava o nome do responsável (o schema oficial não tem coluna); o nome exibido vem da parte antes do `@` do e-mail.
- Token de um responsável excluído continua válido até expirar (as rotas privadas passam a devolver listas vazias/404/422).
- O sistema de envio real de relatórios (e-mail etc.) não existe; `POST /api/reports/{id}/sent` apenas registra o envio.

