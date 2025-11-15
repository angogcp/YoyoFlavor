export const config = { runtime: 'edge' }
import { put } from '@vercel/blob'

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return new Response('Bad Request', { status: 400 })
  const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`
  const res = await put(`uploads/${name}`, file, { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN })
  return new Response(JSON.stringify({ url: res.url }), { headers: { 'content-type': 'application/json' } })
}
