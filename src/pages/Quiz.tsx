import { Container, Stepper, Step, StepLabel, Box, Typography, Button, Stack, Card, CardMedia, CardContent } from '@mui/material'
import { useState } from 'react'
import Page from '../components/Page'
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
  if (score >= 6) return { title: 'Hot Pot', image: '/images/HotPot.jpg' }
  if (score >= 4) return { title: 'Noodles & Rice', image: '/images/Noodles and rice.jpg' }
  if (score >= 2) return { title: 'Japanese Flavor', image: '/images/japanese flav2.jpg' }
  return { title: 'Snacks', image: '/images/Snacks.jpg' }
}

function explainMatch(locale: 'en' | 'zh', title: string, answers: number[]) {
  const s = answers.reduce((a,b)=>a+b,0)
  const parts: string[] = []
  if (locale === 'zh') {
    if ((answers[0]||0) >= 3) parts.push('偏好重辣')
    else if ((answers[0]||0) === 2) parts.push('喜欢适中辣度')
    else parts.push('更偏向清淡')
    if ((answers[1]||0) >= 3) parts.push('偏爱口感与酥脆')
    else if ((answers[1]||0) === 2) parts.push('喜欢软硬适中')
    else parts.push('偏好柔软嫩滑')
    if ((answers[2]||0) >= 3) parts.push('今天想尝试更大胆的风味')
    else if ((answers[2]||0) === 2) parts.push('更想要舒适熟悉的菜品')
    else parts.push('更想来点清爽轻食')
    return `根据你的选择（${parts.join('，')}），总分为 ${s}，匹配 ${title}。`
  } else {
    if ((answers[0]||0) >= 3) parts.push('you enjoy bold heat')
    else if ((answers[0]||0) === 2) parts.push('you prefer balanced spice')
    else parts.push('you like gentle seasoning')
    if ((answers[1]||0) >= 3) parts.push('you favor texture and crispness')
    else if ((answers[1]||0) === 2) parts.push('you like a mix of textures')
    else parts.push('you prefer soft and tender dishes')
    if ((answers[2]||0) >= 3) parts.push('you feel adventurous today')
    else if ((answers[2]||0) === 2) parts.push('you want comforting favorites')
    else parts.push('you want something light')
    const reason = parts.join(', ') + '.'
    return `Based on your choices (${reason}) your score is ${s}, matching ${title}.`
  }
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
    const text = `I got ${res!.title} on YoYo Flavor Quiz!`
    const url = 'https://wa.me/?text=' + encodeURIComponent(text)
    window.open(url, '_blank')
  }
  if (done && res) {
    try { localStorage.setItem('quiz:last', res.title) } catch {}
  }
  return (
    <Page>
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>{t(locale, 'quiz')}</Typography>
      <Stepper activeStep={Math.min(active, steps.length)} sx={{ mb: 1 }}>
        {steps.map((s) => (
          <Step key={s}><StepLabel>{s}</StepLabel></Step>
        ))}
      </Stepper>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>{locale === 'zh' ? `第 ${Math.min(active+1, steps.length)} 步，共 ${steps.length} 步` : `Step ${Math.min(active+1, steps.length)} of ${steps.length}`}</Typography>
      {!done && (
        <Stack spacing={2}>
          <Typography variant="h6">{steps[active]}</Typography>
          <Typography variant="body2" color="text.secondary">{stepDescriptions[active]}</Typography>
          <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
            {optionSets[active].map(opt => (
              <Stack key={opt.label} spacing={0.5} alignItems="flex-start">
                <Button variant={opt.value === 3 ? 'contained' : opt.value === 2 ? 'outlined' : 'text'} onClick={() => pick(opt.value)}>{opt.label}</Button>
                <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
              </Stack>
            ))}
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="text" disabled={active === 0} onClick={back}>{locale === 'zh' ? '返回' : 'Back'}</Button>
          </Stack>
        </Stack>
      )}
      {done && res && (
        <Stack spacing={3}>
          <Typography variant="h6">{t(locale, 'quiz_match')}</Typography>
          <Card sx={{ maxWidth: 600 }}>
            <CardMedia component="img" height="200" image={res.image} />
            <CardContent>
              <Typography variant="h5">{res.title}</Typography>
              <Typography variant="body2">Explore recommended dishes in this category.</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{explainMatch(locale, res.title, answers)}</Typography>
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
