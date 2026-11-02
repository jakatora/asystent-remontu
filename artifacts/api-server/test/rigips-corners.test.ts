import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/rigips-corners.json' with {type:'json'};
import {RIGIPS_CORNER_SOURCES} from '../src/lib/rigips-corners';
import {parseRetailPage} from '../src/lib/retail-pages';
import {seweraHomeDeliveryMethods,seweraUnquotedDeliveryReason} from '../src/lib/retailer-checkouts';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';

test('real Rigips primary cards price one 2.5 or 3 metre bar, with distinct factory identities and photos',()=>{
  for(const [i,size,ean,price]of [[0,2.5,'5905637118041',809],[1,3,'5905637118058',967]] as const){
    const s=RIGIPS_CORNER_SOURCES[i],f=fixture.find(f=>f.sourceId===s.id)!;
    const o=parseRetailPage(f.primaryHtml,s,new Date(f.observedAt));
    assert.equal(s.packageSize,size);assert.equal(s.unit,'mb');assert.equal(s.retailUnit,'SZT');
    assert.equal(o.ean,ean);assert.equal(o.priceGrosze,price);assert.equal(o.imageUrl,s.imageUrl);
  }
});

test('a one-bar quote cannot change to metres, a factory bundle, another length or manufacturer',()=>{
  const s=RIGIPS_CORNER_SOURCES[0],f=fixture.find(f=>f.sourceId===s.id)!;
  for(const patch of [{packageSize:1},{packageSize:50},{packageSize:3},{unit:'szt'},{retailUnit:'OPA' as const},{minimumPackages:50},{purchaseMultiple:50},{ean:'5905637118058'},{variant:['30x30mm','2,5m']},{store:'Inny sklep'}])assert.throws(()=>parseRetailPage(f.primaryHtml,{...s,...patch},new Date(f.observedAt)));
  for(const html of [f.primaryHtml.replaceAll('11511804','11511805'),f.primaryHtml.replaceAll('RIGIPS','INNA MARKA'),f.primaryHtml.replaceAll('195931','195935')])assert.throws(()=>parseRetailPage(html,s,new Date(f.observedAt)));
});

test('native Sewera local radius and HDS options require an individual transport price, never zero or a parcel quote',()=>{
  for(const f of fixture){const html=f.deliveryOptions.join('\n');assert.deepEqual(seweraHomeDeliveryMethods(html),[]);assert.equal(seweraUnquotedDeliveryReason(html),'retailer_transport_quote_required');}
  const local=fixture[0].deliveryOptions.find(s=>s.includes('Transport Sewera'))!;
  for(const html of [local.replace('type="radio"','type="radio" disabled'),local.replace('data-personal-collection="3"','data-personal-collection="1"'),local.replace('Transport Sewera do 50km','Odbiór osobisty'),local.replace('value="12"','value="999"')])assert.equal(seweraUnquotedDeliveryReason(html),'no_home_delivery');
  const pickup=fixture[0].deliveryOptions.find(s=>s.includes('Odbiór osobisty'))!;assert.equal(seweraUnquotedDeliveryReason(pickup),'no_home_delivery');
  assert.equal(seweraUnquotedDeliveryReason('<p>Transport HDS wycena indywidualna</p>'),'no_home_delivery');
});

test('the real five-response Sewera checkout preserves the reason through the public quoter without quoting a placeholder',async()=>{
  for(const [i,s]of RIGIPS_CORNER_SOURCES.entries()){
    const f=fixture.find(f=>f.sourceId===s.id)!,price=i===0?809:967,calls:string[]=[];
    const order:DeliveredStoreBasket={store:'Sewera',materialsGrosze:price,deliveryGrosze:null,totalGrosze:null,source:'unknown',deliveryMinimumGrosze:0,lines:[{product:{id:'remont-'+s.ean,name:s.name,imageUrl:s.imageUrl!},unit:s.unit,packages:[{offerId:s.id,store:s.store,url:s.url,packageSize:s.packageSize,count:1,unitPriceGrosze:price,lineCostGrosze:price}]}]};
    const responseFor:Record<string,string>={
      '/ajax/ax_execute.php?operation=setDepartment':'1',[new URL(s.url).pathname]:f.primaryHtml,
      '/ajax/ax_execute.php?operation=addToBasket':'1','/index.php?page=koszyk':f.basketHtml,'/zamowienie':f.checkoutHtml,
    };
    const result=await createRetailerQuoter(async(input)=>{const url=new URL(String(input)),key=url.pathname+url.search;assert.equal(url.origin,'https://sklep.sewera.pl');assert(key in responseFor,'Unexpected checkout operation: '+key);calls.push(key);return new Response(responseFor[key],{status:200,headers:{'content-type':'text/html'}});})(order,'30-001');
    assert.deepEqual(result,{reason:'retailer_transport_quote_required'});assert.equal(calls.length,5);assert(!calls.some(p=>p.includes('get_order_delivery_cost')));
  }
});
