import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/agradecimento")({
  component: Thanks,
  head: () => ({
    title: "Obrigado | ParfumSeg",
  })
});

function Thanks() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-32 text-center">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-8 opacity-20" />
        <h1 className="text-4xl font-serif text-primary mb-6 uppercase tracking-widest">Obrigado!</h1>
        <p className="text-muted-foreground font-light mb-12 max-w-md mx-auto">
          Sua mensagem foi recebida com sucesso. Nossa equipe entrará em contato em breve.
        </p>
        <Button asChild className="rounded-none uppercase tracking-widest px-8">
          <Link to="/">Voltar ao Catálogo</Link>
        </Button>
      </div>
    </Layout>
  );
}
