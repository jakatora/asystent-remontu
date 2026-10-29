import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import seed from '../../../deploy/shared-backend/verified-offers.json' with {type:'json'};
import { createRemontService } from '../src/shared-backend';
import type { RetailObservation } from '../src/lib/retail-pages';
import { calculatorEngine } from '../../mobile/features/calculator/engine';
import { getJobById } from '../../mobile/features/content/registry';
import { toPricingStageInput } from '../../mobile/features/pricing/pricingApi';

test('real Express HTTP carries the mobile family through schema, exact EAN resolution, mixed packages and native-cart identities',async()=>{
  const calls:any[]=[];
  const service=createRemontService({initialObservations:seed.filter(o=>o.sourceId.startsWith('rabdom-v33-easy-kitchen-white-'))as RetailObservation[],background:false,basketQuoter:async(order,postalCode)=>{
    calls.push(structuredClone(order));assert.equal(postalCode,'00-001');assert.equal(order.store,'Rab-Dom');assert.ok(order.lines.every(l=>/^remont-3153895149/.test(l.product.id)));
    return{quote:{costGrosze:order.lines.some(l=>l.packages.some(p=>p.packageSize===2000&&p.count>1))?1799:1050,carrier:'Simulated native-cart test',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://www.rabdom.pl/pl/basket',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}};
  }});
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
  const m={cabinetSurface:2,cabinetPaintPack:3,cabinetArea:15,cabinetPreparation:1,cabinetCoats:2,cabinetCoverage:12,cabinetReservePercent:10};
  try{
    const stage=toPricingStageInput(calculatorEngine.calculate(getJobById('kitchen-cabinet-paint')!,m));
    const post=async(jobs:any[])=>fetch(`http://127.0.0.1:${(server.address()as any).port}/pricing/project`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs,options:{delivery:{mode:'shipping',postalCode:'00-001'}}})});
    const r=await post([stage]);assert.equal(r.status,200);const data=await r.json();assert.equal(data.deliveryComparison.best.totalGrosze,27119);assert.equal(data.consolidated.lines.length,1);assert.equal(data.consolidated.lines[0].product.ean,null);assert.deepEqual(data.consolidated.lines[0].packages.map((p:any)=>p.product.ean),['3153895149228','3153895149044']);assert.ok(calls.some(o=>o.lines.length===2));
    const small=toPricingStageInput(calculatorEngine.calculate(getJobById('kitchen-cabinet-paint')!,{...m,cabinetArea:5})),two=await(await post([small,small])).json();assert.equal(two.deliveryComparison.best.totalGrosze,18578);assert.equal(two.consolidated.lines[0].packagesNeeded,1);
    const invalid=structuredClone(stage);invalid.materials[0].material.ean='3153895149044';const bad=await(await post([invalid])).json();assert.equal(bad.deliveryComparison.best,null);
    const high=structuredClone(stage);high.materials[0].quantity=100001;assert.equal((await post([high])).status,200);
    high.materials[0].quantity=2000001;assert.equal((await post([high])).status,400);
    const ordinary={jobId:'paint-walls',materials:[{material:{id:'paint',name:'ordinary',unit:'ml'},quantity:100001}]};assert.equal((await post([ordinary])).status,400);
  }finally{service.close();await new Promise<void>(r=>server.close(()=>r()));}
});
