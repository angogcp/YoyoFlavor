import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import baseTheme from '../theme'

type Ctx = { mode: 'light' | 'dark'; toggle: () => void }
const ThemeCtx = createContext<Ctx | null>(null)

export function useThemeMode() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('ThemeCtx')
  return ctx
}

export default function ThemeController({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme:mode') as 'light' | 'dark') || 'light')
  useEffect(() => { localStorage.setItem('theme:mode', mode) }, [mode])
  const theme = useMemo(() => createTheme({ ...baseTheme, palette: { ...baseTheme.palette, mode } }), [mode])
  const value = useMemo(() => ({ mode, toggle: () => setMode(mode === 'light' ? 'dark' : 'light') }), [mode])
  return (
    <ThemeCtx.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeCtx.Provider>
  )
}
