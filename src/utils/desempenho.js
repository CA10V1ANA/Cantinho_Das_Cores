const CHAVE_HISTORICO = "cc_historico_v1";
const MAX_REGISTROS = 300;

export const NOMES_JOGOS = {
  cores: "Acerte a cor",
  encaixe: "Encaixe as formas",
  ligar: "Ligue ao nome",
  corforma: "Cor e forma",
  falar: "Vamos falar",
  frutas: "Bloquinho de Frutas",
};

export const ORDEM_JOGOS = ["cores", "encaixe", "ligar", "corforma", "falar", "frutas"];
export const ORDEM_IDADES = ["8", "9", "10"];

export function lerHistorico() {
  try {
    const bruto = localStorage.getItem(CHAVE_HISTORICO);
    if (!bruto) return [];
    const parsed = JSON.parse(bruto);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function salvarHistorico(lista) {
  try {
    localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(lista.slice(-MAX_REGISTROS)));
  } catch {
    // Ignora caso localStorage esteja indisponível
  }
}

export function limparHistorico() {
  try {
    localStorage.removeItem(CHAVE_HISTORICO);
  } catch {
    // Ignora caso localStorage esteja indisponível
  }
  return [];
}

export function registrarPartida(partida) {
  if (!partida || !partida.jogoId) return lerHistorico();
  const acertos = Math.max(0, Number(partida.acertos) || 0);
  const erros = Math.max(0, Number(partida.erros) || 0);
  const tentativas = acertos + erros;
  if (tentativas === 0 && !partida.concluida) return lerHistorico();

  const item = {
    id: partida.id || `${partida.jogoId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    jogoId: partida.jogoId,
    idade: ["8", "9", "10"].includes(String(partida.idade)) ? String(partida.idade) : "8",
    acertos,
    erros,
    tentativas,
    taxa: tentativas > 0 ? Math.round((acertos / tentativas) * 100) : 100,
    estrelas: Math.max(0, Number(partida.estrelas) || 0),
    totalEstrelas: Math.max(1, Number(partida.totalEstrelas) || 5),
    concluida: Boolean(partida.concluida),
    duracaoSeg: Math.max(1, Math.round(Number(partida.duracaoSeg) || 1)),
    data: partida.data || new Date().toISOString(),
    demo: Boolean(partida.demo),
  };

  const atual = lerHistorico();
  const idx = atual.findIndex((r) => r.id === item.id);
  const proximo = idx >= 0 ? atual.map((r, i) => (i === idx ? item : r)) : [...atual, item];
  salvarHistorico(proximo);
  return proximo;
}

function calcularTendencia(registrosOrdenados) {
  if (registrosOrdenados.length < 2) {
    return { delta: 0, status: "poucos_dados" };
  }
  const meio = Math.floor(registrosOrdenados.length / 2);
  const inicio = registrosOrdenados.slice(0, meio);
  const recente = registrosOrdenados.slice(meio);

  const media = (arr) => {
    const totA = arr.reduce((s, r) => s + r.acertos, 0);
    const totT = arr.reduce((s, r) => s + Math.max(1, r.tentativas), 0);
    return Math.round((totA / totT) * 100);
  };

  const mInicio = media(inicio);
  const mRecente = media(recente);
  const delta = mRecente - mInicio;

  if (delta >= 4) return { delta, status: "melhora" };
  if (delta <= -4) return { delta, status: "reforco" };
  return { delta, status: "estavel" };
}

export function calcularMetricas(historico, filtroJogo = "todos", filtroIdade = "todas") {
  const ordenados = [...historico].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  const filtrados = ordenados.filter((r) => {
    const okJogo = filtroJogo === "todos" || r.jogoId === filtroJogo;
    const okIdade = filtroIdade === "todas" || String(r.idade) === String(filtroIdade);
    return okJogo && okIdade;
  });

  const totalAcertos = filtrados.reduce((s, r) => s + r.acertos, 0);
  const totalErros = filtrados.reduce((s, r) => s + r.erros, 0);
  const totalTentativas = totalAcertos + totalErros;
  const taxaMedia = totalTentativas > 0 ? Math.round((totalAcertos / totalTentativas) * 100) : 0;
  const partidasConcluidas = filtrados.filter((r) => r.concluida).length;
  const tendencia = calcularTendencia(filtrados);

  const serieTemporal = filtrados.slice(-14).map((r, i) => ({
    id: r.id,
    indice: i + 1,
    jogoId: r.jogoId,
    jogoNome: NOMES_JOGOS[r.jogoId] || r.jogoId,
    idade: r.idade,
    acertos: r.acertos,
    erros: r.erros,
    taxa: r.taxa,
    data: r.data,
  }));

  const resumoPorJogo = ORDEM_JOGOS.map((jogoId) => {
    const listaJogo = ordenados.filter(
      (r) =>
        r.jogoId === jogoId &&
        (filtroIdade === "todas" || String(r.idade) === String(filtroIdade))
    );
    const acertos = listaJogo.reduce((s, r) => s + r.acertos, 0);
    const erros = listaJogo.reduce((s, r) => s + r.erros, 0);
    const tentativas = acertos + erros;
    const taxa = tentativas > 0 ? Math.round((acertos / tentativas) * 100) : null;
    const tend = calcularTendencia(listaJogo);

    const porIdade = {};
    for (const idade of ORDEM_IDADES) {
      const sub = ordenados.filter((r) => r.jogoId === jogoId && String(r.idade) === idade);
      const aI = sub.reduce((s, r) => s + r.acertos, 0);
      const eI = sub.reduce((s, r) => s + r.erros, 0);
      const tI = aI + eI;
      porIdade[idade] = {
        partidas: sub.length,
        acertos: aI,
        erros: eI,
        taxa: tI > 0 ? Math.round((aI / tI) * 100) : null,
      };
    }

    return {
      jogoId,
      nome: NOMES_JOGOS[jogoId],
      partidas: listaJogo.length,
      acertos,
      erros,
      tentativas,
      taxa,
      tendencia: tend,
      porIdade,
    };
  });

  const jogosComDados = resumoPorJogo.filter((j) => j.partidas > 0);
  const melhorEvolucao = [...jogosComDados].sort(
    (a, b) => b.tendencia.delta - a.tendencia.delta || (b.taxa ?? 0) - (a.taxa ?? 0)
  )[0] || null;

  const insights = gerarInsights(filtrados, jogosComDados, tendencia, melhorEvolucao);

  return {
    filtrados,
    totalPartidas: filtrados.length,
    partidasConcluidas,
    totalAcertos,
    totalErros,
    totalTentativas,
    taxaMedia,
    tendencia,
    serieTemporal,
    resumoPorJogo,
    melhorEvolucao,
    insights,
  };
}

function gerarInsights(filtrados, jogosComDados, tendencia, melhorEvolucao) {
  if (!filtrados.length) {
    return [
      "Ainda não há partidas registradas para este filtro. Assim que a criança jogar, os acertos e a evolução aparecerão aqui automaticamente.",
    ];
  }

  const lista = [];
  if (tendencia.status === "melhora") {
    lista.push(
      `Evolução positiva de +${tendencia.delta}% na taxa de acertos comparando as primeiras partidas com as mais recentes.`
    );
  } else if (tendencia.status === "estavel" && filtrados.length >= 2) {
    lista.push(
      "Desempenho consistente nas últimas sessões. Experimente avançar a faixa etária para novos desafios."
    );
  } else if (tendencia.status === "reforco") {
    lista.push(
      `Queda leve de ${Math.abs(tendencia.delta)}% nos acertos recentes — pode ser útil praticar na faixa etária anterior para consolidar confiança.`
    );
  }

  if (melhorEvolucao && melhorEvolucao.tendencia.delta > 0) {
    lista.push(
      `Maior avanço recente em "${melhorEvolucao.nome}" (+${melhorEvolucao.tendencia.delta}% de acertos).`
    );
  }

  const precisaApoio = [...jogosComDados]
    .filter((j) => j.taxa !== null && j.taxa < 75)
    .sort((a, b) => (a.taxa ?? 100) - (b.taxa ?? 100))[0];

  if (precisaApoio) {
    lista.push(
      `Ponto de atenção: "${precisaApoio.nome}" está com ${precisaApoio.taxa}% de acertos. Ative a fala calma ou tente no nível de 8 anos.`
    );
  }

  if (!lista.length) {
    lista.push(
      "Continue acompanhando! Com 2 ou mais partidas no mesmo jogo, o painel mostra a comparação de evolução ao longo do tempo."
    );
  }

  return lista;
}

export function gerarDadosExemplo() {
  const agora = Date.now();
  const dia = 24 * 60 * 60 * 1000;
  const modelos = [
    { jogoId: "cores", idade: "8", acertos: 4, erros: 2, estrelas: 5, diasAtras: 9 },
    { jogoId: "cores", idade: "8", acertos: 5, erros: 1, estrelas: 5, diasAtras: 8 },
    { jogoId: "cores", idade: "9", acertos: 4, erros: 1, estrelas: 5, diasAtras: 6 },
    { jogoId: "cores", idade: "10", acertos: 5, erros: 0, estrelas: 5, diasAtras: 3 },

    { jogoId: "encaixe", idade: "8", acertos: 4, erros: 2, estrelas: 5, diasAtras: 9 },
    { jogoId: "encaixe", idade: "9", acertos: 4, erros: 2, estrelas: 5, diasAtras: 5 },
    { jogoId: "encaixe", idade: "9", acertos: 5, erros: 0, estrelas: 5, diasAtras: 2 },

    { jogoId: "ligar", idade: "8", acertos: 5, erros: 2, estrelas: 5, diasAtras: 7 },
    { jogoId: "ligar", idade: "9", acertos: 5, erros: 1, estrelas: 5, diasAtras: 4 },
    { jogoId: "ligar", idade: "10", acertos: 5, erros: 1, estrelas: 5, diasAtras: 1 },

    { jogoId: "corforma", idade: "8", acertos: 3, erros: 3, estrelas: 5, diasAtras: 8 },
    { jogoId: "corforma", idade: "9", acertos: 4, erros: 2, estrelas: 5, diasAtras: 5 },
    { jogoId: "corforma", idade: "10", acertos: 5, erros: 1, estrelas: 5, diasAtras: 1 },

    { jogoId: "falar", idade: "8", acertos: 5, erros: 0, estrelas: 5, diasAtras: 6 },
    { jogoId: "falar", idade: "9", acertos: 5, erros: 0, estrelas: 5, diasAtras: 2 },

    { jogoId: "frutas", idade: "8", acertos: 7, erros: 2, estrelas: 5, diasAtras: 7 },
    { jogoId: "frutas", idade: "9", acertos: 9, erros: 1, estrelas: 5, diasAtras: 4 },
    { jogoId: "frutas", idade: "10", acertos: 11, erros: 1, estrelas: 5, diasAtras: 0 },
  ];

  const gerados = modelos.map((m, idx) => {
    const tentativas = m.acertos + m.erros;
    return {
      id: `demo-${idx}-${m.jogoId}-${m.idade}`,
      jogoId: m.jogoId,
      idade: m.idade,
      acertos: m.acertos,
      erros: m.erros,
      tentativas,
      taxa: Math.round((m.acertos / tentativas) * 100),
      estrelas: m.estrelas,
      totalEstrelas: 5,
      concluida: true,
      duracaoSeg: 45 + idx * 4,
      data: new Date(agora - m.diasAtras * dia + idx * 600000).toISOString(),
      demo: true,
    };
  });

  const atuaisReais = lerHistorico().filter((r) => !r.demo);
  const combinado = [...atuaisReais, ...gerados];
  salvarHistorico(combinado);
  return combinado;
}

export function exportarHistoricoCSV(historico) {
  if (!historico.length || typeof document === "undefined") return;
  const cabecalho = ["Data", "Jogo", "Faixa Etaria", "Acertos", "Erros", "Taxa (%)", "Estrelas", "Concluida"];
  const linhas = historico.map((r) => [
    new Date(r.data).toLocaleString("pt-BR"),
    NOMES_JOGOS[r.jogoId] || r.jogoId,
    `${r.idade} anos`,
    r.acertos,
    r.erros,
    r.taxa,
    `${r.estrelas}/${r.totalEstrelas}`,
    r.concluida ? "Sim" : "Parcial",
  ]);
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [cabecalho, ...linhas].map((row) => row.map(esc).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "desempenho-cantinho-das-cores.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
