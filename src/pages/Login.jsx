import { useState } from "react";
import { cpfOk, gmailOk, maskCPF } from "../utils/validacao";
import Nuvi from "../components/Nuvi";
import Titulo from "../components/Titulo";

export default function Login({ onEntrar }) {
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [aceito, setAceito] = useState(false);
  const [erro, setErro] = useState("");

  const entrar = (ev) => {
    ev.preventDefault();
    if (!gmailOk(email)) {
      return setErro("Digite um e-mail que termine com @gmail.com.");
    }
    if (!cpfOk(cpf)) {
      return setErro("O CPF não parece correto. Confira os 11 números.");
    }
    if (!aceito) {
      return setErro("Marque que você é o responsável pela criança.");
    }
    setErro("");
    onEntrar(email.trim());
  };

  return (
    <main className="tela login">
      <Nuvi fala="Oi! Primeiro, um adulto responsável entra aqui." />
      <Titulo t="Cantinho das Cores" />
      <form
        className="cartao"
        onSubmit={entrar}
        noValidate
        aria-describedby={erro ? "login-erro" : undefined}
      >
        <label htmlFor="gm">Gmail do responsável</label>
        <input
          id="gm"
          type="email"
          autoComplete="email"
          placeholder="nome@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="cp">CPF do responsável</label>
        <input
          id="cp"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(maskCPF(e.target.value))}
        />
        <label className="check" htmlFor="resp-check">
          <input
            id="resp-check"
            type="checkbox"
            checked={aceito}
            onChange={(e) => setAceito(e.target.checked)}
          />
          Sou o responsável pela criança
        </label>
        <p id="login-erro" className="erro" role="alert">
          {erro}
        </p>
        <button type="submit" className="btn">
          Entrar
        </button>
      </form>
    </main>
  );
}
