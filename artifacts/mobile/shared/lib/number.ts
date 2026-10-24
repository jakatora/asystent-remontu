/** Strict decimal input shared by Polish and English forms. Invalid input is NaN. */
export function parseDecimal(value: string): number {
  const input = value.trim();
  if (!/^[+-]?(?:(?:\d{1,3}(?:[ \u00a0\u202f]\d{3})+|\d+)(?:[.,]\d+)?|[.,]\d+)$/.test(input)) return NaN;
  const parsed = Number(input.replace(/[ \u00a0\u202f]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}
