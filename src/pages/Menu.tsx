import { Box, Container, Grid, Card, CardMedia, CardContent, Typography, TextField, Stack, Button, Dialog, DialogContent, Divider, Chip, Skeleton, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import Page from '../components/Page'
import { useLocation } from 'react-router-dom'
import SEO from '../components/SEO'
import { t } from '../i18n'

function useLocale() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

const categories = [
  { title: 'Noodles & Rice', image: '/images/Noodles and rice.jpg', tags: ['comfort','soft'] },
  { title: 'Hot Pot', image: '/images/HotPot.jpg', tags: ['spicy','share','adventurous'] },
  { title: 'Snacks', image: '/images/Snacks.jpg', tags: ['quick','light','crunchy'] },
  { title: 'Bread & Wok Fried', image: '/images/Bread and Wok fried.jpg', tags: ['crunchy'] },
  { title: 'Japanese Flavor', image: '/images/japanese flav.jpg', tags: ['balanced'] },
  { title: 'Western', image: '/images/Western.jpg', tags: ['comfort'] },
  { title: 'Beverage', image: '/images/Beveraage.jpg', tags: ['light'] },
  { title: 'Japanese Flavor II', image: '/images/japanese flav2.jpg', tags: ['balanced'] }
] as const

export default function Menu() {
  const [q, setQ] = useState('')
  const locale = useLocale()
  const [selected, setSelected] = useState<string[]>([])
  const [recommended, setRecommended] = useState<string | null>(null)
  useEffect(() => { try { setRecommended(localStorage.getItem('quiz:last')) } catch {} }, [])
  const [sort, setSort] = useState<'relevance' | 'likes' | 'alpha'>('relevance')
  const qc = useQueryClient()
  const likes = useQuery({
    queryKey: ['likes'],
    queryFn: async () => {
      const entries: Record<string, number> = {}
      await Promise.all(categories.map(async c => { entries[c.title] = await api.getLikes(`category:${c.title}`) }))
      return entries
    }
  })
  const list = categories
    .filter(c => c.title.toLowerCase().includes(q.toLowerCase()))
    .filter(c => selected.every(tag => (c as any).tags?.includes(tag)))
    .sort((a,b) => {
      if (sort === 'alpha') return a.title.localeCompare(b.title)
      if (sort === 'likes') {
        const la = (likes.data?.[a.title] ?? 0)
        const lb = (likes.data?.[b.title] ?? 0)
        return lb - la
      }
      const ra = a.title === recommended ? 1 : 0
      const rb = b.title === recommended ? 1 : 0
      if (ra !== rb) return rb - ra
      return a.title.localeCompare(b.title)
    })
  const likeMut = useMutation({
    mutationFn: (key: string) => api.like(key),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['likes'] })
  })
  const [open, setOpen] = useState(false)
  const [src, setSrc] = useState<string | null>(null)
  return (
    <Page>
    <Container sx={{ py: 6 }}>
      <SEO title="YoYo Flavor – Menu" description="Browse categories across noodles, hot pot, snacks, and more." locale={locale as any} />
      <Typography variant="h4" sx={{ mb: 1 }}>Menu</Typography>
      <Divider sx={{ mb: 2 }} />
      <TextField fullWidth placeholder={t(locale as any, 'search')} value={q} onChange={e => setQ(e.target.value)} sx={{ mb: 2 }} />
      <Box sx={{ position: 'sticky', top: 64, zIndex: 1, bgcolor: 'background.default', pb: 1 }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">{t(locale as any, 'filters')}</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {[
            { key: 'spicy', label: t(locale as any, 'filter_spicy') },
            { key: 'comfort', label: t(locale as any, 'filter_comfort') },
            { key: 'quick', label: t(locale as any, 'filter_quick') },
            { key: 'crunchy', label: t(locale as any, 'filter_crunchy') },
            { key: 'soft', label: t(locale as any, 'filter_soft') },
            { key: 'light', label: t(locale as any, 'filter_light') },
            { key: 'adventurous', label: t(locale as any, 'filter_adventurous') }
          ].map(f => (
            <Chip key={f.key} label={f.label} color={selected.includes(f.key) ? 'primary' : 'default'} onClick={() => setSelected(selected.includes(f.key) ? selected.filter(x => x !== f.key) : [...selected, f.key])} />
          ))}
        </Stack>
        {recommended && (
          <Typography variant="body2" color="text.secondary">{t(locale as any, 'recommended_for_you')}: {recommended}</Typography>
        )}
        <FormControl size="small" sx={{ mt: 1, width: 220 }}>
          <InputLabel>{t(locale as any, 'sort_by')}</InputLabel>
          <Select label={t(locale as any, 'sort_by')} value={sort} onChange={e => setSort(e.target.value as any)}>
            <MenuItem value="relevance">{t(locale as any, 'sort_relevance')}</MenuItem>
            <MenuItem value="likes">{t(locale as any, 'sort_likes')}</MenuItem>
            <MenuItem value="alpha">{t(locale as any, 'sort_alpha')}</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      </Box>
      <Grid container spacing={3}>
        {list.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.title}>
            <motion.div whileHover={{ y: -6, scale: 1.015 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Card sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.12)' } }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia component="img" image={c.image} alt={c.title} onClick={() => { setSrc(c.image); setOpen(true) }} sx={{ height: 220, width: '100%', objectFit: 'cover', cursor: 'zoom-in' }} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0))', pointerEvents: 'none' }} />
                  <Button variant="outlined" size="small" onClick={() => { setSrc(c.image); setOpen(true) }} sx={{ position: 'absolute', right: 12, bottom: 12 }}>
                    {t(locale as any, 'view_image')}
                  </Button>
                </Box>
                <CardContent sx={{ minHeight: 110 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>{c.title}</Typography>
                  {recommended === c.title && <Chip color="secondary" size="small" label={t(locale as any, 'recommended_for_you')} sx={{ mb: 1 }} />}
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
                    {((c as any).tags || []).slice(0,3).map((tag: string) => (
                      <Chip key={tag} size="small" label={
                        tag === 'spicy' ? t(locale as any, 'filter_spicy') :
                        tag === 'comfort' ? t(locale as any, 'filter_comfort') :
                        tag === 'quick' ? t(locale as any, 'filter_quick') :
                        tag === 'crunchy' ? t(locale as any, 'filter_crunchy') :
                        tag === 'soft' ? t(locale as any, 'filter_soft') :
                        tag === 'light' ? t(locale as any, 'filter_light') :
                        tag === 'adventurous' ? t(locale as any, 'filter_adventurous') : '•'
                      } />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button size="small" variant="contained" onClick={() => likeMut.mutate(`category:${c.title}`)}>Like</Button>
                    {likes.isLoading ? <Skeleton width={40} /> : <Chip size="small" label={`${likes.data?.[c.title] ?? 0} likes`} />}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        <DialogContent>
          {src && <Box component="img" src={src} alt="Large view" sx={{ width: '100%', height: 'auto', borderRadius: 2 }} />}
        </DialogContent>
      </Dialog>
    </Container>
    </Page>
  )
}
