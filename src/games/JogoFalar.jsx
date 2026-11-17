import { useState, useEffect, useRef } from "react";
import { FALA } from "../data/jogosData";
import { pick } from "../utils/aleatorio";
import { falar } from "../utils/voz";
import { tocarAcerto } from "../utils/sons";
import Casca from "../components/Casca";

export default function JogoFalar(p) {
  const total = p.total ?? 5;
  const [lista] = useState(() => pick(FALA, total));
  const [e, setE] = useState(0);
  const [ativa, setAtiva] = useState(-1);
  const [tocando, setTocando] = useState(false);
  const [ouviu, setOuviu] = useState(false);
  const [bloq, setBloq] = useState(false);
  const timersRef = useRef([]);
  const w = lista[Math.min(e, total - 1)];

  const limparTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    return () => limparTimers();
  }, []);

  const ouvir = () => {
    limparTimers();
    setTocando(true);
    w.s.forEach((s, i) => {
      const id = setTimeout(() => {
        setAtiva(i);
        falar(s.toLowerCase());
      }, i * 900);
      timersRef.current.push(id);
    });
    const idFim = setTimeout(() => {
      setAtiva(-1);
      falar(w.w);
      setTocando(false);
      setOuviu(true);
    }, w.s.length * 900 + 200);
    timersRef.current.push(idFim);
  };

  const falei = () => {
    if (bloq) return;
    limparTimers();
    setAtiva(-1);
    setTocando(false);
    setBloq(true);
    tocarAcerto();
    falar(`Muito bem! Você falou ${w.w}`);
    const id = setTimeout(() => {
      setE((x) => x + 1);
      setOuviu(false);
      setBloq(false);
    }, 1600);
    timersRef.current.push(id);
  };

  return (
    <Casca
      {...p}
      titulo="Vamos falar"
      estrelas={e}
      fala={
        ouviu
          ? `Agora é você! Fale: ${w.w}`
          : "Toque em ouvir e escute com calma."
      }
    >
      <div className="fala-card">
        <div className="emo grande" aria-hidden="true">
          {w.e}
        </div>
        <div className="palavra">{w.w}</div>
        <div className="silabas">
          {w.s.map((s, i) => (
            <span key={i} className={i === ativa ? "ativa" : ""}>
              {s}
            </span>
          ))}
        </div>
        <p className="frase">“{w.f}”</p>
        <div className="acoes">
          <button
            type="button"
            className={`btn ${!ouviu && !tocando ? "guia-pulsar" : ""}`}
            onClick={ouvir}
            disabled={bloq}
          >
            {tocando ? "🔊 Ouvindo..." : "🔊 Ouvir"}
          </button>
          <button
            type="button"
            className="btn ok"
            onClick={falei}
            disabled={!ouviu || bloq}
          >
            🗣️ Eu falei!
          </button>
        </div>
        {!ouviu && (
          <p className="dica-fala">
            Escute primeiro para liberar o botão verde.
          </p>
        )}
      </div>
    </Casca>
  );
}
