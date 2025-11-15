import { Container, ImageList, ImageListItem, Typography, Dialog, DialogContent, Box, Divider } from '@mui/material'
import { useState } from 'react'
import Page from '../components/Page'

const images = [
  '/images/japanese flav.jpg',
  '/images/japanese flav2.jpg',
  '/images/Noodles and rice.jpg',
  '/images/HotPot.jpg',
  '/images/Snacks.jpg',
  '/images/Bread and Wok fried.jpg',
  '/images/Western.jpg',
  '/images/Beveraage.jpg'
]

export default function Gallery() {
  const [open, setOpen] = useState(false)
  const [src, setSrc] = useState<string | null>(null)
  return (
    <Page>
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>Gallery</Typography>
      <Divider sx={{ mb: 3 }} />
      <ImageList variant="masonry" cols={3} gap={8}>
        {images.map((s) => (
          <ImageListItem key={s} onClick={() => { setSrc(s); setOpen(true) }} sx={{ cursor: 'zoom-in', overflow: 'hidden', borderRadius: 2, transition: 'transform .25s ease, box-shadow .25s ease', '&:hover': { transform: 'translateY(-3px) scale(1.02)', boxShadow: '0 12px 32px rgba(0,0,0,0.12)' } }}>
            <Box sx={{ position: 'relative' }}>
              <img src={s} alt="" loading="lazy" style={{ width: '100%', display: 'block' }} />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.25), rgba(0,0,0,0))' }} />
            </Box>
          </ImageListItem>
        ))}
      </ImageList>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        <DialogContent>
          {src && <Box component="img" src={src} alt="" sx={{ width: '100%', height: 'auto', borderRadius: 2 }} />}
        </DialogContent>
      </Dialog>
    </Container>
    </Page>
  )
}
