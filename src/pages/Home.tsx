import { Box, Container, Stack, Typography, Button, Paper, Chip, Grid, Divider, Card, CardContent, CardMedia, Rating, Avatar, IconButton, useTheme, useMediaQuery } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import PlaceIcon from '@mui/icons-material/Place'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import LocalDiningIcon from '@mui/icons-material/LocalDining'
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import SEO from '../components/SEO'
import Page from '../components/Page'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { categories } from '../data/menu'
import Masonry from '@mui/lab/Masonry'

function useLocale() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

export default function Home() {
  const locale = useLocale()
  const nav = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

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
    { d: 'day_mon', open: '11:00', close: '22:00' },
    { d: 'day_tue', open: '11:00', close: '22:00' },
    { d: 'day_wed', open: '11:00', close: '22:00' },
    { d: 'day_thu', open: '11:00', close: '22:00' },
    { d: 'day_fri', open: '11:00', close: '22:00' },
    { d: 'day_sat', open: '10:00', close: '23:00' },
    { d: 'day_sun', open: '10:00', close: '23:00' }
  ]

  const now = new Date()
  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1
  function toMinutes(t: string) { const [hh, mm] = t.split(':').map(Number); return hh * 60 + mm }
  const mins = now.getHours() * 60 + now.getMinutes()
  const todays = schedule[todayIdx]
  const isOpen = mins >= toMinutes(todays.open) && mins <= toMinutes(todays.close)

  const featuredCategories = [
    categories.find(c => c.id === 'cat_hotpot'),
    categories.find(c => c.id === 'cat_noodles'),
    categories.find(c => c.id === 'cat_japanese')
  ].filter(Boolean)

  return (
    <Page>
      <SEO 
        title="YoYo Flavor – Home" 
        description="Discover your flavor with YoYo restaurant menu, gallery, reviews, and quiz." 
        locale={locale as any} 
        ogImage={settings?.bannerUrl || '/images/yoyo-new-.png'} 
        address={address} 
      />

      {/* Hero Section */}
      <Box sx={{ position: 'relative', height: '85vh', minHeight: 600, overflow: 'hidden', bgcolor: 'black' }}>
        <motion.div style={{ y, width: '100%', height: '100%' }}>
          <Box 
            component="img" 
            src={settings?.bannerUrl || '/images/yoyo-new-.png'} 
            alt="Banner" 
            sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} 
          />
        </motion.div>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))' }} />
        <Container sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 2 }}>
          <Stack spacing={4} component={motion.div} style={{ opacity }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Typography variant="h1" sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '3rem', md: '5rem' }, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              {t(locale as any, 'home_tagline')}
            </Typography>
            <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
              {t(locale as any, 'menu_subtitle')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                size="large" 
                color="secondary"
                onClick={() => nav(`/${locale}/order`)}
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 50, fontWeight: 'bold' }}
              >
                {t(locale as any, 'order_now')}
              </Button>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => nav(`/${locale}/menu`)}
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 50 }}
              >
                {t(locale as any, 'our_menu')}
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                color="inherit"
                onClick={() => document.getElementById('visit-us')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 50, color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}
              >
                {t(locale as any, 'contact')}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {[
            { icon: <LocalDiningIcon fontSize="large" />, title: 'feat_fresh_title', desc: 'feat_fresh_desc' },
            { icon: <RestaurantIcon fontSize="large" />, title: 'feat_auth_title', desc: 'feat_auth_desc' },
            { icon: <EmojiFoodBeverageIcon fontSize="large" />, title: 'feat_cozy_title', desc: 'feat_cozy_desc' }
          ].map((f, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Stack alignItems="center" spacing={2} sx={{ textAlign: 'center' }} component={motion.div} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.main', display: 'inline-flex' }}>
                  {f.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold">{t(locale as any, f.title as any)}</Typography>
                <Typography variant="body1" color="text.secondary">{t(locale as any, f.desc as any)}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Video Highlights */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 6, textAlign: 'center' }}>{t(locale as any, 'video_highlights')}</Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Box component={motion.div} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <Box 
                  component="video" 
                  controls 
                  poster="/images/yoyoBanner.png"
                  sx={{ width: '100%', borderRadius: 4, boxShadow: 6, bgcolor: 'black', aspectRatio: '16/9' }}
                >
                  <source src="/images/promo-video-1.webm" type="video/webm" />
                  Your browser does not support the video tag.
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box component={motion.div} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Box 
                  component="video" 
                  controls 
                  poster="/images/yoyo-new-.png"
                  sx={{ width: '100%', borderRadius: 4, boxShadow: 6, bgcolor: 'black', aspectRatio: '16/9' }}
                >
                  <source src="/images/promo-video-2.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Menu */}
      <Box sx={{ bgcolor: 'action.hover', py: 10 }}>
        <Container>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">{t(locale as any, 'popular_flavors')}</Typography>
            <Button endIcon={<ArrowForwardIcon />} onClick={() => nav(`/${locale}/menu`)}>{t(locale as any, 'view_full_menu')}</Button>
          </Stack>
          <Grid container spacing={3}>
            {featuredCategories.map((c, i) => (
              <Grid item xs={12} md={4} key={c!.id}>
                <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: theme.shadows[4], cursor: 'pointer' }} onClick={() => nav(`/${locale}/menu`)}>
                    <Box sx={{ position: 'relative', height: 240 }}>
                      <CardMedia component="img" image={c!.image} alt={t(locale as any, c!.id as any)} sx={{ height: '100%', objectFit: 'cover' }} />
                      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                      <Typography variant="h5" sx={{ position: 'absolute', bottom: 16, left: 16, color: 'white', fontWeight: 'bold' }}>
                        {t(locale as any, c!.id as any)}
                      </Typography>
                    </Box>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {t(locale as any, (c!.id + '_desc') as any)}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Reviews */}
      <Container sx={{ py: 10 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>{t(locale as any, 'home_reviews_title')}</Typography>
        <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={3}>
          {(topReviews || []).slice(0, 6).map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card sx={{ borderRadius: 3, height: '100%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>{r.name[0]}</Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">{r.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(r.date).toLocaleDateString()}</Typography>
                        </Box>
                      </Stack>
                      <Rating value={r.rating} readOnly size="small" />
                    </Stack>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.primary' }}>"{r.comment}"</Typography>
                    {r.image && (
                      <Box component="img" src={r.image} sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2 }} />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Masonry>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button variant="outlined" size="large" onClick={() => nav(`/${locale}/reviews`)}>{t(locale as any, 'home_read_more_reviews')}</Button>
        </Box>
      </Container>

      {/* Visit Us Section */}
      <Box id="visit-us" sx={{ bgcolor: '#1a1a1a', color: 'white', py: 8 }}>
        <Container>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: 'primary.main' }}>{t(locale as any, 'hours')}</Typography>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Chip label={isOpen ? t(locale as any, 'status_open') : t(locale as any, 'status_closed')} color={isOpen ? 'success' : 'error'} />
                  <Typography variant="body2" color="gray">{t(locale as any, 'current_time')}: {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                </Stack>
                <Grid container spacing={2}>
                  {schedule.map((s, i) => (
                    <Grid item xs={6} sm={4} key={s.d}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: i === todayIdx ? 'rgba(255,255,255,0.1)' : 'transparent', border: '1px solid', borderColor: i === todayIdx ? 'primary.main' : 'rgba(255,255,255,0.1)' }}>
                        <Typography variant="subtitle2" fontWeight="bold" color={i === todayIdx ? 'primary.main' : 'white'}>{t(locale as any, s.d as any)}</Typography>
                        <Typography variant="caption" color="gray">{s.open} - {s.close}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: 'primary.main' }}>{t(locale as any, 'contact')}</Typography>
              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', color: 'white' }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PlaceIcon color="primary" /> {t(locale as any, 'label_address')}
                    </Typography>
                    <Typography variant="body2" color="gray" sx={{ ml: 4, mt: 0.5 }}>{address}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon color="primary" /> {t(locale as any, 'label_phone')}
                    </Typography>
                    <Typography variant="body2" color="gray" sx={{ ml: 4, mt: 0.5 }}>{phone}</Typography>
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button variant="contained" startIcon={<PhoneIcon />} href={`tel:${phone}`} fullWidth>{t(locale as any, 'contact_call')}</Button>
                    <Button variant="contained" color="success" startIcon={<WhatsAppIcon />} href={waLink} target="_blank" fullWidth>WhatsApp</Button>
                  </Stack>
                  <Button variant="outlined" startIcon={<PlaceIcon />} href={mapsHref} target="_blank" fullWidth sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    {t(locale as any, 'get_directions')}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Page>
  )
}
