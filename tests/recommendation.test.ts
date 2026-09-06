import { describe, expect, test } from "bun:test";
import type { Perfume } from "../src/types/perfume";
import {
  FALLBACK_COUNT,
  MAX_RESULTS,
  matchGenero,
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
    ano_lancamento: 2020,
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
    expect(s.compatibilityScore).toBeCloseTo(0.5 + 0.3 + 0.4, 5);
    expect(s.recommendationReason).toContain("Floral");
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
});
