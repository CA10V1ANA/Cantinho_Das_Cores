import { useState } from "react";
import { cpfOk, emailOk, maskCPF } from "../utils/validacao";
import Nuvi from "../components/Nuvi";
import Titulo from "../components/Titulo";

export default function Login({ onEntrar, onVisitante }) {
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [aceito, setAceito] = useState(false);
  const [erro, setErro] = useState("");
  const [campoErro, setCampoErro] = useState("");

  const entrar = (ev) => {
    ev.preventDefault();
    if (!emailOk(email)) {
      setCampoErro("email");
      return setErro("Digite um e-mail válido (ex.: nome@exemplo.com).");
    }
    if (!cpfOk(cpf)) {
      setCampoErro("cpf");
      return setErro("O CPF não parece correto. Confira os 11 números.");
    }
    if (!aceito) {
      setCampoErro("aceito");
      return setErro("Marque que você é o responsável pela criança.");
    }
    setErro("");
    setCampoErro("");
    onEntrar(email.trim());
  };

  return (
    <main className="tela login">
      <Titulo t="Cantinho das Cores" />
      <Nuvi fala="Oi! Um adulto pode entrar abaixo ou testar direto como visitante." />
      <form
        className="cartao"
        onSubmit={entrar}
        noValidate
        aria-describedby={erro ? "login-erro" : undefined}
      >
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
            if (campoErro === "email") setCampoErro("");
          }}
        />
        <label htmlFor="cp">CPF do responsável</label>
        <input
          id="cp"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          className={campoErro === "cpf" ? "invalido" : ""}
          aria-invalid={campoErro === "cpf"}
          value={cpf}
          onChange={(e) => {
            setCpf(maskCPF(e.target.value));
            if (campoErro === "cpf") setCampoErro("");
          }}
        />
        <label
          className={`check ${campoErro === "aceito" ? "invalido" : ""}`}
          htmlFor="resp-check"
        >
          <input
            id="resp-check"
            type="checkbox"
            checked={aceito}
            aria-invalid={campoErro === "aceito"}
            onChange={(e) => {
              setAceito(e.target.checked);
              if (campoErro === "aceito") setCampoErro("");
            }}
          />
          Sou o responsável pela criança
        </label>
        <p id="login-erro" className="erro" role="alert">
          {erro}
        </p>
        <div className="login-acoes">
          <button type="submit" className="btn">
            Entrar
          </button>
          <button
            type="button"
            className="btn sec"
            onClick={onVisitante}
          >
            Entrar como visitante
          </button>
        </div>
      </form>
    </main>
  );
}
