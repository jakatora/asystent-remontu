import assert from "node:assert/strict";
import { test } from "node:test";

import type { Database } from "@workspace/db/repositories";
import type { Product, ProductOffer } from "@workspace/db/schema";

import { estimateStageCost, type EstimateDeps } from "./estimate";
import {
  estimateProjectCostFromCalculation,
  estimateStageCostFromCalculation,
  toEstimateItem,
  toEstimateItems,
  type CalculatorMaterialLine,
  type CalculatorStageResult,
} from "./from-calculator";

const db = {} as unknown as Database;

function product(over: Partial<Product>): Product {
  return {
    id: "prod-1",
    ean: null,
    gtin: null,
    name: "Produkt",
    normalizedName: "produkt",
    category: null,
    packageSize: null,
    ...over,
  } as unknown as Product;
}

function offer(over: Partial<ProductOffer>): ProductOffer {
  return {
    id: "offer-1",
    productId: "prod-1",
    store: "leroy-merlin",
    price: "79.98",
    promoPrice: null,
    regularPrice: null,
    unit: "l",
    packageSize: "10",
    pricePerUnit: null,
    productUrl: "https://leroymerlin.pl/p/1",
    availability: null,
    source: "leroy-merlin",
    ...over,
  } as unknown as ProductOffer;
}

function makeDeps(cfg: {
  byCode?: Record<string, Product>;
  byNameCat?: Record<string, Product>;
  offers?: Record<string, ProductOffer[]>;
}): EstimateDeps {
  return {
    findProductByCode: async (_db, code) => {
      const key = code.ean ?? code.gtin;
      return (key && cfg.byCode?.[key]) || null;
    },
    findProductByNameAndCategory: async (_db, q) =>
      cfg.byNameCat?.[`${q.normalizedName}|${q.category}`] ?? null,
    listOffers: async (_db, productId) => cfg.offers?.[productId] ?? [],
  };
}

function line(
  over: Omit<Partial<CalculatorMaterialLine>, "material"> & {
    material?: Partial<CalculatorMaterialLine["material"]>;
  },
): CalculatorMaterialLine {
  return {
    quantity: 1,
    ...over,
    material: {
      id: "m-1",
      name: "Materiał",
      unit: "szt",
      ...over.material,
    },
  };
}

// --- mapowanie pozycji -----------------------------------------------------

test("toEstimateItem: normalizuje nazwę (PL znaki) i przepisuje jednostkę/ilość", () => {
  const item = toEstimateItem(
    line({
      quantity: 25,
      material: { name: "Farba Śnieżka Biała", unit: "l", category: "paint" },
    }),
  );
  assert.deepEqual(item.query, {
    ean: null,
    gtin: null,
    normalizedName: "farba sniezka biala",
    category: "paint",
  });
  assert.equal(item.quantity, 25);
  assert.equal(item.unit, "l");
});

test("toEstimateItem: ean/gtin z materiału trafiają do query (priorytet kodu)", () => {
  const item = toEstimateItem(
    line({ material: { ean: " 5903973005797 ", gtin: "", name: "X" } }),
  );
  assert.equal(item.query.ean, "5903973005797"); // przycięte
  assert.equal(item.query.gtin, null); // puste -> null
});

test("toEstimateItem: brak kategorii -> null (dopasowanie po nazwie się nie uda)", () => {
  const item = toEstimateItem(line({ material: { name: "Grunt", category: undefined } }));
  assert.equal(item.query.category, null);
  assert.equal(item.query.normalizedName, "grunt");
});

test("toEstimateItems: zachowuje kolejność i liczbę pozycji", () => {
  const result: CalculatorStageResult = {
    jobId: "paint",
    materials: [
      line({ material: { id: "a", name: "A" } }),
      line({ material: { id: "b", name: "B" } }),
    ],
  };
  const items = toEstimateItems(result);
  assert.equal(items.length, 2);
  assert.equal(items[0]!.query.normalizedName, "a");
  assert.equal(items[1]!.query.normalizedName, "b");
});

// --- estimateStageCostFromCalculation --------------------------------------

test("estimateStageCostFromCalculation: dopasowanie po EAN, koszt w groszach, jobId", async () => {
  const p = product({ id: "farba", ean: "5903973005797", packageSize: "10" });
  const deps = makeDeps({
    byCode: { "5903973005797": p },
    offers: {
      farba: [offer({ productId: "farba", price: "79.98", packageSize: "10" })],
    },
  });

  const jobResult: CalculatorStageResult = {
    jobId: "malowanie",
    materials: [
      line({
        quantity: 25,
        packs: 3, // celowo obecne — NIE powinno wpływać na ilość wyceny
        material: { id: "farba", name: "Farba", unit: "l", ean: "5903973005797" },
      }),
    ],
  };

  const stage = await estimateStageCostFromCalculation(db, jobResult, {}, deps);

  assert.equal(stage.jobId, "malowanie");
  const l = stage.lines[0]!;
  assert.equal(l.resolved, true);
  if (!l.resolved) throw new Error("miała być rozpoznana");
  assert.equal(l.product.id, "farba");
  assert.equal(l.packagesNeeded, 3); // ceil(25/10) wg opakowania OFERTY
  assert.equal(l.lineCost, 3 * 7998);
  assert.equal(stage.stageTotalGrosze, 23994);
});

test("estimateStageCostFromCalculation: dopasowanie po nazwie+kategorii gdy brak kodu", async () => {
  const p = product({
    id: "gladz",
    normalizedName: "gladz gipsowa",
    category: "gypsum",
    packageSize: "20",
  });
  const deps = makeDeps({
    byNameCat: { "gladz gipsowa|gypsum": p },
    offers: { gladz: [offer({ productId: "gladz", price: "45.00", packageSize: "20" })] },
  });

  const jobResult: CalculatorStageResult = {
    jobId: "gladzie",
    materials: [
      line({
        quantity: 30,
        material: { id: "g", name: "Gładź gipsowa", unit: "kg", category: "gypsum" },
      }),
    ],
  };

  const stage = await estimateStageCostFromCalculation(db, jobResult, {}, deps);
  const l = stage.lines[0]!;
  assert.equal(l.resolved, true);
  if (!l.resolved) throw new Error("miała być rozpoznana");
  assert.equal(l.product.id, "gladz");
  assert.equal(l.packagesNeeded, 2); // ceil(30/20)
  assert.equal(stage.stageTotalGrosze, 2 * 4500);
});

test("estimateStageCostFromCalculation: równoważne bezpośredniemu estimateStageCost", async () => {
  const p = product({ id: "klej", ean: "111", packageSize: "5" });
  const deps = makeDeps({
    byCode: { "111": p },
    offers: { klej: [offer({ productId: "klej", price: "42.50", packageSize: "5" })] },
  });
  const jobResult: CalculatorStageResult = {
    jobId: "kleje",
    materials: [
      line({ quantity: 12, material: { id: "k", name: "Klej", unit: "kg", ean: "111" } }),
    ],
  };

  const viaAdapter = await estimateStageCostFromCalculation(db, jobResult, {}, deps);
  const direct = await estimateStageCost(
    db,
    toEstimateItems(jobResult),
    {},
    deps,
  );
  assert.equal(viaAdapter.stageTotalGrosze, direct.stageTotalGrosze);
  assert.deepEqual(viaAdapter.lines, direct.lines);
});

test("estimateStageCostFromCalculation: materiał bez dopasowania -> unresolved, poza sumą", async () => {
  const deps = makeDeps({ byCode: {} });
  const jobResult: CalculatorStageResult = {
    jobId: "x",
    materials: [
      line({ quantity: 2, material: { id: "z", name: "Zagadka", unit: "szt", category: "misc" } }),
    ],
  };
  const stage = await estimateStageCostFromCalculation(db, jobResult, {}, deps);
  assert.equal(stage.unresolved.length, 1);
  assert.equal(stage.unresolved[0]!.reason, "no-product");
  assert.equal(stage.stageTotalGrosze, 0);
});

// --- estimateProjectCostFromCalculation ------------------------------------

test("estimateProjectCostFromCalculation: sumuje etapy i zachowuje jobId per etap", async () => {
  const p1 = product({ id: "a", ean: "1", packageSize: "1" });
  const p2 = product({ id: "b", ean: "2", packageSize: "1" });
  const deps = makeDeps({
    byCode: { "1": p1, "2": p2 },
    offers: {
      a: [offer({ productId: "a", price: "10.00", packageSize: "1" })],
      b: [offer({ productId: "b", price: "25.50", packageSize: "1" })],
    },
  });

  const stage1: CalculatorStageResult = {
    jobId: "etap-1",
    materials: [line({ quantity: 4, material: { id: "a", name: "A", unit: "szt", ean: "1" } })],
  };
  const stage2: CalculatorStageResult = {
    jobId: "etap-2",
    materials: [line({ quantity: 2, material: { id: "b", name: "B", unit: "szt", ean: "2" } })],
  };

  const project = await estimateProjectCostFromCalculation(
    db,
    [stage1, stage2],
    {},
    deps,
  );

  assert.equal(project.stages.length, 2);
  assert.equal(project.stages[0]!.jobId, "etap-1");
  assert.equal(project.stages[1]!.jobId, "etap-2");
  assert.equal(project.stages[0]!.stageTotalGrosze, 4000); // 4 * 10,00
  assert.equal(project.stages[1]!.stageTotalGrosze, 5100); // 2 * 25,50
  assert.equal(project.projectTotalGrosze, 9100);
});

test("estimateProjectCostFromCalculation: brak etapów -> 0", async () => {
  const project = await estimateProjectCostFromCalculation(db, [], {}, makeDeps({}));
  assert.equal(project.projectTotalGrosze, 0);
  assert.deepEqual(project.stages, []);
});
