import { useState, useEffect, useRef } from "react";
import { PALAVRAS, PASTEIS } from "../data/jogosData";
import { emb, pick } from "../utils/aleatorio";
import { falar } from "../utils/voz";
import Casca from "../components/Casca";
import Arrasta from "../components/Arrasta";

export default function JogoLigar(p) {
  const [it] = useState(() => {
    const l = pick(PALAVRAS, 5).map((x, i) => ({ ...x, bg: PASTEIS[i] }));
    return { esq: emb(l), dir: emb(l) };
  });
  const [sel, setSel] = useState(null);
  const [feito, setFeito] = useState([]);
  const [tente, setTente] = useState(null);
  const [sobre, setSobre] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    falar("Arraste o desenho até o nome dele.");
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const ligar = (desenho, palavra) => {
    if (!desenho || !palavra || feito.includes(palavra)) return;
    if (desenho === palavra) {
      setFeito((d) => [...d, palavra]);
      falar(`Isso! ${palavra}`);
    } else {
      setTente(palavra);
      falar("Tente de novo");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setTente(null), 700);
    }
    setSel(null);
  };

  return (
    <Casca
      {...p}
      titulo="Ligue ao nome"
      estrelas={feito.length}
      atrasoVitoria={1100}
      fala="Arraste o desenho até o nome dele."
    >
      <div className="ligar">
        <div className="col">
          {it.esq.map((x) => {
            const pareado = feito.includes(x.id);
            return (
              <Arrasta
                key={x.id}
                label={`desenho ${x.id}`}
                disabled={pareado}
                onSobre={setSobre}
                className={`${sel === x.id ? "sel" : ""} ${pareado ? "par" : ""}`}
                style={pareado ? { background: x.bg } : undefined}
                onToque={() => {
                  setSel(x.id);
                  falar(x.id);
                }}
                onSolta={(a) => ligar(x.id, a)}
              >
                <span className="emo">{x.e}</span>
              </Arrasta>
            );
          })}
        </div>
        <div className="col">
          {it.dir.map((x) => {
            const pareado = feito.includes(x.id);
            return (
              <button
                type="button"
                key={x.id}
                data-alvo={x.id}
                disabled={pareado}
                className={`ficha ${sobre === x.id ? "sobre" : ""} ${
                  tente === x.id ? "tente" : ""
                } ${pareado ? "par" : ""}`}
                style={pareado ? { background: x.bg } : undefined}
                onClick={() => ligar(sel, x.id)}
              >
                <span className="pal">{x.id}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Casca>
  );
}
