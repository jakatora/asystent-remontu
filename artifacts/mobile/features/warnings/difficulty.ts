import type { Difficulty, RiskLevel } from '@/types/domain';

// ─── Difficulty ──────────────────────────────────────────────────────────────

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy:   'Łatwy',
  medium: 'Średni',
  hard:   'Trudny',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy:   '#16a34a',
  medium: '#d97706',
  hard:   '#dc2626',
};

export const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy:   'Dla każdego — nawet bez doświadczenia',
  medium: 'Wymaga podstawowych umiejętności i cierpliwości',
  hard:   'Zalecane doświadczenie lub pomoc drugiej osoby',
};

// ─── Risk level ─────────────────────────────────────────────────────────────

export const RISK_LABELS: Record<RiskLevel, string> = {
  low:    'Niskie ryzyko',
  medium: 'Średnie ryzyko',
  high:   'Wysokie ryzyko',
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  low:    '#16a34a',
  medium: '#d97706',
  high:   '#dc2626',
};

export const RISK_BADGE_VARIANTS: Record<RiskLevel, string> = {
  low:    'success',
  medium: 'warning',
  high:   'high',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDifficultyLabel(d: Difficulty | string): string {
  return DIFFICULTY_LABELS[d as Difficulty] ?? d;
}

export function getRiskLabel(r: RiskLevel | string): string {
  return RISK_LABELS[r as RiskLevel] ?? r;
}

export function getDifficultyColor(d: Difficulty | string): string {
  return DIFFICULTY_COLORS[d as Difficulty] ?? '#6b7280';
}

export function getRiskColor(r: RiskLevel | string): string {
  return RISK_COLORS[r as RiskLevel] ?? '#6b7280';
}
