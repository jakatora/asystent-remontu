import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixtures from './fixtures/norgips-joint-tapes-wave155.json';
import {NORGIPS_JOINT_TAPE_SOURCES, isReviewedNorgipsJointTape} from './norgips-joint-tapes';
import {parseRetailPage} from './retail-pages';
import {readCertusoftState} from './certusoft-product';

test('native Norgips joint tapes buy one 30m or 153m roll with exact GTIN, price and finite stock', () => {
  assert.equal(fixtures.length, 2);
  for (const fixture of fixtures) {
    const source = NORGIPS_JOINT_TAPE_SOURCES.find(row => row.id === fixture.sourceId)!;
    const observed = parseRetailPage(fixture.html, source, new Date());
    assert.ok(isReviewedNorgipsJointTape(source));
    assert.equal(observed.ean, source.ean);
    assert.equal(observed.priceGrosze, fixture.priceGrosze);
    assert.equal(source.packageSize, source.ean === '5907651699940' ? 30 : 153);
    assert.ok(observed.stockPackages! > 0);
  }
});

test('roll whitelist rejects a metre price, carton, other roll length, wrong identity and purchase multiple', () => {
  for (const fixture of fixtures) {
    const source = NORGIPS_JOINT_TAPE_SOURCES.find(row => row.id === fixture.sourceId)!;
    for (const change of [{packageSize:1,unit:'szt'}, {packageSize:1}, {packageSize:90}, {packageSize:source.packageSize*12},
      {purchaseMultiple:12}, {retailerUnitId:1}, {ean:'5907651699988'}, {brand:'Sila'}, {apiPurchaseUnit:'m'}]) {
      assert.equal(isReviewedNorgipsJointTape({...source,...change}), false);
      assert.throws(() => parseRetailPage(fixture.html, {...source,...change}, new Date()), /retailer_unit_not_confirmed/);
    }
  }
});

test('missing, duplicate or changed native roll dimensions cannot become a confirmed offer', () => {
  for (const fixture of fixtures) {
    const source = NORGIPS_JOINT_TAPE_SOURCES.find(row => row.id === fixture.sourceId)!;
    for (const name of ['Długość','Szerokość','Marka']) for (const operation of ['missing','duplicate','change']) {
      const state = readCertusoftState(fixture.html), features = state.csAppWindowsUtils.csAppWindows.csB2BItemCard.dataSets.features;
      const original = features.rows.find((r: any) => r.featureDesc.trim() === name);
      assert.ok(original);
      if (operation === 'missing') features.rows = features.rows.filter((r: any) => r !== original);
      else if (operation === 'duplicate') features.rows.push({...original});
      else original.featureValue = 'other';
      const changed = fixture.html.replace(/window\.__INITIAL_STATE__=\{[\s\S]*?\};\(function/, 'window.__INITIAL_STATE__='+JSON.stringify(state)+';(function');
      assert.throws(() => parseRetailPage(changed, source, new Date()), /retailer_unit_not_confirmed/);
    }
  }
});
