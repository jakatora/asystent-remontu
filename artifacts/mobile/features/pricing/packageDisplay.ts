/** Package coverage is a product specification, not a monetary amount. */
export function formatPackageSize(size: number, language: string = 'pl'): string {
  if (!Number.isFinite(size) || size < 0) return '—';
  return new Intl.NumberFormat(language === 'pl' ? 'pl-PL' : 'en-GB', {
    maximumFractionDigits: 8,
  }).format(size);
}

export function formatPackageUnit(unit: string | null): string {
  return unit === 'm2' ? 'm²' : unit === 'm3' ? 'm³' : unit ?? '';
}
