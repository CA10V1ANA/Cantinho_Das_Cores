import { useState, useEffect, useRef } from "react";
import { CORES } from "../data/jogosData";
import { emb, pick, rnd } from "../utils/aleatorio";
import { falar } from "../utils/voz";
import Casca from "../components/Casca";
import Arrasta from "../components/Arrasta";

function gerarRodada() {
  const alvo = rnd(CORES);
  const outras = pick(
    CORES.filter((c) => c.n !== alvo.n),
    2
  );
  return { alvo, ops: emb([alvo, ...outras]) };
}

export default function JogoCores(p) {
  const [e, setE] = useState(0);
  const [r, setR] = useState(gerarRodada);
  const [ok, setOk] = useState(null);
  const [tente, setTente] = useState(null);
  const [sobre, setSobre] = useState(null);
  const timersRef = useRef([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (e < 5) {
      falar(`Onde está o ${r.alvo.n}?`);
    }
  }, [r, e]);

  const agendar = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const escolher = (c) => {
    if (ok || !c) return;
    if (c.n === r.alvo.n) {
      setOk(c.n);
      falar(`Muito bem! ${c.n}`);
      agendar(() => {
        const proximo = e + 1;
        setE(proximo);
        setOk(null);
        if (proximo < 5) setR(gerarRodada());
      }, 1500);
    } else {
      setTente(c.n);
      falar("Tente de novo");
      agendar(() => setTente(null), 700);
    }
  };

  return (
    <Casca
      {...p}
      titulo="Acerte a cor"
      estrelas={e}
      fala={`Arraste a bolinha até o ${r.alvo.n}.`}
    >
      <div className="cores">
        <div className="alvo">
          <span className="anel">
            <Arrasta
              cru
              label={`bolinha ${r.alvo.n}`}
              onToque={() => falar(r.alvo.n)}
              onSolta={(a) => escolher(r.ops.find((c) => c.n === a))}
              onSobre={setSobre}
            >
              <i className="bola" style={{ background: r.alvo.h }} />
            </Arrasta>
          </span>
        </div>
        <div className="opcoes">
          {r.ops.map((c) => (
            <button
              type="button"
              key={c.n}
              data-alvo={c.n}
              aria-label={c.n}
              className={`ficha ${ok === c.n ? "certo" : ""} ${
                tente === c.n ? "tente" : ""
              } ${sobre === c.n ? "sobre" : ""}`}
              onClick={() => escolher(c)}
            >
              <i className="bola" style={{ background: c.h }} />
            </button>
          ))}
        </div>
      </div>
    </Casca>
  );
}
