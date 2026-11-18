# Cantinho das Cores — Frontend (`front-at-pico`)

Aplicação web educativa em **React + Vite + CSS puro**, com foco em acessibilidade, síntese de voz em português (`SpeechSynthesis`) e interações táteis (arrastar com mouse, toque ou caneta e navegação completa por teclado).

**Demo publicada (GitHub Pages):** https://ca10v1ana.github.io/front-at-pico/

## Jogos disponíveis

1. **Acerte a cor** — Associe e arraste a bolinha até a cor correspondente.
2. **Encaixe as formas** — Arraste ou selecione cada forma geométrica até seu encaixe.
3. **Ligue ao nome** — Relacione cada figura à palavra escrita.
4. **Cor e forma** — Identifique a combinação de cor e forma solicitada pela Nuvi.
5. **Vamos falar** — Treino de fala por sílabas com leitura em voz suave e sílabas clicáveis.
6. **Bloquinho de Frutas (Estilo Dots)** — Ligue duas ou mais frutinhas iguais vizinhas (ou feche um quadrado mágico) para colher as metas antes de acabar as jogadas.

## Níveis por idade (8 a 10 anos), Bloquinhos do Autismo e Painel de Pais/Professores

- **Níveis por faixa etária (`8 anos · Fácil`, `9 anos · Médio`, `10 anos · Avançado`):** ajustam o número de opções, formas geométricas, vocabulário, tamanho do tabuleiro de frutas e complexidade visual em todos os jogos.
- **Aba `🧩 Bloquinhos`:** espaço interativo dedicado com o componente `ShapePhysics` (Canvas2D com física 3D/2D nas cores clássicas do autismo), mantendo o cenário original de céu, sol, nuvens e colinas ao fundo em todas as telas.
- **Aba `📊 Pais e Professores`:** acompanhamento de evolução com filtros por jogo e por idade, gráfico temporal de acertos, matriz por jogo e dificuldade, leitura pedagógica automática, dados de exemplo e exportação CSV.

## Recursos de acessibilidade e UX

- **Modo visitante e login flexível:** aceita qualquer e-mail válido com validação visual por campo ou acesso direto em 1 clique como visitante.
- **Painel de ajustes no menu (`⚙️ Ajustes`):** fonte ampliada (`Aa Fonte A+`), **Alto contraste**, **Modo calmo** (remove confetes, animações e pausa a física dos bloquinhos), controle de efeitos sonoros (Web Audio API), ritmo de fala (**Fala calma / normal**), seleção de voz pt-BR e duração das partidas (**3 ou 5 rodadas**).
- **Apoio multissensorial nos jogos:** ícone `✓` para daltonismo, dicas progressivas da Nuvi, leitura de palavras por toque e encaixe completo sem rolagem no celular.

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
