import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "@/services/perfume.functions";
import { PerfumeCard } from "@/features/perfumes/components/PerfumeCard";
import { Layout } from "@/components/Layout";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recommendationSearchSchema } from "@/lib/quiz";
import { useState } from "react";

const searchSchema = recommendationSearchSchema;

export const Route = createFileRoute("/recomendacoes")({
  component: Recomendacoes,
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    title: "Suas Recomendações | ParfumSeg",
    meta: [
      { name: "description", content: "Perfumes selecionados a partir das suas respostas no quiz." },
      { property: "og:title", content: "ParfumSeg | Recomendações de Perfumes" },
      { property: "og:type", content: "website" }
    ]
  })
});

const formatCount = (n: number) => n.toLocaleString("pt-BR");

function Recomendacoes() {
  const search = Route.useSearch();
  const [visible, setVisible] = useState(12);
  const { data: recommendations, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["recommendations", search],
    queryFn: () => getRecommendations({ data: search }),
    retry: 1,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Calculando recomendações…</p>
        </div>
      </Layout>
    );
  }

  const count = recommendations?.length ?? 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6 pb-5 border-b">
          <div>
            <h1 className="text-2xl txt-display">Recomendações</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {count > 0
                ? `${formatCount(count)} ${count === 1 ? "perfume combina" : "perfumes combinam"} com o seu perfil`
                : "Seu perfil olfativo"}
            </p>
          </div>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Refazer o quiz
          </Link>
        </div>

        {recommendations && recommendations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {recommendations.slice(0, visible).map((perfume) => (
                <div key={perfume.id} className="relative group">
                  <PerfumeCard perfume={perfume} />
                  {perfume.recommendationReason && (
                    <div className="absolute top-2 right-2 z-10 max-w-[85%]">
                      <p className="bg-white/95 border rounded-md px-2 py-1 text-[11px] leading-snug text-foreground opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity pointer-events-none">
                        {perfume.recommendationReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {recommendations.length > visible && (
              <div className="mt-10 text-center">
                <Button variant="outline" onClick={() => setVisible((v) => v + 12)} className="px-6">
                  Carregar mais
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">
              {isError
                ? "Não foi possível carregar as recomendações."
                : "Nenhuma recomendação encontrada. Refaça o quiz para tentar de novo."}
            </p>
            {isError ? (
              <Button onClick={() => refetch()} disabled={isFetching} className="mt-6 px-6">
                {isFetching ? "Tentando novamente…" : "Tentar novamente"}
              </Button>
            ) : (
              <Button asChild className="mt-6 px-6">
                <Link to="/quiz">Refazer o quiz</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
