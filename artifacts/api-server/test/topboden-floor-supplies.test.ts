import assert from 'node:assert/strict';
import {test} from 'node:test';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {confirmTopbodenProduct} from '../src/lib/topboden-product';
const foil=RETAIL_SOURCES.find(s=>s.id==='topboden-aquaprotec-vapour-10m2')!,tape=RETAIL_SOURCES.find(s=>s.id==='topboden-arbiton-izo-floor-tape-25m')!;
function product(source:typeof foil){const area=source.id===foil.id;return{uuid:source.productUuid,ean:source.ean,name:source.name,brand:{name:'Arbiton'},data:{logisticData:{ean:source.ean}},available:true,baseUnitStock:area?20:2,units:{basicUnit:source.apiPurchaseUnit,priceListUnit:source.apiPurchaseUnit,orderUnit:'szt.',numerator:area?10:1,denominator:1,multiple:1,minOrderQuantity:1},price:{isDiscount:false,discountValue:0,grossPrice:area?490:2891,packageGrossPrice:area?4900:2891,discountNetPrice:null,discountGrossPrice:null,discountPackageNetPrice:null,discountPackageGrossPrice:null},promotionCode:{code:'EXTRA20',discount:'20',freeProductsMessage:null},images:[{category:'Packshot',resized:{gallery:{webp:'/photos/'+source.ean+'_P_01.webp'}}}]};}
test('reviewed floor foil is one10m² roll at49PLN, while tape is one25m roll at28.91PLN',()=>{
 assert.equal(confirmTopbodenProduct(product(foil),foil,2).priceGrosze,4900);assert.equal(confirmTopbodenProduct(product(tape),tape,2).priceGrosze,2891);
 assert.throws(()=>confirmTopbodenProduct(product(foil),foil,3),/insufficient_stock/);assert.throws(()=>confirmTopbodenProduct(product(tape),tape,3),/insufficient_stock/);
});
test('ordinary pinned price never imports the optional discount or accepts a changed package, unit or barcode',()=>{
 for(const source of [foil,tape]){const p=product(source);for(const patch of [{ean:'5905167875230'},{units:{...p.units,numerator:15}},{units:{...p.units,priceListUnit:'m2'}},{price:{...p.price,grossPrice:p.price.grossPrice-1}},{promotionCode:{...p.promotionCode,code:'OTHER'}},{price:{...p.price,isDiscount:true,discountPackageGrossPrice:3920}},{promotionCode:{...p.promotionCode,freeProductsMessage:'gift'}}])assert.throws(()=>confirmTopbodenProduct({...p,...patch},source));
 assert.throws(()=>confirmTopbodenProduct(p,{...source,packageSize:source.packageSize+1}),/package_not_confirmed/);}
});
test('coupon exception is limited to these exact reviewed sources and permits no coupon-dependent amount',()=>{
 const p=product(foil);assert.throws(()=>confirmTopbodenProduct(p,{...foil,id:'unreviewed-foil'}));assert.equal(confirmTopbodenProduct({...p,promotionCode:null},foil).priceGrosze,4900);
});
