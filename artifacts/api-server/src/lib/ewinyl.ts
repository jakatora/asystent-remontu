import {createHash} from 'node:crypto';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {cutRollCost,ORION_ROLLS} from '../../../../lib/pricing-service/src/cut-rolls';
import {RETAIL_SOURCES} from './retail-catalog';
import {AnonymousShop} from './retailer-http';
import {cleanHtml,htmlElements,htmlText} from './retail-microdata';
import {EWINYL_ORIGIN,EWINYL_ORION_URL,readEwinylProduct,one,attrs,hasClass,ewinylMoney} from './ewinyl-product';

type ExpectedCut={widthMm:number;lengthMm:number;count:number;cost:number};
const text=(node:string)=>htmlText(node).replace(/&#122;&#322;/g,'zł');
const marked=(node:string,name:string)=>new RegExp('\\s'+name+'(?:\\s|=|>)').test(node.match(/^<[^>]+>/)?.[0]??'');
function money(scope:string){return ewinylMoney(one(htmlElements(scope,a=>hasClass(a,'woocommerce-Price-amount'))));}
const byClass=(html:string,name:string)=>one(htmlElements(html,a=>hasClass(a,name)));
function scaledDecimal(value:string|undefined,digits:number):number {
  const match=value?.match(/^(\d+)(?:\.(\d{1,8}))?$/),fraction=match?.[2]??'';
  if(!match||/[1-9]/.test(fraction.slice(digits)))throw Error('basket_not_confirmed');
  const n=Number(match[1])*10**digits+Number(fraction.slice(0,digits).padEnd(digits,'0'));
  if(!Number.isSafeInteger(n))throw Error('basket_not_confirmed');return n;
}

/** Verify each merchant row's dimensions, area, quantity, price and subtotal.
 * A one-square-metre catalogue price never stands in for a whole cut's price.
 * source: https://ewinyl.pl/koszyk/ */
export function confirmEwinylCart(raw:string,expected:readonly ExpectedCut[]):number {
  const html=cleanHtml(raw),form=byClass(html,'woocommerce-cart-form');
  const rows=htmlElements(form,a=>hasClass(a,'woocommerce-cart-form__cart-item'));
  if(rows.length!==expected.length)throw Error('basket_not_confirmed');
  const remaining=[...expected];let total=0;
  for(const row of rows){
    const name=byClass(row,'product-name'),link=one(htmlElements(name,(_a,t)=>t==='a'));
    if(attrs(link).href!==EWINYL_ORION_URL||text(link)!=='Orion 514-05 Wykładzina winylowy 2m 4m')throw Error('basket_not_confirmed');
    const values=new Map(htmlElements(name,(_a,t)=>t==='li').map(node=>[text(byClass(node,'item-variation-name')),text(byClass(node,'item-variation-value'))]));
    if(values.size!==3)throw Error('basket_not_confirmed');
    const length=scaledDecimal(values.get('Długość (m):'),3),width=scaledDecimal(values.get('Szerokość (m):'),3),area=scaledDecimal(values.get('Suma Powierzchnia (m²):'),6);
    const at=remaining.findIndex(c=>c.widthMm===width&&c.lengthMm===length),wanted=remaining[at];
    if(at<0||area!==width*length)throw Error('basket_not_confirmed');remaining.splice(at,1);
    const quantity=attrs(one(htmlElements(byClass(row,'product-quantity'),(a,t)=>t==='input'&&hasClass(a,'qty'))));
    if(Number(quantity.value)!==wanted.count||quantity.step!=='1'||quantity.min!=='1'||money(byClass(row,'product-price'))!==wanted.cost||money(byClass(row,'product-subtotal'))!==wanted.cost*wanted.count)throw Error('price_changed');
    total+=wanted.cost*wanted.count;
  }
  if(remaining.length||money(byClass(byClass(html,'cart_totals'),'cart-subtotal'))!==total)throw Error('basket_not_confirmed');
  return total;
}
export function confirmEwinylShipping(raw:string,postalCode:string,materials:number):{costGrosze:number;carrier:string}{
  const html=cleanHtml(raw),totals=byClass(html,'cart_totals'),calculator=byClass(totals,'woocommerce-shipping-calculator');
  const postcode=attrs(one(htmlElements(calculator,(a,t)=>t==='input'&&a.name==='calc_shipping_postcode')));
  const country=one(htmlElements(calculator,(a,t)=>t==='select'&&a.name==='calc_shipping_country'));
  const selected=one(htmlElements(country,(_a,t)=>t==='option').filter(n=>marked(n,'selected')));
  if(postcode.value!==postalCode||attrs(selected).value!=='PL'||text(byClass(totals,'woocommerce-shipping-destination')).replace(/\s+\./g,'.')!==`Wysyłka do: ${postalCode}.`)throw Error('no_home_delivery');
  const methods=one(htmlElements(totals,a=>a.id==='shipping_method'));
  const checked=one(htmlElements(methods,(a,t)=>t==='input'&&a.name==='shipping_method[0]').filter(n=>marked(n,'checked')));
  if(attrs(checked).value!=='flat_rate:1')throw Error('no_home_delivery');
  const label=one(htmlElements(methods,(a,t)=>t==='label'&&a.for===attrs(checked).id)),cost=money(label);
  if(!text(label).startsWith('Wysyłka kurierem: ')||cost<0||money(one(htmlElements(byClass(totals,'order-total'),(_a,t)=>t==='strong')))!==materials+cost)throw Error('basket_not_confirmed');
  return{costGrosze:cost,carrier:'Wysyłka kurierem'};
}

export async function quoteEwinyl(order:DeliveredStoreBasket,postalCode:string,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
  if(order.store!=='eWinyl'||!/^\d{2}-\d{3}$/.test(postalCode)||!order.lines.length||order.lines.length>2)throw Error('invalid_basket');
  const client=new AnonymousShop(EWINYL_ORIGIN,fetchImpl,AbortSignal.timeout(20000),220),evidence:string[]=[],expected:ExpectedCut[]=[];
  const page=await client.text(new URL(EWINYL_ORION_URL).pathname);evidence.push(page);
  let materials=0;
  for(const line of order.lines){
    const spec=ORION_ROLLS.find(s=>s.id===line.product.id),source=spec&&RETAIL_SOURCES.find(s=>s.id===`ewinyl-orion514-${spec.widthMm/1000}m`);
    if(!spec||!source||line.unit!=='m2'||line.product.name!==spec.name||!line.packages.length)throw Error('invalid_basket');
    const product=readEwinylProduct(page,source),current=Math.round(Number(product.offers.price)*100);
    for(const pack of line.packages){
      const cut=pack.cutRoll,cost=cut?cutRollCost(cut.widthMm,cut.lengthMm,cut.pricePerM2Grosze):null;
      if(!cut||cut.widthMm!==spec.widthMm||pack.offerId!==source.id||pack.url!==source.url||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>100||pack.packageSize!==cut.widthMm*cut.lengthMm/1_000_000||cost===null||pack.unitPriceGrosze!==cost||pack.lineCostGrosze!==cost*pack.count)throw Error('invalid_basket');
      if(cut.pricePerM2Grosze!==current)throw Error('price_changed');
      const previous=expected.find(c=>c.widthMm===cut.widthMm&&c.lengthMm===cut.lengthMm);
      if(previous)previous.count+=pack.count;else expected.push({widthMm:cut.widthMm,lengthMm:cut.lengthMm,count:pack.count,cost});
      materials+=pack.lineCostGrosze;
    }
  }
  if(materials!==order.materialsGrosze||expected.length>100)throw Error('invalid_basket');
  for(const cut of expected)evidence.push(await client.ewinylAdd(cut.widthMm,cut.lengthMm,cut.count));
  const cart=await client.text('/koszyk/');evidence.push(cart);confirmEwinylCart(cart,expected);
  const form=byClass(cleanHtml(cart),'woocommerce-shipping-calculator'),nonce=attrs(one(htmlElements(form,(a,t)=>t==='input'&&a.name==='woocommerce-shipping-calculator-nonce'))).value;
  const quoted=await client.ewinylShipping(postalCode,nonce);evidence.push(quoted);confirmEwinylCart(quoted,expected);
  const shipping=confirmEwinylShipping(quoted,postalCode,materials);
  // Read-only checkout confirms the selected upfront payment and same payable
  // total. Never submits customer fields, accepts terms or places an order.
  const checkout=await client.text('/zamowienie/');evidence.push(checkout);
  const safe=cleanHtml(checkout),payment=one(htmlElements(safe,(a,t)=>t==='input'&&a.name==='payment_method').filter(n=>marked(n,'checked')));
  if(attrs(payment).value!=='bacs'||text(one(htmlElements(safe,(a,t)=>t==='label'&&a.for===attrs(payment).id)))!=='Przelew bankowy'||money(one(htmlElements(byClass(safe,'order-total'),(_a,t)=>t==='strong')))!==materials+shipping.costGrosze)throw Error('basket_not_confirmed');
  const checkedAt=new Date();
  return{quote:{...shipping,payment:'Przelew bankowy',checkedAt:checkedAt.toISOString(),expiresAt:new Date(checkedAt.getTime()+600000).toISOString(),sourceUrl:EWINYL_ORIGIN+'/koszyk/',destinationScope:'postal_code',postalCode,basis:'retailer_basket_postcode',evidenceSha256:createHash('sha256').update(evidence.join('\n')).digest('hex')}};
}
