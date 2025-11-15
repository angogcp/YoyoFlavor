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
    return readJson<{ logoUrl: string; bannerUrl: string; address?: string; mapsUrl?: string; lat?: number; lng?: number }>(
      'settings',
      {
        logoUrl: '/images/yoyo logo.png',
        bannerUrl: '/images/yoyo-new-.png',
        address: '324 Jalan Bercham, Taman Medan Bercham, 31400 Ipoh, Perak, Malaysia',
        mapsUrl: 'https://www.google.com/maps/place/Yoyo+Flavor+Cafe/@4.631922,101.122814,17z/data=!4m12!1m5!3m4!2zNMKwMzcnNTQuOSJOIDEwMcKwMDcnMzEuNCJF!8m2!3d4.6319167!4d101.1253889!3m5!1s0x31cdc0132c0f7d8b:0x5d8bc6b4ca67437c!8m2!3d4.6319072!4d101.126609!16s%2Fg%2F11bwfhys0f?entry=ttu&g_ep=EgoyMDI1MTExMi4wIKXMDSoASAFQAw%3D%3D',
        lat: 4.6319072,
        lng: 101.126609
      }
    )
  },
  async setSettings(value: any) {
    await writeJson('settings', value)
  }
}
