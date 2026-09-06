# 🌸 ParfumSeg — Catálogo & Recomendador de Perfumes

React TypeScript TanStack Start Tailwind CSS Supabase

Catálogo de perfumes em português com quiz olfativo e recomendador inteligente.

A aplicação centraliza busca, filtros, pirâmide olfativa, fragrâncias similares e
recomendações personalizadas em uma interface responsiva para web e dispositivos móveis.

**Live app:** https://perfume-ml-db-rr.lovable.app

## ✨ Funcionalidades

- 🔎 Busca instantânea com debounce e paginação infinita
- 🏷️ Filtros por marca, gênero e acorde
- 🧭 Quiz olfativo em 5 passos (gênero, família, ocasião, intensidade, nota)
- 🎯 Até 15 recomendações com motivo por card
- 🌸 Pirâmide olfativa completa (saída, coração, fundo)
- 🔗 Fragrâncias similares clicáveis
- 🌓 Tokens em oklch com suporte a tema escuro
- 📱 Interface responsiva com alvos touch de 44px
- ♿ Skip link, `aria-live` no quiz e foco visível
- 🗺️ Sitemap dinâmico + `robots.txt`
- 💾 Cache de queries para melhorar a disponibilidade

## 🛠️ Tecnologias

- React 19
- TypeScript
- TanStack Start (SSR)
- TanStack Router
- TanStack Query
- Tailwind CSS v4
- shadcn/ui
- Zod
- Supabase (Postgres + PostgREST + RLS)
- Python (TF-IDF + K-Means + similaridade por cosseno)
- Bun (testes)

## 📁 Estrutura

```
src/
├── components/
│   ├── Layout.tsx
│   └── ui/
├── data/
│   └── faqs.ts
├── features/
│   └── perfumes/
│       └── components/
│           └── PerfumeCard.tsx
├── hooks/
├── integrations/
│   └── supabase/
├── lib/
│   ├── quiz.ts
│   ├── recommendation.ts
│   └── text.ts
├── routes/
│   ├── index.tsx
│   ├── quiz.tsx
│   ├── recomendacoes.tsx
│   ├── perfume.$id.tsx
│   ├── contato.tsx
│   ├── agradecimento.tsx
│   └── privacidade.tsx
├── services/
│   └── perfume.functions.ts
├── types/
│   └── perfume.ts
└── styles.css
scripts/
├── process_dataset.py
├── upload_dataset.py
├── seed.ts
└── seed_dry_run.ts
tests/
├── quiz.test.ts
├── recommendation.test.ts
└── text.test.ts
supabase/
└── migrations/
```

## 🚀 Instalação

### Requisitos

- Node.js 22+ ou Bun
- npm ou Bun
- Projeto Supabase (URL + chaves)

### Configuração

```sh
git clone https://github.com/Rodrigoldarocha/perfume-ml-db-rr.git
cd perfume-ml-db-rr

npm install
cp .env.example .env
```

Configure o `.env`:

```sh
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
SUPABASE_URL=sua_url
SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

⚠️ Variáveis `VITE_*` ficam disponíveis no frontend. A `SUPABASE_SERVICE_ROLE_KEY`
bypassa o RLS — use somente nos scripts locais, nunca no client.

## ▶️ Executando

Desenvolvimento:

```sh
npm run dev
```

Build:

```sh
npm run build
```

Preview:

```sh
npm run preview
```

Testes:

```sh
npm run test
```

Lint:

```sh
npm run lint
```

## 🧠 Recomendador

1. **Candidatos** — gênero por allowlist (`unissex` = sem filtro), ordenados por
   avaliação, `limit 1000` determinístico.
2. **Score** — família (`+0.5`), nota favorita (`+0.3`), ocasião (`+0.15`),
   intensidade (`+0.15`) e prior de popularidade (`+avaliação/10 × 0.3`, teto `0.15`).
   Tudo passa por normalização única (sem acentos + dicionário de sinônimos EN→PT).
3. **Âncora + expansão** — top 3 viram âncoras; seus `top5_similares` (ML offline)
   entram na sequência, mesmo abaixo do threshold.
4. **MMR** (`λ=0.7`) — fecha 15 resultados diversos em vez de 15 clones.

Pesos, mapas e tetos vivem em `src/lib/recommendation.ts`.

## 📊 Dados e ML

Pipeline oficial em Python:

```sh
python scripts/process_dataset.py ./perfumes_ptbr.json /tmp/perfumes_processed.csv
python scripts/upload_dataset.py /tmp/perfumes_processed.csv --dry-run
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  python scripts/upload_dataset.py /tmp/perfumes_processed.csv
```

O upsert é idempotente (`on_conflict=nome,marca`) — nunca apaga o catálogo.
O `scripts/seed.ts` legado é bloqueado acima de 2000 itens (complexidade O(n²)).

## 🔐 Segurança

Não versionar arquivos `.env` ou credenciais no Git (o `.gitignore` já cobre `.env`).

Utilize `.env.example` para documentar as variáveis necessárias.

Leituras do catálogo são públicas via RLS; escritas somente com `service_role`
(migration `20260907000000_revoke_perfumes_write.sql`).

## 👨‍💻 Autor

Rodrigo Rocha — [GitHub](https://github.com/Rodrigoldarocha) ·
[LinkedIn](https://www.linkedin.com/in/rodrigo-rocha-19249170/)

## 📄 Licença e Créditos

Desenvolvido por: Rodrigo Rocha
Projeto: ParfumSeg — Catálogo & Recomendador de Perfumes

Dados de perfumes: Fragrantica.com, via Kaggle (`olgagmiufana1`), traduzidos para PT-BR.
Imagens ilustrativas quando presentes.

ParfumSeg · Sua essência, nossa ciência
