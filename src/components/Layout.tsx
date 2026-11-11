import { Link, Outlet } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { to: "/", label: "Explorar" },
  { to: "/quiz", label: "Descobrir" },
  { to: "/similares", label: "Parecidos" },
  { to: "/contato", label: "Contato" },
] as const;

const NAV_LINK_BASE =
  "relative inline-flex min-h-[44px] items-center px-1 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:origin-center after:rounded-full after:bg-primary after:transition-transform after:scale-x-0 hover:after:scale-x-100";

export function Layout({
  children,
  headerSearch,
}: {
  children?: React.ReactNode;
  headerSearch?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col txt-body selection:bg-accent selection:text-accent-foreground">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:text-sm focus:rounded-md"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
          <Link
            to="/"
            aria-label="ParfumSeg — início"
            className="order-1 flex min-h-[44px] items-center gap-2.5"
          >
            <img
              src="/icons/icon-192.png"
              alt="Logotipo ParfumSeg — frasco de perfume"
              width={32}
              height={32}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="h-9 w-9 shrink-0 rounded-full object-contain"
            />
            <span className="txt-display text-xl leading-none">ParfumSeg</span>
          </Link>

          <Link
            to="/quiz"
            className={cn(
              buttonVariants({ size: "sm" }),
              "order-2 ml-auto h-9 max-w-[52vw] px-3 leading-tight sm:order-4 sm:ml-0 sm:h-10 sm:max-w-none sm:px-4 sm:text-sm",
            )}
          >
            <span className="sm:hidden">Fazer o quiz</span>
            <span className="hidden sm:inline">Qual perfume combina comigo?</span>
          </Link>

          <Sheet>
            <SheetTrigger
              className="order-3 inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent sm:hidden"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="flex w-4/5 max-w-xs flex-col gap-1 p-6 pt-16">
              <SheetTitle className="text-base">Navegação</SheetTitle>
              <nav aria-label="Navegação principal (menu)" className="flex flex-col">
                {NAV_ITEMS.map(({ to, label }) => (
                  <SheetClose asChild key={to}>
                    <Link
                      to={to}
                      activeOptions={{ exact: true }}
                      className={cn(
                        NAV_LINK_BASE,
                        "min-h-[52px] justify-start text-base after:bottom-1",
                        "data-[status=active]:text-foreground data-[status=active]:after:scale-x-100",
                      )}
                    >
                      {label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <SheetClose asChild>
                <Link to="/quiz" className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}>
                  Qual perfume combina comigo?
                </Link>
              </SheetClose>
            </SheetContent>
          </Sheet>

          {headerSearch && (
            <div className="order-4 w-full sm:order-2 sm:w-auto sm:max-w-md sm:flex-1">
              {headerSearch}
            </div>
          )}

          <nav
            aria-label="Navegação principal"
            className="order-5 ml-auto hidden items-center gap-4 sm:order-3 sm:flex lg:gap-6"
          >
            {NAV_ITEMS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-foreground after:scale-x-100" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className={NAV_LINK_BASE}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main id="conteudo" className="flex-1">
        {children || <Outlet />}
      </main>

      <footer className="mt-16 border-t bg-card py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2.5">
            <img
              src="/icons/icon-192.png"
              alt=""
              aria-hidden="true"
              width={28}
              height={28}
              loading="lazy"
              decoding="async"
              className="h-8 w-8 shrink-0 rounded-full object-contain"
            />
            <span className="txt-display text-lg">ParfumSeg</span>
          </div>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
            Catálogo de perfumes em português com dados do Fragrantica e um recomendador baseado nas
            suas preferências.
          </p>
          <nav
            aria-label="Rodapé"
            className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-muted-foreground"
          >
            <Link
              to="/privacidade"
              className="inline-flex min-h-[44px] items-center transition-colors hover:text-foreground"
            >
              Privacidade
            </Link>
            <Link
              to="/contato"
              className="inline-flex min-h-[44px] items-center transition-colors hover:text-foreground"
            >
              Contato
            </Link>
            <a
              href="https://www.linkedin.com/in/rodrigo-rocha-19249170/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center transition-colors hover:text-foreground"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/Rodrigoldarocha"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </nav>
          <p className="mx-auto max-w-lg border-t border-border pt-6 text-xs text-muted-foreground">
            Dados originais: Fragrantica.com, via Kaggle (olgagmiufana1), traduzidos para PT-BR.
          </p>
        </div>
      </footer>
    </div>
  );
}
