import { createHash } from 'node:crypto';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { RETAIL_SOURCES } from './retail-catalog';
import { parseRetailPage } from './retail-pages';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';
import { cleanHtml, htmlElements as nodes, htmlAttributes, htmlText as text } from './retail-microdata';
import { QuoteQueue } from './quote-queue';
import { isReviewedSeweraDispatchSource } from './retail-sku';

const cls = (a: Record<string,string>, name: string) => a.class?.split(/\s+/).includes(name) ?? false;
const attr = (html: string) => htmlAttributes(html.match(/^<[^>]+>/)?.[0] ?? '');
const one = (values: string[]) => { if (values.length !== 1) throw Error('basket_not_confirmed'); return values[0]; };
export type CheckoutPageReader=(url:string,price:number,client:AnonymousShop,scope?:string)=>Promise<string>;
/** Share only public product HTML, not cart sessions. The cart still confirms
 * every current quantity and gross price. A price change uses a new key. */
export function createCheckoutPageReader():CheckoutPageReader {
  const cache=new Map<string,{until:number;value:Promise<string>}>();
  const reads=new QuoteQueue(3,12,15_000);
  return (url,price,client,scope)=>{
    const key=JSON.stringify([url,price,scope??'']), previous=cache.get(key);
    if(previous&&previous.until>Date.now())return previous.value;
    if(cache.size>=32)cache.delete(cache.keys().next().value!);
    const value=(async()=>{const release=await reads.acquire();if(!release)throw Error('quote_busy');try{return await client.text(url);}finally{release();}})();
    cache.set(key,{until:Date.now()+60_000,value});
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
function quote(order: DeliveredStoreBasket, costGrosze: number, carrier: string, payment: string, evidence: unknown, postalCode?: string, dispatchFrom='Katowice'): DeliveryQuoteResult {
  const now = new Date();
  return { quote: { costGrosze, carrier, payment, checkedAt:now.toISOString(), expiresAt:new Date(now.getTime()+600_000).toISOString(),
    sourceUrl: order.store === 'Sewera' ? 'https://sklep.sewera.pl/zamowienie' : 'https://buduj24.pl/cart',
    basis:postalCode ? 'retailer_basket_postcode' : 'retailer_basket_national', destinationScope:postalCode ? 'postal_code' : 'PL',
    ...(postalCode ? { postalCode, dispatchFrom } : {}),
    evidenceSha256:createHash('sha256').update(JSON.stringify(evidence)).digest('hex') } };
}
function expectedPacks(order: DeliveredStoreBasket) {
  return order.lines.flatMap(line => line.packages.map(pack => {
    const source = RETAIL_SOURCES.find(s=>s.id===pack.offerId && s.store===order.store);
    if (!source || !Number.isSafeInteger(pack.count) || pack.count < 1 || pack.count > MAX_RETAIL_PACKAGES || !Number.isSafeInteger(pack.unitPriceGrosze*pack.count)) throw Error('invalid_basket');
    return { source, pack };
  }));
}
function tdValue(html: string, label: string): string {
  const cells=nodes(html,(_,tag)=>tag==='td');
  const values=cells.flatMap((cell,i)=>text(cell)===label && cells[i+1] ? [withoutOld(cells[i+1])] : []);
  return one(values);
}

export function confirmSeweraBasket(html: string, expected: { url:string; pid:string; count:number; price:number; retailUnit?: 'SZT' | 'OPA' }[], total: number, dispatchFrom='Katowice') {
  const table=one(nodes(cleanHtml(html),a=>cls(a,'basket-product')));
  const body=one(nodes(table,(_,tag)=>tag==='tbody'));
  const rows=nodes(body,(_,tag)=>tag==='tr').filter(row=>nodes(row,a=>a.name==='amount').length===1);
  const branch=dispatchFrom.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  if (rows.length!==expected.length || !new RegExp(`Twój sklep to ${branch}(?=\\s|$)`).test(text(html))) throw Error('basket_not_confirmed');
  const shortages: {url:string; count:number; price:number; maxPackages:number}[]=[];
  for (const wanted of expected) {
    const row=one(rows.filter(row=>nodes(row,a=>a.href===wanted.url).length>0));
    const stock = text(row).match(/W magazynie znajdują się jedynie (\d+(?:[.,]\d+)?)\s+(SZT|OPA)/i);
    const input=attr(one(nodes(row,a=>a.name==='amount')));
    const pid=attr(one(nodes(row,a=>a.wybierz!==undefined))).wybierz;
    if (Number(input.value)!==wanted.count || pid!==wanted.pid || checkoutMoney(tdValue(row,'Cena brutto:'))!==wanted.price || checkoutMoney(tdValue(row,'Wartość:'))!==wanted.count*wanted.price) throw Error('basket_not_confirmed');
    if (stock) {
      const maxPackages=Number(stock[1].replace(',','.'));
      if (stock[2].toUpperCase()!==(wanted.retailUnit??'SZT') || !Number.isSafeInteger(maxPackages) || maxPackages<0) throw Error('basket_not_confirmed');
      if (maxPackages<wanted.count) shortages.push({url:wanted.url,count:wanted.count,price:wanted.price,maxPackages});
    }
  }
  const sum=text(one(nodes(table,a=>cls(a,'basket_sum')))).replace(/^Razem do zapłaty:\s*/, '');
  if (checkoutMoney(sum)!==total) throw Error('basket_not_confirmed');
  if (shortages.length) throw new SeweraStockError(shortages);
}

class SeweraStockError extends Error {
  constructor(readonly shortages: {url:string;count:number;price:number;maxPackages:number}[]) { super('insufficient_stock'); }
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

/** Heavy materials use the retailer's named pallet carriers. They still need
 * a fresh postcode price from the same verified cart, just like parcel couriers.
 * source: https://sklep.sewera.pl/zamowienie */
export function seweraHomeDeliveryMethods(checkout:string) {
  return nodes(cleanHtml(checkout),a=>{
    const name=a['data-name']??'';
    return a.name==='dostawa' && a['data-personal-collection']==='0' && a.disabled===undefined
      && (/kurier/i.test(name)||/^(DHL|Raben) - Paleta do \d+\s*kg$/i.test(name))
      && !/indywidual|zapytani|odbiór|paczkomat/i.test(name);
  }).filter(node=>!/\sdisabled(?:\s|=|>)/i.test(node.match(/^<[^>]+>/)?.[0]??'')).map(attr);
}

// Public calculator used by the retailer's checkout; no customer/order form is
// submitted. Only country and the user's postcode accompany this basket quote.
// source: https://sklep.sewera.pl/js/zamowienie.js?v=20260716
export async function quoteSewera(order: DeliveredStoreBasket, postalCode: string, fetchImpl: typeof fetch, pages:CheckoutPageReader=(_url,_price,client)=>client.text(_url)): Promise<DeliveryQuoteResult> {
  const packs=expectedPacks(order);
  const configured=packs.filter(({source})=>source.dispatchDepartment);
  if(configured.some(({source})=>!isReviewedSeweraDispatchSource(source)))throw Error('dispatch_department_not_confirmed');
  const department=configured[0]?.source.dispatchDepartment??{id:'1',name:'Katowice'};
  if(configured.some(({source})=>source.dispatchDepartment!.id!==department.id||source.dispatchDepartment!.name!==department.name)){
    if(order.lines.length>=2&&order.lines.every(line=>line.packages.length===1)){
      const groups=new Map<string,{dispatchFrom:string;offerIds:string[]}>();
      for(const {source} of configured){
        const branch=source.dispatchDepartment!;
        const group=groups.get(branch.id)??{dispatchFrom:branch.name,offerIds:[]};
        if(group.dispatchFrom!==branch.name)throw Error('dispatch_department_not_confirmed');
        group.offerIds.push(source.id);groups.set(branch.id,group);
      }
      const flexible=packs.filter(({source})=>!source.dispatchDepartment).map(({source})=>source.id);
      // Unassigned offers use Katowice when quoted alone. They may also join
      // a configured branch, whose native card and cart must confirm stock.
      if(flexible.length&&!groups.has('1'))groups.set('1',{dispatchFrom:'Katowice',offerIds:[]});
      return {reason:'requires_separate_dispatch',dispatchGroups:[...groups.values()],...(flexible.length?{flexibleDispatchOfferIds:flexible}:{})};
    }
    throw Error('dispatch_department_not_confirmed');
  }
  // Each item needs an anonymous cart mutation, and the home-delivery methods
  // are checked in sequence in the same session. Large baskets need a longer
  // bounded window to finish those native checks before claiming a price.
  const timeoutMs=Math.min(45_000,20_000+Math.max(0,packs.length-8)*10_000);
  const client=new AnonymousShop('https://sklep.sewera.pl',fetchImpl,AbortSignal.timeout(timeoutMs),retailerRequestBudget(order.lines.reduce((n,line)=>n+line.packages.length,0)));
  if ((await client.text('/ajax/ax_execute.php?operation=setDepartment',{model:'department',department:department.id})).trim()!==department.id) throw Error('basket_not_confirmed');
  const expected: {url:string;pid:string;count:number;price:number;retailUnit?:'SZT'|'OPA'}[]=[];
  const prepared: {source:typeof packs[number]['source'];pack:typeof packs[number]['pack'];pid:string}[]=[];
  let next=0,hasFailure=false;let failure:unknown;
  // Read immutable public cards concurrently; cart mutations below remain
  // sequential. The shared page reader bounds requests across all quotes.
  await Promise.all(Array.from({length:Math.min(3,packs.length)},async()=>{while(next<packs.length&&!hasFailure){
    try {
    const index=next++,{source,pack}=packs[index];
    const page=await pages(source.url,pack.unitPriceGrosze,client,`sewera:${department.id}`),observed=parseRetailPage(page,source,new Date());
    if(configured.length&&text(one(nodes(cleanHtml(page),a=>cls(a,'b2cCSS-select-dept'))))!==department.name)throw Error('dispatch_department_not_confirmed');
    if(observed.priceGrosze!==pack.unitPriceGrosze)throw Error('price_changed');
    const pid=attr(one(nodes(cleanHtml(page),a=>a.name==='add_to_basket_pid'))).value;
    if(!/^\d+$/.test(pid))throw Error('basket_not_confirmed');
    prepared[index]={source,pack,pid};
    } catch(error) {if(!hasFailure){hasFailure=true;failure=error;}}
  }}));
  if(hasFailure)throw failure;
  for (const {source,pack,pid} of prepared) {
    await client.text('/ajax/ax_execute.php?operation=addToBasket',{pid,count:String(pack.count)});
    expected.push({url:source.url,pid,count:pack.count,price:pack.unitPriceGrosze,retailUnit:source.retailUnit});
  }
  const basket=await client.text('/index.php?page=koszyk');
  try { confirmSeweraBasket(basket,expected,order.materialsGrosze,department.name); }
  catch (error) {
    if (!(error instanceof SeweraStockError)) throw error;
    const checkedAt=new Date(),evidenceSha256=createHash('sha256').update(basket).digest('hex');
    return {reason:'insufficient_stock',stockLimits:error.shortages.map(shortage=>{
      const {pack}=prepared.find(item=>item.source.url===shortage.url)!;
      const product=order.lines.find(line=>line.packages.some(item=>item.offerId===pack.offerId))!.product;
      return {offerId:pack.offerId,store:order.store,productId:product.id,productName:product.name,maxPackages:shortage.maxPackages,requestedPackages:shortage.count,unitPriceGrosze:shortage.price,
        postalCode,dispatchFrom:department.name,checkedAt:checkedAt.toISOString(),expiresAt:new Date(checkedAt.getTime()+600_000).toISOString(),
        sourceUrl:'https://sklep.sewera.pl/index.php?page=koszyk',evidenceSha256};
    })};
  }
  const checkout=cleanHtml(await client.text('/zamowienie'));
  const country=one(nodes(checkout,a=>a.id==='selectCountryUser'));
  if (!nodes(country,a=>a.value==='1').some(n=>text(n)==='Polska')) throw Error('country_not_confirmed');
  const methods=seweraHomeDeliveryMethods(checkout);
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
  return quote(order,best.costGrosze,best.carrier,best.payment,{expected,postalCode,options,department},postalCode,department.name);
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
  const client=new AnonymousShop('https://buduj24.pl',fetchImpl,AbortSignal.timeout(12_000),retailerRequestBudget(order.lines.reduce((n,line)=>n+line.packages.length,0)));
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
