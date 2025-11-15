import { Box, Container, Stack, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">© YoYo Flavor</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box component="img" src="/images/yoyo logo.png" alt="YoYo" sx={{ height: 24 }} />
            <Typography variant="body2" color="text.secondary">Visit us</Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
