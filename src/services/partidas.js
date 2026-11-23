import { api } from "./api";

// Espelha a regra definitiva de pontuação do Bloquinho de Frutas do backend (0..100).
export function calcularPontuacaoFrutas({
  acertos = 0,
  erros = 0,
  concluida = false,
  metasConcluidas = null,
  totalMetas = null,
  quadradosFechados = 0,
  jogadasRestantes = 0,
}) {
  const acertosNorm = concluida
    ? 5
    : metasConcluidas !== null && totalMetas
      ? Math.min(4, Math.round((metasConcluidas / Math.max(1, totalMetas)) * 5))
      : Math.min(4, Math.max(0, Number(acertos) || 0));

  const tentativas = acertosNorm + Math.max(0, Number(erros) || 0);
  const precisao = tentativas > 0 ? Math.round((acertosNorm / tentativas) * 100) : 0;

  if (tentativas === 0 && !concluida) {
    return { acertosNormalizados: acertosNorm, taxaPrecisao: 0, pontuacao: 0 };
  }

  const proporcaoMetas = concluida
    ? 1
    : metasConcluidas !== null && totalMetas
      ? Math.min(1, Math.max(0, metasConcluidas / Math.max(1, totalMetas)))
      : acertosNorm / 5;

  const base = Math.round(precisao * 0.7 + proporcaoMetas * 100 * 0.3);
  const bonusQuadrados = Math.min(15, Math.max(0, Number(quadradosFechados) || 0) * 5);
  const bonusJogadas = concluida ? Math.min(10, Math.max(0, Number(jogadasRestantes) || 0) * 2) : 0;
  const pontuacao = Math.min(100, Math.max(0, base + bonusQuadrados + bonusJogadas));

  return { acertosNormalizados: acertosNorm, taxaPrecisao: precisao, pontuacao };
}

// Converte o resumo do jogo no contrato real de POST /api/sessions.
// O banco aceita acertos de 0 a 5 e só marca "concluída" com 5 acertos.
export function montarPayload(criancaId, jogoId, resumo, jogadoEm) {
  const base = jogoId === "frutas" ? resumo.estrelas : resumo.acertos; // Frutas mede progresso em estrelas (0–5)
  const acertos = Math.min(5, Math.max(0, Number(base) || 0));
  const payload = {
    child_id: String(criancaId),
    game_id: jogoId,
    correct_answers: acertos,
    incorrect_answers: Math.max(0, Number(resumo.erros) || 0),
    completed: Boolean(resumo.concluida) && acertos === 5,
    duration_seconds: Math.min(86400, Math.max(1, Math.round(Number(resumo.duracaoSeg) || 1))), // a API aceita até 86400 s
    played_at: jogadoEm,
  };

  if (jogoId === "frutas") {
    if (resumo.metasConcluidas !== undefined) payload.goals_completed = Number(resumo.metasConcluidas);
    if (resumo.totalMetas !== undefined) payload.total_goals = Number(resumo.totalMetas);
    if (resumo.quadradosFechados !== undefined) payload.squares_closed = Number(resumo.quadradosFechados);
    if (resumo.jogadasRestantes !== undefined) payload.moves_remaining = Number(resumo.jogadasRestantes);
  }

  return payload;
}

export const registrarPartida = (payload, opts) => api.post("/api/sessions", payload, opts);
