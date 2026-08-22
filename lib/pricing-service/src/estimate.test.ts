import assert from "node:assert/strict";
import { test } from "node:test";

import type { Database } from "@workspace/db/repositories";
import type { Product, ProductOffer } from "@workspace/db/schema";

import {
  computePackagesNeeded,
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
  assert.equal(estimateProjectCost([]).projectTotalGrosze, 0);
});
