import { Box, Container, Stack, Typography } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { t } from '../i18n'

function useLocale() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

export default function Footer() {
  const locale = useLocale()
  return (
    <Box component="footer" sx={{ py: 5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary" align="center">{t(locale, 'footer_created')}</Typography>
            <Typography variant="body2" color="text.secondary">|</Typography>
            <Box component="a" href="https://n-blog.angoango.dpdns.org/" target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary" align="center">{t(locale, 'blog')}</Typography>
            </Box>
          </Stack>
          <Box component="a" href="https://www.facebook.com/yoyoflavor/" target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" align="center">{t(locale, 'footer_facebook')}</Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
