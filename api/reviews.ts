export const config = { runtime: 'nodejs' }
import { db } from './_db'

function id() { return Math.random().toString(36).slice(2, 10) }

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const offset = Number(url.searchParams.get('offset') || 0)
    const limit = Number(url.searchParams.get('limit') || 0)
    const { data } = await db.getReviews()
    const list = Array.isArray(data) ? data.filter((r: any) => (r.status ?? 'published') === 'published') : []
    const sliced = limit > 0 ? list.slice(offset, offset + limit) : list
    return new Response(JSON.stringify({ total: list.length, items: sliced }), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'POST') {
    const body = await req.json()
    const { data } = await db.getReviews()
    const item = { id: id(), date: new Date().toISOString(), status: 'published', ...body }
    data.unshift(item)
    await db.setReviews(data)
    return new Response(JSON.stringify(item), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'PATCH') {
    const key = req.headers.get('x-admin-key')
    const expected = (globalThis as any)?.process?.env?.ADMIN_KEY as string | undefined
    if (!key || (expected && key !== expected)) return new Response('Unauthorized', { status: 401 })
    const body = await req.json() as { id: string; status: string }
    const { data } = await db.getReviews()
    const list = Array.isArray(data) ? data : []
    const idx = list.findIndex((r: any) => r.id === body.id)
    if (idx === -1) return new Response('Not Found', { status: 404 })
    list[idx] = { ...list[idx], status: body.status }
    await db.setReviews(list)
    return new Response(JSON.stringify(list[idx]), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'DELETE') {
    const key = req.headers.get('x-admin-key')
    const expected = (globalThis as any)?.process?.env?.ADMIN_KEY as string | undefined
    if (!key || (expected && key !== expected)) return new Response('Unauthorized', { status: 401 })
    const url = new URL(req.url)
    const id = url.searchParams.get('id') || ''
    const { data } = await db.getReviews()
    const list = Array.isArray(data) ? data : []
    const next = list.filter((r: any) => r.id !== id)
    await db.setReviews(next)
    return new Response(null, { status: 204 })
  }
  return new Response('Method Not Allowed', { status: 405 })
}
