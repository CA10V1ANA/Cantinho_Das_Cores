import { api } from "./api";

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
