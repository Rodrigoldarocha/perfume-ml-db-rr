import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      try {
        toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
        navigate({ to: "/agradecimento" }).catch(() => {
          setIsSubmitting(false);
          toast.error("Falha ao redirecionar. Tente novamente.");
        });
      } catch {
        setIsSubmitting(false);
        toast.error("Falha ao enviar. Tente novamente.");
      }
    }, 800);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 max-w-2xl">
        <h1 className="text-4xl font-serif text-primary mb-8 text-center uppercase tracking-widest">Contato</h1>
        <p className="text-muted-foreground font-light text-center mb-12">
          Tem alguma dúvida sobre nosso catálogo ou quer sugerir um perfume? Envie uma mensagem.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border border-primary/5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="name" className="uppercase text-[10px] tracking-widest font-light">Nome</Label>
            <Input id="name" required placeholder="Seu nome completo" className="rounded-none border-primary/10" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="uppercase text-[10px] tracking-widest font-light">E-mail</Label>
            <Input id="email" type="email" required placeholder="seu@email.com" className="rounded-none border-primary/10" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="uppercase text-[10px] tracking-widest font-light">Mensagem</Label>
            <Textarea id="message" required placeholder="Como podemos ajudar?" className="rounded-none border-primary/10 min-h-[150px]" maxLength={500} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full rounded-none uppercase tracking-widest text-xs h-12">
            {isSubmitting ? "Enviando..." : (
              <>
                <Send className="mr-2 w-4 h-4" /> Enviar Mensagem
              </>
            )}
          </Button>
        </form>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-center border-t border-primary/5 pt-12">
          <div>
            <Mail className="w-6 h-6 text-primary mx-auto mb-4" />
            <h3 className="font-serif text-sm uppercase tracking-widest mb-2">E-mail</h3>
            <p className="text-xs text-muted-foreground font-light">contato@parfumseg.com.br</p>
          </div>
          <div>
            <MessageSquare className="w-6 h-6 text-primary mx-auto mb-4" />
            <h3 className="font-serif text-sm uppercase tracking-widest mb-2">Suporte</h3>
            <p className="text-xs text-muted-foreground font-light">Segunda a Sexta, 9h às 18h</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
