export const Colors = {
  primary: '#F97316',
  primaryDark: '#EA6800',
  primaryLight: '#FED7AA',
  primaryBg: '#FFF7ED',

  secondary: '#1E293B',
  secondaryLight: '#334155',

  success: '#22C55E',
  successBg: '#F0FDF4',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  info: '#3B82F6',
  infoBg: '#EFF6FF',

  white: '#FFFFFF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  difficultyEasy: '#22C55E',
  difficultyMedium: '#F59E0B',
  difficultyHard: '#EF4444',

  riskLow: '#22C55E',
  riskMedium: '#F59E0B',
  riskHigh: '#EF4444',

  // Category accent colours
  categoryPaint:    '#A78BFA',
  categoryWall:     '#60A5FA',
  categoryFloor:    '#34D399',
  categoryBath:     '#38BDF8',
  categoryElectric: '#FBBF24',
  categoryPlumbing: '#F472B6',
  categoryDoors:    '#FB923C',
  categoryKitchen:  '#E879F9',
  categoryGypsum:   '#94A3B8',
  categoryWindows:  '#67E8F9',
  categoryOther:    '#94A3B8',
} as const;

export type ColorKey = keyof typeof Colors;
