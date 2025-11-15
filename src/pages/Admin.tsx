import { Container, Stack, TextField, Button, Typography, Card, CardContent, CardMedia, Grid, Dialog, DialogTitle, DialogContent, Tabs, Tab, Box, Badge, Skeleton } from '@mui/material'
import { useState } from 'react'
import { useQueryClient, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLocation } from 'react-router-dom'

export default function Admin() {
  const loc = useLocation()
  const [pass, setPass] = useState(() => {
    const p = new URLSearchParams(loc.search).get('passkey') || localStorage.getItem('admin:passkey') || ''
    if (p === 'ahpin') localStorage.setItem('admin:passkey', 'ahpin')
    return p
  })
  const [passInput, setPassInput] = useState('')
  const allowed = pass === 'ahpin'
  if (!allowed) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Admin Access</Typography>
        <Stack spacing={2} sx={{ maxWidth: 360 }}>
          <TextField label="Passkey" type="password" value={passInput} onChange={e => setPassInput(e.target.value)} />
          <Button variant="contained" onClick={() => { if (passInput.trim() === 'ahpin') { localStorage.setItem('admin:passkey', 'ahpin'); setPass('ahpin') } }}>Enter</Button>
          <Typography variant="body2" color="text.secondary">You can also access by visiting /admin?passkey=ahpin</Typography>
        </Stack>
      </Container>
    )
  }
  return <AdminContent />
}

function AdminContent() {
  const qc = useQueryClient()
  const [key, setKey] = useState(localStorage.getItem('admin:key') || '')
  const [tab, setTab] = useState(() => parseInt(localStorage.getItem('admin:tab') || '0') || 0)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  async function saveKey() { localStorage.setItem('admin:key', key.trim()) }
  async function createPost() {
    try {
      let img = imageUrl.trim() || ''
      if (file) img = await api.uploadImage(file)
      await api.createPost({ slug, title, excerpt, image: img })
      setStatus('success')
      qc.invalidateQueries({ queryKey: ['posts'] })
      setTitle('')
      setSlug('')
      setExcerpt('')
      setImageUrl('')
      setFile(null)
    } catch { setStatus('error') }
  }
  const pageSize = 8
  const [filter, setFilter] = useState<string>('')
  const [qContacts, setQContacts] = useState('')
  const { data: contacts, fetchNextPage, hasNextPage, refetch, isLoading: contactsLoading } = useInfiniteQuery({
    queryKey: ['contacts', filter, qContacts],
    queryFn: ({ pageParam = 0 }) => api.getContactsPaged(pageParam, pageSize, filter || undefined, qContacts || undefined),
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((acc, p) => acc + p.items.length, 0)
      return loaded < last.total ? loaded : undefined
    },
    initialPageParam: 0
  })
  const contactsItems = contacts?.pages.flatMap(p => p.items) ?? []
  const mark = useMutation({ mutationFn: (vars: { id: string; status: string }) => api.updateContactStatus(vars.id, vars.status), onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }) })
  const del = useMutation({ mutationFn: (id: string) => api.deleteContact(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }) })
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyTarget, setReplyTarget] = useState<{ id: string; email: string } | null>(null)
  const sendReply = useMutation({ mutationFn: (vars: { id: string; text: string }) => api.replyToContact(vars.id, vars.text), onSuccess: () => { setReplyOpen(false); setReplyText(''); setReplyTarget(null); qc.invalidateQueries({ queryKey: ['contacts'] }) } })
  function exportCsv() {
    const headers = ['id','name','email','message','status','date','repliedAt']
    const rows = contactsItems.map(c => [c.id, c.name, c.email, c.message.replace(/\n/g,' '), c.status, c.date, c.repliedAt || ''])
    const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => api.getSettings() })
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || '')
  const [bannerUrl, setBannerUrl] = useState(settings?.bannerUrl || '')
  const [address, setAddress] = useState(settings?.address || '')
  const [mapsUrl, setMapsUrl] = useState(settings?.mapsUrl || '')
  const [latText, setLatText] = useState('')
  const [lngText, setLngText] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [postsQ, setPostsQ] = useState('')
  async function saveSettings() {
    let logo = logoUrl
    let banner = bannerUrl
    if (logoFile) logo = await api.uploadImage(logoFile)
    if (bannerFile) banner = await api.uploadImage(bannerFile)
    const lat = latText.trim() ? parseFloat(latText.trim()) : undefined
    const lng = lngText.trim() ? parseFloat(lngText.trim()) : undefined
    await api.updateSettings({ logoUrl: logo, bannerUrl: banner, address, mapsUrl, lat, lng })
    qc.invalidateQueries({ queryKey: ['settings'] })
  }
  const { data: reviews, fetchNextPage: fetchMoreReviews, hasNextPage: hasMoreReviews, isLoading: reviewsLoading } = useInfiniteQuery({
    queryKey: ['admin-reviews'],
    queryFn: ({ pageParam = 0 }) => api.getReviewsPaged(pageParam, 10),
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((acc, p) => acc + p.items.length, 0)
      return loaded < last.total ? loaded : undefined
    },
    initialPageParam: 0
  })
  const reviewsItems = reviews?.pages.flatMap(p => p.items) ?? []
  const hideReview = useMutation({ mutationFn: (id: string) => api.updateReviewStatus(id, 'hidden'), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }) })
  const deleteReview = useMutation({ mutationFn: (id: string) => api.deleteReview(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }) })
  const { data: postsList } = useQuery({ queryKey: ['posts'], queryFn: () => api.getPosts() })
  const savePost = useMutation({ mutationFn: (p: { slug: string; title?: string; excerpt?: string; image?: string }) => api.updatePost(p), onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }) })
  const removePost = useMutation({ mutationFn: (slug: string) => api.deletePost(slug), onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }) })
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Admin</Typography>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <TextField label="Admin Key" value={key} onChange={e => setKey(e.target.value)} />
        <Button variant="contained" onClick={saveKey}>Save Key</Button>
      </Stack>
      <Tabs value={tab} onChange={(_, v) => { setTab(v); localStorage.setItem('admin:tab', String(v)) }} variant="scrollable" scrollButtons allowScrollButtonsMobile sx={{ mb: 3 }}>
        <Tab label={<Badge color="primary" variant="standard" invisible badgeContent={0}>Settings</Badge>} />
        <Tab label={<Badge color="primary" variant="standard" invisible badgeContent={0}>Create Post</Badge>} />
        <Tab label={<Badge color="primary" badgeContent={(contacts?.pages || []).reduce((acc,p)=>acc+p.items.filter(c=> (c.status||'new')==='new').length,0)} invisible={!((contacts?.pages || []).reduce((acc,p)=>acc+p.items.filter(c=> (c.status||'new')==='new').length,0))}>Contacts</Badge>} />
        <Tab label={<Badge color="primary" badgeContent={(postsList || []).length} invisible={!((postsList || []).length)}>Posts</Badge>} />
        <Tab label={<Badge color="primary" badgeContent={(reviews?.pages || []).reduce((acc,p)=>acc+p.items.length,0)} invisible={!((reviews?.pages || []).reduce((acc,p)=>acc+p.items.length,0))}>Reviews</Badge>} />
      </Tabs>
      <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Brand Settings</Typography>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <TextField label="Logo URL" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <input id="logo-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setLogoFile(e.target.files?.[0] || null)} />
            <Button variant="outlined" onClick={() => (document.getElementById('logo-file') as HTMLInputElement).click()}>Upload logo</Button>
            <Typography variant="body2">{logoFile ? logoFile.name : 'No file selected'}</Typography>
          </Stack>
          <TextField label="Banner URL" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <input id="banner-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setBannerFile(e.target.files?.[0] || null)} />
            <Button variant="outlined" onClick={() => (document.getElementById('banner-file') as HTMLInputElement).click()}>Upload banner</Button>
            <Typography variant="body2">{bannerFile ? bannerFile.name : 'No file selected'}</Typography>
          </Stack>
          <TextField label="Shop Address" value={address} onChange={e => setAddress(e.target.value)} />
          <TextField label="Google Maps URL" value={mapsUrl} onChange={e => setMapsUrl(e.target.value)} helperText="Paste a precise maps link or leave blank to auto-generate from address" />
          <Stack direction="row" spacing={2}>
            <TextField label="Latitude" value={latText} onChange={e => setLatText(e.target.value)} placeholder="e.g. 4.7284" />
            <TextField label="Longitude" value={lngText} onChange={e => setLngText(e.target.value)} placeholder="e.g. 101.1253" />
          </Stack>
          <Button variant="contained" onClick={saveSettings} disabled={!logoUrl || !bannerUrl}>Save Settings</Button>
        </Stack>
      </Box>
      <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Create Blog Post</Typography>
        <Stack spacing={2}>
          <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <TextField label="Slug" value={slug} onChange={e => setSlug(e.target.value)} />
          <TextField label="Excerpt" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <TextField label="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} fullWidth />
            <input id="blog-file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
            <Button variant="outlined" onClick={() => (document.getElementById('blog-file-input') as HTMLInputElement).click()}>Upload image</Button>
          </Stack>
          {imageUrl && (
            <Card sx={{ maxWidth: 600 }}>
              <CardMedia component="img" height="200" image={imageUrl} />
              <CardContent>
                <Typography variant="body2">Preview</Typography>
              </CardContent>
            </Card>
          )}
          <Button variant="contained" onClick={createPost} disabled={!title.trim() || !slug.trim() || !excerpt.trim()}>Create</Button>
          {status === 'success' && <Typography color="success.main">Post created.</Typography>}
          {status === 'error' && <Typography color="error.main">Failed to create post.</Typography>}
        </Stack>
      </Box>
      <Box sx={{ display: tab === 2 ? 'block' : 'none' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Contacts</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField label="Search" value={qContacts} onChange={e => setQContacts(e.target.value)} onBlur={() => refetch()} />
          <Button variant={filter === '' ? 'contained' : 'outlined'} onClick={() => { setFilter(''); refetch() }}>All</Button>
          <Button variant={filter === 'new' ? 'contained' : 'outlined'} onClick={() => { setFilter('new'); refetch() }}>New</Button>
          <Button variant={filter === 'replied' ? 'contained' : 'outlined'} onClick={() => { setFilter('replied'); refetch() }}>Replied</Button>
          <Button variant="outlined" onClick={exportCsv}>Export CSV</Button>
        </Stack>
        <Grid container spacing={2}>
          {contactsLoading && (!contactsItems.length) && [1,2].map(i => (
            <Grid item xs={12} md={6} key={`sk-contact-${i}`}>
              <Card>
                <CardContent>
                  <Skeleton width="60%" />
                  <Skeleton width="80%" />
                  <Skeleton width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
          {contactsItems.map(c => (
            <Grid item xs={12} md={6} key={c.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{c.name} — {c.email}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography variant="caption">Ref ID: {c.id}</Typography>
                    <Button size="small" variant="text" onClick={() => navigator.clipboard.writeText(c.id)}>Copy</Button>
                  </Stack>
                  <Typography variant="caption">{new Date(c.date).toLocaleString()}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{c.message}</Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button size="small" variant="contained" onClick={() => mark.mutate({ id: c.id, status: 'replied' })}>Mark replied</Button>
                    <Button size="small" variant="outlined" onClick={() => { setReplyTarget({ id: c.id, email: c.email }); setReplyOpen(true) }}>Reply</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => del.mutate(c.id)}>Delete</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {hasNextPage && <Button sx={{ mt: 2 }} variant="outlined" onClick={() => fetchNextPage()}>Load more</Button>}
      </Box>
      <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} maxWidth="sm">
        <DialogTitle>Reply to {replyTarget?.email}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption">Ref ID: {replyTarget?.id}</Typography>
              {replyTarget && <Button size="small" variant="text" onClick={() => navigator.clipboard.writeText(replyTarget.id)}>Copy</Button>}
            </Stack>
            <TextField label="Message" value={replyText} onChange={e => setReplyText(e.target.value)} multiline minRows={4} />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" disabled={!replyText.trim() || !replyTarget} onClick={() => sendReply.mutate({ id: replyTarget!.id, text: replyText.trim() })}>Save Reply</Button>
              {replyTarget && (
                <Button
                  variant="outlined"
                  href={`mailto:${encodeURIComponent(replyTarget.email)}?subject=${encodeURIComponent('YoYo Flavor reply — Ref ' + replyTarget.id)}&body=${encodeURIComponent('Ref ID: ' + replyTarget.id + '\n\n' + replyText)}`}
                >
                  Reply by Email
                </Button>
              )}
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
      <Box sx={{ display: tab === 3 ? 'block' : 'none' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Posts Management</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField label="Search posts" placeholder="Title or slug" value={postsQ} onChange={e => setPostsQ(e.target.value)} />
        </Stack>
        <Grid container spacing={2}>
          {(!postsList || !postsList.length) && [1,2].map(i => (
            <Grid item xs={12} md={6} key={`sk-post-${i}`}>
              <Card>
                <Skeleton variant="rectangular" height={160} />
                <CardContent>
                  <Skeleton width="50%" />
                  <Skeleton width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
          {(postsList || []).filter(p => {
            const q = postsQ.toLowerCase();
            return !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
          }).sort((a,b)=> new Date(b.date).getTime()-new Date(a.date).getTime()).map(p => (
            <Grid item xs={12} md={6} key={p.slug}>
              <Card>
                <CardMedia component="img" height={160} image={p.image} />
                <CardContent>
                  <Stack spacing={1}>
                    <TextField label="Title" defaultValue={p.title} onBlur={e => savePost.mutate({ slug: p.slug, title: e.target.value })} />
                    <TextField label="Excerpt" defaultValue={p.excerpt} onBlur={e => savePost.mutate({ slug: p.slug, excerpt: e.target.value })} />
                    <TextField label="Image URL" defaultValue={p.image} onBlur={e => savePost.mutate({ slug: p.slug, image: e.target.value })} />
                    <Stack direction="row" spacing={2}>
                      <Button size="small" color="error" variant="outlined" onClick={() => removePost.mutate(p.slug)}>Delete</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box sx={{ display: tab === 4 ? 'block' : 'none' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Reviews Moderation</Typography>
        <Grid container spacing={2}>
          {(!reviewsItems.length) && [1,2,3].map(i => (
            <Grid item xs={12} md={6} key={`sk-rev-${i}`}>
              <Card>
                <CardContent>
                  <Skeleton width="40%" />
                  <Skeleton width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
          {reviewsItems.map(r => (
            <Grid item xs={12} md={6} key={r.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{r.name}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{r.comment}</Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button size="small" variant="outlined" onClick={() => hideReview.mutate(r.id)}>Hide</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => deleteReview.mutate(r.id)}>Delete</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {hasMoreReviews && <Button sx={{ mt: 2 }} variant="outlined" onClick={() => fetchMoreReviews()}>Load more</Button>}
      </Box>
    </Container>
  )
}
