import { Box, Container, Stack, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary" align="center">Created by Ango 2025. All right reserved.</Typography>
            <Typography variant="body2" color="text.secondary">|</Typography>
            <Box component="a" href="https://n-blog.angoango.dpdns.org/" target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary" align="center">Blog</Typography>
            </Box>
          </Stack>
          <Box component="a" href="https://www.facebook.com/yoyoflavor/" target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" align="center">Facebook</Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
