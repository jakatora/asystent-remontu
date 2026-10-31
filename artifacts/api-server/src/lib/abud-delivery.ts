import {confirmIdosellBasket as confirmAbudBasket,type IdosellBasketLine as Wanted} from './idosell-basket';
import { createHash } from 'node:crypto';
import { parsePriceToGrosze } from '@workspace/price-collector';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';
import { RETAIL_SOURCES } from './retail-catalog';
import { parseRetailPage, type RetailSource } from './retail-pages';
import { cleanHtml, htmlAttributes, htmlElements } from './retail-microdata';

const ORIGIN = 'https://www.abud.pl';
const IDS = ['abud-aks-ydyp-3x15-5m','abud-aks-ydyp-3x15-100m','abud-aks-ydyp-3x25-25m','abud-aks-ydyp-3x25-100m','abud-soudal-26a-5kg','abud-teflon-12x10','abud-pex-elbow-16x16','abud-fischer-wst140k-2','abud-dulux-rapidry-white-matt-1l','abud-koelner-fs3525-1000','abud-koelner-ws3595-1000','abud-koelner-fx06k040-200','abud-metylan-remover-500ml','abud-acrylputz-st10-20kg','abud-atlas-unigrunt-5kg'];
function money(value: unknown, formatted?: unknown): number {
  if (!['string','number'].includes(typeof value)) throw Error('invalid_money');
  const amount = parsePriceToGrosze(value as string | number);
  if (amount === null || !Number.isSafeInteger(amount) || amount < 0) throw Error('invalid_money');
  if (formatted !== undefined && (typeof formatted !== 'string' || !/^[\d\s,.]+\s*zł$/.test(formatted)
      || parsePriceToGrosze(formatted.replace(/\s*zł$/, '')) !== amount)) throw Error('invalid_money');
  return amount;
}

/** Known prepaid home services, distinct from lockers, collection, COD and
 * local HDS services. Amounts always come from the current full-basket query.
 * source: https://www.abud.pl/Dostawa-Towaru-cinfo-pol-24.html
 * source: https://www.abud.pl/gfx/pol/shop.js.gzip?r=1792053849
 */
export function selectAbudHomeRate(response: any) {
  const rates = response?.data?.shipping?.shipping;
  if (response?.errors?.length || !Array.isArray(rates) || !rates.length || rates.length > 100) throw Error('invalid_response');
  const names: Record<number,string> = {100037:'Pocztex Kurier 24',85:'Paczka GLS',100336:'Pocztex Kurier XXL doręczenie pod wskazany adres',30:'DPD Paczka - niestandard'};
  const candidates: {costGrosze:number;carrier:string;payment:string}[] = [], seen = new Set<number>();
  for (const rate of rates) {
    const id = rate?.courier?.id;
    if (rate?.prepaid !== 'prepaid' || !Number.isSafeInteger(id) || names[id] !== rate.courier.name) continue;
    if (seen.has(id)) throw Error('invalid_response'); seen.add(id);
    // Explicit zero is valid for this named prepaid courier in a verified
    // nonempty basket. The cart's separate shippingCost=0 placeholder is unused.
    if (rate.cost?.value === undefined || rate.cost?.formatted === undefined) throw Error('invalid_money');
    candidates.push({costGrosze:money(rate.cost.value,rate.cost.formatted),carrier:rate.courier.name,payment:'Płatność z góry'});
  }
  const best = candidates.sort((a,b)=>a.costGrosze-b.costGrosze)[0];
  if (!best) throw Error('no_home_delivery'); return best;
}

export function confirmAbudDestination(response: any) {
  const regions = response?.valid_region?.['1'];
  if (response?.error || response?.errors?.length || response?.valid !== true || Object.keys(response.valid_region ?? {}).length !== 1 || !Array.isArray(regions) || regions.length !== 1
      || regions[0]?.shop_id !== '1' || !/^\d+$/.test(regions[0].id_region ?? '') || regions[0].url !== ORIGIN) throw Error('address_required');
  // Warsaw postcodes resolve to a child of Poland; nationwide courier areas
  // resolve directly to the same Poland root. Never accept another country.
  const region = regions[0];
  if (!(region.id_region === '1143020003' && region.parent === '0'
      || region.id_region !== '1143020003' && region.parent === '1143020003')) throw Error('address_required');
}

function confirmVariant(html: string, source: RetailSource) {
  const form = htmlElements(cleanHtml(html),(a,tag)=>tag==='form' && a['data-product_id']===String(source.productId));
  if (form.length !== 1) throw Error('product_unavailable');
  for (const [id,value] of [['projector_size_hidden','onesize'],['projector_mode_hidden','1']]) {
    const inputs = htmlElements(form[0],a=>a.id===id);
    if (inputs.length !== 1 || htmlAttributes(inputs[0].match(/^<[^>]+>/)?.[0] ?? '').value !== value) throw Error('product_unavailable');
  }
}
export {confirmIdosellBasket as confirmAbudBasket} from './idosell-basket';

/** Fresh private cookie jar, exact reviewed products, native cart quantities,
 * postcode check and the same rate query as the shop's basket popup.
 * Never follows checkout, supplies customer data or agrees to an order.
 * source: https://www.abud.pl/gfx/pol/shop.js.gzip?r=1792053849
 */
export async function quoteAbud(order: DeliveredStoreBasket, postalCode: string, fetchImpl: typeof fetch): Promise<DeliveryQuoteResult> {
  if (order.store !== 'ABUD' || !order.lines.length || !/^\d{2}-\d{3}$/.test(postalCode) || !Number.isSafeInteger(order.materialsGrosze) || order.materialsGrosze <= 0) throw Error('invalid_basket');
  const client = new AnonymousShop(ORIGIN,fetchImpl,AbortSignal.timeout(20_000),retailerRequestBudget(order.lines.length));
  const expected: Wanted[] = [], observations: string[] = [];
  for (const line of order.lines) for (const pack of line.packages) {
    const source = RETAIL_SOURCES.find(source=>source.id===pack.offerId && source.store==='ABUD' && source.format==='idosell');
    if (!source || !IDS.includes(source.id) || new URL(source.url).origin !== ORIGIN || pack.store !== 'ABUD' || pack.url !== source.url || pack.packageSize !== source.packageSize
        || !Number.isSafeInteger(pack.count) || pack.count < 1 || pack.count > MAX_RETAIL_PACKAGES || !Number.isSafeInteger(pack.unitPriceGrosze) || pack.unitPriceGrosze <= 0
        || pack.lineCostGrosze !== pack.count*pack.unitPriceGrosze || expected.some(row=>row.source.productId===source.productId)) throw Error('invalid_basket');
    const html = await client.text(source.url), observation = parseRetailPage(html,source,new Date()); confirmVariant(html,source);
    if (observation.priceGrosze !== pack.unitPriceGrosze) throw Error('price_changed');
    expected.push({source,count:pack.count,price:observation.priceGrosze}); observations.push(observation.evidenceSha256);
  }
  if (!expected.length || expected.reduce((sum,row)=>sum+row.count*row.price,0) !== order.materialsGrosze) throw Error('invalid_basket');
  const destination = await client.abud('destination',{postalCode}); confirmAbudDestination(destination);
  let added: any;
  for (const row of expected) added = await client.abud('add',{productId:row.source.productId,count:row.count});
  const basket = confirmAbudBasket(added,expected,order.materialsGrosze);
  const shipping = await client.abud('shipping'), best = selectAbudHomeRate(shipping), now = new Date();
  return {quote:{...best,checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600_000).toISOString(),sourceUrl:ORIGIN+'/basketedit.php',
    basis:'retailer_basket_postcode',destinationScope:'postal_code',postalCode,
    evidenceSha256:createHash('sha256').update(JSON.stringify({observations,destination,postalCode,basket,shipping})).digest('hex')}};
}
