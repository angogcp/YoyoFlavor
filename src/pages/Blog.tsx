import { Container, Grid, Card, CardMedia, CardContent, Typography, Stack, Button, Skeleton, Box, Divider } from '@mui/material'
import { motion } from 'framer-motion'
import { posts as localPosts } from '../data/posts'
import SEO from '../components/SEO'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLocation, useNavigate } from 'react-router-dom'
import Page from '../components/Page'
import { t } from '../i18n'

function useLocale() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

export default function Blog() {
  const nav = useNavigate()
  const locale = useLocale()
  const { data, isLoading } = useQuery({ queryKey: ['posts'], queryFn: () => api.getPosts(), initialData: localPosts })
  const list = [...(data || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return (
    <Page>
    <Container sx={{ py: 6 }}>
      <SEO title="YoYo Flavor – Blog" description={t(locale as any, 'seo_blog_desc')} locale={locale as any} />
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">{t(locale as any, 'blog')}</Typography>
      </Stack>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {isLoading && [1,2,3].map(i => (
          <Grid item xs={12} md={4} key={`sk-${i}`}>
            <Card sx={{ borderRadius: 3 }}>
              <Skeleton variant="rectangular" height={160} />
              <CardContent>
                <Skeleton width="60%" />
                <Skeleton width="80%" />
                <Skeleton width="40%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
        {list.map(p => (
          <Grid item xs={12} md={4} key={p.slug}>
            <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia component="img" height="180" image={p.image} alt={p.title} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.25), rgba(0,0,0,0))' }} />
                </Box>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="overline">{new Date(p.date).toLocaleDateString()}</Typography>
                    <Typography variant="h6">{p.title}</Typography>
                    <Typography variant="body2">{p.excerpt}</Typography>
                    <Button variant="outlined" onClick={() => nav(`/${locale}/blog/${p.slug}`)}>{t(locale as any, 'blog_read')}</Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
    </Page>
  )
}
