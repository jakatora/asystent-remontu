import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/gypsum-cross.json' with {type:'json'};
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage, readRetailSource } from '../src/lib/retail-pages';
import { readCertusoftProduct } from '../src/lib/certusoft-product';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const hipper=RETAIL_SOURCES.find(s=>s.id==='hipper-norgips-cross-100')!;
const ebardo=RETAIL_SOURCES.find(s=>s.id==='ebardo-budmat-cross-100')!;
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
const page=(state:unknown,primary:string)=>'<script>window.__INITIAL_STATE__='+JSON.stringify(state)+';(function(){var s;}());</script>'+primary;
const productPage=()=>page(fixture.hipper.state,fixture.hipper.primary);
const order=(s=hipper,price=8999):DeliveredStoreBasket=>({store:s.store,materialsGrosze:price,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:s.ean,name:s.name,imageUrl:null},unit:'szt',packages:[{offerId:s.id,count:1,packageSize:100,lineCostGrosze:price,unitPriceGrosze:price,store:s.store,url:s.url}]}]});

test('HIPPER carton price and stock mean 100 pieces and 3 whole cartons, never one connector or 300 cartons',()=>{
 const o=parseRetailPage(productPage(),hipper,new Date());assert.equal(o.priceGrosze,8999);assert.equal(o.stockPackages,3);assert.equal(hipper.packageSize,100);
 for(const patch of [{packageSize:1},{packageSize:50},{apiPurchaseUnit:'opak'},{retailerUnitId:3071669325},{ean:'5907651699612'},{purchaseMultiple:100},{variant:['krzyżowy']}])assert.throws(()=>readCertusoftProduct(productPage(),{...hipper,...patch}));
 const state=clone(fixture.hipper.state);state.csAppWindowsUtils.csAppWindows.csB2BItemCard.dataSets.itemCard.rows[0].quantityUnits=100;assert.throws(()=>readCertusoftProduct(page(state,fixture.hipper.primary),hipper),/purchase_rules/);
});

test('real HIPPER carton checkout charges 18.90 home courier and rejects changed subtotal or exhausted cartons',async()=>{
 let cartReads=0,postCount=0;
 const fetcher:typeof fetch=async(input,init)=>{const u=new URL(String(input));assert.equal(u.origin,'https://hipper.pl');if((init?.method??'GET')==='GET'){if(u.pathname==='/koszyk'){const c=fixture.hipper.carts[cartReads++];assert.ok(c);return new Response(page(c.state,c.summary));}return new Response(productPage());}const body=JSON.parse(String(init?.body));assert.ok(['cartAdd','csNGOnCFB2BCartHeader'].includes(body.actionIdent));if(body.actionIdent==='cartAdd'){assert.equal(body.row.quantityUnits,1);assert.equal(body.row.csItemsUnitsId,3072059634);}postCount++;return Response.json({commands:[]});};
 const q=await createRetailerQuoter(fetcher)(order(),'00-001');assert.ok('quote'in q);assert.equal(q.quote.costGrosze,1890);assert.equal(postCount,2);assert.equal(cartReads,2);
 const tooMany=order();tooMany.lines[0].packages[0].count=4;assert.deepEqual(await createRetailerQuoter(async()=>new Response(productPage()))(tooMany,'00-001'),{reason:'insufficient_stock'});
});

test('eBardo confirms Budmat carton gross49, SKU and100szt; shipping is25, not locker teaser18 or net39.84',async()=>{
 const read=(p:unknown)=>readRetailSource(ebardo,async()=>Response.json(p));const o=await read(fixture.ebardo.product);assert.equal(o.priceGrosze,4900);
 for(const mutate of [(p:any)=>p.ean='5907651696468',(p:any)=>p.name=p.name.replace('100szt','10szt'),(p:any)=>p.code='other',(p:any)=>p.unit.floating_point=true]){const p=clone(fixture.ebardo.product);mutate(p);await assert.rejects(read(p));}
 const q=await createRetailerQuoter(async(input,init)=>{const u=new URL(String(input));assert.equal(u.origin,'https://ebardo.pl');if(u.pathname.endsWith('/products/PLN/138'))return Response.json(fixture.ebardo.product);assert.equal(u.pathname,'/webapi/front/pl_PL/basket/PLN/');if(init?.method==='POST'){assert.deepEqual(JSON.parse(String(init.body)),{stock_id:138,quantity:1});return Response.json({});}return Response.json(fixture.ebardo.cart);})(order(ebardo,4900),'00-001');assert.ok('quote'in q);assert.equal(q.quote.costGrosze,2500);
});
