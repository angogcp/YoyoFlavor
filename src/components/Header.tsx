import { AppBar, Toolbar, Box, IconButton, Typography, Button, Stack, useScrollTrigger } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useThemeMode } from '../theme/ThemeController'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLocation, useNavigate } from 'react-router-dom'
import { t } from '../i18n'

function useLocale() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

function switchLocalePath(pathname: string, next: 'en' | 'zh') {
  const parts = pathname.split('/').filter(Boolean)
  parts[0] = next
  return '/' + parts.join('/')
}

export default function Header() {
  const loc = useLocation()
  const nav = useNavigate()
  const locale = useLocale()
  const { mode, toggle } = useThemeMode()
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 4 })
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => api.getSettings() })
  return (
    <AppBar color="transparent" position="sticky" elevation={trigger ? 4 : 0} sx={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.6)', ...(mode === 'dark' ? { backgroundColor: 'rgba(18,18,18,0.6)' } : {}) }}>
      <Toolbar sx={{ px: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
          <Typography variant="h6">YoYo Flavor</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button onClick={() => nav(`/${locale}`)}>{t(locale as any, 'home')}</Button>
          <Button onClick={() => nav(`/${locale}/gallery`)}>{t(locale as any, 'gallery')}</Button>
          <Button onClick={() => nav(`/${locale}/reviews`)}>{t(locale as any, 'reviews')}</Button>
          <Button onClick={() => nav(`/${locale}/blog`)}>{t(locale as any, 'blog')}</Button>
          <Button onClick={() => nav(`/${locale}/contact`)}>{t(locale as any, 'contact')}</Button>
          <Button onClick={() => nav(`/${locale}/messages`)}>{t(locale as any, 'messages')}</Button>
          <Button variant="contained" color="primary" onClick={() => nav(`/${locale}/quiz`)}>{t(locale as any, 'quiz')}</Button>
          <Button onClick={() => nav(`/${locale}/admin`)}>{t(locale as any, 'admin')}</Button>
        </Stack>
        <IconButton onClick={toggle} sx={{ ml: 2 }} aria-label="toggle theme">
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <Button size="small" variant="outlined" onClick={() => nav(switchLocalePath(loc.pathname, locale === 'en' ? 'zh' : 'en'))} aria-label="switch language" sx={{ ml: 1 }}>
          {locale === 'en' ? '中文' : 'EN'}
        </Button>
      </Toolbar>
    </AppBar>
  )
}
