import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { createContato } from "@/services/contato.functions";

export const Route = createFileRoute("/contato")({
  component: Contact,
  head: () => ({
    title: "Contato | ParfumSeg",
    meta: [{ name: "description", content: "Entre em contato conosco para dúvidas, sugestões ou parcerias." }]
  })
});

function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const form = e.currentTarget;
    const payload = {
      nome: new FormData(form).get("nome")?.toString() ?? "",
      email: new FormData(form).get("email")?.toString() ?? "",
      mensagem: new FormData(form).get("mensagem")?.toString() ?? "",
    };
    try {
      await createContato({ data: payload });
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      await navigate({ to: "/agradecimento" });
    } catch {
      setIsSubmitting(false);
      toast.error("Falha ao enviar. Confira os campos e tente novamente.");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl txt-display mb-3">Contato</h1>
        <p className="text-muted-foreground mb-10">
          Dúvida sobre o catálogo ou sugestão de perfume? Envie uma mensagem.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-md">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Nome</Label>
            <Input id="name" name="nome" required minLength={2} placeholder="Seu nome completo" className="rounded-md bg-white" maxLength={100} autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
            <Input id="email" name="email" type="email" required placeholder="seu@email.com" className="rounded-md bg-white" maxLength={100} autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Mensagem</Label>
            <Textarea id="message" name="mensagem" required minLength={10} placeholder="Como podemos ajudar? (mínimo 10 caracteres)" className="rounded-md bg-white min-h-[150px]" maxLength={2000} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full h-11">
            {isSubmitting ? "Enviando…" : (
              <>
                <Send className="mr-2 w-4 h-4" aria-hidden="true" /> Enviar mensagem
              </>
            )}
          </Button>
        </form>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-10">
          <div>
            <Mail className="w-5 h-5 text-primary mb-3" aria-hidden="true" />
            <h2 className="text-sm font-semibold mb-1">E-mail</h2>
            <p className="text-sm text-muted-foreground">contato@parfumseg.com.br</p>
          </div>
          <div>
            <MessageSquare className="w-5 h-5 text-primary mb-3" aria-hidden="true" />
            <h2 className="text-sm font-semibold mb-1">Suporte</h2>
            <p className="text-sm text-muted-foreground">Segunda a sexta, 9h às 18h</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
