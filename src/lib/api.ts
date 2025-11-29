export type Review = { id: string; name: string; rating: number; comment: string; date: string; image?: string; status?: string }
export type Post = { slug: string; title: string; excerpt: string; date: string; image: string }
export type Comment = { id: string; date: string; name: string; message: string }
export type Contact = { id: string; name: string; email: string; message: string; date: string; status: string; reply?: string; repliedAt?: string }
export type Settings = { logoUrl: string; bannerUrl: string; address?: string; mapsUrl?: string; lat?: number; lng?: number }

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

const isDev = import.meta.env.DEV

import { posts as seededPosts } from '../data/posts'
import { reviews as seededReviews } from '../data/reviews'

function lsGet<T>(key: string, seed: T): T {
  const s = localStorage.getItem(key)
  if (!s) return seed
  try { return JSON.parse(s) as T } catch { return seed }
}

function lsSet<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const api = {
  async getPosts(): Promise<Post[]> {
    if (isDev) {
      const ls = lsGet<Post[]>('posts', [])
      const merged = ls.length ? [...ls, ...seededPosts.filter(p => !ls.some(l => l.slug === p.slug))] : seededPosts
      return merged
    }
    try {
      return await fetch('/api/posts').then(json<Post[]>)
    } catch {
      return seededPosts
    }
  },
  async createPost(p: Omit<Post, 'date'>): Promise<Post> {
    if (isDev) {
      const list = lsGet<Post[]>('posts', [])
      const item: Post = { ...p, date: new Date().toISOString() }
      list.unshift(item)
      lsSet('posts', list)
      return item
    }
    const key = localStorage.getItem('admin:key') || ''
    const res = await fetch('/api/posts', { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-key': key }, body: JSON.stringify(p) })
    return json<Post>(res)
  },
  async updatePost(p: { slug: string; title?: string; excerpt?: string; image?: string }): Promise<Post> {
    if (isDev) {
      const list = lsGet<Post[]>('posts', [])
      const idx = list.findIndex(x => x.slug === p.slug)
      if (idx !== -1) list[idx] = { ...list[idx], ...p }
      lsSet('posts', list)
      return list[idx]
    }
    const key = localStorage.getItem('admin:key') || ''
    const res = await fetch('/api/posts', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-admin-key': key }, body: JSON.stringify(p) })
    return json<Post>(res)
  },
  async deletePost(slug: string): Promise<void> {
    if (isDev) {
      const list = lsGet<Post[]>('posts', [])
      lsSet('posts', list.filter(x => x.slug !== slug))
      return
    }
    const key = localStorage.getItem('admin:key') || ''
    await fetch(`/api/posts?slug=${encodeURIComponent(slug)}`, { method: 'DELETE', headers: { 'x-admin-key': key } })
  },
  async getReviews(locale?: 'en' | 'zh'): Promise<Review[]> {
    if (isDev) {
      const list = lsGet<Review[]>('reviews', seededReviews)
      const published = list.filter(r => (r.status ?? 'published') === 'published')
      if (locale === 'zh') {
        const map: Record<string, string> = {
          rv1: '汤底浓郁暖心，服务贴心又迅速。',
          rv2: '美味面条劲道十足，还会再来！',
          rv3: '小吃酥脆，和朋友一起很惬意。',
          rv4: '日式风味平衡又新鲜。',
          rv5: '面包与锅炒香气十足，很满足。',
          rv6: '西式餐点有质感，价格亲民。',
          rv7: '饮品清爽，和辣菜很搭。',
          rv8: '火锅配料很足，汤底层次棒。',
          rv9: '员工亲切，环境干净，是个放松的好地方。',
          rv10: '城里最好吃的面条口感，强烈推荐！'
        }
        return published.map(r => ({ ...r, comment: map[r.id] || r.comment }))
      }
      return published
    }
    try {
      const res = await fetch('/api/reviews')
      const data = await json<{ total: number; items: Review[] }>(res)
      return data.items
    } catch {
      return []
    }
  },
  async getReviewsPaged(offset: number, limit: number, locale?: 'en' | 'zh'): Promise<{ total: number; items: Review[] }> {
    if (isDev) {
      const list = lsGet<Review[]>('reviews', seededReviews)
      const published = list.filter(r => (r.status ?? 'published') === 'published')
      let items = published.slice(offset, offset + limit)
      if (locale === 'zh') {
        const map: Record<string, string> = {
          rv1: '汤底浓郁暖心，服务贴心又迅速。',
          rv2: '美味面条劲道十足，还会再来！',
          rv3: '小吃酥脆，和朋友一起很惬意。',
          rv4: '日式风味平衡又新鲜。',
          rv5: '面包与锅炒香气十足，很满足。',
          rv6: '西式餐点有质感，价格亲民。',
          rv7: '饮品清爽，和辣菜很搭。',
          rv8: '火锅配料很足，汤底层次棒。',
          rv9: '员工亲切，环境干净，是个放松的好地方。',
          rv10: '城里最好吃的面条口感，强烈推荐！'
        }
        items = items.map(r => ({ ...r, comment: map[r.id] || r.comment }))
      }
      return { total: published.length, items }
    }
    try {
      const url = `/api/reviews?offset=${offset}&limit=${limit}`
      const res = await fetch(url)
      return await json<{ total: number; items: Review[] }>(res)
    } catch {
      const list = lsGet<Review[]>('reviews', [])
      const items = list.slice(offset, offset + limit)
      return { total: list.length, items }
    }
  },
  async updateReviewStatus(id: string, status: string): Promise<Review> {
    if (isDev) {
      const list = lsGet<Review[]>('reviews', [])
      const idx = list.findIndex(r => r.id === id)
      if (idx !== -1) list[idx] = { ...list[idx], status } as any
      lsSet('reviews', list)
      return list[idx]
    }
    try {
      const key = localStorage.getItem('admin:key') || ''
      const res = await fetch('/api/reviews', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-admin-key': key }, body: JSON.stringify({ id, status }) })
      return await json<Review>(res)
    } catch {
      const list = lsGet<Review[]>('reviews', [])
      const idx = list.findIndex(r => r.id === id)
      if (idx !== -1) list[idx] = { ...list[idx], status } as any
      lsSet('reviews', list)
      return list[idx]
    }
  },
  async deleteReview(id: string): Promise<void> {
    if (isDev) {
      const list = lsGet<Review[]>('reviews', [])
      lsSet('reviews', list.filter(r => r.id !== id))
      return
    }
    try {
      const key = localStorage.getItem('admin:key') || ''
      await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-admin-key': key } })
    } catch {
      const list = lsGet<Review[]>('reviews', [])
      lsSet('reviews', list.filter(r => r.id !== id))
    }
  },
  async addReview(r: Omit<Review, 'id' | 'date'>): Promise<Review> {
    if (isDev) {
      const list = lsGet<Review[]>('reviews', [])
      const item: Review = { id: Math.random().toString(36).slice(2, 10), date: new Date().toISOString(), status: 'published', ...r }
      list.unshift(item)
      lsSet('reviews', list)
      return item
    }
    try {
      const body = JSON.stringify(r)
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'content-type': 'application/json' }, body })
      return json<Review>(res)
    } catch {
      const list = lsGet<Review[]>('reviews', [])
      const item: Review = { id: Math.random().toString(36).slice(2, 10), date: new Date().toISOString(), status: 'published', ...r }
      list.unshift(item)
      lsSet('reviews', list)
      return item
    }
  },
  async getLikes(key: string): Promise<number> {
    if (isDev) {
      const local = localStorage.getItem(`likes:${key}`)
      return local ? parseInt(local) || 0 : 0
    }
    try {
      const data = await fetch(`/api/likes?key=${encodeURIComponent(key)}`).then(json<{ key: string; count: number }>)
      return data.count
    } catch {
      const local = localStorage.getItem(`likes:${key}`)
      return local ? parseInt(local) || 0 : 0
    }
  },
  async like(key: string): Promise<number> {
    if (isDev) {
      const v = (await api.getLikes(key)) + 1
      localStorage.setItem(`likes:${key}`, String(v))
      return v
    }
    try {
      const data = await fetch('/api/likes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key }) }).then(json<{ key: string; count: number }>)
      return data.count
    } catch {
      const v = (await api.getLikes(key)) + 1
      localStorage.setItem(`likes:${key}`, String(v))
      return v
    }
  },
  async uploadImage(file: File): Promise<string> {
    if (isDev) {
      const reader = new FileReader()
      const p = new Promise<string>((resolve, reject) => {
        reader.onerror = () => reject(new Error('read'))
        reader.onload = () => resolve(String(reader.result))
      })
      reader.readAsDataURL(file)
      return p
    }
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await json<{ url: string }>(res)
    return data.url
  },
  async getPostComments(slug: string, offset: number, limit: number): Promise<{ total: number; items: Comment[] }> {
    if (isDev) {
      const list = lsGet<Comment[]>(`comments:${slug}`, [])
      return { total: list.length, items: list.slice(offset, offset + limit) }
    }
    const url = `/api/comments?post=${encodeURIComponent(slug)}&offset=${offset}&limit=${limit}`
    const res = await fetch(url)
    return json<{ total: number; items: Comment[] }>(res)
  },
  async addPostComment(slug: string, name: string, message: string): Promise<Comment> {
    if (isDev) {
      const list = lsGet<Comment[]>(`comments:${slug}`, [])
      const item: Comment = { id: Math.random().toString(36).slice(2, 10), date: new Date().toISOString(), name, message }
      list.unshift(item)
      lsSet(`comments:${slug}`, list)
      return item
    }
    const res = await fetch('/api/comments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ post: slug, name, message }) })
    return json<Comment>(res)
  },
  async submitContact(name: string, email: string, message: string): Promise<Contact> {
    if (isDev) {
      const list = lsGet<Contact[]>('contacts', [])
      const item: Contact = { id: Math.random().toString(36).slice(2, 10), date: new Date().toISOString(), name, email, message, status: 'new' }
      list.unshift(item)
      lsSet('contacts', list)
      return item
    }
    try {
      const res = await fetch('/api/contacts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, email, message }) })
      return await json<Contact>(res)
    } catch {
      const list = lsGet<Contact[]>('contacts', [])
      const item: Contact = { id: Math.random().toString(36).slice(2, 10), date: new Date().toISOString(), name, email, message, status: 'new' }
      list.unshift(item)
      lsSet('contacts', list)
      return item
    }
  },
  async getContactsPaged(offset: number, limit: number, status?: string, q?: string): Promise<{ total: number; items: Contact[] }> {
    if (isDev) {
      let list = lsGet<Contact[]>('contacts', [])
      if (status) list = list.filter(c => (c.status || 'new') === status)
      if (q) {
        const qq = q.toLowerCase()
        list = list.filter(c => c.name.toLowerCase().includes(qq) || c.email.toLowerCase().includes(qq) || c.message.toLowerCase().includes(qq))
      }
      return { total: list.length, items: list.slice(offset, offset + limit) }
    }
    try {
      const key = localStorage.getItem('admin:key') || ''
      const params = new URLSearchParams({ offset: String(offset), limit: String(limit) })
      if (status) params.set('status', status)
      if (q) params.set('q', q)
      const res = await fetch(`/api/contacts?${params}`, { headers: { 'x-admin-key': key } })
      return await json<{ total: number; items: Contact[] }>(res)
    } catch {
      let list = lsGet<Contact[]>('contacts', [])
      if (status) list = list.filter(c => (c.status || 'new') === status)
      if (q) {
        const qq = q.toLowerCase()
        list = list.filter(c => c.name.toLowerCase().includes(qq) || c.email.toLowerCase().includes(qq) || c.message.toLowerCase().includes(qq))
      }
      return { total: list.length, items: list.slice(offset, offset + limit) }
    }
  },
  async updateContactStatus(id: string, status: string): Promise<Contact> {
    if (isDev) {
      const list = lsGet<Contact[]>('contacts', [])
      const idx = list.findIndex(c => c.id === id)
      if (idx !== -1) list[idx] = { ...list[idx], status }
      lsSet('contacts', list)
      return list[idx]
    }
    try {
      const key = localStorage.getItem('admin:key') || ''
      const res = await fetch('/api/contacts', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-admin-key': key }, body: JSON.stringify({ id, status }) })
      return await json<Contact>(res)
    } catch {
      const list = lsGet<Contact[]>('contacts', [])
      const idx = list.findIndex(c => c.id === id)
      if (idx !== -1) list[idx] = { ...list[idx], status }
      lsSet('contacts', list)
      return list[idx]
    }
  },
  async replyToContact(id: string, reply: string): Promise<Contact> {
    if (isDev) {
      const list = lsGet<Contact[]>('contacts', [])
      const idx = list.findIndex(c => c.id === id)
      if (idx !== -1) list[idx] = { ...list[idx], reply, status: 'replied', repliedAt: new Date().toISOString() }
      lsSet('contacts', list)
      return list[idx]
    }
    try {
      const key = localStorage.getItem('admin:key') || ''
      const res = await fetch('/api/contacts', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-admin-key': key }, body: JSON.stringify({ id, reply }) })
      return await json<Contact>(res)
    } catch {
      const list = lsGet<Contact[]>('contacts', [])
      const idx = list.findIndex(c => c.id === id)
      if (idx !== -1) list[idx] = { ...list[idx], reply, status: 'replied', repliedAt: new Date().toISOString() }
      lsSet('contacts', list)
      return list[idx]
    }
  },
  async deleteContact(id: string): Promise<void> {
    if (isDev) {
      const list = lsGet<Contact[]>('contacts', [])
      const next = list.filter(c => c.id !== id)
      lsSet('contacts', next)
      return
    }
    try {
      const key = localStorage.getItem('admin:key') || ''
      await fetch(`/api/contacts?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-admin-key': key } })
    } catch {
      const list = lsGet<Contact[]>('contacts', [])
      const next = list.filter(c => c.id !== id)
      lsSet('contacts', next)
    }
  },
  async getContactById(id: string): Promise<Contact | null> {
    if (isDev) {
      const list = lsGet<Contact[]>('contacts', [])
      return list.find(c => c.id === id) || null
    }
    try {
      const res = await fetch(`/api/contacts?id=${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await json<Contact>(res)
    } catch {
      const list = lsGet<Contact[]>('contacts', [])
      return list.find(c => c.id === id) || null
    }
  },
  async getSettings(): Promise<Settings> {
    if (isDev) {
      const def: Settings = {
        logoUrl: '/images/yoyo logo.png',
        bannerUrl: '/images/yoyo-new-.png',
        address: '324 Jalan Bercham, Taman Medan Bercham, 31400 Ipoh, Perak, Malaysia',
        mapsUrl: 'https://www.google.com/maps/place/Yoyo+Flavor+Cafe/@4.631922,101.122814,17z/data=!4m12!1m5!3m4!2zNMKwMzcnNTQuOSJOIDEwMcKwMDcnMzEuNCJF!8m2!3d4.6319167!4d101.1253889!3m5!1s0x31cdc0132c0f7d8b:0x5d8bc6b4ca67437c!8m2!3d4.6319072!4d101.126609!16s%2Fg%2F11bwfhys0f?entry=ttu&g_ep=EgoyMDI1MTExMi4wIKXMDSoASAFQAw%3D%3D',
        lat: 4.6319072,
        lng: 101.126609
      }
      const s = lsGet<Settings>('settings', def)
      if (s.bannerUrl === '/images/yoyoBanner.png') {
        const migrated = { ...s, bannerUrl: def.bannerUrl }
        lsSet('settings', migrated)
        return migrated
      }
      return s
    }
    const res = await fetch('/api/settings')
    return json<Settings>(res)
  },
  async updateSettings(value: Settings): Promise<Settings> {
    if (isDev) {
      lsSet('settings', value)
      return value
    }
    const key = localStorage.getItem('admin:key') || ''
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'content-type': 'application/json', 'x-admin-key': key }, body: JSON.stringify(value) })
    return json<Settings>(res)
  }
}
