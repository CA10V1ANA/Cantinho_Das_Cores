import { api, salvarToken } from "./api";

function guardar(resposta) {
  salvarToken(resposta.access_token);
  return resposta.user;
}

export async function cadastrar({ nome, email, senha, aceitouTermos }) {
  return guardar(
    await api.post(
      "/api/auth/register",
      { name: nome, email: email.trim().toLowerCase(), password: senha, accepted_terms: aceitouTermos === true },
      { auth: false }
    )
  );
}

export async function entrar({ email, senha }) {
  return guardar(
    await api.post("/api/auth/login", { email: email.trim().toLowerCase(), password: senha }, { auth: false })
  );
}

export async function entrarComoVisitante() {
  return guardar(await api.post("/api/auth/guest", undefined, { auth: false }));
}

export const usuarioAtual = () => api.get("/api/auth/me");

export async function renovarSessao() {
  return guardar(await api.post("/api/auth/refresh"));
}

export async function sair() {
  try {
    await api.post("/api/auth/logout");
  } catch {
    // O token local é descartado mesmo se houver falha de rede.
  }
  salvarToken("");
}
