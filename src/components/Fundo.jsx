export default function Fundo() {
  return (
    <div className="fundo" aria-hidden="true">
      <svg
        className="fundo-ceu"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMin slice"
      >
        <circle cx="670" cy="84" r="64" fill="#FFD95A" opacity=".32" />
        <circle cx="670" cy="84" r="44" fill="#FFD95A" />
        <g fill="#fff" opacity=".92">
          <ellipse cx="120" cy="115" rx="54" ry="22" />
          <ellipse cx="152" cy="96" rx="34" ry="24" />
          <ellipse cx="92" cy="102" rx="28" ry="18" />

          <ellipse cx="480" cy="175" rx="46" ry="19" />
          <ellipse cx="508" cy="159" rx="30" ry="20" />

          <ellipse cx="185" cy="315" rx="44" ry="16" />
          <ellipse cx="210" cy="301" rx="26" ry="18" />

          <ellipse cx="670" cy="290" rx="48" ry="18" />
          <ellipse cx="644" cy="276" rx="28" ry="19" />
        </g>
      </svg>

      <svg
        className="fundo-grama"
        viewBox="0 0 800 180"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 72 Q180 12 400 62 T800 36 V180 H0Z"
          fill="#A6E3A1"
        />
        <path
          d="M0 116 Q220 64 460 110 T800 88 V180 H0Z"
          fill="#6FD08A"
        />
        <g>
          {[
            [64, 148, "#FF6FB1"],
            [176, 130, "#FFC93C"],
            [310, 152, "#F25C54"],
            [455, 134, "#fff"],
            [590, 154, "#8E6CEF"],
            [725, 136, "#FF9A2E"],
          ].map(([x, y, c], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="7.5" fill={c} />
              <circle cx={x} cy={y} r="2.8" fill="#FFF3B0" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
