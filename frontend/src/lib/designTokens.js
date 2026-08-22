/**
 * Design Tokens Premium — Roommate Finder AI
 *
 * Inspiré par :
 * - Airbnb (softness, typography, spacing)
 * - Apple (subtle shadows, glassmorphism)
 * - Linear (motion, timing)
 * - Notion (whitespace)
 * - Spotify (colors)
 * - Bumble (playful gradients)
 *
 * Structure :
 * - COLORS : palette étendue avec gradients
 * - MOTION : timings et easings premium
 * - SHADOWS : ombres sophistiquées (layered)
 * - SPRINGS : configurations Framer Motion
 */

// ============================================================
// COLORS
// ============================================================

export const COLORS = {
  // Primary — Emerald (branding roommate)
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',  // primary
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  // Secondary — Teal
  secondary: {
    50: '#f0fdfa',
    500: '#14b8a6',
    600: '#0d9488',
  },

  // Accent — Indigo (for AI touches)
  accent: {
    50: '#eef2ff',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
  },

  // Neutral (warm gray, pas cold blue-gray)
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
    950: '#0c0a09',
  },

  // Warm background (pas white pur, subtle warmth)
  background: {
    primary: '#fffdf9',   // slight warm tint
    secondary: '#faf9f6',
    card: '#ffffff',
    overlay: 'rgba(28, 25, 23, 0.4)',
  },

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
  info: '#3b82f6',
}

// ============================================================
// GRADIENTS
// ============================================================

export const GRADIENTS = {
  // Hero gradient (Bumble-inspired mais plus subtile)
  hero: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #6366f1 100%)',
  heroSoft: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 50%, #eef2ff 100%)',

  // Match score gradients (par tier)
  scoreExcellent: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  scoreGood: 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)',
  scoreMedium: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
  scoreLow: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',

  // Card highlights (super subtle)
  cardHover: 'linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, transparent 100%)',
  cardActive: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',

  // AI touches (Indigo → Purple)
  aiBubble: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  aiGlow: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',

  // Verification badges
  verified: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
}

// ============================================================
// SHADOWS (layered, sophisticated)
// ============================================================

export const SHADOWS = {
  // Subtle (default cards)
  xs: '0 1px 2px 0 rgba(28, 25, 23, 0.04)',
  sm: '0 1px 3px 0 rgba(28, 25, 23, 0.06), 0 1px 2px -1px rgba(28, 25, 23, 0.06)',
  md: '0 4px 6px -1px rgba(28, 25, 23, 0.06), 0 2px 4px -2px rgba(28, 25, 23, 0.06)',

  // Elevated (cards on hover, dropdowns)
  lg: '0 10px 15px -3px rgba(28, 25, 23, 0.08), 0 4px 6px -4px rgba(28, 25, 23, 0.05)',
  xl: '0 20px 25px -5px rgba(28, 25, 23, 0.1), 0 8px 10px -6px rgba(28, 25, 23, 0.06)',

  // Premium (modals, floating actions)
  '2xl': '0 25px 50px -12px rgba(28, 25, 23, 0.18)',

  // Glow (score cards, CTAs)
  glowEmerald: '0 0 40px -8px rgba(16, 185, 129, 0.35)',
  glowIndigo: '0 0 40px -8px rgba(99, 102, 241, 0.35)',

  // Inner shadow (input focus)
  inset: 'inset 0 2px 4px 0 rgba(28, 25, 23, 0.04)',
}

// ============================================================
// BORDER RADIUS
// ============================================================

export const RADIUS = {
  xs: '4px',
  sm: '6px',
  md: '10px',
  lg: '16px',    // cards
  xl: '20px',    // match cards
  '2xl': '24px', // hero sections
  full: '9999px',
}

// ============================================================
// SPACING (Airbnb-inspired, generous)
// ============================================================

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
}

// ============================================================
// MOTION (timings et easings premium)
// ============================================================

export const EASING = {
  // Standard curves (matériel Design 3 inspired)
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],

  // Emphasized (Bumble/Airbnb style)
  emphasized: [0.2, 0, 0, 1],
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1],
  emphasizedAccelerate: [0.3, 0, 0.8, 0.15],

  // Playful (for micro-interactions)
  bounce: [0.68, -0.55, 0.265, 1.55],
}

export const DURATION = {
  instant: 0.1,
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
  slower: 0.8,
  cinematic: 1.2,
}

// ============================================================
// SPRING CONFIGS (Framer Motion)
// ============================================================

export const SPRINGS = {
  // Gentle (default, most UI)
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
    mass: 1,
  },

  // Snappy (buttons, small elements)
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },

  // Wobbly (playful, celebrations)
  wobbly: {
    type: 'spring',
    stiffness: 300,
    damping: 15,
    mass: 1.2,
  },

  // Slow (large elements, hero)
  slow: {
    type: 'spring',
    stiffness: 100,
    damping: 25,
    mass: 1.5,
  },

  // Stiff (menus, dropdowns)
  stiff: {
    type: 'spring',
    stiffness: 500,
    damping: 40,
    mass: 0.6,
  },
}

// ============================================================
// FRAMER MOTION VARIANTS (ready-to-use)
// ============================================================

export const VARIANTS = {
  // Fade in from bottom (cards, sections)
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...SPRINGS.gentle },
    },
  },

  // Fade in (subtle)
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: DURATION.base, ease: EASING.standard },
    },
  },

  // Scale in (buttons, badges)
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { ...SPRINGS.snappy },
    },
  },

  // Slide in from right (drawers, sheets)
  slideInRight: {
    hidden: { x: '100%' },
    visible: {
      x: 0,
      transition: { ...SPRINGS.gentle },
    },
    exit: {
      x: '100%',
      transition: { ...SPRINGS.snappy },
    },
  },

  // Stagger children (lists, grids)
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...SPRINGS.gentle },
    },
  },

  // Card hover (Airbnb-style raise)
  cardHover: {
    rest: {
      y: 0,
      boxShadow: SHADOWS.sm,
      transition: { ...SPRINGS.gentle },
    },
    hover: {
      y: -4,
      boxShadow: SHADOWS.xl,
      transition: { ...SPRINGS.gentle },
    },
  },

  // Button tap (spring bounce)
  buttonTap: {
    rest: { scale: 1 },
    hover: { scale: 1.03, transition: { ...SPRINGS.snappy } },
    tap: { scale: 0.97, transition: { ...SPRINGS.snappy } },
  },
}

// ============================================================
// TYPOGRAPHY (font sizes with letter-spacing tuned)
// ============================================================

export const TYPOGRAPHY = {
  // Display (hero, landing)
  display: {
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    lineHeight: '1.05',
    letterSpacing: '-0.03em',
    fontWeight: 700,
  },

  // Headings
  h1: {
    fontSize: 'clamp(1.875rem, 3vw, 2.5rem)',
    lineHeight: '1.1',
    letterSpacing: '-0.025em',
    fontWeight: 700,
  },
  h2: {
    fontSize: '1.5rem',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
    fontWeight: 600,
  },
  h3: {
    fontSize: '1.25rem',
    lineHeight: '1.3',
    letterSpacing: '-0.015em',
    fontWeight: 600,
  },

  // Body
  body: {
    fontSize: '1rem',
    lineHeight: '1.6',
    letterSpacing: '-0.01em',
    fontWeight: 400,
  },
  bodySmall: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    letterSpacing: '-0.005em',
    fontWeight: 400,
  },

  // Labels
  label: {
    fontSize: '0.875rem',
    lineHeight: '1.4',
    letterSpacing: '0',
    fontWeight: 500,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: '1.4',
    letterSpacing: '0.01em',
    fontWeight: 400,
  },

  // Numbers (tabular, for scores)
  numeric: {
    fontVariantNumeric: 'tabular-nums',
    fontFeatureSettings: '"tnum"',
  },
}