import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import {normalizeProductName} from '@workspace/db/repositories';
import {parseRetailPage,type RetailObservation,type RetailSource} from './retail-pages';

export interface BrowserProductSnapshot {
 version:1; url:string; ean:string; capturedAt:string; heading:string;
 /** Actual DOM script contents, not a fabricated Product or search result. */
 schemas:string[];
 /** Current visible accessibility text including price, purchase unit and CTA. */
 axState:string;
 /** Visible technical table rows captured from the same product DOM. */
 tables?:string[][][];
}

function specificationValue(snapshot:BrowserProductSnapshot,label:string):string{
 const tables=snapshot.tables?.filter(table=>table.some(row=>row.length===2&&row[0]==='Kod produktu'&&row[1]===snapshot.ean));
 if(tables?.length!==1)throw Error('browser_package_not_confirmed');
 const rows=tables[0].filter(row=>row.length===2&&row[0]===label);
 if(rows.length!==1)throw Error('browser_package_not_confirmed');
 const value=rows[0][1],escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const table=snapshot.axState.split('table Specyfikacja techniczna')[1]??'';
 if(!new RegExp('\\d+ text '+escape(label)+'\\r?\\n\\s*\\d+ cell\\r?\\n\\s*\\d+ text '+escape(value)+'(?:\\r?\\n|$)').test(table))throw Error('browser_package_not_confirmed');
 return value;
}

/** Reviewed marketplace identity is kept separate from the platform. This
 * allowlist also protects bootstrap/cache reads; no public source registration. */
export function isCastoramaBrowserSource(source:RetailSource):boolean{
 if(source.browserReviewAllowed!==true)return false;
 try{const url=new URL(source.url);if(url.origin!=='https://www.castorama.pl'||url.username||url.password)return false;}catch{return false;}
 if(!source.marketplaceSeller)return source.store==='Castorama';
 return source.id==='castorama-marketplace-corksystem-lvt-6m2'&&source.ean==='5061092900925'&&source.store==='Corksystem (Castorama)'&&source.marketplaceSeller.name==='Corksystem'&&source.marketplaceSeller.id===2601&&source.pickupUnavailable===true&&source.packageSize===6&&source.unit==='m2';
}

/** Offline operator import only; no public upload endpoint or client-controlled
 * fetch URL. Local pickup stock/price and banner freight must never become a
 * delivery quote or nationwide stock. Browser reads expire after 24 hours. */
export function observeCastoramaBrowser(snapshot:BrowserProductSnapshot,source:RetailSource,now=new Date()):RetailObservation{
 const captured=Date.parse(snapshot.capturedAt),age=now.getTime()-captured;
 if(!Number.isFinite(captured)||age< -300000||age>=86400000)throw Error('browser_observation_not_current');
 if(snapshot.version!==1||!isCastoramaBrowserSource(source)||snapshot.url!==source.url||snapshot.ean!==source.ean||!new URL(snapshot.url).pathname.endsWith('/'+source.ean+'_CAPL.prd'))throw Error('browser_product_identity_not_confirmed');
 if(snapshot.heading!==source.name||!snapshot.axState.includes('heading '+source.name+', Value: 1')||!snapshot.axState.includes('text '+source.ean))throw Error('browser_product_identity_not_confirmed');
 if(!Array.isArray(snapshot.schemas)||snapshot.schemas.length>12||snapshot.schemas.some(s=>typeof s!=='string'||s.length>100000)||snapshot.axState.length>250000)throw Error('invalid_browser_snapshot');
 const products=snapshot.schemas.flatMap(s=>{try{const value=JSON.parse(s);return value?.['@type']==='Product'?[value]:[]}catch{return[];}});
 if(products.length!==1||products[0].gtin13!==source.ean||products[0].name!==snapshot.heading)throw Error('browser_product_identity_not_confirmed');
 const nativeBrand=typeof products[0].brand==='string'?products[0].brand:products[0].brand?.name;
 if(nativeBrand&&normalizeProductName(nativeBrand)!==normalizeProductName(source.brand))throw Error('browser_product_identity_not_confirmed');
 const offers=[products[0].offers].flat();
 const home=offers.filter(o=>o?.['@type']==='Offer'&&o.description==='Home Delivery'&&o.availableDeliveryMethod==='https://schema.org/ParcelService'&&!o.availableAtOrFrom);
 if(home.length!==1||home[0].availability!=='https://schema.org/InStock'||home[0].priceCurrency!=='PLN')throw Error('no_confirmed_online_pln_offer');
 const section=snapshot.axState.slice(snapshot.axState.indexOf('heading '+snapshot.heading+', Value: 1')).split(/\n\s*\d+ container product-suggestions/)[0];
 const merchant=source.marketplaceSeller;
 if(merchant){
  const sellerLink='link Description: '+merchant.name+', Value: castorama.pl/verified-sellers/seller/'+merchant.id;
  if(home[0].seller?.name!==merchant.name||!section.includes(sellerLink)||!section.includes('text Produkt dostępny wyłącznie w sprzedaży internetowej.')||offers.some(o=>o?.availableDeliveryMethod==='https://schema.org/OnSitePickup'&&o.availability==='https://schema.org/InStock'))throw Error('browser_seller_not_confirmed');
 }else if(home[0].seller&&home[0].seller.name!=='Castorama Polska')throw Error('browser_seller_not_confirmed');
 const area=source.unit==='m2',length=source.unit==='m';
 const visible=merchant?section.match(/\n\s*\d+ text ([\d\s,.]+zł)\s*(?:\r?\n|$)/):area?section.match(/\n\s*\d+ text [\d\s,.]+zł\s*\/\s*m²\s+([\d\s,.]+zł)\s*\/\s*(opak\.)/):section.match(/\n\s*\d+ text ([\d\s,.]+zł)\s*\/\s*(szt\.|opak\.)/);
 if(!visible||!['szt','l','kg','mb','m2','m'].includes(source.unit))throw Error('browser_purchase_unit_not_confirmed');
 if(area){
  const coverage=specificationValue(snapshot,'Pokrycie').match(/^(\d+(?:[.,]\d+)?)\s*m[²2]$/),pieces=specificationValue(snapshot,'Liczba sztuk w opakowaniu');
  if(!coverage||Number(coverage[1].replace(',','.'))!==source.packageSize||!/^\d+$/.test(pieces)||Number(pieces)<1||normalizeProductName(specificationValue(snapshot,'Marka'))!==normalizeProductName(source.brand))throw Error('browser_package_not_confirmed');
  if(merchant&&(pieces!=='1'||specificationValue(snapshot,'Rodzaj opakowania')!=='Opakowanie'||!/(?:^| )1 op\.$/.test(snapshot.heading)))throw Error('browser_package_not_confirmed');
 }
 if(length){
  const dimensions=snapshot.heading.match(/(?:^| )(\d+(?:[.,]\d+)?) x (\d+(?:[.,]\d+)?) cm(?: |$)/);
  if(source.category!=='windowsill'||visible[2]!=='szt.'||!dimensions||Number(dimensions[2].replace(',','.'))/100!==source.packageSize)throw Error('browser_package_not_confirmed');
 }
 if(source.unit==='szt'&&visible[2]==='szt.'&&source.packageSize!==1)throw Error('browser_purchase_unit_not_confirmed');
 if(!length&&(source.unit!=='szt'||visible[2]==='opak.')){
   const name=normalizeProductName(snapshot.heading.replace(/(\d)([a-zA-Z])/g,'$1 $2'));
   const quantity=normalizeProductName(String(source.packageSize))+' '+source.unit;
   if(!new RegExp('(?:^| )'+quantity+'(?: |$)').test(name))throw Error('browser_package_not_confirmed');
 }
 if(!/\n\s*\d+ button Dodaj 1 przedmiot do koszyka/.test(section)||!section.includes('heading Sprzedaż wysyłkowa'))throw Error('browser_purchase_not_confirmed');
 const script=snapshot.schemas.find(s=>{try{return JSON.parse(s)?.['@type']==='Product'}catch{return false;}})!;
 const observation=parseRetailPage('<script type="application/ld+json">'+script+'</script>',source,new Date(captured));
 if(parsePriceToGrosze(visible[1].replace(/zł$/,''))!==observation.priceGrosze)throw Error('browser_gross_price_mismatch');
 return{...observation,verification:{method:'browser',checkedAt:new Date(captured).toISOString(),expiresAt:new Date(captured+86400000).toISOString()},evidenceSha256:createHash('sha256').update(JSON.stringify(snapshot)).digest('hex')};
}
