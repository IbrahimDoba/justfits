'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight } from '@/animations/variants'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'exit'> {
  direction?: Direction
  delay?: number
  duration?: number
  children: React.ReactNode
}

const directionVariants = {
  up: fadeInUp,
  down: fadeInDown,
  left: fadeInLeft,
  right: fadeInRight,
  none: fadeIn,
}

export function FadeIn({
  direction = 'none',
  delay = 0,
  duration,
  children,
  ...props
}: FadeInProps) {
  const variant = directionVariants[direction]

  return (
    <motion.div
      variants={variant}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={{ delay, duration }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
