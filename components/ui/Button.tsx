'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { button, buttonIcon } from '@/animations/variants'
import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'variants'> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  children: React.ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-black text-white hover:bg-gray-800',
  secondary: 'bg-[#d4af37] text-black hover:bg-[#c09f2f]',
  outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
  ghost: 'text-black hover:bg-gray-100',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-6 py-2.5 text-bodySm',
  md: 'px-8 py-3.5 text-button',
  lg: 'px-10 py-4 text-buttonLg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  children,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      variants={button}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={cn(
        'font-heading font-semibold tracking-wide uppercase rounded-full',
        'transition-colors duration-200',
        'flex items-center justify-center gap-3',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <motion.span variants={buttonIcon}>{icon}</motion.span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <motion.span variants={buttonIcon}>{icon}</motion.span>
      )}
    </motion.button>
  )
}
