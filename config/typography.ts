/**
 * JUSTFITS Typography System
 * Premium brand typography configuration
 * Inspired by high-end fashion e-commerce aesthetics
 */

export const typography = {
  // Font Families
  fonts: {
    display: 'var(--font-display)', // For hero headings and impact text
    heading: 'var(--font-heading)', // For section headings
    body: 'var(--font-body)',       // For body text and descriptions
    mono: 'var(--font-mono)',       // For SKU, prices, technical details
  },

  // Font Sizes - Mobile First
  sizes: {
    // Display (Hero)
    displayLg: 'clamp(3rem, 8vw, 6rem)',       // 48px - 96px
    displayMd: 'clamp(2.5rem, 6vw, 4.5rem)',   // 40px - 72px
    displaySm: 'clamp(2rem, 5vw, 3.5rem)',     // 32px - 56px

    // Headings
    h1: 'clamp(2rem, 4vw, 3rem)',              // 32px - 48px
    h2: 'clamp(1.75rem, 3.5vw, 2.5rem)',       // 28px - 40px
    h3: 'clamp(1.5rem, 3vw, 2rem)',            // 24px - 32px
    h4: 'clamp(1.25rem, 2.5vw, 1.5rem)',       // 20px - 24px
    h5: 'clamp(1.125rem, 2vw, 1.25rem)',       // 18px - 20px
    h6: 'clamp(1rem, 1.5vw, 1.125rem)',        // 16px - 18px

    // Body
    bodyLg: '1.125rem',     // 18px
    body: '1rem',           // 16px
    bodySm: '0.875rem',     // 14px
    bodyXs: '0.75rem',      // 12px

    // Special
    caption: '0.875rem',    // 14px
    overline: '0.75rem',    // 12px - uppercase
    label: '0.875rem',      // 14px
    button: '0.9375rem',    // 15px
  },

  // Font Weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  // Line Heights
  lineHeights: {
    tight: 1.1,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.8,
    double: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    mega: '0.2em',    // For premium brand aesthetic
  },
} as const

// Typography Classes for Tailwind
export const typographyClasses = {
  // Display Styles (Hero sections)
  displayLg: 'font-display text-displayLg font-black leading-tight tracking-tighter',
  displayMd: 'font-display text-displayMd font-black leading-tight tracking-tight',
  displaySm: 'font-display text-displaySm font-bold leading-snug tracking-tight',

  // Heading Styles
  h1: 'font-heading text-h1 font-bold leading-tight tracking-tight',
  h2: 'font-heading text-h2 font-bold leading-tight tracking-tight',
  h3: 'font-heading text-h3 font-semibold leading-snug',
  h4: 'font-heading text-h4 font-semibold leading-snug',
  h5: 'font-heading text-h5 font-medium leading-normal',
  h6: 'font-heading text-h6 font-medium leading-normal',

  // Body Styles
  bodyLg: 'font-body text-bodyLg font-regular leading-relaxed',
  body: 'font-body text-body font-regular leading-normal',
  bodySm: 'font-body text-bodySm font-regular leading-normal',
  bodyXs: 'font-body text-bodyXs font-regular leading-normal',

  // Special Styles
  caption: 'font-body text-caption font-regular leading-normal text-gray-600',
  overline: 'font-heading text-overline font-semibold leading-normal uppercase tracking-widest',
  label: 'font-heading text-label font-medium leading-normal uppercase tracking-wide',

  // Product-specific
  productName: 'font-heading text-h4 font-semibold leading-snug tracking-tight',
  productPrice: 'font-mono text-h5 font-bold tracking-tight',
  productDescription: 'font-body text-body font-regular leading-relaxed',

  // Button
  button: 'font-heading text-button font-semibold leading-none tracking-wide uppercase',
  buttonLg: 'font-heading text-bodyLg font-semibold leading-none tracking-wide uppercase',
  buttonSm: 'font-heading text-bodySm font-medium leading-none tracking-wide uppercase',

  // Premium brand specific
  brandTitle: 'font-display text-h2 font-black leading-none tracking-mega uppercase',
  heroTitle: 'font-display text-displayLg font-black leading-none tracking-tighter',
  sectionTitle: 'font-heading text-h2 font-bold leading-tight tracking-tight',
} as const

export type TypographyClass = keyof typeof typographyClasses
