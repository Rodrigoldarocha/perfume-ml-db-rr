import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-serif text-primary opacity-10">404</h1>
        <h2 className="mt-4 text-2xl font-serif text-primary uppercase tracking-widest">Página não encontrada</h2>
        <p className="mt-4 text-sm text-muted-foreground font-light leading-relaxed">
          O aroma que você procura parece ter se dissipado. Talvez a página tenha sido movida ou não exista mais.
        </p>
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-none bg-primary px-8 py-3 text-xs font-light uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90 shadow-sm"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado por aqui. Tente atualizar ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "description", content: "ParfumSeg - O maior catálogo de perfumes traduzido para português." },
      { name: "author", content: "ParfumSeg" },
      { property: "og:title", content: "ParfumSeg | Inteligência Olfativa" },
      { property: "og:description", content: "Encontre seu perfume ideal com nosso recomendador inteligente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "theme-color", content: "#35322e" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "ParfumSeg" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  pendingComponent: PendingComponent,
  pendingMinMs: 350,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function PendingComponent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-background px-4">
      <span className="font-serif text-2xl uppercase tracking-[0.1em] text-primary">
        ParfumSeg
      </span>
      <div className="boot-bar" aria-hidden="true">
        <span />
      </div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Carregando…
      </p>
    </div>
  );
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <div id="boot-splash" aria-hidden="true">
          <span style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            ParfumSeg
          </span>
          <div className="boot-bar">
            <span />
          </div>
        </div>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const splash = document.getElementById("boot-splash");
    if (!splash) return;
    splash.classList.add("hide");
    const t = window.setTimeout(() => splash.remove(), 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
