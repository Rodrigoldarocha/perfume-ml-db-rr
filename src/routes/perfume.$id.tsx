import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/perfume/$id")({
  component: PerfumeDetail,
});

function PerfumeDetail() {
  const { id } = Route.useParams();
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-serif text-primary mb-8 uppercase tracking-widest">Perfume {id}</h1>
      <p className="text-muted-foreground font-light mb-12">Os detalhes da fragrância estão sendo carregados...</p>
    </div>
  );
}
