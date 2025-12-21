'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { pageTransition } from '@/animations/variants'

interface PageTransitionProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'exit'> {
  children: React.ReactNode
}

export function PageTransition({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  )
}
