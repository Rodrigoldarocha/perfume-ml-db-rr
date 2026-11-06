import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/agradecimento")({
  component: Thanks,
  head: () => ({
    title: "Obrigado | ParfumSeg",
    meta: [{ name: "description", content: "Sua mensagem foi enviada com sucesso." }]
  })
});

function Thanks() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-32 text-center">
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-6" aria-hidden="true" />
        <h1 className="text-3xl txt-display mb-4">Mensagem enviada</h1>
        <p className="text-muted-foreground mb-10 max-w-md mx-auto">
          Recebemos sua mensagem e vamos responder em breve.
        </p>
        <Button asChild className="px-6">
          <Link to="/">Voltar ao catálogo</Link>
        </Button>
      </div>
    </Layout>
  );
}
