import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectOfferCoverage } from './projectOfferCoverage';
import type { SerializedStage } from './pricingApi';

test('coverage uses offers in the current project, not every source in the catalogue', () => {
  const stages = [
    {lines:[{resolved:true,offers:[
      {store:'TGS',priceGrosze:29719,fetchedAt:'2026-10-29T12:00:00Z'},
      {store:'Arena Łazienek',priceGrosze:28899,fetchedAt:'2026-10-29T11:00:00Z'},
      {store:'Pati Art Studio',priceGrosze:27093,fetchedAt:'2026-10-29T10:00:00Z'},
    ]}]},
    {lines:[{resolved:true,offers:[{store:'TGS',priceGrosze:29719,fetchedAt:'2026-10-29T13:00:00Z'}]},
      {resolved:false,offers:[{store:'Unrelated',priceGrosze:100,fetchedAt:'2026-10-24T00:00:00Z'}]}]},
  ] as SerializedStage[];
  assert.deepEqual(projectOfferCoverage(stages),{
    storeCount:3,firstCheckedAt:'2026-10-29T10:00:00.000Z',lastCheckedAt:'2026-10-29T13:00:00.000Z',
  });
  assert.deepEqual(projectOfferCoverage(stages,'TGS'),{
    storeCount:1,firstCheckedAt:'2026-10-29T12:00:00.000Z',lastCheckedAt:'2026-10-29T13:00:00.000Z',
  });
});

test('unpriced and undated offers never invent a checked date or a store', () => {
  const stages=[{lines:[{resolved:true,offers:[
    {store:'No price',priceGrosze:null,fetchedAt:'2026-10-29T12:00:00Z'},
    {store:'Price without date',priceGrosze:100,fetchedAt:null},
    {store:'Invalid date',priceGrosze:200,fetchedAt:'bad-date'},
  ]}]}] as SerializedStage[];
  assert.deepEqual(projectOfferCoverage(stages),{storeCount:2,firstCheckedAt:null,lastCheckedAt:null});
});
