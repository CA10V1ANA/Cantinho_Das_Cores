import { api } from "./api";

export const gerarRelatorio = (childId, inicio, fim) =>
  api.post("/api/reports", { child_id: String(childId), period_start: inicio, period_end: fim });
export const listarRelatorios = (childId) => api.get("/api/reports", { child_id: childId });
export const obterRelatorio = (id) => api.get(`/api/reports/${id}`);
export const statusRelatorio = (id) => api.get(`/api/reports/${id}/status`);
// Envia o relatório pelo canal configurado no backend (e-mail/SMTP, webhook ou caixa de saída) e preenche enviado_em.
export const registrarEnvio = (id, opcoes) => api.post(`/api/reports/${id}/sent`, opcoes);
export const enviarRelatorio = (id, opcoes) => api.post(`/api/reports/${id}/send`, opcoes);
