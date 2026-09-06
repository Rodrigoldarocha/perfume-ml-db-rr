import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Perfume } from "@/types/perfume";

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export const getPerfumes = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        search: z.string().trim().max(100).optional(),
        marca: z.string().trim().max(100).optional(),
        genero: z.enum(["masculino", "feminino", "unissex"]).optional(),
        acordo: z.string().trim().max(100).optional(),
        minAvaliacao: z.number().min(0).max(5).optional(),
        page: z.number().int().min(1).max(1000).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    let query = supabase.from("perfumes").select("*", { count: "exact" });

    if (data.search) {
      query = query.ilike("nome", `%${escapeLike(data.search)}%`);
    }
    if (data.marca) {
      query = query.eq("marca", data.marca);
    }
    if (data.genero) {
      query = query.eq("genero", data.genero as any);
    }
    if (data.acordo) {
      query = query.contains("acordes_principais", [data.acordo]);
    }
    if (data.minAvaliacao) {
      query = query.gte("avaliacao", data.minAvaliacao);
    }

    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    const { data: perfumes, count, error } = await query
      .order("avaliacao", { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    return {
      perfumes: perfumes as Perfume[],
      total: count || 0,
      page: data.page,
      pageSize: data.pageSize,
    };
  });

export const getPerfumeById = createServerFn({ method: "GET" })
  .inputValidator((id) => z.string().regex(/^\d+$/).parse(id))
  .handler(async ({ data: id }) => {
    const numericId = Number.parseInt(id, 10);
    if (!Number.isSafeInteger(numericId) || numericId < 1) {
      throw new Error("Perfume não encontrado");
    }
    const { data, error } = await supabase
      .from("perfumes")
      .select("*")
      .eq("id", numericId)
      .single();

    if (error) throw new Error(error.message);
    return data as Perfume;
  });

export const getDistinctMarcas = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabase
      .from("perfumes")
      .select("marca")
      .order("marca")
      .limit(5000);

    if (error) throw new Error(error.message);
    
    const marcas = Array.from(new Set(data.map(p => p.marca)));
    return marcas;
  }
);

export const getRecommendations = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      genero: z.string().trim().min(1).max(50),
      familia: z.string().trim().min(1).max(50),
      ocasiao: z.string().trim().min(1).max(50),
      intensidade: z.string().trim().min(1).max(50),
      nota: z.string().trim().min(1).max(50),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const normalize = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    // Allowlist: evita valor inválido chegar ao enum do banco (causa raiz do
    // "Ocorreu um erro ao carregar as recomendações" com URL manipulada).
    const GENEROS = ["masculino", "feminino", "unissex"] as const;
    const rawGenero = normalize(data.genero);
    const targetGenero: (typeof GENEROS)[number] = (
      GENEROS as readonly string[]
    ).includes(rawGenero)
      ? (rawGenero as (typeof GENEROS)[number])
      : "unissex";
    // 1. Geração de Candidatos
    // unissex = aberto a tudo, sem filtro gênero. Específico = inclui unissex.
    let query = supabase.from("perfumes").select("*");

    if (targetGenero !== "unissex") {
      query = query.in("genero", [targetGenero, "unissex"]);
    }

    const { data: candidates, error } = await query
      .order("avaliacao", { ascending: false, nullsFirst: false })
      .order("numero_avaliacoes", { ascending: false, nullsFirst: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    
    if (!candidates || candidates.length === 0) {
      return [];
    }

    // 2. Filtros e Scores
    const targetFamilia = normalize(data.familia);
    const targetNota = normalize(data.nota);

    const mapping: Record<string, string[]> = {
      citrico: ["citrico", "aromatico", "aquatico", "fresco"],
      floral: ["floral", "rosa", "flores brancas", "iris", "violeta"],
      amadeirado: ["amadeirado", "terroso", "musgo", "patchouli"],
      oriental: ["oriental", "baunilha", "doce", "especiado", "ambar"],
      fougere: ["lavanda", "aromatico", "verde", "musgo"],
    };
    const familyTerms = mapping[targetFamilia] || [targetFamilia];

    const scoredPerfumes = candidates.map((perfume) => {
      let score = 0;
      const motivos: string[] = [];

      const acordes = (perfume.acordes_principais || []).map((a) => normalize(a));
      if (acordes.some((a) => familyTerms.includes(a))) {
        score += 0.5;
        motivos.push(`Alta afinidade com a família olfativa ${data.familia}`);
      }

      const todasNotas = [
        ...(perfume.notas_saida || []),
        ...(perfume.notas_coracao || []),
        ...(perfume.notas_fundo || []),
      ].map((n) => normalize(n));

      if (targetNota.length >= 3 && todasNotas.some((n) => n.includes(targetNota))) {
        score += 0.3;
        motivos.push(`Contém notas de ${data.nota} que você aprecia`);
      }

      // Recompensa popularidade/avaliação
      score += (perfume.avaliacao || 0) / 10;

      return {
        ...perfume,
        compatibilityScore: score,
        recommendationReason: motivos.length > 0 ? motivos[0] : `Ideal para ${data.ocasiao.toLowerCase()}`
      };
    });

    // 3. Ordenação e Fallback
    const threshold = 0.3;
    let finalResults = scoredPerfumes
      .filter(p => p.compatibilityScore >= threshold)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    if (finalResults.length < 3) {
      finalResults = scoredPerfumes
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 8);
    }

    return finalResults.slice(0, 12) as (Perfume & { compatibilityScore: number; recommendationReason: string })[];
  });

export const getPerfumesByNames = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ names: z.array(z.string().trim().min(1).max(200)).min(1).max(20) }).parse(data)
  )
  .handler(async ({ data }) => {
    const { data: perfumes, error } = await supabase
      .from("perfumes")
      .select("id,nome,marca,imagem_url,genero,avaliacao")
      .in("nome", data.names)
      .limit(20);

    if (error) throw new Error(error.message);
    return (perfumes ?? []) as Pick<Perfume, "id" | "nome" | "marca" | "imagem_url" | "genero" | "avaliacao">[];
  });
