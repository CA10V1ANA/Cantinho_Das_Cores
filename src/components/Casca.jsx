import { useState, useEffect, useRef } from "react";
import { cancelarFala, falar } from "../utils/voz";
import { tocarVitoria } from "../utils/sons";
import Titulo from "./Titulo";
import Estrelas from "./Estrelas";
import Nuvi from "./Nuvi";
import Vitoria from "./Vitoria";
import Fim from "./Fim";

export default function Casca({
  titulo,
  estrelas,
  total = 5,
  idade = "8",
  calmo = false,
  fala,
  atrasoVitoria = 0,
  estatisticas,
  onSair,
  onNovo,
  onFim,
  onParcial,
  children,
}) {
  const fim = estrelas >= total;
  const [vitoria, setVitoria] = useState(false);
  const [final, setFinal] = useState(false);
  const inicioRef = useRef(null);
  const registradoRef = useRef(false);

  useEffect(() => {
    inicioRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!fim) return;
    let tFinal;
    const tInicio = setTimeout(() => {
      setVitoria(true);
      tocarVitoria();
      falar("Parabéns!");
      tFinal = setTimeout(() => {
        setVitoria(false);
        setFinal(true);
      }, 1800);
    }, atrasoVitoria);

    return () => {
      clearTimeout(tInicio);
      if (tFinal) clearTimeout(tFinal);
    };
  }, [fim, atrasoVitoria]);

  const montarResumo = (concluida) => {
    const duracaoSeg = inicioRef.current
      ? Math.max(1, Math.round((Date.now() - inicioRef.current) / 1000))
      : 1;
    return {
      ...estatisticas,
      acertos: estatisticas?.acertos ?? estrelas,
      erros: estatisticas?.erros ?? 0,
      estrelas: Math.min(estrelas, total),
      totalEstrelas: total,
      concluida,
      duracaoSeg,
    };
  };

  const finalizar = () => {
    if (registradoRef.current) return;
    registradoRef.current = true;
    onFim?.(montarResumo(true));
  };

  // Partida abandonada: registrada uma única vez, mesmo sem nenhuma resposta (0 acertos e 0 erros).
  const registrarAbandono = (aoFechar = false) => {
    if (registradoRef.current) return;
    registradoRef.current = true;
    // Se as 5 estrelas já foram conquistadas (animação de vitória), a partida conta como concluída.
    if (fim) onFim?.(montarResumo(true), { aoFechar });
    else onParcial?.(montarResumo(false), { aoFechar });
  };

  const abandonoRef = useRef(registrarAbandono);
  useEffect(() => {
    abandonoRef.current = registrarAbandono;
  });

  // Fechar a aba ou navegar para outra página também abandona a partida em andamento.
  useEffect(() => {
    const aoFechar = () => abandonoRef.current(true);
    window.addEventListener("pagehide", aoFechar);
    return () => window.removeEventListener("pagehide", aoFechar);
  }, []);

  const sair = () => {
    cancelarFala();
    registrarAbandono();
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
        <span className="nivel-badge" aria-label={`Nível ${idade} anos`}>
          {idade} anos
        </span>
        <Estrelas n={estrelas} total={total} />
      </header>
      {vitoria && <Vitoria calmo={calmo} />}
      {fim ? (
        final && (
          <Fim
            total={total}
            idade={idade}
            estatisticas={estatisticas}
            onNovo={onNovo}
            onSair={sair}
            onFim={finalizar}
          />
        )
      ) : (
        <>
          <Nuvi fala={fala} ouvivel />
          {children}
        </>
      )}
    </section>
  );
}
