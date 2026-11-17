import { useState, useEffect } from "react";
import { cancelarFala, falar } from "../utils/voz";
import Titulo from "./Titulo";
import Estrelas from "./Estrelas";
import Nuvi from "./Nuvi";
import Vitoria from "./Vitoria";
import Fim from "./Fim";

export default function Casca({
  titulo,
  estrelas,
  fala,
  atrasoVitoria = 0,
  onSair,
  onNovo,
  onFim,
  children,
}) {
  const fim = estrelas >= 5;
  const [vitoria, setVitoria] = useState(false);
  const [final, setFinal] = useState(false);

  useEffect(() => {
    if (!fim) return;
    let tFinal;
    const tInicio = setTimeout(() => {
      setVitoria(true);
      falar("Parabéns!");
      tFinal = setTimeout(() => {
        setVitoria(false);
        setFinal(true);
      }, 2600);
    }, atrasoVitoria);

    return () => {
      clearTimeout(tInicio);
      if (tFinal) clearTimeout(tFinal);
    };
  }, [fim, atrasoVitoria]);

  const sair = () => {
    cancelarFala();
    onSair();
  };

  return (
    <section className="jogo">
      <header className="topo">
        <button
          type="button"
          className="redondo"
          onClick={sair}
          aria-label="Voltar ao menu"
        >
          🏠
        </button>
        <Titulo t={titulo} tag="h1" className="titulo-jogo" />
        <Estrelas n={estrelas} />
      </header>
      {vitoria && <Vitoria />}
      {fim ? (
        final && <Fim onNovo={onNovo} onSair={sair} onFim={onFim} />
      ) : (
        <>
          <Nuvi fala={fala} ouvivel />
          {children}
        </>
      )}
    </section>
  );
}
