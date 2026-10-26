import assert from 'node:assert/strict';
import { test } from 'node:test';
import { groupUnpricedLines } from './unpricedGroups';
import { collectStoreChoices } from './storeChoice';
import type { SerializedLine, SerializedProject } from './pricingApi';

const line=(quantity=4.05):SerializedLine=>({resolved:false,quantity,unit:'l',lineCostGrosze:0,reason:'no-offer',query:{ean:'5901793357737',gtin:null,normalizedName:'grunt uniwersalny knauf 5 l',category:'primer'}});
test('one exact missing product from two jobs shows its combined quantity once without changing the server response or monetary fields',()=>{
 const stages=[{lines:[line()]},{lines:[line()]}],before=JSON.stringify(stages),groups=groupUnpricedLines(stages);
 assert.equal(groups.length,1);assert.equal(groups[0].line.quantity,8.1);assert.equal(groups[0].sourceCount,2);assert.equal(groups[0].line.resolved,false);assert.equal(groups[0].line.lineCostGrosze,0);assert.equal(groups[0].line.offers,undefined);assert.equal(JSON.stringify(stages),before);
 const data={stages,storeComparison:{productCount:6,stores:[]},deliveryComparison:{status:'partial',missingProductCount:2,best:null}} as unknown as SerializedProject;
 assert.equal(collectStoreChoices(data).unresolvedCount,1);assert.equal(data.deliveryComparison?.missingProductCount,2);assert.equal(data.deliveryComparison?.best,null);
});
test('same product appearing twice in one job is combined without claiming it came from two jobs; resolved lines remain separate from missing items',()=>{
 const groups=groupUnpricedLines([{lines:[line(2),line(3),{...line(4),resolved:true}]}]);assert.equal(groups.length,1);assert.equal(groups[0].line.quantity,5);assert.equal(groups[0].sourceCount,1);
});
test('different codes, conflicting identities, categories, quantities, units and reasons never collapse into one missing product',()=>{
 const changes=[{query:{...line().query,ean:'5905061016869'}},{query:{...line().query,gtin:'5905061016869'}},{query:{...line().query,category:'paint'}},{unit:'kg'},{unit:'pozycja'},{quantity:0},{quantity:NaN},{reason:'insufficient-stock' as const},{reason:'no-query' as const}];
 for(const change of changes)assert.equal(groupUnpricedLines([{lines:[line()]},{lines:[{...line(),...change}]}]).length,2,JSON.stringify(change));
 const generic={...line(),query:{ean:null,gtin:null,normalizedName:'grunt',category:'primer'}};assert.equal(groupUnpricedLines([{lines:[generic]},{lines:[generic]}]).length,2);
});
test('an exact catalogue name can link the same missing reference with a barcode, while an approximate name cannot',()=>{
 const named={...line(),query:{...line().query,ean:null}};assert.equal(groupUnpricedLines([{lines:[line()]},{lines:[named]}]).length,1);
 assert.equal(groupUnpricedLines([{lines:[line()]},{lines:[{...named,query:{...named.query,normalizedName:'grunt knauf'}}]}]).length,2);
});
test('fractional combined demand retains calculator precision without a floating point tail or a fabricated package count',()=>{
 const groups=groupUnpricedLines([{lines:[line(0.1)]},{lines:[line(0.2)]}]);assert.equal(groups[0].line.quantity,0.3);assert.equal(groups[0].line.packages,undefined);
 const tiny=groupUnpricedLines([{lines:[line(0.00000004)]},{lines:[line(0.00000004)]}]);assert.equal(tiny[0].line.quantity,0.00000008);
});
