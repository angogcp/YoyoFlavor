import { 
  Container, Box, Typography, IconButton, useTheme, useMediaQuery, Backdrop, Fade 
} from '@mui/material'
import { useState, useEffect, useCallback } from 'react'
import Page from '../components/Page'
import { motion, AnimatePresence } from 'framer-motion'
import Masonry from '@mui/lab/Masonry'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import { t } from '../i18n'
import { useLocation } from 'react-router-dom'

const images = [
  '/images/1763179965.png',
  '/images/Beer_&_Snack_Comfort_version_1.png',
  '/images/Flavor_&_Friends_version_1.png',
  '/images/Flavor_Is_Just_Around_the_Corner_version_1.png',
  '/images/Indulgence_Is_on_the_Menu_version_1.png',
  '/images/Need_a_Moment_to_Reset__version_1.png',
  '/images/Open_Air_Game_Day_Comfort_version_1.png',
  '/images/Your_Daily_Escape_Starts_Here__version_1.png',
  '/images/Your_Daily_Escape__Right_Here__version_1.png',
]

function useLocale() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

export default function Gallery() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const locale = useLocale()

  const handleOpen = (index: number) => setLightboxIndex(index)
  const handleClose = () => setLightboxIndex(null)
  
  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setLightboxIndex(prev => (prev === null ? null : (prev + 1) % images.length))
  }, [])

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setLightboxIndex(prev => (prev === null ? null : (prev - 1 + images.length) % images.length))
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, handleNext, handlePrev])

  return (
    <Page>
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative', 
        bgcolor: 'primary.main', 
        color: 'white', 
        pt: { xs: 6, md: 10 }, 
        pb: { xs: 12, md: 16 },
        mb: -8,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          inset: 0, 
          opacity: 0.15,
          backgroundImage: 'radial-gradient(circle at 80% 20%, white 2px, transparent 2px)',
          backgroundSize: '30px 30px'
        }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 800, fontSize: { xs: '2.5rem', md: '4rem' } }}>
              {t(locale, 'gallery_title')}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 700, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
              {t(locale, 'gallery_subtitle')}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 12 }}>
        <Box sx={{ minHeight: '60vh' }}>
          <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={3}>
            {images.map((src, index) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Box
                  onClick={() => handleOpen(index)}
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      '& .overlay': { opacity: 1 },
                      '& img': { transform: 'scale(1.05)' }
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt=""
                    loading="lazy"
                    sx={{
                      width: '100%',
                      display: 'block',
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                  {/* Hover Overlay */}
                  <Box
                    className="overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.4)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    <Box sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      backdropFilter: 'blur(4px)', 
                      p: 1.5, 
                      borderRadius: '50%' 
                    }}>
                      <ZoomInIcon fontSize="large" />
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Masonry>
        </Box>
      </Container>

      {/* Custom Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Backdrop
            open={true}
            onClick={handleClose}
            sx={{
              zIndex: 9999,
              bgcolor: 'rgba(0,0,0,0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {/* Close Button */}
              <IconButton
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <CloseIcon />
              </IconButton>

              {/* Navigation Buttons */}
              {!isMobile && (
                <>
                  <IconButton
                    onClick={handlePrev}
                    sx={{
                      position: 'absolute',
                      left: 32,
                      color: 'white',
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <ArrowBackIosNewIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleNext}
                    sx={{
                      position: 'absolute',
                      right: 32,
                      color: 'white',
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </>
              )}

              {/* Image Content */}
              <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  position: 'relative',
                  outline: 'none'
                }}
              >
                <motion.img
                  key={lightboxIndex}
                  src={images[lightboxIndex]}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '90vh',
                    borderRadius: 8,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                  }}
                  // Swipe support for mobile could be added here
                />
                
                {/* Mobile Navigation Hint / Tap zones */}
                {isMobile && (
                   <Box sx={{ position: 'absolute', bottom: -50, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
                      <IconButton onClick={handlePrev} sx={{ color: 'white' }}><ArrowBackIosNewIcon /></IconButton>
                      <IconButton onClick={handleNext} sx={{ color: 'white' }}><ArrowForwardIosIcon /></IconButton>
                   </Box>
                )}
              </Box>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>
    </Page>
  )
}
