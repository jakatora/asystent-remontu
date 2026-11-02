import assert from 'node:assert/strict';
import {test} from 'node:test';
import {REVIEWED_PACKAGE_FAMILIES,MAPEGUM_WPS_FAMILY,MAPEGUM_WPS_FAMILY_NAME} from '../../../../lib/pricing-service/src/reviewed-package-families';
import {normalizeProductName} from '../../../../lib/db/src/repositories/helpers';
import {groupUnpricedLines,unpricedPackageFamily} from './unpricedGroups';
import {unpricedReference} from './unpricedReference';
import {collectStoreChoices} from './storeChoice';
import type {SerializedLine,SerializedProject} from './pricingApi';
const line=(quantity=6.6):SerializedLine=>({resolved:false,quantity,unit:'kg',lineCostGrosze:0,reason:'no-offer',query:{ean:null,gtin:null,normalizedName:normalizeProductName(MAPEGUM_WPS_FAMILY_NAME),category:'waterproofing',packageFamily:MAPEGUM_WPS_FAMILY}});

test('three missing opted-in membrane requirements show 19.8 kg once and one primer without inventing a full basket',()=>{
 const primer:SerializedLine={resolved:false,quantity:1,unit:'l',lineCostGrosze:0,reason:'no-offer',query:{ean:'8022452241123',gtin:null,normalizedName:'mapei primer g pro koncentrat gruntujacy 1 l',category:'primer'}};
 const stages=[{lines:[line(),primer]},{lines:[line(),primer]},{lines:[line(),primer]}],original=JSON.stringify(stages),groups=groupUnpricedLines(stages);
 assert.equal(groups.length,2);assert.equal(groups[0].line.quantity,19.8);assert.equal(groups[1].line.quantity,3);assert(groups.every(g=>g.sourceCount===3&&g.line.resolved===false&&g.line.lineCostGrosze===0&&g.line.offers===undefined&&g.line.packages===undefined));assert.equal(JSON.stringify(stages),original);
 const data={stages,storeComparison:{productCount:5,stores:[]},deliveryComparison:{status:'partial',missingProductCount:6,best:null}} as unknown as SerializedProject;
 assert.equal(collectStoreChoices(data).unresolvedCount,2);assert.equal(data.deliveryComparison?.missingProductCount,6);assert.equal(data.deliveryComparison?.best,null);
});

test('each reviewed family keeps its own raw unit and readable product name without selecting a bucket or shop',()=>{
 for(const f of REVIEWED_PACKAGE_FAMILIES){const l:SerializedLine={...line(1.25),unit:f.unit,query:{ean:null,gtin:null,normalizedName:normalizeProductName(f.name),category:f.category,packageFamily:f.key}},groups=groupUnpricedLines([{lines:[l]},{lines:[l]}]);assert.equal(groups.length,1,f.key);assert.equal(groups[0].line.quantity,2.5);assert.equal(groups[0].sourceCount,2);assert.equal(unpricedPackageFamily(l)?.name,f.name);assert.equal(unpricedReference(l),null);assert.equal(groups[0].line.product,undefined);}
 const all=REVIEWED_PACKAGE_FAMILIES.map(f=>({...line(),unit:f.unit,query:{ean:null,gtin:null,normalizedName:normalizeProductName(f.name),category:f.category,packageFamily:f.key}}));assert.equal(groupUnpricedLines([{lines:all}]).length,all.length);
});

test('a family key never overrides a barcode, product, changed name/category/unit or unknown key',()=>{
 const changes=[{query:{...line().query,ean:'8022452242489'}},{query:{...line().query,gtin:'8022452242489'}},{query:{...line().query,normalizedName:'mapegum wps'}},{query:{...line().query,category:'primer'}},{query:{...line().query,packageFamily:'unknown-family' as any}},{query:{...line().query,packageFamily:undefined}},{unit:'l'},{product:{id:'unrelated',name:'Unrelated',ean:null,gtin:null,category:'waterproofing',packageSize:'3',packageUnit:'kg'}}];
 for(const change of changes){const changed={...line(),...change};assert.equal(unpricedPackageFamily(changed),null,JSON.stringify(change));assert.equal(groupUnpricedLines([{lines:[line()]},{lines:[changed]}]).length,2);}
 const exact={...line(),query:{ean:'8022452242489',gtin:null,category:'waterproofing',normalizedName:'mapei mapegum wps folia w plynie 5 kg 124805pl'}};assert.equal(groupUnpricedLines([{lines:[line()]},{lines:[exact]}]).length,2);
});

test('unknown quantities and different unresolved reasons stay separate while resolved family lines remain outside missing items',()=>{
 for(const change of [{quantity:0},{quantity:-1},{quantity:NaN},{quantity:Infinity},{unit:'pozycja'},{reason:'no-query' as const},{reason:'insufficient-stock' as const}])assert.equal(groupUnpricedLines([{lines:[line()]},{lines:[{...line(),...change}]}]).length,2);
 const groups=groupUnpricedLines([{lines:[line(),{...line(),resolved:true}]}]);assert.equal(groups.length,1);assert.equal(groups[0].line.quantity,6.6);assert.equal(groups[0].sourceCount,1);
});

test('contradictory family metadata cannot borrow a known individual-product reference or its photograph',()=>{
 const coded={...line(),query:{...line().query,ean:'8022452242489',normalizedName:'mapei mapegum wps folia w plynie 5 kg 124805pl'}};assert.equal(unpricedReference(coded),null);assert.equal(unpricedPackageFamily(coded),null);
 const two=groupUnpricedLines([{lines:[coded]},{lines:[coded]}]);assert.equal(two.length,2);assert(two.every(g=>g.line.query.ean==='8022452242489'&&g.line.resolved===false));
});
