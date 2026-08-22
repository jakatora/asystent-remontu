// Parser REALNEGO feedu produktowego w formacie XML (Google Merchant / RSS 2.0
// z przestrzenią nazw `g:` — kształt publikowany przez sklepy PL do porównywarek
// cen). Zastępuje wariant fixture: adapter Mrówki, dostając URL feedu, pobiera go
// LEGALNIE po HTTP i parsuje tym modułem.
//
// DLACZEGO własny, wąski parser (bez zależności XML): moduł price-collector jest
// bezzależnościowy i czysty (patrz package.json). Feed Google Merchant ma bardzo
// regularną strukturę `<item>...</item>` z płaskimi tagami, więc bezpieczny,
// celowany ekstraktor tagów wystarcza i pozostaje w pełni testowalny bez sieci.
//
// OSTROŻNE PARSOWANIE: brak wymaganych pól (title/link) => POMIŃ ofertę (nie rzucaj,
// nie zgaduj). Zepsuty pojedynczy item nie wywraca całego feedu.

import { parseMrowkaFeed, type ProductFeedItem } from "./mrowka.feed";

/** Rozwija encje XML i CDATA na czysty tekst. `&amp;` rozwijamy jako ostatnie. */
function decodeXmlText(raw: string): string {
  // Pełne CDATA -> zwróć surową zawartość (bez rozwijania encji w środku).
  const cdataOnly = raw.trim().match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  if (cdataOnly) return cdataOnly[1]!.trim();

  return raw
    // Wnętrza CDATA (gdy zmieszane z tekstem) wnieś dosłownie.
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_m, dec: string) =>
      String.fromCodePoint(Number(dec)),
    )
    .replace(/&amp;/g, "&")
    .trim();
}

/** Escapuje znaki specjalne regexu w nazwie tagu (m.in. `:` w `g:price`). */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Zwraca zawartość PIERWSZEGO z podanych tagów w bloku (dopasowanie
 * bez rozróżniania wielkości liter, dowolne atrybuty w otwierającym tagu).
 * null, gdy żaden tag nie występuje albo jego treść jest pusta.
 */
function firstTagContent(block: string, tagNames: readonly string[]): string | null {
  for (const name of tagNames) {
    const tag = escapeRegExp(name);
    const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
    const m = block.match(re);
    if (m) {
      const text = decodeXmlText(m[1]!);
      if (text !== "") return text;
    }
  }
  return null;
}

/**
 * Rozdziela wartość ceny z feedu na kwotę i (opcjonalnie) walutę ISO-4217.
 * Google Merchant podaje cenę jako "86.99 PLN" / "86,99 zł". Kwotę zostawiamy
 * SUROWĄ (string) — do groszy skonwertuje parsePriceToGrosze. `zł` mapujemy na PLN.
 */
export function splitPriceCurrency(
  raw: string | null | undefined,
): { amount: string | null; currency: string | null } {
  if (raw == null) return { amount: null, currency: null };
  const trimmed = raw.trim();
  if (trimmed === "") return { amount: null, currency: null };

  let currency: string | null = null;
  const iso = trimmed.match(/([A-Za-z]{3})\s*$/);
  if (iso) currency = iso[1]!.toUpperCase();
  else if (/z[łl]\s*$/i.test(trimmed)) currency = "PLN";

  return { amount: trimmed, currency };
}

/** Wyodrębnia bloki `<item>...</item>` z dokumentu (bez zagnieżdżeń w feedach GM). */
function extractItemBlocks(xml: string): string[] {
  const blocks: string[] = [];
  const re = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    blocks.push(m[1]!);
  }
  return blocks;
}

/**
 * Parsuje feed XML (Google Merchant / RSS 2.0) na `ProductFeedItem[]`.
 *
 * OSTROŻNIE: item bez `title` LUB bez `link` jest POMIJANY (nie zgadujemy, nie
 * rzucamy) — narastamy tylko wiarygodne oferty. Brakujące pola opcjonalne => null.
 * Nazwy tagów obsługujemy zarówno w wariancie z prefiksem `g:`, jak i bez.
 */
export function parseMrowkaFeedXml(xmlText: string): ProductFeedItem[] {
  const blocks = extractItemBlocks(xmlText);
  const items: ProductFeedItem[] = [];

  for (const block of blocks) {
    const title = firstTagContent(block, ["g:title", "title"]);
    const link = firstTagContent(block, ["g:link", "link"]);
    // Wymagane minimum do wiarygodnej oferty — inaczej pomijamy item.
    if (title == null || link == null) continue;

    const { amount: priceAmount, currency: priceCurrency } = splitPriceCurrency(
      firstTagContent(block, ["g:price", "price"]),
    );
    const { amount: saleAmount, currency: saleCurrency } = splitPriceCurrency(
      firstTagContent(block, ["g:sale_price", "sale_price"]),
    );

    items.push({
      gtin: firstTagContent(block, ["g:gtin", "gtin"]),
      mpn: firstTagContent(block, ["g:mpn", "mpn"]),
      title,
      brand: firstTagContent(block, ["g:brand", "brand"]),
      productType: firstTagContent(block, [
        "g:product_type",
        "product_type",
        "g:google_product_category",
      ]),
      link,
      imageLink: firstTagContent(block, ["g:image_link", "image_link"]),
      price: priceAmount,
      salePrice: saleAmount,
      availability: firstTagContent(block, ["g:availability", "availability"]),
      unitPricingMeasure: firstTagContent(block, [
        "g:unit_pricing_measure",
        "unit_pricing_measure",
      ]),
      currency: priceCurrency ?? saleCurrency ?? null,
    });
  }

  return items;
}

/**
 * Auto-detekcja formatu feedu: XML (zaczyna się od `<`) -> parseMrowkaFeedXml,
 * w innym wypadku JSON -> parseMrowkaFeed. Pozwala temu samemu adapterowi
 * konsumować realny feed XML sklepu i wariant JSON (np. fixture/testy).
 */
export function parseMrowkaFeedAuto(text: string): ProductFeedItem[] {
  // XML (feed produktowy sklepu) vs JSON (fixture/testy). Import jednokierunkowy
  // (ten plik -> mrowka.feed), więc bez cyklu.
  if (text.trimStart().startsWith("<")) {
    return parseMrowkaFeedXml(text);
  }
  return parseMrowkaFeed(text);
}
