import { Container, Stepper, Step, StepLabel, Box, Typography, Button, Stack, Card, CardMedia, CardContent } from '@mui/material'
import { useState } from 'react'
import Page from '../components/Page'
import SEO from '../components/SEO'
import { useLocation } from 'react-router-dom'
import { t } from '../i18n'

function useLocale() { const seg = useLocation().pathname.split('/')[1]; return seg === 'zh' ? 'zh' : 'en' }
function buildSteps(locale: 'en' | 'zh') {
  const steps = [t(locale, 'quiz_spice'), t(locale, 'quiz_texture'), t(locale, 'quiz_mood')]
  const stepDescriptions = [t(locale, 'quiz_desc_spice'), t(locale, 'quiz_desc_texture'), t(locale, 'quiz_desc_mood')]
  const optionSets: Array<{ label: string; value: number; desc: string }[]> = [
    [
      { label: t(locale, 'quiz_opt_high'), value: 3, desc: t(locale, 'quiz_opt_high_desc') },
      { label: t(locale, 'quiz_opt_medium'), value: 2, desc: t(locale, 'quiz_opt_medium_desc') },
      { label: t(locale, 'quiz_opt_low'), value: 1, desc: t(locale, 'quiz_opt_low_desc') }
    ],
    [
      { label: t(locale, 'quiz_opt_crunchy'), value: 3, desc: t(locale, 'quiz_opt_crunchy_desc') },
      { label: t(locale, 'quiz_opt_balanced'), value: 2, desc: t(locale, 'quiz_opt_balanced_desc') },
      { label: t(locale, 'quiz_opt_soft'), value: 1, desc: t(locale, 'quiz_opt_soft_desc') }
    ],
    [
      { label: t(locale, 'quiz_opt_adventurous'), value: 3, desc: t(locale, 'quiz_opt_adventurous_desc') },
      { label: t(locale, 'quiz_opt_comfort'), value: 2, desc: t(locale, 'quiz_opt_comfort_desc') },
      { label: t(locale, 'quiz_opt_light'), value: 1, desc: t(locale, 'quiz_opt_light_desc') }
    ]
  ]
  return { steps, stepDescriptions, optionSets }
}

function resultFor(answers: number[]) {
  const score = answers.reduce((a, b) => a + b, 0)
  if (score >= 6) return { titleKey: 'quiz_result_hotpot', image: '/images/HotPot.jpg' }
  if (score >= 4) return { titleKey: 'quiz_result_noodles', image: '/images/Noodles and rice.jpg' }
  if (score >= 2) return { titleKey: 'quiz_result_japanese', image: '/images/japanese flav2.jpg' }
  return { titleKey: 'quiz_result_snacks', image: '/images/Snacks.jpg' }
}

function explainMatch(locale: 'en' | 'zh', titleKey: string, answers: number[]) {
  const s = answers.reduce((a,b)=>a+b,0)
  const parts: string[] = []
  
  if ((answers[0]||0) >= 3) parts.push(t(locale, 'quiz_explain_high_spice'))
  else if ((answers[0]||0) === 2) parts.push(t(locale, 'quiz_explain_med_spice'))
  else parts.push(t(locale, 'quiz_explain_low_spice'))
  
  if ((answers[1]||0) >= 3) parts.push(t(locale, 'quiz_explain_crunchy'))
  else if ((answers[1]||0) === 2) parts.push(t(locale, 'quiz_explain_balanced_texture'))
  else parts.push(t(locale, 'quiz_explain_soft'))
  
  if ((answers[2]||0) >= 3) parts.push(t(locale, 'quiz_explain_adventurous'))
  else if ((answers[2]||0) === 2) parts.push(t(locale, 'quiz_explain_comfort'))
  else parts.push(t(locale, 'quiz_explain_light'))
  
  const joined = parts.join(locale === 'zh' ? '，' : ', ')
  const title = t(locale, titleKey as any)
  
  return t(locale, 'quiz_match_reason')
    .replace('{0}', joined)
    .replace('{1}', s.toString())
    .replace('{2}', title)
}

export default function Quiz() {
  const locale = useLocale()
  const { steps, stepDescriptions, optionSets } = buildSteps(locale)
  const [active, setActive] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const done = active >= steps.length
  const res = done ? resultFor(answers) : null
  function pick(v: number) {
    const next = [...answers]
    next[active] = v
    setAnswers(next)
    setActive(active + 1)
  }
  function back() {
    setActive(Math.max(0, active - 1))
  }
  function restart() {
    setAnswers([])
    setActive(0)
  }
  function shareWhatsApp() {
    const title = res ? t(locale, res.titleKey as any) : ''
    const text = t(locale, 'quiz_share_msg').replace('{0}', title)
    const url = 'https://wa.me/?text=' + encodeURIComponent(text)
    window.open(url, '_blank')
  }
  if (done && res) {
    try { localStorage.setItem('quiz:last', res.titleKey) } catch {}
  }
  return (
    <Page>
    <Container sx={{ py: 6 }}>
      <SEO title={`YoYo Flavor – ${t(locale, 'quiz')}`} description={t(locale, 'quiz_seo_desc')} locale={locale as any} />
      <Typography variant="h4" sx={{ mb: 2 }}>{t(locale, 'quiz')}</Typography>
      <Stepper activeStep={Math.min(active, steps.length)} sx={{ mb: 1 }}>
        {steps.map((s) => (
          <Step key={s}><StepLabel>{s}</StepLabel></Step>
        ))}
      </Stepper>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
        {t(locale, 'quiz_step_info').replace('{0}', Math.min(active+1, steps.length).toString()).replace('{1}', steps.length.toString())}
      </Typography>
      {!done && (
        <Stack spacing={2}>
          <Typography variant="h6">{steps[active]}</Typography>
          <Typography variant="body2" color="text.secondary">{stepDescriptions[active]}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 1 }}>
            {optionSets[active].map(opt => (
              <Stack key={opt.label} spacing={0.5} alignItems={{ xs: 'stretch', sm: 'flex-start' }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button variant={opt.value === 3 ? 'contained' : opt.value === 2 ? 'outlined' : 'text'} onClick={() => pick(opt.value)}>{opt.label}</Button>
                <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
              </Stack>
            ))}
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="text" disabled={active === 0} onClick={back}>{t(locale, 'quiz_back')}</Button>
          </Stack>
        </Stack>
      )}
      {done && res && (
        <Stack spacing={3}>
          <Typography variant="h6">{t(locale, 'quiz_match')}</Typography>
          <Card sx={{ maxWidth: 600 }}>
            <CardMedia component="img" height="200" image={res.image} />
            <CardContent>
              <Typography variant="h5">{t(locale, res.titleKey as any)}</Typography>
              <Typography variant="body2">{t(locale, 'quiz_explore')}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{explainMatch(locale, res.titleKey, answers)}</Typography>
            </CardContent>
          </Card>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={shareWhatsApp}>{t(locale, 'quiz_share')}</Button>
            <Button variant="text" href={`/${locale}/menu`}>{t(locale, 'quiz_go_menu')}</Button>
            <Button variant="outlined" onClick={restart}>{t(locale, 'quiz_restart')}</Button>
          </Stack>
        </Stack>
      )}
    </Container>
    </Page>
  )
}
