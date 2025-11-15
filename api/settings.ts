export const config = { runtime: 'edge' }
import { db } from './_db'

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    const { data } = await db.getSettings()
    return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } })
  }
  if (req.method === 'PUT') {
    const key = req.headers.get('x-admin-key')
    const expected = (globalThis as any)?.process?.env?.ADMIN_KEY as string | undefined
    if (!key || (expected && key !== expected)) return new Response('Unauthorized', { status: 401 })
    const body = await req.json()
    await db.setSettings(body)
    return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })
  }
  return new Response('Method Not Allowed', { status: 405 })
}
