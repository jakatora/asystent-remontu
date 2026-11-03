/** Strict decimal input shared by Polish and English forms. Invalid input is NaN. */
export function parseDecimal(value: string): number {
  const input = value.trim();
  if (!/^[+-]?(?:(?:\d{1,3}(?:[ \u00a0\u202f]\d{3})+|\d+)(?:[.,]\d+)?|[.,]\d+)$/.test(input)) return NaN;
  const parsed = Number(input.replace(/[ \u00a0\u202f]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

/** A blank optional measurement is absent. Invalid input stays distinguishable. */
export function parseOptionalPositiveDecimal(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = parseDecimal(value);
  return parsed > 0 ? parsed : NaN;
}
