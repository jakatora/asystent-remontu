import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import {parseRetailPage,type RetailObservation,type RetailSource} from './retail-pages';
import type {BrowserProductSnapshot} from './castorama-browser-observation';

// Exact reviewed retail identities. Different manufacturer generations with
// similar names (CW/UD Super/C2/C3) must retain their own EANs.
// source: https://www.leroymerlin.pl/produkty/tasma-papierowa-50mm-75-mb-norgips-43912694.html
const PRODUCTS:Readonly<Record<string,{sku:string;ean:string;unit:string;size:number;facts:Record<string,string>}>>={
 'leroy-norgips-paper-50x75':{sku:'43912694',ean:'5907651699933',unit:'m',size:75,facts:{'Długość (w m)':'75','Szerokość (w mm)':'50','Materiał główny w całkowitej masie produktu':'Papier','Rodzaj opakowania':'Szpula'}},
 'leroy-norgips-acoustic-50x30':{sku:'43912722',ean:'5907651698004',unit:'m',size:30,facts:{'Długość (w m)':'30','Szerokość (w mm)':'50','Rodzaj opakowania':'Szpula'}},
 'leroy-norgips-acoustic-30x30':{sku:'44420222',ean:'5907651698851',unit:'m',size:30,facts:{'Długość (w m)':'30','Szerokość (w mm)':'30','Rodzaj opakowania':'Szpula'}},
 'leroy-norgips-cw50-06-3m':{sku:'44604350',ean:'5907651698912',unit:'mb',size:3,facts:{'Długość (w m)':'3','Szerokość (w mm)':'50','Grubość (w mm)':'0.6 ± 0.05'}},
 'leroy-norgips-uw50-06-3m':{sku:'45191853',ean:'5907651698547',unit:'mb',size:3,facts:{'Długość (w m)':'3','Szerokość (w mm)':'50','Grubość (w mm)':'0.6 ± 0.05'}},
 'leroy-norgips-ud30-06-3m':{sku:'44604343',ean:'5907651698905',unit:'mb',size:3,facts:{'Długość (w m)':'3','Szerokość (w mm)':'30','Grubość (w mm)':'0.6 ± 0.05'}},
 // Distinct SUPER C3 barcode confirmed by the manufacturer and current card.
 // source: https://norgips.pl/produkty/profil-ud-30-super-o-gr-blachy-06-mm-c3-26.html
 'leroy-norgips-ud30-super-c3-3m':{sku:'44604343',ean:'5907651691197',unit:'mb',size:3,facts:{'Długość (w m)':'3','Szerokość (w mm)':'30','Grubość (w mm)':'0.6 ± 0.05'}},
 'leroy-norgips-es6075':{sku:'43912435',ean:'5907651699650',unit:'szt',size:1,facts:{'Model produktu':'ES 60/75 MM','Długość (w mm)':'75'}},
 'leroy-norgips-board-gkb-2600':{sku:'41661683',ean:'5907651690442',unit:'m2',size:3.12,facts:{'Powierzchnia pokryta przez produkt (w m²)':'3.12','Długość (w cm)':'260','Szerokość (w cm)':'120','Grubość (w mm)':'12.5'}},
};
export interface LeroyCartSnapshot {version:1;url:string;capturedAt:string;axState:string}
export interface LeroyProductSnapshot extends BrowserProductSnapshot {domHeading:string}
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const text=(s:string)=>s.trim().replace(/\s+/g,' ');
export function isLeroyBrowserSource(source:RetailSource):boolean{
 const p=PRODUCTS[source.id];
 if(!p||source.store!=='Leroy Merlin'||source.brand!=='Norgips'||source.browserReviewAllowed!==true||source.pickupRequiresConfirmation!==true||source.ean!==p.ean||source.unit!==p.unit||source.packageSize!==p.size||source.retailerSku!==p.sku||source.marketplaceSeller||source.pickupOnly||source.pickupUnavailable)return false;
 try{const u=new URL(source.url);return u.origin==='https://www.leroymerlin.pl'&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/produkty\/[a-z0-9-]+\.html$/.test(u.pathname)&&u.pathname.endsWith('-'+p.sku+'.html');}catch{return false;}
}
function capturedAt(value:string,now:Date):number{
 const at=Date.parse(value),age=now.getTime()-at;
 if(!Number.isFinite(at)||age< -300000||age>=86400000)throw Error('browser_observation_not_current');
 return at;
}
/** Offline operator import. OnlineOnly is not a stock declaration: a matching
 * anonymous native cart must independently accept the whole purchase unit.
 * Neither a card's "od" freight nor an unaddressed cart total quotes delivery.
 * No customer, account, order or payment action is performed by this reader. */
export function observeLeroyBrowser(snapshot:LeroyProductSnapshot,cart:LeroyCartSnapshot,source:RetailSource,now=new Date()):RetailObservation{
 const cardAt=capturedAt(snapshot.capturedAt,now),cartAt=capturedAt(cart.capturedAt,now);
 if(!isLeroyBrowserSource(source)||snapshot.version!==1||snapshot.url!==source.url||snapshot.ean!==source.ean||snapshot.heading!==source.name||cart.version!==1||cart.url!=='https://www.leroymerlin.pl/checkout/cart'||cartAt<cardAt-300000)throw Error('browser_product_identity_not_confirmed');
 if(!Array.isArray(snapshot.schemas)||snapshot.schemas.length>12||snapshot.schemas.some(s=>typeof s!=='string'||s.length>100000)||typeof snapshot.axState!=='string'||snapshot.axState.length>1000000||typeof cart.axState!=='string'||cart.axState.length>1000000||!Array.isArray(snapshot.tables)||snapshot.tables.length>30)throw Error('invalid_browser_snapshot');
 const products=snapshot.schemas.flatMap(s=>{try{const p=JSON.parse(s);return p?.['@type']==='Product'?[p]:[]}catch{return[];}}),p=products[0],review=PRODUCTS[source.id];
 if(products.length!==1||p.name!==source.name||p.gtin!==source.ean||p.sku!==review.sku||p.brand?.name!=='NORGIPS'||p.offers?.['@type']!=='Offer'||p.offers.url!==source.url||p.offers.priceCurrency!=='PLN'||p.offers.availability!=='http://schema.org/OnlineOnly'||p.offers.seller)throw Error('browser_product_identity_not_confirmed');
 const price=parsePriceToGrosze(p.offers.price);
 if(price===null||!Number.isSafeInteger(price)||price<=0)throw Error('browser_gross_price_mismatch');
 const formatted=(price/100).toFixed(2).replace('.',',');
 if(text(snapshot.domHeading)!==source.name||!snapshot.axState.includes('heading '+source.name+' '+formatted+' PLN, Value: 1'))throw Error('browser_gross_price_mismatch');
 const section=snapshot.axState.slice(snapshot.axState.indexOf('heading '+source.name+' ')).split(/\n\s*\d+ container (?:product-informations|component-recommendation)/)[0];
 if(!section.includes('text Sprzedany '+formatted+' zł za szt.')||!section.includes('text Sprzedawane i wysyłane przez  LEROY MERLIN')||!/\n\s*\d+ button Dodaj do koszyka\r?\n/.test(section))throw Error('browser_purchase_unit_not_confirmed');
 const tables=snapshot.tables.filter(t=>Array.isArray(t)&&t.length>0&&t.every(r=>Array.isArray(r)&&r.length===2&&r.every(v=>typeof v==='string'&&v.length<500))&&t.some(r=>r[0]==='Marka produktu'&&r[1]==='NORGIPS'));
 if(tables.length!==1||Object.entries(review.facts).some(([k,v])=>tables[0].filter(r=>r[0]===k&&r[1]===v).length!==1))throw Error('browser_package_not_confirmed');
 const start=cart.axState.indexOf('container app-checkout-content'),end=cart.axState.indexOf('container component-recommendation',start),body=cart.axState.slice(start,end<0?undefined:end);
 if(start<0||!body.includes('heading Produkty sprzedawane i wysyłane przez LEROY MERLIN, Value: 2')||/Produkty sprzedawane i wysyłane przez (?!LEROY MERLIN)/.test(body))throw Error('browser_seller_not_confirmed');
 const lines=[...body.matchAll(/text Nr ref\.\s+(\d{8})([\s\S]*?)(?=\n\s*\d+ text Nr ref\.|$)/g)];
 if(!lines.length||new Set(lines.map(m=>m[1])).size!==lines.length)throw Error('browser_cart_not_confirmed');
 let sum=0,found=false;
 for(const line of lines){
  const counts=[...line[2].matchAll(/stepper \(settable, integer\) Description: Wprowadź ilość, Value: (\d+),/g)],prices=[...line[2].matchAll(/\n\s*\d+ text ([\d,.]+) zł\r?\n/g)];
  // Last row includes the basket summary, whose amounts have descriptive labels.
  if(counts.length!==1||prices.length!==1)throw Error('browser_cart_not_confirmed');
  const count=Number(counts[0][1]),linePrice=parsePriceToGrosze(prices[0][1]);
  if(!Number.isSafeInteger(count)||count<1||linePrice===null||!Number.isSafeInteger(linePrice)||linePrice<=0)throw Error('browser_cart_not_confirmed');
  sum+=linePrice;
  if(line[1]===review.sku){if(linePrice!==count*price||!new RegExp('button Usuń produkt '+escape(source.name)+' z mojego koszyka(?:\\r?\\n|$)').test(line[2]))throw Error('browser_cart_price_mismatch');found=true;}
 }
 const subtotal=body.match(/text Wartość brutto ([\d,.]+) zł(?:\r?\n|$)/);
 if(!found||!subtotal||!Number.isSafeInteger(sum)||sum!==parsePriceToGrosze(subtotal[1]))throw Error('browser_cart_not_confirmed');
 const at=Math.max(cardAt,cartAt),normalized={...p,offers:{...p.offers,availability:'https://schema.org/InStock'}};
 const observation=parseRetailPage('<script type="application/ld+json">'+JSON.stringify(normalized)+'</script>',source,new Date(at));
 if(observation.priceGrosze!==price)throw Error('browser_gross_price_mismatch');
 return {...observation,verification:{method:'browser',checkedAt:new Date(at).toISOString(),expiresAt:new Date(at+86400000).toISOString()},evidenceSha256:createHash('sha256').update(JSON.stringify({snapshot,cart})).digest('hex')};
}
