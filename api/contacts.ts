export const config = { runtime: 'edge' }
import { db } from './_db'

function id() { return Math.random().toString(36).slice(2, 10) }

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const byId = url.searchParams.get('id')
    if (byId) {
      const { data } = await db.getContacts()
      const list = Array.isArray(data) ? data : []
      const item = list.find((c: any) => c.id === byId)
      if (!item) return new Response('Not Found', { status: 404 })
      return new Response(JSON.stringify(item), { headers: { 'content-type': 'application/json' } })
    }
    const key = req.headers.get('x-admin-key')
    const expected = process.env.ADMIN_KEY
    if (!key || (expected && key !== expected)) return new Response('Unauthorized', { status: 401 })
    const offset = Number(url.searchParams.get('offset') || 0)
    const limit = Number(url.searchParams.get('limit') || 0)
    const status = url.searchParams.get('status') || ''
    const q = (url.searchParams.get('q') || '').toLowerCase()
    const { data } = await db.getContacts()
    let list = Array.isArray(data) ? data : []
    if (status) list = list.filter((c: any) => (c.status || 'new') === status)
    if (q) list = list.filter((c: any) => (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.message || '').toLowerCase().includes(q))
    const sliced = limit > 0 ? list.slice(offset, offset + limit) : list
    return new Response(JSON.stringify({ total: list.length, items: sliced }), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'POST') {
    const body = await req.json() as { name: string; email: string; message: string }
    if (!body.name || !body.email || !body.message) return new Response('Bad Request', { status: 400 })
    const { data } = await db.getContacts()
    const item = { id: id(), date: new Date().toISOString(), status: 'new', ...body }
    const list = Array.isArray(data) ? data : []
    list.unshift(item)
    await db.setContacts(list)
    return new Response(JSON.stringify(item), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'PATCH') {
    const key = req.headers.get('x-admin-key')
    const expected = process.env.ADMIN_KEY
    if (!key || (expected && key !== expected)) return new Response('Unauthorized', { status: 401 })
    const body = await req.json() as { id: string; status?: string; reply?: string }
    const { data } = await db.getContacts()
    const list = Array.isArray(data) ? data : []
    const idx = list.findIndex((c: any) => c.id === body.id)
    if (idx === -1) return new Response('Not Found', { status: 404 })
    const next: any = { ...list[idx] }
    if (body.status) {
      next.status = body.status
      if (body.status === 'replied') next.repliedAt = new Date().toISOString()
    }
    if (typeof body.reply === 'string') {
      next.reply = body.reply
      next.repliedAt = new Date().toISOString()
      next.status = next.status || 'replied'
    }
    list[idx] = next
    await db.setContacts(list)
    return new Response(JSON.stringify(list[idx]), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'DELETE') {
    const key = req.headers.get('x-admin-key')
    const expected = process.env.ADMIN_KEY
    if (!key || (expected && key !== expected)) return new Response('Unauthorized', { status: 401 })
    const url = new URL(req.url)
    const id = url.searchParams.get('id') || ''
    const { data } = await db.getContacts()
    const list = Array.isArray(data) ? data : []
    const next = list.filter((c: any) => c.id !== id)
    await db.setContacts(next)
    return new Response(null, { status: 204 })
  }
  return new Response('Method Not Allowed', { status: 405 })
}
