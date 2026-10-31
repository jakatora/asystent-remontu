import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {RETAIL_SOURCES} from './retail-catalog';
import {parseRetailPage} from './retail-pages';
import {isReviewedSeweraDispatchSource} from './retail-sku';
const source=RETAIL_SOURCES.find(s=>s.id==='sewera-osakryl-4kg')!;
const html=fs.readFileSync(new URL('./fixtures/sewera-osakryl4.html',import.meta.url),'utf8');
test('Osakryl is one 4 kg bucket with its exact EAN and reviewed branch, not generic chain-wide availability',()=>{
 const p=parseRetailPage(html,source,new Date());assert.equal(p.priceGrosze,5545);assert.equal(p.ean,'5903518039515');assert.equal(isReviewedSeweraDispatchSource(source),true);
 for(const changed of [{...source,packageSize:5},{...source,unit:'l'},{...source,ean:'5903518039508'},{...source,dispatchDepartment:{id:'1',name:'Katowice'}},{...source,dispatchDepartment:{id:'4',name:'Sosnowiec'}}])assert.equal(isReviewedSeweraDispatchSource(changed),false);
 assert.throws(()=>parseRetailPage(html.replaceAll('5903518039515','5903518039508'),source,new Date()));
});
