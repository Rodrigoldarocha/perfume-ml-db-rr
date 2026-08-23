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
  .inputValidator((id) => z.number().parse(id))
  .handler(async ({ data: id }) => {
    const { data, error } = await supabase
      .from("perfumes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data as Perfume;
  });

export const getDistinctMarcas = createServerFn({ method: "GET" }).handler(
  async () => {
    // We'll just fetch a few for now or all distinct brands
    // In a real app we might want a separate table or a more optimized way
    const { data, error } = await supabase
      .from("perfumes")
      .select("marca")
      .order("marca");

    if (error) throw new Error(error.message);
    
    // Unique brands
    const marcas = Array.from(new Set(data.map(p => p.marca)));
    return marcas;
  }
);
