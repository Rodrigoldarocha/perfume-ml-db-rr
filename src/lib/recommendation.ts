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
/** Teto do prior de popularidade: rating soma no máximo 0.15 (não domina gosto). */
export const RATING_SCALE = 0.3;
/** Bônus de recência: lançamentos novos somam no máximo este valor.
 *  Linear entre RECENCY_FLOOR_YEAR e o ano atual. */
export const RECENCY_MAX = 0.1;
export const RECENCY_FLOOR_YEAR = 2015;
/** Bônus por coerência de cluster: candidato no mesmo cluster (K-Means) das âncoras. */
export const CLUSTER_BONUS = 0.06;
/** Bônus para vizinhos do ML (top5_similares) trazidos pela expansão de âncoras. */
export const ML_NEIGHBOR_BONUS = 0.08;
export const SCORE_THRESHOLD = 0.3;
export const MAX_RESULTS = 15;
export const FALLBACK_COUNT = 15;
/** MMR: 0.7 relevância, 0.3 diversidade. */
export const MMR_LAMBDA = 0.7;
export const ANCHOR_COUNT = 3;

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
  const n = canonTerm(rawFamilia);
  return FAMILY_MAP[n] || [n];
}

/** Sinônimos EN→PT canônico. Dataset mistura idiomas; sem isso o match falha
 *  silenciosamente (ex.: acorde "citrus" vs família "cítrico"). */
export const SYNONYMS: Record<string, string> = {
  citrus: "citrico",
  citric: "citrico",
  aromatic: "aromatico",
  aromatico: "aromatico",
  aquatic: "aquatico",
  woody: "amadeirado",
  wood: "amadeirado",
  amber: "ambar",
  ambar: "ambar",
  smoky: "defumado",
  smoke: "defumado",
  spicy: "especiado",
  warm: "quente",
  fresh: "fresco",
  green: "verde",
  sweet: "doce",
  floral: "floral",
  rose: "rosa",
  jasmine: "jasmim",
  lily: "lirio",
  iris: "iris",
  violet: "violeta",
  lavender: "lavanda",
  vanilla: "baunilha",
  lemon: "limao",
  bergamot: "bergamota",
  grapefruit: "toranja",
  orange: "laranja",
  ginger: "gengibre",
  nutmeg: "noz moscada",
  pepper: "pimenta",
  cinnamon: "canela",
  sandalwood: "sandalo",
  cedar: "cedro",
  vetiver: "vetiver",
  incense: "incenso",
  musk: "almiscar",
  moss: "musgo",
  leather: "couro",
  tobacco: "tabaco",
  honey: "mel",
  coffee: "cafe",
};

/** Normalização única: minúsculas, sem acentos, sinônimo canônico. */
export function canonTerm(term: string): string {
  const n = normalizePt(term);
  return SYNONYMS[n] ?? n;
}

/** Filtro gênero: unissex = tudo; específico = específico + unissex. */
export function matchGenero(perfumeGenero: string, target: Genero): boolean {
  if (target === "unissex") return true;
  return perfumeGenero === target || perfumeGenero === "unissex";
}

function scoreFamily(acordes: string[], familyTerms: string[]): number {
  const norm = acordes.map(canonTerm);
  return norm.some((a) => familyTerms.includes(a)) ? FAMILY_SCORE : 0;
}

function scoreNote(
  notas: { saida: string[]; coracao: string[]; fundo: string[] },
  targetNota: string,
): number {
  const n = canonTerm(targetNota);
  if (n.length < 3) return 0;
  const all = [...notas.saida, ...notas.coracao, ...notas.fundo].map(canonTerm);
  return all.some((x) => x.includes(n)) ? NOTE_SCORE : 0;
}

/** Match de perfil (ocasião/intensidade) contra acordes + notas.
 *  Unilateral (token contém termo): bilateral superestima em tokens curtos. */
function scoreProfile(tokens: string[], terms: string[], weight: number): number {
  if (terms.length === 0) return 0;
  const norm = tokens.map(canonTerm).filter((t) => t.length >= 3);
  const canonTerms = terms.map(canonTerm);
  return norm.some((t) => canonTerms.some((term) => t.includes(term))) ? weight : 0;
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
  // Prior de popularidade pequeno e limitado: não domina o gosto.
  const rating = Math.max(0, Math.min(5, perfume.avaliacao || 0));
  const ratingPts = (rating / 10) * RATING_SCALE;
  // Recência: linear de RECENCY_FLOOR_YEAR até o ano atual; desconhecido = 0.
  const ano = perfume.ano_lancamento || 0;
  const anoAtual = new Date().getFullYear();
  const recencyPts =
    ano >= RECENCY_FLOOR_YEAR
      ? ((Math.min(ano, anoAtual) - RECENCY_FLOOR_YEAR) /
          Math.max(1, anoAtual - RECENCY_FLOOR_YEAR)) *
        RECENCY_MAX
      : 0;
  const score =
    familyPts + notePts + occasionPts + intensityPts + ratingPts + recencyPts;

  const motivos: string[] = [];
  if (familyPts > 0) motivos.push(`Alta afinidade com a família olfativa ${input.familia}`);
  if (notePts > 0) motivos.push(`Contém notas de ${input.nota} que você aprecia`);
  if (occasionPts > 0) motivos.push(`Combina com ${input.ocasiao.toLowerCase()}`);
  if (intensityPts > 0) motivos.push(`Intensidade ${input.intensidade.toLowerCase()} alinhada ao perfil`);
  if (recencyPts >= RECENCY_MAX * 0.7 && ano > 0)
    motivos.push(`Lançamento recente (${ano})`);

  const fallbackReason = `Ideal para ${input.ocasiao.toLowerCase()}`;
  return {
    ...perfume,
    compatibilityScore: score,
    recommendationReason: motivos[0] ?? fallbackReason,
  };
}

/** Conjunto canônico de tokens (acordes + notas) para similaridade. */
export function tokenSet(p: Perfume): Set<string> {
  return new Set(
    [
      ...(p.acordes_principais || []),
      ...(p.notas_saida || []),
      ...(p.notas_coracao || []),
      ...(p.notas_fundo || []),
    ].map(canonTerm),
  );
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

/** MMR guloso: relevância λ·score − (1−λ)·max similaridade com já escolhidos. */
export function mmrSelect(
  scored: ScoredPerfume[],
  count: number,
  lambda = MMR_LAMBDA,
): ScoredPerfume[] {
  const remaining = [...scored].sort(
    (a, b) => b.compatibilityScore - a.compatibilityScore,
  );
  const selected: ScoredPerfume[] = [];
  const sets = new Map<number, Set<string>>();
  const tokensOf = (p: ScoredPerfume) => {
    let s = sets.get(p.id);
    if (!s) {
      s = tokenSet(p);
      sets.set(p.id, s);
    }
    return s;
  };
  while (remaining.length > 0 && selected.length < count) {
    let best = 0;
    let bestVal = -Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i]!;
      let maxSim = 0;
      for (const s of selected) {
        maxSim = Math.max(maxSim, jaccard(tokensOf(cand), tokensOf(s)));
      }
      const val = lambda * cand.compatibilityScore - (1 - lambda) * maxSim;
      if (val > bestVal) {
        bestVal = val;
        best = i;
      }
    }
    selected.push(remaining.splice(best, 1)[0]!);
  }
  return selected;
}

/**
 * Âncora + expansão: top anchors por score viram âncoras; seus `top5_similares`
 * (ML offline) entram em seguida; resto por score. MMR fecha em 15 diversos.
 */
export function rankRecommendations(
  candidates: Perfume[],
  input: RecommendationInput,
): ScoredPerfume[] {
  const familyTerms = resolveFamilyTerms(input.familia);
  const scored = candidates.map((p) => scoreCandidate(p, input, familyTerms));
  const byScore = [...scored].sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  const above = byScore.filter((p) => p.compatibilityScore >= SCORE_THRESHOLD);
  const base = above.length >= ANCHOR_COUNT ? above : byScore;
  if (base.length === 0) return [];

  const anchors = base.slice(0, ANCHOR_COUNT);
  const anchorIds = new Set(anchors.map((a) => a.id));
  // Similares resolvem na lista completa: vizinho do ML entra mesmo abaixo
  // do threshold (sinal de similaridade, não de score).
  const byName = new Map(byScore.map((p) => [p.nome, p]));
  const expanded: ScoredPerfume[] = [...anchors];
  for (const anchor of anchors) {
    for (const name of anchor.top5_similares || []) {
      const match = byName.get(name);
      if (match && !anchorIds.has(match.id) && !expanded.includes(match)) {
        anchorIds.add(match.id);
        expanded.push(match);
      }
    }
  }
  for (const p of base) {
    if (!anchorIds.has(p.id)) {
      anchorIds.add(p.id);
      expanded.push(p);
    }
  }
  return mmrSelect(expanded, Math.min(MAX_RESULTS, FALLBACK_COUNT));
}
