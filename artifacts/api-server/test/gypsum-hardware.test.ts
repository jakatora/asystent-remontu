import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/gypsum-hardware.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {parseRetailPage} from '../src/lib/retail-pages';
import {AnonymousShop} from '../src/lib/retailer-http';
test('captured primary hardware cards agree on exact barcode, full carton, gross price and native op unit',()=>{
 for(const row of fixture){const source=RETAIL_SOURCES.find(s=>s.id===row.sourceId)!;assert.ok(source);const price=parseRetailPage(row.html,source,new Date('2026-10-27T06:39:00Z'));assert.equal(price.priceGrosze,row.priceGrosze);assert.equal(price.ean,source.ean);assert.equal(source.packageSize,source.id.includes('fx06')?200:1000);assert.equal(source.unit,'szt');if(source.store==='ABUD')assert.equal(source.apiPurchaseUnit,'op.');assert.throws(()=>parseRetailPage(row.html.replaceAll(source.ean,'1234567890128'),source,new Date()));}
});
test('a changed physical carton count cannot be reinterpreted as the old pack',()=>{
 for(const row of fixture){const source=RETAIL_SOURCES.find(s=>s.id===row.sourceId)!;const changed=row.html.replaceAll(String(source.packageSize),String(source.packageSize/10));assert.throws(()=>parseRetailPage(changed,source,new Date()));}
});
test('anonymous ABUD adds only the three reviewed carton IDs and exact pack counts, without customer/order fields',async()=>{
 const calls:{id:number;count:number}[]=[];const fetcher:typeof fetch=async(url,init)=>{assert.equal(String(url),'https://www.abud.pl/basketchange.php');const body=new URLSearchParams(String(init?.body));assert.deepEqual([...body.keys()],['getAjax','mode','product','size','number']);calls.push({id:Number(body.get('product')),count:Number(body.get('number'))});return Response.json({});};const client=new AnonymousShop('https://www.abud.pl',fetcher,AbortSignal.timeout(2000));
 for(const id of [1456,63463,1452])await client.abud('add',{productId:id,count:1});assert.deepEqual(calls,[{id:1456,count:1},{id:63463,count:1},{id:1452,count:1}]);
 for(const args of [{productId:1477,count:1},{productId:52482,count:1},{productId:1456,count:0},{productId:1456,count:0.5},{productId:1456,count:1,postalCode:'00-001'}])await assert.rejects(client.abud('add',args),/invalid_cart_action/);assert.equal(calls.length,3);
});
