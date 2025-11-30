import { Container, Grid, Card, CardContent, CardMedia, Typography, Rating, Stack, TextField, Button, Alert, Skeleton, Box, Divider } from '@mui/material'
import { motion } from 'framer-motion'
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import Page from '../components/Page'
import SEO from '../components/SEO'
import { useState } from 'react'
import type { Review as ReviewType } from '../lib/api'
import { t } from '../i18n'

export default function Reviews() {
  const qc = useQueryClient()
  const pageSize = 9
  function useLocale() {
    const seg = window.location.pathname.split('/')[1]
    return seg === 'zh' ? 'zh' : 'en'
  }
  const locale = useLocale()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['reviews'],
    queryFn: ({ pageParam = 0 }) => api.getReviewsPaged(pageParam, pageSize, locale as any),
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((acc, p) => acc + p.items.length, 0)
      return loaded < lastPage.total ? loaded : undefined
    },
    initialPageParam: 0
  })
  const items = data?.pages.flatMap(p => p.items) ?? []
  const total = data?.pages[0]?.total ?? items.length
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [image, setImage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const add = useMutation({
    mutationFn: api.addReview,
    onSuccess: () => {
      setStatus('success')
      setName('')
      setComment('')
      setImage('')
      setFile(null)
      setRating(null)
      qc.invalidateQueries({ queryKey: ['reviews'] })
    },
    onError: () => setStatus('error')
  })
  const isValid = name.trim() && comment.trim() && (rating || 0) > 0
  return (
    <Page>
    <Container sx={{ py: 6 }}>
      <SEO title={`YoYo Flavor – ${t(locale as any, 'reviews_title')}`} description={t(locale as any, 'reviews_seo_desc')} locale={locale as any} />
      <Typography variant="h4" sx={{ mb: 1 }}>{t(locale as any, 'reviews_title')}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="body2" sx={{ mb: 1 }}>{t(locale as any, 'reviews_shown').replace('{0}', items.length.toString()).replace('{1}', total.toString())}</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {!items.length && [1,2,3].map(i => (
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
        {items.map((r) => (
          <Grid item xs={12} md={4} key={r.id}>
            <ReviewCard r={r as ReviewType} />
          </Grid>
        ))}
      </Grid>
      {hasNextPage && (
        <Button variant="outlined" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} sx={{ mb: 4 }}>{t(locale as any, 'reviews_load_more')}</Button>
      )}
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>{t(locale as any, 'reviews_add')}</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField label={t(locale as any, 'reviews_name')} value={name} onChange={e => setName(e.target.value)} />
        <TextField label={t(locale as any, 'reviews_comment')} value={comment} onChange={e => setComment(e.target.value)} fullWidth />
        <TextField label={t(locale as any, 'reviews_image_url')} value={image} onChange={e => setImage(e.target.value)} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <input id="file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
        <Button variant="text" onClick={() => (document.getElementById('file-input') as HTMLInputElement).click()}>{t(locale as any, 'reviews_upload_image')}</Button>
        <Typography variant="body2">{file ? file.name : t(locale as any, 'reviews_no_file')}</Typography>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography>{t(locale as any, 'reviews_rating')}</Typography>
        <Rating value={rating} onChange={(_, v) => setRating(v)} />
        <Button variant="contained" disabled={!isValid || add.isLoading} onClick={async () => {
          let img = image.trim() || undefined
          if (file) {
            try { img = await api.uploadImage(file) } catch {}
          }
          add.mutate({ name: name.trim(), comment: comment.trim(), rating: rating || 0, image: img })
        }}>{t(locale as any, 'reviews_submit')}</Button>
      </Stack>
      {status === 'success' && <Alert severity="success">{t(locale as any, 'reviews_success')}</Alert>}
      {status === 'error' && <Alert severity="error">{t(locale as any, 'reviews_error')}</Alert>}
    </Container>
    </Page>
  )
}

function ReviewCard({ r }: { r: ReviewType }) {
  const qc = useQueryClient()
  const locale = window.location.pathname.split('/')[1] === 'zh' ? 'zh' : 'en'
  const likeKey = `review:${r.id}`
  const likes = useQuery({ queryKey: ['review-like', r.id], queryFn: () => api.getLikes(likeKey) })
  const likeMut = useMutation({ mutationFn: () => api.like(likeKey), onSuccess: () => qc.invalidateQueries({ queryKey: ['review-like', r.id] }) })
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {r.image && (
          <Box sx={{ position: 'relative' }}>
            <CardMedia component="img" height="160" image={r.image} alt={r.name} />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.25), rgba(0,0,0,0))' }} />
          </Box>
        )}
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6">{r.name}</Typography>
            <Rating value={r.rating} readOnly />
            <Typography variant="body2">{r.comment}</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }} alignItems="center">
              <Button variant="contained" onClick={() => likeMut.mutate()} disabled={likeMut.isLoading}>{t(locale as any, 'reviews_like')}</Button>
              <Typography variant="body2">{t(locale as any, 'reviews_likes_count').replace('{0}', (likes.data ?? 0).toString())}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  )
}
