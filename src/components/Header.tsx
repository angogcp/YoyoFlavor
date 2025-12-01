import { AppBar, Toolbar, Box, IconButton, Typography, Button, Stack, useScrollTrigger, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import MenuIcon from '@mui/icons-material/Menu'
import { useThemeMode } from '../theme/ThemeController'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLocation, useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import { useState } from 'react'

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
  
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState)
  }

  const navItems = [
    { key: 'home', to: `/${locale}` },
    { key: 'menu', to: `/${locale}/menu` },
    { key: 'order_now', to: `/${locale}/order`, highlight: true },
    { key: 'gallery', to: `/${locale}/gallery` },
    { key: 'reviews', to: `/${locale}/reviews` },
    { key: 'blog', to: `/${locale}/blog` },
    { key: 'contact', to: `/${locale}/contact` },
    { key: 'messages', to: `/${locale}/messages` },
    { key: 'quiz', to: `/${locale}/quiz`, highlight: true },
    { key: 'admin', to: `/${locale}/admin` },
  ]

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontFamily: 'Pacifico, cursive', color: 'primary.main' }}>
        YoYo Flavor
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton onClick={() => nav(item.to)} sx={{ textAlign: 'center' }}>
              <ListItemText primary={t(locale as any, item.key as any)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar color="transparent" position="sticky" elevation={trigger ? 4 : 0} sx={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.6)', ...(mode === 'dark' ? { backgroundColor: 'rgba(18,18,18,0.6)' } : {}) }}>
        <Toolbar sx={{ px: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
            <Box component="img" src={settings?.logoUrl || '/images/yoyo logo.png'} alt="YoYo" sx={{ height: 40 }} />
            <Typography variant="h5" sx={{ fontFamily: 'Pacifico, cursive', color: 'primary.main' }}>YoYo Flavor</Typography>
          </Stack>
          
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button 
                key={item.key} 
                onClick={() => nav(item.to)}
                variant={item.highlight ? "contained" : "text"}
                color={item.highlight ? "primary" : "inherit"}
              >
                {t(locale as any, item.key as any)}
              </Button>
            ))}
          </Stack>
          
          <IconButton onClick={toggle} sx={{ ml: 2 }} aria-label="toggle theme">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <Button size="small" variant="outlined" onClick={() => nav(switchLocalePath(loc.pathname, locale === 'en' ? 'zh' : 'en'))} aria-label="switch language" sx={{ ml: 1 }}>
            {locale === 'en' ? '中文' : 'EN'}
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  )
}
