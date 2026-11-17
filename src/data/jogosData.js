export const CORES = [
  { n: "vermelho", f: "vermelha", h: "#F25C54", evitar: ["laranja", "marrom"] },
  { n: "azul", f: "azul", h: "#3E8EF0", evitar: ["turquesa", "roxo"] },
  { n: "verde", f: "verde", h: "#3CC46E", evitar: ["turquesa"] },
  { n: "amarelo", f: "amarela", h: "#FFC93C", evitar: ["laranja"] },
  { n: "rosa", f: "rosa", h: "#FF6FB1", evitar: ["roxo", "vermelho"] },
  { n: "laranja", f: "laranja", h: "#FF9A2E", evitar: ["amarelo", "vermelho"] },
  { n: "roxo", f: "roxa", h: "#8E6CEF", evitar: ["azul", "rosa"] },
  { n: "turquesa", f: "turquesa", h: "#17C3B2", evitar: ["verde", "azul"] },
  { n: "marrom", f: "marrom", h: "#A9714B", evitar: ["vermelho", "laranja"] },
];

export const FORMAS = [
  { n: "círculo", art: "o", t: "c" },
  { n: "quadrado", art: "o", t: "r" },
  { n: "triângulo", art: "o", p: "50,10 92,88 8,88" },
  { n: "estrela", art: "a", p: "50,8 61,38 93,38 67,57 77,89 50,69 23,89 33,57 7,38 39,38" },
  { n: "pentágono", art: "o", p: "50,8 92,38 76,88 24,88 8,38" },
  { n: "losango", art: "o", p: "50,6 92,50 50,94 8,50" },
];

export const PALAVRAS = [
  { id: "bola", e: "⚽" },
  { id: "gato", e: "🐱" },
  { id: "casa", e: "🏠" },
  { id: "maçã", e: "🍎" },
  { id: "sol", e: "☀️" },
  { id: "peixe", e: "🐟" },
  { id: "flor", e: "🌸" },
  { id: "pão", e: "🍞" },
  { id: "leite", e: "🥛" },
  { id: "carro", e: "🚗" },
  { id: "livro", e: "📖" },
  { id: "cachorro", e: "🐶" },
];

export const FALA = [
  { w: "bola", s: ["BO", "LA"], e: "⚽", f: "Eu quero a bola." },
  { w: "água", s: ["Á", "GUA"], e: "💧", f: "Eu quero água." },
  { w: "mais", s: ["MAIS"], e: "➕", f: "Eu quero mais." },
  { w: "ajuda", s: ["A", "JU", "DA"], e: "🤝", f: "Eu preciso de ajuda." },
  { w: "acabou", s: ["A", "CA", "BOU"], e: "✅", f: "Acabou!" },
  { w: "mamãe", s: ["MA", "MÃE"], e: "👩", f: "Oi, mamãe!" },
  { w: "papai", s: ["PA", "PAI"], e: "👨", f: "Oi, papai!" },
  { w: "quero", s: ["QUE", "RO"], e: "🙋", f: "Eu quero brincar." },
  { w: "oi", s: ["OI"], e: "👋", f: "Oi! Tudo bem?" },
  { w: "tchau", s: ["TCHAU"], e: "🙌", f: "Tchau, até logo!" },
];

export const PASTEIS = ["#BFE3FF", "#C8F0D0", "#FFE9A8", "#E5D8FF", "#FFD3C2"];

export const PAL = ["#F25C54", "#FF9A2E", "#FFC93C", "#3CC46E", "#3E8EF0", "#8E6CEF", "#FF6FB1"];

export const PAL_TEXTO = ["#DF4A43", "#DC6D00", "#C48300", "#1E9B50", "#226EE0", "#7551DB", "#D6428A"];
