import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPerfumeById } from "@/services/perfume.functions";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, ChevronRight, Home } from "lucide-react";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Perfume } from "@/types/perfume";

export const Route = createFileRoute("/perfume/$id")({
  component: PerfumeDetail,
  head: ({ loaderData }) => {
    const data = loaderData as Perfume;
    return {
      title: data ? `${data.nome} - ${data.marca} | ParfumSeg` : "Detalhes do Perfume | ParfumSeg",
      meta: [
        { name: "description", content: data ? `Descubra as notas de ${data.nome} da ${data.marca}. Acordes: ${data.acordes_principais.join(", ")}. Veja perfumes similares.` : "Detalhes do perfume e pirâmide olfativa completa." },
        { property: "og:title", content: data ? `${data.nome} - ${data.marca} | Pirâmide Olfativa` : "ParfumSeg | Catálogo de Perfumes" },
        { property: "og:description", content: data ? `Explore a composição detalhada e encontre fragrâncias parecidas com ${data.nome}.` : "Explore 24.000+ fragrâncias traduzidas." },
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

function PerfumeDetail() {
  const { id } = Route.useParams();
  const { data: perfume } = useSuspenseQuery({
    queryKey: ["perfume", id],
    queryFn: () => getPerfumeById({ data: id }),
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList className="uppercase tracking-[0.2em] text-[10px]">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1"><Home className="w-3 h-3" /> Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-3 h-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Catálogo</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-3 h-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-medium">{perfume.nome}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Image Placeholder Area */}
          <div className="aspect-[3/4] bg-muted flex items-center justify-center border border-primary/5">
            <div className="text-center">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-2">{perfume.marca}</span>
              <h1 className="text-4xl font-serif text-primary uppercase tracking-wider">{perfume.nome}</h1>
            </div>
          </div>

          {/* Info Area */}
          <div className="flex flex-col">
            <div className="mb-8 border-b border-primary/10 pb-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="rounded-none uppercase tracking-widest font-light border-primary/20">
                  {perfume.genero}
                </Badge>
                {perfume.avaliacao && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-primary text-primary" />
                    <span className="text-xl font-light">{perfume.avaliacao.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground font-light">({perfume.numero_avaliacoes} votos)</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground font-light italic">
                Lançado em {perfume.ano_lancamento || "Ano desconhecido"}
                {perfume.pais_origem && ` • ${perfume.pais_origem}`}
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-4">Acordes Principais</h3>
                <div className="flex flex-wrap gap-2">
                  {perfume.acordes_principais.map((acorde) => (
                    <Badge key={acorde} variant="secondary" className="rounded-none font-light tracking-wide bg-accent/20 hover:bg-accent/30 text-primary border-none">
                      {acorde}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-4">Pirâmide Olfativa</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Notas de Saída</span>
                    <div className="flex flex-wrap gap-1.5">
                      {perfume.notas_saida.map((nota) => (
                        <span key={nota} className="text-sm font-light px-2 py-0.5 border border-primary/10">{nota}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Notas de Coração</span>
                    <div className="flex flex-wrap gap-1.5">
                      {perfume.notas_coracao.map((nota) => (
                        <span key={nota} className="text-sm font-light px-2 py-0.5 border border-primary/10">{nota}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Notas de Fundo</span>
                    <div className="flex flex-wrap gap-1.5">
                      {perfume.notas_fundo.map((nota) => (
                        <span key={nota} className="text-sm font-light px-2 py-0.5 border border-primary/10">{nota}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-primary/10">
                <div className="flex flex-col gap-2">
                   <p className="text-xs font-light text-muted-foreground uppercase tracking-widest">
                     Perfumista(s): {perfume.perfumista_1}{perfume.perfumista_2 ? `, ${perfume.perfumista_2}` : ""}
                   </p>
                   {perfume.cluster_perfil && (
                     <p className="text-xs font-light text-muted-foreground uppercase tracking-widest">
                       Perfil: <span className="text-primary font-medium">{perfume.cluster_perfil}</span>
                     </p>
                   )}
                </div>
                
                <a 
                  href={perfume.url_fonte} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                >
                  Ver fonte original no Fragrantica <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Similares Section */}
        {perfume.top5_similares && perfume.top5_similares.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-serif text-primary uppercase tracking-widest mb-12 text-center underline underline-offset-8 decoration-primary/20">
              Fragrâncias Similares
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {perfume.top5_similares.map((nomeSimilar) => (
                <div key={nomeSimilar} className="p-6 bg-white border border-primary/5 text-center flex flex-col items-center justify-center aspect-square shadow-sm">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Similar</span>
                  <h4 className="font-serif text-sm uppercase tracking-wider">{nomeSimilar}</h4>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-8 uppercase tracking-widest font-light italic">
              *Similaridades inferidas pelo nosso sistema baseado em acordes e notas.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
