import { useState } from "react";
import Nuvi from "../components/Nuvi";
import Titulo from "../components/Titulo";
import IconeMenu from "../components/IconeMenu";

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
  onSair,
  vozes,
  vozSel,
  onTrocarVoz,
  feitos,
  onSelecionarJogo,
}) {
  const [abrirPrefs, setAbrirPrefs] = useState(false);

  return (
    <main className="tela">
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

      <Titulo t="Cantinho das Cores" />
      <Nuvi fala="Oi! Vamos brincar? Escolha um jogo." ouvivel />

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
    </main>
  );
}
