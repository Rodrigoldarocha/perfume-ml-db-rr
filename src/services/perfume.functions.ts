import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Perfume } from "@/types/perfume";
import { escapeLike } from "@/lib/text";
import {
  rankRecommendations,
  rankSimilar,
  RECENT_YEAR,
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
    // Select enxuto: cards usam só id/nome/marca/genero/avaliacao/acordes/imagem.
    // Pirâmide completa vem de getPerfumeById / getRecommendations.
    let query = supabase
      .from("perfumes")
      .select("id,nome,marca,genero,avaliacao,acordes_principais,imagem_url,ano_lancamento", {
        count: "exact",
      });

    if (data.search) {
      query = query.ilike("nome", `%${escapeLike(data.search)}%`);
    }
    if (data.marca) {
      query = query.eq("marca", data.marca);
    }
    if (data.genero) {
      query = query.eq("genero", data.genero);
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
      .order("avaliacao", { ascending: false, nullsFirst: false })
      .order("id", { ascending: true })
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

const CANDIDATE_COLS =
  "id,nome,marca,genero,avaliacao,numero_avaliacoes,ano_lancamento,notas_saida,notas_coracao,notas_fundo,acordes_principais,cluster,cluster_perfil,top5_similares,imagem_url,url_fonte,pais_origem,perfumista_1,perfumista_2";

/** Perfumes parecidos com um de referência (item-to-item). */
export const getSimilarPerfumes = createServerFn({ method: "GET" })
  .inputValidator((id) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }) => {
    const { data: ref, error } = await supabase
      .from("perfumes").select(CANDIDATE_COLS).eq("id", id).single();
    if (error || !ref) throw new Error("Perfume não encontrado");
    const r = ref as unknown as Perfume;
    const queries = [
      r.top5_similares?.length
        ? supabase.from("perfumes").select(CANDIDATE_COLS).in("nome", r.top5_similares).limit(20)
        : null,
      r.cluster != null
        ? supabase.from("perfumes").select(CANDIDATE_COLS).eq("cluster", r.cluster)
            .order("numero_avaliacoes", { ascending: false, nullsFirst: false }).limit(1000)
        : supabase.from("perfumes").select(CANDIDATE_COLS)
            .order("numero_avaliacoes", { ascending: false, nullsFirst: false }).limit(1000),
    ];
    const res = await Promise.all(queries.map((q) => q ?? Promise.resolve({ data: [], error: null })));
    const pool = new Map<number, Perfume>();
    for (const x of res) for (const p of (x.data ?? []) as unknown as Perfume[]) pool.set(p.id, p);
    return { referencia: r, similares: rankSimilar(r, [...pool.values()], 24) };
  });

export const getRecommendations = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      genero: z.string().trim().min(1).max(50),
      familia: z.string().trim().min(1).max(50),
      ocasiao: z.string().trim().min(1).max(50),
      intensidade: z.string().trim().min(1).max(50),
      nota: z.string().trim().min(1).max(200),
      epoca: z.string().trim().max(50).optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    // Gênero validado por allowlist (unissex = sem filtro; específico + unissex).
    const targetGenero = resolveGenero(data.genero);
    // Pool ampliado: 3 páginas de 1000 (limite por requisição) em paralelo.
    const page = (from: number) => {
      let q = supabase.from("perfumes").select(CANDIDATE_COLS);
      if (targetGenero !== "unissex") q = q.in("genero", [targetGenero, "unissex"]);
      return q
        .order("numero_avaliacoes", { ascending: false, nullsFirst: false })
        .order("id", { ascending: true })
        .range(from, from + 999);
    };
    // Lançamentos têm poucas avaliações: página dedicada garante que entrem no pool.
    let recentQ = supabase.from("perfumes").select(CANDIDATE_COLS).gte("ano_lancamento", RECENT_YEAR);
    if (targetGenero !== "unissex") recentQ = recentQ.in("genero", [targetGenero, "unissex"]);
    const recentPage = recentQ
      .order("numero_avaliacoes", { ascending: false, nullsFirst: false })
      .order("id", { ascending: true })
      .range(0, 999);
    const pages = await Promise.all([...[0, 1000, 2000].map(page), recentPage]);
    const err = pages.find((r) => r.error)?.error;
    if (err) throw new Error(err.message);
    const byId = new Map<number, Perfume>();
    for (const r of pages) for (const p of (r.data ?? []) as unknown as Perfume[]) byId.set(p.id, p);
    const candidates = [...byId.values()];

    if (!candidates || candidates.length === 0) {
      return [];
    }

    return rankRecommendations(candidates as Perfume[], {
      genero: targetGenero,
      familia: data.familia,
      ocasiao: data.ocasiao,
      intensidade: data.intensidade,
      nota: data.nota,
      epoca: data.epoca,
    }).slice(0, 36) as ScoredPerfume[];
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
