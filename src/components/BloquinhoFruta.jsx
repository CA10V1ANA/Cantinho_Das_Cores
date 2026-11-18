export default function BloquinhoFruta({ fruta, comOlhos = true, tam = "100%" }) {
  const id = fruta?.id || "morango";

  return (
    <svg
      viewBox="0 0 64 64"
      width={tam}
      height={tam}
      aria-hidden="true"
      className="fruta-svg"
    >
      {id === "morango" && (
        <g>
          <path
            d="M32 14 C16 14 12 27 16 40 C20 51 27 56 32 56 C37 56 44 51 48 40 C52 27 48 14 32 14 Z"
            fill="#F25C54"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path
            d="M22 17 C26 10 38 10 42 17 C37 20 35 17 32 21 C29 17 27 20 22 17 Z"
            fill="#24A159"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M32 7 V14" stroke="#187740" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="22" cy="41" r="1.7" fill="#FFE694" />
          <circle cx="42" cy="41" r="1.7" fill="#FFE694" />
          <circle cx="32" cy="47" r="1.7" fill="#FFE694" />
          {comOlhos && (
            <g>
              <rect x="23" y="27" width="5.5" height="9" rx="2.75" fill="#FFFFFF" />
              <rect x="35.5" y="27" width="5.5" height="9" rx="2.75" fill="#FFFFFF" />
              <circle cx="25.8" cy="31.5" r="1.7" fill="#2B3A67" />
              <circle cx="38.2" cy="31.5" r="1.7" fill="#2B3A67" />
            </g>
          )}
        </g>
      )}

      {id === "banana" && (
        <g>
          <path
            d="M17 44 C15 31 24 16 40 12 C45 11 49 14 48 19 C46 31 38 46 24 50 C19 51 17 48 17 44 Z"
            fill="#FFC93C"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path
            d="M23 41 C24 30 31 21 41 17"
            fill="none"
            stroke="#FFE99B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M41 12 L45 8"
            stroke="#A9714B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {comOlhos && (
            <g>
              <rect x="24" y="27.5" width="5.2" height="8.6" rx="2.6" fill="#FFFFFF" />
              <rect x="34.5" y="25.5" width="5.2" height="8.6" rx="2.6" fill="#FFFFFF" />
              <circle cx="26.6" cy="31.8" r="1.7" fill="#2B3A67" />
              <circle cx="37.1" cy="29.8" r="1.7" fill="#2B3A67" />
            </g>
          )}
        </g>
      )}

      {id === "mirtilo" && (
        <g>
          <circle
            cx="32"
            cy="34"
            r="21"
            fill="#2D7FF9"
            stroke="#FFFFFF"
            strokeWidth="3.2"
          />
          <path
            d="M25 14 L29 10 L32 14 L35 10 L39 14"
            fill="none"
            stroke="#1456D1"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse cx="22" cy="24" rx="5" ry="2.6" transform="rotate(-25 22 24)" fill="#82B6FF" opacity="0.6" />
          {comOlhos && (
            <g>
              <rect x="22.5" y="29" width="5.5" height="9" rx="2.75" fill="#FFFFFF" />
              <rect x="36" y="29" width="5.5" height="9" rx="2.75" fill="#FFFFFF" />
              <circle cx="25.2" cy="33.5" r="1.8" fill="#1D3557" />
              <circle cx="38.8" cy="33.5" r="1.8" fill="#1D3557" />
            </g>
          )}
        </g>
      )}

      {id === "maca" && (
        <g>
          <path
            d="M32 17 C21 14 12 22 14 35 C16 48 24 55 32 53 C40 55 48 48 50 35 C52 22 43 14 32 17 Z"
            fill="#24A159"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path d="M32 17 V9" stroke="#A9714B" strokeWidth="3.2" strokeLinecap="round" />
          <path
            d="M33 12 C38 8 44 10 43 15 C39 17 35 15 33 12 Z"
            fill="#77DCA0"
            stroke="#FFFFFF"
            strokeWidth="1.6"
          />
          {comOlhos && (
            <g>
              <rect x="22.5" y="28.5" width="5.5" height="9" rx="2.75" fill="#FFFFFF" />
              <rect x="36" y="28.5" width="5.5" height="9" rx="2.75" fill="#FFFFFF" />
              <circle cx="25.2" cy="33" r="1.8" fill="#1D3557" />
              <circle cx="38.8" cy="33" r="1.8" fill="#1D3557" />
            </g>
          )}
        </g>
      )}

      {id === "uva" && (
        <g>
          <circle cx="24" cy="28" r="11" fill="#8E6CEF" stroke="#FFFFFF" strokeWidth="2.8" />
          <circle cx="40" cy="28" r="11" fill="#8E6CEF" stroke="#FFFFFF" strokeWidth="2.8" />
          <circle cx="32" cy="42" r="11" fill="#8E6CEF" stroke="#FFFFFF" strokeWidth="2.8" />
          <circle cx="32" cy="31" r="12" fill="#9D7FF5" />
          <path d="M32 17 V9" stroke="#187740" strokeWidth="3.2" strokeLinecap="round" />
          <path
            d="M32 12 C38 9 43 12 40 16 C37 17 34 15 32 12 Z"
            fill="#3CC46E"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          {comOlhos && (
            <g>
              <rect x="23" y="27.5" width="5.2" height="8.5" rx="2.6" fill="#FFFFFF" />
              <rect x="35.8" y="27.5" width="5.2" height="8.5" rx="2.6" fill="#FFFFFF" />
              <circle cx="25.6" cy="31.8" r="1.7" fill="#2B3A67" />
              <circle cx="38.4" cy="31.8" r="1.7" fill="#2B3A67" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
}
