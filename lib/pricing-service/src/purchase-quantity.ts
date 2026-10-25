/** Physical packs to buy, including a retailer's minimum order lot. Pure code
 * shared by the mobile reference budget and online basket comparison. */
export function computePackagesNeeded(quantity:number,packageSize:number,purchaseMultiple=1):number {
  if(!(quantity>0))return 0;
  const size=packageSize>0?packageSize:1;
  if(!Number.isSafeInteger(purchaseMultiple)||purchaseMultiple<1||purchaseMultiple>10_000)throw Error('invalid_purchase_multiple');
  return Math.ceil(quantity/(size*purchaseMultiple))*purchaseMultiple;
}
