import { Box, Container, Stack, Typography, Button, Paper, Chip, Grid, Divider, Card, CardContent, Rating } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import PlaceIcon from '@mui/icons-material/Place'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import SEO from '../components/SEO'
import Page from '../components/Page'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

function useLocale() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

export default function Home() {
  const locale = useLocale()
  const nav = useNavigate()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, -30])
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => api.getSettings() })
  const { data: topReviews } = useQuery({ queryKey: ['home-reviews', locale], queryFn: () => api.getReviews(locale as any) })
  const address = settings?.address || '324 Jalan Bercham, Taman Medan Bercham, 31400 Ipoh, Perak, Malaysia'
  const phone = '0125200357'
  const waLink = `https://wa.me/${phone.replace(/^0/, '60')}`
  function mapsLink() {
    if (typeof settings?.lat === 'number' && typeof settings?.lng === 'number') {
      return `https://www.google.com/maps/search/?api=1&query=${settings.lat},${settings.lng}`
    }
    const raw = settings?.mapsUrl || ''
    if (!raw) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    try {
      const u = new URL(raw)
      const mAll = [...u.pathname.matchAll(/3d(-?\d+\.?\d+)!4d(-?\d+\.?\d+)/g)]
      if (mAll.length) {
        const last = mAll[mAll.length - 1]
        return `https://www.google.com/maps/search/?api=1&query=${last[1]},${last[2]}`
      }
      const at = u.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
      if (at) return `https://www.google.com/maps/search/?api=1&query=${at[1]},${at[2]}`
      const q = u.searchParams.get('q')
      if (q) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
    } catch {}
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }
  const mapsHref = mapsLink()
  const schedule = [
    { d: 'Mon', open: '11:00', close: '22:00' },
    { d: 'Tue', open: '11:00', close: '22:00' },
    { d: 'Wed', open: '11:00', close: '22:00' },
    { d: 'Thu', open: '11:00', close: '22:00' },
    { d: 'Fri', open: '11:00', close: '22:00' },
    { d: 'Sat', open: '10:00', close: '23:00' },
    { d: 'Sun', open: '10:00', close: '23:00' }
  ]
  const now = new Date()
  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1
  function toMinutes(t: string) { const [hh, mm] = t.split(':').map(Number); return hh * 60 + mm }
  const mins = now.getHours() * 60 + now.getMinutes()
  const todays = schedule[todayIdx]
  const isOpen = mins >= toMinutes(todays.open) && mins <= toMinutes(todays.close)
  return (
    <Page>
      <SEO title="YoYo Flavor – Home" description="Discover your flavor with YoYo restaurant menu, gallery, reviews, and quiz." locale={locale as any} ogImage={settings?.bannerUrl || '/images/yoyo-new-.png'} address={address} />
      <Box sx={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        <motion.img src={settings?.bannerUrl || '/images/yoyo-new-.png'} alt="Banner" style={{ y, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0) 100%)' }} />
        <Container sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <Stack spacing={2} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h3" color="white">{t(locale as any, 'home_tagline')}</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary" onClick={() => nav(`/${locale}/menu`)}>Explore Menu</Button>
              <Button variant="outlined" color="secondary" onClick={() => nav(`/${locale}/quiz`)}>Flavor Quiz</Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Container sx={{ py: 6 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>What people say</Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {(topReviews || []).slice(0,3).map(r => (
            <Grid item xs={12} md={4} key={r.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">{r.name}</Typography>
                    <Rating value={r.rating} readOnly />
                    <Typography variant="body2" color="text.secondary">{r.comment}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Typography variant="h5" sx={{ mb: 2 }}>{t(locale as any, 'hours')}</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 3 }} component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box component="img" src="/images/yoyo hour.png" alt="Hours" sx={{ height: 52, borderRadius: 1 }} />
                <Chip label={isOpen ? 'Open now' : 'Closed'} color={isOpen ? 'success' : 'default'} size="small" />
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                {schedule.map((s, i) => (
                  <Grid item xs={12} sm={6} key={s.d}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: i === todayIdx ? 'action.selected' : 'background.paper' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: i === todayIdx ? 700 : 500 }}>{s.d}</Typography>
                        {i === todayIdx && <Chip label="Today" size="small" color="primary" variant="outlined" />}
                      </Stack>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{s.open}–{s.close}</Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 3 }} component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Stack spacing={2}>
                <Button startIcon={<PhoneIcon />} variant="contained" href={`tel:${phone}`}>Call</Button>
                <Button startIcon={<WhatsAppIcon />} variant="outlined" href={waLink} target="_blank">WhatsApp</Button>
                <Button startIcon={<PlaceIcon />} variant="text" href={mapsHref} target="_blank">Find us</Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
}
