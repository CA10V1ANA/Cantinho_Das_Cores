import { api } from "./api";

export const listarCriancas = () => api.get("/api/children");
export const criarCrianca = ({ nome, idade }) => api.post("/api/children", { name: nome.trim(), age: Number(idade) });
export const obterCrianca = (id) => api.get(`/api/children/${id}`);
export const editarCrianca = (id, { nome, idade }) =>
  api.put(`/api/children/${id}`, { name: nome.trim(), age: Number(idade) });
export const excluirCrianca = (id) => api.del(`/api/children/${id}`);
