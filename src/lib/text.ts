/** Utilidades de texto PT-BR compartilhadas (client + server). Puras, sem I/O. */

export function normalizePt(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}
