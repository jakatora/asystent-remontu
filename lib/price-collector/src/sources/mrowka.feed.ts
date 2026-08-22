// Warstwa feedu produktowego dla adaptera PSB Mrówka.
//
// DLACZEGO feed, a nie scraping: sklepy PL publikują produktowe feedy (format
// zgodny z Google Merchant / porównywarkami cen, np. Ceneo) do LEGALNEGO
// pobierania oferty. Adapter Mrówki konsumuje właśnie taki kształt itemu feedu
// — nie omijamy żadnych zabezpieczeń, tylko parsujemy oficjalnie udostępniany
// katalog. `parseMrowkaFeed` jest czystą funkcją (bez I/O), więc łatwo testowalną;
// pobranie po HTTP (gdy ustawiony MROWKA_FEED_URL) dzieje się na granicy (CLI /
// endpoint), a nie w tym module.

import { normalizeName } from "../normalize";
import type { NormalizedProduct } from "../types";
import type { RawOfferInput } from "../normalize";

/**
 * Pojedynczy produkt z feedu (pola nazwane jak w Google Merchant / typowych
 * feedach porównywarek). Kwoty są SUROWE (string/number) — normalizację do
 * groszy robi BasePriceSource przy budowie oferty.
 */
export interface ProductFeedItem {
  /** EAN-13 z feedu (Google Merchant: g:gtin). null gdy sklep go nie podaje. */
  gtin?: string | null;
  /** MPN / kod producenta (opcjonalny). */
  mpn?: string | null;
  /** Nazwa handlowa (g:title). */
  title: string;
  brand?: string | null;
  /** Ścieżka kategorii sklepu (g:product_type), np. "Farby > Ścienne > Białe". */
  productType?: string | null;
  /** URL strony produktu (g:link). */
  link: string;
  /** URL zdjęcia (g:image_link). */
  imageLink?: string | null;
  /** Cena regularna (g:price), np. "86,99 zł" / "86.99 PLN" / 86.99. */
  price?: string | number | null;
  /** Cena promocyjna (g:sale_price); null gdy brak promocji. */
  salePrice?: string | number | null;
  /** Dostępność (g:availability), np. "in_stock" / "out_of_stock". */
  availability?: string | null;
  /** Wielkość opakowania (g:unit_pricing_measure), np. "10 l". */
  unitPricingMeasure?: string | null;
}

/** Mapa polskich znaków diakrytycznych na ASCII dla slugów kategorii. */
const PL_DIACRITICS: Record<string, string> = {
  ą: "a", ć: "c", ę: "e", ł: "l", ń: "n",
  ó: "o", ś: "s", ż: "z", ź: "z",
};

/**
 * Slugifikuje tekst kategorii do formatu katalogu (np. "Farby ścienne białe"
 * -> "farby-scienne-biale"). Zachowuje spójność z kategoriami z innych sklepów.
 */
export function slugifyCategory(value: string): string {
  const lower = value.toLowerCase();
  let out = "";
  for (const ch of lower) {
    out += PL_DIACRITICS[ch] ?? ch;
  }
  return out
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Mapuje `product_type` feedu na kategorię katalogu: bierze OSTATNI segment
 * ścieżki (najbardziej szczegółowy) i slugifikuje. Zwraca null dla pustego.
 */
export function mapFeedCategory(
  productType: string | null | undefined,
): string | null {
  if (productType == null) return null;
  const segments = productType.split(/[>/›|]/).map((s) => s.trim()).filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return null;
  const slug = slugifyCategory(last);
  return slug === "" ? null : slug;
}

/**
 * Parsuje "10 l" / "0,75 kg" -> { size, unit }. Zwraca null-e, gdy nie da się
 * odczytać liczby (np. brak pola). Separator dziesiętny PL (przecinek) OK.
 */
export function parseUnitMeasure(
  measure: string | null | undefined,
): { size: number | null; unit: string | null } {
  if (measure == null) return { size: null, unit: null };
  const m = measure.trim().match(/^([\d.,]+)\s*([a-zżźćńółęąś]*)$/i);
  if (!m) return { size: null, unit: null };
  const size = Number(m[1]!.replace(",", "."));
  const unit = m[2] ? m[2].toLowerCase() : null;
  return {
    size: Number.isFinite(size) ? size : null,
    unit,
  };
}

/**
 * Parsuje tekst feedu (JSON: tablica itemów) na `ProductFeedItem[]`. Rzuca, gdy
 * JSON jest nieprawidłowy, gdy korzeń nie jest tablicą albo gdy któryś item nie
 * ma wymaganych pól (`title` + `link`) — fail-loud, żeby zepsuty feed nie
 * przeszedł cicho.
 */
export function parseMrowkaFeed(jsonText: string): ProductFeedItem[] {
  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(
      `parseMrowkaFeed: nieprawidłowy JSON feedu: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
  if (!Array.isArray(data)) {
    throw new Error("parseMrowkaFeed: korzeń feedu musi być tablicą itemów");
  }
  return data.map((raw, i) => {
    if (typeof raw !== "object" || raw === null) {
      throw new Error(`parseMrowkaFeed: item[${i}] nie jest obiektem`);
    }
    const item = raw as Record<string, unknown>;
    if (typeof item.title !== "string" || item.title.trim() === "") {
      throw new Error(`parseMrowkaFeed: item[${i}] brak pola title`);
    }
    if (typeof item.link !== "string" || item.link.trim() === "") {
      throw new Error(`parseMrowkaFeed: item[${i}] brak pola link`);
    }
    return {
      gtin: typeof item.gtin === "string" ? item.gtin : null,
      mpn: typeof item.mpn === "string" ? item.mpn : null,
      title: item.title,
      brand: typeof item.brand === "string" ? item.brand : null,
      productType:
        typeof item.productType === "string" ? item.productType : null,
      link: item.link,
      imageLink: typeof item.imageLink === "string" ? item.imageLink : null,
      price:
        typeof item.price === "string" || typeof item.price === "number"
          ? item.price
          : null,
      salePrice:
        typeof item.salePrice === "string" || typeof item.salePrice === "number"
          ? item.salePrice
          : null,
      availability:
        typeof item.availability === "string" ? item.availability : null,
      unitPricingMeasure:
        typeof item.unitPricingMeasure === "string"
          ? item.unitPricingMeasure
          : null,
    } satisfies ProductFeedItem;
  });
}

/**
 * Feed używa EAN-13 w polu `gtin`. W katalogu traktujemy 13-cyfrowy kod jako
 * `ean` (spójnie z adapterem Leroy Merlin), a `gtin` zostawiamy dla kodów, które
 * sklep jawnie odróżnia. Tu feed nie rozróżnia, więc gtin katalogowe = null.
 */
export function feedItemToProduct(item: ProductFeedItem): NormalizedProduct {
  const { size, unit } = parseUnitMeasure(item.unitPricingMeasure);
  return {
    ean: item.gtin ?? null,
    gtin: null,
    manufacturer: item.brand ?? null,
    brand: item.brand ?? null,
    name: normalizeName(item.title),
    category: mapFeedCategory(item.productType),
    packageSize: size,
    packageUnit: unit,
    imageUrl: item.imageLink ?? null,
    productUrl: item.link,
  };
}

/**
 * Buduje SUROWE wejście oferty z itemu feedu. Semantyka cen Google Merchant:
 * `price` = cena regularna, `sale_price` = promocja. Mapujemy tak, by cena
 * efektywna (promo ?? price) wyszła poprawnie: gdy jest promocja, `price` to
 * cena regularna, a `promoPrice` = sale_price.
 */
export function feedItemToRawOffer(item: ProductFeedItem): RawOfferInput {
  const { size, unit } = parseUnitMeasure(item.unitPricingMeasure);
  const hasSale = item.salePrice != null && item.salePrice !== "";
  return {
    ean: item.gtin ?? null,
    gtin: null,
    manufacturer: item.brand ?? null,
    name: item.title,
    packageSize: size,
    packageUnit: unit,
    price: item.price ?? null,
    promoPrice: hasSale ? item.salePrice : null,
    regularPrice: hasSale ? (item.price ?? null) : null,
    unit,
    availability: item.availability ?? null,
    url: item.link,
  };
}
