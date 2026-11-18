import { useEffect } from "react";
import { falar } from "../utils/voz";
import Nuvi from "./Nuvi";

export default function Fim({ total = 5, estatisticas, idade, onNovo, onSair, onFim }) {
  useEffect(() => {
    falar("Parabéns! Você conseguiu!");
    onFim?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acertos = estatisticas?.acertos ?? total;
  const erros = estatisticas?.erros ?? 0;
  const tentativas = acertos + erros;
  const taxa = tentativas > 0 ? Math.round((acertos / tentativas) * 100) : 100;

  return (
    <div className="fim">
      <Nuvi fala="Parabéns! Você conseguiu!" ouvivel />
      <div className="fim-estrelas" aria-hidden="true">
        {"★".repeat(total)}
      </div>
      <div className="fim-resumo">
        {idade && <span className="fim-tag">{idade} anos</span>}
        <span className="fim-tag ok">{acertos} acertos</span>
        <span className="fim-tag">{taxa}% de precisão</span>
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
