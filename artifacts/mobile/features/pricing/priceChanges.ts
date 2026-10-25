import type { SerializedProject } from './pricingApi';

export interface SeenPrice {
  key: string; offerId: string; productName: string; store: string;
  priceGrosze: number; packageSize: number | null; unit: string | null; checkedAt: string;
}
export interface PriceSnapshot { version: 1; offers: Record<string, SeenPrice> }
export interface PriceChange extends SeenPrice { previousGrosze: number; deltaGrosze: number; previousCheckedAt: string }
export const emptyPriceSnapshot = (): PriceSnapshot => ({ version:1, offers:{} });
const valid = (p: any): p is SeenPrice => p && typeof p.key==='string' && p.key.length<500 && typeof p.offerId==='string' && typeof p.productName==='string' && typeof p.store==='string' &&
  Number.isSafeInteger(p.priceGrosze) && p.priceGrosze>0 && Number.isFinite(Date.parse(p.checkedAt)) &&
  (p.packageSize===null || typeof p.packageSize==='number' && Number.isFinite(p.packageSize) && p.packageSize>0) && (p.unit===null || typeof p.unit==='string');
export function parsePriceSnapshot(raw: string | null): PriceSnapshot {
  try {
    if (!raw || raw.length>500_000) return emptyPriceSnapshot();
    const data=JSON.parse(raw);
    if (data?.version!==1 || !data.offers || typeof data.offers!=='object' || Object.keys(data.offers).length>500) return emptyPriceSnapshot();
    const offers:Record<string,SeenPrice>={};
    for(const [key,value] of Object.entries(data.offers)) if(valid(value)&&value.key===key) offers[key]=value;
    return {version:1,offers};
  } catch { return emptyPriceSnapshot(); }
}
/** Same EAN/product, same offer and store, same pack and base unit. Quantity and
 * a change of the winning retailer must never look like a product price rise. */
export function collectSeenPrices(data: SerializedProject): PriceSnapshot {
  const offers: Record<string,SeenPrice>={}, conflicts=new Set<string>();
  for (const stage of data.stages) for (const line of stage.lines) {
    if (!line.resolved || !line.product) continue;
    for (const offer of line.offers ?? []) {
      if (offer.priceGrosze===null || !offer.fetchedAt) continue;
      const size:number=Number(offer.packageSize ?? line.product.packageSize);
      const unit:string|null=offer.unit ?? line.product.packageUnit ?? null;
      const pack:number|null=Number.isFinite(size)&&size>0 ? size : null;
      const key=JSON.stringify([line.product.ean ?? line.product.gtin ?? line.product.id,offer.offerId,offer.store,pack,unit]);
      const seen: SeenPrice={key,offerId:offer.offerId,productName:line.product.name,store:offer.store,priceGrosze:offer.priceGrosze,packageSize:pack,unit,checkedAt:offer.fetchedAt};
      if (!valid(seen)) continue;
      if (offers[key] && offers[key].priceGrosze!==seen.priceGrosze) conflicts.add(key);
      offers[key]=seen;
    }
  }
  for (const key of conflicts) delete offers[key];
  return {version:1,offers:Object.fromEntries(Object.entries(offers).slice(0,500))};
}
export function comparePriceSnapshots(previous: PriceSnapshot, current: PriceSnapshot): PriceChange[] {
  return Object.values(current.offers).flatMap(now=>{
    const before=previous.offers[now.key];
    if (!before || now.priceGrosze===before.priceGrosze || Date.parse(now.checkedAt)<=Date.parse(before.checkedAt)) return [];
    return [{...now,previousGrosze:before.priceGrosze,deltaGrosze:now.priceGrosze-before.priceGrosze,previousCheckedAt:before.checkedAt}];
  }).sort((a,b)=>Math.abs(b.deltaGrosze)-Math.abs(a.deltaGrosze));
}
export function mergePriceSnapshots(previous:PriceSnapshot,current:PriceSnapshot):PriceSnapshot {
  const merged={...previous.offers};
  for (const [key,value] of Object.entries(current.offers)) if (!merged[key] || Date.parse(value.checkedAt)>Date.parse(merged[key].checkedAt)) merged[key]=value;
  return {version:1,offers:Object.fromEntries(Object.entries(merged).sort((a,b)=>Date.parse(b[1].checkedAt)-Date.parse(a[1].checkedAt)).slice(0,500))};
}
