import assert from 'node:assert/strict';
import {test} from 'node:test';
import {estimateStoreSelection} from './estimateStoreSelection';
import {collectStoreChoices,estimateHonoursStore} from './storeChoice';
import {collectSeenPrices} from './priceChanges';
import type {estimateProject,PricingOptions,SerializedProject} from './pricingApi';

const input=[{jobId:'room',materials:[{material:{id:'primer',name:'Primer',unit:'l',ean:'5900089218653'},quantity:6}]}];
function data(store:string,price=1000):SerializedProject{return{
 stages:[{lines:[{resolved:true,quantity:6,product:{id:'primer',name:'Primer',ean:'5900089218653',packageSize:'5',packageUnit:'l'},cheapestOffer:{store},offers:[{store,offerId:store,priceGrosze:price,packageSize:'5',unit:'l',fetchedAt:'2026-11-02T03:58:00.000Z'}],packages:[{store}]}]}],
 consolidated:{lines:[{product:{id:'primer',name:'Primer'},totalQuantity:6,unit:'l',cheapestOffer:{store},packages:[{store}]}]},
 storeComparison:{productCount:1,optimalBasketGrosze:price,stores:[{store,totalGrosze:price,coveredCount:1,missingCount:0,missingProductIds:[]}],optimalByStore:[],cheapestFullStore:store,singleStoreExtraGrosze:0},
 } as unknown as SerializedProject;}
const options:PricingOptions={store:'Chosen',region:'lodzkie',delivery:{mode:'shipping',method:'automatic',postalCode:'30-001'}};

test('selected shop and all material alternatives arrive in one request without changing input or amounts',async()=>{
 const selected=data('Chosen',1400),all=data('Alternative',1000);selected.storeChoiceComparison={stages:all.stages,consolidated:all.consolidated,storeComparison:all.storeComparison};const requests:unknown[]=[],before=JSON.stringify(input);
 const estimate:typeof estimateProject=async(jobs,opts)=>{assert.equal(jobs,input);requests.push(opts);return selected;};
 const result=await estimateStoreSelection(input,options,true,()=>true,estimate);assert(result);assert.deepEqual(requests,[{...options,includeStoreChoices:true}]);assert.equal(result.data,selected);assert(estimateHonoursStore(result.data,'Chosen'));assert.deepEqual(collectStoreChoices(result.choiceSource!),collectStoreChoices(all));assert.equal(result.data.storeComparison.optimalBasketGrosze,1400);assert.equal(JSON.stringify(input),before);
});

test('explicit refresh uses one selected-store refresh and the same request includes alternatives',async()=>{
 const selected=data('Chosen');selected.storeChoiceComparison={stages:selected.stages,consolidated:selected.consolidated,storeComparison:selected.storeComparison};let calls=0;
 await estimateStoreSelection(input,{...options,refreshPrices:true},true,()=>true,async(_jobs,opts)=>{calls++;assert.equal(opts?.refreshPrices,true);assert.equal(opts?.store,'Chosen');assert.equal(opts?.includeStoreChoices,true);return selected;});assert.equal(calls,1);
});

test('cached alternatives and automatic comparison do not request unnecessary choice metadata',async()=>{
 for(const store of ['Chosen',undefined]){const selected=data(store??'Alternative'),opts={...options,store};let calls=0;const result=await estimateStoreSelection(input,opts,false,()=>true,async(_jobs,sent)=>{calls++;assert.equal(sent?.includeStoreChoices,undefined);return selected;});assert.equal(calls,1);assert.equal(result?.choiceSource,store?undefined:selected);}
});

test('older servers keep alternatives with one bounded fallback and no repeated price refresh',async()=>{
 const selected=data('Chosen'),all=data('Alternative'),requests:PricingOptions[]=[];
 const result=await estimateStoreSelection(input,{...options,refreshPrices:true},true,()=>true,async(_jobs,opts)=>{requests.push(opts!);return requests.length===1?selected:all;});assert.equal(requests.length,2);assert.equal(requests[0].store,'Chosen');assert.equal(requests[1].store,undefined);assert.equal(requests[1].refreshPrices,false);assert.deepEqual(requests[1].delivery,options.delivery);assert.equal(result?.data,selected);assert.equal(result?.choiceSource,all);
});

test('obsolete responses do not update a result or start a legacy fallback',async()=>{
 let calls=0,active=true;const result=await estimateStoreSelection(input,options,true,()=>active,async()=>{calls++;active=false;return data('Chosen');});assert.equal(result,null);assert.equal(calls,1);
});

test('a server result from another shop is rejected before any alternative request',async()=>{
 let calls=0;await assert.rejects(estimateStoreSelection(input,options,true,()=>true,async()=>{calls++;return data('Other');}),/store_selection_not_confirmed/);assert.equal(calls,1);
});

test('alternative metadata does not create seen prices or price-change baselines for another shop',()=>{
 const selected=data('Chosen',1400),all=data('Alternative',1000);selected.storeChoiceComparison={stages:all.stages,consolidated:all.consolidated,storeComparison:all.storeComparison};const seen=collectSeenPrices(selected);assert.deepEqual(Object.values(seen.offers).map(p=>[p.store,p.priceGrosze]),[['Chosen',1400]]);
});
