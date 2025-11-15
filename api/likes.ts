export const config = { runtime: 'edge' }
import { db } from './_db'

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const key = url.searchParams.get('key') || ''
    const { data } = await db.getLikes()
    const count = Number((data as any)[key] || 0)
    return new Response(JSON.stringify({ key, count }), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'POST') {
    const { key } = await req.json()
    const { data } = await db.getLikes()
    const next = Number((data as any)[key] || 0) + 1
    ;(data as any)[key] = next
    await db.setLikes(data)
    return new Response(JSON.stringify({ key, count: next }), { headers: { 'content-type': 'application/json' } })
  }
  return new Response('Method Not Allowed', { status: 405 })
}
