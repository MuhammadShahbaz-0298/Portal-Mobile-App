// Central design tokens so every screen uses the same visual language.
// Light palette (default).
export const colors = Object.freeze({
  canvas: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F7',
  ink: '#17212B',
  inkSoft: '#3F4E5D',
  muted: '#667789',
  line: '#DCE3EC',
  brand: '#2057D6',
  brandDark: '#173F9E',
  brandSoft: '#E7EEFD',
  danger: '#C7353B',
  dangerSoft: '#FBE9EA',
  success: '#1F7A4D',
  successSoft: '#E4F5EC',
  warning: '#8A5B00',
  warningSoft: '#FFF2D6',
  white: '#FFFFFF',
  whiteSoft: '#D8E6FF',
  overlay: 'rgba(12, 22, 34, 0.48)',
  transparent: 'transparent',
});

export const spacing = Object.freeze({
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
});

export const radius = Object.freeze({
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
});

export const fontSize = Object.freeze({
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 32,
});

export const lineHeight = Object.freeze({
  xs: 16,
  sm: 20,
  md: 22,
  lg: 26,
  xl: 32,
  xxl: 38,
});

export const shadow = Object.freeze({
  card: {
    shadowColor: '#101B2A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
});

export const layout = Object.freeze({
  screenPadding: spacing.lg,
  screenBottomSpacing: spacing.sm,
  listBottomSpacing: 0,
  touchTarget: 48,
  compactTouchTarget: 44,
  inputHeight: 50,
  avatarSize: 42,
  fabSize: 56,
});

// Splash sizes — the native splash (app.json) uses the same background
// and shows the logo at the same width, so the hand-off is invisible.
export const splashSizes = Object.freeze({
  logo: 240,
  dotSize: 10,
  textRise: 14,
});
// Dark palette. Keep the same keys as the light palette so callers can swap.
export const colorsDark = Object.freeze({
  canvas: '#0F1724',
  surface: '#182233',
  surfaceMuted: '#223047',
  ink: '#EAF0F7',
  inkSoft: '#C9D4E3',
  muted: '#9AA8BC',
  line: '#2A3A52',
  brand: '#4F83FF',
  brandDark: '#3A6BE0',
  brandSoft: '#1E3A7A',
  danger: '#FF6B72',
  dangerSoft: '#3A1F22',
  success: '#4ADE80',
  successSoft: '#1F3A2A',
  warning: '#FBBF24',
  warningSoft: '#3A2F14',
  white: '#FFFFFF',
  whiteSoft: '#D8E6FF',
  overlay: 'rgba(0, 0, 0, 0.6)',
  transparent: 'transparent',
});
