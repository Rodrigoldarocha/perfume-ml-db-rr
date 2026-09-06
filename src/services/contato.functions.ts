import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const contatoSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(100),
  mensagem: z.string().trim().min(10).max(2000),
});

/** Persiste mensagem de contato (RLS: insert anônimo liberado). */
export const createContato = createServerFn({ method: "POST" })
  .inputValidator((data) => contatoSchema.parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase.from("contato_mensagens").insert({
      nome: data.nome,
      email: data.email,
      mensagem: data.mensagem,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
