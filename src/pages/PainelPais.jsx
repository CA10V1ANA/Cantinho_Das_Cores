import { useState, useMemo } from "react";
import { FAIXAS_ETARIAS } from "../data/jogosData";
import {
  NOMES_JOGOS,
  ORDEM_IDADES,
  ORDEM_JOGOS,
  calcularMetricas,
  exportarHistoricoCSV,
} from "../utils/desempenho";

function formatarDataCurta(iso) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return "";
  }
}

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
        aria-label="Gráfico de evolução da taxa de acertos ao longo das partidas"
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
              {`${pt.jogoNome} (${pt.idade} anos): ${pt.acertos} acertos, ${pt.erros} erros (${pt.taxa}%)`}
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
              #{pt.indice}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function PainelPais({
  historico,
  onCarregarExemplo,
  onLimparHistorico,
}) {
  const [filtroJogo, setFiltroJogo] = useState("todos");
  const [filtroIdade, setFiltroIdade] = useState("todas");
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);

  const metricas = useMemo(
    () => calcularMetricas(historico, filtroJogo, filtroIdade),
    [historico, filtroJogo, filtroIdade]
  );

  const recentes = useMemo(
    () => [...metricas.filtrados].reverse().slice(0, 12),
    [metricas.filtrados]
  );

  const textoTendencia =
    metricas.tendencia.status === "melhora"
      ? `↗ +${metricas.tendencia.delta}%`
      : metricas.tendencia.status === "reforco"
        ? `↘ ${metricas.tendencia.delta}%`
        : metricas.tendencia.status === "estavel"
          ? "→ Estável"
          : "Em início";

  return (
    <section className="pais-painel" aria-label="Painel de acompanhamento para pais e professores">
      <div className="pais-cabecalho">
        <div>
          <h2 className="pais-titulo">Acompanhamento de Desempenho</h2>
          <p className="pais-subtitulo">
            Analise a evolução de acertos da criança por jogo e por faixa etária (8 a 10 anos).
          </p>
        </div>
        <div className="pais-acoes-dados">
          <button
            type="button"
            className="btn sec peq"
            onClick={onCarregarExemplo}
            title="Carregar partidas de exemplo para visualizar gráficos"
          >
            ✨ Exemplo de evolução
          </button>
          {historico.length > 0 && (
            <>
              <button
                type="button"
                className="btn peq"
                onClick={() => exportarHistoricoCSV(metricas.filtrados)}
              >
                📥 Exportar CSV
              </button>
              <button
                type="button"
                className={`btn sec peq ${confirmarLimpeza ? "perigo" : ""}`}
                onClick={() => {
                  if (!confirmarLimpeza) {
                    setConfirmarLimpeza(true);
                  } else {
                    onLimparHistorico();
                    setConfirmarLimpeza(false);
                  }
                }}
              >
                {confirmarLimpeza ? "Confirmar limpar?" : "🗑️ Limpar"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="pais-filtros">
        <label className="pais-filtro-campo" htmlFor="filtro-jogo">
          <span>Jogo</span>
          <select
            id="filtro-jogo"
            value={filtroJogo}
            onChange={(e) => setFiltroJogo(e.target.value)}
          >
            <option value="todos">Todos os jogos</option>
            {ORDEM_JOGOS.map((id) => (
              <option key={id} value={id}>
                {NOMES_JOGOS[id]}
              </option>
            ))}
          </select>
        </label>

        <div className="pais-filtro-idades" role="group" aria-label="Filtrar por faixa etária">
          <button
            type="button"
            className={`chip ${filtroIdade === "todas" ? "on" : ""}`}
            onClick={() => setFiltroIdade("todas")}
          >
            Todas as idades
          </button>
          {FAIXAS_ETARIAS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`chip ${filtroIdade === f.id ? "on" : ""}`}
              onClick={() => setFiltroIdade(f.id)}
            >
              {f.titulo}
            </button>
          ))}
        </div>
      </div>

      <div className="pais-kpis">
        <article className="pais-kpi">
          <span className="kpi-rotulo">Total de acertos</span>
          <strong className="kpi-valor">{metricas.totalAcertos}</strong>
          <span className="kpi-detalhe">
            em {metricas.totalTentativas} tentativas
          </span>
        </article>
        <article className="pais-kpi">
          <span className="kpi-rotulo">Taxa de acerto</span>
          <strong className="kpi-valor">{metricas.taxaMedia}%</strong>
          <span
            className={`kpi-badge ${metricas.tendencia.status}`}
          >
            {textoTendencia}
          </span>
        </article>
        <article className="pais-kpi">
          <span className="kpi-rotulo">Partidas</span>
          <strong className="kpi-valor">{metricas.totalPartidas}</strong>
          <span className="kpi-detalhe">
            {metricas.partidasConcluidas} concluídas
          </span>
        </article>
        <article className="pais-kpi">
          <span className="kpi-rotulo">Maior evolução</span>
          <strong className="kpi-valor kpi-texto">
            {metricas.melhorEvolucao ? metricas.melhorEvolucao.nome : "—"}
          </strong>
          <span className="kpi-detalhe">
            {metricas.melhorEvolucao
              ? metricas.melhorEvolucao.tendencia.delta > 0
                ? `+${metricas.melhorEvolucao.tendencia.delta}% de avanço`
                : `${metricas.melhorEvolucao.taxa ?? 0}% de acerto`
              : "Sem partidas ainda"}
          </span>
        </article>
      </div>

      <div className="pais-bloco pais-insights">
        <h3>Leitura pedagógica</h3>
        <ul>
          {metricas.insights.map((texto, idx) => (
            <li key={idx}>{texto}</li>
          ))}
        </ul>
      </div>

      {metricas.serieTemporal.length > 0 && (
        <div className="pais-bloco">
          <div className="pais-bloco-topo">
            <h3>Evolução dos acertos por partida</h3>
            <span className="pais-legenda">Últimas {metricas.serieTemporal.length} sessões</span>
          </div>
          <GraficoEvolucao serie={metricas.serieTemporal} />
        </div>
      )}

      <div className="pais-bloco">
        <div className="pais-bloco-topo">
          <h3>Desempenho por jogo e dificuldade</h3>
          <span className="pais-legenda">Comparativo 8, 9 e 10 anos</span>
        </div>
        <div className="pais-matriz">
          {metricas.resumoPorJogo.map((item) => {
            const barraPct = item.taxa ?? 0;
            const badgeTrend =
              item.tendencia.status === "melhora"
                ? `↗ +${item.tendencia.delta}%`
                : item.tendencia.status === "reforco"
                  ? `↘ ${item.tendencia.delta}%`
                  : item.partidas >= 2
                    ? "→ Estável"
                    : "Novo";

            return (
              <div key={item.jogoId} className="matriz-card">
                <div className="matriz-topo">
                  <strong>{item.nome}</strong>
                  <span className={`kpi-badge ${item.tendencia.status}`}>
                    {item.partidas > 0 ? badgeTrend : "Sem dados"}
                  </span>
                </div>
                <div className="matriz-barra-fundo" aria-hidden="true">
                  <div
                    className="matriz-barra-preench"
                    style={{ width: `${barraPct}%` }}
                  />
                </div>
                <div className="matriz-numeros">
                  <span>
                    <strong>{item.acertos}</strong> acertos · {item.erros} erros
                  </span>
                  <strong>{item.taxa !== null ? `${item.taxa}%` : "—"}</strong>
                </div>
                <div className="matriz-idades">
                  {ORDEM_IDADES.map((id) => {
                    const info = item.porIdade[id];
                    return (
                      <span
                        key={id}
                        className={`idade-pill ${info.partidas > 0 ? "ativa" : ""}`}
                      >
                        {id}a: {info.taxa !== null ? `${info.taxa}% (${info.acertos})` : "—"}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {recentes.length > 0 && (
        <div className="pais-bloco">
          <div className="pais-bloco-topo">
            <h3>Registro recente de atividades</h3>
            <span className="pais-legenda">{recentes.length} registros</span>
          </div>
          <div className="pais-tabela-wrap">
            <table className="pais-tabela">
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>Idade</th>
                  <th>Acertos</th>
                  <th>Erros</th>
                  <th>Taxa</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {NOMES_JOGOS[r.jogoId] || r.jogoId}
                      {r.demo && <span className="tag-demo">Exemplo</span>}
                    </td>
                    <td>{r.idade} anos</td>
                    <td className="num-ok">{r.acertos}</td>
                    <td>{r.erros}</td>
                    <td>
                      <strong>{r.taxa}%</strong>
                    </td>
                    <td>{formatarDataCurta(r.data)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
