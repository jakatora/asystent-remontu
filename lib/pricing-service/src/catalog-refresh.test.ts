import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parseCatalogRefreshIdentity,parseCatalogProductRefresh,catalogRefreshUnit} from './catalog-refresh';

const identity={ean:'5901095517976',category:'pipe',packageSize:1,unit:'mb'};
const response=()=>({version:1,identity,refresh:{status:'updated',checkedAt:'2026-11-01T21:00:00Z',confirmedOfferIds:['plusmarket-pex-pipe-16x2'],failedOfferIds:[],retryAfterSeconds:60},availability:{version:1,complete:true,channel:'online',currency:'PLN',deliveryIncluded:false,generatedAt:'2026-11-01T21:00:00Z',maxAgeMs:30000,products:[]}});
test('catalogue refresh accepts one exact code or reviewed merchant identity with the physical pack',()=>{
  assert.deepEqual(parseCatalogRefreshIdentity(identity),identity);assert.equal(parseCatalogRefreshIdentity({productId:'remont-sku-ewinyl-5329-2m',category:'vinyl-roll',packageSize:1,unit:'m2'}).packageSize,1);assert.equal(catalogRefreshUnit('mb'),catalogRefreshUnit('m'));
});
test('client URLs, customer fields, typed prices, mixed identities and malformed packs never become refresh input',()=>{
  for(const patch of [{url:'https://other.example'},{priceGrosze:1},{postalCode:'00-001'},{email:'not-sent@example.org'},{productId:'remont-sku-other'},{ean:'123'},{ean:1234567890123},{category:' pipe'},{unit:''},{packageSize:0},{packageSize:Infinity},{packageSize:1000001}])assert.throws(()=>parseCatalogRefreshIdentity({...identity,...patch}));
  assert.throws(()=>parseCatalogRefreshIdentity({category:'pipe',packageSize:1,unit:'mb'}));assert.throws(()=>parseCatalogRefreshIdentity(null));
});
test('refresh results require a complete hint snapshot and truthful bounded refresh metadata, never delivery or demo prices',()=>{
  assert.equal(parseCatalogProductRefresh(response()).availability.deliveryIncluded,false);
  for(const patch of [{status:'ok'},{retryAfterSeconds:61},{retryAfterSeconds:-1},{checkedAt:'bad'},{confirmedOfferIds:['same'],failedOfferIds:['same']},{failedOfferIds:['bad','bad']}])assert.throws(()=>parseCatalogProductRefresh({...response(),refresh:{...response().refresh,...patch}}));
  assert.throws(()=>parseCatalogProductRefresh({...response(),availability:{...response().availability,complete:false}}));assert.throws(()=>parseCatalogProductRefresh({...response(),availability:{...response().availability,deliveryIncluded:true}}));
});
