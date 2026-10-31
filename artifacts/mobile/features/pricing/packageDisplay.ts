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

export function formatPurchase(pack:{count:number;packageSize:number;cutRoll?:{widthMm:number;lengthMm:number}},unit:string|null,language:string='pl'):string {
  if(pack.cutRoll)return `${pack.count} × ${language==='pl'?'odcinek':'cut'} ${formatPackageSize(pack.cutRoll.widthMm/1000,language)} m × ${formatPackageSize(pack.cutRoll.lengthMm/1000,language)} m`;
  return `${pack.count} × ${formatPackageSize(pack.packageSize,language)} ${formatPackageUnit(unit)}`.trim();
}
