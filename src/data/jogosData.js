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
  { n: "hexágono", art: "o", p: "50,8 88,29 88,71 50,92 12,71 12,29" },
  { n: "trapézio", art: "o", p: "26,20 74,20 92,82 8,82" },
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

export const PALAVRAS_9 = [
  { id: "elefante", e: "🐘" },
  { id: "borboleta", e: "🦋" },
  { id: "tartaruga", e: "🐢" },
  { id: "bicicleta", e: "🚲" },
  { id: "morango", e: "🍓" },
  { id: "abacaxi", e: "🍍" },
  { id: "girafa", e: "🦒" },
  { id: "foguete", e: "🚀" },
  { id: "mochila", e: "🎒" },
  { id: "palhaço", e: "🤡" },
];

export const PALAVRAS_10 = [
  { id: "helicóptero", e: "🚁" },
  { id: "dinossauro", e: "🦕" },
  { id: "computador", e: "💻" },
  { id: "melancia", e: "🍉" },
  { id: "passarinho", e: "🐦" },
  { id: "astronauta", e: "👩‍🚀" },
  { id: "telescópio", e: "🔭" },
  { id: "jacaré", e: "🐊" },
  { id: "violão", e: "🎸" },
  { id: "borracha", e: "🧽" },
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

export const FALA_9 = [
  { w: "obrigado", s: ["O", "BRI", "GA", "DO"], e: "🙏", f: "Muito obrigado pela ajuda!" },
  { w: "escola", s: ["ES", "CO", "LA"], e: "🏫", f: "Eu gosto da minha escola." },
  { w: "amigo", s: ["A", "MI", "GO"], e: "🤗", f: "Você é meu amigo." },
  { w: "lanche", s: ["LAN", "CHE"], e: "🥪", f: "Está na hora do lanche." },
  { w: "brincar", s: ["BRIN", "CAR"], e: "🧩", f: "Vamos brincar juntos?" },
  { w: "desculpa", s: ["DES", "CUL", "PA"], e: "💛", f: "Desculpa, não foi por mal." },
  { w: "esperar", s: ["ES", "PE", "RAR"], e: "⏳", f: "Eu sei esperar a minha vez." },
  { w: "calma", s: ["CAL", "MA"], e: "🌬️", f: "Vou respirar com calma." },
];

export const FALA_10 = [
  { w: "biblioteca", s: ["BI", "BLI", "O", "TE", "CA"], e: "📚", f: "Na biblioteca lemos com silêncio." },
  { w: "importante", s: ["IM", "POR", "TAN", "TE"], e: "⭐", f: "Sua opinião é muito importante." },
  { w: "comunidade", s: ["CO", "MU", "NI", "DA", "DE"], e: "🌍", f: "Todos fazem parte da comunidade." },
  { w: "respeito", s: ["RES", "PEI", "TO"], e: "🤝", f: "O respeito deixa o grupo feliz." },
  { w: "concentração", s: ["CON", "CEN", "TRA", "ÇÃO"], e: "🎯", f: "Com concentração eu consigo resolver." },
  { w: "sentimento", s: ["SEN", "TI", "MEN", "TO"], e: "💙", f: "Eu posso explicar o meu sentimento." },
  { w: "organizar", s: ["OR", "GA", "NI", "ZAR"], e: "🗂️", f: "Vou organizar o meu material." },
  { w: "curiosidade", s: ["CU", "RI", "O", "SI", "DA", "DE"], e: "🔍", f: "A curiosidade ajuda a aprender." },
];

export const FRUTAS = [
  {
    id: "morango",
    nome: "Morango",
    cor: "#F25C54",
    sombra: "#C93B34",
    claro: "#FFECEA",
    sigla: "M",
  },
  {
    id: "banana",
    nome: "Banana",
    cor: "#FFC93C",
    sombra: "#D19712",
    claro: "#FFF7DB",
    sigla: "B",
  },
  {
    id: "mirtilo",
    nome: "Mirtilo",
    cor: "#2D7FF9",
    sombra: "#195CC4",
    claro: "#E8F2FF",
    sigla: "A",
  },
  {
    id: "maca",
    nome: "Maçã",
    cor: "#24A159",
    sombra: "#16753E",
    claro: "#E7F9EE",
    sigla: "V",
  },
  {
    id: "uva",
    nome: "Uva",
    cor: "#8E6CEF",
    sombra: "#6543C7",
    claro: "#F2ECFF",
    sigla: "U",
  },
];

export const FAIXAS_ETARIAS = [
  {
    id: "8",
    idade: "8 anos",
    nivel: "Fácil",
    titulo: "8 anos · Fácil",
    descricao: "Menos distratores, formas básicas e metas tranquilas.",
  },
  {
    id: "9",
    idade: "9 anos",
    nivel: "Médio",
    titulo: "9 anos · Médio",
    descricao: "Mais opções, novas formas geométricas e palavras médias.",
  },
  {
    id: "10",
    idade: "10 anos",
    nivel: "Avançado",
    titulo: "10 anos · Avançado",
    descricao: "Cores próximas, leitura avançada e mais estratégia.",
  },
];

export function obterFaixaEtaria(idade) {
  return FAIXAS_ETARIAS.find((f) => f.id === String(idade)) || FAIXAS_ETARIAS[0];
}

// Paleta clássica do autismo (azul, vermelho, amarelo e verde) em tons equilibrados
export const CORES_AUTISMO = [
  "#2D7FF9",
  "#F25C54",
  "#FFC93C",
  "#E64840",
  "#3CC46E",
  "#4EA1FF",
  "#1E6CE0",
  "#FFD55A",
  "#24A159",
];

export const CORES_AUTISMO_CONTRASTE = [
  "#0B57D0",
  "#C5221F",
  "#E39B00",
  "#B31412",
  "#137333",
  "#1967D2",
  "#0D47A1",
  "#F29900",
  "#188038",
];

export const PASTEIS = ["#BFE3FF", "#C8F0D0", "#FFE9A8", "#E5D8FF", "#FFD3C2"];

export const PAL = ["#F25C54", "#FF9A2E", "#FFC93C", "#3CC46E", "#3E8EF0", "#8E6CEF", "#FF6FB1"];

export const PAL_TEXTO = ["#DF4A43", "#DC6D00", "#C48300", "#1E9B50", "#226EE0", "#7551DB", "#D6428A"];
