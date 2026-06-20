// ─── Design Tokens ────────────────────────────────────────────────────────────
//
// Every color, size, and weight used in the app lives here.
// Components must import from this file — no hardcoded hex or inline shadows.

// ─── Colors ───────────────────────────────────────────────────────────────────

export const colors = {
  /** App background (OLED-friendly near-black) */
  background: '#0B0B11',

  /** Card / surface background */
  surface: '#16161F',

  /** Slightly elevated surface (e.g. stat cards, inputs) */
  surfaceHigh: '#1D1D28',

  /** Accent — logged state, CTAs */
  accent: '#4ADE80',

  /** Dark green used as the filled ring base layer */
  accentFill: '#1A3A26',

  /** Unlogged ring / muted interactive elements */
  ringUnlogged: '#2D2D3C',

  /** Subtle dividers and borders */
  border: '#222230',

  /** Destructive actions (delete) */
  danger: '#F87171',

  /** Tinted background behind a destructive icon button */
  dangerFill: '#3A1A1F',

  text: {
    primary: '#F2F2F7',
    secondary: '#8E8EA0',
    muted: '#5A5A6E',
    onAccent: '#0B3319',   // text on a green button/badge
  },

  calendar: {
    logged: '#4ADE80',
    missed: '#1A1A25',
    today: '#2A2A38',       // today cell (unlogged)
    todayLogged: '#4ADE80', // today cell when logged
    future: 'transparent',
  },

  /** Status bar / navigation bar tint — matches background */
  systemBar: '#0B0B11',
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ─── Border radii ─────────────────────────────────────────────────────────────

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

/**
 * Font families. These must exactly match the key names passed to useFonts().
 * Inter_800ExtraBold is loaded in App.tsx so weight-800 headings render on Android.
 * Roboto does not reliably render 800, hence the explicit bundle.
 */
export const fonts = {
  regular: 'Inter_400Regular',
  semiBold: 'Inter_600SemiBold',
  extraBold: 'Inter_800ExtraBold',
} as const;

export const fontSizes = {
  caption: 11,
  label: 13,
  body: 15,
  title: 17,
  heading: 22,
  hero: 52,
} as const;

// ─── Shadow (Android) ─────────────────────────────────────────────────────────

/**
 * Android shadows are set via elevation; iOS shadow* props are ignored.
 * The view must have a solid backgroundColor for elevation to cast a shadow.
 */
export const cardShadow = {
  elevation: 2,
} as const;

export const cardShadowHigh = {
  elevation: 4,
} as const;

// ─── Ring sizes ───────────────────────────────────────────────────────────────

export const ringSize = {
  card: 44,    // home screen cards — minimum touch target
  detail: 56,  // detail screen stat section
} as const;
