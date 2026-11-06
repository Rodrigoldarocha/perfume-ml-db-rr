import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getPerfumeById, getPerfumesByNames } from "@/services/perfume.functions";
import { Layout } from "@/components/Layout";
import { Star, ExternalLink, ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Perfume } from "@/types/perfume";
import { liquidColor, liquidTint } from "@/lib/utils";

export const Route = createFileRoute("/perfume/$id")({
  component: PerfumeDetail,
  head: ({ loaderData }) => {
    const data = loaderData as unknown as Perfume;
    return {
      title: data ? `${data.nome} - ${data.marca} | ParfumSeg` : "Detalhes do Perfume | ParfumSeg",
      meta: [
        { name: "description", content: data ? `Notas de ${data.nome} da ${data.marca}. Acordes: ${(data.acordes_principais ?? []).join(", ")}. Veja perfumes similares.` : "Detalhes do perfume e pirâmide olfativa completa." },
        { property: "og:title", content: data ? `${data.nome} - ${data.marca} | ParfumSeg` : "ParfumSeg | Catálogo de Perfumes" },
        { property: "og:description", content: data ? `Composição detalhada de ${data.nome} e fragrâncias parecidas.` : "Mais de 24.000 fragrâncias traduzidas." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" }
      ]
    };
  },
  loader: async ({ params }) => {
    const { getPerfumeById } = await import("@/services/perfume.functions");
    return getPerfumeById({ data: params.id });
  }
});

const BARRAS = [92, 74, 58, 46, 36, 28, 22];
const formatNota = (value: number) => value.toFixed(1).replace(".", ",");

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function PerfumeDetail() {
  const { id } = Route.useParams();
  const { data: perfume } = useSuspenseQuery({
    queryKey: ["perfume", id],
    queryFn: () => getPerfumeById({ data: id }),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
  const [imgOk, setImgOk] = useState(Boolean(perfume.imagem_url));
  const similarNames = perfume.top5_similares ?? [];
  const { data: similares } = useQuery({
    queryKey: ["similares", id, similarNames],
    queryFn: () => getPerfumesByNames({ data: { names: similarNames.slice(0, 10) } }),
    enabled: similarNames.length > 0,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
  const similaresByName = new Map((similares ?? []).map((s) => [s.nome, s]));

  const liquid = liquidColor(perfume.acordes_principais ?? []);
  const perfumistas = [perfume.perfumista_1, perfume.perfumista_2].filter(Boolean).join(", ");
  const temNotas =
    (perfume.notas_saida?.length ?? 0) > 0 ||
    (perfume.notas_coracao?.length ?? 0) > 0 ||
    (perfume.notas_fundo?.length ?? 0) > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList className="text-sm text-muted-foreground">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" aria-hidden="true" /> Catálogo
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-3.5 h-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground">{perfume.nome}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
          <div
            className="aspect-[3/4] relative overflow-hidden rounded-md"
            style={{ backgroundColor: liquidTint(liquid) }}
          >
            {perfume.imagem_url && imgOk ? (
              <img
                src={perfume.imagem_url}
                alt={`${perfume.marca} ${perfume.nome}`}
                onError={() => setImgOk(false)}
                className="absolute inset-0 w-full h-full object-contain p-8"
              />
            ) : (
              <div className="absolute inset-0 flex items-end p-6">
                <p className="txt-display text-3xl leading-tight" style={{ color: liquid }}>
                  {perfume.nome}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-1">{perfume.marca}</p>
              <h1 className="text-4xl md:text-5xl txt-display">{perfume.nome}</h1>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-muted-foreground mb-8 pb-6 border-b">
              <span>Gênero {cap(perfume.genero)}</span>
              {perfume.ano_lancamento && <span>Lançamento {perfume.ano_lancamento}</span>}
              {perfume.pais_origem && <span>Origem {perfume.pais_origem}</span>}
              {perfume.avaliacao != null && (
                <span className="text-foreground font-medium">
                  Nota {formatNota(perfume.avaliacao)}
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    ({perfume.numero_avaliacoes ?? 0} votos)
                  </span>
                </span>
              )}
            </div>

            <div className="space-y-9">
              {(perfume.acordes_principais ?? []).length > 0 && (
                <section aria-labelledby="acordes-titulo">
                  <h2 id="acordes-titulo" className="txt-display text-lg mb-4">
                    Acordes
                  </h2>
                  <div className="space-y-3.5">
                    {perfume.acordes_principais.map((acorde, i) => (
                      <div key={acorde}>
                        <p className="text-sm font-medium mb-1.5">{acorde}</p>
                        <div
                          className="h-2 w-full overflow-hidden rounded-md bg-black/[0.06]"
                          role="img"
                          aria-label={`${acorde}: acorde ${i + 1} de ${perfume.acordes_principais.length}`}
                        >
                          <div
                            className="h-full rounded-md"
                            style={{
                              width: `${BARRAS[i] ?? 18}%`,
                              backgroundColor: liquid,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {temNotas && (
                <section aria-labelledby="notas-titulo">
                  <h2 id="notas-titulo" className="txt-display text-lg mb-4">
                    Notas
                  </h2>
                  <dl className="space-y-3 text-sm">
                    {(perfume.notas_saida?.length ?? 0) > 0 && (
                      <div className="flex gap-3">
                        <dt className="w-16 shrink-0 font-semibold">Saída</dt>
                        <dd className="text-muted-foreground">{perfume.notas_saida.join(", ")}</dd>
                      </div>
                    )}
                    {(perfume.notas_coracao?.length ?? 0) > 0 && (
                      <div className="flex gap-3">
                        <dt className="w-16 shrink-0 font-semibold">Coração</dt>
                        <dd className="text-muted-foreground">{perfume.notas_coracao.join(", ")}</dd>
                      </div>
                    )}
                    {(perfume.notas_fundo?.length ?? 0) > 0 && (
                      <div className="flex gap-3">
                        <dt className="w-16 shrink-0 font-semibold">Fundo</dt>
                        <dd className="text-muted-foreground">{perfume.notas_fundo.join(", ")}</dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}

              <div className="space-y-2 pt-6 border-t">
                {perfumistas && (
                  <p className="text-sm text-muted-foreground">Perfumista {perfumistas}</p>
                )}
                {perfume.cluster_perfil && (
                  <p className="text-sm text-muted-foreground">
                    Perfil olfativo {perfume.cluster_perfil}
                  </p>
                )}
                <a
                  href={perfume.url_fonte}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline"
                >
                  Ver no Fragrantica
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {similarNames.length > 0 && (
          <section className="mt-16" aria-labelledby="similares-titulo">
            <h2 id="similares-titulo" className="txt-display text-xl mb-6">
              Perfumes parecidos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {similarNames.map((nomeSimilar) => {
                const match = similaresByName.get(nomeSimilar);
                if (!match) {
                  return (
                    <div key={nomeSimilar} className="p-5 bg-white rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Similar</p>
                      <h3 className="text-sm font-medium">{nomeSimilar}</h3>
                    </div>
                  );
                }
                return (
                  <Link
                    key={nomeSimilar}
                    to="/perfume/$id"
                    params={{ id: match.id.toString() }}
                    preload="intent"
                    className="p-5 bg-white rounded-md card-rise block"
                  >
                    <p className="text-xs text-muted-foreground mb-1">{match.marca}</p>
                    <h3 className="text-sm font-medium leading-snug">{match.nome}</h3>
                  </Link>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-5">
              Similares calculados a partir de acordes e notas.
            </p>
          </section>
        )}
      </div>
    </Layout>
  );
}
