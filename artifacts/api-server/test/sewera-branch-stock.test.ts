import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import test from 'node:test';
import {confirmSeweraBasket} from '../src/lib/retailer-checkouts';

// Native cart accepted one piece, displayed its price, but could not order it
// from Katowice. A displayed card stock of 37 was not this branch's stock.
// source: https://sklep.sewera.pl/naroznik-do-mokrych-tynkow-34x34mm-2-5m-profigips-p16477
const native=readFileSync(join(process.cwd(),'artifacts/api-server/test/fixtures/sewera-corner-zero-stock.html'),'utf8');
const expected=[{url:'https://sklep.sewera.pl/naroznik-do-mokrych-tynkow-34x34mm-2-5m-profigips-p16477',pid:'427185',count:1,price:573,retailUnit:'SZT' as const}];
const unavailable=/\s*<p class="text-left basket-no-product pull-left">[\s\S]*?<\/p>/;
const shortage=(html:string,maxPackages:number)=>assert.throws(()=>confirmSeweraBasket(html,expected,573),(error:any)=>{
  assert.equal(error.message,'insufficient_stock');
  assert.deepEqual(error.shortages,[{url:expected[0].url,count:1,price:573,maxPackages}]);return true;
});

test('native zero-stock row cannot confirm a priced, purchasable Sewera basket',()=>{
  shortage(native,0);
  shortage(native.replace('max="0,0000"',''),0);
  shortage(native.replace(unavailable,''),0);
});

test('native quantity maximum is enforced without relying on an optional warning',()=>{
  const available=native.replace(unavailable,'').replace('max="0,0000"','max="1,0000"');
  confirmSeweraBasket(available,expected,573);
  // Same observed template, controlled larger purchase: price and quantity
  // still agree while the branch has only one physical piece.
  const two=available.replace('value="1"','value="2"')
    .replace(/(Wartość:[\s\S]*?<ins>)5,73/,(_match,prefix)=>prefix+'11,46')
    .replace(/(class="col-md-2 col-xs-12 col-sm-12 product_cena basket-price-sewera"[\s\S]*?<ins>)5,73/,(_match,prefix)=>prefix+'11,46')
    .replace('Razem do zapłaty: <strong>5,73','Razem do zapłaty: <strong>11,46');
  assert.throws(()=>confirmSeweraBasket(two,[{...expected[0],count:2}],1146),(error:any)=>{
    assert.equal(error.message,'insufficient_stock');assert.equal(error.shortages[0].maxPackages,1);return true;
  });
});

test('conflicting availability and malformed native maxima require a new review',()=>{
  for(const html of [native.replace('max="0,0000"','max="2,0000"'),...['-1','1,5','abc','9007199254740992'].map(max=>native.replace(unavailable,'').replace('max="0,0000"',`max="${max}"`))]){
    assert.throws(()=>confirmSeweraBasket(html,expected,573),/basket_not_confirmed/);
  }
});

test('stock information cannot hide a different SKU, gross price, total or branch',()=>{
  for(const html of [native.replace('wybierz="427185"','wybierz="999"'),native.replace('5,73','5,72'),native.replace('Razem do zapłaty: <strong>5,73','Razem do zapłaty: <strong>5,74'),native.replace('Katowice','Gliwice')]){
    assert.notEqual(html,native);
    assert.throws(()=>confirmSeweraBasket(html,expected,573),/basket_not_confirmed/);
  }
});
