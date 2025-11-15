export const config = { runtime: 'nodejs' }
import { db } from './_db'

function xmlEscape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default async function handler(req: Request) {
  const now = new Date().toISOString()
  const url = new URL(req.url)
  const origin = url.origin
  const base = ['', 'menu', 'gallery', 'blog', 'reviews', 'contact', 'quiz']
  const locales = ['en', 'zh']
  const { data } = await db.getPosts()
  const posts = Array.isArray(data) ? data : []
  const urls: Array<{ loc: string; alt: { lang: string; href: string }[]; lastmod?: string }> = []
  for (const l of locales) {
    for (const p of base) {
      const path = p ? `/${l}/${p}` : `/${l}`
      const loc = origin + path
      const alt = locales.map(lang => ({ lang, href: origin + `/${lang}` + (p ? `/${p}` : '') }))
      urls.push({ loc, alt, lastmod: now })
    }
    for (const post of posts) {
      const path = `/${l}/blog/${post.slug}`
      const loc = origin + path
      const alt = locales.map(lang => ({ lang, href: origin + `/${lang}/blog/${post.slug}` }))
      urls.push({ loc, alt, lastmod: post.date || now })
    }
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(u => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    ${u.alt.map(a => `<xhtml:link rel="alternate" hreflang="${a.lang}" href="${xmlEscape(a.href)}"/>`).join('\n    ')}
    <lastmod>${xmlEscape(u.lastmod || now)}</lastmod>
  </url>`).join('\n')}
</urlset>`
  return new Response(body, { headers: { 'content-type': 'application/xml' } })
}
