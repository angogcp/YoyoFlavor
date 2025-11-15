import { Container, ImageList, ImageListItem, Typography, Dialog, DialogContent, Box, Divider } from '@mui/material'
import { useState } from 'react'
import Page from '../components/Page'

const images = [
  '/images/1763179965.png',
  '/images/Beer_&_Snack_Comfort_version_1.png',
  '/images/Flavor_&_Friends_version_1 (1).png',
  '/images/Flavor_&_Friends_version_1.png',
  '/images/Flavor_Is_Just_Around_the_Corner_version_1.png',
  '/images/Indulgence_Is_on_the_Menu_version_1.png',
  '/images/Need_a_Moment_to_Reset__version_1.png',
  '/images/Open_Air_Game_Day_Comfort_version_1.png',
  '/images/Your_Daily_Escape_Starts_Here__version_1.png',
  '/images/Your_Daily_Escape__Right_Here__version_1.png',
  '/images/yoyo intro.png'
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
              <img src={encodeURI(s)} alt="" loading="lazy" style={{ width: '100%', display: 'block' }} />
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
