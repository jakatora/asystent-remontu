import assert from "node:assert/strict";
import { test } from "node:test";

import {
  parseMrowkaFeedXml,
  parseMrowkaFeedAuto,
  splitPriceCurrency,
} from "./mrowka.feed.xml";
import { MrowkaSource } from "./mrowka.source";
import { feedItemToRawOffer } from "./mrowka.feed";

// Realistyczny kształt feedu Google Merchant / RSS 2.0 z przestrzenią `g:`.
// Item 1 kompletny (EAN wspólny z Leroy), item 2 z promocją, item 3 CELOWO bez
// linku (musi zostać POMINIĘTY — ostrożne parsowanie, bez zgadywania).
const GM_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>PSB Mrówka</title>
    <item>
      <g:id>43071</g:id>
      <g:gtin>5903973005797</g:gtin>
      <title><![CDATA[Farba Akrylowa Eko Biała 10 l Śnieżka]]></title>
      <g:brand>Śnieżka</g:brand>
      <g:product_type>Farby &gt; Farby ścienne &gt; Białe</g:product_type>
      <link>https://mrowkaonline.pl/bilgoraj/farby-scienne-biale/43071.html</link>
      <g:image_link>https://mrowkaonline.pl/img/43071.jpg</g:image_link>
      <g:price>86.99 PLN</g:price>
      <g:availability>in stock</g:availability>
      <g:unit_pricing_measure>10 l</g:unit_pricing_measure>
    </item>
    <item>
      <g:gtin>1111111111116</g:gtin>
      <title>Grunt głęboko penetrujący 5 l</title>
      <g:brand>Atlas</g:brand>
      <g:product_type>Chemia budowlana &gt; Grunty</g:product_type>
      <link>https://mrowkaonline.pl/x/grunt.html</link>
      <g:price>59,99 zł</g:price>
      <g:sale_price>49,99 zł</g:sale_price>
      <g:availability>in stock</g:availability>
      <g:unit_pricing_measure>5 l</g:unit_pricing_measure>
    </item>
    <item>
      <g:gtin>0000000000000</g:gtin>
      <title>Produkt bez linku (do pominięcia)</title>
      <g:price>10,00 zł</g:price>
    </item>
  </channel>
</rss>`;

test("parseMrowkaFeedXml: parsuje itemy Google Merchant i pomija te bez linku", () => {
  const items = parseMrowkaFeedXml(GM_FEED);
  // 3 itemy w feedzie, ale ostatni bez <link> -> pominięty.
  assert.equal(items.length, 2);

  const first = items[0]!;
  assert.equal(first.gtin, "5903973005797");
  assert.equal(first.title, "Farba Akrylowa Eko Biała 10 l Śnieżka"); // CDATA rozwinięte
  assert.equal(first.brand, "Śnieżka");
  assert.equal(first.productType, "Farby > Farby ścienne > Białe"); // encje rozwinięte
  assert.equal(first.link, "https://mrowkaonline.pl/bilgoraj/farby-scienne-biale/43071.html");
  assert.equal(first.imageLink, "https://mrowkaonline.pl/img/43071.jpg");
  assert.equal(first.price, "86.99 PLN");
  assert.equal(first.salePrice, null);
  assert.equal(first.availability, "in stock");
  assert.equal(first.unitPricingMeasure, "10 l");
  assert.equal(first.currency, "PLN");
});

test("parseMrowkaFeedXml: item bez tytułu też jest pomijany (bez rzucania)", () => {
  const xml = `<rss><channel>
    <item><link>https://a/b.html</link><g:price>5 zł</g:price></item>
  </channel></rss>`;
  assert.doesNotThrow(() => parseMrowkaFeedXml(xml));
  assert.equal(parseMrowkaFeedXml(xml).length, 0);
});

test("parseMrowkaFeedXml: pusty/ni-itemowy XML -> pusta lista", () => {
  assert.deepEqual(parseMrowkaFeedXml("<rss><channel></channel></rss>"), []);
});

test("splitPriceCurrency: rozdziela kwotę i walutę (PLN / zł / brak)", () => {
  assert.deepEqual(splitPriceCurrency("86.99 PLN"), {
    amount: "86.99 PLN",
    currency: "PLN",
  });
  assert.deepEqual(splitPriceCurrency("49,99 zł"), {
    amount: "49,99 zł",
    currency: "PLN",
  });
  assert.deepEqual(splitPriceCurrency("100"), { amount: "100", currency: null });
  assert.deepEqual(splitPriceCurrency(null), { amount: null, currency: null });
});

test("feedItemToRawOffer: promocja z feedu XML mapuje sale_price jako promoPrice", () => {
  const items = parseMrowkaFeedXml(GM_FEED);
  const grunt = items[1]!;
  const raw = feedItemToRawOffer(grunt);
  assert.equal(raw.price, "59,99 zł"); // regularna
  assert.equal(raw.promoPrice, "49,99 zł"); // promocja
  assert.equal(raw.regularPrice, "59,99 zł");
});

test("MrowkaSource z feedu XML: oferta w groszach, waluta z feedu, cena efektywna = promo", async () => {
  const src = new MrowkaSource(parseMrowkaFeedXml(GM_FEED));
  const offers = await src.fetchOffers();
  assert.equal(offers.length, 2);

  const farba = offers.find((o) => o.ean === "5903973005797")!;
  assert.equal(farba.price, 8699);
  assert.equal(farba.currency, "PLN");
  assert.equal(farba.packageSize, 10);
  assert.equal(farba.unit, "l");

  const grunt = offers.find((o) => o.ean === "1111111111116")!;
  assert.equal(grunt.price, 5999);
  assert.equal(grunt.promoPrice, 4999);
  assert.equal(grunt.pricePerUnit, 4999 / 5); // z ceny efektywnej (promo)
});

test("parseMrowkaFeedAuto: wykrywa XML vs JSON", () => {
  assert.equal(parseMrowkaFeedAuto(GM_FEED).length, 2);
  const json = JSON.stringify([
    { gtin: "5903973005797", title: "X 10 l", link: "https://a/x.html", price: "80,00" },
  ]);
  assert.equal(parseMrowkaFeedAuto(json).length, 1);
});
