import { useCallback, useEffect, useState } from "react";
import { evolucao, historico, porJogo, resumo } from "../services/dashboard";
import Relatorios from "./Relatorios";

function formatarDataCurta(iso) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
}

function formatarTempo(seg) {
  if (seg === null || seg === undefined) return "—";
  const total = Math.round(seg);
  const m = Math.floor(total / 60);
  return m ? `${m} min ${String(total % 60).padStart(2, "0")} s` : `${total} s`;
}

const pontos = (v) => (v === null || v === undefined ? "—" : `${Math.round(v)}`);

const PERIODOS = [
  { id: "", rotulo: "Todo o período" },
  { id: "7", rotulo: "7 dias" },
  { id: "30", rotulo: "30 dias" },
];

function GraficoEvolucao({ serie }) {
  if (!serie.length) return null;

  const largura = 580;
  const altura = 200;
  const padEsq = 44;
  const padDir = 22;
  const padTopo = 28;
  const padBase = 34;
  const utilW = largura - padEsq - padDir;
  const utilH = altura - padTopo - padBase;

  const pontos = serie.map((item, idx) => {
    const x =
      serie.length === 1
        ? padEsq + utilW / 2
        : padEsq + (idx / (serie.length - 1)) * utilW;
    const y = padTopo + ((100 - item.taxa) / 100) * utilH;
    return { ...item, x, y };
  });

  const linha = pontos.map((pt) => `${pt.x},${pt.y}`).join(" ");
  const area =
    pontos.length > 1
      ? `${pontos[0].x},${padTopo + utilH} ${linha} ${pontos[pontos.length - 1].x},${
          padTopo + utilH
        }`
      : "";

  return (
    <div className="pais-grafico-wrap">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="pais-grafico"
        role="img"
        aria-label="Gráfico de evolução da pontuação média por dia"
      >
        {[0, 50, 100].map((v) => {
          const y = padTopo + ((100 - v) / 100) * utilH;
          return (
            <g key={v}>
              <line
                x1={padEsq}
                y1={y}
                x2={largura - padDir}
                y2={y}
                stroke="rgba(43, 58, 103, 0.14)"
                strokeDasharray="4 4"
              />
              <text
                x={padEsq - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fontWeight="700"
                fill="#4E6396"
              >
                {v}%
              </text>
            </g>
          );
        })}

        {area && <polygon points={area} fill="rgba(45, 127, 249, 0.14)" />}

        {pontos.length > 1 && (
          <polyline
            points={linha}
            fill="none"
            stroke="#2D7FF9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {pontos.map((pt) => (
          <g key={pt.id}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="6.5"
              fill={pt.taxa >= 80 ? "#24A159" : pt.taxa >= 60 ? "#2D7FF9" : "#FF9A2E"}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <title>
              {`${pt.rotulo}: pontuação média ${pt.taxa}% (${pt.partidas} partida(s) no dia)`}
            </title>
            <text
              x={pt.x}
              y={pt.y - 10}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#2B3A67"
            >
              {pt.taxa}%
            </text>
            <text
              x={pt.x}
              y={altura - 10}
              textAnchor="middle"
              fontSize="11"
              fill="#4E6396"
            >
              {pt.rotulo}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function PainelPais({ visitante, criancas, criancaId, onSelecionarCrianca, onIrPerfis }) {
  const [dias, setDias] = useState("");
  const [jogoFiltro, setJogoFiltro] = useState("");
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mais, setMais] = useState({ carregando: false, erro: "" });

  const crianca = criancas.find((c) => String(c.id) === String(criancaId)) || null;
  const idCrianca = crianca?.id;

  const carregar = useCallback(async () => {
    if (!idCrianca) return;
    setCarregando(true);
    setErro("");
    try {
      const d = dias || undefined;
      const [res, jogos, evo, hist] = await Promise.all([
        resumo(idCrianca, d),
        porJogo(idCrianca, d),
        evolucao(idCrianca, d, jogoFiltro || undefined),
        historico(idCrianca, jogoFiltro || undefined, 15, 0),
      ]);
      setDados({ res, jogos, evo, hist });
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [idCrianca, dias, jogoFiltro]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- busca de dados ao montar/trocar filtro; o loading faz parte do fluxo
    setDados(null);
    carregar();
  }, [carregar]);

  const verMais = async () => {
    if (mais.carregando || !dados) return;
    setMais({ carregando: true, erro: "" });
    try {
      const pagina = await historico(idCrianca, jogoFiltro || undefined, 15, dados.hist.items.length);
      setDados((d) => ({ ...d, hist: { ...pagina, items: [...d.hist.items, ...pagina.items] } }));
      setMais({ carregando: false, erro: "" });
    } catch (e) {
      setMais({ carregando: false, erro: e.message });
    }
  };

  if (visitante) {
    return (
      <section className="pais-painel" aria-label="Painel de acompanhamento para pais e professores">
        <h2 className="pais-titulo">Acompanhamento de Desempenho</h2>
        <p className="aviso-api">Entre com uma conta de responsável para acompanhar o desempenho das crianças.</p>
      </section>
    );
  }

  if (!crianca) {
    return (
      <section className="pais-painel" aria-label="Painel de acompanhamento para pais e professores">
        <h2 className="pais-titulo">Acompanhamento de Desempenho</h2>
        <p className="aviso-api">
          Cadastre um perfil de criança para acompanhar o desempenho.{" "}
          <button type="button" className="btn sec peq" onClick={onIrPerfis}>
            Abrir perfis
          </button>
        </p>
      </section>
    );
  }

  const res = dados?.res;
  const serie = (dados?.evo || [])
    .filter((p) => p.average_score !== null)
    .slice(-14)
    .map((p, i) => ({
      id: p.date,
      indice: i + 1,
      taxa: Math.round(p.average_score),
      rotulo: formatarDataCurta(`${p.date}T00:00:00`),
      partidas: p.completed_matches,
    }));

  return (
    <section className="pais-painel" aria-label="Painel de acompanhamento para pais e professores">
      <div className="pais-cabecalho">
        <div>
          <h2 className="pais-titulo">Acompanhamento de Desempenho</h2>
          <p className="pais-subtitulo">
            Pontuação, tempo e acertos consideram só as partidas concluídas. Partidas abandonadas aparecem nas contagens e
            no histórico.
          </p>
        </div>
      </div>

      <div className="pais-filtros">
        {criancas.length > 1 && (
          <label className="pais-filtro-campo" htmlFor="filtro-crianca">
            <span>Criança</span>
            <select id="filtro-crianca" value={criancaId} onChange={(e) => onSelecionarCrianca(e.target.value)}>
              {criancas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.age} anos)
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="pais-filtro-campo" htmlFor="filtro-jogo">
          <span>Jogo (evolução e histórico)</span>
          <select id="filtro-jogo" value={jogoFiltro} onChange={(e) => setJogoFiltro(e.target.value)}>
            <option value="">Todos os jogos</option>
            {(dados?.jogos || []).map((j) => (
              <option key={j.game_id} value={j.game_id}>
                {j.name}
              </option>
            ))}
          </select>
        </label>
        <div className="pais-filtro-idades" role="group" aria-label="Período">
          {PERIODOS.map((p) => (
            <button key={p.id} type="button" className={`chip ${dias === p.id ? "on" : ""}`} aria-pressed={dias === p.id} onClick={() => setDias(p.id)}>
              {p.rotulo}
            </button>
          ))}
        </div>
      </div>

      {carregando && !dados && <p role="status">Carregando indicadores…</p>}
      {erro && (
        <p className="aviso-api" role="alert">
          {erro}{" "}
          <button type="button" className="btn sec peq" onClick={carregar}>
            Tentar de novo
          </button>
        </p>
      )}

      {res && res.total_matches === 0 && (
        <p className="aviso-api">
          {crianca.name} ainda não tem partidas {dias ? "neste período" : "registradas"}. Os indicadores aparecem depois que ela jogar.
        </p>
      )}

      {res && res.total_matches > 0 && (
        <>
          <div className="pais-kpis">
            <article className="pais-kpi">
              <span className="kpi-rotulo">Partidas</span>
              <strong className="kpi-valor">{res.total_matches}</strong>
              <span className="kpi-detalhe">
                {res.completed_matches} concluídas · {res.abandoned_matches} abandonadas
              </span>
            </article>
            <article className="pais-kpi">
              <span className="kpi-rotulo">Taxa de conclusão</span>
              <strong className="kpi-valor">{res.completion_rate}%</strong>
              <span className="kpi-detalhe">das partidas iniciadas</span>
            </article>
            <article className="pais-kpi">
              <span className="kpi-rotulo">Pontuação média</span>
              <strong className="kpi-valor">{res.average_score === null ? "—" : `${pontos(res.average_score)}%`}</strong>
              <span className="kpi-detalhe">
                {res.average_score === null ? "Nenhuma partida concluída" : `${res.total_correct} acertos · ${res.total_errors} ${res.total_errors === 1 ? "erro" : "erros"}`}
              </span>
            </article>
            <article className="pais-kpi">
              <span className="kpi-rotulo">Tempo médio</span>
              <strong className="kpi-valor kpi-texto">{formatarTempo(res.average_duration_seconds)}</strong>
              <span className="kpi-detalhe">por partida concluída</span>
            </article>
          </div>

          <div className="pais-bloco">
            <div className="pais-bloco-topo">
              <h3>Evolução da pontuação média por dia</h3>
              <span className="pais-legenda">{serie.length ? (serie.length === 1 ? "1 dia com partidas concluídas" : `Últimos ${serie.length} dias com partidas concluídas`) : ""}</span>
            </div>
            {serie.length > 0 ? (
              <GraficoEvolucao serie={serie} />
            ) : (
              <p>Sem partidas concluídas para montar o gráfico neste filtro.</p>
            )}
          </div>

          <div className="pais-bloco">
            <div className="pais-bloco-topo">
              <h3>Desempenho por jogo</h3>
            </div>
            <div className="pais-matriz">
              {dados.jogos.map((j) => (
                <div key={j.game_id} className="matriz-card">
                  <div className="matriz-topo">
                    <strong>{j.name}</strong>
                    <span className="kpi-badge">
                      {j.total_matches === 0 ? "Sem partidas" : `${j.completed_matches}/${j.total_matches} concluídas`}
                    </span>
                  </div>
                  <div className="matriz-barra-fundo" aria-hidden="true">
                    <div className="matriz-barra-preench" style={{ width: `${j.average_score ?? 0}%` }} />
                  </div>
                  <div className="matriz-numeros">
                    <span>
                      {j.average_score === null
                        ? j.total_matches === 0
                          ? "Ainda não jogou"
                          : "Nenhuma partida concluída"
                        : `${j.total_errors} ${j.total_errors === 1 ? "erro" : "erros"} · ${formatarTempo(j.average_duration_seconds)}`}
                    </span>
                    <strong>{j.average_score === null ? "—" : `${pontos(j.average_score)}%`}</strong>
                  </div>
                  {j.abandoned_matches > 0 && <small>{j.abandoned_matches} abandonada(s)</small>}
                </div>
              ))}
            </div>
          </div>

          <div className="pais-bloco">
            <div className="pais-bloco-topo">
              <h3>Histórico de atividades</h3>
              <span className="pais-legenda">
                {dados.hist.items.length} de {dados.hist.total}
              </span>
            </div>
            {dados.hist.items.length === 0 ? (
              <p>Nenhuma atividade para este jogo.</p>
            ) : (
              <div className="pais-tabela-wrap">
                <table className="pais-tabela">
                  <thead>
                    <tr>
                      <th>Jogo</th>
                      <th>Situação</th>
                      <th>Acertos</th>
                      <th>Erros</th>
                      <th>Pontuação</th>
                      <th>Tempo</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.hist.items.map((r) => (
                      <tr key={r.id}>
                        <td>{r.game_name}</td>
                        <td>{r.completed ? "Concluída" : "Abandonada"}</td>
                        <td className="num-ok">{r.correct_answers}</td>
                        <td>{r.incorrect_answers}</td>
                        <td>{r.completed ? <strong>{r.score}%</strong> : "—"}</td>
                        <td>{formatarTempo(r.duration_seconds)}</td>
                        <td>{formatarDataCurta(r.played_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {mais.erro && (
              <p className="erro" role="alert">
                {mais.erro}
              </p>
            )}
            {dados.hist.items.length < dados.hist.total && (
              <button type="button" className="btn sec peq" disabled={mais.carregando} onClick={verMais}>
                {mais.carregando ? "Carregando…" : "Ver mais"}
              </button>
            )}
          </div>
        </>
      )}

      <Relatorios criancaId={crianca.id} nomeCrianca={crianca.name} />
    </section>
  );
}
