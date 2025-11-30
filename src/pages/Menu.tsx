import {
  Box, Container, Grid, Card, CardMedia, CardContent, Typography, TextField,
  Stack, Button, Dialog, DialogContent, Divider, Chip, Skeleton,
  FormControl, InputLabel, Select, MenuItem, InputAdornment, IconButton,
  useTheme, useMediaQuery, Fab, Tooltip, Switch, FormControlLabel
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import Page from '../components/Page'
import { useLocation } from 'react-router-dom'
import SEO from '../components/SEO'
import { t } from '../i18n'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import CloseIcon from '@mui/icons-material/Close'

function useLocale() {
  const { pathname } = useLocation()
  const seg = pathname.split('/')[1]
  return seg === 'zh' ? 'zh' : 'en'
}

import { categories } from '../data/menu'

const FilterChip = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <Chip
    label={label}
    onClick={onClick}
    sx={{
      fontWeight: 600,
      bgcolor: active ? 'primary.main' : 'background.paper',
      color: active ? 'primary.contrastText' : 'text.primary',
      border: '1px solid',
      borderColor: active ? 'primary.main' : 'divider',
      '&:hover': {
        bgcolor: active ? 'primary.dark' : 'action.hover',
      },
      transition: 'all 0.2s ease'
    }}
  />
)

export default function Menu() {
  const [q, setQ] = useState('')
  const locale = useLocale()
  const [selected, setSelected] = useState<string[]>([])
  const [recommended, setRecommended] = useState<string | null>(null)
  
  useEffect(() => { try { setRecommended(localStorage.getItem('quiz:last')) } catch {} }, [])
  
  const [useGhibli, setUseGhibli] = useState(false)
  const [sort, setSort] = useState<'relevance' | 'likes' | 'alpha'>('relevance')
  const qc = useQueryClient()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const likes = useQuery({
    queryKey: ['likes'],
    queryFn: async () => {
      const entries: Record<string, number> = {}
      await Promise.all(categories.map(async c => { entries[c.title] = await api.getLikes(`category:${c.title}`) }))
      return entries
    }
  })

  const list = categories
    .filter(c => c.title.toLowerCase().includes(q.toLowerCase()))
    .filter(c => selected.every(tag => (c as any).tags?.includes(tag)))
    .sort((a, b) => {
      if (sort === 'alpha') return a.title.localeCompare(b.title)
      if (sort === 'likes') {
        const la = (likes.data?.[a.title] ?? 0)
        const lb = (likes.data?.[b.title] ?? 0)
        return lb - la
      }
      const ra = a.title === recommended ? 1 : 0
      const rb = b.title === recommended ? 1 : 0
      if (ra !== rb) return rb - ra
      return a.title.localeCompare(b.title)
    })

  const likeMut = useMutation({
    mutationFn: (key: string) => api.like(key),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['likes'] })
  })

  const [selectedIndex, setSelectedIndex] = useState(0)

  // Reset index when list changes if out of bounds
  useEffect(() => {
    if (selectedIndex >= list.length && list.length > 0) {
      setSelectedIndex(0)
    }
  }, [list.length, selectedIndex])

  const activeCategory = list[selectedIndex]

  const handleNext = () => {
    if (selectedIndex < list.length - 1) setSelectedIndex(selectedIndex + 1)
  }

  const handlePrev = () => {
    if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1)
  }

  return (
    <Page>
      <SEO title="YoYo Flavor – Menu" description="Browse categories across noodles, hot pot, snacks, and more." locale={locale as any} />
      
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative', 
        bgcolor: 'primary.main', 
        color: 'white', 
        pt: { xs: 6, md: 8 }, 
        pb: { xs: 10, md: 12 },
        mb: -6,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            {t(locale as any, 'our_menu')}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, fontWeight: 400, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            {t(locale as any, 'menu_subtitle')}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 8 }}>
        {/* Control Bar */}
        <Card sx={{ 
          p: 2, 
          mb: 4, 
          position: 'relative', 
          zIndex: 2, 
          mt: 0,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: 3
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                placeholder={t(locale as any, 'search')} 
                value={q} 
                onChange={e => setQ(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    bgcolor: 'background.default' 
                  } 
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent={isMobile ? 'space-between' : 'flex-end'}>
                <Stack direction="row" spacing={1} overflow="auto" sx={{ pb: 0.5, '::-webkit-scrollbar': { display: 'none' } }}>
                  {selected.length > 0 && (
                    <Chip 
                      label={t(locale as any, 'filter_clear' as any)} 
                      onClick={() => setSelected([])}
                      onDelete={() => setSelected([])}
                      color="error"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  {[
                    { key: 'spicy', label: t(locale as any, 'filter_spicy') },
                    { key: 'comfort', label: t(locale as any, 'filter_comfort') },
                    { key: 'quick', label: t(locale as any, 'filter_quick') },
                    { key: 'crunchy', label: t(locale as any, 'filter_crunchy') },
                    { key: 'soft', label: t(locale as any, 'filter_soft') },
                    { key: 'light', label: t(locale as any, 'filter_light') },
                    { key: 'adventurous', label: t(locale as any, 'filter_adventurous') }
                  ].map(f => (
                    <FilterChip 
                      key={f.key} 
                      label={f.label} 
                      active={selected.includes(f.key)} 
                      onClick={() => setSelected(selected.includes(f.key) ? selected.filter(x => x !== f.key) : [...selected, f.key])} 
                    />
                  ))}
                </Stack>
                
                <FormControl size="small" sx={{ minWidth: 120, display: { xs: 'none', sm: 'flex' } }}>
                  <Select 
                    value={sort} 
                    onChange={e => setSort(e.target.value as any)}
                    displayEmpty
                    renderValue={(val) => {
                      if (val === 'relevance') return t(locale as any, 'sort_relevance');
                      if (val === 'likes') return t(locale as any, 'sort_likes');
                      return t(locale as any, 'sort_alpha');
                    }}
                    sx={{ borderRadius: 2, bgcolor: 'background.default' }}
                  >
                    <MenuItem value="relevance">{t(locale as any, 'sort_relevance')}</MenuItem>
                    <MenuItem value="likes">{t(locale as any, 'sort_likes')}</MenuItem>
                    <MenuItem value="alpha">{t(locale as any, 'sort_alpha')}</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={<Switch checked={useGhibli} onChange={e => setUseGhibli(e.target.checked)} />}
                  label={<Typography variant="body2" fontWeight="bold">Ghibli Style</Typography>}
                />
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* Menu Book View */}
        {list.length > 0 && activeCategory ? (
          <Grid container spacing={4} sx={{ minHeight: '600px' }}>
            {/* Table of Contents (Sidebar) */}
            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="h6" fontWeight="bold">Menu Sections</Typography>
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                  <Stack spacing={1}>
                    {list.map((item, index) => (
                      <Button
                        key={item.title}
                        fullWidth
                        variant={index === selectedIndex ? 'contained' : 'text'}
                        color={index === selectedIndex ? 'primary' : 'inherit'}
                        onClick={() => setSelectedIndex(index)}
                        sx={{ 
                          justifyContent: 'flex-start', 
                          textAlign: 'left',
                          py: 1.5,
                          px: 2,
                          borderRadius: 2,
                          fontWeight: index === selectedIndex ? 700 : 400
                        }}
                      >
                        {t(locale as any, item.id as any)}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              </Card>
            </Grid>

            {/* Menu Page Viewer */}
            <Grid item xs={12} md={9}>
              <Card sx={{ 
                height: '100%', 
                minHeight: 600,
                borderRadius: 3, 
                position: 'relative', 
                overflow: 'hidden',
                bgcolor: '#f5f5f5',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
                  >
                     {/* Header of Page */}
                     <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h5" fontWeight="bold">{t(locale as any, activeCategory.id as any)}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                           <Tooltip title="Like this category">
                              <IconButton onClick={() => likeMut.mutate(`category:${activeCategory.title}`)} color="secondary">
                                {(likes.data?.[activeCategory.title] ?? 0) > 0 ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                              </IconButton>
                           </Tooltip>
                           <Typography variant="body2" fontWeight="bold">{likes.data?.[activeCategory.title] ?? 0}</Typography>
                        </Stack>
                     </Box>

                     {/* Page Content (Image) */}
                     <Box sx={{ flex: 1, position: 'relative', bgcolor: '#222', overflow: 'auto', display: 'flex', alignItems: 'start', justifyContent: 'center' }}>
                        <Box 
                          component="img" 
                          src={useGhibli && (activeCategory as any).ghibliImage ? (activeCategory as any).ghibliImage : activeCategory.image} 
                          alt={activeCategory.title}
                          sx={{ 
                            width: '100%', 
                            height: 'auto', 
                            maxWidth: '100%',
                            display: 'block',
                            boxShadow: 3
                          }} 
                        />
                     </Box>

                     {/* Navigation Footer */}
                     <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button 
                          disabled={selectedIndex === 0} 
                          onClick={handlePrev}
                          startIcon={<span>←</span>}
                        >
                          Previous
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                          Page {selectedIndex + 1} of {list.length}
                        </Typography>
                        <Button 
                          disabled={selectedIndex === list.length - 1} 
                          onClick={handleNext}
                          endIcon={<span>→</span>}
                        >
                          Next
                        </Button>
                     </Box>
                  </motion.div>
                </AnimatePresence>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">No menu items found matching your criteria.</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => { setQ(''); setSelected([]); }}>Clear Filters</Button>
          </Box>
        )}

      </Container>
    </Page>
  )
}
