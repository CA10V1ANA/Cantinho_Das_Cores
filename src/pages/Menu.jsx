import { useState } from "react";
import { FAIXAS_ETARIAS, obterFaixaEtaria } from "../data/jogosData";
import Nuvi from "../components/Nuvi";
import Titulo from "../components/Titulo";
import IconeMenu from "../components/IconeMenu";
import PainelPais from "./PainelPais";

export default function Menu({
  jogos,
  resp,
  som,
  onToggleSom,
  efeitos,
  onToggleEfeitos,
  velocidade,
  onToggleVelocidade,
  fonteMaior,
  onToggleFonteMaior,
  altoContraste,
  onToggleAltoContraste,
  calmo,
  onToggleCalmo,
  totalRodadas,
  onAlterarTotal,
  idade,
  onAlterarIdade,
  aba,
  onAlterarAba,
  depthFisica,
  onToggleDepthFisica,
  onAdicionarBloquinho,
  onChacoalharBloquinhos,
  onReiniciarBloquinhos,
  historico,
  onCarregarExemplo,
  onLimparHistorico,
  onSair,
  vozes,
  vozSel,
  onTrocarVoz,
  feitos,
  onSelecionarJogo,
}) {
  const [abrirPrefs, setAbrirPrefs] = useState(false);
  const faixaAtual = obterFaixaEtaria(idade);

  const classesTela = [
    "tela",
    aba === "pais" ? "tela-pais" : "tela-passante",
  ].join(" ");

  return (
    <main className={classesTela}>
      <div className="barra">
        <div className="barra-topo">
          <span className="resp" title={resp}>
            {resp === "visitante" ? "Visitante" : resp}
          </span>
          <button
            type="button"
            className="btn sec peq"
            onClick={onToggleSom}
            aria-pressed={som}
          >
            {som ? "🔊 Voz" : "🔇 Mudo"}
          </button>
          <button
            type="button"
            className={`btn sec peq ${abrirPrefs ? "ativo" : ""}`}
            onClick={() => setAbrirPrefs((v) => !v)}
            aria-expanded={abrirPrefs}
            aria-controls="painel-acessibilidade"
            aria-label="Acessibilidade e ajustes"
            title="Acessibilidade e ajustes"
          >
            ⚙️ Ajustes
          </button>
          <button type="button" className="btn sec peq" onClick={onSair}>
            Sair
          </button>
        </div>

        {abrirPrefs && (
          <div id="painel-acessibilidade" className="prefs-painel">
            <div className="prefs-chips">
              <button
                type="button"
                className={`chip ${fonteMaior ? "on" : ""}`}
                onClick={onToggleFonteMaior}
                aria-pressed={fonteMaior}
              >
                Aa Fonte A+
              </button>
              <button
                type="button"
                className={`chip ${altoContraste ? "on" : ""}`}
                onClick={onToggleAltoContraste}
                aria-pressed={altoContraste}
              >
                ◐ Alto contraste
              </button>
              <button
                type="button"
                className={`chip ${calmo ? "on" : ""}`}
                onClick={onToggleCalmo}
                aria-pressed={calmo}
              >
                ☁️ Modo calmo
              </button>
              <button
                type="button"
                className={`chip ${efeitos ? "on" : ""}`}
                onClick={onToggleEfeitos}
                aria-pressed={efeitos}
              >
                {efeitos ? "🔔 Efeitos ON" : "🔕 Efeitos OFF"}
              </button>
              <button
                type="button"
                className={`chip ${velocidade === "calma" ? "on" : ""}`}
                onClick={onToggleVelocidade}
                aria-pressed={velocidade === "calma"}
              >
                {velocidade === "calma" ? "🐢 Fala calma" : "🐇 Fala normal"}
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => onAlterarTotal(totalRodadas === 5 ? 3 : 5)}
              >
                ★ {totalRodadas} rodadas
              </button>
            </div>
            {vozes.length > 1 && (
              <label className="voz" htmlFor="sel-voz">
                Voz
                <select
                  id="sel-voz"
                  value={vozSel}
                  onChange={(e) => onTrocarVoz(e.target.value)}
                >
                  {vozes.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      <nav className="tabs-menu" aria-label="Navegação principal">
        <button
          type="button"
          className={`tab-btn ${aba === "jogos" ? "ativa" : ""}`}
          onClick={() => onAlterarAba("jogos")}
          aria-pressed={aba === "jogos"}
        >
          🎮 Jogos
        </button>
        <button
          type="button"
          className={`tab-btn ${aba === "bloquinhos" ? "ativa" : ""}`}
          onClick={() => onAlterarAba("bloquinhos")}
          aria-pressed={aba === "bloquinhos"}
        >
          🧩 Bloquinhos
        </button>
        <button
          type="button"
          className={`tab-btn ${aba === "pais" ? "ativa" : ""}`}
          onClick={() => onAlterarAba("pais")}
          aria-pressed={aba === "pais"}
        >
          📊 Pais e Professores
        </button>
      </nav>

      {aba === "jogos" && (
        <>
          <Titulo t="Cantinho das Cores" />
          <Nuvi fala="Oi! Escolha sua idade e um jogo para brincar." ouvivel />

          <section className="niveis-bar" aria-label="Nível por idade">
            <div className="niveis-topo">
              <span className="niveis-rotulo">Idade / Dificuldade:</span>
              <span className="niveis-desc">{faixaAtual.descricao}</span>
            </div>
            <div className="niveis-opcoes">
              {FAIXAS_ETARIAS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`nivel-chip ${String(idade) === f.id ? "ativo" : ""}`}
                  onClick={() => onAlterarIdade(f.id)}
                  aria-pressed={String(idade) === f.id}
                >
                  <strong>{f.idade}</strong>
                  <span>{f.nivel}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="menu">
            {jogos.map((j) => (
              <button
                type="button"
                key={j.id}
                className="item"
                style={{ background: j.bg }}
                onClick={() => onSelecionarJogo(j.id)}
              >
                <span className="ico">
                  <IconeMenu id={j.id} />
                </span>
                <span className="nome">{j.nome}</span>
                {j.sub && <span className="sub-jogo">{j.sub}</span>}
                {feitos[j.id] > 0 && (
                  <span
                    className="feitos"
                    aria-label={`${feitos[j.id]} partidas concluídas`}
                  >
                    ★ {feitos[j.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {aba === "bloquinhos" && (
        <div className="bloquinhos-controles">
          <p className="bloquinhos-aviso">
            Brinque com os bloquinhos nas cores do autismo: arraste, jogue ou toque no espaço vazio!
          </p>
          <div className="bloquinhos-acoes">
            <button
              type="button"
              className="btn peq"
              onClick={onAdicionarBloquinho}
              disabled={calmo}
            >
              + Bloquinho
            </button>
            <button
              type="button"
              className="btn sec peq"
              onClick={onChacoalharBloquinhos}
              disabled={calmo}
            >
              🌀 Chacoalhar
            </button>
            <button
              type="button"
              className={`btn sec peq ${depthFisica === "2d" ? "ativo" : ""}`}
              onClick={onToggleDepthFisica}
            >
              {depthFisica === "3d" ? "📦 Modo 3D" : "⬛ Modo 2D"}
            </button>
            <button
              type="button"
              className="btn sec peq"
              onClick={onReiniciarBloquinhos}
            >
              🔄 Reiniciar
            </button>
          </div>
        </div>
      )}

      {aba === "pais" && (
        <PainelPais
          historico={historico}
          onCarregarExemplo={onCarregarExemplo}
          onLimparHistorico={onLimparHistorico}
        />
      )}
    </main>
  );
}
