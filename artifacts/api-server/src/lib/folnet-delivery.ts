import { createHash } from 'node:crypto';
import { parsePriceToGrosze } from '@workspace/price-collector';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';
import { RETAIL_SOURCES } from './retail-catalog';
import { inspectFolnetProduct } from './folnet-product';
import { cleanHtml, htmlElements } from './retail-microdata';

const money = (value: unknown, formatted: unknown) => {
  if (typeof value !== 'string' || !/^\d+\.\d{2}$/.test(value) || typeof formatted !== 'string' || !/^[\d\s,.]+\s*zł$/.test(formatted)) throw Error('invalid_money');
  const amount = parsePriceToGrosze(value), visible = parsePriceToGrosze(formatted.replace(/\s*zł$/, ''));
  if (amount === null || amount < 0 || amount !== visible) throw Error('invalid_money'); return amount;
};

export function selectFolnetHomeRate(data: any, materialsGrosze: number) {
  if (!Array.isArray(data?.prepaid) || !Array.isArray(data.dvp)) throw Error('invalid_response');
  const candidates: {costGrosze: number; carrier: string; payment: string}[] = [];
  for (const rate of data.prepaid) {
    if (!rate || ({'85-1':'Kurier GLS','100163-1':'Kurier DPD'} as Record<string,string>)[rate.id] !== rate.name || rate.pickuppoint !== 'n' || rate.minworthreached !== 'true' || rate.calendar !== 'n' || !rate.additional_services_cost) continue;
    try {
      const cost = money(rate.cost, rate.cost_formatted);
      const extras = Object.values(rate.additional_services_cost ?? {}) as any[];
      if (!extras.length || extras.some(extra => extra?.gross !== '0.00')) continue;
      // Zero is accepted only as this courier's explicit free-delivery rule.
      if (cost === 0) { const threshold = money(rate.limitfree, rate.limitfree_formatted); if (threshold <= 0 || materialsGrosze < threshold) continue; }
      candidates.push({costGrosze:cost,carrier:rate.name,payment:'Przedpłata'});
    } catch { /* An incomplete carrier response is not a free quote. */ }
  }
  const best = candidates.sort((a,b)=>a.costGrosze-b.costGrosze)[0];
  if (!best) throw Error('no_home_delivery'); return best;
}

/** Uses the same native full-product request as the shop's delivery popup.
 * Fresh cookie jar: products are supplied once, not added to an existing cart.
 * source: https://folnet.pl/gfx/pol/shop.js.gzip?r=1718706231
 */
export async function quoteFolnet(order: DeliveredStoreBasket, fetchImpl: typeof fetch): Promise<DeliveryQuoteResult> {
  if (order.store !== 'Folnet' || !order.lines.length) throw Error('invalid_basket');
  const client = new AnonymousShop('https://folnet.pl', fetchImpl, AbortSignal.timeout(15_000), retailerRequestBudget(order.lines.length));
  const wanted = new Map<number, {count:number;price:number}>();
  let materials = 0;
  for (const line of order.lines) for (const pack of line.packages) {
    const source = RETAIL_SOURCES.find(source=>source.id===pack.offerId && source.store==='Folnet' && source.format==='folnet');
    if (!source || !source.productId || !Number.isSafeInteger(pack.count) || pack.count < 1 || pack.count > MAX_RETAIL_PACKAGES || wanted.has(source.productId)) throw Error('invalid_basket');
    const raw = await client.text(source.url), current = inspectFolnetProduct(raw,source);
    if (htmlElements(cleanHtml(raw), a=>a.id==='menu_basket' && (a.class?.split(/\s+/).includes('empty_bsket')??false)).length !== 1) throw Error('basket_not_confirmed');
    if (current.amount !== pack.unitPriceGrosze) throw Error('price_changed');
    if (pack.count > current.stock) throw Error('product_unavailable');
    wanted.set(source.productId,{count:pack.count,price:current.amount});
    materials += current.amount * pack.count;
  }
  if (!Number.isSafeInteger(materials) || materials !== order.materialsGrosze || !wanted.size) throw Error('basket_not_confirmed');
  const query = new URLSearchParams({mode:'productAndBasket'});
  for (const [id,item] of wanted) query.set(`products[${id}][uniw][quantity]`,String(item.count));
  const raw = await client.text('/ajax/get-deliveries.php?'+query,{getAjax:'true'});
  const response = JSON.parse(raw), best = selectFolnetHomeRate(response,materials), now = new Date();
  return {quote:{...best,checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600_000).toISOString(),sourceUrl:'https://folnet.pl/pl/delivery.html',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:createHash('sha256').update(JSON.stringify({products:[...wanted],response})).digest('hex')}};
}
