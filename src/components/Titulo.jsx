import { PAL_TEXTO } from "../data/jogosData";

export default function Titulo({ t, tag: Tag = "h1", className = "" }) {
  return (
    <Tag className={`titulo ${className}`.trim()} aria-label={t}>
      {[...t].map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ color: c === " " ? undefined : PAL_TEXTO[i % PAL_TEXTO.length] }}
        >
          {c}
        </span>
      ))}
    </Tag>
  );
}
