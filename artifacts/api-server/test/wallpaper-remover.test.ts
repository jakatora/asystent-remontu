import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/wallpaper-remover.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {parseRetailPage} from '../src/lib/retail-pages';
import {readCertusoftProduct} from '../src/lib/certusoft-product';
import {AnonymousShop} from '../src/lib/retailer-http';
test('current primary cards confirm whole500ml concentrate bottles,20kg dry filler and5kg primer packs',()=>{
 for(const row of fixture){const source=RETAIL_SOURCES.find(s=>s.id===row.sourceId)!;assert.ok(source);const o=parseRetailPage(row.html,source,new Date());assert.equal(o.priceGrosze,row.priceGrosze);assert.equal(o.ean,source.ean);assert.equal(source.pickupRequiresConfirmation,true);assert.throws(()=>parseRetailPage(row.html.replaceAll(source.ean,'1234567890128'),source,new Date()));}
 const s=RETAIL_SOURCES.find(s=>s.id==='hipper-metylan-remover-500ml')!,row=fixture.find(r=>r.sourceId===s.id)!;assert.equal(parseRetailPage(row.html,s,new Date()).stockPackages,8);for(const patch of [{packageSize:0.5},{unit:'l'},{retailerUnitId:s.productId},{apiPurchaseUnit:'ml'},{purchaseMultiple:12}])assert.throws(()=>readCertusoftProduct(row.html,{...s,...patch}));
});
test('anonymous ABUD additions count native bottles or sacks, with no order/customer action',async()=>{
 const added:number[]=[];const fetcher:typeof fetch=async(url,init)=>{assert.equal(String(url),'https://www.abud.pl/basketchange.php');const b=new URLSearchParams(String(init?.body));assert.deepEqual([...b.keys()],['getAjax','mode','product','size','number']);assert.equal(b.get('number'),'1');added.push(Number(b.get('product')));return Response.json({});};const shop=new AnonymousShop('https://www.abud.pl',fetcher,AbortSignal.timeout(2000));for(const id of [5708,7965,1121])await shop.abud('add',{productId:id,count:1});assert.deepEqual(added,[5708,7965,1121]);await assert.rejects(shop.abud('add',{productId:484,count:1}),/invalid_cart_action/);
});
