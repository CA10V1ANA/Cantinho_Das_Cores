import { falar } from "../utils/voz";

export default function Nuvi({ fala, ouvivel = false }) {
  return (
    <div className="nuvi">
      <svg
        className="nuvi-arte"
        viewBox="0 0 120 84"
        width="96"
        height="67"
        aria-hidden="true"
      >
        <g fill="#fff" stroke="#8FC4EA" strokeWidth="3">
          <circle cx="38" cy="48" r="24" />
          <circle cx="64" cy="36" r="28" />
          <circle cx="88" cy="50" r="22" />
          <rect x="30" y="50" width="68" height="22" rx="11" stroke="none" />
        </g>
        <circle cx="52" cy="50" r="3.5" fill="#2B3A67" />
        <circle cx="76" cy="50" r="3.5" fill="#2B3A67" />
        <path
          d="M54 59q10 9 20 0"
          stroke="#2B3A67"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="45" cy="58" r="4.5" fill="#FFB4B4" />
        <circle cx="83" cy="58" r="4.5" fill="#FFB4B4" />
      </svg>
      <div className="balao">
        <p className="balao-texto" aria-live="polite">
          {fala}
        </p>
        {ouvivel && (
          <button
            type="button"
            className="nuvi-ouvir"
            onClick={() => falar(fala)}
            aria-label="Ouvir instrução da Nuvi novamente"
            title="Ouvir novamente"
          >
            🔊
          </button>
        )}
      </div>
    </div>
  );
}
