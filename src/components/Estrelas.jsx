export default function Estrelas({ n, total = 5 }) {
  return (
    <div className="estrelas" role="img" aria-label={`${n} de ${total} estrelas`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < n ? "on" : ""}>
          ★
        </span>
      ))}
    </div>
  );
}
