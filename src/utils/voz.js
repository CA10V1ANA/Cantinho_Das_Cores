const voz = { on: true, v: "", rate: 0.78 };

const PREFERIDAS = [
  "Luciana",
  "Francisca",
  "Google português do Brasil",
  "Vitória",
  "Maria",
  "Fernanda",
  "Camila",
  "Thalita",
];

function temSintese() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function listarVozes() {
  if (!temSintese()) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => /^pt[-_]BR/i.test(v.lang));
}

export function melhorVoz(lista) {
  for (const nome of PREFERIDAS) {
    const encontrada = lista.find((v) => v.name.includes(nome));
    if (encontrada) return encontrada;
  }
  return lista[0];
}

export function definirVozAtiva(ativa) {
  voz.on = Boolean(ativa);
  if (!voz.on && temSintese()) {
    window.speechSynthesis.cancel();
  }
}

export function definirNomeVoz(nome) {
  voz.v = nome || "";
}

export function definirVelocidadeVoz(modo) {
  voz.rate = modo === "normal" ? 0.94 : 0.78;
}

export function obterNomeVoz() {
  return voz.v;
}

export function cancelarFala() {
  if (temSintese()) {
    window.speechSynthesis.cancel();
  }
}

export function falar(texto) {
  if (!voz.on || !temSintese() || !texto) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "pt-BR";
  utterance.rate = voz.rate;
  utterance.pitch = 1;
  utterance.volume = 0.9;

  const escolhida = listarVozes().find((v) => v.name === voz.v);
  if (escolhida) {
    utterance.voice = escolhida;
  }

  window.speechSynthesis.speak(utterance);
}
