import type {CatalogRefreshOffer} from '../../../../lib/pricing-service/src/catalog-refresh';
import type {RetailSource,RetailObservation} from './retail-pages';
import type {RetailPriceHistory} from './retail-history';

/** Only confirmed reads of this exact physical package are displayed.
 * History also binds every series to its merchant, variant and package. */
export function catalogRefreshOffers(
  sources:readonly RetailSource[],observations:ReadonlyMap<string,RetailObservation>,
  activeIds:ReadonlySet<string>,confirmedIds:readonly string[],history:RetailPriceHistory,
):CatalogRefreshOffer[]{
  const selected=sources.filter(s=>activeIds.has(s.id)&&confirmedIds.includes(s.id)&&observations.has(s.id));
  const current=new Map(selected.map(s=>{const o=observations.get(s.id)!;return[s.id,{priceGrosze:o.priceGrosze,observedAt:o.observedAt}]as const;}));
  const series=history.response(selected,current)?.series??[];
  return selected.map(s=>{
    const o=observations.get(s.id)!,record=series.find(row=>row.offerId===s.id&&row.stats.current===o.priceGrosze&&row.history.at(-1)?.fetchedAt===o.observedAt);
    const point=record&&record.stats.previousGrosze!==null?record.history.at(-2):undefined;
    const previous=point?{priceGrosze:point.priceGrosze,checkedAt:point.fetchedAt}:null;
    return{offerId:s.id,store:s.store,sourceUrl:s.url,currency:'PLN' as const,packageSize:s.packageSize,unit:s.unit,priceGrosze:o.priceGrosze,checkedAt:o.observedAt,previous,deltaGrosze:previous?record!.stats.deltaGrosze:null};
  }).sort((a,b)=>a.priceGrosze-b.priceGrosze||a.store.localeCompare(b.store)||a.offerId.localeCompare(b.offerId));
}
