export function emb(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function pick(lista, n) {
  return emb(lista).slice(0, n);
}

export function rnd(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}
