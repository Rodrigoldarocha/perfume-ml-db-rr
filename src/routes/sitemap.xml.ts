import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sitemap/xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const today = new Date().toISOString().split('T')[0]
        const staticUrls = [
          { loc: `${url.origin}/`, changefreq: 'daily', priority: '1.0' },
          { loc: `${url.origin}/quiz`, changefreq: 'monthly', priority: '0.8' },
          { loc: `${url.origin}/contato`, changefreq: 'monthly', priority: '0.5' },
          { loc: `${url.origin}/privacidade`, changefreq: 'yearly', priority: '0.3' },
        ];

        let perfumeUrls: { id: number }[] = [];
        try {
          const base = (process.env['SUPABASE_URL'] || process.env['VITE_SUPABASE_URL'] || '').replace(/\/$/, '');
          const key = process.env['SUPABASE_PUBLISHABLE_KEY'] || process.env['VITE_SUPABASE_PUBLISHABLE_KEY'] || '';
          if (base && key) {
            const res = await fetch(
              `${base}/rest/v1/perfumes?select=id&order=numero_avaliacoes.desc.nullslast&limit=500`,
              { headers: { apikey: key, Authorization: `Bearer ${key}` } }
            );
            if (res.ok) perfumeUrls = await res.json();
          }
        } catch {
          perfumeUrls = [];
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
${perfumeUrls.map((p) => `  <url><loc>${url.origin}/perfume/${p.id}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>`;

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
          },
        })
      }
    }
  }
})
