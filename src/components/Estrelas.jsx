export default function Estrelas({ n }) {
  return (
    <div className="estrelas" role="img" aria-label={`${n} de 5 estrelas`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < n ? "on" : ""}>
          ★
        </span>
      ))}
    </div>
  );
}
