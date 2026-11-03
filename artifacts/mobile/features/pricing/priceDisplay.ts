/** Display integer grosze in the user's notation. An unknown amount must never
 * look like a free product or delivery. */
export function formatGrosze(grosze: number | null | undefined, currency = 'PLN', locale = 'pl-PL'): string {
  if (typeof grosze !== 'number' || !Number.isSafeInteger(grosze)) return '—';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(grosze / 100);
}
