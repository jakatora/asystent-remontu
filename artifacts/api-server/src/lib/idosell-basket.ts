import {parsePriceToGrosze} from '@workspace/price-collector';
import type {RetailSource} from './retail-pages';
function money(value:unknown,formatted?:unknown):number{
 if(!['string','number'].includes(typeof value))throw Error('invalid_money');const n=parsePriceToGrosze(value as string|number);
 if(n===null||!Number.isSafeInteger(n)||n<0||formatted!==undefined&&(typeof formatted!=='string'||!/^[\d\s,.]+\s*zł$/.test(formatted)||parsePriceToGrosze(formatted.replace(/\s*zł$/,''))!==n))throw Error('invalid_money');return n;
}
/** Exact native IdoSell basket proof; a postage placeholder is not a quote.
 * source: https://www.abud.pl/basketedit.php
 * source: https://chemiadoparkietu25.pl/basketedit.php */
export type IdosellBasketLine = {source:RetailSource;count:number;price:number};
export function confirmIdosellBasket(response: any, expected: readonly IdosellBasketLine[], materialsGrosze: number) {
  const basket = response?.basket;
  if (response?.error || response?.errors?.length || !basket || basket.error || basket.errors?.length || basket.shipping_exists !== true || basket.currency !== 'PLN' || basket.total_deposit !== 0 || basket.total_deposit_net !== 0
      || !Array.isArray(basket.products) || basket.products.length !== expected.length || !expected.length) throw Error('basket_not_confirmed');
  const remaining = new Map(expected.map(wanted=>[String(wanted.source.productId),wanted]));
  if (remaining.size !== expected.length) throw Error('invalid_basket');
  let total = 0, count = 0;
  for (const row of basket.products) {
    const wanted = remaining.get(row?.id);
    if (!wanted || row.size !== 'uniw' || row.price_unit !== wanted.source.apiPurchaseUnit || row.worth_unit !== wanted.source.apiPurchaseUnit
        || row.name !== wanted.source.name || new URL(row.link,wanted.source.url).href !== wanted.source.url || row.bonus !== 'n' || row.product_type !== 'product_item'
        || row.bundle !== 0 || !Array.isArray(row.bundled) || row.bundled.length || row.subscription_period !== '0') throw Error('basket_not_confirmed');
    if (!Number.isSafeInteger(row.reservation_stocksown) || row.reservation_stocksown < 0) throw Error('product_unavailable');
    if (wanted.count > row.reservation_stocksown) throw Error('insufficient_stock');
    if (row.count !== wanted.count) throw Error('basket_not_confirmed');
    if (typeof row.prices?.gros_formatted !== 'string' || typeof row.prices?.worth_gros_formatted !== 'string') throw Error('basket_not_confirmed');
    if (money(row.prices?.gros,row.prices?.gros_formatted) !== wanted.price || money(row.prices?.worth_gros,row.prices?.worth_gros_formatted) !== wanted.count*wanted.price) throw Error('price_changed');
    total += wanted.count*wanted.price; count += wanted.count; remaining.delete(row.id);
  }
  if (remaining.size || !Number.isSafeInteger(total) || total !== materialsGrosze || money(basket.worth) !== total || basket.productsNumber !== count) throw Error('basket_not_confirmed');
  return basket;
}
