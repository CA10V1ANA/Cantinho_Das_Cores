import { useState, useEffect, useRef } from "react";
import { CORES, FORMAS } from "../data/jogosData";
import { emb, pick } from "../utils/aleatorio";
import { falar } from "../utils/voz";
import { tocarAcerto, tocarErro, tocarSelecao } from "../utils/sons";
import Casca from "../components/Casca";
import Arrasta from "../components/Arrasta";
import Forma from "../components/Forma";

export default function JogoEncaixe(p) {
  const total = p.total ?? 5;
  const [it] = useState(() => {
    const cols = pick(CORES, total);
    const l = pick(FORMAS, total).map((f, i) => ({ f, cor: cols[i].h }));
    return { pecas: emb(l), buracos: emb(l) };
  });
  const [sel, setSel] = useState(null);
  const [feito, setFeito] = useState([]);
  const [tente, setTente] = useState(null);
  const [sobre, setSobre] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    falar("Arraste cada peça até o buraco com o mesmo formato.");
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const encaixar = (peca, alvo) => {
    if (!peca || !alvo || feito.includes(alvo)) return;
    if (peca === alvo) {
      setFeito((d) => [...d, alvo]);
      setSel(null);
      tocarAcerto();
      falar(`Encaixou! ${alvo}`);
    } else {
      setTente(alvo);
      tocarErro();
      falar("Tente de novo");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setTente(null), 700);
    }
  };

  return (
    <Casca
      {...p}
      titulo="Encaixe as formas"
      estrelas={feito.length}
      atrasoVitoria={900}
      fala={
        sel
          ? `Agora toque no buraco de ${sel} ou arraste!`
          : "Arraste cada peça até o buraco com o mesmo formato."
      }
    >
      <div className="linha encaixe-pecas">
        {it.pecas.map(({ f, cor }) => (
          <Arrasta
            key={f.n}
            label={`peça ${f.n}`}
            disabled={feito.includes(f.n)}
            onSobre={setSobre}
            className={`${sel === f.n ? "sel" : ""} ${
              feito.includes(f.n) ? "feito" : ""
            }`}
            onToque={() => {
              setSel(f.n);
              tocarSelecao();
              falar(f.n);
            }}
            onSolta={(a) => encaixar(f.n, a)}
          >
            <Forma f={f} cor={cor} />
          </Arrasta>
        ))}
      </div>
      <div className={`linha chao ${sel ? "alvos-ativos" : ""}`}>
        {it.buracos.map((b) => {
          const encaixado = feito.includes(b.f.n);
          return (
            <button
              type="button"
              key={b.f.n}
              data-alvo={b.f.n}
              disabled={encaixado}
              aria-label={`buraco ${b.f.n}`}
              className={`ficha buraco ${encaixado ? "certo" : ""} ${
                tente === b.f.n ? "tente" : ""
              } ${sobre === b.f.n ? "sobre" : ""}`}
              onClick={() => encaixar(sel, b.f.n)}
            >
              <Forma f={b.f} cor={b.cor} oco={!encaixado} />
            </button>
          );
        })}
      </div>
    </Casca>
  );
}
