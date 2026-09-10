import { describe, expect, test } from "bun:test";
import type { Perfume } from "../src/types/perfume";
import {
  FALLBACK_COUNT,
  MAX_RESULTS,
  matchGenero,
  mmrSelect,
  rankRecommendations,
  resolveFamilyTerms,
  resolveGenero,
  scoreCandidate,
} from "../src/lib/recommendation";

function makePerfume(overrides: Partial<Perfume> = {}): Perfume {
  return {
    id: 1,
    nome: "Teste",
    marca: "Marca",
    pais_origem: null,
    genero: "masculino",
    avaliacao: 4.0,
    numero_avaliacoes: 100,
    ano_lancamento: null,
    notas_saida: [],
    notas_coracao: [],
    notas_fundo: [],
    acordes_principais: [],
    perfumista_1: null,
    perfumista_2: null,
    url_fonte: "https://example.com",
    cluster: null,
    cluster_perfil: null,
    top5_similares: [],
    imagem_url: null,
    ...overrides,
  };
}

describe("resolveGenero", () => {
  test("aceita valores válidos com case/acentos variados", () => {
    expect(resolveGenero("Masculino")).toBe("masculino");
    expect(resolveGenero("FEMININO")).toBe("feminino");
    expect(resolveGenero("Unissex")).toBe("unissex");
  });

  test("borda: inválido / vazio cai para unissex (nunca quebra enum)", () => {
    expect(resolveGenero("foo")).toBe("unissex");
    expect(resolveGenero("")).toBe("unissex");
    expect(resolveGenero("masculino'; DROP TABLE--")).toBe("unissex");
  });
});

describe("resolveFamilyTerms", () => {
  test("mapeia família para termos", () => {
    expect(resolveFamilyTerms("Cítrico")).toContain("citrico");
    expect(resolveFamilyTerms("Floral")).toContain("rosa");
  });

  test("borda: desconhecida retorna termo normalizado", () => {
    expect(resolveFamilyTerms("Gourmand")).toEqual(["gourmand"]);
  });
});

describe("matchGenero", () => {
  test("unissex aceita tudo", () => {
    expect(matchGenero("masculino", "unissex")).toBe(true);
    expect(matchGenero("feminino", "unissex")).toBe(true);
    expect(matchGenero("unissex", "unissex")).toBe(true);
  });

  test("específico inclui unissex mas exclui oposto", () => {
    expect(matchGenero("masculino", "masculino")).toBe(true);
    expect(matchGenero("unissex", "masculino")).toBe(true);
    expect(matchGenero("feminino", "masculino")).toBe(false);
  });
});

describe("scoreCandidate", () => {
  test("caminho feliz: família + nota + rating somam", () => {
    const p = makePerfume({
      acordes_principais: ["Floral"],
      notas_coracao: ["Rosa damascena"],
      avaliacao: 4.0,
    });
    const s = scoreCandidate(
      p,
      { genero: "feminino", familia: "Floral", ocasiao: "Trabalho", intensidade: "Moderada", nota: "rosa" },
      ["floral", "rosa"],
    );
    expect(s.compatibilityScore).toBeCloseTo(0.5 + 0.3 + 0.12, 5);
    expect(s.recommendationReason).toContain("Floral");
  });

  test("sinônimos: Rose casa com rosa, citrus com cítrico", () => {
    const p = makePerfume({
      acordes_principais: ["citrus"],
      notas_coracao: ["Rose"],
      avaliacao: 0,
    });
    const s = scoreCandidate(
      p,
      { genero: "unissex", familia: "Cítrico", ocasiao: "Trabalho", intensidade: "Moderada", nota: "rosa" },
      ["citrico"],
    );
    expect(s.compatibilityScore).toBeCloseTo(0.5 + 0.3 + 0.15, 5);
  });

  test("rating limitado a 0.15 mesmo com nota máxima", () => {
    const p = makePerfume({ avaliacao: 5.0 });
    const s = scoreCandidate(
      p,
      { genero: "unissex", familia: "Xyz", ocasiao: "Trabalho", intensidade: "Moderada", nota: "qqq" },
      ["xyz"],
    );
    expect(s.compatibilityScore).toBeCloseTo(0.15, 5);
  });

  test("nota curta (<3) não pontua", () => {
    const p = makePerfume({ notas_saida: ["a"], avaliacao: 0 });
    const s = scoreCandidate(
      p,
      { genero: "unissex", familia: "Xyz", ocasiao: "Trabalho", intensidade: "Moderada", nota: "a" },
      ["xyz"],
    );
    expect(s.compatibilityScore).toBe(0);
  });

  test("borda: arrays nulos e avaliacao nula não quebram", () => {
    const p = makePerfume({
      notas_saida: null as unknown as string[],
      notas_coracao: null as unknown as string[],
      notas_fundo: null as unknown as string[],
      acordes_principais: null as unknown as string[],
      avaliacao: null,
    });
    const s = scoreCandidate(
      p,
      { genero: "unissex", familia: "Floral", ocasiao: "Dia a dia", intensidade: "Moderada", nota: "rosa" },
      ["floral"],
    );
    expect(s.compatibilityScore).toBe(0);
    expect(s.recommendationReason).toContain("dia a dia");
  });
});

describe("rankRecommendations", () => {
  test("ordena desc e respeita teto MAX_RESULTS", () => {
    const list = Array.from({ length: 20 }, (_, i) =>
      makePerfume({
        id: i + 1,
        nome: `P${i + 1}`,
        acordes_principais: ["Floral"],
        avaliacao: 5,
      }),
    );
    const ranked = rankRecommendations(list, {
      genero: "unissex",
      familia: "Floral",
      ocasiao: "Trabalho",
      intensidade: "Moderada",
      nota: "rosa",
    });
    expect(ranked.length).toBeLessThanOrEqual(MAX_RESULTS);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1]!.compatibilityScore).toBeGreaterThanOrEqual(
        ranked[i]!.compatibilityScore,
      );
    }
  });

  test("teto: 30 candidatos retornam 15", () => {
    const list = Array.from({ length: 30 }, (_, i) =>
      makePerfume({
        id: i + 1,
        nome: `Q${i + 1}`,
        acordes_principais: ["Floral"],
        avaliacao: 5,
      }),
    );
    const ranked = rankRecommendations(list, {
      genero: "unissex",
      familia: "Floral",
      ocasiao: "Trabalho",
      intensidade: "Moderada",
      nota: "rosa",
    });
    expect(ranked.length).toBe(15);
  });

  test("recência: lançamento novo pontua mais que antigo, sem dominar gosto", () => {
    const base = {
      genero: "unissex",
      familia: "Xyz",
      ocasiao: "Trabalho",
      intensidade: "Moderada",
      nota: "qqq",
    } as const;
    const atual = scoreCandidate(
      makePerfume({ ano_lancamento: new Date().getFullYear(), avaliacao: 0 }),
      base,
      ["xyz"],
    );
    const antigo = scoreCandidate(
      makePerfume({ ano_lancamento: 2000, avaliacao: 0 }),
      base,
      ["xyz"],
    );
    expect(atual.compatibilityScore).toBeGreaterThan(antigo.compatibilityScore);
    expect(antigo.compatibilityScore).toBe(0);
    // Teto: nunca passa de RECENCY_MAX (0.1) — gosto manda, recência desempata.
    expect(atual.compatibilityScore).toBeLessThanOrEqual(0.1);
    expect(atual.recommendationReason).toContain("Lançamento recente");
  });

  test("cluster dominante das âncoras dá bônus aos candidatos do mesmo cluster", () => {
    const anchors = [1, 2, 3].map((id) =>
      makePerfume({
        id,
        nome: `A${id}`,
        acordes_principais: ["Floral"],
        avaliacao: 5,
        cluster: 7,
      }),
    );
    const mesmoCluster = makePerfume({
      id: 9,
      nome: "Mesmo",
      acordes_principais: ["Floral"],
      avaliacao: 4.0,
      cluster: 7,
    });
    const outroCluster = makePerfume({
      id: 10,
      nome: "Outro",
      acordes_principais: ["Floral"],
      avaliacao: 4.0,
      cluster: 3,
    });
    const ranked = rankRecommendations([...anchors, outroCluster, mesmoCluster], {
      genero: "unissex",
      familia: "Floral",
      ocasiao: "Trabalho",
      intensidade: "Moderada",
      nota: "qqq",
    });
    const m = ranked.find((p) => p.nome === "Mesmo")!;
    const o = ranked.find((p) => p.nome === "Outro")!;
    expect(m.compatibilityScore).toBeCloseTo(o.compatibilityScore + 0.06, 5);
  });

  test("ocasião e intensidade somam no score", () => {
    const base = {
      genero: "unissex",
      familia: "Xyz",
      nota: "qqq",
    } as const;
    const neutro = scoreCandidate(
      makePerfume({ acordes_principais: ["Oriental"], avaliacao: 0 }),
      { ...base, ocasiao: "Trabalho", intensidade: "Moderada" },
      ["xyz"],
    );
    const alinhado = scoreCandidate(
      makePerfume({ acordes_principais: ["Oriental"], avaliacao: 0 }),
      { ...base, ocasiao: "Noite/Festas", intensidade: "Intensa/Marcante" },
      ["xyz"],
    );
    expect(alinhado.compatibilityScore).toBeGreaterThan(neutro.compatibilityScore);
    expect(alinhado.recommendationReason).toContain("noite/festas");
  });

  test("fallback: poucos acima do threshold retorna top15", () => {
    const list = [
      makePerfume({ id: 1, avaliacao: 0 }),
      makePerfume({ id: 2, avaliacao: 0 }),
    ];
    const ranked = rankRecommendations(list, {
      genero: "unissex",
      familia: "Xyz",
      ocasiao: "Trabalho",
      intensidade: "Moderada",
      nota: "qqq",
    });
    expect(ranked.length).toBeLessThanOrEqual(FALLBACK_COUNT);
    expect(ranked.length).toBe(2);
  });

  test("borda: lista vazia retorna vazio", () => {
    expect(
      rankRecommendations([], {
        genero: "unissex",
        familia: "Floral",
        ocasiao: "Trabalho",
        intensidade: "Moderada",
        nota: "rosa",
      }),
    ).toEqual([]);
  });

  test("expansão: similar do ML entra mesmo com score baixo", () => {
    const ancora = makePerfume({
      id: 1,
      nome: "Ancora",
      acordes_principais: ["Floral"],
      avaliacao: 5,
      top5_similares: ["Alvo"],
    });
    const fillers = Array.from({ length: 5 }, (_, i) =>
      makePerfume({
        id: 10 + i,
        nome: `F${i}`,
        acordes_principais: ["Floral"],
        avaliacao: 4.9,
      }),
    );
    const alvo = makePerfume({
      id: 99,
      nome: "Alvo",
      acordes_principais: ["Xyz"],
      avaliacao: 0,
    });
    const ranked = rankRecommendations([ancora, ...fillers, alvo], {
      genero: "unissex",
      familia: "Floral",
      ocasiao: "Trabalho",
      intensidade: "Moderada",
      nota: "qqq",
    });
    expect(ranked.map((p) => p.nome)).toContain("Alvo");
  });

  test("MMR: diferente com score menor passa clone idêntico", () => {
    const scored = [1, 2, 3].map((id) => ({
      ...makePerfume({
        id,
        acordes_principais: [id === 3 ? "Amadeirado" : "Floral"],
      }),
      compatibilityScore: id === 1 ? 1.0 : id === 2 ? 0.95 : 0.9,
      recommendationReason: "x",
    }));
    const out = mmrSelect(scored, 3);
    expect(out.map((p) => p.id)).toEqual([1, 3, 2]);
  });
});
