import { motion } from 'framer-motion'
import React from 'react'

type Props = { children: React.ReactNode }

export default function Page({ children }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  )
}
