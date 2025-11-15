import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#c62828' },
    secondary: { main: '#ff7043' },
    background: { default: '#fafafa', paper: '#ffffff' },
    text: { primary: '#1a1a1a' }
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    h1: { fontWeight: 700, letterSpacing: 0.2 },
    h2: { fontWeight: 700, letterSpacing: 0.2 },
    h3: { fontWeight: 600, letterSpacing: 0.2 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 600 }
  },
  shape: { borderRadius: 14 },
  components: {
    MuiContainer: {
      defaultProps: { maxWidth: 'lg' }
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 12, paddingInline: 16 },
        contained: { boxShadow: 'none' },
        containedPrimary: {
          backgroundImage: 'linear-gradient(135deg, #c62828 0%, #ff7043 100%)',
          color: '#fff',
          '&:hover': {
            backgroundImage: 'linear-gradient(135deg, #b71c1c 0%, #ff5c2a 100%)'
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12 }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 }
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: 3 }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 }
      }
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: { color: '#c62828' }
      }
    }
  }
})

export default theme
