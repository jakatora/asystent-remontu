/** Physical packs to buy, including a retailer's minimum order lot. Pure code
 * shared by the mobile reference budget and online basket comparison. */
export function computePackagesNeeded(quantity:number,packageSize:number,purchaseMultiple=1):number {
  if(!(quantity>0))return 0;
  const size=packageSize>0?packageSize:1;
  if(!Number.isSafeInteger(purchaseMultiple)||purchaseMultiple<1||purchaseMultiple>10_000)throw Error('invalid_purchase_multiple');
  const ratio=quantity/(size*purchaseMultiple),nearest=Math.round(ratio);
  // Exact physical multiples can land a few representable floats above an
  // integer (33.6 / 2.4 = 14.000000000000002). Ignore only that arithmetic
  // noise; a real excess still needs another pack, and positive demand never
  // snaps down to zero. No currency amounts are rounded here.
  const exact=nearest>0&&Math.abs(ratio-nearest)<=Number.EPSILON*Math.max(1,Math.abs(ratio))*4;
  return Math.max(1,Math.ceil(exact?nearest:ratio))*purchaseMultiple;
}
