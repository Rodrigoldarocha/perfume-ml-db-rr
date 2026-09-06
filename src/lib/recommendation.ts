import type { Perfume } from "@/types/perfume";
import { normalizePt } from "./text";

/** Lógica pura do recomendador (sem I/O). Testável isolada. */

export const GENEROS = ["masculino", "feminino", "unissex"] as const;
export type Genero = (typeof GENEROS)[number];

export const FAMILY_MAP: Record<string, string[]> = {
  citrico: ["citrico", "aromatico", "aquatico", "fresco"],
  floral: ["floral", "rosa", "flores brancas", "iris", "violeta"],
  amadeirado: ["amadeirado", "terroso", "musgo", "patchouli"],
  oriental: ["oriental", "baunilha", "doce", "especiado", "ambar"],
  fougere: ["lavanda", "aromatico", "verde", "musgo"],
};

export const FAMILY_SCORE = 0.5;
export const NOTE_SCORE = 0.3;
export const SCORE_THRESHOLD = 0.3;
export const MAX_RESULTS = 12;
export const FALLBACK_COUNT = 8;

export interface RecommendationInput {
  genero: string;
  familia: string;
  ocasiao: string;
  nota: string;
}

export type ScoredPerfume = Perfume & {
  compatibilityScore: number;
  recommendationReason: string;
};

export function resolveGenero(raw: string): Genero {
  const n = normalizePt(raw);
  return (GENEROS as readonly string[]).includes(n) ? (n as Genero) : "unissex";
}

export function resolveFamilyTerms(rawFamilia: string): string[] {
  const n = normalizePt(rawFamilia);
  return FAMILY_MAP[n] || [n];
}

/** Filtro gênero: unissex = tudo; específico = específico + unissex. */
export function matchGenero(perfumeGenero: string, target: Genero): boolean {
  if (target === "unissex") return true;
  return perfumeGenero === target || perfumeGenero === "unissex";
}

function scoreFamily(acordes: string[], familyTerms: string[]): number {
  const norm = acordes.map(normalizePt);
  return norm.some((a) => familyTerms.includes(a)) ? FAMILY_SCORE : 0;
}

function scoreNote(
  notas: { saida: string[]; coracao: string[]; fundo: string[] },
  targetNota: string,
): number {
  const n = normalizePt(targetNota);
  if (n.length < 3) return 0;
  const all = [...notas.saida, ...notas.coracao, ...notas.fundo].map(normalizePt);
  return all.some((x) => x.includes(n)) ? NOTE_SCORE : 0;
}

export function scoreCandidate(
  perfume: Perfume,
  input: RecommendationInput,
  familyTerms: string[],
): ScoredPerfume {
  const familyPts = scoreFamily(perfume.acordes_principais || [], familyTerms);
  const notePts = scoreNote(
    {
      saida: perfume.notas_saida || [],
      coracao: perfume.notas_coracao || [],
      fundo: perfume.notas_fundo || [],
    },
    input.nota,
  );
  const ratingPts = (perfume.avaliacao || 0) / 10;
  const score = familyPts + notePts + ratingPts;

  const motivos: string[] = [];
  if (familyPts > 0) motivos.push(`Alta afinidade com a família olfativa ${input.familia}`);
  if (notePts > 0) motivos.push(`Contém notas de ${input.nota} que você aprecia`);

  const fallbackReason = `Ideal para ${input.ocasiao.toLowerCase()}`;
  return {
    ...perfume,
    compatibilityScore: score,
    recommendationReason: motivos[0] ?? fallbackReason,
  };
}

export function rankRecommendations(
  candidates: Perfume[],
  input: RecommendationInput,
): ScoredPerfume[] {
  const familyTerms = resolveFamilyTerms(input.familia);
  const scored = candidates.map((p) => scoreCandidate(p, input, familyTerms));
  const above = scored
    .filter((p) => p.compatibilityScore >= SCORE_THRESHOLD)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  if (above.length >= 3) return above.slice(0, MAX_RESULTS);
  return [...scored]
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, FALLBACK_COUNT);
}
