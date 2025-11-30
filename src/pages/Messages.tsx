import { Container, Stack, TextField, Button, Typography, Card, CardContent } from '@mui/material'
import { useState } from 'react'
import Page from '../components/Page'
import SEO from '../components/SEO'
import { api } from '../lib/api'
import { useLocation } from 'react-router-dom'
import { t } from '../i18n'

function useLocale() {
  const seg = useLocation().pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

export default function Messages() {
  const locale = useLocale()
  const [id, setId] = useState('')
  const [item, setItem] = useState<any>(null)
  return (
    <Page>
      <Container sx={{ py: 6 }}>
        <SEO title={`YoYo Flavor – ${t(locale, 'messages_title')}`} description={t(locale, 'messages_seo_desc')} locale={locale as any} />
        <Typography variant="h4" sx={{ mb: 2 }}>{t(locale, 'messages_title')}</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField label={t(locale, 'contact_ref_id')} value={id} onChange={e => setId(e.target.value)} />
          <Button variant="contained" onClick={async () => setItem(await api.getContactById(id.trim()))}>{t(locale, 'messages_lookup')}</Button>
        </Stack>
        {item && (
          <Card>
            <CardContent>
              <Typography variant="subtitle1">{t(locale, 'contact_status')}: {item.status}</Typography>
              {item.reply && <Typography variant="body2" sx={{ mt: 1 }}>{t(locale, 'contact_reply')}: {item.reply}</Typography>}
              {item.repliedAt && <Typography variant="caption">{t(locale, 'contact_replied_at')}: {new Date(item.repliedAt).toLocaleString()}</Typography>}
            </CardContent>
          </Card>
        )}
      </Container>
    </Page>
  )
}
