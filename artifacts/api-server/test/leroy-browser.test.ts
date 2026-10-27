import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/leroy-browser.json' with {type:'json'};
import {observeLeroyBrowser,isLeroyBrowserSource,type LeroyProductSnapshot,type LeroyCartSnapshot} from '../src/lib/leroy-browser-observation';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {createRemontService} from '../src/shared-backend';
import {knownUnavailableRetailers} from '../src/lib/retailer-delivery';
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
const source=(i=0)=>RETAIL_SOURCES.find(s=>s.id===fixture.products[i].sourceId)!;
function fresh(i=0){const snapshot=clone(fixture.products[i].snapshot) as LeroyProductSnapshot,cart=clone(fixture.cart) as LeroyCartSnapshot;const now=new Date().toISOString();snapshot.capturedAt=cart.capturedAt=now;return {snapshot,cart};}
test('eight actual Leroy cards and anonymous cart confirm full rolls, profiles, piece and board prices',()=>{
 const amounts=[5499,5199,3649,2999,2799,1119,199,3028];
 for(let i=0;i<8;i++){const {snapshot,cart}=fresh(i),s=source(i),o=observeLeroyBrowser(snapshot,cart,s);assert.ok(isLeroyBrowserSource(s));assert.equal(o.priceGrosze,amounts[i]);assert.equal(o.stockPackages,undefined);assert.equal(o.ean,s.ean);assert.equal(Date.parse(o.verification!.expiresAt)-Date.parse(o.observedAt),86400000);}
});
test('Leroy source allowlist rejects wrong EAN, pack, dimensions, SKU, seller or branch claim',()=>{
 for(const patch of [{ean:'5907651698165'},{packageSize:1},{unit:'szt'},{retailerSku:'12345678'},{pickupRequiresConfirmation:false},{store:'Leroy Merlin Warszawa'},{url:source().url+'?x=1'}])assert.equal(isLeroyBrowserSource({...source(),...patch}),false);
 const {snapshot,cart}=fresh();snapshot.tables![0].find(r=>r[0]==='Długość (w m)')![1]='25';assert.throws(()=>observeLeroyBrowser(snapshot,cart,source()),/package_not_confirmed/);
});
test('Leroy online-only schema needs accepted cart and whole-piece gross price, never per-metre price',()=>{
 const {snapshot,cart}=fresh();
 for(const transform of [(a:string)=>a.replace('Nr ref.  43912694','Nr ref.  12345678'),(a:string)=>a.replace('text 54.99 zł','text 0.73 zł'),(a:string)=>a.replace('Wartość brutto 248.59 zł','Wartość brutto 1.00 zł'),(a:string)=>a.replace('Wprowadź ilość, Value: 1,','Wprowadź ilość, Value: 2,')])assert.throws(()=>observeLeroyBrowser(snapshot,{...cart,axState:transform(cart.axState)},source()));
 assert.throws(()=>observeLeroyBrowser({...snapshot,axState:snapshot.axState.replace('Sprzedany 54,99 zł za szt.','Sprzedany 0,73 zł za szt.')},cart,source()),/purchase_unit_not_confirmed/);
 assert.throws(()=>observeLeroyBrowser({...snapshot,domHeading:'Inny produkt'},cart,source()),/gross_price_mismatch/);
 const changed=clone(snapshot),p=JSON.parse(changed.schemas[0]);p.gtin='5907651699926';changed.schemas[0]=JSON.stringify(p);assert.throws(()=>observeLeroyBrowser(changed,cart,source()),/identity_not_confirmed/);
});
test('Leroy cart can hold two complete rolls if quantity, line and subtotal agree in grosze',()=>{
 const {snapshot,cart}=fresh();cart.axState=cart.axState.replace('Wprowadź ilość, Value: 1,','Wprowadź ilość, Value: 2,').replace('text 54.99 zł','text 109.98 zł').replace('Wartość brutto 248.59 zł','Wartość brutto 303.58 zł');assert.equal(observeLeroyBrowser(snapshot,cart,source()).priceGrosze,5499);
});
test('both browser reads expire; cache cannot strip verification, extend expiry or invent stock',()=>{
 const {snapshot,cart}=fresh(),s=source(),o=observeLeroyBrowser(snapshot,cart,s);
 for(const target of ['snapshot','cart'] as const){const pair=fresh();pair[target].capturedAt=new Date(Date.now()-86400001).toISOString();assert.throws(()=>observeLeroyBrowser(pair.snapshot,pair.cart,s),/not_current/);pair[target].capturedAt=new Date(Date.now()+600000).toISOString();assert.throws(()=>observeLeroyBrowser(pair.snapshot,pair.cart,s),/not_current/);}
 for(const row of [{...o,verification:undefined},{...o,stockPackages:100},{...o,verification:{...o.verification!,expiresAt:new Date(Date.now()+7*86400000).toISOString()}}]){const service=createRemontService({initialObservations:[row],background:false});try{assert.equal(service.status().offers,0);}finally{service.close();}}
 const service=createRemontService({initialObservations:[o],background:false});try{assert.equal(service.status().offers,1);}finally{service.close();}
});
test('Leroy has explicit operator-refresh status and unconfirmed delivery, despite native freight teaser',async()=>{
 let fetched=false;await assert.rejects(readRetailSource(source(),async()=>{fetched=true;throw Error('unexpected');}),/browser_refresh_required/);assert.equal(fetched,false);assert.equal(knownUnavailableRetailers()['Leroy Merlin'],'retailer_access_required');
});
