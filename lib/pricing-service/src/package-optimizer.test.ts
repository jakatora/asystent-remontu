import assert from "node:assert/strict";
import { test } from "node:test";

import { optimizePackages } from "./package-optimizer";
import type { PackageVariant } from "./types";

function variant(over: Partial<PackageVariant>): PackageVariant {
  return {
    packageSize: 10,
    unitPriceGrosze: 2000,
    store: "leroy-merlin",
    url: null,
    offerId: "o-10",
    ...over,
  };
}

test("optimizePackages: jedna wielkość -> N×rozmiar (jak zaokrąglenie w górę)", () => {
  const plan = optimizePackages(25, [variant({ packageSize: 10, unitPriceGrosze: 2000 })]);
  assert.ok(plan);
  assert.equal(plan.packages.length, 1);
  assert.equal(plan.packages[0]!.packageSize, 10);
  assert.equal(plan.packages[0]!.count, 3); // ceil(25/10)
  assert.equal(plan.totalGrosze, 3 * 2000);
  assert.equal(plan.coveredQuantity, 30);
  assert.equal(plan.overage, 5);
});

test("optimizePackages: dwie wielkości -> tańsza kombinacja zamiast jednego rozmiaru", () => {
  // 15 l: 2×10 (40,00) vs 1×10 + 1×5 (30,00). Wybiera kombinację 10+5.
  const variants = [
    variant({ packageSize: 10, unitPriceGrosze: 2000, offerId: "o-10" }),
    variant({ packageSize: 5, unitPriceGrosze: 1000, offerId: "o-5" }),
  ];
  const plan = optimizePackages(15, variants);
  assert.ok(plan);
  assert.equal(plan.totalGrosze, 3000); // 20,00 + 10,00
  assert.equal(plan.coveredQuantity, 15);
  assert.equal(plan.overage, 0);
  // dokładnie 1×10 + 1×5
  const sizes = plan.packages.map((p) => ({ size: p.packageSize, count: p.count }));
  assert.deepEqual(sizes, [
    { size: 10, count: 1 },
    { size: 5, count: 1 },
  ]);
});

test("optimizePackages: tie-break na naddatek (równy koszt -> mniejszy naddatek)", () => {
  // 5 j.: 3+2 (koszt 200, naddatek 0) vs 3+3 (koszt 200, naddatek 1). Wybiera 3+2.
  const variants = [
    variant({ packageSize: 3, unitPriceGrosze: 100, offerId: "o-3" }),
    variant({ packageSize: 2, unitPriceGrosze: 100, offerId: "o-2" }),
  ];
  const plan = optimizePackages(5, variants);
  assert.ok(plan);
  assert.equal(plan.totalGrosze, 200);
  assert.equal(plan.coveredQuantity, 5);
  assert.equal(plan.overage, 0);
  assert.deepEqual(
    plan.packages.map((p) => ({ size: p.packageSize, count: p.count })),
    [
      { size: 3, count: 1 },
      { size: 2, count: 1 },
    ],
  );
});

test("optimizePackages: duże opakowanie z lepszą ceną/jednostkę wygrywa mimo naddatku", () => {
  // 12 l: 20 l @ 25,00 (1 szt, 2500) vs 5 l @ 10,00 ×3 (3000). Wybiera 1×20 (taniej).
  const variants = [
    variant({ packageSize: 20, unitPriceGrosze: 2500, offerId: "o-20" }),
    variant({ packageSize: 5, unitPriceGrosze: 1000, offerId: "o-5" }),
  ];
  const plan = optimizePackages(12, variants);
  assert.ok(plan);
  assert.equal(plan.totalGrosze, 2500);
  assert.deepEqual(
    plan.packages.map((p) => ({ size: p.packageSize, count: p.count })),
    [{ size: 20, count: 1 }],
  );
});

test("optimizePackages: wielkości ułamkowe (2,5 l) — skalowanie działa", () => {
  // 6 l opakowaniami 2,5 l @ 800: ceil(6/2.5)=3 szt -> 7,5 l, 2400 gr.
  const plan = optimizePackages(6, [
    variant({ packageSize: 2.5, unitPriceGrosze: 800, offerId: "o-2.5" }),
  ]);
  assert.ok(plan);
  assert.equal(plan.packages[0]!.count, 3);
  assert.equal(plan.totalGrosze, 2400);
  assert.equal(plan.coveredQuantity, 7.5);
  assert.ok(Math.abs(plan.overage - 1.5) < 1e-9);
});

test("optimizePackages: ilość 0 -> pusty plan, koszt 0", () => {
  const plan = optimizePackages(0, [variant({})]);
  assert.ok(plan);
  assert.deepEqual(plan.packages, []);
  assert.equal(plan.totalGrosze, 0);
  assert.equal(plan.overage, 0);
});

test("optimizePackages: brak wariantów -> null", () => {
  assert.equal(optimizePackages(10, []), null);
  // warianty z niepoprawną wielkością są odfiltrowane -> null
  assert.equal(
    optimizePackages(10, [variant({ packageSize: 0 })]),
    null,
  );
});

test("optimizePackages: łączny koszt = suma lineCostGrosze pozycji", () => {
  const variants = [
    variant({ packageSize: 10, unitPriceGrosze: 2000, offerId: "o-10" }),
    variant({ packageSize: 5, unitPriceGrosze: 1100, offerId: "o-5" }),
  ];
  const plan = optimizePackages(17, variants);
  assert.ok(plan);
  const sum = plan.packages.reduce((s, p) => s + p.lineCostGrosze, 0);
  assert.equal(sum, plan.totalGrosze);
  // każda pozycja: lineCostGrosze === count * unitPriceGrosze
  for (const p of plan.packages) {
    assert.equal(p.lineCostGrosze, p.count * p.unitPriceGrosze);
  }
});
