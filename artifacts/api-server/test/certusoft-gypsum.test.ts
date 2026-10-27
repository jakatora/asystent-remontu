import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/certusoft-gypsum.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {parseRetailPage} from '../src/lib/retail-pages';
import {readCertusoftProduct} from '../src/lib/certusoft-product';
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
const source=(i=0)=>RETAIL_SOURCES.find(s=>s.id===fixture[i].sourceId)!;
const page=(i=0,state:any=fixture[i].state,primary=fixture[i].primary)=>'<script>window.__INITIAL_STATE__='+JSON.stringify(state)+';(function(){var s;}());</script>'+primary;
test('real HIPPER gypsum cards distinguish one 25m roll from a carton and one connector from 100-piece carton',()=>{
 for(const [i,price,stock]of [[0,1099,243],[1,309,1344]]){const s=source(i),o=parseRetailPage(page(i),s,new Date());assert.equal(o.priceGrosze,price);assert.equal(o.stockPackages,stock);assert.equal(o.ean,s.ean);}
 assert.equal(source(0).packageSize,25);assert.equal(source(0).apiPurchaseUnit,'szt');assert.equal(source(1).packageSize,1);
 for(const patch of [{packageSize:1},{packageSize:1000},{apiPurchaseUnit:'m'},{retailerUnitId:2682507570},{ean:'5907651699933'},{purchaseMultiple:40}])assert.throws(()=>readCertusoftProduct(page(),{...source(),...patch}));
});
test('HIPPER keeps EAN, physical unit, exact gross price and explicit package stock guards',()=>{
 for(const mutate of [(r:any)=>{r.qStockAv=0},(r:any)=>{r.quantityUnits=0.5},(r:any)=>{r.stockUnit='m'},(r:any)=>{r.csItemsUnitsId++},(r:any)=>{r.cUnitPriceADis=0.73}]){const state=clone(fixture[0].state);mutate(state.csAppWindowsUtils.csAppWindows.csB2BItemCard.dataSets.itemCard.rows[0]);assert.throws(()=>readCertusoftProduct(page(0,state),source()));}
 const state=clone(fixture[1].state),row=state.csAppWindowsUtils.csAppWindows.csB2BItemCard.dataSets.itemCard.rows[0];row.itemName=row.itemName.replace('  ',' ');assert.equal(readCertusoftProduct(page(1,state),source(1)).priceGrosze,309);row.itemName='Inny łącznik';assert.throws(()=>readCertusoftProduct(page(1,state),source(1)));
});
