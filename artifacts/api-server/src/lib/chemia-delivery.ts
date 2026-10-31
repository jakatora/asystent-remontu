import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {RETAIL_SOURCES} from './retail-catalog';
import {AnonymousShop} from './retailer-http';
import {parseRetailPage} from './retail-pages';
import {cleanHtml,htmlAttributes,htmlElements} from './retail-microdata';
import {confirmIdosellBasket} from './idosell-basket';
const ORIGIN='https://chemiadoparkietu25.pl',ID='chemiadoparkietu-soudal-26a-5kg';
const attr=(n:string)=>htmlAttributes(n.match(/^<[^>]+>/)?.[0]??'');
/** Home delivery requires the exact reviewed prepaid carrier and explicit
 * Poland. A cheaper locker, collection or cash-on-delivery is not equivalent.
 * source: https://chemiadoparkietu25.pl/pol-delivery.html
 * source: https://chemiadoparkietu25.pl/graphql/v1/ */
export function selectChemiaShipping(value:any){
 const countries=value?.data?.shippingCountries,rates=value?.data?.shipping?.shipping;
 if(value?.errors?.length||!Array.isArray(countries)||countries.length!==1||countries[0].id!=='1143020003'||countries[0].name!=='Polska'||countries[0].selected!==true||!Array.isArray(rates)||rates.length>100)throw Error('address_required');
 const names:Record<number,string>={100155:'InPost Kurier ',6:'DPD'},seen=new Set<number>(),choices:{costGrosze:number;carrier:string}[]=[];
 for(const row of rates){
  const id=row?.courier?.id;if(row?.prepaid!=='prepaid'||!Number.isSafeInteger(id)||names[id]!==row.courier.name)continue;
  if(seen.has(id))throw Error('invalid_response');seen.add(id);
  const raw=row?.cost,price=raw&&['number','string'].includes(typeof raw.value)?parsePriceToGrosze(raw.value):null;
  if(price===null||price<0||!Number.isSafeInteger(price)||typeof raw.formatted!=='string'||!/^[\d\s,.]+\s*zł$/.test(raw.formatted)||parsePriceToGrosze(raw.formatted.replace(/\s*zł$/,''))!==price)throw Error('invalid_money');
  choices.push({costGrosze:price,carrier:row.courier.name.trim()});
 }
 const selected=choices.sort((a,b)=>a.costGrosze-b.costGrosze)[0];if(!selected)throw Error('no_home_delivery');return selected;
}
export async function quoteChemia(order:DeliveredStoreBasket,postalCode:string,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
 const source=RETAIL_SOURCES.find(s=>s.id===ID)!,line=order.lines[0],pack=line?.packages[0];
 if(order.store!=='ChemiaDoParkietu25'||!/^\d{2}-\d{3}$/.test(postalCode)||order.lines.length!==1||line.unit!=='kg'||line.product.id!=='remont-5411183028395'||line.packages.length!==1||!pack||pack.offerId!==ID||pack.store!==order.store||pack.url!==source.url||pack.packageSize!==5||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>100||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze<1||pack.lineCostGrosze!==pack.count*pack.unitPriceGrosze||order.materialsGrosze!==pack.lineCostGrosze)throw Error('invalid_basket');
 const client=new AnonymousShop(ORIGIN,fetchImpl,AbortSignal.timeout(20000),10),html=await client.text(source.url),observed=parseRetailPage(html,source,new Date());
 if(observed.priceGrosze!==pack.unitPriceGrosze)throw Error('price_changed');
 const safe=cleanHtml(html),form=htmlElements(safe,(a,t)=>t==='form'&&a.id==='projector_form'&&a['data-product_id']==='25914');if(form.length!==1)throw Error('product_unavailable');
 for(const [id,value]of [['projector_size_hidden','uniw'],['projector_mode_hidden','1']]){const inputs=htmlElements(safe,a=>a.id===id),a=inputs[0]&&attr(inputs[0]);if(inputs.length!==1||!a||a.value!==value||(a.form!==undefined?a.form!=='projector_form':!form[0].includes(inputs[0])))throw Error('product_unavailable');}
 const basket=await client.chemia('add',{count:pack.count});confirmIdosellBasket(basket,[{source,count:pack.count,price:pack.unitPriceGrosze}],order.materialsGrosze);
 const shipping=await client.chemia('shipping',{postalCode}),best=selectChemiaShipping(shipping),now=new Date();
 return{quote:{...best,payment:'Płatność z góry',checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:ORIGIN+'/basketedit.php',basis:'retailer_basket_postcode',destinationScope:'postal_code',postalCode,evidenceSha256:createHash('sha256').update(JSON.stringify({observation:observed.evidenceSha256,basket,shipping,postalCode})).digest('hex')}};
}
