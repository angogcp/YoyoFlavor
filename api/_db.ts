async function readJson<T>(name: string, seed: T): Promise<{ data: T; url?: string }> {
  const prefix = `data/${name}.json`
  const token = (globalThis as any)?.process?.env?.BLOB_READ_WRITE_TOKEN as string | undefined
  const { list } = await import('@vercel/blob')
  const l = await list({ prefix, token })
  const item = l.blobs.find(b => b.pathname === prefix)
  if (!item) return { data: seed }
  const res = await fetch(item.url)
  const data = await res.json() as T
  return { data, url: item.url }
}

async function writeJson<T>(name: string, value: T): Promise<void> {
  const body = JSON.stringify(value)
  const token = (globalThis as any)?.process?.env?.BLOB_READ_WRITE_TOKEN as string | undefined
  const { put } = await import('@vercel/blob')
  await put(`data/${name}.json`, body, { contentType: 'application/json', access: 'public', token })
}

export const db = {
  async getPosts() {
    const seed = (await import('../src/data/posts')).posts as any[]
    return readJson<any[]>('posts', seed)
  },
  async setPosts(value: any) {
    await writeJson('posts', value)
  },
  async getReviews() {
    return readJson<any[]>('reviews', [])
  },
  async setReviews(value: any) {
    await writeJson('reviews', value)
  },
  async getLikes() {
    return readJson<Record<string, number>>('likes', {})
  },
  async setLikes(value: any) {
    await writeJson('likes', value)
  },
  async getContacts() {
    return readJson<any[]>('contacts', [])
  },
  async setContacts(value: any) {
    await writeJson('contacts', value)
  },
  async getSettings() {
    return readJson<{ logoUrl: string; bannerUrl: string }>('settings', { logoUrl: '/images/yoyo logo.png', bannerUrl: '/images/yoyo-new-.png' })
  },
  async setSettings(value: any) {
    await writeJson('settings', value)
  }
}
