import { Link, Outlet } from "@tanstack/react-router";

export function Layout({
  children,
  headerSearch,
}: {
  children?: React.ReactNode;
  headerSearch?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col txt-body selection:bg-accent selection:text-accent-foreground">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:text-sm focus:rounded-md"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            to="/"
            aria-label="ParfumSeg — início"
            className="order-1 flex items-center gap-2.5 min-h-[44px]"
          >
            <img
              src="/icons/icon-192.png"
              alt="Logotipo ParfumSeg — frasco de perfume"
              width={32}
              height={32}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="h-8 w-8 shrink-0 object-contain"
            />
            <span className="txt-display text-xl leading-none">ParfumSeg</span>
          </Link>

          {headerSearch && (
            <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1 sm:max-w-md">
              {headerSearch}
            </div>
          )}

          <nav
            aria-label="Navegação principal"
            className="order-4 sm:order-3 flex items-center gap-4 sm:gap-5 text-sm font-medium text-muted-foreground ml-auto sm:ml-0"
          >
            <Link
              to="/"
              className="min-h-[44px] inline-flex items-center hover:text-foreground transition-colors [&.active]:text-foreground"
            >
              Explorar
            </Link>
            <Link
              to="/quiz"
              className="min-h-[44px] inline-flex items-center hover:text-foreground transition-colors [&.active]:text-foreground"
            >
              Descobrir
            </Link>
            <Link
              to="/similares"
              className="min-h-[44px] inline-flex items-center hover:text-foreground transition-colors [&.active]:text-foreground"
            >
              Parecidos
            </Link>
            <Link
              to="/contato"
              className="min-h-[44px] inline-flex items-center hover:text-foreground transition-colors [&.active]:text-foreground"
            >
              Contato
            </Link>
          </nav>

          <Link
            to="/quiz"
            className="order-2 sm:order-4 inline-flex items-center justify-center min-h-[40px] rounded-md bg-primary px-3.5 sm:px-4 py-2 text-[13px] sm:text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors text-center leading-tight"
          >
            Qual perfume combina comigo?
          </Link>
        </div>
      </header>

      <main id="conteudo" className="flex-1">
        {children || <Outlet />}
      </main>

      <footer className="border-t bg-white py-10 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <img
              src="/icons/icon-192.png"
              alt=""
              aria-hidden="true"
              width={28}
              height={28}
              loading="lazy"
              decoding="async"
              className="h-7 w-7 shrink-0 object-contain"
            />
            <span className="txt-display text-lg">ParfumSeg</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Catálogo de perfumes em português com dados do Fragrantica e um
            recomendador baseado nas suas preferências.
          </p>
          <nav aria-label="Rodapé" className="flex justify-center gap-6 text-sm text-muted-foreground mb-4">
            <Link to="/privacidade" className="min-h-[44px] inline-flex items-center hover:text-foreground transition-colors">
              Privacidade
            </Link>
            <Link to="/contato" className="min-h-[44px] inline-flex items-center hover:text-foreground transition-colors">
              Contato
            </Link>
            <a
              href="https://www.linkedin.com/in/rodrigo-rocha-19249170/"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/Rodrigoldarocha"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </nav>
          <p className="text-xs text-muted-foreground/80 border-t border-border pt-6 max-w-lg mx-auto">
            Dados originais: Fragrantica.com, via Kaggle (olgagmiufana1), traduzidos para PT-BR.
          </p>
        </div>
      </footer>
    </div>
  );
}
