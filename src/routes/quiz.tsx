import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quiz")({
  component: Quiz,
});

function Quiz() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-serif text-primary mb-8 uppercase tracking-widest">Descobrir</h1>
      <p className="text-muted-foreground font-light mb-12">O recomendador de perfumes está sendo preparado...</p>
    </div>
  );
}
