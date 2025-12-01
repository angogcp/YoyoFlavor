import { Box, Container, Typography, CircularProgress, Paper } from '@mui/material'
import Page from '../components/Page'
import SEO from '../components/SEO'
import { useLocation, useSearchParams } from 'react-router-dom'
import { t } from '../i18n'
import { useState } from 'react'

function useLocale() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

export default function Order() {
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const tableId = searchParams.get('table')
  const iframeSrc = `https://pos-g4.vercel.app/customer${tableId ? `?table=${tableId}` : ''}`

  return (
    <Page>
      <SEO 
        title={`YoYo Flavor – ${t(locale as any, 'order_title')}`} 
        description="Order your favorite meals online from YoYo Flavor." 
        locale={locale as any} 
      />
      
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative', 
        bgcolor: 'primary.main', 
        color: 'white', 
        pt: { xs: 6, md: 8 }, 
        pb: { xs: 10, md: 12 },
        mb: -6,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            {t(locale as any, 'order_title')}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, fontWeight: 400, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            {t(locale as any, 'order_subtitle') || t(locale as any, 'menu_subtitle')}
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="xl" sx={{ pb: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'relative',
            zIndex: 2,
            width: '100%', 
            height: { xs: 'calc(100vh - 200px)', md: '800px' },
            minHeight: '600px',
            borderRadius: 4, 
            overflow: 'hidden', 
            bgcolor: 'background.paper'
          }}
        >
          {loading && (
            <Box sx={{ 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.8)',
              zIndex: 10
            }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          )}
          <iframe 
            src={iframeSrc}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              opacity: loading ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }} 
            title="Order Food"
            onLoad={() => setLoading(false)}
          />
        </Paper>
      </Container>
    </Page>
  )
}
