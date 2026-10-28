import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/leroy-ud30-super-c3.json' with {type:'json'};
import {observeLeroyBrowser,type LeroyProductSnapshot,type LeroyCartSnapshot} from '../src/lib/leroy-browser-observation';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {createRemontService} from '../src/shared-backend';
const source=RETAIL_SOURCES.find(s=>s.id===fixture.sourceId)!;
function current(){const snapshot=structuredClone(fixture.snapshot) as LeroyProductSnapshot,cart=structuredClone(fixture.cart) as LeroyCartSnapshot;snapshot.capturedAt=cart.capturedAt=new Date().toISOString();return{snapshot,cart};}
test('current UD30 SUPER C3 barcode binds the native whole three-metre profile and accepted cart, leaving old C2 distinct',()=>{
 const {snapshot,cart}=current(),o=observeLeroyBrowser(snapshot,cart,source);assert.equal(o.ean,'5907651691197');assert.equal(o.priceGrosze,1119);assert.equal(o.stockPackages,undefined);
 const old=RETAIL_SOURCES.find(s=>s.id==='leroy-norgips-ud30-06-3m')!;assert.throws(()=>observeLeroyBrowser({...snapshot,ean:old.ean},cart,old),/identity_not_confirmed/);
 const wrong=structuredClone(snapshot),p=JSON.parse(wrong.schemas[0]);p.gtin=old.ean;wrong.schemas[0]=JSON.stringify(p);assert.throws(()=>observeLeroyBrowser(wrong,cart,source),/identity_not_confirmed/);
 const thin=structuredClone(snapshot);for(const table of thin.tables??[])for(const row of table)if(row[0]==='Grubość (w mm)')row[1]='0.5';assert.throws(()=>observeLeroyBrowser(thin,cart,source),/package_not_confirmed/);
});
test('actual HTTP combines C3 perimeter demand before buying profiles, refuses an old C2 match and unconfirmed pickup',async()=>{
 const {snapshot,cart}=current(),o=observeLeroyBrowser(snapshot,cart,source),service=createRemontService({initialObservations:[o],background:false,basketQuoter:async()=>({reason:'retailer_access_required'})});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const post=async(ean:string,mode='shipping')=>{const r=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[7.7,7.7].map((quantity,i)=>({jobId:'ceiling-'+i,materials:[{material:{id:'profile-ud',name:'Profil Norgips UD30 SUPER C3',ean,category:'drywall-accessory',unit:'mb'},quantity}]})),options:{store:'Leroy Merlin',delivery:{mode,postalCode:'00-001'}}})});assert.equal(r.status,200);return r.json();};
  const result=await post(source.ean),line=result.consolidated.lines[0];assert.equal(line.totalQuantity,15.4);assert.equal(line.packages[0].count,6);assert.equal(line.lineCostGrosze,6714);assert.equal(result.deliveryComparison.best,null);
  assert.ok((await post('5907651698905')).stages.every((s:any)=>s.lines.every((l:any)=>!l.resolved)));const pickup=await post(source.ean,'pickup');assert.equal(pickup.deliveryComparison.best,null);assert.ok(pickup.coverage.pickupConfirmationStores.includes('Leroy Merlin'));
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});
