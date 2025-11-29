import { Container, Stack, TextField, Button, Typography, Card, CardContent } from '@mui/material'
import { useState } from 'react'
import Page from '../components/Page'
import SEO from '../components/SEO'
import { api } from '../lib/api'

export default function Messages() {
  const [id, setId] = useState('')
  const [item, setItem] = useState<any>(null)
  return (
    <Page>
      <Container sx={{ py: 6 }}>
        <SEO title="YoYo Flavor – Messages" description="Check the status of your message." />
        <Typography variant="h4" sx={{ mb: 2 }}>Message Center</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField label="Reference ID" value={id} onChange={e => setId(e.target.value)} />
          <Button variant="contained" onClick={async () => setItem(await api.getContactById(id.trim()))}>Lookup</Button>
        </Stack>
        {item && (
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Status: {item.status}</Typography>
              {item.reply && <Typography variant="body2" sx={{ mt: 1 }}>Reply: {item.reply}</Typography>}
              {item.repliedAt && <Typography variant="caption">Replied At: {new Date(item.repliedAt).toLocaleString()}</Typography>}
            </CardContent>
          </Card>
        )}
      </Container>
    </Page>
  )
}
