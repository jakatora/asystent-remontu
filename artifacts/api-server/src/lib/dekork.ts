import {createHash} from 'node:crypto';
import type {RetailSource,RetailObservation} from './retail-pages';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {AnonymousShop,MAX_RETAIL_PACKAGES,retailerRequestBudget} from './retailer-http';
import {htmlElements,htmlText} from './retail-microdata';

const ORIGIN='https://dekork.pl';
// One modest request stream per actual transport, shared by catalog refreshes
// and quotes. Public product reads can be reused; personal/cart responses cannot.
const transports=new WeakMap<typeof fetch,typeof fetch>();
function limitedFetch(fetchImpl:typeof fetch):typeof fetch{
 const existing=transports.get(fetchImpl);if(existing)return existing;
 let tail=Promise.resolve(),nextAt=0,cooldownUntil=0;
 const result:typeof fetch=async(input,init)=>{
  if(new URL(String(input)).origin!==ORIGIN)throw Error('invalid_cart_route');
  let unlock!:()=>void;const previous=tail;tail=new Promise<void>(resolve=>{unlock=resolve;});await previous;
  try{
   if(init?.signal?.aborted)throw init.signal.reason;
   if(Date.now()<cooldownUntil)throw Error('retailer_rate_limited');
   const wait=nextAt-Date.now();if(wait>0)await new Promise<void>((resolve,reject)=>{const signal=init?.signal,abort=()=>{clearTimeout(timer);reject(signal?.reason??Error('request_aborted'));},timer=setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve();},wait);signal?.addEventListener('abort',abort,{once:true});});
   if(init?.signal?.aborted)throw init.signal.reason;nextAt=Date.now()+500;
   const response=await fetchImpl(input,init);
   if(response.status===429){const value=response.headers.get('retry-after'),seconds=value&&/^\d+$/.test(value)?Number(value):null,date=value?Date.parse(value):NaN;cooldownUntil=seconds!==null&&Number.isSafeInteger(seconds)?Date.now()+Math.max(1000,seconds*1000):Number.isFinite(date)?Math.max(Date.now()+1000,date):Date.now()+30000;}
   return response;
  }finally{unlock();}
 };transports.set(fetchImpl,result);return result;
}
const publicProducts=new WeakMap<typeof fetch,Map<string,{until:number;value:Promise<{raw:string;html:string;currency:string;observedAt:string}>}>>();
// Reviewed Shopify variants. A multipack contains N sealed 6 m² packs of the
// primary variant; its missing bundle GTIN is never presented as a new GTIN.
// source: https://dekork.pl/collections/pod-lvt-spc
// source: https://www.diy.com/departments/professional-lvt-underlay-1-5mm-6m2-64-58-sqft-20-denser-uk-brand-high-density-vinyl-flooring-base/3067088472737_BQ.prd
// source: https://www.homebase.co.uk/en-uk/corksystem-silverlux-15mm-high-density-lvt-underlay-for-vinyl-spc-click-flooring/p/0865688
// source: https://www.homebase.co.uk/en-uk/corksystem-goldlux-15mm-high-density-lvt-underlay-for-vinyl-spc-click-flooring/p/0865687
const PRODUCTS:readonly {key:string;id:number;handle:string;title:string;ean:string;coverage:number;image:string;variants:readonly {id:number;sku:string|null;barcode:string|null;title:string;packs:number}[]}[] = [
  {
    "key": "professional",
    "id": 15754508697931,
    "handle": "profesjonalny-podklad-lvt-1-5mm-wysoka-gestosc-6m2-do-60m2",
    "title": "Profesjonalny Podkład LVT 1,5 mm Wysoka Gęstość 6 m2 do 60 m2",
    "ean": "3067088472737",
    "coverage": 6,
    "image": "https://cdn.shopify.com/s/files/1/1045/7802/3755/files/Professional_1.5mm_High-Density_LVT_Underlay.png?v=1779712267",
    "variants": [
      {
        "id": 57433631359307,
        "sku": "3067088472737",
        "barcode": "3067088472737",
        "title": "1 Paczka",
        "packs": 1
      },
      {
        "id": 57433631392075,
        "sku": "4007681839604",
        "barcode": null,
        "title": "2 Paczki",
        "packs": 2
      },
      {
        "id": 57433631424843,
        "sku": "4000037769136",
        "barcode": null,
        "title": "3 Paczki",
        "packs": 3
      },
      {
        "id": 57433631457611,
        "sku": "4000527717258",
        "barcode": null,
        "title": "4 Paczki",
        "packs": 4
      },
      {
        "id": 57433631490379,
        "sku": "4006668295969",
        "barcode": null,
        "title": "5 Paczek",
        "packs": 5
      },
      {
        "id": 57433631523147,
        "sku": "4007147029143",
        "barcode": null,
        "title": "6 Paczek",
        "packs": 6
      },
      {
        "id": 57433631555915,
        "sku": "4008633216146",
        "barcode": null,
        "title": "7 Paczek",
        "packs": 7
      },
      {
        "id": 57841959502155,
        "sku": null,
        "barcode": null,
        "title": "8 Paczek",
        "packs": 8
      },
      {
        "id": 57841959534923,
        "sku": null,
        "barcode": null,
        "title": "9 Paczek",
        "packs": 9
      },
      {
        "id": 57841959567691,
        "sku": null,
        "barcode": null,
        "title": "10 Paczek",
        "packs": 10
      }
    ]
  },
  {
    "key": "silverlux",
    "id": 15754506043723,
    "handle": "srebrnylux-podklad-lvt-1-5-mm-ze-srebrna-membrana-wysoka-gestosc-najwyzsza-jakosc",
    "title": "SilverLux Podkład LVT 1,5 mm ze Srebrną Membraną Wysoka Gęstość Najwyższa Jakość",
    "ean": "4000543672678",
    "coverage": 10,
    "image": "https://cdn.shopify.com/s/files/1/1045/7802/3755/files/Silver.png?v=1779712214",
    "variants": [
      {
        "id": 57433623167307,
        "sku": "4000543672678",
        "barcode": "4000543672678",
        "title": "Default Title",
        "packs": 1
      }
    ]
  },
  {
    "key": "goldlux",
    "id": 15754505978187,
    "handle": "goldlux-podklad-lvt-1-5-mm-z-zlota-membrana-wysoka-gestosc-najwyzsza-jakosc",
    "title": "GoldLux Podkład LVT 1,5 mm z Złotą Membraną Wysoka Gęstość Najwyższa Jakość",
    "ean": "4006149126867",
    "coverage": 10,
    "image": "https://cdn.shopify.com/s/files/1/1045/7802/3755/files/GoldLux_1.5mm_LVT_Underlay_with_Gold_Membrane_-_Super_High_Denisty_Best_Quality.png?v=1779712213",
    "variants": [
      {
        "id": 57433623036235,
        "sku": "4006149126867",
        "barcode": "4006149126867",
        "title": "Default Title",
        "packs": 1
      }
    ]
  }
];

export const DEKORK_SOURCES:readonly RetailSource[]=PRODUCTS.flatMap(product=>product.variants.map(variant=>({
 id:`dekork-${product.key}-${variant.packs}pack`,ean:product.ean,name:product.title+(variant.packs>1?` — ${variant.title}`:''),brand:'Dekork',category:'underlay',packageSize:product.coverage*variant.packs,unit:'m2',
 store:'Dekork',format:'shopify-api' as const,productId:product.id,variantId:variant.id,apiProductCode:variant.sku??undefined,variant:['LVT','1,5 mm'],
 // Keep the variant in the purchase link; a bundle must not open a single pack.
 url:`${ORIGIN}/products/${product.handle}?variant=${variant.id}`,imageUrl:product.image,pickupRequiresConfirmation:true,
})));

export function isReviewedDekorkSource(source:RetailSource):boolean{
 const row=DEKORK_SOURCES.find(s=>s.id===source.id);return Boolean(row&&['ean','name','brand','category','packageSize','unit','store','format','productId','variantId','apiProductCode','url','pickupRequiresConfirmation'].every(key=>(source as any)[key]===(row as any)[key])&&!source.pickupUnavailable&&!source.skuIdentity&&!source.marketplaceSeller);
}
export function confirmDekorkProduct(product:any,source:RetailSource):{variantId:number;priceGrosze:number;name:string;imageUrl:string}{
 if(!isReviewedDekorkSource(source))throw Error('product_source_not_reviewed');
 const reviewed=PRODUCTS.find(p=>p.id===source.productId)!,wanted=reviewed.variants.find(v=>v.id===source.variantId)!;
 if(product?.id!==reviewed.id||product.handle!==reviewed.handle||product.title!==reviewed.title||product.vendor!=='Dekork'||product.type!==(reviewed.key==='professional'?'Underlay':'')||!Array.isArray(product.variants))throw Error('product_id_not_confirmed');
 const primary=product.variants.filter((v:any)=>v.id===reviewed.variants[0].id),matches=product.variants.filter((v:any)=>v.id===wanted.id);
 if(primary.length!==1||primary[0].barcode!==reviewed.ean||matches.length!==1)throw Error('product_ean_not_confirmed');
 const v=matches[0];if(product.available!==true||v.available!==true)throw Error('retailer_out_of_stock');
 if(v.sku!==wanted.sku||v.barcode!==wanted.barcode||v.title!==wanted.title||v.requires_shipping!==true||v.taxable!==true||v.quantity_rule?.min!==1||v.quantity_rule?.increment!==1||v.quantity_rule.max!==null)throw Error('retailer_unit_not_confirmed');
 if(!Number.isSafeInteger(v.price)||v.price<=0)throw Error('invalid_money');
 const text=htmlText(String(product.description??'')).replace(/\s+/g,' ');
 if(!/1,5 mm/.test(text)||(reviewed.coverage===6?!/800 mm/.test(text)||!/500 mm/.test(text)||!/15 szt\./.test(text)||!/6[–-]60 m²/.test(text):!/Paczka:\s*10 m²/i.test(text)||!text.toLocaleLowerCase('pl').includes(reviewed.key==='silverlux'?'srebrna folia wilgocioochronna':'złota folia wilgocioochronna')))throw Error('product_package_not_confirmed');
 return{variantId:v.id,priceGrosze:v.price,name:product.title+(wanted.packs>1?` — zestaw ${wanted.packs} paczek (${source.packageSize} m²)`:''),imageUrl:reviewed.image};
}
function confirmGross(html:string){
 const taxes=htmlElements(html,a=>a.class?.split(/\s+/).includes('product__tax')??false).map(htmlText);
 if(!taxes.some(text=>/Podatki są wliczone\./.test(text)))throw Error('retailer_gross_price_not_confirmed');
}
async function nativeProduct(fetchImpl:typeof fetch,source:RetailSource){
 if(!isReviewedDekorkSource(source))throw Error('product_source_not_reviewed');
 let cache=publicProducts.get(fetchImpl);if(!cache){cache=new Map();publicProducts.set(fetchImpl,cache);}const key=new URL(source.url).pathname,now=Date.now();let row=cache.get(key);
 if(!row||row.until<=now){
  const value=(async()=>{const client=new AnonymousShop(ORIGIN,limitedFetch(fetchImpl),AbortSignal.timeout(12000)),raw=await client.text(key+'.js'),html=await client.text(key);confirmGross(html);const cart=JSON.parse(await client.text('/cart.js'));if(cart.currency!=='PLN'||!Array.isArray(cart.items)||cart.items.length!==0)throw Error('retailer_currency_not_confirmed');return{raw,html,currency:cart.currency,observedAt:new Date().toISOString()};})();
  row={until:now+30000,value};cache.set(key,row);const entry=row;void value.catch(()=>{if(cache!.get(key)===entry)cache!.delete(key);});
 }
 const data=await row.value;return{...data,item:confirmDekorkProduct(JSON.parse(data.raw),source)};
}
export async function readDekorkProduct(source:RetailSource,fetchImpl:typeof fetch):Promise<RetailObservation>{
 if(!isReviewedDekorkSource(source))throw Error('product_source_not_reviewed');
 const{raw,html,item,currency,observedAt}=await nativeProduct(fetchImpl,source);
 return{sourceId:source.id,ean:source.ean,name:item.name,imageUrl:item.imageUrl,priceGrosze:item.priceGrosze,currency:'PLN',availability:'in_stock',observedAt,sourceUrl:source.url,evidenceSha256:createHash('sha256').update(JSON.stringify([raw,html,currency])).digest('hex')};
}

// Native Shopify postcode calculator; no contact data, agreement or order.
// source: https://shopify.dev/docs/api/ajax/reference/cart
// source: https://dekork.pl/policies/shipping-policy (address delivery, prepaid)
export async function quoteDekork(order:DeliveredStoreBasket,postalCode:string,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
 if(order.store!=='Dekork'||!/^\d{2}-\d{3}$/.test(postalCode))throw Error('invalid_basket');
 const client=new AnonymousShop(ORIGIN,limitedFetch(fetchImpl),AbortSignal.timeout(12000),retailerRequestBudget(order.lines.reduce((n,line)=>n+line.packages.length,0))),expected=new Map<number,{count:number;price:number;productId:number;sku:string|null}>();
 for(const line of order.lines)for(const pack of line.packages){
  const source=DEKORK_SOURCES.find(s=>s.id===pack.offerId);
  if(!source||line.unit!=='m2'||line.product.id!=='remont-'+source.ean||pack.store!=='Dekork'||pack.url!==source.url||pack.packageSize!==source.packageSize||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>MAX_RETAIL_PACKAGES||!Number.isSafeInteger(pack.count*pack.unitPriceGrosze))throw Error('invalid_basket');
  const{item}=await nativeProduct(fetchImpl,source);if(item.priceGrosze!==pack.unitPriceGrosze)throw Error('price_changed');if(expected.has(item.variantId))throw Error('invalid_basket');
  expected.set(item.variantId,{count:pack.count,price:item.priceGrosze,productId:source.productId!,sku:source.apiProductCode??null});await client.text('/cart/add.js',{id:String(item.variantId),quantity:String(pack.count)});
 }
 if(!expected.size)throw Error('invalid_basket');const cart=JSON.parse(await client.text('/cart.js'));
 if(cart.currency!=='PLN'||!Array.isArray(cart.items)||cart.items.length!==expected.size)throw Error('basket_not_confirmed');let total=0,count=0;
 for(const item of cart.items){const wanted=expected.get(item.id);if(!wanted||item.variant_id!==item.id||item.product_id!==wanted.productId||item.sku!==wanted.sku||item.requires_shipping!==true||item.taxable!==true||item.quantity!==wanted.count||item.price!==wanted.price||item.final_price!==wanted.price||item.final_line_price!==wanted.count*wanted.price)throw Error('basket_not_confirmed');total+=wanted.count*wanted.price;count+=wanted.count;expected.delete(item.id);}
 if(expected.size||cart.item_count!==count||cart.items_subtotal_price!==total||cart.total_price!==total||order.materialsGrosze!==total)throw Error('basket_not_confirmed');
 const address=new URLSearchParams({'shipping_address[zip]':postalCode,'shipping_address[country]':'Poland'}),rates=JSON.parse(await client.text('/cart/shipping_rates.json?'+address));
 // This exact named standard address rate was reviewed in the storefront.
 // An empty, pickup, COD or unexpected tariff cannot become a free quote.
 const available=(Array.isArray(rates.shipping_rates)?rates.shipping_rates:[]).filter((r:any)=>r.name==='Standardowa'&&r.code==='Standardowa'&&r.source==='shopify'&&r.currency==='PLN'&&typeof r.price==='string'&&/^\d+\.\d{2}$/.test(r.price));
 if(available.length!==1)throw Error('no_home_delivery');const rate=available[0],costGrosze=Number(rate.price.replace('.',''));if(!Number.isSafeInteger(costGrosze)||costGrosze<0)throw Error('invalid_money');
 const checkedAt=new Date();return{quote:{costGrosze,carrier:'Dostawa standardowa',payment:'Płatność z góry',checkedAt:checkedAt.toISOString(),expiresAt:new Date(checkedAt.getTime()+600000).toISOString(),sourceUrl:ORIGIN+'/cart',basis:'retailer_basket_postcode',destinationScope:'postal_code',postalCode,evidenceSha256:createHash('sha256').update(JSON.stringify({postalCode,items:cart.items.map((i:any)=>({id:i.id,count:i.quantity,price:i.final_price})),rates:rates.shipping_rates})).digest('hex')}};
}
