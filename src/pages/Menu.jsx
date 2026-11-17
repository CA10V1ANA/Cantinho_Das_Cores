import Nuvi from "../components/Nuvi";
import Titulo from "../components/Titulo";

export default function Menu({
  jogos,
  resp,
  som,
  onToggleSom,
  onSair,
  vozes,
  vozSel,
  onTrocarVoz,
  feitos,
  onSelecionarJogo,
}) {
  return (
    <main className="tela">
      <div className="barra">
        <span className="resp" title={resp}>
          {resp}
        </span>
        <button
          type="button"
          className="btn sec peq"
          onClick={onToggleSom}
          aria-pressed={som}
        >
          {som ? "🔊 Voz ligada" : "🔇 Voz desligada"}
        </button>
        <button type="button" className="btn sec peq" onClick={onSair}>
          Sair
        </button>
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
            <span className="ico" aria-hidden="true">
              {j.ico}
            </span>
            <span className="nome">{j.nome}</span>
            {feitos[j.id] > 0 && (
              <span
                className="feitos"
                aria-label={`${feitos[j.id]} estrelas conquistadas`}
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
