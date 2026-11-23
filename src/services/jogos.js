import { api } from "./api";

export const listarJogos = () => api.get("/api/games", undefined, { auth: false });
