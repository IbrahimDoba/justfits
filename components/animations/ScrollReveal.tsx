'use client'

import { motion, HTMLMotionProps, useInView } from 'framer-motion'
import { useRef } from 'react'
import { scrollReveal, scrollRevealLeft, scrollRevealRight } from '@/animations/variants'

type Direction = 'up' | 'left' | 'right'

interface ScrollRevealProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate'> {
  direction?: Direction
  delay?: number
  once?: boolean
  children: React.ReactNode
}

const directionVariants = {
  up: scrollReveal,
  left: scrollRevealLeft,
  right: scrollRevealRight,
}

export function ScrollReveal({
  direction = 'up',
  delay = 0,
  once = true,
  children,
  ...props
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once,
    margin: '-100px',
  })

  const variant = directionVariants[direction]

  return (
    <motion.div
      ref={ref}
      variants={variant}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      custom={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
