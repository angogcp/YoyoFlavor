import { Box, Container, Stack, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">Created by Ango 2025. All right reserved.</Typography>
          <Box component="a" href="https://n-blog.angoango.dpdns.org/" target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary">https://n-blog.angoango.dpdns.org/</Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
