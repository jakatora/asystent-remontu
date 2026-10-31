import {createHash} from 'node:crypto';
import type {RetailObservation, RetailSource} from './retail-pages';
import {retailComparableEan, retailProductId, retailProductName} from './retail-sku';

const RETENTION_MS = 90 * 86400000;
const MAX_POINTS = 60;
interface SavedPoint { identity: string; observation: RetailObservation }

/** A merchant changing its SKU, fulfilment branch or physical pack starts a new
 * series. A shared GTIN alone does not make different bundles comparable. */
export function historyIdentity(s: RetailSource): string {
  return createHash('sha256').update(JSON.stringify([s.id,s.ean,s.skuIdentity,s.dispatchDepartment,s.store,s.url,s.brand,s.category,s.packageSize,s.unit,s.format,s.productId,s.variantId,s.apiProductCode,s.retailerSku,s.retailerUnitId,s.productUuid,s.retailUnit,s.packageDescription,s.purchaseMultiple,s.minimumPackages])).digest('hex');
}

/** Stores only accepted, evidenced merchant reads. No interpolation, demo
 * points, automatic promotion claims or comparison between different offers. */
export class RetailPriceHistory {
  private readonly rows = new Map<string, SavedPoint[]>();
  private readonly conflicts = new Set<string>();
  constructor(private readonly sources: readonly RetailSource[], private readonly validate: (o: RetailObservation) => RetailSource | undefined) {}

  remember(observation: RetailObservation, now = Date.now()): void {
    const source = this.validate(observation), time = Date.parse(observation?.observedAt);
    if (!source || time < now-RETENTION_MS || time > now+60000) return;
    const key = `${source.id}/${time}`;
    if (this.conflicts.has(key)) return;
    const rows = this.rows.get(source.id) ?? [];
    const same = rows.find(p => Date.parse(p.observation.observedAt) === time);
    if (same) {
      if (same.observation.priceGrosze !== observation.priceGrosze) {
        this.rows.set(source.id,rows.filter(p => p !== same));
        this.conflicts.add(key);
      }
      return;
    }
    const saved: RetailObservation = {sourceId:source.id,ean:source.ean,name:source.name,imageUrl:null,sourceUrl:source.url,currency:'PLN',availability:'in_stock',priceGrosze:observation.priceGrosze,observedAt:observation.observedAt,evidenceSha256:observation.evidenceSha256,
      ...(observation.verification ? {verification:observation.verification} : {})};
    rows.push({identity:historyIdentity(source),observation:saved});
    this.rows.set(source.id,rows.filter(p => Date.parse(p.observation.observedAt) >= now-RETENTION_MS).sort((a,b)=>Date.parse(a.observation.observedAt)-Date.parse(b.observation.observedAt)).slice(-MAX_POINTS));
  }

  restore(value: unknown): void {
    if (!Array.isArray(value) || value.length > this.sources.length*MAX_POINTS) return;
    for (const point of value) {
      if (!point || typeof point !== 'object' || !point.observation || typeof point.observation !== 'object') continue;
      const source = this.sources.find(s => s.id === point.observation.sourceId);
      if (source && point.identity === historyIdentity(source)) this.remember(point.observation);
    }
  }

  snapshot(now = Date.now()): SavedPoint[] {
    return [...this.rows.values()].flat().filter(p=>Date.parse(p.observation.observedAt)>=now-RETENTION_MS);
  }

  response(sources: readonly RetailSource[], current: ReadonlyMap<string, {priceGrosze:number;observedAt:string}>) {
    const series = sources.flatMap(source => {
      const points = (this.rows.get(source.id) ?? []).filter(p=>p.identity===historyIdentity(source)&&Date.parse(p.observation.observedAt)>=Date.now()-RETENTION_MS).map(p=>p.observation);
      if (!points.length) return [];
      const last = points.at(-1)!, active = current.get(source.id);
      const price = active?.priceGrosze===last.priceGrosze && active.observedAt===last.observedAt ? active.priceGrosze : null;
      const previous = price!==null && points.length>1 ? points.at(-2)!.priceGrosze : null;
      const delta = price!==null && previous!==null ? price-previous : null;
      const lowest = Math.min(...points.map(p=>p.priceGrosze)), count=points.length;
      const average = Number((points.reduce((sum,p)=>sum+BigInt(p.priceGrosze),0n)+BigInt(Math.floor(count/2)))/BigInt(count));
      return [{offerId:source.id,store:source.store,url:source.url,packageSize:source.packageSize,unit:source.unit,
        stats:{count,lowest,average,current:price,changeVsLowest:price===null?null:price-lowest,changePct:delta===null||previous===null?null:Math.round(delta/previous*10000)/100,isRealPromo:false,previousGrosze:previous,deltaGrosze:delta},
        history:points.map(p=>({offerId:source.id,store:source.store,source:'retailer-verified-observation',fetchedAt:p.observedAt,priceGrosze:p.priceGrosze,promoPriceGrosze:null,effectiveGrosze:p.priceGrosze}))}];
    }).sort((a,b)=>Number(b.stats.current!==null)-Number(a.stats.current!==null)||a.store.localeCompare(b.store)||a.packageSize-b.packageSize||a.offerId.localeCompare(b.offerId));
    if (!series.length) return null;
    const source = sources.find(s=>s.id===series[0].offerId)!;
    return {product:{id:retailProductId(source),name:retailProductName(source),ean:retailComparableEan(source)||null,gtin:null,category:source.category,packageSize:String(source.packageSize),packageUnit:source.unit},
      stats:series[0].stats,history:series[0].history,series,scope:{kind:'recorded_observations',retentionDays:90,maxPointsPerOffer:MAX_POINTS,completeStoreHistory:false,deliveryIncluded:false}};
  }
}
