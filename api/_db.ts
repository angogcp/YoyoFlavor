import { list, put } from '@vercel/blob'

async function readJson<T>(name: string, seed: T): Promise<{ data: T; url?: string }> {
  const prefix = `data/${name}.json`
  const l = await list({ prefix, token: process.env.BLOB_READ_WRITE_TOKEN })
  const item = l.blobs.find(b => b.pathname === prefix)
  if (!item) return { data: seed }
  const res = await fetch(item.url)
  const data = await res.json() as T
  return { data, url: item.url }
}

async function writeJson<T>(name: string, value: T): Promise<void> {
  const body = JSON.stringify(value)
  await put(`data/${name}.json`, body, { contentType: 'application/json', access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN })
}

export const db = {
  async getPosts() {
    const seed = (await import('../src/data/posts')).posts
    return readJson('posts', seed)
  },
  async setPosts(value: any) {
    await writeJson('posts', value)
  },
  async getReviews() {
    return readJson('reviews', [])
  },
  async setReviews(value: any) {
    await writeJson('reviews', value)
  },
  async getLikes() {
    return readJson('likes', {})
  },
  async setLikes(value: any) {
    await writeJson('likes', value)
  },
  async getContacts() {
    return readJson('contacts', [])
  },
  async setContacts(value: any) {
    await writeJson('contacts', value)
  },
  async getSettings() {
    return readJson('settings', { logoUrl: '/images/yoyo logo.png', bannerUrl: '/images/yoyo-new-.png' })
  },
  async setSettings(value: any) {
    await writeJson('settings', value)
  }
}
