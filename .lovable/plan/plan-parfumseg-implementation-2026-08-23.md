# Plan - ParfumSeg Implementation

Create a perfume catalog and recommender app using TanStack Start and Lovable Cloud.

## Database & Data
- Create `perfumes` table with columns: `id`, `nome`, `marca`, `pais_origem`, `genero`, `avaliacao`, `numero_avaliacoes`, `ano_lancamento`, `notas_saida`, `notas_coracao`, `notas_fundo`, `acordes_principais`, `perfumista_1`, `perfumista_2`, `url_fonte`.
- Add calculation columns: `cluster` (integer), `cluster_perfil` (text), `top5_similares` (text[]).
- Implement a seed script `scripts/seed.ts` that reads the JSON data (once found) and performs clustering/similarity calculations using a simple TF-IDF + Cosine similarity approach in Node.js/Bun.
- Apply `GRANT` statements and RLS policies (public read for perfumes).

## Backend (Server Functions)
- `getPerfumes`: Fetch perfumes with filtering (brand, gender, accords, rating).
- `getPerfumeById`: Detailed view including similar perfumes.
- `recommendPerfumes`: Logic for the recommendation quiz based on accords and clusters.

## Frontend & UI
- **Design System**: Refined perfumery aesthetic (beige, black, soft gold) using Tailwind v4 variables.
- **Home/Explore Route**: Search and filterable catalog.
- **Detail Route**: Rich perfume page with olfactory pyramid and similar items.
- **Quiz Route**: 5-step recommendation flow.
- **Footer**: Mandatory data attribution.

## Technical Details
- **Clustering**: K-Means implementation in the seed script (k=12).
- **Similarity**: Jaccard or Cosine similarity on accord/note vectors.
- **Translation**: All UI text in Portuguese (PT-BR).

## Next Steps
1. Locate or request the `perfumes_ptbr.json` file to proceed with seeding.
2. Initialize database schema via migration.
3. Build the core catalog UI.