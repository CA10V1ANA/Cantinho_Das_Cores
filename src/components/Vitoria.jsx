import { useState } from "react";
import { PAL } from "../data/jogosData";
import Titulo from "./Titulo";

export default function Vitoria({ calmo = false }) {
  const [conf] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      l: Math.random() * 100,
      c: PAL[i % PAL.length],
      d: Math.random() * 0.55,
      t: 1.2 + Math.random() * 0.8,
    }))
  );

  return (
    <div className="vitoria" role="status">
      {!calmo &&
        conf.map((c, i) => (
          <i
            key={i}
            className="confete"
            style={{
              left: `${c.l}%`,
              background: c.c,
              animationDelay: `${c.d}s`,
              animationDuration: `${c.t}s`,
            }}
          />
        ))}
      <div className="selo">
        <div className="selo-estrela" aria-hidden="true">
          ⭐
        </div>
        <Titulo t="Parabéns!" tag="p" />
      </div>
    </div>
  );
}
