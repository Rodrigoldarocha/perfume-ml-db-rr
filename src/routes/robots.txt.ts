import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/robots/txt')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const robots = `User-agent: *
Allow: /
Sitemap: ${url.origin}/sitemap.xml`

        return new Response(robots, {
          headers: {
            'Content-Type': 'text/plain',
          },
        })
      }
    }
  }
})
