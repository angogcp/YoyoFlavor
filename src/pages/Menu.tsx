import {
  Box, Container, Grid, Card, CardMedia, CardContent, Typography, TextField,
  Stack, Button, Dialog, DialogContent, Divider, Chip, Skeleton,
  FormControl, InputLabel, Select, MenuItem, InputAdornment, IconButton,
  useTheme, useMediaQuery, Fab, Tooltip
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

  const [open, setOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<typeof categories[number] | null>(null)

  const handleOpen = (item: typeof categories[number]) => {
    setActiveItem(item)
    setOpen(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
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

      <Container maxWidth="lg" sx={{ pb: 8 }}>
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
              </Stack>
            </Grid>
          </Grid>
          
          {recommended && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestaurantMenuIcon fontSize="small" color="secondary" />
              <Typography variant="body2" color="text.secondary">
                {t(locale as any, 'recommended_for_you')}: <strong>{recommended}</strong>
              </Typography>
            </Box>
          )}
        </Card>

        {/* Menu Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            <AnimatePresence>
              {list.map((c) => (
                <Grid item xs={12} sm={6} md={4} key={c.title}>
                  <motion.div variants={itemVariants} layoutId={c.title}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
                        },
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ position: 'relative', overflow: 'hidden', pt: '120%' }}>
                        <CardMedia 
                          component="img" 
                          image={c.image} 
                          alt={t(locale as any, c.id as any)} 
                          onClick={() => handleOpen(c)} 
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%', 
                            width: '100%', 
                            objectFit: 'cover',
                            objectPosition: 'top',
                            cursor: 'pointer',
                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'scale(1.08)'
                            }
                          }} 
                        />
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 16, 
                            right: 16, 
                            zIndex: 2 
                          }}
                        >
                           <Tooltip title="Like">
                            <Fab 
                              size="small" 
                              color="inherit"
                              onClick={(e) => { e.stopPropagation(); likeMut.mutate(`category:${c.title}`) }}
                              sx={{ 
                                bgcolor: 'rgba(255, 255, 255, 0.9)', 
                                backdropFilter: 'blur(4px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                '&:hover': { bgcolor: 'white' }
                              }}
                            >
                              {likes.data?.[c.title] ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                            </Fab>
                           </Tooltip>
                        </Box>
                        {recommended === c.title && (
                          <Chip 
                            color="secondary" 
                            size="small" 
                            label={t(locale as any, 'recommended_for_you')}
                            sx={{ 
                              position: 'absolute', 
                              top: 16, 
                              left: 16,
                              fontWeight: 'bold',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }} 
                          />
                        )}
                      </Box>

                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ fontSize: '1.25rem', lineHeight: 1.3 }}>
                            {t(locale as any, c.id as any)}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 2 }}>
                            <FavoriteIcon sx={{ fontSize: 14, color: 'error.main', opacity: 0.8 }} />
                            <Typography variant="caption" fontWeight="bold">
                              {likes.isLoading ? '...' : (likes.data?.[c.title] ?? 0)}
                            </Typography>
                          </Stack>
                        </Stack>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, flexGrow: 1, lineHeight: 1.6 }}>
                          {t(locale as any, `${c.id}_desc` as any)}
                        </Typography>

                        <Divider sx={{ mb: 2, borderColor: 'divider' }} />

                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.8 }}>
                          {((c as any).tags || []).map((tag: string) => (
                            <Chip 
                              key={tag} 
                              size="small" 
                              variant="filled"
                              label={
                                tag === 'spicy' ? t(locale as any, 'filter_spicy') :
                                tag === 'comfort' ? t(locale as any, 'filter_comfort') :
                                tag === 'quick' ? t(locale as any, 'filter_quick') :
                                tag === 'crunchy' ? t(locale as any, 'filter_crunchy') :
                                tag === 'soft' ? t(locale as any, 'filter_soft') :
                                tag === 'light' ? t(locale as any, 'filter_light') :
                                tag === 'adventurous' ? t(locale as any, 'filter_adventurous') : tag
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(selected.includes(tag) ? selected.filter(x => x !== tag) : [...selected, tag])
                              }}
                              sx={{ 
                                borderRadius: 1.5,
                                height: 26,
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                bgcolor: selected.includes(tag) ? 'primary.main' : 'action.hover',
                                color: selected.includes(tag) ? 'primary.contrastText' : 'text.primary',
                                '&:hover': {
                                  bgcolor: selected.includes(tag) ? 'primary.dark' : 'action.selected'
                                }
                              }}
                            />
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        </motion.div>

        {/* Detail Modal */}
        <Dialog 
          open={open} 
          onClose={() => setOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, overflow: 'hidden' }
          }}
        >
          {activeItem && (
            <>
              <Box sx={{ position: 'relative' }}>
                <IconButton 
                  onClick={() => setOpen(false)}
                  sx={{ 
                    position: 'absolute', 
                    right: 16, 
                    top: 16, 
                    bgcolor: 'rgba(0,0,0,0.5)', 
                    color: 'white', 
                    backdropFilter: 'blur(4px)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }, 
                    zIndex: 10 
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Box sx={{ bgcolor: 'background.default', display: 'flex', justifyContent: 'center', p: 0 }}>
                  <CardMedia 
                    component="img" 
                    image={activeItem.image} 
                    alt={t(locale as any, activeItem.id as any)} 
                    sx={{ 
                      maxHeight: '70vh',
                      width: '100%',
                      objectFit: 'contain'
                    }} 
                  />
                </Box>
              </Box>
              <DialogContent sx={{ p: 4 }}>
                <Typography variant="h4" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
                   {t(locale as any, activeItem.id as any)}
                </Typography>
                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1}>
                      {(activeItem as any).tags?.map((tag: string) => (
                         <Chip 
                           key={tag} 
                           label={
                              tag === 'spicy' ? t(locale as any, 'filter_spicy') :
                              tag === 'comfort' ? t(locale as any, 'filter_comfort') :
                              tag === 'quick' ? t(locale as any, 'filter_quick') :
                              tag === 'crunchy' ? t(locale as any, 'filter_crunchy') :
                              tag === 'soft' ? t(locale as any, 'filter_soft') :
                              tag === 'light' ? t(locale as any, 'filter_light') :
                              tag === 'adventurous' ? t(locale as any, 'filter_adventurous') : tag
                           } 
                           size="medium" 
                           sx={{ borderRadius: 2, fontWeight: 600 }}
                         />
                      ))}
                    </Stack>
                    <Chip icon={<FavoriteIcon />} label={`${likes.data?.[activeItem.title] ?? 0} likes`} color="primary" variant="outlined" />
                  </Stack>

                  <Typography variant="h6" sx={{ color: 'text.secondary', lineHeight: 1.8, fontWeight: 400 }}>
                    {t(locale as any, `${activeItem.id}_desc` as any)}
                  </Typography>
                  
                  <Box sx={{ pt: 2 }}>
                     <Button 
                       variant="contained" 
                       size="large" 
                       fullWidth 
                       onClick={() => { likeMut.mutate(`category:${activeItem.title}`); setOpen(false); }}
                       sx={{ 
                         py: 1.5, 
                         fontSize: '1.1rem',
                         borderRadius: 3,
                         boxShadow: '0 8px 24px rgba(198, 40, 40, 0.25)'
                       }}
                     >
                       {t(locale as any, 'cta_love')}
                     </Button>
                  </Box>
                </Stack>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Container>
    </Page>
  )
}
