import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Perfume } from "@/types/perfume";

export const getPerfumes = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        search: z.string().optional(),
        marca: z.string().optional(),
        genero: z.string().optional(),
        acordo: z.string().optional(),
        minAvaliacao: z.number().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    let query = supabase.from("perfumes").select("*", { count: "exact" });

    if (data.search) {
      query = query.ilike("nome", `%${data.search}%`);
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
  .inputValidator((id) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    const { data, error } = await supabase
      .from("perfumes")
      .select("*")
      .eq("id", parseInt(id))
      .single();

    if (error) throw new Error(error.message);
    return data as Perfume;
  });

export const getDistinctMarcas = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabase
      .from("perfumes")
      .select("marca")
      .order("marca");

    if (error) throw new Error(error.message);
    
    const marcas = Array.from(new Set(data.map(p => p.marca)));
    return marcas;
  }
);

export const getRecommendations = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      genero: z.string(),
      familia: z.string(),
      ocasiao: z.string(),
      intensidade: z.string(),
      nota: z.string(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    // 1. Geração de Candidatos
    const targetGenero = data.genero.toLowerCase();
    let query = supabase.from("perfumes").select("*");
    
    if (targetGenero !== 'unissex') {
      query = query.in("genero", [targetGenero as any, 'unissex']);
    } else {
      query = query.eq("genero", 'unissex');
    }

    const { data: candidates, error } = await query.limit(1000);
    if (error) throw new Error(error.message);
    
    if (!candidates || candidates.length === 0) {
      return [];
    }

    // 2. Filtros e Scores
    const targetFamilia = data.familia.toLowerCase();
    const targetNota = data.nota.toLowerCase();
    
    const mapping: Record<string, string[]> = {
      'cítrico': ['cítrico', 'aromático', 'aquático', 'fresco'],
      'floral': ['floral', 'rosa', 'flores brancas', 'íris', 'violeta'],
      'amadeirado': ['amadeirado', 'terroso', 'musgo', 'patchouli'],
      'oriental': ['oriental', 'baunilha', 'doce', 'especiado', 'âmbar'],
      'fougere': ['lavanda', 'aromático', 'verde', 'musgo']
    };
    const familyTerms = mapping[targetFamilia] || [targetFamilia];

    const scoredPerfumes = candidates.map(perfume => {
      let score = 0;
      const motivos: string[] = [];

      const acordes = (perfume.acordes_principais || []).map(a => a.toLowerCase());
      if (acordes.some(a => familyTerms.includes(a))) {
        score += 0.5;
        motivos.push(`Alta afinidade com a família olfativa ${data.familia}`);
      }

      const todasNotas = [
        ...(perfume.notas_saida || []),
        ...(perfume.notas_coracao || []),
        ...(perfume.notas_fundo || [])
      ].map(n => n.toLowerCase());

      if (todasNotas.some(n => n.includes(targetNota) || targetNota.includes(n))) {
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
