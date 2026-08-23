import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPerfumes } from "@/services/perfume.functions";
import { PerfumeCard } from "@/features/perfumes/components/PerfumeCard";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Sparkles, MessageSquare, ShieldCheck, Mail, MapPin } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "ParfumSeg | O Maior Catálogo de Perfumes em Português",
    meta: [
      { name: "description", content: "Encontre seu perfume ideal no ParfumSeg. Catálogo com 24.000+ fragrâncias, notas olfativas detalhadas e recomendador inteligente baseado em IA." },
      { property: "og:title", content: "ParfumSeg | Descubra sua Próxima Fragrância" },
      { property: "og:description", content: "Explore 24.000+ perfumes com pirâmide olfativa completa e recomendações personalizadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ]
  })
});

const faqs = [
  {
    question: "Como funciona o recomendador de perfumes?",
    answer: "Nosso sistema utiliza um algoritmo de similaridade que analisa as notas olfativas (saída, coração e fundo) e os acordes principais de cada fragrância para encontrar perfumes com perfis sensoriais semelhantes ao seu gosto."
  },
  {
    question: "Os dados dos perfumes são atualizados?",
    answer: "Sim, baseamos nosso catálogo em dados consolidados da comunidade internacional de perfumaria, traduzidos e adaptados para o público brasileiro, abrangendo desde clássicos até os lançamentos mais recentes."
  },
  {
    question: "O que é a pirâmide olfativa?",
    answer: "É a estrutura de um perfume dividida em três partes: Notas de Saída (o que você sente logo ao aplicar), Notas de Coração (a alma do perfume, que dura algumas horas) e Notas de Fundo (a base que fixa na pele por mais tempo)."
  },
  {
    question: "Posso confiar nas recomendações?",
    answer: "As recomendações são baseadas em dados químicos e sensoriais. Embora o gosto seja subjetivo, nosso sistema ajuda a filtrar fragrâncias que compartilham o mesmo DNA olfativo dos seus perfumes favoritos."
  },
  {
    question: "Como encontro perfumes similares a um que já gosto?",
    answer: "Basta pesquisar pelo nome do perfume na barra de busca e, na página de detalhes, você encontrará a seção 'Fragrâncias Similares' com sugestões baseadas na composição."
  }
];

function Index() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data } = useSuspenseQuery({
    queryKey: ["perfumes", { search: debouncedSearch }],
    queryFn: () => getPerfumes({ data: { search: debouncedSearch, page: 1, pageSize: 20 } }),
  });

  return (
    <Layout>
      <section className="bg-primary/5 py-24 mb-12">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 uppercase tracking-[0.3em] font-light border-primary/20 text-primary">
            Sua Essência, Nossa Ciência
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif mb-6 text-primary max-w-4xl mx-auto leading-tight">
            Descubra a fragrância que conta a sua história
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light mb-10 leading-relaxed">
            Explore um catálogo curado com mais de 24.000 perfumes. Use nossa inteligência olfativa para encontrar seu próximo favorito.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="max-w-xl w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Qual perfume você procura?"
                maxLength={100}
                className="pl-12 h-14 bg-white border-none shadow-sm rounded-none text-lg font-light focus-visible:ring-1 focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button asChild className="h-14 px-8 rounded-none uppercase tracking-widest text-xs bg-primary hover:bg-primary/90">
              <Link to="/quiz">
                <Sparkles className="mr-2 w-4 h-4" /> Fazer Quiz Olfativo
              </Link>
            </Button>
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
