import { useState, useEffect, useRef } from "react";
import { FALA } from "../data/jogosData";
import { pick } from "../utils/aleatorio";
import { falar } from "../utils/voz";
import Casca from "../components/Casca";

export default function JogoFalar(p) {
  const [lista] = useState(() => pick(FALA, 5));
  const [e, setE] = useState(0);
  const [ativa, setAtiva] = useState(-1);
  const [ouviu, setOuviu] = useState(false);
  const [bloq, setBloq] = useState(false);
  const timersRef = useRef([]);
  const w = lista[Math.min(e, 4)];

  const limparTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    return () => limparTimers();
  }, []);

  const ouvir = () => {
    limparTimers();
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
      setOuviu(true);
    }, w.s.length * 900 + 200);
    timersRef.current.push(idFim);
  };

  const falei = () => {
    if (bloq) return;
    limparTimers();
    setAtiva(-1);
    setBloq(true);
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
          <button type="button" className="btn" onClick={ouvir} disabled={bloq}>
            🔊 Ouvir
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
      </div>
    </Casca>
  );
}
