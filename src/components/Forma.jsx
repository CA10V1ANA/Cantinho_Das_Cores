export default function Forma({ f, cor, oco, tam = 84 }) {
  const props = {
    fill: oco ? "#2B3A67" : cor,
    fillOpacity: oco ? 0.85 : 1,
    stroke: oco ? cor : "#fff",
    strokeWidth: oco ? 7 : 5,
    strokeLinejoin: "round",
  };

  return (
    <svg viewBox="0 0 100 100" width={tam} height={tam} aria-hidden="true">
      {f.t === "c" ? (
        <circle cx="50" cy="50" r="40" {...props} />
      ) : f.t === "r" ? (
        <rect x="12" y="12" width="76" height="76" rx="10" {...props} />
      ) : (
        <polygon points={f.p} {...props} />
      )}
    </svg>
  );
}
