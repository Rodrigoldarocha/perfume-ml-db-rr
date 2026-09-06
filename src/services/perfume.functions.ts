import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Perfume } from "@/types/perfume";
import { escapeLike } from "@/lib/text";
import {
  rankRecommendations,
  resolveGenero,
  type ScoredPerfume,
} from "@/lib/recommendation";

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
    // Gênero validado por allowlist (unissex = sem filtro; específico + unissex).
    const targetGenero = resolveGenero(data.genero);
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

    return rankRecommendations(candidates as Perfume[], {
      genero: targetGenero,
      familia: data.familia,
      ocasiao: data.ocasiao,
      nota: data.nota,
    }).slice(0, 12) as ScoredPerfume[];
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
