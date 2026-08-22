import assert from "node:assert/strict";
import { test } from "node:test";

import type { Database } from "@workspace/db/repositories";
import type { Product, ProductOffer } from "@workspace/db/schema";

import {
  compareStores,
  computePackagesNeeded,
  consolidateProject,
  estimateProjectCost,
  estimateStageCost,
  selectCheapestOffer,
  type EstimateDeps,
} from "./estimate";
import type { EstimateItem } from "./types";

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

/** Buduje deps na atrapach: mapa kodEAN->produkt, mapa productId->oferty. */
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

// --- Czyste helpery -------------------------------------------------------

test("selectCheapestOffer: wybiera najtańszą po cenie efektywnej (promo bije regular)", () => {
  const offers = [
    offer({ id: "a", store: "castorama", price: "100.00" }),
    offer({ id: "b", store: "obi", price: "120.00", promoPrice: "79.00" }),
    offer({ id: "c", store: "leroy-merlin", price: "90.00" }),
  ];
  const cheapest = selectCheapestOffer(offers);
  assert.equal(cheapest?.offer.id, "b");
  assert.equal(cheapest?.store, "obi");
  assert.equal(cheapest?.unitPriceGrosze, 7900); // 79.00 zł promo
});

test("selectCheapestOffer: filtr po sklepie zawęża wybór", () => {
  const offers = [
    offer({ id: "a", store: "castorama", price: "50.00" }),
    offer({ id: "b", store: "leroy-merlin", price: "90.00" }),
  ];
  const cheapest = selectCheapestOffer(offers, "leroy-merlin");
  assert.equal(cheapest?.offer.id, "b");
  assert.equal(cheapest?.unitPriceGrosze, 9000);
});

test("selectCheapestOffer: oferty bez ceny są pomijane, brak -> null", () => {
  assert.equal(selectCheapestOffer([offer({ price: null, promoPrice: null })]), null);
  assert.equal(selectCheapestOffer([], "obi"), null);
});

test("computePackagesNeeded: zaokrągla w górę do pełnych opakowań", () => {
  assert.equal(computePackagesNeeded(25, 10), 3); // 2.5 -> 3
  assert.equal(computePackagesNeeded(20, 10), 2); // dokładnie 2
  assert.equal(computePackagesNeeded(1, 10), 1); // ułamek -> 1
  assert.equal(computePackagesNeeded(0, 10), 0); // nic nie trzeba
  assert.equal(computePackagesNeeded(3, 0), 3); // brak opakowania -> per sztuka
});

// --- estimateStageCost ----------------------------------------------------

test("estimateStageCost: dopasowanie po EAN + zaokrąglenie do opakowań + koszt", async () => {
  const p = product({ id: "farba", ean: "5903973005797", packageSize: "10" });
  const deps = makeDeps({
    byCode: { "5903973005797": p },
    offers: {
      farba: [offer({ productId: "farba", store: "leroy-merlin", price: "79.98", packageSize: "10" })],
    },
  });

  const items: EstimateItem[] = [
    { query: { ean: "5903973005797" }, quantity: 25, unit: "l" },
  ];
  const stage = await estimateStageCost(db, items, {}, deps);

  assert.equal(stage.lines.length, 1);
  const line = stage.lines[0]!;
  assert.equal(line.resolved, true);
  if (!line.resolved) throw new Error("spodziewano rozpoznanej pozycji");
  assert.equal(line.product.id, "farba");
  assert.equal(line.packageSize, 10);
  assert.equal(line.packagesNeeded, 3); // ceil(25/10)
  assert.equal(line.cheapestOffer.unitPriceGrosze, 7998);
  assert.equal(line.lineCost, 3 * 7998); // 23994 gr = 239,94 zł
  assert.equal(stage.stageTotalGrosze, 23994);
  assert.deepEqual(stage.unresolved, []);
});

test("estimateStageCost: wybiera najtańszą ofertę spośród wielu sklepów", async () => {
  const p = product({ id: "klej", ean: "111", packageSize: "5" });
  const deps = makeDeps({
    byCode: { "111": p },
    offers: {
      klej: [
        offer({ productId: "klej", store: "castorama", price: "60.00", packageSize: "5" }),
        offer({ productId: "klej", store: "obi", price: "42.50", packageSize: "5" }),
        offer({ productId: "klej", store: "leroy-merlin", price: "55.00", packageSize: "5" }),
      ],
    },
  });

  const stage = await estimateStageCost(
    db,
    [{ query: { ean: "111" }, quantity: 12, unit: "kg" }],
    {},
    deps,
  );
  const line = stage.lines[0]!;
  if (!line.resolved) throw new Error("miała być rozpoznana");
  assert.equal(line.cheapestOffer.store, "obi");
  assert.equal(line.cheapestOffer.unitPriceGrosze, 4250);
  assert.equal(line.packagesNeeded, 3); // ceil(12/5)
  assert.equal(line.lineCost, 3 * 4250); // 12750 gr
});

test("estimateStageCost: dopasowanie po nazwie+kategorii gdy brak EAN", async () => {
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

  const stage = await estimateStageCost(
    db,
    [
      {
        query: { normalizedName: "gladz gipsowa", category: "gypsum" },
        quantity: 30,
        unit: "kg",
      },
    ],
    {},
    deps,
  );
  const line = stage.lines[0]!;
  assert.equal(line.resolved, true);
  if (!line.resolved) throw new Error("miała być rozpoznana");
  assert.equal(line.product.id, "gladz");
  assert.equal(line.packagesNeeded, 2); // ceil(30/20)
  assert.equal(line.lineCost, 2 * 4500);
});

test("estimateStageCost: sama nazwa bez kategorii NIE dopasowuje (no-query)", async () => {
  const deps = makeDeps({
    byNameCat: { "farba biala|paint": product({ id: "x" }) },
  });
  const stage = await estimateStageCost(
    db,
    [{ query: { normalizedName: "farba biala" }, quantity: 5, unit: "l" }],
    {},
    deps,
  );
  assert.equal(stage.lines[0]!.resolved, false);
  assert.equal(stage.unresolved.length, 1);
  assert.equal(stage.unresolved[0]!.reason, "no-query");
  assert.equal(stage.stageTotalGrosze, 0);
});

test("estimateStageCost: produkt bez oferty -> unresolved(no-offer), poza sumą", async () => {
  const empty = product({ id: "pusty", ean: "222" });
  const priced = product({ id: "ok", ean: "333", packageSize: "1" });
  const deps = makeDeps({
    byCode: { "222": empty, "333": priced },
    offers: {
      pusty: [], // produkt jest w katalogu, ale bez ofert
      ok: [offer({ productId: "ok", price: "10.00", packageSize: "1" })],
    },
  });

  const stage = await estimateStageCost(
    db,
    [
      { query: { ean: "222" }, quantity: 3, unit: "szt" },
      { query: { ean: "333" }, quantity: 2, unit: "szt" },
    ],
    {},
    deps,
  );

  assert.equal(stage.lines.length, 2);
  assert.equal(stage.unresolved.length, 1);
  assert.equal(stage.unresolved[0]!.reason, "no-offer");
  // Tylko rozpoznana pozycja wchodzi do sumy: 2 * 10,00 zł = 2000 gr.
  assert.equal(stage.stageTotalGrosze, 2000);
});

test("estimateStageCost: nieznany EAN -> unresolved(no-product)", async () => {
  const deps = makeDeps({ byCode: {} });
  const stage = await estimateStageCost(
    db,
    [{ query: { ean: "000" }, quantity: 1, unit: "szt" }],
    {},
    deps,
  );
  assert.equal(stage.unresolved[0]!.reason, "no-product");
});

// --- estimateProjectCost --------------------------------------------------

test("estimateProjectCost: sumuje etapy do projectTotalGrosze", async () => {
  const p1 = product({ id: "a", ean: "1", packageSize: "1" });
  const p2 = product({ id: "b", ean: "2", packageSize: "1" });
  const deps = makeDeps({
    byCode: { "1": p1, "2": p2 },
    offers: {
      a: [offer({ productId: "a", price: "10.00", packageSize: "1" })],
      b: [offer({ productId: "b", price: "25.50", packageSize: "1" })],
    },
  });

  const stage1 = await estimateStageCost(
    db,
    [{ query: { ean: "1" }, quantity: 4, unit: "szt" }], // 4 * 1000 = 4000
    {},
    deps,
  );
  const stage2 = await estimateStageCost(
    db,
    [{ query: { ean: "2" }, quantity: 2, unit: "szt" }], // 2 * 2550 = 5100
    {},
    deps,
  );

  assert.equal(stage1.stageTotalGrosze, 4000);
  assert.equal(stage2.stageTotalGrosze, 5100);

  const project = estimateProjectCost([stage1, stage2]);
  assert.equal(project.stages.length, 2);
  assert.equal(project.projectTotalGrosze, 9100); // 91,00 zł
});

test("estimateProjectCost: brak etapów -> 0", () => {
  const project = estimateProjectCost([]);
  assert.equal(project.projectTotalGrosze, 0);
  assert.deepEqual(project.consolidated.lines, []);
  assert.equal(project.consolidated.consolidatedTotalGrosze, 0);
  assert.equal(project.consolidated.savingsGrosze, 0);
});

// --- konsolidacja materiałów w całym remoncie -----------------------------

test("consolidateProject: ten sam produkt w 2 etapach -> jedno zaokrąglenie + oszczędność", async () => {
  const p = product({ id: "farba", ean: "1", packageSize: "5" });
  const deps = makeDeps({
    byCode: { "1": p },
    offers: {
      farba: [offer({ productId: "farba", store: "leroy-merlin", price: "80.00", packageSize: "5" })],
    },
  });

  // Dwa etapy po 12 l tej samej farby (opak. 5 l, 80 zł = 8000 gr).
  const stage1 = await estimateStageCost(
    db,
    [{ query: { ean: "1" }, quantity: 12, unit: "l" }],
    {},
    deps,
  );
  const stage2 = await estimateStageCost(
    db,
    [{ query: { ean: "1" }, quantity: 12, unit: "l" }],
    {},
    deps,
  );

  // Per-etap: ceil(12/5)=3 opak. w każdym etapie => 2 * 3 * 8000 = 48000 gr.
  assert.equal(stage1.stageTotalGrosze, 24000);
  assert.equal(stage2.stageTotalGrosze, 24000);

  const project = estimateProjectCost([stage1, stage2]);
  assert.equal(project.projectTotalGrosze, 48000);

  const { consolidated } = project;
  assert.equal(consolidated.lines.length, 1); // jeden produkt zebrany z 2 etapów
  const line = consolidated.lines[0]!;
  assert.equal(line.product.id, "farba");
  assert.equal(line.totalQuantity, 24); // 12 + 12 l zsumowane
  assert.equal(line.packagesNeeded, 5); // ceil(24/5)=5 (a nie 3+3=6)
  assert.equal(line.lineCostGrosze, 5 * 8000); // 40000 gr
  assert.equal(line.perStageCostGrosze, 48000);
  assert.equal(line.savingsGrosze, 8000); // jedno opakowanie mniej = 80 zł

  assert.equal(consolidated.consolidatedTotalGrosze, 40000);
  assert.equal(consolidated.perStageTotalGrosze, 48000);
  assert.equal(consolidated.perStageTotalGrosze, project.projectTotalGrosze);
  assert.equal(consolidated.savingsGrosze, 8000);
});

test("consolidateProject: różne produkty -> brak scalania, zero oszczędności", async () => {
  const p1 = product({ id: "a", ean: "1", packageSize: "1" });
  const p2 = product({ id: "b", ean: "2", packageSize: "1" });
  const deps = makeDeps({
    byCode: { "1": p1, "2": p2 },
    offers: {
      a: [offer({ productId: "a", price: "10.00", packageSize: "1" })],
      b: [offer({ productId: "b", price: "25.50", packageSize: "1" })],
    },
  });

  const stage1 = await estimateStageCost(db, [{ query: { ean: "1" }, quantity: 4, unit: "szt" }], {}, deps);
  const stage2 = await estimateStageCost(db, [{ query: { ean: "2" }, quantity: 2, unit: "szt" }], {}, deps);

  const { consolidated } = estimateProjectCost([stage1, stage2]);
  assert.equal(consolidated.lines.length, 2);
  assert.equal(consolidated.consolidatedTotalGrosze, 9100);
  assert.equal(consolidated.savingsGrosze, 0); // pełne opakowania, nic do zaokrąglenia
});

// --- porównanie sklepów (compareStores) -----------------------------------

test("compareStores: koszt całości per sklep + koszyk optymalny + najtańszy pełny sklep", async () => {
  const pA = product({ id: "A", ean: "1" });
  const pB = product({ id: "B", ean: "2" });
  const deps = makeDeps({
    byCode: { "1": pA, "2": pB },
    offers: {
      A: [
        offer({ productId: "A", store: "leroy-merlin", price: "80.00", packageSize: "5" }),
        offer({ productId: "A", store: "castorama", price: "90.00", packageSize: "5" }),
      ],
      B: [
        offer({ productId: "B", store: "leroy-merlin", price: "40.00", packageSize: "10" }),
        offer({ productId: "B", store: "castorama", price: "30.00", packageSize: "10" }),
      ],
    },
  });

  const stage = await estimateStageCost(
    db,
    [
      { query: { ean: "1" }, quantity: 12, unit: "l" }, // ceil(12/5)=3
      { query: { ean: "2" }, quantity: 12, unit: "l" }, // ceil(12/10)=2
    ],
    {},
    deps,
  );

  const cmp = compareStores([stage]);
  assert.equal(cmp.productCount, 2);

  // Koszyk optymalny: A najtaniej w leroy (80), B najtaniej w castorama (30).
  // A: 3*8000=24000, B: 2*3000=6000 => 30000. Równy consolidatedTotalGrosze.
  assert.equal(cmp.optimalBasketGrosze, 30000);
  assert.equal(
    cmp.optimalBasketGrosze,
    consolidateProject([stage]).consolidatedTotalGrosze,
  );

  // Rozbicie koszyka optymalnego po sklepach (rosnąco po sumie).
  assert.deepEqual(cmp.optimalByStore, [
    { store: "castorama", totalGrosze: 6000, itemCount: 1 },
    { store: "leroy-merlin", totalGrosze: 24000, itemCount: 1 },
  ]);

  // Koszt CAŁOŚCI per sklep, rosnąco:
  //  leroy:     A 3*8000=24000 + B 2*4000=8000 = 32000
  //  castorama: A 3*9000=27000 + B 2*3000=6000 = 33000
  assert.equal(cmp.stores.length, 2);
  assert.equal(cmp.stores[0]!.store, "leroy-merlin");
  assert.equal(cmp.stores[0]!.totalGrosze, 32000);
  assert.equal(cmp.stores[0]!.coveredCount, 2);
  assert.equal(cmp.stores[0]!.missingCount, 0);
  assert.equal(cmp.stores[1]!.store, "castorama");
  assert.equal(cmp.stores[1]!.totalGrosze, 33000);

  // Najtańszy pełny sklep = leroy (32000); różnica vs koszyk optymalny = 2000.
  assert.equal(cmp.cheapestFullStore?.store, "leroy-merlin");
  assert.equal(cmp.cheapestFullStore?.totalGrosze, 32000);
  assert.equal(cmp.singleStoreExtraGrosze, 2000);
});

test("compareStores: sklep bez oferty na produkt => niepokryty i nie jest pełnym sklepem", async () => {
  const pA = product({ id: "A", ean: "1" });
  const pB = product({ id: "B", ean: "2" });
  const pC = product({ id: "C", ean: "3" });
  const deps = makeDeps({
    byCode: { "1": pA, "2": pB, "3": pC },
    offers: {
      A: [
        offer({ productId: "A", store: "leroy-merlin", price: "80.00", packageSize: "5" }),
        offer({ productId: "A", store: "castorama", price: "90.00", packageSize: "5" }),
      ],
      B: [
        offer({ productId: "B", store: "leroy-merlin", price: "40.00", packageSize: "10" }),
        offer({ productId: "B", store: "castorama", price: "30.00", packageSize: "10" }),
      ],
      C: [offer({ productId: "C", store: "leroy-merlin", price: "10.00", packageSize: "1" })],
    },
  });

  const stage = await estimateStageCost(
    db,
    [
      { query: { ean: "1" }, quantity: 12, unit: "l" },
      { query: { ean: "2" }, quantity: 12, unit: "l" },
      { query: { ean: "3" }, quantity: 2, unit: "szt" }, // tylko w leroy
    ],
    {},
    deps,
  );

  const cmp = compareStores([stage]);
  const castorama = cmp.stores.find((s) => s.store === "castorama")!;
  assert.equal(castorama.missingCount, 1);
  assert.deepEqual(castorama.missingProductIds, ["C"]);
  assert.equal(castorama.coveredCount, 2);

  const leroy = cmp.stores.find((s) => s.store === "leroy-merlin")!;
  assert.equal(leroy.missingCount, 0);
  assert.equal(leroy.coveredCount, 3);

  // Tylko leroy ma komplet => to jedyny pełny sklep.
  assert.equal(cmp.cheapestFullStore?.store, "leroy-merlin");
  // optimal: A leroy 24000 + B castorama 6000 + C leroy 2000 = 32000
  assert.equal(cmp.optimalBasketGrosze, 32000);
  // leroy total: 24000 + 8000 + 2000 = 34000 => extra 2000
  assert.equal(cmp.cheapestFullStore?.totalGrosze, 34000);
  assert.equal(cmp.singleStoreExtraGrosze, 2000);
});

test("compareStores: brak etapów -> puste porównanie", () => {
  const cmp = compareStores([]);
  assert.equal(cmp.productCount, 0);
  assert.equal(cmp.optimalBasketGrosze, 0);
  assert.deepEqual(cmp.optimalByStore, []);
  assert.deepEqual(cmp.stores, []);
  assert.equal(cmp.cheapestFullStore, null);
  assert.equal(cmp.singleStoreExtraGrosze, null);

  // estimateProjectCost dokłada storeComparison także dla pustego wejścia.
  assert.deepEqual(estimateProjectCost([]).storeComparison, cmp);
});

test("consolidateProject: pozycje nierozpoznane nie wchodzą do konsolidacji", async () => {
  const p = product({ id: "ok", ean: "1", packageSize: "1" });
  const deps = makeDeps({
    byCode: { "1": p }, // EAN "9" nieznany
    offers: { ok: [offer({ productId: "ok", price: "10.00", packageSize: "1" })] },
  });

  const stage = await estimateStageCost(
    db,
    [
      { query: { ean: "1" }, quantity: 2, unit: "szt" },
      { query: { ean: "9" }, quantity: 5, unit: "szt" }, // nierozpoznana
    ],
    {},
    deps,
  );

  const consolidated = consolidateProject([stage]);
  assert.equal(consolidated.lines.length, 1);
  assert.equal(consolidated.lines[0]!.product.id, "ok");
  assert.equal(consolidated.consolidatedTotalGrosze, 2000);
});
