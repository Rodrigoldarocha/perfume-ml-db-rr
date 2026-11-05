import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { PerfumeCard } from "@/features/perfumes/components/PerfumeCard";
import { Input } from "@/components/ui/input";
import { getPerfumes, getSimilarPerfumes } from "@/services/perfume.functions";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/similares")({
  validateSearch: (s) => z.object({ ref: z.number().int().positive().optional().catch(undefined) }).parse(s),
  component: Similares,
  head: () => ({
    title: "Perfumes Parecidos | ParfumSeg",
    meta: [
      { name: "description", content: "Escolha um perfume que você já ama e descubra fragrâncias parecidas calculadas pela nossa inteligência olfativa." },
      { property: "og:title", content: "Perfumes Parecidos | ParfumSeg" },
      { property: "og:description", content: "Descubra fragrâncias semelhantes ao seu perfume favorito." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Similares() {
  const { ref } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term, 300);

  const busca = useQuery({
    queryKey: ["busca-similar", debounced],
    queryFn: () => getPerfumes({ data: { search: debounced, page: 1, pageSize: 8 } }),
    enabled: debounced.trim().length >= 2,
  });

  const similares = useQuery({
    queryKey: ["similares", ref],
    queryFn: () => getSimilarPerfumes({ data: ref! }),
    enabled: !!ref,
    staleTime: 60_000,
  });

  return (
    <Layout>
      <section className="bg-primary/5 py-20 mb-12">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 text-primary uppercase tracking-wider">Perfumes Parecidos</h1>
          <p className="text-muted-foreground font-light mb-8">Digite um perfume que você já ama e veja os mais parecidos.</p>
          <div className="relative text-left">
            <Input
              value={term}
              maxLength={100}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Ex.: Sauvage, La Vie Est Belle..."
              className="rounded-none h-12 bg-background"
              aria-label="Buscar perfume de referência"
            />
            {debounced.trim().length >= 2 && busca.data && (
              <ul className="absolute z-20 left-0 right-0 mt-1 bg-background border border-primary/10 shadow-sm">
                {busca.data.perfumes.length === 0 && (
                  <li className="p-3 text-sm text-muted-foreground">Nenhum perfume encontrado.</li>
                )}
                {busca.data.perfumes.map((p) => (
                  <li key={p.id}>
                    <button
                      className="w-full text-left p-3 text-sm hover:bg-primary/5"
                      onClick={() => {
                        setTerm("");
                        navigate({ search: { ref: p.id } });
                      }}
                    >
                      <span className="font-medium">{p.nome}</span>
                      <span className="text-muted-foreground"> — {p.marca}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-32">
        {similares.isLoading && (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary opacity-30" /></div>
        )}
        {similares.isError && <p className="text-center text-muted-foreground">Não foi possível carregar os parecidos.</p>}
        {similares.data && (
          <>
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-8 border-b border-primary/10 pb-4">
              Parecidos com <span className="text-primary font-medium">{similares.data.referencia.nome}</span> ({similares.data.similares.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {similares.data.similares.map((p) => <PerfumeCard key={p.id} perfume={p} />)}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
