import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPerfumes } from "@/services/perfume.functions";
import { PerfumeCard } from "@/features/perfumes/components/PerfumeCard";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "ParfumSeg | Catálogo e Recomendador de Perfumes",
    meta: [
      { name: "description", content: "Explore mais de 24 mil fragrâncias traduzidas. Encontre o perfume perfeito com nosso recomendador." },
      { property: "og:title", content: "ParfumSeg | O Catálogo de Perfumes" },
      { property: "og:description", content: "Explore o mundo da perfumaria em português." },
      { name: "twitter:card", content: "summary_large_image" }
    ]
  })
});

function Index() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data } = useSuspenseQuery({
    queryKey: ["perfumes", { search: debouncedSearch }],
    queryFn: () => getPerfumes({ search: debouncedSearch }),
  });

  return (
    <Layout>
      <section className="bg-primary/5 py-20 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6 text-primary">Descubra sua próxima fragrância</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light mb-10">
            Explore um catálogo com mais de 24.000 perfumes, traduzidos e detalhados para sua melhor experiência olfativa.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar perfume ou marca..."
              className="pl-12 h-14 bg-white border-none shadow-sm rounded-none text-lg font-light focus-visible:ring-1 focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8 border-b border-primary/10 pb-4">
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium">
            {data.total} Fragrâncias encontradas
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {data.perfumes.map((perfume) => (
            <PerfumeCard key={perfume.id} perfume={perfume} />
          ))}
        </div>

        {data.perfumes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-light">Nenhum perfume encontrado para sua busca.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
