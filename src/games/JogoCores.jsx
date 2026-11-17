import { useState, useEffect, useRef } from "react";
import { CORES } from "../data/jogosData";
import { emb, pick, rnd } from "../utils/aleatorio";
import { falar } from "../utils/voz";
import { tocarAcerto, tocarErro } from "../utils/sons";
import Casca from "../components/Casca";
import Arrasta from "../components/Arrasta";

function gerarRodada() {
  const alvo = rnd(CORES);
  const distintas = CORES.filter(
    (c) => c.n !== alvo.n && !alvo.evitar?.includes(c.n)
  );
  const pool =
    distintas.length >= 2 ? distintas : CORES.filter((c) => c.n !== alvo.n);
  const outras = pick(pool, 2);
  return { alvo, ops: emb([alvo, ...outras]) };
}

export default function JogoCores(p) {
  const total = p.total ?? 5;
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
    if (e < total) {
      falar(`Onde está o ${r.alvo.n}?`);
    }
  }, [r, e, total]);

  const agendar = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const escolher = (c) => {
    if (ok || !c) return;
    if (c.n === r.alvo.n) {
      setOk(c.n);
      tocarAcerto();
      falar(`Muito bem! ${c.n}`);
      agendar(() => {
        const proximo = e + 1;
        setE(proximo);
        setOk(null);
        if (proximo < total) setR(gerarRodada());
      }, 1500);
    } else {
      setTente(c.n);
      tocarErro();
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
          {r.ops.map((c) => {
            const acertou = ok === c.n;
            return (
              <button
                type="button"
                key={c.n}
                data-alvo={c.n}
                aria-label={c.n}
                className={`ficha ${acertou ? "certo" : ""} ${
                  tente === c.n ? "tente" : ""
                } ${sobre === c.n ? "sobre" : ""}`}
                onClick={() => escolher(c)}
              >
                <i className="bola" style={{ background: c.h }}>
                  {acertou && (
                    <span className="bola-ok" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </i>
              </button>
            );
          })}
        </div>
      </div>
    </Casca>
  );
}
