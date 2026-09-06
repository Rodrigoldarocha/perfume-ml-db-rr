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
export const OCCASION_SCORE = 0.15;
export const INTENSITY_SCORE = 0.15;
export const SCORE_THRESHOLD = 0.3;
export const MAX_RESULTS = 15;
export const FALLBACK_COUNT = 15;

/** Termos que traduzem ocasião em perfil olfativo. */
export const OCCASION_MAP: Record<string, string[]> = {
  "dia a dia": ["fresco", "citrico", "aquatico", "aromatico", "verde"],
  trabalho: ["fresco", "aromatico", "verde", "citrico"],
  "noite/festas": ["oriental", "ambar", "doce", "especiado", "musgo", "patchouli"],
  encontros: ["floral", "doce", "baunilha", "rosa"],
};

/** Termos que traduzem intensidade desejada em perfil olfativo. */
export const INTENSITY_MAP: Record<string, string[]> = {
  suave: ["fresco", "aquatico", "citrico", "verde", "floral"],
  moderada: [],
  "intensa/marcante": ["oriental", "ambar", "doce", "especiado", "musgo", "patchouli", "amadeirado"],
};

export interface RecommendationInput {
  genero: string;
  familia: string;
  ocasiao: string;
  intensidade: string;
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

/** Match de perfil (ocasião/intensidade) contra acordes + notas.
 *  Unilateral (token contém termo): bilateral superestima em tokens curtos. */
function scoreProfile(tokens: string[], terms: string[], weight: number): number {
  if (terms.length === 0) return 0;
  const norm = tokens.map(normalizePt).filter((t) => t.length >= 3);
  return norm.some((t) => terms.some((term) => t.includes(term))) ? weight : 0;
}

export function scoreCandidate(
  perfume: Perfume,
  input: RecommendationInput,
  familyTerms: string[],
): ScoredPerfume {
  const acordes = perfume.acordes_principais || [];
  const notas = {
    saida: perfume.notas_saida || [],
    coracao: perfume.notas_coracao || [],
    fundo: perfume.notas_fundo || [],
  };
  const familyPts = scoreFamily(acordes, familyTerms);
  const notePts = scoreNote(notas, input.nota);
  const occasionTerms = OCCASION_MAP[normalizePt(input.ocasiao)] || [];
  const intensityTerms = INTENSITY_MAP[normalizePt(input.intensidade)] || [];
  const allTokens = [...acordes, ...notas.saida, ...notas.coracao, ...notas.fundo];
  const occasionPts = scoreProfile(allTokens, occasionTerms, OCCASION_SCORE);
  const intensityPts = scoreProfile(allTokens, intensityTerms, INTENSITY_SCORE);
  const ratingPts = (perfume.avaliacao || 0) / 10;
  const score = familyPts + notePts + occasionPts + intensityPts + ratingPts;

  const motivos: string[] = [];
  if (familyPts > 0) motivos.push(`Alta afinidade com a família olfativa ${input.familia}`);
  if (notePts > 0) motivos.push(`Contém notas de ${input.nota} que você aprecia`);
  if (occasionPts > 0) motivos.push(`Combina com ${input.ocasiao.toLowerCase()}`);
  if (intensityPts > 0) motivos.push(`Intensidade ${input.intensidade.toLowerCase()} alinhada ao perfil`);

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
