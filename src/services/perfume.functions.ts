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
    console.log("\nRECOMMENDER DEBUG");
    console.log("-----------------");

    // 1. Geração de Candidatos (Base Completa)
    const { count: totalAvailable } = await supabase.from("perfumes").select("*", { count: 'exact', head: true });
    console.log(`Available fragrances: ${totalAvailable}`);

    // Filtro por Gênero
    let query = supabase.from("perfumes").select("*");
    const targetGenero = data.genero.toLowerCase();
    
    if (targetGenero !== 'unissex') {
      query = query.in("genero", [targetGenero, 'unissex']);
    } else {
      query = query.eq("genero", 'unissex');
    }

    const { data: candidates, error } = await query;
    if (error) throw new Error(error.message);
    
    console.log(`Initial candidates (after gender): ${candidates?.length || 0}`);

    // 2. Filtros e Scores
    const scoredPerfumes = (candidates || []).map(perfume => {
      let score = 0;
      const motivos: string[] = [];

      const acordes = (perfume.acordes_principais || []).map(a => a.toLowerCase());
      if (acordes.includes(data.familia.toLowerCase())) {
        score += 0.4;
        motivos.push(`Alta afinidade com a família ${data.familia}`);
      }

      const todasNotas = [
        ...(perfume.notas_saida || []),
        ...(perfume.notas_coracao || []),
        ...(perfume.notas_fundo || [])
      ].map(n => n.toLowerCase());

      if (todasNotas.includes(data.nota.toLowerCase())) {
        score += 0.3;
        motivos.push(`Contém notas de ${data.nota} que você aprecia`);
      }

      const acordesPesados = ['amadeirado', 'especiado', 'oriental', 'âmbar', 'couro'];
      const acordesLeves = ['cítrico', 'aquático', 'verde', 'aromático'];
      
      const hasPesados = acordes.some(a => acordesPesados.includes(a));
      const hasLeves = acordes.some(a => acordesLeves.includes(a));

      if (data.intensidade === "Intensa/Marcante" && hasPesados) score += 0.2;
      if (data.intensidade === "Suave" && hasLeves) score += 0.2;
      if (data.intensidade === "Moderada") score += 0.1;

      score += (perfume.avaliacao || 0) / 10;

      return {
        ...(perfume as any),
        genero: perfume.genero as any, // Cast para evitar erro de TS se necessário, mas aqui perfume.genero já é do tipo correto da tabela
        compatibilityScore: Math.min(score, 1.0),
        recommendationReason: motivos.length > 0 ? motivos[0] : `Uma excelente escolha para ${data.ocasiao.toLowerCase()}`
      };
    });

    // 3. Ordenação e Threshold
    const threshold = 0.5;
    let finalResults = scoredPerfumes
      .filter(p => p.compatibilityScore >= threshold)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    console.log(`After profile filters & threshold (${threshold}): ${finalResults.length}`);

    if (finalResults.length < 3) {
      console.log("Fallback triggered: returning top results...");
      finalResults = scoredPerfumes
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 5);
    }

    const scores = finalResults.map(p => p.compatibilityScore);
    console.log(`Min score: ${scores.length > 0 ? Math.min(...scores).toFixed(2) : 0}`);
    console.log(`Max score: ${scores.length > 0 ? Math.max(...scores).toFixed(2) : 0}`);
    console.log(`Final recommendations: ${finalResults.length}`);
    console.log("-----------------\n");

    return finalResults.slice(0, 10) as (Perfume & { compatibilityScore: number; recommendationReason: string })[];
  });


