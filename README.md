# ParfumSeg — Catálogo & Recomendador de Perfumes em PT-BR

> Sua essência, nossa ciência. Catálogo com milhares de fragrâncias traduzidas,
> pirâmide olfativa completa e recomendador inteligente por quiz.

**Live app:** https://perfume-ml-db-rr.lovable.app

---

## Índice

- [Visão geral](#visão-geral)
- [Jornadas do usuário](#jornadas-do-usuário)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Como o recomendador funciona](#como-o-recomendador-funciona)
- [Pipeline de dados e ML](#pipeline-de-dados-e-ml)
- [Desenvolvimento local](#desenvolvimento-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Testes](#testes)
- [Banco de dados (Supabase)](#banco-de-dados-supabase)
- [Estrutura do projeto](#estrutura-do-projeto)
- [SEO e performance](#seo-e-performance)
- [Acessibilidade](#acessibilidade)
- [Roadmap](#roadmap)
- [Créditos](#créditos)

---

## Visão geral

ParfumSeg é um catálogo de perfumes em português com:

- **Explorar** — busca instantânea com debounce, paginação infinita e cards com foto,
  avaliação e acordes principais.
- **Descobrir (quiz)** — 5 perguntas (gênero, família olfativa, ocasião, intensidade,
  nota favorita) que geram uma *assinatura olfativa* com até 15 recomendações e motivo.
- **Detalhe** — pirâmide olfativa (saída/coração/fundo), acordes, perfumista,
  perfil de cluster e **fragrâncias similares clicáveis**.
- **Contato** — formulário com confirmação em página de agradecimento.

## Jornadas do usuário

```
Explorar:  / ──busca──▶ grid paginado ──clique──▶ /perfume/$id
Descobrir: /quiz (5 passos) ──search params──▶ /recomendacoes ──clique──▶ /perfume/$id
Contato:   /contato ──envio──▶ /agradecimento
```

## Stack

| Camada      | Tecnologia                                              |
|-------------|---------------------------------------------------------|
| App         | TanStack Start (SSR), React 19, TanStack Router + Query |
| UI          | Tailwind CSS v4 (tokens oklch), shadcn/ui, lucide-react |
| Dados       | Supabase (Postgres + PostgREST + RLS)                   |
| Validação   | Zod (client + server)                                   |
| ML offline  | Python (TF-IDF + K-Means esférico + cosseno), `ml-kmeans` (legado) |
| Testes      | `bun test` (sem dependências extras)                    |
| Deploy      | Lovable Cloud (`main` sincroniza sozinho)               |

## Arquitetura

```
src/
├── lib/                 # Lógica pura, sem I/O (testável)
│   ├── text.ts          # normalizePt, escapeLike
│   ├── quiz.ts          # QUIZ_STEPS, QUIZ_DEFAULTS, schema, answersToSearch
│   └── recommendation.ts# scoring + ranking (pesos, threshold, fallback)
├── services/
│   └── perfume.functions.ts  # Server functions finas (validação zod + Supabase)
├── routes/              # / , /quiz, /recomendacoes, /perfume/$id, /contato, ...
├── features/perfumes/   # PerfumeCard
├── components/          # Layout (skip link, nav, footer), ui/*
├── data/faqs.ts         # Conteúdo da home
└── integrations/supabase/ # clients + middleware (gerados, não editar)

scripts/
├── process_dataset.py   # Pipeline oficial: TF-IDF → K-Means → top5 → CSV
├── upload_dataset.py    # Upsert idempotente (on_conflict=nome,marca)
├── seed.ts              # Legado TS, bloqueado acima de 2000 itens (O(n²))
└── seed_dry_run.ts      # Checagem de dataset

tests/                   # bun test (text, quiz, recommendation)
supabase/migrations/     # Schema + RLS (leitura pública, escrita só service_role)
```

Princípios: handlers finos, regra de negócio em `lib/` pura, fonte única
(`quiz.ts`) para steps/defaults/schema, validação na borda (zod) antes do banco.

## Como o recomendador funciona

1. **Candidatos** — `resolveGenero` valida por allowlist (fallback `unissex`, nunca
   quebra o enum do banco). `unissex` = sem filtro; específico = específico + unissex.
   Busca ordenada por avaliação + nº de avaliações, `limit 1000` determinístico.
2. **Score** — `+0.5` afinidade de família (`FAMILY_MAP` normalizado sem acentos),
   `+0.3` nota favorita (mínimo 3 letras, match unilateral), `+0.15` ocasião
   (`OCCASION_MAP`), `+0.15` intensidade (`INTENSITY_MAP`), `+avaliação/10`.
3. **Rank** — filtra `score >= 0.3`, ordena desc, top 15. Fallback top 15 se
   menos de 3 passarem no threshold. Motivo exibido por card.

Pesos e limites vivem em `src/lib/recommendation.ts` — ajuste fino sem tocar em I/O.

## Pipeline de dados e ML

```sh
# 1. Processa dataset bruto → CSV com cluster, cluster_perfil, top5_similares
python scripts/process_dataset.py ./perfumes_ptbr.json /tmp/perfumes_processed.csv

# 2. Confere sem enviar
python scripts/upload_dataset.py /tmp/perfumes_processed.csv --dry-run

# 3. Upsert idempotente (nunca DELETE full-table)
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  python scripts/upload_dataset.py /tmp/perfumes_processed.csv
```

Detalhes do `process_dataset.py`: TF-IDF ponderado (saída ×1, coração/fundo ×2,
acordes ×3, tokens normalizados NFKD), K-Means esférico (cosseno, `k ≤ 12`,
seed 42), similaridade por cosseno em blocos de 512, CSV pronto para COPY/upsert.

## Desenvolvimento local

Pré-requisitos: [Bun](https://bun.sh) (ou Node 22 + npm) e um projeto Supabase.

```sh
git clone https://github.com/Rodrigoldarocha/perfume-ml-db-rr.git
cd perfume-ml-db-rr
bun install   # ou: npm i
bun run dev   # ou: npm run dev
```

Build e preview:

```sh
bun run build
bun run preview
```

## Variáveis de ambiente

> Nunca commite `.env` — está no `.gitignore`. Se vazar, rotacione as chaves.

| Variável                      | Onde usa        | Exemplo |
|-------------------------------|-----------------|---------|
| `VITE_SUPABASE_URL`           | client (Vite)   | `https://xyz.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client (anon) | `sb_publishable_...` |
| `SUPABASE_URL`                | server / scripts| `https://xyz.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY`    | server          | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY`   | scripts (admin) | **só local/CI, nunca no client** |

## Scripts

| Comando          | O que faz                              |
|------------------|----------------------------------------|
| `bun run dev`    | Dev SSR com HMR                        |
| `bun run build`  | Build de produção                      |
| `bun run preview`| Serve o build                          |
| `bun run lint`   | ESLint (nota: quebra com TS 7 — pré-existente, ver `ui/*`) |
| `bun run format` | Prettier                               |
| `bun run test`   | `bun test tests` — 25 testes verdes    |

## Testes

```sh
bun run test
```

Cobertura (feliz + borda): normalização/escape (`text`), steps/defaults/schema do
quiz, allowlist de gênero (inclui tentativa de injeção), scoring (família/nota/rating),
threshold/fallback/teto do ranking, arrays nulos e dataset vazio. Lógica pura em
`src/lib/` = isolamento total de I/O.

## Banco de dados (Supabase)

Tabela `public.perfumes`: `id`, `nome`, `marca` (única `nome+marca`), `pais_origem`,
`genero` (enum `masculino|feminino|unissex`), `avaliacao`, `numero_avaliacoes`,
`ano_lancamento`, `notas_saida|coracao|fundo[]`, `acordes_principais[]`,
`perfumista_1|2`, `url_fonte`, `cluster`, `cluster_perfil`, `top5_similares[]`,
`imagem_url`, `created_at`.

RLS: `SELECT` público (anon + authenticated), escritas só `service_role`
(migration `20260907000000_revoke_perfumes_write.sql`).

Listagem usa select enxuto (`id,nome,marca,genero,avaliacao,acordes,imagem`) para
payload leve; detalhe/recomendação usam linha completa.

## Estrutura do projeto

Ver [Arquitetura](#arquitetura). Rotas em `src/routes/` (TanStack file-router),
sitemap dinâmico em `/sitemap.xml` (estáticas + top 500 por avaliações, com fallback
estático sem env), `robots.txt` correspondente.

## SEO e performance

- Metas OG/Twitter por rota + detalhe dinâmico (nome, marca, acordes).
- `staleTime`/`gcTime` no Query (listagem 60s/5min, detalhe 5min/30min) — menos refetch.
- Imagens `loading="lazy"`, `decoding="async"`, containers com aspect-ratio (sem CLS).
- Micro-interação `animate-rise` com stagger e `prefers-reduced-motion` respeitado.
- Foco visível global, `::selection` com acento.

## Acessibilidade

- `lang="pt-BR"`, skip link "Pular para o conteúdo", `nav` com `aria-label`.
- Navegação visível no mobile (antes oculta), alvos touch `min-h-[44px]`.
- Motivo da recomendação sempre visível no mobile (antes só hover).
- Tipografia fluida (`clamp`) no hero, sem scroll horizontal.

## Roadmap

- [ ] Busca por marca/acorde na UI (backend já filtra)
- [ ] Persistir contato (tabela Supabase ou e-mail)
- [ ] Auth + favoritos/coleções
- [ ] Imagens WebP/AVIF com `srcset` e CDN
- [ ] Testes E2E do fluxo quiz → recomendações
- [ ] Virtualização para catálogos gigantes

## Créditos

Dados originais: Fragrantica.com, via Kaggle (`olgagmiufana1`), traduzidos para PT-BR.
Imagens ilustrativas quando presentes. Projeto conectado ao
[Lovable](https://lovable.dev) — push em `main` sincroniza o editor (sem force-push,
sem rebase de histórico publicado).
