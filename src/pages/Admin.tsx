import { Container, Stack, TextField, Button, Typography, Card, CardContent, CardMedia, Grid, Dialog, DialogTitle, DialogContent, Tabs, Tab, Box, Badge, Skeleton } from '@mui/material'
import { useState } from 'react'
import { useQueryClient, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLocation } from 'react-router-dom'
import { t } from '../i18n'

function useLocale() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

export default function Admin() {
  const locale = useLocale()
  const [authorized, setAuthorized] = useState(false)
  const [passInput, setPassInput] = useState('')

  if (!authorized) {
    return (
      <Container sx={{ py: 6, maxWidth: 400 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>{t(locale, 'admin_access')}</Typography>
        <Stack spacing={2}>
          <TextField 
            label={t(locale, 'admin_enter_pass')}
            type="password" 
            value={passInput} 
            onChange={e => setPassInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && passInput === 'ahpin') setAuthorized(true) }}
          />
          <Button 
            variant="contained" 
            onClick={() => { if (passInput === 'ahpin') setAuthorized(true) }}
          >
            {t(locale, 'admin_login')}
          </Button>
        </Stack>
      </Container>
    )
  }
  return <AdminContent locale={locale} />
}

function AdminContent({ locale }: { locale: 'en' | 'zh' }) {
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
      <Typography variant="h4" sx={{ mb: 2 }}>{t(locale, 'admin')}</Typography>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <TextField label={t(locale, 'admin_key')} value={key} onChange={e => setKey(e.target.value)} />
        <Button variant="contained" onClick={saveKey}>{t(locale, 'admin_save_key')}</Button>
      </Stack>
      <Tabs value={tab} onChange={(_, v) => { setTab(v); localStorage.setItem('admin:tab', String(v)) }} variant="scrollable" scrollButtons allowScrollButtonsMobile sx={{ mb: 3 }}>
        <Tab label={<Badge color="primary" variant="standard" invisible badgeContent={0}>{t(locale, 'admin_tab_settings')}</Badge>} />
        <Tab label={<Badge color="primary" variant="standard" invisible badgeContent={0}>{t(locale, 'admin_tab_create')}</Badge>} />
        <Tab label={<Badge color="primary" badgeContent={(contacts?.pages || []).reduce((acc,p)=>acc+p.items.filter(c=> (c.status||'new')==='new').length,0)} invisible={!((contacts?.pages || []).reduce((acc,p)=>acc+p.items.filter(c=> (c.status||'new')==='new').length,0))}>{t(locale, 'admin_tab_contacts')}</Badge>} />
        <Tab label={<Badge color="primary" badgeContent={(postsList || []).length} invisible={!((postsList || []).length)}>{t(locale, 'admin_tab_posts')}</Badge>} />
        <Tab label={<Badge color="primary" badgeContent={(reviews?.pages || []).reduce((acc,p)=>acc+p.items.length,0)} invisible={!((reviews?.pages || []).reduce((acc,p)=>acc+p.items.length,0))}>{t(locale, 'admin_tab_reviews')}</Badge>} />
      </Tabs>
      <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{t(locale, 'admin_brand_settings')}</Typography>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <TextField label={t(locale, 'admin_logo_url')} value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <input id="logo-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setLogoFile(e.target.files?.[0] || null)} />
            <Button variant="outlined" onClick={() => (document.getElementById('logo-file') as HTMLInputElement).click()}>{t(locale, 'admin_upload_logo')}</Button>
            <Typography variant="body2">{logoFile ? logoFile.name : t(locale, 'admin_no_file')}</Typography>
          </Stack>
          <TextField label={t(locale, 'admin_banner_url')} value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <input id="banner-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setBannerFile(e.target.files?.[0] || null)} />
            <Button variant="outlined" onClick={() => (document.getElementById('banner-file') as HTMLInputElement).click()}>{t(locale, 'admin_upload_banner')}</Button>
            <Typography variant="body2">{bannerFile ? bannerFile.name : t(locale, 'admin_no_file')}</Typography>
          </Stack>
          <TextField label={t(locale, 'admin_shop_addr')} value={address} onChange={e => setAddress(e.target.value)} />
          <TextField label={t(locale, 'admin_maps_url')} value={mapsUrl} onChange={e => setMapsUrl(e.target.value)} helperText={t(locale, 'admin_maps_help')} />
          <Stack direction="row" spacing={2}>
            <TextField label={t(locale, 'admin_lat')} value={latText} onChange={e => setLatText(e.target.value)} placeholder="e.g. 4.7284" />
            <TextField label={t(locale, 'admin_lng')} value={lngText} onChange={e => setLngText(e.target.value)} placeholder="e.g. 101.1253" />
          </Stack>
          <Button variant="contained" onClick={saveSettings} disabled={!logoUrl || !bannerUrl}>{t(locale, 'admin_save_settings')}</Button>
        </Stack>
      </Box>
      <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{t(locale, 'admin_create_post')}</Typography>
        <Stack spacing={2}>
          <TextField label={t(locale, 'admin_title')} value={title} onChange={e => setTitle(e.target.value)} />
          <TextField label={t(locale, 'admin_slug')} value={slug} onChange={e => setSlug(e.target.value)} />
          <TextField label={t(locale, 'admin_excerpt')} value={excerpt} onChange={e => setExcerpt(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <TextField label={t(locale, 'admin_image_url')} value={imageUrl} onChange={e => setImageUrl(e.target.value)} fullWidth />
            <input id="blog-file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
            <Button variant="outlined" onClick={() => (document.getElementById('blog-file-input') as HTMLInputElement).click()}>{t(locale, 'admin_upload_image')}</Button>
          </Stack>
          {imageUrl && (
            <Card sx={{ maxWidth: 600 }}>
              <CardMedia component="img" height="200" image={imageUrl} />
              <CardContent>
                <Typography variant="body2">{t(locale, 'admin_preview')}</Typography>
              </CardContent>
            </Card>
          )}
          <Button variant="contained" onClick={createPost} disabled={!title.trim() || !slug.trim() || !excerpt.trim()}>{t(locale, 'admin_create')}</Button>
          {status === 'success' && <Typography color="success.main">{t(locale, 'admin_post_created')}</Typography>}
          {status === 'error' && <Typography color="error.main">{t(locale, 'admin_post_failed')}</Typography>}
        </Stack>
      </Box>
      <Box sx={{ display: tab === 2 ? 'block' : 'none' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{t(locale, 'admin_tab_contacts')}</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField label={t(locale, 'admin_search')} value={qContacts} onChange={e => setQContacts(e.target.value)} onBlur={() => refetch()} />
          <Button variant={filter === '' ? 'contained' : 'outlined'} onClick={() => { setFilter(''); refetch() }}>{t(locale, 'admin_all')}</Button>
          <Button variant={filter === 'new' ? 'contained' : 'outlined'} onClick={() => { setFilter('new'); refetch() }}>{t(locale, 'admin_new')}</Button>
          <Button variant={filter === 'replied' ? 'contained' : 'outlined'} onClick={() => { setFilter('replied'); refetch() }}>{t(locale, 'admin_replied')}</Button>
          <Button variant="outlined" onClick={exportCsv}>{t(locale, 'admin_export_csv')}</Button>
        </Stack>
        <Grid container spacing={2}>
          {contactsLoading && (!contactsItems.length) && [1,2].map(i => (
            <Grid item xs={12} md={6} key={`sk-contact-${i}`}>
              <Card>
                <CardContent>
                  <Skeleton width="60%" />
                  <Skeleton width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
          {contactsItems.map(c => (
            <Grid item xs={12} md={6} key={c.id}>
              <Card sx={{ borderLeft: c.status === 'new' ? '4px solid green' : 'none' }}>
                <CardContent>
                  <Typography variant="subtitle2">{c.name} ({c.email})</Typography>
                  <Typography variant="caption">{new Date(c.date).toLocaleString()}</Typography>
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{c.message}</Typography>
                  {c.reply && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="caption" color="primary">{t(locale, 'admin_replied_label')}{c.reply}</Typography>
                    </Box>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button size="small" onClick={() => { setReplyTarget({ id: c.id, email: c.email }); setReplyOpen(true) }}>{t(locale, 'admin_reply_action')}</Button>
                    <Button size="small" color="error" onClick={() => del.mutate(c.id)}>{t(locale, 'admin_delete_action')}</Button>
                    {c.status === 'new' && <Button size="small" onClick={() => mark.mutate({ id: c.id, status: 'read' })}>{t(locale, 'admin_mark_read')}</Button>}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {hasNextPage && <Button onClick={() => fetchNextPage()} sx={{ mt: 2 }}>{t(locale, 'admin_load_more')}</Button>}
      </Box>
      <Box sx={{ display: tab === 3 ? 'block' : 'none' }}>
         {/* Posts list - reuse existing structure but could add translations if needed */}
         <Stack spacing={2}>
           {(postsList || []).map(p => (
             <Card key={p.slug}>
               <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2 }}>
                  {p.image && <CardMedia component="img" sx={{ width: 80, height: 80, borderRadius: 1 }} image={p.image} />}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{p.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{p.slug}</Typography>
                  </Box>
                  <Button color="error" onClick={() => removePost.mutate(p.slug)}>{t(locale, 'admin_delete_action')}</Button>
               </Stack>
             </Card>
           ))}
         </Stack>
      </Box>
      <Box sx={{ display: tab === 4 ? 'block' : 'none' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{t(locale, 'admin_tab_reviews')}</Typography>
        <Stack spacing={2}>
          {reviewsItems.map(r => (
            <Card key={r.id}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  {r.image && <CardMedia component="img" sx={{ width: 60, height: 60, borderRadius: 1 }} image={r.image} />}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">{r.name} - {r.rating}★</Typography>
                    <Typography variant="body2">{r.comment}</Typography>
                  </Box>
                  <Button color="warning" onClick={() => hideReview.mutate(r.id)}>{t(locale, 'admin_hide')}</Button>
                  <Button color="error" onClick={() => deleteReview.mutate(r.id)}>{t(locale, 'admin_delete_action')}</Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
        {hasMoreReviews && <Button onClick={() => fetchMoreReviews()} sx={{ mt: 2 }}>{t(locale, 'admin_load_more')}</Button>}
      </Box>

      <Dialog open={replyOpen} onClose={() => setReplyOpen(false)}>
        <DialogTitle>{t(locale, 'admin_reply_dialog_title')} {replyTarget?.email}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t(locale, 'admin_reply_dialog_msg')}
            fullWidth
            multiline
            rows={4}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setReplyOpen(false)}>{t(locale, 'admin_cancel')}</Button>
            <Button variant="contained" onClick={() => replyTarget && sendReply.mutate({ id: replyTarget.id, text: replyText })}>{t(locale, 'admin_send')}</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Container>
  )
}
