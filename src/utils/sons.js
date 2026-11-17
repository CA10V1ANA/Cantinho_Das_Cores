let audioCtx = null;
let efeitosAtivos = true;

function obterContexto() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctx();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function tocarNota(freq, inicio, duracao, ganhoMax = 0.08, tipo = "sine") {
  const ctx = obterContexto();
  if (!ctx) return;

  const agora = ctx.currentTime + inicio;
  const osc = ctx.createOscillator();
  const ganho = ctx.createGain();

  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, agora);

  ganho.gain.setValueAtTime(0.0001, agora);
  ganho.gain.exponentialRampToValueAtTime(ganhoMax, agora + 0.02);
  ganho.gain.exponentialRampToValueAtTime(0.0001, agora + duracao);

  osc.connect(ganho);
  ganho.connect(ctx.destination);

  osc.start(agora);
  osc.stop(agora + duracao + 0.02);
}

export function definirEfeitosAtivos(ativo) {
  efeitosAtivos = Boolean(ativo);
}

export function tocarSelecao() {
  if (!efeitosAtivos) return;
  tocarNota(440, 0, 0.06, 0.05, "sine");
}

export function tocarAcerto() {
  if (!efeitosAtivos) return;
  tocarNota(523.25, 0, 0.14, 0.08, "triangle");
  tocarNota(659.25, 0.09, 0.22, 0.09, "triangle");
}

export function tocarErro() {
  if (!efeitosAtivos) return;
  tocarNota(246.94, 0, 0.12, 0.05, "sine");
  tocarNota(207.65, 0.1, 0.16, 0.05, "sine");
}

export function tocarVitoria() {
  if (!efeitosAtivos) return;
  tocarNota(523.25, 0, 0.14, 0.08, "triangle");
  tocarNota(659.25, 0.1, 0.14, 0.08, "triangle");
  tocarNota(783.99, 0.2, 0.14, 0.08, "triangle");
  tocarNota(1046.5, 0.3, 0.32, 0.09, "triangle");
}
