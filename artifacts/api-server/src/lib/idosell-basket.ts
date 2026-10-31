import {parsePriceToGrosze} from '@workspace/price-collector';
import type {RetailSource} from './retail-pages';
import type {CartMaterialPricing} from '../../../../lib/pricing-service/src/delivery';
function money(value:unknown,formatted?:unknown):number{
 if(!['string','number'].includes(typeof value))throw Error('invalid_money');const n=parsePriceToGrosze(value as string|number);
 if(n===null||!Number.isSafeInteger(n)||n<0||formatted!==undefined&&(typeof formatted!=='string'||!/^[\d\s,.]+\s*zł$/.test(formatted)||parsePriceToGrosze(formatted.replace(/\s*zł$/,''))!==n))throw Error('invalid_money');return n;
}
/** Exact native IdoSell basket proof; a postage placeholder is not a quote.
 * source: https://www.abud.pl/basketedit.php
 * source: https://chemiadoparkietu25.pl/basketedit.php */
export type IdosellBasketLine = {source:RetailSource;count:number;price:number};
function inspectBasket(response: any, expected: readonly IdosellBasketLine[], materialsGrosze: number,discounts:boolean) {
  const basket = response?.basket;
  if (response?.error || response?.errors?.length || !basket || basket.error || basket.errors?.length || basket.shipping_exists !== true || basket.currency !== 'PLN' || basket.total_deposit !== 0 || basket.total_deposit_net !== 0
      || !Array.isArray(basket.products) || basket.products.length !== expected.length || !expected.length) throw Error('basket_not_confirmed');
  const remaining = new Map(expected.map(wanted=>[String(wanted.source.productId),wanted]));
  if (remaining.size !== expected.length) throw Error('invalid_basket');
  let total = 0, base = 0, count = 0;
  const lines:CartMaterialPricing['lines']=[];
  for (const row of basket.products) {
    const wanted = remaining.get(row?.id);
    if (!wanted || row.size !== 'uniw' || row.price_unit !== wanted.source.apiPurchaseUnit || row.worth_unit !== wanted.source.apiPurchaseUnit
        || row.name !== wanted.source.name || new URL(row.link,wanted.source.url).href !== wanted.source.url || row.bonus !== 'n' || row.product_type !== 'product_item'
        || row.bundle !== 0 || !Array.isArray(row.bundled) || row.bundled.length || row.subscription_period !== '0') throw Error('basket_not_confirmed');
    if (!Number.isSafeInteger(row.reservation_stocksown) || row.reservation_stocksown < 0) throw Error('product_unavailable');
    if (wanted.count > row.reservation_stocksown) throw Error('insufficient_stock');
    if (row.count !== wanted.count) throw Error('basket_not_confirmed');
    if (typeof row.prices?.gros_formatted !== 'string' || typeof row.prices?.worth_gros_formatted !== 'string') throw Error('basket_not_confirmed');
    const price=money(row.prices?.gros,row.prices?.gros_formatted),worth=money(row.prices?.worth_gros,row.prices?.worth_gros_formatted);
    if(!Number.isSafeInteger(wanted.price)||wanted.price<=0||!Number.isSafeInteger(wanted.count)||wanted.count<1
      ||price<=0||price>wanted.price||worth!==wanted.count*price||!Number.isSafeInteger(worth))throw Error('price_changed');
    if(price!==wanted.price){
      // The current public card was checked in this same anonymous request.
      // IdoSell's base_price can vary with quantity; it is not the immutable
      // one-pack catalogue observation. Never infer a percentage or a threshold.
      if(!discounts||wanted.source.store!=='ABUD'||money(row.prices?.base_price)<price)throw Error('price_changed');
    }
    lines.push({offerId:wanted.source.id,count:wanted.count,baseUnitPriceGrosze:wanted.price,unitPriceGrosze:price,lineCostGrosze:worth});
    total += worth;base += wanted.count*wanted.price;count += wanted.count;remaining.delete(row.id);
  }
  if (remaining.size || !Number.isSafeInteger(total)||!Number.isSafeInteger(base)||base!==materialsGrosze || money(basket.worth) !== total || basket.productsNumber !== count) throw Error('basket_not_confirmed');
  const cartPricing:CartMaterialPricing|undefined=total<base?{currency:'PLN',baseMaterialsGrosze:base,materialsGrosze:total,discountGrosze:base-total,lines}:undefined;
  return {basket,cartPricing};
}
export function confirmIdosellBasket(response:any,expected:readonly IdosellBasketLine[],materialsGrosze:number){return inspectBasket(response,expected,materialsGrosze,false).basket;}
/** Only the reviewed ABUD adapter opts in after checking every current card. */
export function confirmAbudCartPrices(response:any,expected:readonly IdosellBasketLine[],materialsGrosze:number){
 if(expected.some(p=>p.source.store!=='ABUD'||new URL(p.source.url).origin!=='https://www.abud.pl'))throw Error('invalid_basket');
 return inspectBasket(response,expected,materialsGrosze,true);
}
