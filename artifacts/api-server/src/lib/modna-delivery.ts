import { createHash } from 'node:crypto';
import type { DeliveredStoreBasket } from '../../../../lib/pricing-service/src/delivery';
import { RETAIL_SOURCES } from './retail-catalog';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';
import { cleanHtml, htmlElements as elements, htmlText as text } from './retail-microdata';
import { MODNA_ORIGIN, modnaAttrs as attrs, modnaById as byId, modnaMoney as money, modnaOne as one, readModnaProduct } from './modna-product';

interface ExpectedTile { id:number; name:string; url:string; size:number; count:number; price:number; }

/** Validate every physical pack and the cart's actual freight amount. Read the
 * available bank-transfer method without submitting any customer/order form.
 * source: https://modnalazienka.pl/cart/
 * source: https://modnalazienka.pl/page/transport
 * source: https://modnalazienka.pl/page/terms
 */
export function confirmModnaCart(html: string, orderHtml: string, expected: readonly ExpectedTile[], materials: number) {
  const safe = cleanHtml(html), cart = byId(safe,'cart_summary_block');
  if (text(byId(cart,'currency')) !== 'PLN') throw Error('retailer_currency_not_confirmed');
  const links = elements(cart,(a,t)=>t==='a' && /^product_name_\d+$/.test(a.id ?? ''));
  if (links.length !== expected.length) throw Error('basket_not_confirmed');
  const rows = elements(cart,a=>a.class?.split(/\s+/).includes('tr') === true).filter(row=>elements(row,a=>/^product_name_\d+$/.test(a.id ?? '')).length > 0);
  if (rows.length !== expected.length) throw Error('basket_not_confirmed');
  const remaining = new Map(expected.map(row=>[row.id,row])); let sum = 0;
  for (const row of rows) {
    const link = one(elements(row,(a,t)=>t==='a' && /^product_name_\d+$/.test(a.id ?? '')),'basket_not_confirmed');
    const id = Number(attrs(link).id.slice('product_name_'.length)), wanted = remaining.get(id);
    if (!wanted || text(link) !== wanted.name || attrs(link).href !== wanted.url) throw Error('basket_not_confirmed');
    const input = (name: string) => attrs(one(elements(row,(a,t)=>t==='input' && a.name===name),'basket_not_confirmed'));
    const packs = input(id+'_pack'), meters = input(id+'_meters');
    const quantity = wanted.count * Math.round(wanted.size*100);
    if (Number(packs.value) !== wanted.count || packs.step !== '1' || Number(packs.minimum) !== 1 || Math.round(Number(meters.value)*100) !== quantity || Number(meters.unit) !== wanted.size || Number(meters.step) !== wanted.size || Math.round(Number(input(id+'_quantity').value)*100) !== quantity || Number(input(id+'_unit').value) !== wanted.size || Number(input(id+'_minimum').value) !== 1) throw Error('basket_not_confirmed');
    if (money(text(byId(row,'product_price_'+id,'span'))) !== wanted.price) throw Error('price_changed');
    const lineTotal = money(text(one(elements(row,(_a,t)=>t==='h5'),'basket_not_confirmed')));
    if (lineTotal !== wanted.price*wanted.count) throw Error('basket_not_confirmed');
    const stocks = [...text(row).matchAll(/Stan magazynowy: (\d+) paczek/g)];
    if (!stocks.length || stocks.some(match=>Number(match[1]) < wanted.count)) throw Error('insufficient_stock');
    if (wanted.count > 1) {
      const sameSeries = byId(row,'single_set_'+id,'input');
      if (!/\bchecked(?:\s|=|>)/.test(sameSeries.match(/^<[^>]+>/)?.[0] ?? '')) throw Error('basket_not_confirmed');
    }
    remaining.delete(id); sum += lineTotal;
  }
  if (remaining.size || sum !== materials) throw Error('basket_not_confirmed');
  const summary = text(byId(safe,'order_summary','span'));
  const match = summary.match(/^Do zapłaty ([\d ,]+ zł) \+ dostawa: Kurier ([\d ,]+ zł) (\d+) x paleta Dostawa i płatność$/);
  if (!match || money(match[1]) !== materials || Number(match[3]) < 1) throw Error('basket_not_confirmed');
  const costGrosze = money(match[2]);
  const form = byId(cleanHtml(orderHtml),'order_summary','form');
  const country = byId(form,'country','select'), countries = elements(country,(_a,t)=>t==='option');
  if (countries.length !== 1 || attrs(countries[0]).value !== 'PL' || text(countries[0]) !== 'Polska') throw Error('country_not_confirmed');
  const transport = byId(form,'transport_1','label'), transportAttrs = attrs(transport);
  const allowed = JSON.parse((transportAttrs['data-allowed_country'] ?? '').replace(/&#34;/g,'"'));
  const forbidden = JSON.parse((transportAttrs['data-forbidden_country'] ?? '').replace(/&#34;/g,'"'));
  if (transportAttrs['data-module_name'] !== 'courier' || !Array.isArray(allowed) || !allowed.includes('PL') || !(forbidden === '' || Array.isArray(forbidden) && !forbidden.includes('PL')) || text(transport) !== `Kurier + ${match[2].replace(/ zł$/,'')} zł (${match[3]} x paleta)`) throw Error('no_home_delivery');
  const radio = byId(transport,'delivery_method_1','input');
  if (attrs(radio).name !== 'physical_delivery_method' || attrs(radio).value !== '1' || /\bdisabled\b/.test(radio)) throw Error('no_home_delivery');
  const payment = one(elements(form,(_a,t)=>t==='label').filter(node=>elements(node,a=>a.id==='payment_method_2').length===1),'no_prepayment');
  const paymentInput = byId(payment,'payment_method_2','input');
  if (text(payment) !== 'Przelew bankowy' || attrs(paymentInput).name !== 'payment_method' || attrs(paymentInput).value !== '2' || /\bdisabled\b/.test(paymentInput)) throw Error('no_prepayment');
  return {costGrosze,carrier:`Kurier (${match[3]} × paleta)`,payment:'Przelew bankowy'};
}

export async function quoteModna(order: DeliveredStoreBasket, fetchImpl: typeof fetch) {
  if (order.store !== 'Modna Łazienka') throw Error('invalid_basket');
  const client = new AnonymousShop(MODNA_ORIGIN,fetchImpl,AbortSignal.timeout(12000),retailerRequestBudget(order.lines.length));
  const expected: ExpectedTile[] = [];
  for (const line of order.lines) for (const pack of line.packages) {
    const source = RETAIL_SOURCES.find(s=>s.id===pack.offerId && s.store===order.store && s.format==='modna');
    if (!source || !Number.isSafeInteger(pack.count) || pack.count < 1 || pack.count > MAX_RETAIL_PACKAGES || expected.some(row=>row.id===source.productId) || source.packageSize !== pack.packageSize || source.unit !== line.unit) throw Error('invalid_basket');
    const product = readModnaProduct(await client.text(new URL(source.url).pathname),source);
    if (product.priceGrosze !== pack.unitPriceGrosze) throw Error('price_changed');
    if (pack.count > product.maxPackages) throw Error('insufficient_stock');
    const quantity = pack.count*Math.round(source.packageSize*100);
    await client.modnaCart(source.productId!, (quantity/100).toFixed(2),product.token);
    expected.push({id:source.productId!,name:product.name,url:source.url,size:source.packageSize,count:pack.count,price:product.priceGrosze});
  }
  if (!expected.length) throw Error('invalid_basket');
  const confirmed = confirmModnaCart(await client.text('/cart/'),await client.text('/order/'),expected,order.materialsGrosze);
  const checkedAt = new Date();
  return {quote:{...confirmed,checkedAt:checkedAt.toISOString(),expiresAt:new Date(checkedAt.getTime()+600000).toISOString(),sourceUrl:MODNA_ORIGIN+'/cart/',destinationScope:'PL' as const,basis:'retailer_basket_national' as const,evidenceSha256:createHash('sha256').update(JSON.stringify({products:expected,materials:order.materialsGrosze,...confirmed,country:'PL'})).digest('hex')}};
}
