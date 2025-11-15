import { Container, Typography, Stack, Card, CardMedia, CardContent, Button, TextField } from '@mui/material'
import { useParams } from 'react-router-dom'
import { posts as localPosts } from '../data/posts'
import SEO from '../components/SEO'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'
import Page from '../components/Page'

export default function Post() {
  const { slug } = useParams()
  const { data: postsData, isLoading, isFetching } = useQuery({ queryKey: ['posts'], queryFn: () => api.getPosts(), initialData: localPosts })
  const ls = (() => { try { const s = localStorage.getItem('posts'); return s ? JSON.parse(s) as typeof localPosts : [] } catch { return [] } })()
  const p = (postsData ?? []).find(x => x.slug === slug) || ls.find(x => x.slug === slug)
  if (!p) {
    if (isLoading || isFetching) {
      return (
        <Container sx={{ py: 6 }}>
          <Typography variant="h6">Loading…</Typography>
        </Container>
      )
    }
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h6">Post not found</Typography>
      </Container>
    )
  }
  const qc = useQueryClient()
  const likes = useQuery({ queryKey: ['post-like', p.slug], queryFn: () => api.getLikes(`post:${p.slug}`) })
  const likeMut = useMutation({ mutationFn: () => api.like(`post:${p.slug}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['post-like', p.slug] }) })
  const pageSize = 6
  const { data: commentsData, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['post-comments', p.slug],
    queryFn: ({ pageParam = 0 }) => api.getPostComments(p.slug, pageParam, pageSize),
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((acc, pg) => acc + pg.items.length, 0)
      return loaded < last.total ? loaded : undefined
    },
    initialPageParam: 0
  })
  const items = commentsData?.pages.flatMap(pg => pg.items) ?? []
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const add = useMutation({ mutationFn: () => api.addPostComment(p.slug, name.trim(), msg.trim()), onSuccess: () => { setName(''); setMsg(''); qc.invalidateQueries({ queryKey: ['post-comments', p.slug] }) } })
  return (
    <Page>
    <Container sx={{ py: 6 }}>
      <SEO title={`YoYo Flavor – ${p.title}`} description={p.excerpt} ogImage={p.image} />
      <Stack spacing={2}>
        <Typography variant="h3">{p.title}</Typography>
        <Typography variant="overline">{new Date(p.date).toLocaleDateString()}</Typography>
        <Card sx={{ borderRadius: 3 }}>
          <CardMedia component="img" height="240" image={p.image} />
          <CardContent>
            <Typography variant="body1">{p.excerpt}</Typography>
            <Typography variant="body2">More content coming soon.</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => likeMut.mutate()}>Like</Button>
              <Typography variant="body2">{likes.data ?? 0} likes</Typography>
            </Stack>
          </CardContent>
        </Card>
        <Typography variant="h6">Comments</Typography>
        {items.map(c => (
          <Card key={c.id} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2">{c.name}</Typography>
              <Typography variant="caption">{new Date(c.date).toLocaleString()}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{c.message}</Typography>
            </CardContent>
          </Card>
        ))}
        {hasNextPage && <Button variant="outlined" onClick={() => fetchNextPage()}>Load more</Button>}
        <Typography variant="h6">Add a comment</Typography>
        <Stack direction="row" spacing={2}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} />
          <TextField label="Comment" value={msg} onChange={e => setMsg(e.target.value)} fullWidth />
          <Button variant="contained" disabled={!name.trim() || !msg.trim()} onClick={() => add.mutate()}>Submit</Button>
        </Stack>
      </Stack>
    </Container>
    </Page>
  )
}
