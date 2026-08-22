import assert from "node:assert/strict";
import { test } from "node:test";

import {
  computePricePerUnitGrosze,
  effectivePriceGrosze,
  groszeToAmountString,
  normalizeName,
  normalizeOffer,
  normalizeUnit,
  parsePriceToGrosze,
} from "./normalize";

test("parsePriceToGrosze: liczba PLN -> grosze", () => {
  assert.equal(parsePriceToGrosze(79.98), 7998);
  assert.equal(parsePriceToGrosze(145), 14500);
  assert.equal(parsePriceToGrosze(0), 0);
});

test("parsePriceToGrosze: format PL (przecinek, zł, spacja tysięczna)", () => {
  assert.equal(parsePriceToGrosze("79,98"), 7998);
  assert.equal(parsePriceToGrosze("79,98 zł"), 7998);
  assert.equal(parsePriceToGrosze("1 299,00 zł"), 129900);
  assert.equal(parsePriceToGrosze("1 299,00 PLN"), 129900); // nbsp
});

test("parsePriceToGrosze: format EN (kropka dziesiętna, przecinek tysięczny)", () => {
  assert.equal(parsePriceToGrosze("79.98"), 7998);
  assert.equal(parsePriceToGrosze("1,299.00"), 129900);
});

test("parsePriceToGrosze: brak/niepoprawne/ujemne -> null", () => {
  assert.equal(parsePriceToGrosze(null), null);
  assert.equal(parsePriceToGrosze(undefined), null);
  assert.equal(parsePriceToGrosze(""), null);
  assert.equal(parsePriceToGrosze("brak ceny"), null);
  assert.equal(parsePriceToGrosze(-5), null);
});

test("normalizeName: trim i redukcja whitespace", () => {
  assert.equal(normalizeName("  Farba   Śnieżka  Eko "), "Farba Śnieżka Eko");
  assert.equal(normalizeName("Max\tWhite\nEffect"), "Max White Effect");
});

test("normalizeUnit: trim + lowercase, puste -> null", () => {
  assert.equal(normalizeUnit(" L "), "l");
  assert.equal(normalizeUnit("KG"), "kg");
  assert.equal(normalizeUnit(""), null);
  assert.equal(normalizeUnit(null), null);
});

test("effectivePriceGrosze: promo bije cenę, brak -> null", () => {
  assert.equal(effectivePriceGrosze({ price: 2000, promoPrice: 1550 }), 1550);
  assert.equal(effectivePriceGrosze({ price: 2000, promoPrice: null }), 2000);
  assert.equal(effectivePriceGrosze({ price: null, promoPrice: null }), null);
});

test("computePricePerUnitGrosze: grosze / opakowanie, guard na 0/null", () => {
  assert.equal(computePricePerUnitGrosze(7998, 10), 799.8);
  assert.equal(computePricePerUnitGrosze(7998, 0), null);
  assert.equal(computePricePerUnitGrosze(7998, null), null);
  assert.equal(computePricePerUnitGrosze(null, 10), null);
});

test("groszeToAmountString: grosze -> tekstowy numeric", () => {
  assert.equal(groszeToAmountString(7998), "79.98");
  assert.equal(groszeToAmountString(14500), "145.00");
  assert.equal(groszeToAmountString(799.8, 4), "7.9980");
  assert.equal(groszeToAmountString(null), null);
});

test("normalizeOffer: parsuje ceny, liczy pricePerUnit, wstrzykuje slug/walutę", () => {
  const offer = normalizeOffer(
    {
      ean: "5903973005797",
      name: "  Farba  Eko 10 l ",
      packageSize: 10,
      packageUnit: "l",
      price: "79,98 zł",
      url: "https://example.pl/p",
    },
    { source: "leroy-merlin", currency: "PLN" },
  );
  assert.equal(offer.ean, "5903973005797");
  assert.equal(offer.name, "Farba Eko 10 l");
  assert.equal(offer.price, 7998);
  assert.equal(offer.promoPrice, null);
  assert.equal(offer.pricePerUnit, 799.8);
  assert.equal(offer.unit, "l");
  assert.equal(offer.currency, "PLN");
  assert.equal(offer.source, "leroy-merlin");
});
