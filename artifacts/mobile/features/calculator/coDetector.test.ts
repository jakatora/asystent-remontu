import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { upgradeCalculation, projectShopping } from './upgrades';
import { CO_EAN, CO_JOB, CO_MODEL, coDetectorQuantity } from './coDetector';
import type { CalculationResult, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';

const make = (n = 1) => calculatorEngine.calculate(getJobById(CO_JOB)!, { coDetectorChoice: 1, coDetectorCount: n });
test('explicit reviewed CO detector quantity is whole devices, without a second battery pack or waste', () => {
  for (const n of [1, 2, 100]) {
    const calc = make(n), stage = toPricingStageInput(calc);
    assert.equal(calc.quantityModel, CO_MODEL); assert.equal(calc.materials.length, 1);
    assert.equal(calc.materials[0].rawQuantity, n); assert.equal(calc.materials[0].packs, n);
    assert.equal(stage.materials[0].quantity, n); assert.equal(stage.materials[0].material.ean, CO_EAN);
    assert.equal(stage.materials[0].material.unit, 'szt');
  }
});
test('missing model, missing count and fractional, negative, infinite counts remain unquoted', () => {
  const cases: MeasurementMap[] = [{}, { coDetectorChoice: 1 }, { coDetectorCount: 1 }, ...[0, -1, 1.5, 101, Infinity, NaN].map(coDetectorCount => ({ coDetectorChoice: 1, coDetectorCount }))];
  for (const m of cases) {
    assert.equal(coDetectorQuantity(m), null);
    const calc = calculatorEngine.calculate(getJobById(CO_JOB)!, m), stage = toPricingStageInput(calc);
    assert.equal(calc.materials[0].quantityKnown, false);
    assert.equal(stage.materials[0].material.ean, undefined);
    assert.equal(stage.materials[0].material.unit, 'pozycja');
  }
});
test('old generic detector calculations and altered saved identities never become a different priced product', () => {
  const old = { ...make(), quantityModel: undefined, measurements: {}, materials: [{ ...make().materials[0], material: { id: 'co-detector', name: 'Czujnik tlenku węgla (czadu)', unit: 'szt.', formulaKey: 'constant', pricePerUnit: 120 }, rawQuantity: 1, quantity: 1.1 }] } as CalculationResult;
  const before = JSON.stringify(old); assert.equal(upgradeCalculation(old)!.materials[0].quantityKnown, false); assert.equal(JSON.stringify(old), before);
  for (const first of [{ ...make().materials[0], rawQuantity: 2 }, { ...make().materials[0], material: { ...make().materials[0].material, ean: '5908254851224' } }]) {
    const calc = { ...make(), materials: [first] }; assert.equal(toPricingStageInput(calc).materials[0].material.ean, undefined);
  }
});
test('owned old generic detector cannot hide the newly selected DC-11 while matching quantity is retained', () => {
  const calc = make(2), source = calc.materials[0];
  const item = { id:'co',projectId:'qa',materialId:'co-detector',name:'Czujnik czadu',unit:'szt',quantity:1,owned:true,purchased:true,itemType:'material' } as ShoppingItem;
  const reviewed = projectShopping([item], calc)[0]; assert.equal(reviewed.owned, false); assert.equal(reviewed.purchased, false); assert.equal(reviewed.needsQuantityConfirmation, true);
  const matching = projectShopping([{ ...item, name:source.material.name, quantity:2 }], calc)[0]; assert.equal(matching.owned, true); assert.equal(matching.requiredQuantity, 2);
});
