import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PAINTING_TAPE_SOURCES,confirmPaintingTapePurchase,reviewedPaintingTape} from './painting-tapes';
import {confirmShoperPurchaseUnit,parseRetailPage} from './retail-pages';

for(const source of PAINTING_TAPE_SOURCES.filter(s=>s.store==='Rab-Dom'))test(`one native piece is the reviewed ${source.id} 50 m roll`,()=>{
  const item={id:source.productId,ean:source.ean,name:source.name,code:source.retailerSku,url:source.url,producer:{id:42,name:'Blue Dolphin'},unit:{name:'szt.',floating_point:false},package:'0'};
  assert.equal(confirmPaintingTapePurchase(item,source),true);assert.doesNotThrow(()=>confirmShoperPurchaseUnit(item,source));
  for(const patch of [{ean:'5907758515952'},{name:source.name.replace('50m','50yd')},{unit:{name:'mb',floating_point:true}},{package:'24'},{producer:{id:42,name:'SILA'}},{code:'different-roll'}]){
    assert.throws(()=>confirmShoperPurchaseUnit({...item,...patch},source),/product_package_not_confirmed/);
  }
});

test('a reviewed tape never becomes a different width, roll length, minimum or carton by changing metadata',()=>{
  assert.equal(PAINTING_TAPE_SOURCES.length,8);
  for(const source of PAINTING_TAPE_SOURCES){
    assert.equal(reviewedPaintingTape(source),source);
    for(const patch of [{packageSize:45.72},{unit:'szt'},{packageSize:1200},{purchaseMultiple:24},{minimumPackages:12},{variant:['30mm','50m']}]){
      assert.throws(()=>reviewedPaintingTape({...source,...patch}),/product_package_not_confirmed/);
      assert.throws(()=>parseRetailPage('',{...source,...patch},new Date()),/product_package_not_confirmed/);
    }
  }
});
