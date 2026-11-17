export default function IconeMenu({ id }) {
  if (id === "cores") {
    return (
      <svg viewBox="0 0 64 64" width="54" height="54" aria-hidden="true">
        <path
          d="M32 8C17.6 8 8 17.4 8 30c0 10.6 7.8 18 16.5 18 3.1 0 5-1.8 5-4.3 0-1.6-.7-2.8-1.1-3.6-.7-1.4.3-3.1 1.9-3.1h5.1C47.7 37 56 30.8 56 21.8 56 13.5 45.4 8 32 8Z"
          fill="#FFF6D6"
          stroke="#2B3A67"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="21" cy="24" r="4.5" fill="#F25C54" />
        <circle cx="32" cy="18" r="4.5" fill="#FFC93C" />
        <circle cx="43" cy="23" r="4.5" fill="#3CC46E" />
        <circle cx="19" cy="36" r="4.5" fill="#3E8EF0" />
        <circle cx="41" cy="33" r="3.6" fill="#FFFFFF" stroke="#2B3A67" strokeWidth="2.2" />
      </svg>
    );
  }

  if (id === "encaixe") {
    return (
      <svg viewBox="0 0 64 64" width="54" height="54" aria-hidden="true">
        <circle cx="22" cy="24" r="12" fill="#3E8EF0" stroke="#fff" strokeWidth="3" />
        <polygon points="44,11 56,33 32,33" fill="#FFC93C" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
        <rect x="20" y="36" width="22" height="20" rx="5" fill="#2B3A67" fillOpacity="0.88" stroke="#3CC46E" strokeWidth="3.5" />
      </svg>
    );
  }

  if (id === "ligar") {
    return (
      <svg viewBox="0 0 64 64" width="54" height="54" aria-hidden="true">
        <rect x="7" y="14" width="22" height="18" rx="6" fill="#fff" stroke="#2B3A67" strokeWidth="2.8" />
        <circle cx="18" cy="23" r="5" fill="#F25C54" />
        <rect x="35" y="32" width="22" height="18" rx="6" fill="#fff" stroke="#2B3A67" strokeWidth="2.8" />
        <path d="M41 41h10" stroke="#2B3A67" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M29 23C36 23 28 41 35 41" fill="none" stroke="#2B3A67" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="4 4" />
      </svg>
    );
  }

  if (id === "corforma") {
    return (
      <svg viewBox="0 0 64 64" width="54" height="54" aria-hidden="true">
        <polygon
          points="32,8 39,23 55,25 43,36 46,52 32,44 18,52 21,36 9,25 25,23"
          fill="#8E6CEF"
          stroke="#fff"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <circle cx="48" cy="48" r="10" fill="#3CC46E" stroke="#fff" strokeWidth="2.8" />
        <path d="M44 48l3 3 5-6" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" width="54" height="54" aria-hidden="true">
      <path
        d="M14 14h30a8 8 0 0 1 8 8v15a8 8 0 0 1-8 8H28l-10 8v-8h-4a8 8 0 0 1-8-8V22a8 8 0 0 1 8-8Z"
        fill="#FFF6D6"
        stroke="#2B3A67"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="29.5" r="3" fill="#2B3A67" />
      <circle cx="29" cy="29.5" r="3" fill="#3E8EF0" />
      <circle cx="37" cy="29.5" r="3" fill="#24A159" />
      <path d="M54 22c3 3 3 11 0 14M58 18c4.5 5 4.5 17 0 22" fill="none" stroke="#2B3A67" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
