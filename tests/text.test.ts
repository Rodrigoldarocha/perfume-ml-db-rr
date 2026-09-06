import { describe, expect, test } from "bun:test";
import { escapeLike, normalizePt } from "../src/lib/text";

describe("normalizePt", () => {
  test("remove acentos e baixa caixa", () => {
    expect(normalizePt("Cítrico")).toBe("citrico");
    expect(normalizePt("Fougère")).toBe("fougere");
    expect(normalizePt("ÂMBAR")).toBe("ambar");
  });

  test("apara espaços", () => {
    expect(normalizePt("  Floral  ")).toBe("floral");
  });

  test("string vazia permanece vazia", () => {
    expect(normalizePt("")).toBe("");
  });
});

describe("escapeLike", () => {
  test("escapa % _ e backslash", () => {
    expect(escapeLike("100%")).toBe("100\\%");
    expect(escapeLike("a_b")).toBe("a\\_b");
    expect(escapeLike("a\\b")).toBe("a\\\\b");
  });

  test("texto comum passa intacto", () => {
    expect(escapeLike("Chanel")).toBe("Chanel");
  });

  test("borda: curinga puro vira literal", () => {
    expect(escapeLike("%")).toBe("\\%");
  });
});
