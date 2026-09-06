import { describe, expect, test } from "bun:test";
import {
  QUIZ_DEFAULTS,
  QUIZ_STEPS,
  answersToSearch,
  recommendationSearchSchema,
} from "../src/lib/quiz";

describe("quiz constants", () => {
  test("5 passos cobrem fluxo", () => {
    expect(QUIZ_STEPS).toHaveLength(5);
    for (const step of QUIZ_STEPS) {
      expect(step.options.length).toBeGreaterThan(0);
    }
  });
});

describe("answersToSearch", () => {
  test("respostas completas mapeiam por índice", () => {
    expect(
      answersToSearch(["Masculino", "Floral", "Trabalho", "Suave", "Rosa"]),
    ).toEqual({
      genero: "Masculino",
      familia: "Floral",
      ocasiao: "Trabalho",
      intensidade: "Suave",
      nota: "Rosa",
    });
  });

  test("borda: array vazio usa todos defaults", () => {
    expect(answersToSearch([])).toEqual({ ...QUIZ_DEFAULTS });
  });

  test("borda: parcial completa resto com defaults", () => {
    expect(answersToSearch(["Feminino"])).toEqual({
      ...QUIZ_DEFAULTS,
      genero: "Feminino",
    });
  });
});

describe("recommendationSearchSchema", () => {
  test("objeto vazio cai nos defaults (URL direta)", () => {
    expect(recommendationSearchSchema.parse({})).toEqual({ ...QUIZ_DEFAULTS });
  });

  test("valores válidos passam intactos", () => {
    const input = {
      genero: "Masculino",
      familia: "Oriental",
      ocasiao: "Noite/Festas",
      intensidade: "Intensa/Marcante",
      nota: "Baunilha",
    };
    expect(recommendationSearchSchema.parse(input)).toEqual(input);
  });

  test("borda: tipos errados caem no default via catch", () => {
    const parsed = recommendationSearchSchema.parse({
      genero: 123,
      familia: ["x"],
    });
    expect(parsed.genero).toBe(QUIZ_DEFAULTS.genero);
    expect(parsed.familia).toBe(QUIZ_DEFAULTS.familia);
  });
});
