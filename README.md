# Cantinho das Cores — Frontend (`front-at-pico`)

Aplicação web educativa em **React + Vite + CSS puro**, com foco em acessibilidade, síntese de voz em português (`SpeechSynthesis`) e interações táteis (arrastar com mouse, toque ou caneta e navegação completa por teclado).

**Demo publicada (GitHub Pages):** https://ca10v1ana.github.io/front-at-pico/

## Jogos disponíveis

1. **Acerte a cor** — Associe e arraste a bolinha até a cor correspondente.
2. **Encaixe as formas** — Arraste ou selecione cada forma geométrica até seu encaixe.
3. **Ligue ao nome** — Relacione cada figura à palavra escrita.
4. **Cor e forma** — Identifique a combinação de cor e forma solicitada pela Nuvi.
5. **Vamos falar** — Treino de fala por sílabas com leitura em voz suave.

## Como executar localmente

```bash
npm install
npm run dev
```

O servidor local sobe por padrão na porta `5185`.

## Scripts úteis

- `npm run dev`: inicia o servidor de desenvolvimento Vite (porta `5185`).
- `npm run build`: gera o bundle de produção em `dist/` com `base: '/front-at-pico/'`.
- `npm run preview`: pré-visualiza o build de produção localmente.
- `npm run lint`: executa a verificação com `oxlint`.
- `npm run deploy`: gera o build e publica a pasta `dist/` na branch `gh-pages`.

## Estrutura de pastas

```text
src/
├── components/   # Peças visuais reutilizáveis (Nuvi, Arrasta, Casca, Forma, Fundo, etc.)
├── data/         # Dados de cores, formas, palavras e frases
├── games/        # Os 5 jogos educativos
├── pages/        # Telas de Login e Menu principal
├── styles/       # CSS modular (tokens, global, login-menu e jogos)
└── utils/        # Helpers de voz (pt-BR), validação e sorteio
```
