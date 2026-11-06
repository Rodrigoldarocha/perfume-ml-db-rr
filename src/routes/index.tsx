import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getDistinctMarcas, getPerfumes } from "@/services/perfume.functions";
import { PerfumeCard } from "@/features/perfumes/components/PerfumeCard";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/data/faqs";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "ParfumSeg | O Maior Catálogo de Perfumes em Português",
    meta: [
      { name: "description", content: "Catálogo com mais de 24.000 fragrâncias em português, notas olfativas detalhadas e um recomendador baseado nas suas preferências." },
      { property: "og:title", content: "ParfumSeg | Catálogo de Perfumes" },
      { property: "og:description", content: "Mais de 24.000 perfumes com pirâmide olfativa completa e recomendações personalizadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ]
  })
});

const faqs = FAQS;

const PAGE_SIZE = 20;

const GENEROS = [
  { value: "", label: "Todos" },
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "unissex", label: "Unissex" },
] as const;

const formatCount = (n: number) => n.toLocaleString("pt-BR");

function Index() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [marca, setMarca] = useState("");
  const [genero, setGenero] = useState("");
  const [acordo, setAcordo] = useState("");
  const debouncedAcordo = useDebounce(acordo, 500);

  const filters = {
    search: debouncedSearch || undefined,
    marca: marca || undefined,
    genero: (genero || undefined) as "masculino" | "feminino" | "unissex" | undefined,
    acordo: debouncedAcordo.trim() || undefined,
  };
  const hasActiveFilters = Boolean(marca || genero || debouncedAcordo.trim() || debouncedSearch.trim());

  const { data: marcas } = useSuspenseQuery({
    queryKey: ["marcas"],
    queryFn: () => getDistinctMarcas(),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
    queryKey: ["perfumes", filters],
    queryFn: ({ pageParam = 1 }) =>
      getPerfumes({ data: { ...filters, page: pageParam as number, pageSize: PAGE_SIZE } }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.perfumes.length < PAGE_SIZE ? undefined : allPages.length + 1,
    initialPageParam: 1,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
  const perfumes = data.pages.flatMap((p) => p.perfumes);
  const total = data.pages[0]?.total ?? 0;

  const clearFilters = () => {
    setSearch("");
    setMarca("");
    setGenero("");
    setAcordo("");
  };

  const searchField = (
    <div className="relative group w-full">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Buscar perfume, marca ou acorde"
        aria-label="Buscar no catálogo"
        maxLength={100}
        className="pl-9 h-10 bg-white rounded-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );

  return (
    <Layout headerSearch={searchField}>
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside
            aria-label="Filtros do catálogo"
            className="lg:w-52 shrink-0 lg:sticky lg:top-24 lg:self-start"
          >
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-sm font-semibold mb-2">Gênero</h2>
                <ul className="flex flex-row lg:flex-col flex-wrap gap-x-1 gap-y-0.5">
                  {GENEROS.map(({ value, label }) => {
                    const pressed = genero === value;
                    return (
                      <li key={value || "all"}>
                        <button
                          type="button"
                          aria-pressed={pressed}
                          onClick={() => setGenero(value)}
                          className={`min-h-[40px] w-full rounded-md px-3 text-left text-sm transition-colors ${
                            pressed
                              ? "bg-white font-semibold text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/70"
                          }`}
                        >
                          {label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <label htmlFor="filtro-marca" className="block text-sm font-semibold mb-2">
                  Marca
                </label>
                <select
                  id="filtro-marca"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="w-full min-h-[40px] bg-white border rounded-md px-3 text-sm text-foreground"
                >
                  <option value="">Todas</option>
                  {marcas.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filtro-acorde" className="block text-sm font-semibold mb-2">
                  Acorde
                </label>
                <Input
                  id="filtro-acorde"
                  type="text"
                  value={acordo}
                  onChange={(e) => setAcordo(e.target.value)}
                  placeholder="Ex.: baunilha"
                  maxLength={100}
                  className="min-h-[40px] bg-white rounded-md text-sm"
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-[40px] text-sm text-primary hover:underline self-start"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-4">
              {hasActiveFilters
                ? `${formatCount(total)} ${total === 1 ? "encontrado" : "encontrados"}`
                : `${formatCount(total)} no catálogo`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {perfumes.map((perfume) => (
                <PerfumeCard key={perfume.id} perfume={perfume} />
              ))}
            </div>

            {perfumes.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">
                  Nenhum perfume encontrado. Tente outro filtro.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 min-h-[44px] text-sm font-medium text-primary hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            {hasNextPage && perfumes.length > 0 && (
              <div className="mt-10 text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6"
                >
                  {isFetchingNextPage
                    ? "Carregando…"
                    : `Carregar mais (${formatCount(perfumes.length)}/${formatCount(total)})`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="border-t bg-white py-14" aria-labelledby="faq-titulo">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 id="faq-titulo" className="txt-display text-2xl mb-8">
              Perguntas frequentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium py-5 hover:no-underline hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>
  );
}
