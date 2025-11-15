export const config = { runtime: 'nodejs' }

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return new Response('Bad Request', { status: 400 })
  const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`
  const token = (globalThis as any)?.process?.env?.BLOB_READ_WRITE_TOKEN as string | undefined
  const { put } = await import('@vercel/blob')
  const res = await put(`uploads/${name}`, file, { access: 'public', token })
  return new Response(JSON.stringify({ url: res.url }), { headers: { 'content-type': 'application/json' } })
}
