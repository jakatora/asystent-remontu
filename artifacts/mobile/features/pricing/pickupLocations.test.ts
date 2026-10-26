import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PICKUP_LOCATIONS,approximateDistanceKm,createPostalPlaceLookup,normalizePickupPostcode,parsePostalPlace,pickupAddressMapUrl,pickupLocationsFor,rankPickupLocations,type PostalPlace} from './pickupLocations';

const katowice:PostalPlace={postalCode:'40-001',name:'Katowice',latitude:50.2667,longitude:19.0167};
const response=(code='40-001')=>({'country abbreviation':'PL','post code':code,places:[{'place name':katowice.name,latitude:String(katowice.latitude),longitude:String(katowice.longitude)}]});

test('pickup directory contains actual retailer addresses, not an invented office or a warehouse selling on site',()=>{
 assert.equal(PICKUP_LOCATIONS.length,10);assert.equal(new Set(PICKUP_LOCATIONS.map(row=>row.id)).size,10);assert.equal(pickupLocationsFor('Sewera').length,7);assert.equal(pickupLocationsFor('LiderzyCen').length,0);
 const tokmet=pickupLocationsFor('TOK-MET');assert.equal(tokmet.length,1);assert.equal(tokmet[0].street,'ul. Bystrzańska 106A');assert.equal(tokmet[0].mapCentre,undefined);assert.equal(tokmet[0].city,'Bielsko-Biała');
 const folnet=pickupLocationsFor('Folnet')[0];assert.equal(folnet.city,'Batorowo');assert.equal(folnet.street,'ul. Stefana Batorego 97');assert.equal(folnet.collectionOnly,true);assert.equal(folnet.mapCentre,undefined);
 for(const row of PICKUP_LOCATIONS){assert.match(row.phone,/^\+48\d{9}$/);assert.match(row.postalCode,/^\d{2}-\d{3}$/);assert.equal(new URL(row.sourceUrl).protocol,'https:');const map=new URL(pickupAddressMapUrl(row.id)!);assert.equal(map.origin,'https://www.google.com');if(row.mapCid){assert.equal(map.searchParams.get('cid'),row.mapCid);assert.equal(map.searchParams.has('query'),false);}else assert.equal(map.searchParams.get('query'),`${row.store} ${row.street} ${row.postalCode} ${row.city} Polska`);}
 assert.equal(pickupAddressMapUrl('sewera-katowice'),'https://www.google.com/maps?cid=6187941980679851954');
 assert.equal(pickupAddressMapUrl('unknown'),null);
});
test('postcode evidence must match Poland, the requested code and one unambiguous finite location',()=>{
 assert.deepEqual(parsePostalPlace(response(),'40-001'),katowice);assert.equal(normalizePickupPostcode('40001'),'40-001');assert.equal(normalizePickupPostcode('Warszawa'),null);assert.equal(normalizePickupPostcode('../00-001?country=DE'),null);
 for(const mutate of [(v:any)=>{v['country abbreviation']='DE';},(v:any)=>{v['post code']='00-001';},(v:any)=>{v.places.push(v.places[0]);},(v:any)=>{v.places[0].latitude='NaN';},(v:any)=>{v.places[0].longitude='19oops';},(v:any)=>{v.places[0].latitude=90;},(v:any)=>{v.places[0]['place name']='';}]){const value=response();mutate(value);assert.equal(parsePostalPlace(value,'40-001'),null);}
});
test('distance is an approximate straight line and cannot borrow an old postcode or wrong warehouse point',()=>{
 assert.equal(approximateDistanceKm(katowice,{...PICKUP_LOCATIONS[0],mapCentre:katowice}),0);
 const degree=approximateDistanceKm({...katowice,latitude:50},{...PICKUP_LOCATIONS[0],mapCentre:{latitude:51,longitude:19.0167}})!;assert.ok(degree>110&&degree<112);
 assert.equal(approximateDistanceKm(katowice,pickupLocationsFor('Folnet')[0]),null);
 const sorted=rankPickupLocations('Sewera','40-001',katowice);assert.equal(sorted[0].location.city,'Katowice');assert.ok(sorted[0].distanceKm!>5&&sorted[0].distanceKm!<7);
 assert.ok(rankPickupLocations('Sewera','00-001',katowice).every(row=>row.distanceKm===null));
 assert.deepEqual(rankPickupLocations('Sewera','dabrowa gornicza').map(row=>row.location.city),['Dąbrowa Górnicza']);assert.deepEqual(rankPickupLocations('Sewera','Warszawa'),[]);
 assert.equal(rankPickupLocations('Centrum Matbud','00-001')[0].location.city,'Poznań');assert.deepEqual(rankPickupLocations('Unknown','00-001'),[]);
});
test('optional postcode lookup is bounded, cookie-free and cached separately per confirmed code',async()=>{
 const urls:string[]=[];const lookup=createPostalPlaceLookup(async(input,init)=>{const url=new URL(String(input));urls.push(url.href);assert.equal(url.origin,'https://api.zippopotam.us');assert.equal(init?.credentials,'omit');assert.equal(init?.headers&&new Headers(init.headers).get('Cookie'),null);return new Response(JSON.stringify(response(url.pathname.split('/').at(-1))));});
 assert.equal(await lookup('Warszawa'),null);assert.equal(await lookup('40-001?x=y'),null);assert.equal(urls.length,0);
 assert.deepEqual(await lookup('40001'),katowice);assert.deepEqual(await lookup('40-001'),katowice);assert.equal(urls.length,1);
 assert.equal((await lookup('00-001'))?.postalCode,'00-001');assert.equal(urls.length,2);
});
test('network and ambiguous lookup failures leave pickup addresses available instead of making up distances',async()=>{
 for(const value of [new Response('',{status:404}),new Response('<html>Error</html>'),new Response(JSON.stringify({...response(),'country abbreviation':'DE'}))]){assert.equal(await createPostalPlaceLookup(async()=>value)('40-001'),null);assert.equal(rankPickupLocations('Sewera','40-001',null).length,7);}
 assert.equal(await createPostalPlaceLookup(async()=>{throw Error('offline');})('40-001'),null);
});
test('cancelled requests never populate a cache with stale location data',async()=>{
 let release:(()=>void)|undefined,calls=0;
 const lookup=createPostalPlaceLookup(async()=>{calls++;if(calls===1)return new Promise<Response>(resolve=>{release=()=>resolve(new Response(JSON.stringify(response())));});return new Response(JSON.stringify(response()));});
 const controller=new AbortController(),pending=lookup('40-001',controller.signal);controller.abort();release!();assert.equal(await pending,null);assert.deepEqual(await lookup('40-001'),katowice);assert.equal(calls,2);
});
