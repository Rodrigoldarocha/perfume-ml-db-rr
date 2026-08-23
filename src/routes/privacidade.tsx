import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/privacidade")({
  component: Privacy,
  head: () => ({
    title: "Política de Privacidade | ParfumSeg",
  })
});

function Privacy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-serif text-primary mb-12 uppercase tracking-widest">Política de Privacidade</h1>
        <div className="prose prose-stone max-w-none font-light text-muted-foreground space-y-8">
          <section>
            <h2 className="text-xl font-serif text-primary uppercase tracking-wider mb-4">1. Coleta de Dados</h2>
            <p>O ParfumSeg é um catálogo informativo. Não coletamos dados pessoais sensíveis sem seu consentimento expresso através de nossos formulários de contato.</p>
          </section>
          <section>
            <h2 className="text-xl font-serif text-primary uppercase tracking-wider mb-4">2. Uso de Informações</h2>
            <p>As informações fornecidas no quiz olfativo são processadas localmente ou em nossos servidores apenas para gerar recomendações personalizadas e não são compartilhadas com terceiros.</p>
          </section>
          <section>
            <h2 className="text-xl font-serif text-primary uppercase tracking-wider mb-4">3. Cookies</h2>
            <p>Utilizamos cookies essenciais para garantir o funcionamento do site e melhorar sua experiência de navegação.</p>
          </section>
          <section>
            <h2 className="text-xl font-serif text-primary uppercase tracking-wider mb-4">4. Direitos autorais</h2>
            <p>Os dados de perfumes são provenientes de fontes públicas e comunidades de perfumaria, citadas em nosso rodapé. As imagens, quando presentes, são para fins ilustrativos.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
