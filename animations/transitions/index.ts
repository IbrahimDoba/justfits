/**
 * JUSTFITS Transition & Easing System
 * Premium motion timing for luxury brand experience
 */

import { Transition } from 'framer-motion'

// ============================================
// EASING CURVES
// ============================================

export const easing = {
  // Premium easing curves
  smooth: [0.4, 0, 0.2, 1], // cubic-bezier for smooth transitions
  snappy: [0.6, 0.01, 0.05, 0.9], // Quick and responsive
  elastic: [0.68, -0.55, 0.27, 1.55], // Bouncy effect
  elegant: [0.4, 0, 0.6, 1], // Slow start, slow end

  // Directional easing
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],

  // Special effects
  anticipate: [0.5, 0.05, 0.2, 1.05], // Slight overshoot
  circOut: [0, 0.55, 0.45, 1],
  backOut: [0.34, 1.56, 0.64, 1],
} as const

// ============================================
// DURATION PRESETS
// ============================================

export const duration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  moderate: 0.4,
  slow: 0.5,
  slower: 0.6,
  slowest: 0.8,

  // Specific use cases
  microInteraction: 0.15,
  hover: 0.2,
  pageTransition: 0.4,
  modalAnimation: 0.3,
  drawerAnimation: 0.4,
} as const

// ============================================
// SPRING CONFIGURATIONS
// ============================================

export const spring = {
  // Gentle spring
  gentle: {
    type: "spring" as const,
    stiffness: 100,
    damping: 15,
    mass: 0.8,
  },

  // Bouncy spring
  bouncy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 10,
    mass: 0.5,
  },

  // Smooth spring
  smooth: {
    type: "spring" as const,
    stiffness: 150,
    damping: 20,
    mass: 1,
  },

  // Snappy spring
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    mass: 0.5,
  },

  // Wobbly spring
  wobbly: {
    type: "spring" as const,
    stiffness: 180,
    damping: 12,
    mass: 1,
  },
} as const

// ============================================
// COMMON TRANSITIONS
// ============================================

export const transition = {
  // Default smooth transition
  default: {
    duration: duration.normal,
    ease: easing.smooth,
  } as Transition,

  // Fast and snappy
  fast: {
    duration: duration.fast,
    ease: easing.snappy,
  } as Transition,

  // Elegant and slow
  elegant: {
    duration: duration.slow,
    ease: easing.elegant,
  } as Transition,

  // Page transitions
  page: {
    duration: duration.pageTransition,
    ease: easing.smooth,
    when: "beforeChildren" as const,
    staggerChildren: 0.1,
  } as Transition,

  // Stagger animations
  stagger: (delay: number = 0.1) => ({
    staggerChildren: delay,
    delayChildren: 0.2,
  }) as Transition,

  // Fade transitions
  fade: {
    duration: duration.normal,
    ease: easing.smooth,
  } as Transition,

  // Scale transitions
  scale: {
    duration: duration.moderate,
    ease: easing.smooth,
  } as Transition,

  // Slide transitions
  slide: {
    duration: duration.moderate,
    ease: easing.smooth,
  } as Transition,

  // Modal/Overlay
  modal: {
    duration: duration.modalAnimation,
    ease: easing.smooth,
  } as Transition,

  // Drawer/Sidebar
  drawer: {
    duration: duration.drawerAnimation,
    ease: easing.smooth,
  } as Transition,

  // Hover effects
  hover: {
    duration: duration.hover,
    ease: easing.smooth,
  } as Transition,

  // Button press
  tap: {
    duration: duration.microInteraction,
    ease: easing.snappy,
  } as Transition,
} as const

// ============================================
// STAGGER CONFIGURATIONS
// ============================================

export const stagger = {
  // Fast stagger for text
  text: {
    staggerChildren: 0.015,
    delayChildren: 0.05,
  },

  // Normal stagger for lists
  list: {
    staggerChildren: 0.1,
    delayChildren: 0.1,
  },

  // Slow stagger for cards
  cards: {
    staggerChildren: 0.15,
    delayChildren: 0.2,
  },

  // Very fast stagger
  micro: {
    staggerChildren: 0.03,
    delayChildren: 0,
  },

  // Custom stagger function
  custom: (children: number, delay: number = 0) => ({
    staggerChildren: children,
    delayChildren: delay,
  }),
} as const

// ============================================
// SCROLL ANIMATION CONFIGURATION
// ============================================

export const scroll = {
  // Default scroll reveal
  reveal: {
    duration: duration.slow,
    ease: easing.smooth,
  },

  // Parallax effect timing
  parallax: {
    duration: 0,
    ease: "linear" as const,
  },

  // Scroll-triggered entrance
  entrance: {
    duration: duration.slower,
    ease: easing.elegant,
  },
} as const

// ============================================
// LAYOUT TRANSITIONS
// ============================================

export const layout = {
  // Smooth layout shift
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },

  // Fast layout shift
  fast: {
    type: "spring" as const,
    stiffness: 500,
    damping: 35,
  },

  // Bouncy layout shift
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 20,
  },
} as const

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Creates a transition with custom delay
 */
export const withDelay = (baseTransition: Transition, delay: number): Transition => ({
  ...baseTransition,
  delay,
})

/**
 * Creates a stagger transition
 */
export const withStagger = (
  baseTransition: Transition,
  staggerDelay: number,
  childrenDelay: number = 0
): Transition => ({
  ...baseTransition,
  staggerChildren: staggerDelay,
  delayChildren: childrenDelay,
  when: "beforeChildren" as const,
})

/**
 * Respects user's motion preferences
 */
export const respectMotionPreference = (transition: Transition): Transition => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      duration: 0.01,
    }
  }
  return transition
}
