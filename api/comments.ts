export const config = { runtime: 'nodejs' }
import { db } from './_db'

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const post = url.searchParams.get('post') || ''
    const offset = Number(url.searchParams.get('offset') || 0)
    const limit = Number(url.searchParams.get('limit') || 0)
    const { data } = await db.getLikes() // reuse blob listing
    const key = `comments:${post}`
    const list = (data as any)[key] || []
    const sliced = limit > 0 ? list.slice(offset, offset + limit) : list
    return new Response(JSON.stringify({ total: list.length, items: sliced }), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'POST') {
    const body = await req.json() as { post: string; name: string; message: string }
    const { data } = await db.getLikes()
    const key = `comments:${body.post}`
    const list = Array.isArray((data as any)[key]) ? (data as any)[key] : []
    const item = { id: Math.random().toString(36).slice(2, 10), date: new Date().toISOString(), name: body.name, message: body.message }
    list.unshift(item)
    ;(data as any)[key] = list
    await db.setLikes(data)
    return new Response(JSON.stringify(item), { headers: { 'content-type': 'application/json' } })
  }
  return new Response('Method Not Allowed', { status: 405 })
}
