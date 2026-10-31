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

export function formatPurchase(pack:{count:number;packageSize:number;offerId?:string;url?:string|null;cutRoll?:{widthMm:number;lengthMm:number}},unit:string|null,language:string='pl'):string {
  if(pack.cutRoll)return `${pack.count} × ${language==='pl'?'odcinek':'cut'} ${formatPackageSize(pack.cutRoll.widthMm/1000,language)} m × ${formatPackageSize(pack.cutRoll.lengthMm/1000,language)} m`;
  // Each reviewed native variant is a set of sealed 6 m² packs. Do not infer
  // physical pack counts from a different retailer's offer or a similar name.
  // source: https://dekork.pl/products/profesjonalny-podklad-lvt-1-5mm-wysoka-gestosc-6m2-do-60m2
  const match=pack.offerId?.match(/^dekork-professional-([2-9]|10)pack$/),variants=['57433631392075','57433631424843','57433631457611','57433631490379','57433631523147','57433631555915','57841959502155','57841959534923','57841959567691'];
  if(match&&unit==='m2'&&pack.packageSize===Number(match[1])*6&&pack.url){
    try{const url=new URL(pack.url),n=Number(match[1]);if(url.origin==='https://dekork.pl'&&url.pathname==='/products/profesjonalny-podklad-lvt-1-5mm-wysoka-gestosc-6m2-do-60m2'&&url.searchParams.get('variant')===variants[n-2])return language==='pl'?`${pack.count} × zestaw ${n} paczek po 6 m² (${formatPackageSize(pack.packageSize,language)} m²)`:`${pack.count} × set of ${n} packs of 6 m² (${formatPackageSize(pack.packageSize,language)} m²)`;}catch{/* Keep the ordinary coverage display for an unconfirmed link. */}
  }
  return `${pack.count} × ${formatPackageSize(pack.packageSize,language)} ${formatPackageUnit(unit)}`.trim();
}
