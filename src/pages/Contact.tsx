import { Box, Container, Grid, Paper, Stack, Typography, Button, TextField, Alert, Divider } from '@mui/material'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState as useReactState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import Page from '../components/Page'
import SEO from '../components/SEO'
import { t } from '../i18n'

function useLocale() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

export default function Contact() {
  const locale = useLocale()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [refId, setRefId] = useReactState<string | null>(null)
  const [checkId, setCheckId] = useReactState('')
  const [checkResult, setCheckResult] = useReactState<{ status: string; reply?: string; date?: string } | null>(null)
  const submit = useMutation({ mutationFn: () => api.submitContact(name.trim(), email.trim(), message.trim()), onSuccess: (item) => { setStatus('success'); setName(''); setEmail(''); setMessage(''); setRefId(item.id) }, onError: () => setStatus('error') })
  const valid = !!(name.trim() && email.includes('@') && message.trim().length >= 3)
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => api.getSettings() })
  const address = settings?.address || '324 Jalan Bercham, Taman Medan Bercham, 31400 Ipoh, Perak, Malaysia'
  const phone = '0125200357'
  const waLink = `https://wa.me/${phone.replace(/^0/, '60')}`
  function mapsLink() {
    if (typeof (settings as any)?.lat === 'number' && typeof (settings as any)?.lng === 'number') {
      return `https://www.google.com/maps/search/?api=1&query=${(settings as any).lat},${(settings as any).lng}`
    }
    const raw = settings?.mapsUrl || ''
    if (!raw) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    try {
      const u = new URL(raw)
      const mAll = [...u.pathname.matchAll(/3d(-?\d+\.?\d+)!4d(-?\d+\.?\d+)/g)]
      if (mAll.length) {
        const last = mAll[mAll.length - 1]
        return `https://www.google.com/maps/search/?api=1&query=${last[1]},${last[2]}`
      }
      const at = u.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
      if (at) return `https://www.google.com/maps/search/?api=1&query=${at[1]},${at[2]}`
      const q = u.searchParams.get('q')
      if (q) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
    } catch {}
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }
  const mapsHref = mapsLink()
  return (
    <Page>
    <Container sx={{ py: 6 }}>
      <SEO title={`YoYo Flavor – ${t(locale, 'contact')}`} description={t(locale, 'seo_contact_desc')} locale={locale} />
      <Typography variant="h4" sx={{ mb: 1 }}>{t(locale, 'contact')}</Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box component="img" src="/images/yoyo intro.png" alt="Intro" sx={{ width: '100%', borderRadius: 2 }} />
              <Stack direction="row" spacing={2}>
                <Button variant="contained" href={`tel:${phone}`}>{t(locale, 'contact_call')}</Button>
                <Button variant="outlined" href={waLink} target="_blank">{t(locale, 'contact_whatsapp')}</Button>
                <Button variant="outlined" href="https://www.facebook.com/yoyoflavor/" target="_blank">{t(locale, 'footer_facebook')}</Button>
                <Button variant="text" href={mapsHref} target="_blank">{t(locale, 'contact_find_us')}</Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">{t(locale, 'contact_intro')}</Typography>
              <TextField fullWidth label={t(locale, 'contact_name')} value={name} onChange={e => setName(e.target.value)} />
              <TextField fullWidth label={t(locale, 'contact_email')} value={email} onChange={e => setEmail(e.target.value)} error={!!email && !email.includes('@')} helperText={email && !email.includes('@') ? t(locale, 'contact_valid_email') : ''} />
              <TextField fullWidth label={t(locale, 'contact_msg')} value={message} onChange={e => setMessage(e.target.value)} multiline minRows={4} error={message.trim().length > 0 && message.trim().length < 3} helperText={message && message.trim().length < 3 ? t(locale, 'contact_valid_msg') : ''} />
              <Button variant="contained" disabled={!valid || submit.isLoading} onClick={() => submit.mutate()}>{t(locale, 'contact_submit')}</Button>
              {status === 'success' && (
                <Alert severity="success">
                  {t(locale, 'contact_success')} {refId}
                </Alert>
              )}
              {status === 'error' && <Alert severity="error">{t(locale, 'contact_error')}</Alert>}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">{t(locale, 'contact_check_title')}</Typography>
              <Stack direction="row" spacing={2}>
                <TextField fullWidth label={t(locale, 'contact_ref_id')} value={checkId} onChange={e => setCheckId(e.target.value)} />
                <Button variant="outlined" onClick={async () => {
                  const item = await api.getContactById(checkId.trim())
                  setCheckResult(item ? { status: item.status, reply: item.reply, date: item.repliedAt } : null)
                }}>{t(locale, 'contact_check')}</Button>
              </Stack>
              {checkResult && (
                <Stack>
                  <Typography>{t(locale, 'contact_status')}: {checkResult.status}</Typography>
                  {checkResult.reply && <Typography>{t(locale, 'contact_reply')}: {checkResult.reply}</Typography>}
                  {checkResult.date && <Typography>{t(locale, 'contact_replied_at')}: {new Date(checkResult.date).toLocaleString()}</Typography>}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
    </Page>
  )
}
