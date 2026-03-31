// ─── Spacing scale (px) ──────────────────────────────────────────────────────
export const Spacing = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  x3l: 32,
  x4l: 40,
  x5l: 48,
} as const;

export type SpacingKey = keyof typeof Spacing;

// ─── Border radii ─────────────────────────────────────────────────────────────
export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof Radius;

// ─── Typography sizes (sp) ───────────────────────────────────────────────────
export const FontSize = {
  xxs:  11,
  xs:   13,
  sm:   15,
  md:   17,
  lg:   20,
  xl:   22,
  xxl:  26,
  x3l:  32,
} as const;

export type FontSizeKey = keyof typeof FontSize;

// ─── Font weights (Inter) ────────────────────────────────────────────────────
export const FontFamily = {
  regular:   'Inter_400Regular',
  medium:    'Inter_500Medium',
  semibold:  'Inter_600SemiBold',
  bold:      'Inter_700Bold',
} as const;

export type FontFamilyKey = keyof typeof FontFamily;

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  primary: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export type ShadowKey = keyof typeof Shadows;

// ─── Icon sizes ───────────────────────────────────────────────────────────────
export const IconSize = {
  xs:  14,
  sm:  16,
  md:  18,
  lg:  22,
  xl:  28,
  xxl: 36,
} as const;

// ─── Hit slop (touch target expansion) ───────────────────────────────────────
export const HitSlop = {
  sm:  { top: 4,  bottom: 4,  left: 4,  right: 4  },
  md:  { top: 8,  bottom: 8,  left: 8,  right: 8  },
  lg:  { top: 12, bottom: 12, left: 12, right: 12 },
} as const;
