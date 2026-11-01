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

const offer=()=>({offerId:'plusmarket-pex-pipe-16x2',store:'Plus-Market',sourceUrl:'https://www.plus-market.pl/pl/p/Rura-pexalpex-16-mmx2-1mb/12990',currency:'PLN',packageSize:1,unit:'mb',priceGrosze:399,checkedAt:'2026-11-01T21:00:00Z',previous:{priceGrosze:449,checkedAt:'2026-11-01T20:00:00Z'},deltaGrosze:-50});
test('optional scoped prices preserve legacy replies and require actual integer prices with the same package',()=>{
  assert.equal(parseCatalogProductRefresh(response()).offers,undefined);
  assert.equal(parseCatalogProductRefresh({...response(),offers:[offer()]}).offers?.[0].deltaGrosze,-50);
  for(const patch of [{priceGrosze:3.99},{priceGrosze:0},{currency:'EUR'},{packageSize:200},{unit:'kg'},{offerId:'another-offer'},{sourceUrl:'javascript:alert(1)'},{sourceUrl:'https://user:secret@example.org/item'},{checkedAt:'2027-01-01T00:00:00Z'}])assert.throws(()=>parseCatalogProductRefresh({...response(),offers:[{...offer(),...patch}]}));
  assert.throws(()=>parseCatalogProductRefresh({...response(),offers:[offer(),offer()]}));
});

test('a change is never inferred without an earlier reading, and its amount and dates must match',()=>{
  assert.equal(parseCatalogProductRefresh({...response(),offers:[{...offer(),previous:null,deltaGrosze:null}]}).offers?.[0].previous,null);
  for(const patch of [{previous:null},{deltaGrosze:50},{deltaGrosze:null},{previous:{priceGrosze:0,checkedAt:'2026-11-01T20:00:00Z'}},{previous:{priceGrosze:449,checkedAt:'2026-11-01T21:00:00Z'}},{previous:{priceGrosze:449,checkedAt:'bad'}}])assert.throws(()=>parseCatalogProductRefresh({...response(),offers:[{...offer(),...patch}]}));
  const unchanged={...offer(),previous:{priceGrosze:399,checkedAt:'2026-11-01T20:00:00Z'},deltaGrosze:0};assert.equal(parseCatalogProductRefresh({...response(),offers:[unchanged]}).offers?.[0].deltaGrosze,0);
});
