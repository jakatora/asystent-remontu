import { createHash } from 'node:crypto';
import { parsePriceToGrosze } from '@workspace/price-collector';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { RETAIL_SOURCES } from './retail-catalog';
import { AnonymousShop } from './retailer-http';
import { confirmShopifyProduct } from './shopify-product';

// source: https://shopify.dev/docs/api/ajax/reference/cart
// source: https://cezar.eu/pages/dostawa-produktow (prices explicitly gross)
// source: https://cezar.eu/pages/sposoby-platnosci (prepaid payment methods)
export async function quoteCezar(order: DeliveredStoreBasket, postalCode: string, fetchImpl: typeof fetch): Promise<DeliveryQuoteResult> {
  const origin = 'https://cezar.eu';
  const client = new AnonymousShop(origin, fetchImpl, AbortSignal.timeout(12_000));
  const expected = new Map<number,{count:number;price:number}>();
  for (const line of order.lines) for (const pack of line.packages) {
    const source = RETAIL_SOURCES.find(s => s.id === pack.offerId && s.store === 'Cezar' && s.format === 'shopify-api');
    if (!source || new URL(source.url).origin !== origin || !Number.isSafeInteger(pack.count) || pack.count < 1 || pack.count > 60) throw Error('invalid_basket');
    const product = confirmShopifyProduct(JSON.parse(await client.text(new URL(source.url).pathname+'.js')), source);
    if (product.priceGrosze !== pack.unitPriceGrosze) throw Error('price_changed');
    if (expected.has(product.variantId)) throw Error('invalid_basket');
    expected.set(product.variantId,{count:pack.count,price:product.priceGrosze});
    await client.text('/cart/add.js',{id:String(product.variantId),quantity:String(pack.count)});
  }
  const cart = JSON.parse(await client.text('/cart.js'));
  if (cart.currency !== 'PLN' || !Array.isArray(cart.items) || cart.items.length !== expected.size) throw Error('basket_not_confirmed');
  let total = 0, count = 0;
  for (const item of cart.items) {
    const wanted = expected.get(item.id);
    if (!wanted || item.quantity !== wanted.count || item.price !== wanted.price || item.final_price !== wanted.price || item.final_line_price !== wanted.count*wanted.price) throw Error('basket_not_confirmed');
    total += wanted.count*wanted.price; count += wanted.count; expected.delete(item.id);
  }
  if (expected.size || cart.item_count !== count || cart.items_subtotal_price !== total || cart.total_price !== total || total !== order.materialsGrosze) throw Error('basket_not_confirmed');
  // Only a postcode and country: no fictitious address/contact/order is submitted.
  const address = new URLSearchParams({'shipping_address[zip]':postalCode,'shipping_address[country]':'Poland'});
  const rates = JSON.parse(await client.text('/cart/shipping_rates.json?'+address));
  const available = (Array.isArray(rates.shipping_rates) ? rates.shipping_rates : []).flatMap((rate: any) => {
    // The shop returns its named "Gratis" home-delivery tariff at 500 PLN.
    // Never derive zero from the banner, a missing rate, or an unnamed method.
    const free = rate.name === 'Gratis' && rate.source === 'shopify' && rate.price === '0.00' && total >= 50_000;
    if (rate.currency !== 'PLN' || typeof rate.name !== 'string' || (!/DPD.*Kurier|Raben/i.test(rate.name) && !free) || /pobran|punkt|automat|zapytani|indywidual/i.test(rate.name)) return [];
    const price = typeof rate.price === 'string' && /^\d+\.\d{2}$/.test(rate.price) ? parsePriceToGrosze(rate.price) : null;
    if (price === null || !Number.isSafeInteger(price) || price < 0) return [];
    return [{costGrosze:price,carrier:rate.name}];
  }).sort((a: {costGrosze:number},b: {costGrosze:number})=>a.costGrosze-b.costGrosze);
  const best = available[0]; if (!best) throw Error('no_home_delivery');
  const checkedAt = new Date();
  return { quote: {...best,payment:'Płatność z góry',checkedAt:checkedAt.toISOString(),expiresAt:new Date(checkedAt.getTime()+600_000).toISOString(),
    sourceUrl:origin+'/cart',basis:'retailer_basket_postcode',destinationScope:'postal_code',postalCode,
    evidenceSha256:createHash('sha256').update(JSON.stringify({postalCode,currency:cart.currency,items:cart.items.map((i:any)=>({id:i.id,count:i.quantity,price:i.final_price})),rates:rates.shipping_rates})).digest('hex') } };
}
