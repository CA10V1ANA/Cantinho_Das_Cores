export function maskCPF(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function cpfOk(cpf) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;

  for (let t = 9; t < 11; t++) {
    let soma = 0;
    for (let i = 0; i < t; i++) {
      soma += Number(d[i]) * (t + 1 - i);
    }
    if (((soma * 10) % 11) % 10 !== Number(d[t])) return false;
  }

  return true;
}

export function gmailOk(email) {
  return /^[a-z0-9._%+-]+@gmail\.com$/i.test(email.trim());
}
