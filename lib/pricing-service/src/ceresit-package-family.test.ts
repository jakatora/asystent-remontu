import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product} from '@workspace/db/repositories';
import type {PurchaseOffer} from './types';
import {estimateStageCost,estimateProjectCost,type EstimateDeps} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';
import {CT17_PROFI_FAMILY,CT17_TRANSPARENT_FAMILY,REVIEWED_PACKAGE_FAMILIES,reviewedPackageFamily} from './reviewed-package-families';

const families=REVIEWED_PACKAGE_FAMILIES.filter(f=>f.key===CT17_PROFI_FAMILY||f.key===CT17_TRANSPARENT_FAMILY);
const prices:Record<string,number>={'5900089617050':5064,'5900089617081':9199,'5900089218653':4315,'5900089218677':8448};
const products=families.flatMap(f=>f.packs.map(pack=>({id:'p-'+pack.ean,ean:pack.ean,gtin:null,name:f.name+' '+pack.size+' l',category:'primer',packageSize:String(pack.size),packageUnit:'l',imageUrl:'https://example.org/'+pack.ean+'.webp'} as Product)));
const offers=products.map(p=>({id:'o-'+p.ean,productId:p.id,store:'Test store',price:(prices[p.ean!]/100).toFixed(2),packageSize:p.packageSize,unit:'l',availability:'in_stock',fetchedAt:new Date(),source:'test',productUrl:'https://example.org/'+p.ean} as PurchaseOffer));
const deps:EstimateDeps={findProductByCode:async(_db,q)=>products.find(p=>p.ean===q.ean)??null,findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>offers.filter(o=>o.productId===id)};
const query=(key:string)=>{const f=families.find(f=>f.key===key)!;return{packageFamily:f.key,normalizedName:f.name,category:'primer'};};
const stage=(key:string,quantity:number,patch:Partial<EstimateDeps>={},ean?:string)=>estimateStageCost({} as Database,[{query:ean?{ean}:query(key),quantity,unit:'l'}],{}, {...deps,...patch});

test('both Ceresit families agree with an independent whole-can search at boundaries and tiny positive demand',async()=>{
  for(const f of families)for(const required of [1e-8,0.1,4.9,5,5.00001,6,10,10.00001,11,12,15,21]){
    let expected=Infinity;for(let a=0;a<=6;a++)for(let b=0;b<=4;b++)if(a*5+b*10>=required)expected=Math.min(expected,a*prices[f.packs[0].ean]+b*prices[f.packs[1].ean]);
    const result=await stage(f.key,required),line=result.lines[0];assert.equal(line.resolved,true);assert.equal(line.lineCost,expected,f.key+' '+required);
    assert.ok(line.packagePlan!.packages.every(pack=>f.packs.some(p=>p.ean===pack.product!.ean&&p.size===pack.packageSize)));
  }
});
test('raw litres merge across rooms within one family while PROFI and Transparent never merge',async()=>{
  for(const f of families){const result=estimateProjectCost([await stage(f.key,6),await stage(f.key,6)]);assert.equal(result.consolidated.lines.length,1);const line=result.consolidated.lines[0];assert.equal(line.totalQuantity,12);assert.equal(line.packagePlan!.totalGrosze,prices[f.packs[0].ean]+prices[f.packs[1].ean]);assert.deepEqual(line.packagePlan!.packages.map(p=>[p.packageSize,p.count]).sort((a,b)=>a[0]-b[0]),[[5,1],[10,1]]);}
  const separate=estimateProjectCost([await stage(CT17_PROFI_FAMILY,6),await stage(CT17_TRANSPARENT_FAMILY,6)]);assert.equal(separate.consolidated.lines.length,2);assert.equal(separate.consolidated.consolidatedTotalGrosze,9199+8448);
});
test('contradictory names, barcodes, categories and units cannot opt into another Ceresit family',async()=>{
  for(const f of families){const other=families.find(o=>o.key!==f.key)!;for(const [q,unit]of [[{...query(f.key),normalizedName:other.name},'l'],[{...query(f.key),ean:f.packs[0].ean},'l'],[{...query(f.key),gtin:f.packs[0].ean},'l'],[{...query(f.key),category:'waterproofing'},'l'],[query(f.key),'kg'],[query(f.key),'ml']] as const){assert.equal(reviewedPackageFamily(q,unit),undefined);assert.equal((await estimateStageCost({} as Database,[{query:q,quantity:6,unit}],{},deps)).lines[0].resolved,false);}}
});
test('incorrect member metadata and finite stock cannot create a free or duplicated Ceresit supply',async()=>{
  for(const f of families){for(const patch of [{packageUnit:'kg'},{category:'paint'},{packageSize:'100'}]){const wrong={findProductByCode:async(_db:Database,q:{ean?:string})=>{const p=products.find(p=>p.ean===q.ean);return p?{...p,...patch}:null;}};assert.equal((await stage(f.key,6,wrong)).lines[0].resolved,false);}
    const limited={listOffers:async(_db:Database,id:string)=>offers.filter(o=>o.productId===id).map(o=>({...o,maxPackages:1}))};const result=estimateProjectCost([await stage(f.key,8,limited),await stage(f.key,8,limited)]);assert.ok(result.stages.flatMap(s=>s.lines).some(l=>!l.resolved));}
});
test('a more expensive can plan can win with actual basket shipping and preserves the chosen fixed-size demand',async()=>{
  for(const f of families){const result=await compareAutomaticDelivery([await stage(f.key,6)],{mode:'shipping',postalCode:'30-001'},async order=>({quote:{costGrosze:order.lines.some(l=>l.packages.some(p=>p.packageSize===10))?100000:1000,carrier:'Simulated test courier',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.org/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}}));assert.equal(result.best!.totalGrosze,2*prices[f.packs[0].ean]+1000);assert.equal(result.best!.stores[0].lines[0].product.id,'p-'+f.packs[0].ean);
    const fixed=estimateProjectCost([await stage(f.key,6,{},f.packs[0].ean),await stage(f.key,1)]).consolidated.lines[0].packagePlan!;assert.deepEqual(fixed.packages.map(p=>[p.packageSize,p.count]),[[5,2]]);}
});
