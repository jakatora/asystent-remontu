import { createHash } from 'node:crypto';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { RETAIL_SOURCES } from './retail-catalog';
import { parseRetailPage } from './retail-pages';
import { AnonymousShop } from './retailer-http';
import { cleanHtml, htmlElements as nodes, htmlAttributes, htmlText as text } from './retail-microdata';

const cls = (a: Record<string,string>, name: string) => a.class?.split(/\s+/).includes(name) ?? false;
const attr = (html: string) => htmlAttributes(html.match(/^<[^>]+>/)?.[0] ?? '');
const one = (values: string[]) => { if (values.length !== 1) throw Error('basket_not_confirmed'); return values[0]; };
export type CheckoutPageReader=(url:string,price:number,client:AnonymousShop)=>Promise<string>;
/** Share only public product HTML, not cart sessions. The cart still confirms
 * every current quantity and gross price. A price change uses a new key. */
export function createCheckoutPageReader():CheckoutPageReader {
  const cache=new Map<string,{until:number;value:Promise<string>}>();
  return (url,price,client)=>{
    const key=JSON.stringify([url,price]), previous=cache.get(key);
    if(previous&&previous.until>Date.now())return previous.value;
    if(cache.size>=32)cache.delete(cache.keys().next().value!);
    const value=client.text(url);cache.set(key,{until:Date.now()+60_000,value});
    void value.catch(()=>{if(cache.get(key)?.value===value)cache.delete(key);});return value;
  };
}
const withoutOld = (html: string) => html.replace(/<del\b[^>]*>[\s\S]*?<\/del>/gi, '').replace(/<div\b[^>]*class=["']price-old["'][^>]*>[\s\S]*?<\/div>/gi, '');
export function checkoutMoney(value: string): number {
  const match = text(value).replace(/[\s\u00a0]/g,'').match(/^(\d+)(?:,(\d{2}))?zł$/);
  if (!match) throw Error('invalid_money');
  const result = Number(match[1]) * 100 + Number(match[2] ?? 0);
  if (!Number.isSafeInteger(result) || result < 0) throw Error('invalid_money');
  return result;
}
function quote(order: DeliveredStoreBasket, costGrosze: number, carrier: string, payment: string, evidence: unknown, postalCode?: string): DeliveryQuoteResult {
  const now = new Date();
  return { quote: { costGrosze, carrier, payment, checkedAt:now.toISOString(), expiresAt:new Date(now.getTime()+600_000).toISOString(),
    sourceUrl: order.store === 'Sewera' ? 'https://sklep.sewera.pl/zamowienie' : 'https://buduj24.pl/cart',
    basis:postalCode ? 'retailer_basket_postcode' : 'retailer_basket_national', destinationScope:postalCode ? 'postal_code' : 'PL',
    ...(postalCode ? { postalCode, dispatchFrom:'Katowice' } : {}),
    evidenceSha256:createHash('sha256').update(JSON.stringify(evidence)).digest('hex') } };
}
function expectedPacks(order: DeliveredStoreBasket) {
  return order.lines.flatMap(line => line.packages.map(pack => {
    const source = RETAIL_SOURCES.find(s=>s.id===pack.offerId && s.store===order.store);
    if (!source || !Number.isSafeInteger(pack.count) || pack.count < 1 || pack.count > 60) throw Error('invalid_basket');
    return { source, pack };
  }));
}
function tdValue(html: string, label: string): string {
  const cells=nodes(html,(_,tag)=>tag==='td');
  const values=cells.flatMap((cell,i)=>text(cell)===label && cells[i+1] ? [withoutOld(cells[i+1])] : []);
  return one(values);
}

export function confirmSeweraBasket(html: string, expected: { url:string; pid:string; count:number; price:number }[], total: number) {
  const table=one(nodes(cleanHtml(html),a=>cls(a,'basket-product')));
  const body=one(nodes(table,(_,tag)=>tag==='tbody'));
  const rows=nodes(body,(_,tag)=>tag==='tr').filter(row=>nodes(row,a=>a.name==='amount').length===1);
  if (rows.length!==expected.length || !/Twój sklep to Katowice/.test(text(html))) throw Error('basket_not_confirmed');
  for (const wanted of expected) {
    const row=one(rows.filter(row=>nodes(row,a=>a.href===wanted.url).length>0));
    const stock = text(row).match(/W magazynie znajdują się jedynie (\d+(?:[.,]\d+)?)\s+SZT/i);
    if (stock && Number(stock[1].replace(',','.')) < wanted.count) throw Error('insufficient_stock');
    const input=attr(one(nodes(row,a=>a.name==='amount')));
    const pid=attr(one(nodes(row,a=>a.wybierz!==undefined))).wybierz;
    if (Number(input.value)!==wanted.count || pid!==wanted.pid || checkoutMoney(tdValue(row,'Cena brutto:'))!==wanted.price || checkoutMoney(tdValue(row,'Wartość:'))!==wanted.count*wanted.price) throw Error('basket_not_confirmed');
  }
  const sum=text(one(nodes(table,a=>cls(a,'basket_sum')))).replace(/^Razem do zapłaty:\s*/, '');
  if (checkoutMoney(sum)!==total) throw Error('basket_not_confirmed');
}

/** The store returns zero alongside block_order=1 when a carrier cannot serve
 * this basket. It is an unavailable quote, never free shipping. */
export function readSeweraPayment(html: string): { costGrosze:number; payment:string } | null {
  const safe=cleanHtml(html);
  if (nodes(safe,a=>a.id==='block_order' && a.value!=='0').length || /nie potrafił ustalić kosztu|wycena indywidualna/i.test(text(safe))) return null;
  const options=nodes(safe,a=>cls(a,'radio')).flatMap(row=>{
    const inputs=nodes(row,a=>a.name==='platnosc' && ['Płatność online','Przelew tradycyjny'].includes(a['data-name']));
    if (inputs.length!==1 || /\sdisabled(?:\s|=|>)/i.test(inputs[0])) return [];
    const a=attr(inputs[0]);
    const value=a.onclick?.match(/\('#koszt_dostawy'\)\.val\('([\d,]+)'\)/)?.[1];
    const visible=one(nodes(row,b=>cls(b,'dictionary-icon-additional')));
    const cost=checkoutMoney(visible);
    if (!value || checkoutMoney(`${value} zł`)!==cost) throw Error('invalid_money');
    return [{ costGrosze:cost, payment:a['data-name'] }];
  });
  return options.sort((a,b)=>a.costGrosze-b.costGrosze)[0] ?? null;
}

// Public calculator used by the retailer's checkout; no customer/order form is
// submitted. Only country and the user's postcode accompany this basket quote.
// source: https://sklep.sewera.pl/js/zamowienie.js?v=20260716
export async function quoteSewera(order: DeliveredStoreBasket, postalCode: string, fetchImpl: typeof fetch, pages:CheckoutPageReader=(_url,_price,client)=>client.text(_url)): Promise<DeliveryQuoteResult> {
  const client=new AnonymousShop('https://sklep.sewera.pl',fetchImpl,AbortSignal.timeout(20_000));
  if ((await client.text('/ajax/ax_execute.php?operation=setDepartment',{model:'department',department:'1'})).trim()!=='1') throw Error('basket_not_confirmed');
  const expected: {url:string;pid:string;count:number;price:number}[]=[];
  for (const {source,pack} of expectedPacks(order)) {
    const page=await pages(source.url,pack.unitPriceGrosze,client);
    const observed=parseRetailPage(page,source,new Date());
    if (observed.priceGrosze!==pack.unitPriceGrosze) throw Error('price_changed');
    const pid=attr(one(nodes(cleanHtml(page),a=>a.name==='add_to_basket_pid'))).value;
    if (!/^\d+$/.test(pid)) throw Error('basket_not_confirmed');
    await client.text('/ajax/ax_execute.php?operation=addToBasket',{pid,count:String(pack.count)});
    expected.push({url:source.url,pid,count:pack.count,price:pack.unitPriceGrosze});
  }
  const basket=await client.text('/index.php?page=koszyk');
  confirmSeweraBasket(basket,expected,order.materialsGrosze);
  const checkout=cleanHtml(await client.text('/zamowienie'));
  const country=one(nodes(checkout,a=>a.id==='selectCountryUser'));
  if (!nodes(country,a=>a.value==='1').some(n=>text(n)==='Polska')) throw Error('country_not_confirmed');
  const methods=nodes(checkout,a=>a.name==='dostawa' && a['data-personal-collection']==='0' && /kurier/i.test(a['data-name']??'') && !/indywidual|zapytani|odbiór|paczkomat/i.test(a['data-name'])).map(attr);
  if (!methods.length || methods.length>5) throw Error('no_home_delivery');
  const options: {costGrosze:number;payment:string;carrier:string;hash:string}[]=[];
  for (const method of methods) {
    const response=await client.text('/ajax/ax_default.php?operation=get_order_delivery_cost',{
      model:'deliveryPayment',mode:'radio',typ_of_pay:method.value,offer_id:'',post_code:postalCode,country:'1',street:'',city:'',personal_collection:'0',
    });
    const price=readSeweraPayment(response);
    if (price) options.push({...price,carrier:method['data-name'],hash:createHash('sha256').update(response).digest('hex')});
  }
  const best=options.sort((a,b)=>a.costGrosze-b.costGrosze)[0];
  if (!best) throw Error('no_home_delivery');
  return quote(order,best.costGrosze,best.carrier,best.payment,{expected,postalCode,options},postalCode);
}

function budujItemPrice(row: string) {
  return nodes(row,a=>cls(a,'item')&&cls(a,'price')).map(p=>checkoutMoney(withoutOld(p)));
}
export function confirmBudujBasket(html: string, expected: {url:string;count:number;price:number}[], total:number) {
  const products=one(nodes(cleanHtml(html),a=>a.id==='cart-products'));
  const rows=nodes(products,a=>cls(a,'cart-product')&&!cls(a,'headers')&&!cls(a,'summary'));
  if (rows.length!==expected.length) throw Error('basket_not_confirmed');
  for (const wanted of expected) {
    const row=one(rows.filter(r=>nodes(r,a=>Boolean(a.href) && new URL(a.href,'https://buduj24.pl').href===wanted.url).length>0));
    const qty=attr(one(nodes(row,a=>a.name==='count'))).value;
    const prices=budujItemPrice(row);
    if (Number(qty)!==wanted.count || prices.length!==2 || prices[0]!==wanted.price || prices[1]!==wanted.count*wanted.price) throw Error('basket_not_confirmed');
  }
  if (budujSummary(html).materials!==total) throw Error('basket_not_confirmed');
}
function budujSummary(html:string) {
  const scope=one(nodes(cleanHtml(html),a=>a.id==='cart-summary'));
  const fields=nodes(scope,a=>cls(a,'label'));
  const values=nodes(scope,a=>cls(a,'value'));
  if (fields.length!==3 || values.length!==3 || text(fields[0])!=='Suma koszyka:' || text(fields[1])!=='Koszt dostawy:' || !/Kwota zawiera podatek VAT/.test(text(scope))) throw Error('basket_not_confirmed');
  const [materials,shipping,total]=values.map(checkoutMoney);
  if (materials+shipping!==total) throw Error('basket_not_confirmed');
  return {materials,shipping,total};
}
function budujOptions(html:string, kind:'delivery'|'payment') {
  return nodes(cleanHtml(html),a=>cls(a,'item')&&cls(a,kind)).map(row=>{
    const name=text(one(nodes(row,a=>cls(a,'name'))));
    const click=attr(one(nodes(row,a=>cls(a,'icnt')))).onclick;
    const id=click?.match(new RegExp(`cart\\.${kind}_select\\((\\d+)`))?.[1];
    if (!id) throw Error('basket_not_confirmed');
    return {id,name,active:cls(attr(row),'active'),...(kind==='delivery'?{cost:checkoutMoney(one(nodes(row,a=>cls(a,'price'))))}: {})};
  });
}
/** Decode only the two literal HTML fragments in the retailer response.
 * JavaScript, tracking snippets and all other response code are never run. */
export function decodeBudujDetails(response: string): string {
  const parts=[...response.matchAll(/\$\('#(cart-details|cart-summary)'\)\.replaceWith\(decodeURIComponent\('([^']*)'\)\);/g)];
  if (parts.length!==2 || new Set(parts.map(p=>p[1])).size!==2) throw Error('basket_not_confirmed');
  return parts.map(p=>decodeURIComponent(p[2])).join('\n');
}

// source: https://buduj24.pl/js/cart.js
export async function quoteBuduj24(order:DeliveredStoreBasket,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult> {
  const client=new AnonymousShop('https://buduj24.pl',fetchImpl,AbortSignal.timeout(12_000));
  const expected:{url:string;count:number;price:number}[]=[];
  for (const {source,pack} of expectedPacks(order)) {
    const page=await client.text(source.url), observed=parseRetailPage(page,source,new Date());
    if (observed.priceGrosze!==pack.unitPriceGrosze) throw Error('price_changed');
    const id=source.url.match(/\/produkt\/(\d+),/)?.[1]; if (!id) throw Error('invalid_basket');
    await client.text(`/ajax/cart/add?lang=pl&add=${id}&count=${pack.count}`);
    expected.push({url:source.url,count:pack.count,price:pack.unitPriceGrosze});
  }
  const basket=await client.text('/cart'); confirmBudujBasket(basket,expected,order.materialsGrosze);
  const countries=one(nodes(cleanHtml(basket),a=>a.id==='sel_country'));
  if (!nodes(countries,a=>a.value==='PL').some(n=>text(n)==='Polska')) throw Error('country_not_confirmed');
  const country=decodeBudujDetails(await client.text('/ajax/cart/details?lang=pl&country=PL'));
  const delivery=budujOptions(country,'delivery').filter(d=>/^Kurier\b/i.test(d.name)&&!/pobran|zapytani|indywidual/i.test(d.name)).sort((a,b)=>a.cost!-b.cost!)[0];
  if (!delivery) throw Error('no_home_delivery');
  const selected=decodeBudujDetails(await client.text(`/ajax/cart/details?lang=pl&delivery=${delivery.id}`));
  const payment=budujOptions(selected,'payment').find(p=>/^(Przelewy24|Blik|Przelew bankowy)$/.test(p.name));
  if (!payment) throw Error('no_home_delivery');
  const confirmed=decodeBudujDetails(await client.text(`/ajax/cart/details?lang=pl&payment=${payment.id}`));
  const active=budujOptions(confirmed,'delivery').find(d=>d.active&&d.id===delivery.id);
  const activePayment=budujOptions(confirmed,'payment').find(p=>p.active&&p.id===payment.id);
  const sum=budujSummary(confirmed);
  if (!active || !activePayment || sum.materials!==order.materialsGrosze || sum.shipping!==active.cost) throw Error('basket_not_confirmed');
  return quote(order,sum.shipping,active.name,activePayment.name,{expected,sum,delivery:active,payment:activePayment});
}
