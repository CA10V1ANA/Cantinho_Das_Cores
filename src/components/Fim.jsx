import { useEffect } from "react";
import { falar } from "../utils/voz";
import Nuvi from "./Nuvi";

export default function Fim({ total = 5, onNovo, onSair, onFim }) {
  useEffect(() => {
    falar("Parabéns! Você conseguiu!");
    onFim?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fim">
      <Nuvi fala="Parabéns! Você conseguiu!" ouvivel />
      <div className="fim-estrelas" aria-hidden="true">
        {"★".repeat(total)}
      </div>
      <div className="acoes">
        <button type="button" className="btn" onClick={onNovo}>
          Jogar de novo
        </button>
        <button type="button" className="btn sec" onClick={onSair}>
          Voltar ao menu
        </button>
      </div>
    </div>
  );
}
