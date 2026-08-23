import { Link, Outlet } from "@tanstack/react-router";

export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent selection:text-accent-foreground">
      <header className="border-b border-primary/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex flex-col items-center">
            <h1 className="text-2xl font-serif tracking-[0.1em] text-primary uppercase leading-none">ParfumSeg</h1>
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">Catálogo & Recomendador</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 uppercase text-xs tracking-widest font-light">
            <Link to="/" className="hover:text-primary transition-colors [&.active]:text-primary [&.active]:font-medium">Explorar</Link>
            <Link to="/quiz" className="hover:text-primary transition-colors [&.active]:text-primary [&.active]:font-medium">Descobrir</Link>
            <Link to="/contato" className="hover:text-primary transition-colors [&.active]:text-primary [&.active]:font-medium">Contato</Link>
          </nav>

          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1">
        {children || <Outlet />}
      </main>

      <footer className="bg-primary text-primary-foreground py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-serif tracking-widest uppercase mb-4">ParfumSeg</h2>
          <p className="text-sm text-primary-foreground/60 max-w-md mx-auto mb-8 font-light">
            Sua jornada olfativa começa aqui. Encontre a fragrância que define sua essência.
          </p>
          <div className="flex justify-center gap-6 mb-8 text-[10px] uppercase tracking-widest font-light text-primary-foreground/60">
            <Link to="/privacidade" className="hover:text-primary-foreground transition-colors">Privacidade</Link>
            <Link to="/contato" className="hover:text-primary-foreground transition-colors">Contato</Link>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/40 border-t border-primary-foreground/10 pt-8">
            Dados originais: Fragrantica.com, via Kaggle (olgagmiufana1), traduzidos para PT-BR.
          </div>
        </div>
      </footer>
    </div>
  );
}
