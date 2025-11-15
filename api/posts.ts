export const config = { runtime: 'edge' }
import { db } from './_db'

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    const { data } = await db.getPosts()
    return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'POST') {
    const key = req.headers.get('x-admin-key')
    const expected = process.env.ADMIN_KEY
    if (!key || (expected && key !== expected)) return new Response('Unauthorized', { status: 401 })
    const body = await req.json()
    const { data } = await db.getPosts()
    data.unshift({ ...body, date: new Date().toISOString() })
    await db.setPosts(data)
    return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'PATCH') {
    const key = req.headers.get('x-admin-key')
    const expected = process.env.ADMIN_KEY
    if (!key || (expected && key !== expected)) return new Response('Unauthorized', { status: 401 })
    const body = await req.json() as { slug: string; title?: string; excerpt?: string; image?: string }
    const { data } = await db.getPosts()
    const idx = data.findIndex((p: any) => p.slug === body.slug)
    if (idx === -1) return new Response('Not Found', { status: 404 })
    data[idx] = { ...data[idx], ...body }
    await db.setPosts(data)
    return new Response(JSON.stringify(data[idx]), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'DELETE') {
    const key = req.headers.get('x-admin-key')
    const expected = process.env.ADMIN_KEY
    if (!key || (expected && key !== expected)) return new Response('Unauthorized', { status: 401 })
    const url = new URL(req.url)
    const slug = url.searchParams.get('slug') || ''
    const { data } = await db.getPosts()
    const next = data.filter((p: any) => p.slug !== slug)
    await db.setPosts(next)
    return new Response(null, { status: 204 })
  }
  return new Response('Method Not Allowed', { status: 405 })
}
