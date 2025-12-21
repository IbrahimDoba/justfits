'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { staggerTextContainer, staggerTextItem } from '@/animations/variants'

interface StaggerTextProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  text: string
  delay?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function StaggerText({
  text,
  delay = 0,
  className,
  as = 'div',
  ...props
}: StaggerTextProps) {
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div
  const words = text.split(' ')

  return (
    <MotionComponent
      variants={staggerTextContainer}
      initial="hidden"
      animate="visible"
      custom={{ delay }}
      className={className}
      {...props}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} style={{ display: 'inline-block', overflow: 'hidden' }}>
          <motion.span
            variants={staggerTextItem}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionComponent>
  )
}

interface StaggerCharProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  text: string
  delay?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function StaggerChar({
  text,
  delay = 0,
  className,
  as = 'div',
  ...props
}: StaggerCharProps) {
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div
  const characters = text.split('')

  return (
    <MotionComponent
      variants={staggerTextContainer}
      initial="hidden"
      animate="visible"
      custom={{ delay }}
      className={className}
      {...props}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={staggerTextItem}
          style={{ display: 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </MotionComponent>
  )
}
