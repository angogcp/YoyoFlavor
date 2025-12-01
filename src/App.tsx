import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { Box } from '@mui/material'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Reviews from './pages/Reviews'
import Quiz from './pages/Quiz'
import Blog from './pages/Blog'
import Post from './pages/Post'
import Admin from './pages/Admin'
import Messages from './pages/Messages'
import Order from './pages/Order'
import { AnimatePresence } from 'framer-motion'

export default function App() {
  const location = useLocation()
  return (
    <Box>
      <Box sx={{ displayPrint: 'none' }}><Header /></Box>
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/en" />} />
        <Route path=":page/*" element={<RedirectToEn />} />
        <Route path="/en">
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="order" element={<Order />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<Post />} />
          <Route path="admin" element={<Admin />} />
          <Route path="messages" element={<Messages />} />
        </Route>
        <Route path="/zh">
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="order" element={<Order />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<Post />} />
          <Route path="admin" element={<Admin />} />
          <Route path="messages" element={<Messages />} />
        </Route>
      </Routes>
      </AnimatePresence>
      <Box sx={{ displayPrint: 'none' }}><Footer /></Box>
    </Box>
  )
}

function RedirectToEn() {
  const params = useParams()
  const page = params.page || ''
  const rest = params['*']
  const to = rest ? `/en/${page}/${rest}` : `/en/${page}`
  return <Navigate to={to} />
}
