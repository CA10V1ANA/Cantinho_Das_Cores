import { useState, useEffect, useRef } from "react";
import { CORES, FORMAS } from "../data/jogosData";
import { emb, rnd } from "../utils/aleatorio";
import { falar } from "../utils/voz";
import Casca from "../components/Casca";
import Forma from "../components/Forma";

function gerarRodada() {
  const f = rnd(FORMAS);
  const c = rnd(CORES);
  const f2 = rnd(FORMAS.filter((x) => x.n !== f.n));
  const c2 = rnd(CORES.filter((x) => x.n !== c.n));
  const f3 = rnd(FORMAS.filter((x) => x.n !== f.n && x.n !== f2.n));
  const c3 = rnd(CORES.filter((x) => x.n !== c.n && x.n !== c2.n));
  return {
    f,
    c,
    ops: emb([
      { f, c },
      { f, c: c2 },
      { f: f2, c },
      { f: f3, c: c3 },
    ]),
  };
}

export default function JogoCorForma(p) {
  const [e, setE] = useState(0);
  const [r, setR] = useState(gerarRodada);
  const [ok, setOk] = useState(null);
  const [tente, setTente] = useState(null);
  const timersRef = useRef([]);

  const frase = `Toque ${r.f.art === "o" ? "no" : "na"} ${r.f.n} ${
    r.f.art === "o" ? r.c.n : r.c.f
  }`;

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (e < 5) {
      falar(frase);
    }
  }, [frase, e]);

  const agendar = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const escolher = (o) => {
    const k = `${o.f.n}-${o.c.n}`;
    if (ok) return;
    if (o.f.n === r.f.n && o.c.n === r.c.n) {
      setOk(k);
      falar("Muito bem!");
      agendar(() => {
        const proximo = e + 1;
        setE(proximo);
        setOk(null);
        if (proximo < 5) setR(gerarRodada());
      }, 1400);
    } else {
      setTente(k);
      falar("Tente de novo");
      agendar(() => setTente(null), 700);
    }
  };

  return (
    <Casca {...p} titulo="Cor e forma" estrelas={e} fala={frase}>
      <div className="grade2">
        {r.ops.map((o) => {
          const k = `${o.f.n}-${o.c.n}`;
          const nomeCor = o.f.art === "o" ? o.c.n : o.c.f;
          return (
            <button
              type="button"
              key={k}
              aria-label={`${o.f.n} ${nomeCor}`}
              className={`ficha ${ok === k ? "certo" : ""} ${
                tente === k ? "tente" : ""
              }`}
              onClick={() => escolher(o)}
            >
              <Forma f={o.f} cor={o.c.h} tam={96} />
            </button>
          );
        })}
      </div>
    </Casca>
  );
}
