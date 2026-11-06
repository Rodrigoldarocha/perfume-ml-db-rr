import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Cor de "líquido" derivada do acorde principal do perfume. */
const LIQUID_RULES: Array<{ keys: string[]; color: string }> = [
  { keys: ["amadeirado", "woody", "santal", "cedro", "vetiver", "patchouli", "madeira"], color: "#8a5a3b" },
  { keys: ["citrico", "citrus", "limao", "bergamota", "mandarina"], color: "#c9971a" },
  { keys: ["floral", "rosa", "jasmim", "flor"], color: "#d16a8e" },
  { keys: ["verde", "fougere", "aromatico", "herbal", "musgo"], color: "#4a8a5c" },
  { keys: ["aquatico", "marinho", "ozonico"], color: "#3f6fb5" },
  { keys: ["gourmand", "doce", "baunilha", "caramelo"], color: "#b06a3a" },
  { keys: ["oriental", "especiado", "ambar", "resinoso"], color: "#c2703d" },
  { keys: ["frutado", "fruta"], color: "#c0453f" },
  { keys: ["couro", "leather", "animal"], color: "#6b4a36" },
  { keys: ["chipre", "chypre"], color: "#7a8a4a" },
  { keys: ["oud", "incenso"], color: "#7a4fa3" },
  { keys: ["aldeído", "aldeido", "sabonete", "poudre"], color: "#9aa0b5" },
];

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function liquidColor(acordes: readonly string[]): string {
  for (const acorde of acordes) {
    const key = normalize(acorde);
    for (const rule of LIQUID_RULES) {
      if (rule.keys.some((k) => key.includes(k))) return rule.color;
    }
  }
  return "#7a8196"; /* neutro */
}

/** Fundo suave na cor do líquido (16% sobre branco). */
export function liquidTint(color: string): string {
  return `color-mix(in srgb, ${color} 16%, #ffffff)`;
}
