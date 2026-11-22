import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getDistinctMarcas, getPerfumes } from "@/services/perfume.functions";
import { PerfumeCard } from "@/features/perfumes/components/PerfumeCard";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { useState } from "react";
import { ChevronDown, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FAQS } from "@/data/faqs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "ParfumSeg | O Maior Catálogo de Perfumes em Português",
    meta: [
      {
        name: "description",
        content:
          "Catálogo com mais de 24.000 fragrâncias em português, notas olfativas detalhadas e um recomendador baseado nas suas preferências.",
      },
      { property: "og:title", content: "ParfumSeg | Catálogo de Perfumes" },
      {
        property: "og:description",
        content:
          "Mais de 24.000 perfumes com pirâmide olfativa completa e recomendações personalizadas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
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

interface PainelFiltrosProps {
  marcas: string[];
  genero: string;
  setGenero: (v: string) => void;
  marca: string;
  setMarca: (v: string) => void;
  acordo: string;
  setAcordo: (v: string) => void;
  minAvaliacao: number;
  setMinAvaliacao: (v: number) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

function PainelFiltros({
  marcas,
  genero,
  setGenero,
  marca,
  setMarca,
  acordo,
  setAcordo,
  minAvaliacao,
  setMinAvaliacao,
  hasActiveFilters,
  clearFilters,
}: PainelFiltrosProps) {
  return (
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
                  className={`min-h-[44px] w-full rounded-md px-3 text-left text-sm transition-colors ${
                    pressed
                      ? "bg-card font-semibold text-primary"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
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
          className="min-h-[44px] w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todas</option>
          {marcas.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
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
          className="min-h-[44px] rounded-md bg-card text-sm"
        />
      </div>

      <div>
        <label htmlFor="filtro-avaliacao" className="block text-sm font-semibold mb-2">
          Avaliação mínima
        </label>
        <select
          id="filtro-avaliacao"
          value={minAvaliacao}
          onChange={(e) => setMinAvaliacao(Number(e.target.value))}
          className="min-h-[44px] w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value={0}>Todas</option>
          <option value={4.5}>4,5 ou mais</option>
          <option value={4}>4,0 ou mais</option>
          <option value={3.5}>3,5 ou mais</option>
          <option value={3}>3,0 ou mais</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="min-h-[44px] self-start text-sm text-primary hover:underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

function Index() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [marca, setMarca] = useState("");
  const [genero, setGenero] = useState("");
  const [acordo, setAcordo] = useState("");
  const debouncedAcordo = useDebounce(acordo, 500);
  const [minAvaliacao, setMinAvaliacao] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filters = {
    search: debouncedSearch || undefined,
    marca: marca || undefined,
    genero: (genero || undefined) as "masculino" | "feminino" | "unissex" | undefined,
    acordo: debouncedAcordo.trim() || undefined,
    minAvaliacao: minAvaliacao > 0 ? minAvaliacao : undefined,
  };
  const hasActiveFilters = Boolean(
    marca || genero || debouncedAcordo.trim() || debouncedSearch.trim() || minAvaliacao > 0,
  );

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
    setMinAvaliacao(0);
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
        className="h-10 rounded-md bg-card pl-9"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );

  return (
    <Layout headerSearch={searchField}>
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-10 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="txt-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Encontre a fragrância que traduz sua essência
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                Explore milhares de perfumes, descubra notas olfativas e encontre fragrâncias que
                combinam com sua personalidade.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/quiz"
                  className={cn(buttonVariants({ size: "lg" }), "min-h-[44px] px-6")}
                >
                  Descobrir meu perfume
                </Link>
                <a
                  href="#catalogo"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "min-h-[44px] px-6",
                  )}
                >
                  Explorar catálogo
                </a>
              </div>
            </div>
            <div className="mx-auto w-full max-w-md">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-card">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                  <span className="txt-display text-3xl text-primary/80">ParfumSeg</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Vitrine olfativa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="container mx-auto px-4 py-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="shrink-0 lg:w-52 lg:self-start">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3.5 text-sm font-medium transition-colors hover:bg-accent lg:hidden"
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filtrar
              </span>
              <span className="text-muted-foreground">{formatCount(total)} fragrâncias</span>
            </button>

            <div className="hidden lg:block lg:sticky lg:top-20">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                aria-controls="painel-filtros"
                className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      ativos
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              <aside
                id="painel-filtros"
                aria-label="Filtros do catálogo"
                className={filtersOpen ? "mt-3 flex flex-col" : "hidden"}
              >
                <PainelFiltros
                  marcas={marcas}
                  genero={genero}
                  setGenero={setGenero}
                  marca={marca}
                  setMarca={setMarca}
                  acordo={acordo}
                  setAcordo={setAcordo}
                  minAvaliacao={minAvaliacao}
                  setMinAvaliacao={setMinAvaliacao}
                  hasActiveFilters={hasActiveFilters}
                  clearFilters={clearFilters}
                />
              </aside>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
              {hasActiveFilters
                ? `${formatCount(total)} ${total === 1 ? "encontrado" : "encontrados"}`
                : `${formatCount(total)} no catálogo`}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {perfumes.map((perfume) => (
                <PerfumeCard key={perfume.id} perfume={perfume} />
              ))}
            </div>

            {perfumes.length === 0 && (
              <div className="rounded-md border border-dashed bg-card px-6 py-16 text-center">
                <SearchX
                  className="mx-auto mb-4 h-10 w-10 text-muted-foreground/70"
                  aria-hidden="true"
                />
                <h2 className="txt-display text-lg">Nenhum perfume encontrado</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  Nada bate com esses filtros. Ajuste a busca ou volte ao catálogo completo.
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-6 px-6">
                  Limpar filtros
                </Button>
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
      </section>

      <section className="border-t bg-card py-14" aria-labelledby="faq-titulo">
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

      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent className="max-h-[85vh] rounded-t-md">
          <DrawerHeader>
            <DrawerTitle>Filtrar</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <PainelFiltros
              marcas={marcas}
              genero={genero}
              setGenero={setGenero}
              marca={marca}
              setMarca={setMarca}
              acordo={acordo}
              setAcordo={setAcordo}
              minAvaliacao={minAvaliacao}
              setMinAvaliacao={setMinAvaliacao}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
            />
          </div>
          <DrawerFooter>
            <Button className="w-full min-h-[44px]" onClick={() => setSheetOpen(false)}>
              Aplicar filtros
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Layout>
  );
}
