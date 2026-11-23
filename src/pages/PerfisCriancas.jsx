import { useState } from "react";
import { FAIXAS_ETARIAS } from "../data/jogosData";

const VAZIO = { id: null, nome: "", idade: "8" };

export default function PerfisCriancas({
  visitante,
  criancas,
  carregando,
  erroLista,
  ativaId,
  onSelecionar,
  onSalvar,
  onExcluir,
  onRecarregar,
}) {
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [confirmarId, setConfirmarId] = useState(null);

  if (visitante) {
    return (
      <section className="pais-painel" aria-label="Perfis das crianças">
        <h2 className="pais-titulo">Perfis das crianças</h2>
        <p className="aviso-api">
          O visitante pode jogar, mas as partidas não ficam salvas. Entre com uma conta de responsável para cadastrar
          perfis e acompanhar o desempenho.
        </p>
      </section>
    );
  }

  const editando = form.id !== null;

  const salvar = async (ev) => {
    ev.preventDefault();
    if (ocupado) return;
    setMsg("");
    if (form.nome.trim().length < 2) return setErro("Digite o nome ou apelido (mínimo 2 letras).");
    setErro("");
    setOcupado(true);
    try {
      await onSalvar(form);
      setMsg(editando ? "Perfil atualizado." : "Perfil criado.");
      setForm(VAZIO);
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  };

  const excluir = async (id) => {
    if (ocupado) return;
    if (confirmarId !== id) {
      setConfirmarId(id);
      return;
    }
    setOcupado(true);
    setErro("");
    setMsg("");
    try {
      await onExcluir(id);
      setMsg("Perfil excluído, junto com as partidas e relatórios dele.");
    } catch (e) {
      setErro(e.message);
    } finally {
      setConfirmarId(null);
      setOcupado(false);
    }
  };

  return (
    <section className="pais-painel" aria-label="Perfis das crianças">
      <h2 className="pais-titulo">Perfis das crianças</h2>
      <p className="pais-subtitulo">
        Escolha quem vai brincar. As partidas e os relatórios ficam ligados ao perfil escolhido.
      </p>

      {carregando && <p role="status">Carregando perfis…</p>}
      {erroLista && (
        <p className="aviso-api" role="alert">
          {erroLista}{" "}
          <button type="button" className="btn sec peq" onClick={onRecarregar}>
            Tentar de novo
          </button>
        </p>
      )}
      {!carregando && !erroLista && criancas.length === 0 && (
        <p className="aviso-api">Nenhum perfil ainda. Cadastre a primeira criança abaixo.</p>
      )}

      <ul className="perfis-lista">
        {criancas.map((c) => (
          <li key={c.id} className={`perfil-item ${String(ativaId) === String(c.id) ? "ativo" : ""}`}>
            <span className="perfil-nome">
              <strong>{c.name}</strong> · {c.age} anos
            </span>
            <button
              type="button"
              className={`btn peq ${String(ativaId) === String(c.id) ? "" : "sec"}`}
              aria-pressed={String(ativaId) === String(c.id)}
              onClick={() => onSelecionar(c.id)}
            >
              {String(ativaId) === String(c.id) ? "Jogando" : "Escolher"}
            </button>
            <button
              type="button"
              className="btn sec peq"
              onClick={() => {
                setForm({ id: c.id, nome: c.name, idade: String(c.age) });
                setErro("");
                setMsg("");
              }}
            >
              Editar
            </button>
            <button type="button" className={`btn sec peq ${confirmarId === c.id ? "perigo" : ""}`} disabled={ocupado} onClick={() => excluir(c.id)}>
              {confirmarId === c.id ? "Confirmar exclusão?" : "Excluir"}
            </button>
          </li>
        ))}
      </ul>

      <form className="perfil-form" onSubmit={salvar} noValidate>
        <h3>{editando ? "Editar perfil" : "Novo perfil"}</h3>
        <label htmlFor="pf-nome">Nome ou apelido</label>
        <input
          id="pf-nome"
          maxLength={80}
          value={form.nome}
          aria-invalid={Boolean(erro)}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
        <label htmlFor="pf-idade">Idade</label>
        <select id="pf-idade" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })}>
          {FAIXAS_ETARIAS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.titulo}
            </option>
          ))}
        </select>
        <p className="erro" role="alert">
          {erro}
        </p>
        {msg && (
          <p className="aviso-api ok" role="status">
            {msg}
          </p>
        )}
        <div className="login-acoes">
          <button type="submit" className="btn" disabled={ocupado}>
            {ocupado ? "Salvando…" : editando ? "Salvar alterações" : "Cadastrar criança"}
          </button>
          {editando && (
            <button type="button" className="btn sec" onClick={() => setForm(VAZIO)}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
