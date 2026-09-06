import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "@/services/perfume.functions";
import { PerfumeCard } from "@/features/perfumes/components/PerfumeCard";
import { Layout } from "@/components/Layout";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const searchSchema = z.object({
  genero: z.string().catch("Unissex"),
  familia: z.string().catch("Floral"),
  ocasiao: z.string().catch("Dia a dia"),
  intensidade: z.string().catch("Moderada"),
  nota: z.string().catch("Limão"),
});

export const Route = createFileRoute("/recomendacoes")({
  component: Recomendacoes,
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    title: "Suas Recomendações Personalizadas | ParfumSeg",
    meta: [
      { name: "description", content: "Confira as fragrâncias selecionadas pela nossa inteligência olfativa baseadas no seu perfil único." },
      { property: "og:title", content: "ParfumSeg | Recomendações Olfativas" },
      { property: "og:type", content: "website" }
    ]
  })
});

function Recomendacoes() {
  const search = Route.useSearch();
  const { data: recommendations, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["recommendations", search],
    queryFn: () => getRecommendations({ data: search }),
    retry: 1,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4 opacity-20" />
          <p className="text-muted-foreground font-serif uppercase tracking-widest text-xs">Calculando sua assinatura olfativa...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-primary/5 py-24 mb-12">
        <div className="container mx-auto px-4 text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-6 opacity-20" />
          <h1 className="text-4xl md:text-5xl font-serif mb-6 text-primary max-w-4xl mx-auto leading-tight uppercase tracking-wider">
            Sua Assinatura Olfativa
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Selecionamos fragrâncias que ressoam com seu gosto por <span className="text-primary font-medium">{search.familia}</span> e notas de <span className="text-primary font-medium">{search.nota}</span>.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-32">
        <div className="flex items-center justify-between mb-12 border-b border-primary/10 pb-4">
          <Link to="/quiz" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-3 h-3" /> Refazer Quiz
          </Link>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
            {recommendations?.length || 0} {recommendations?.length === 1 ? "Recomendação encontrada" : "Recomendações encontradas"}
          </h3>
        </div>

        {recommendations && recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {recommendations.map((perfume) => (
              <div key={perfume.id} className="relative group">
                <PerfumeCard perfume={perfume} />
                {perfume.recommendationReason && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-primary text-primary-foreground text-[8px] uppercase tracking-tighter px-2 py-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {perfume.recommendationReason}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-light text-xl">
              {isError ? "Ocorreu um erro ao carregar as recomendações." : "Não conseguimos encontrar recomendações exatas no momento."}
            </p>
            {isError ? (
              <Button onClick={() => refetch()} disabled={isFetching} className="mt-8 rounded-none uppercase tracking-widest text-xs">
                {isFetching ? "Tentando novamente..." : "Tentar novamente"}
              </Button>
            ) : (
              <Button asChild className="mt-8 rounded-none uppercase tracking-widest text-xs">
                <Link to="/quiz">Tentar novamente</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
