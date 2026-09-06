import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { getPerfumes } from "@/services/perfume.functions";
import { PerfumeCard } from "@/features/perfumes/components/PerfumeCard";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Sparkles, MessageSquare, ShieldCheck, Mail, MapPin } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
 

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

const PAGE_SIZE = 20;

function Index() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
    queryKey: ["perfumes", { search: debouncedSearch }],
    queryFn: ({ pageParam = 1 }) =>
      getPerfumes({ data: { search: debouncedSearch, page: pageParam as number, pageSize: PAGE_SIZE } }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.perfumes.length < PAGE_SIZE ? undefined : allPages.length + 1,
    initialPageParam: 1,
  });
  const perfumes = data.pages.flatMap((p) => p.perfumes);
  const total = data.pages[0]?.total ?? 0;

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
            {total} {total === 1 ? "Fragrância encontrada" : "Fragrâncias encontradas"}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {perfumes.map((perfume) => (
            <PerfumeCard key={perfume.id} perfume={perfume} />
          ))}
        </div>

        {hasNextPage && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="rounded-none uppercase tracking-widest text-xs px-8 h-12"
            >
              {isFetchingNextPage ? "Carregando..." : `Carregar mais (${perfumes.length}/${total})`}
            </Button>
          </div>
        )}

        {perfumes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-light text-xl">Nenhum perfume encontrado para sua busca.</p>
            <Button variant="link" onClick={() => setSearch("")} className="mt-4 text-primary uppercase tracking-widest text-xs">
              Limpar busca
            </Button>
          </div>
        )}
      </div>

      <section className="bg-white py-24 border-y border-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif text-primary mb-12 text-center underline underline-offset-8 decoration-primary/20">
              Perguntas Frequentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-primary/10">
                  <AccordionTrigger className="text-left font-serif text-lg py-6 hover:no-underline hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-24 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-accent/20 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl mb-4 uppercase tracking-widest">Base de Dados Confiável</h3>
            <p className="text-sm text-muted-foreground font-light">Informações precisas de pirâmide olfativa e acordes, coletadas das maiores bases mundiais.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-accent/20 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl mb-4 uppercase tracking-widest">IA Recomendadora</h3>
            <p className="text-sm text-muted-foreground font-light">Nosso algoritmo proprietário encontra fragrâncias similares com base na composição química-olfativa.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-accent/20 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl mb-4 uppercase tracking-widest">Totalmente em Português</h3>
            <p className="text-sm text-muted-foreground font-light">Todas as notas, marcas e descrições traduzidas e revisadas para o nosso idioma.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
