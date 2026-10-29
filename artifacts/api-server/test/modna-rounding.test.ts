import assert from 'node:assert/strict';
import {test} from 'node:test';
import cart from './fixtures/modna-tile-cart.json';
import cards from './fixtures/modna-tile-colours.json';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {confirmModnaCart,quoteModna} from '../src/lib/modna-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';

const source=RETAIL_SOURCES.find(s=>s.id==='modna-paradyz-u117-light-grey-143m2')!;
const expected=[{id:34155,name:source.name,url:source.url,size:1.43,count:9,price:10729,squareMeterPriceGrosze:7503}];
test('real nine-pack cart binds exact m² line965.63 and separately discloses2gr pack-rounding difference',()=>{
 const q=confirmModnaCart(cart.cart,cart.order,expected,96561);assert.equal(q.costGrosze,22900);assert.equal(q.materialsRoundingGrosze,2);assert.equal(96561+q.materialsRoundingGrosze+q.costGrosze,119463);
 const seventeen=confirmModnaCart(cart.cart17,cart.order,[{...expected[0],count:17}],182393);assert.equal(seventeen.materialsRoundingGrosze,5);assert.equal(182393+seventeen.materialsRoundingGrosze,182398);assert.equal(seventeen.costGrosze,22900);
 for(const amount of ['965,55','965,67','966,63'])assert.throws(()=>confirmModnaCart(cart.cart.replaceAll('965,63',amount),cart.order,expected,96561));
 assert.throws(()=>confirmModnaCart(cart.cart.replace('965,63','965,62'),cart.order,expected,96561));
 assert.throws(()=>confirmModnaCart(cart.cart,cart.order,[{...expected[0],squareMeterPriceGrosze:7603}],96561));assert.throws(()=>confirmModnaCart(cart.cart,cart.order,expected,96560));
});
test('anonymous quoter derives rounding only from primary m² price and cart, without changing freight or pack prices',async()=>{
 const basket:DeliveredStoreBasket={store:source.store,materialsGrosze:96561,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:source.ean,name:source.name,imageUrl:null},unit:'m2',packages:[{offerId:source.id,store:source.store,packageSize:1.43,count:9,unitPriceGrosze:10729,lineCostGrosze:96561,url:source.url}]}]},before=JSON.stringify(basket),calls:string[]=[];
 const fetcher:typeof fetch=async(input,init)=>{const path=new URL(String(input)).pathname;calls.push((init?.method??'GET')+' '+path);if(path===new URL(source.url).pathname)return new Response(cards[0].html);if(path==='/cart_edit'){assert.equal(init?.method,'POST');assert.equal(new URLSearchParams(String(init?.body)).get('cart_quantity_real_unit_34155'),'12.87');return new Response('{}');}if(path==='/cart/')return new Response(cart.cart);if(path==='/order/')return new Response(cart.order);throw Error('unreviewed route');};
 const q=(await quoteModna(basket,fetcher)).quote;assert.equal(q.materialsRoundingGrosze,2);assert.equal(q.costGrosze,22900);assert.equal(JSON.stringify(basket),before);assert.equal(calls.length,4);
});
