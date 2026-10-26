import assert from 'node:assert/strict';
import { test } from 'node:test';
import { rankStoreChoices, parsePreferredStore, storeMapSearchUrl, supportsStoreMapSearch, storeLocatorUrl, estimateHonoursStore, deliverySettingsForStore, type StoreChoices } from './storeChoice';
import type { SerializedProject } from './pricingApi';

test('store search accepts plain Polish spelling without changing the actual merchant identity',()=>{
 const choices:StoreChoices={stores:['Bricomarché Poznań (Al. Solidarności)','Modna Łazienka'],unresolvedCount:0,comparison:{productCount:1,optimalBasketGrosze:0,optimalByStore:[],cheapestFullStore:null,singleStoreExtraGrosze:null,stores:[]}};
 assert.deepEqual(rankStoreChoices(choices,' bricomarche ').map(row=>row.store),['Bricomarché Poznań (Al. Solidarności)']);assert.deepEqual(rankStoreChoices(choices,'lazienka').map(row=>row.store),['Modna Łazienka']);assert.deepEqual(rankStoreChoices(choices,'poznan').map(row=>row.store),['Bricomarché Poznań (Al. Solidarności)']);
});

test('selecting a local collection or delivery-only merchant chooses its confirmed channel and preserves only the postcode on mode change',()=>{
 const choices={pickupOnlyStores:['Local'],pickupUnavailableStores:['Online']},current={mode:'shipping' as const,method:'manual' as const,postalCode:'61-696',legacyFees:{Local:0}};
 assert.deepEqual(deliverySettingsForStore(choices,current,'Local'),{mode:'pickup',method:'automatic',postalCode:'61-696'});
 assert.deepEqual(deliverySettingsForStore(choices,{mode:'pickup',postalCode:'00-001'},'Online'),{mode:'shipping',method:'automatic',postalCode:'00-001'});
 for(const store of [null,'Unknown','Online'])assert.equal(deliverySettingsForStore(choices,current,store),current);
 assert.equal(deliverySettingsForStore({...choices,pickupUnavailableStores:['Local']},current,'Local'),current);
 assert.equal(current.mode,'shipping');assert.deepEqual(current.legacyFees,{Local:0});
});

test('store choice preserves server amounts, places complete baskets before cheap fragments and keeps absent stores visible', () => {
  const choices: StoreChoices = { stores: ['Partial','Complete','Absent'], unresolvedCount: 0, comparison: { productCount: 3, optimalBasketGrosze: 1200, optimalByStore: [], cheapestFullStore: null, singleStoreExtraGrosze: null, stores: [
    { store: 'Partial', totalGrosze: 100, coveredCount: 1, missingCount: 2, missingProductIds: ['x','y'] },
    { store: 'Complete', totalGrosze: 1500, coveredCount: 3, missingCount: 0, missingProductIds: [] },
  ] } };
  const before = JSON.stringify(choices), ranked = rankStoreChoices(choices);
  assert.deepEqual(ranked.map(r => r.store), ['Complete','Partial','Absent']);
  assert.equal(ranked[0].totalGrosze, 1500); assert.equal(ranked[2].coveredCount, 0); assert.equal(ranked[2].missingCount, 3);
  assert.deepEqual(rankStoreChoices(choices,'  PART  ').map(r => r.store), ['Partial']);
  assert.equal(JSON.stringify(choices), before);
});

test('maps search encodes the chosen store and user location; it does not imply local inventory', () => {
  const url = new URL(storeMapSearchUrl('Castorama','Łódź & centrum')!);
  assert.equal(url.origin, 'https://www.google.com'); assert.equal(url.pathname, '/maps/search/');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('query'), 'Castorama market budowlany Łódź & centrum Polska');
  assert.equal([...url.searchParams.keys()].length, 2);
  assert.equal(new URL(storeMapSearchUrl('Folnet', '00-001')!).searchParams.get('query'), 'Folnet magazyn ul. Stefana Batorego 97 62-081 Batorowo Polska');
  assert.equal(storeMapSearchUrl('Folnet', ''), storeMapSearchUrl('Folnet', '00-001'));
  assert.equal(new URL(storeMapSearchUrl('Centrum Matbud','00-001')!).searchParams.get('query'),'Centrum Matbud ul. Pokrzywno 21 61-315 Poznań Polska');
  assert.equal(storeMapSearchUrl('Centrum Matbud','00-001'),storeMapSearchUrl('Centrum Matbud','80-001'));
  for (const store of ['LiderzyCen', 'Betterial', 'Unknown', '__proto__']) {
    assert.equal(supportsStoreMapSearch(store), false);
    assert.equal(storeMapSearchUrl(store, '00-001'), null);
    assert.equal(storeLocatorUrl(store), null);
  }
  assert.equal(storeLocatorUrl('Castorama'), 'https://www.castorama.pl/find-a-store');
  assert.equal(storeLocatorUrl('OBI'), 'https://www.obi.pl/stores');
  assert.equal(storeLocatorUrl('Sewera'), 'https://sklep.sewera.pl/miejsca-odbioru');
  assert.equal(supportsStoreMapSearch('ABUD'), true);
  assert.equal(storeLocatorUrl('ABUD'), 'https://www.abud.pl/stocks.php');
  assert.equal(storeMapSearchUrl('Castorama',''), null); assert.equal(storeMapSearchUrl('Castorama','x'.repeat(81)), null);
  assert.equal(parsePreferredStore('Sewera'), 'Sewera');
  for (const value of [null, 12, '', ' Sewera', 'Sewera\n', 'x'.repeat(81)]) assert.equal(parsePreferredStore(value), null);
});

test('client refuses a selected-store response that borrows prices from another store', () => {
  const data = { stages: [{ lines: [{ resolved: true, cheapestOffer: {store:'A'}, offers: [{store:'A'}], packages:[{store:'A'}] }] }], consolidated: { lines: [{ cheapestOffer:{store:'A'}, packages:[{store:'A'}] }] }, storeComparison: { stores:[{store:'A'}], optimalByStore:[{store:'A'}] }, deliveryComparison: { best:{stores:[{store:'A'}]}, lowerBound:null, alternatives:[] } } as unknown as SerializedProject;
  assert.equal(estimateHonoursStore(data,'A'), true);
  const mutations = [
    (d:any)=>d.stages[0].lines[0].offers[0].store='B',
    (d:any)=>d.consolidated.lines[0].packages[0].store='B',
    (d:any)=>d.consolidated.lines[0].cheapestOffer.store='B',
    (d:any)=>d.storeComparison.optimalByStore[0].store='B',
    (d:any)=>d.deliveryComparison.best.stores[0].store='B',
  ];
  for(const mutate of mutations){const changed=JSON.parse(JSON.stringify(data));mutate(changed);assert.notDeepEqual(changed,data);assert.equal(estimateHonoursStore(changed,'A'),false);}
});
