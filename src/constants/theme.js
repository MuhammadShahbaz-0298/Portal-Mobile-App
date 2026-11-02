// Central design tokens so every screen uses the same visual language.
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
  touchTarget: 48,
  inputHeight: 50,
  avatarSize: 42,
  fabSize: 56,
});

// Splash screen sizes — the native splash uses the same background color.
export const splashSizes = Object.freeze({
  logo: 168,
  spinnerMargin: spacing.xxl,
});
