import { createFileRoute } from "@tanstack/react-router";
import { POSTS } from "../lib/blog/posts";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const urls = [
          { loc: `${origin}/`, lastmod: POSTS[0]?.date },
          { loc: `${origin}/posts`, lastmod: POSTS[0]?.date },
          ...POSTS.map((p) => ({ loc: `${origin}/posts/${p.slug}`, lastmod: p.date })),
        ];
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls.map(
            (u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`,
          ),
          "</urlset>",
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
