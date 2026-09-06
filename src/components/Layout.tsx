import { Link, Outlet } from "@tanstack/react-router";

export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent selection:text-accent-foreground">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-widest"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b border-primary/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 min-h-20 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <Link to="/" className="flex flex-col items-center min-h-[44px] justify-center">
            <h1 className="text-2xl font-serif tracking-[0.1em] text-primary uppercase leading-none">ParfumSeg</h1>
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">Catálogo & Recomendador</span>
          </Link>

          <nav aria-label="Navegação principal" className="flex items-center gap-5 md:gap-8 uppercase text-xs tracking-widest font-light">
            <Link to="/" className="min-h-[44px] inline-flex items-center hover:text-primary transition-colors [&.active]:text-primary [&.active]:font-medium">Explorar</Link>
            <Link to="/quiz" className="min-h-[44px] inline-flex items-center hover:text-primary transition-colors [&.active]:text-primary [&.active]:font-medium">Descobrir</Link>
            <Link to="/contato" className="min-h-[44px] inline-flex items-center hover:text-primary transition-colors [&.active]:text-primary [&.active]:font-medium">Contato</Link>
          </nav>

          <div className="w-10 hidden md:block"></div> {/* Spacer */}
        </div>
      </header>

      <main id="conteudo" className="flex-1">
        {children || <Outlet />}
      </main>

      <footer className="bg-primary text-primary-foreground py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-serif tracking-widest uppercase mb-4">ParfumSeg</h2>
          <p className="text-sm text-primary-foreground/80 max-w-md mx-auto mb-8 font-light">
            Sua jornada olfativa começa aqui. Encontre a fragrância que define sua essência.
          </p>
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest font-light text-primary-foreground/80">
              <Link to="/privacidade" className="min-h-[44px] inline-flex items-center hover:text-primary-foreground transition-colors">Privacidade</Link>
              <Link to="/contato" className="min-h-[44px] inline-flex items-center hover:text-primary-foreground transition-colors">Contato</Link>
            </div>
            <div className="flex justify-center gap-4 text-[10px] tracking-widest font-light text-primary-foreground/80">
              <a href="https://www.linkedin.com/in/rodrigo-rocha-19249170/" target="_blank" rel="noopener noreferrer" className="min-h-[44px] inline-flex items-center hover:text-primary-foreground transition-colors uppercase">LinkedIn</a>
              <a href="https://github.com/Rodrigoldarocha" target="_blank" rel="noopener noreferrer" className="min-h-[44px] inline-flex items-center hover:text-primary-foreground transition-colors uppercase">GitHub</a>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70 border-t border-primary-foreground/10 pt-8">
            Dados originais: Fragrantica.com, via Kaggle (olgagmiufana1), traduzidos para PT-BR.
          </div>
        </div>
      </footer>
    </div>
  );
}
