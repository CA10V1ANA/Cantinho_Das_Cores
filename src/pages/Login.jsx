import { useState } from "react";
import { emailOk } from "../utils/validacao";
import Nuvi from "../components/Nuvi";
import Titulo from "../components/Titulo";

export default function Login({ onLogin, onCadastro, onVisitante, aviso }) {
  const [modo, setModo] = useState("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [aceito, setAceito] = useState(false);
  const [erro, setErro] = useState("");
  const [campoErro, setCampoErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const cadastro = modo === "cadastrar";

  const falhar = (campo, msg) => {
    setCampoErro(campo);
    setErro(msg);
  };

  const trocarModo = (novo) => {
    setModo(novo);
    setErro("");
    setCampoErro("");
  };

  const enviar = async (ev) => {
    ev.preventDefault();
    if (enviando) return;
    if (cadastro && nome.trim().length < 2) return falhar("nome", "Digite seu nome (mínimo 2 letras).");
    if (!emailOk(email)) return falhar("email", "Digite um e-mail válido (ex.: nome@exemplo.com).");
    if (cadastro && senha.length < 8) return falhar("senha", "A senha precisa ter pelo menos 8 caracteres.");
    if (!cadastro && !senha) return falhar("senha", "Digite sua senha.");
    if (cadastro && !aceito) return falhar("aceito", "Aceite os termos para criar a conta.");
    setErro("");
    setCampoErro("");
    setEnviando(true);
    try {
      if (cadastro) await onCadastro({ nome: nome.trim(), email, senha, aceitouTermos: true });
      else await onLogin({ email, senha });
    } catch (e) {
      const conflito = e.status === 409;
      falhar(conflito ? "email" : "", conflito ? "Este e-mail já tem cadastro. Tente entrar." : e.message);
    } finally {
      setEnviando(false);
    }
  };

  const visitante = async () => {
    if (enviando) return;
    setEnviando(true);
    setErro("");
    try {
      await onVisitante();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const limpar = (campo) => campoErro === campo && setCampoErro("");

  return (
    <main className="tela login">
      <Titulo t="Cantinho das Cores" />
      <Nuvi fala="Oi! Um adulto pode entrar abaixo ou testar direto como visitante." />
      <form className="cartao" onSubmit={enviar} noValidate aria-describedby={erro || aviso ? "login-erro" : undefined}>
        <div className="login-modos" role="group" aria-label="Entrar ou criar conta">
          <button type="button" className={`chip ${!cadastro ? "on" : ""}`} aria-pressed={!cadastro} onClick={() => trocarModo("entrar")}>
            Entrar
          </button>
          <button type="button" className={`chip ${cadastro ? "on" : ""}`} aria-pressed={cadastro} onClick={() => trocarModo("cadastrar")}>
            Criar conta
          </button>
        </div>

        {cadastro && (
          <>
            <label htmlFor="nm">Nome do responsável</label>
            <input
              id="nm"
              autoComplete="name"
              placeholder="Seu nome"
              className={campoErro === "nome" ? "invalido" : ""}
              aria-invalid={campoErro === "nome"}
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                limpar("nome");
              }}
            />
          </>
        )}
        <label htmlFor="gm">E-mail do responsável</label>
        <input
          id="gm"
          type="email"
          autoComplete="email"
          placeholder="nome@exemplo.com"
          className={campoErro === "email" ? "invalido" : ""}
          aria-invalid={campoErro === "email"}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            limpar("email");
          }}
        />
        <label htmlFor="sn">Senha</label>
        <input
          id="sn"
          type="password"
          autoComplete={cadastro ? "new-password" : "current-password"}
          placeholder={cadastro ? "Mínimo 8 caracteres" : "Sua senha"}
          className={campoErro === "senha" ? "invalido" : ""}
          aria-invalid={campoErro === "senha"}
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            limpar("senha");
          }}
        />
        {cadastro && (
          <label className={`check ${campoErro === "aceito" ? "invalido" : ""}`} htmlFor="resp-check">
            <input
              id="resp-check"
              type="checkbox"
              checked={aceito}
              aria-invalid={campoErro === "aceito"}
              onChange={(e) => {
                setAceito(e.target.checked);
                limpar("aceito");
              }}
            />
            Sou o responsável pela criança e aceito os termos de uso
          </label>
        )}
        <p id="login-erro" className="erro" role="alert">
          {erro || aviso}
        </p>
        <div className="login-acoes">
          <button type="submit" className="btn" disabled={enviando}>
            {enviando ? "Aguarde…" : cadastro ? "Criar conta" : "Entrar"}
          </button>
          <button type="button" className="btn sec" onClick={visitante} disabled={enviando}>
            Entrar como visitante
          </button>
        </div>
      </form>
    </main>
  );
}
