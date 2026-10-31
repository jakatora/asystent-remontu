import {createHash} from 'node:crypto';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {AnonymousShop,MAX_RETAIL_PACKAGES,retailerRequestBudget} from './retailer-http';
import {parseRetailPage} from './retail-pages';
import {ETAK_ORIGIN,ETAK_SOURCES,isReviewedEtakSource} from './etak-sources';
import {etakGrossFromNet,etakMoney,readEtakCard} from './etak-product';
import type {RetailSource} from './retail-pages';

type Expected={source:RetailSource;count:number;price:number;net:number};

/** Only shop1 at the reviewed origin is used. The native response also lists
 * another storefront; it never authorizes a redirect or a quote from it.
 * source: https://etak.eu/ajax/client-new.php?checkDeliveryZipcode=true&region_id=1143020003&zipcode=30-001 */
export function confirmEtakDestination(value:any) {
  const regions=value?.valid_region?.['1'],region=regions?.[0];
  if(value?.error||value?.errors?.length||value?.valid!==true||!Array.isArray(regions)||regions.length!==1||region.shop_id!=='1'||region.url!==ETAK_ORIGIN
    ||!/^\d+$/.test(region.id_region??'')||!(region.id_region==='1143020003'&&region.parent==='0'||region.id_region!=='1143020003'&&region.parent==='1143020003'))throw Error('address_required');
}

/** This carrier is home delivery; cheaper named lockers/points are excluded.
 * All costs come from the nonempty verified basket and requested postcode.
 * source: https://etak.eu/pl/delivery.html
 * source: https://etak.eu/graphql/v1/ */
export function selectEtakShipping(value:any) {
  const countries=value?.data?.shippingCountries,rates=value?.data?.shipping?.shipping;
  if(value?.errors?.length||!Array.isArray(countries)||countries.length!==1||countries[0].id!=='1143020003'||countries[0].name!=='Polska'||countries[0].selected!==true||!Array.isArray(rates)||rates.length>100)throw Error('address_required');
  const selected=rates.filter(r=>r?.prepaid==='prepaid'&&r.courier?.id===100206&&r.courier.name==='DHL Paczka');
  if(selected.length!==1)throw Error('no_home_delivery');
  const price=selected[0].cost;if(price?.value===undefined||price?.formatted===undefined)throw Error('invalid_money');
  return{costGrosze:etakMoney(price.value,price.formatted),carrier:'DHL Paczka',payment:'Płatność z góry'};
}

/** Independent opt-in for this merchant's whole-position VAT calculation.
 * ABUD/Chemia's existing exact-unit validators remain unchanged. */
export function confirmEtakBasket(response:any,expected:readonly Expected[],materialsGrosze:number) {
  const basket=response?.basket;
  if(response?.error||response?.errors?.length||!basket||basket.error||basket.errors?.length||basket.currency!=='PLN'||basket.shipping_exists!==true||basket.total_deposit!==0||basket.total_deposit_net!==0
    ||!expected.length||expected.length>ETAK_SOURCES.length||!Array.isArray(basket.products)||basket.products.length!==expected.length)throw Error('basket_not_confirmed');
  const remaining=new Map(expected.map(row=>[String(row.source.productId),row]));let total=0,netTotal=0,base=0,count=0;
  if(remaining.size!==expected.length||expected.some(row=>!isReviewedEtakSource(row.source)||!Number.isSafeInteger(row.count)||row.count<1||row.count>MAX_RETAIL_PACKAGES||!Number.isSafeInteger(row.price)||row.price<=0||etakGrossFromNet(row.net)!==row.price))throw Error('invalid_basket');
  for(const row of basket.products){
    const wanted=remaining.get(row?.id);
    if(!wanted||row.size!=='uniw'||row.price_unit!=='szt.'||row.worth_unit!=='szt.'||row.name!==wanted.source.name||new URL(row.link,wanted.source.url).href!==wanted.source.url
      ||row.bonus!=='n'||row.product_type!=='product_item'||row.bundle!==0||!Array.isArray(row.bundled)||row.bundled.length||row.subscription_period!=='0'||row.available_now!=='y'||row.count!==wanted.count||row.vat!=='23.0')throw Error('basket_not_confirmed');
    if(!Number.isSafeInteger(row.reservation_stocksown)||row.reservation_stocksown<0)throw Error('product_unavailable');
    if(row.reservation_stocksown<wanted.count)throw Error('insufficient_stock');
    const p=row.prices,worthNet=wanted.net*wanted.count,worth=etakGrossFromNet(worthNet);
    if(!p||['gros_formatted','net_formatted','worth_gros_formatted','worth_net_formatted'].some(k=>typeof p[k]!=='string')
      ||etakMoney(p.gros,p.gros_formatted)!==wanted.price||etakMoney(p.net,p.net_formatted)!==wanted.net||etakMoney(p.worth_net,p.worth_net_formatted)!==worthNet||etakMoney(p.worth_gros,p.worth_gros_formatted)!==worth)throw Error('price_changed');
    total+=worth;netTotal+=worthNet;base+=wanted.count*wanted.price;count+=wanted.count;remaining.delete(row.id);
  }
  if(remaining.size||![total,netTotal,base].every(Number.isSafeInteger)||base!==materialsGrosze||etakMoney(basket.worth)!==total||etakMoney(basket.worth_net)!==netTotal||basket.productsNumber!==count||Math.abs(total-base)>count)throw Error('basket_not_confirmed');
  return{basket,materialsRoundingGrosze:total-base};
}

export async function quoteEtak(order:DeliveredStoreBasket,postalCode:string,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult> {
  if(order.store!=='eTak'||!/^\d{2}-\d{3}$/.test(postalCode)||!order.lines.length||order.lines.length>ETAK_SOURCES.length||!Number.isSafeInteger(order.materialsGrosze)||order.materialsGrosze<=0)throw Error('invalid_basket');
  const client=new AnonymousShop(ETAK_ORIGIN,fetchImpl,AbortSignal.timeout(20000),retailerRequestBudget(order.lines.length)),expected:Expected[]=[],observations:string[]=[];
  for(const line of order.lines)for(const pack of line.packages){
    const source=ETAK_SOURCES.find(s=>s.id===pack.offerId);
    if(!source||line.product.id!=='remont-'+source.ean||line.unit!=='szt'||pack.store!=='eTak'||pack.url!==source.url||pack.packageSize!==1||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>MAX_RETAIL_PACKAGES
      ||pack.purchaseMultiple!==undefined||pack.minimumPackages!==undefined||pack.cutRoll||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze<=0||pack.lineCostGrosze!==pack.count*pack.unitPriceGrosze||expected.some(row=>row.source.id===source.id))throw Error('invalid_basket');
    const html=await client.text(source.url),card=readEtakCard(html,source),observation=parseRetailPage(html,source,new Date());
    if(observation.priceGrosze!==pack.unitPriceGrosze||card.priceGrosze!==pack.unitPriceGrosze)throw Error('price_changed');
    if(card.maxPackages<pack.count)throw Error('insufficient_stock');
    expected.push({source,count:pack.count,price:pack.unitPriceGrosze,net:card.netPriceGrosze});observations.push(observation.evidenceSha256);
  }
  if(!expected.length||expected.reduce((sum,row)=>sum+row.count*row.price,0)!==order.materialsGrosze)throw Error('invalid_basket');
  const destination=await client.etak('destination',{postalCode});confirmEtakDestination(destination);
  for(const row of expected)await client.etak('add',{productId:row.source.productId,count:row.count});
  // The add response is the PREVIOUS basket. A separate read confirms the
  // complete current state without adding the products a second time.
  const confirmed=confirmEtakBasket(await client.etak('basket'),expected,order.materialsGrosze),shipping=await client.etak('shipping',{postalCode}),best=selectEtakShipping(shipping),now=new Date();
  return{quote:{...best,materialsRoundingGrosze:confirmed.materialsRoundingGrosze,checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:ETAK_ORIGIN+'/pl/basketedit.html',basis:'retailer_basket_postcode',destinationScope:'postal_code',postalCode,
    evidenceSha256:createHash('sha256').update(JSON.stringify({observations,destination,basket:confirmed.basket,shipping,postalCode})).digest('hex')}};
}
