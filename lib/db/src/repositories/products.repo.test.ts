import assert from "node:assert/strict";
import { test } from "node:test";

import type { Database } from "./types";
import type { Product } from "../schema/products";
import { buildEnrichmentPatch } from "./helpers";
import { upsertProductWithMatch } from "./products.repo";

// ─── Atrapa Drizzle ──────────────────────────────────────────────────────────
// upsertProductWithMatch to cienki wrapper nad zapytaniami: select (po EAN, potem
// po nazwie+kategorii) → update ALBO insert. Atrapa nie parsuje SQL — zwraca
// wyniki SELECT-ów w kolejności wywołań i przechwytuje set()/values(), dzięki
// czemu jednoznacznie widać, którą gałąź wybrano (update = dopięcie, insert =
// duplikat) i jaki patch poleciał do bazy.
function makeFakeDb(selectResults: unknown[][]) {
  const cap = {
    selectCount: 0,
    updates: [] as Array<Record<string, unknown>>,
    inserts: [] as Array<Record<string, unknown>>,
  };

  const db = {
    select() {
      const idx = cap.selectCount++;
      const builder: Record<string, unknown> = {
        from: () => builder,
        where: () => builder,
        orderBy: () => builder,
        limit: () => Promise.resolve(selectResults[idx] ?? []),
      };
      return builder;
    },
    update() {
      let set: Record<string, unknown> = {};
      const builder: Record<string, unknown> = {
        set: (v: Record<string, unknown>) => {
          set = v;
          return builder;
        },
        where: () => builder,
        returning: () => {
          cap.updates.push(set);
          return Promise.resolve([{ id: "matched-id", ...set }]);
        },
      };
      return builder;
    },
    insert() {
      let values: Record<string, unknown> = {};
      const builder: Record<string, unknown> = {
        values: (v: Record<string, unknown>) => {
          values = v;
          return builder;
        },
        returning: () => {
          cap.inserts.push(values);
          return Promise.resolve([{ id: "new-id", ...values }]);
        },
      };
      return builder;
    },
  };

  return { db: db as unknown as Database, cap };
}

// Materiał zaseedowany z katalogu referencyjnego: BEZ kodu EAN, ma nazwę,
// kategorię i markę, ale brak zdjęcia/URL (typowy stan po seedzie z materials.ts).
function seededProduct(): Product {
  return {
    id: "seed-id",
    ean: null,
    gtin: null,
    manufacturer: null,
    brand: "Śnieżka",
    name: "Farba Śnieżka Eko",
    normalizedName: "farba sniezka eko",
    category: "farby-scienne-biale",
    subcategory: "standard",
    variant: null,
    packageSize: "10",
    packageUnit: "l",
    technicalParameters: null,
    imageUrl: null,
    productUrl: null,
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
  } as unknown as Product;
}

// Wejście z realnego feedu: TEN SAM materiał, ale już z EAN, zdjęciem i URL.
function feedInput() {
  return {
    ean: "5903973005797",
    gtin: null,
    manufacturer: "Śnieżka",
    brand: "MarkaZFeedu", // istniejąca marka NIE może zostać nadpisana
    name: "Farba Śnieżka Eko",
    category: "farby-scienne-biale",
    packageSize: "10",
    packageUnit: "l",
    imageUrl: "https://example.pl/img.jpg",
    productUrl: "https://example.pl/p",
  };
}

test("upsertProductWithMatch: feed z EAN DOPINA się do zaseedowanego materiału bez EAN (bez duplikatu)", async () => {
  // SELECT #1 (po EAN) — brak; SELECT #2 (nazwa+kategoria) — trafia w seed.
  const { db, cap } = makeFakeDb([[], [seededProduct()]]);

  const result = await upsertProductWithMatch(db, feedInput());

  // Kluczowe: aktualizacja istniejącego rekordu, ŻADNEGO insertu (brak duplikatu).
  assert.equal(cap.inserts.length, 0);
  assert.equal(cap.updates.length, 1);
  assert.equal(result.id, "matched-id");

  const patch = cap.updates[0]!;
  // Puste pola seeda zostają uzupełnione danymi z feedu.
  assert.equal(patch.ean, "5903973005797");
  assert.equal(patch.imageUrl, "https://example.pl/img.jpg");
  assert.equal(patch.productUrl, "https://example.pl/p");
  assert.equal(patch.manufacturer, "Śnieżka");
  // Istniejąca marka NIE jest nadpisywana (feed miał inną).
  assert.equal("brand" in patch, false);
  // Nazwa/kategoria katalogu nie są ruszane fallbackiem.
  assert.equal("name" in patch, false);
  assert.equal("category" in patch, false);
  // updatedAt bumpowane → orkiestrator policzy to jako „matched", nie „created".
  assert.ok(patch.updatedAt instanceof Date);
});

test("upsertProductWithMatch: dopasowanie po EAN → pełna aktualizacja (jak dotąd)", async () => {
  const existing = { ...seededProduct(), id: "by-ean", ean: "111" } as Product;
  const { db, cap } = makeFakeDb([[existing]]); // SELECT #1 (po EAN) trafia

  const input = { ...feedInput(), ean: "111" };
  const result = await upsertProductWithMatch(db, input);

  assert.equal(cap.inserts.length, 0);
  assert.equal(cap.updates.length, 1);
  assert.equal(result.id, "matched-id");
  // Gałąź EAN pisze pełny zestaw wartości (nie tylko patch).
  const set = cap.updates[0]!;
  assert.equal(set.name, "Farba Śnieżka Eko");
  assert.equal(set.category, "farby-scienne-biale");
  assert.equal(set.ean, "111");
});

test("upsertProductWithMatch: brak dopasowania po EAN i po nazwie+kategorii → nowy rekord", async () => {
  const { db, cap } = makeFakeDb([[], []]); // oba SELECT-y puste

  const result = await upsertProductWithMatch(db, { ...feedInput(), ean: "999" });

  assert.equal(cap.updates.length, 0);
  assert.equal(cap.inserts.length, 1);
  assert.equal(result.id, "new-id");
  assert.equal(cap.inserts[0]!.ean, "999");
});

test("upsertProductWithMatch: bez kodu i bez kategorii NIE łączy po samej nazwie → nowy rekord", async () => {
  const { db, cap } = makeFakeDb([]); // żaden SELECT nie powinien się wykonać

  const result = await upsertProductWithMatch(db, {
    ean: null,
    gtin: null,
    name: "Farba Śnieżka Eko",
    category: null,
  });

  assert.equal(cap.selectCount, 0); // ani lookup po EAN, ani po nazwie+kategorii
  assert.equal(cap.updates.length, 0);
  assert.equal(cap.inserts.length, 1);
  assert.equal(result.id, "new-id");
});

test("buildEnrichmentPatch: uzupełnia tylko puste pola, nie nadpisuje istniejących", () => {
  const patch = buildEnrichmentPatch(
    { ean: null, brand: "A", imageUrl: "   ", productUrl: "https://old" },
    {
      ean: "123",
      brand: "B",
      imageUrl: "https://new.jpg",
      productUrl: "https://feed",
    },
  );
  assert.deepEqual(patch, { ean: "123", imageUrl: "https://new.jpg" });
});

test("buildEnrichmentPatch: brak czego dodać → pusty patch", () => {
  const patch = buildEnrichmentPatch(
    { ean: "1", brand: "A", imageUrl: "https://x" },
    { ean: null, brand: undefined, imageUrl: "   " },
  );
  assert.deepEqual(patch, {});
});
