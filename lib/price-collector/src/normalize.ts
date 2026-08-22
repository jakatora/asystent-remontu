// Czysta logika normalizacji danych ofert — bez I/O, w pełni testowalna.
// BasePriceSource i konkretne adaptery budują na tych funkcjach.

import type { NormalizedOffer } from "./types";

/**
 * Parsuje cenę do GROSZY (integer). Przyjmuje liczbę (traktowaną jako kwota w
 * walucie, np. 79.98 -> 7998) albo tekst z feedu/sklepu w formacie PL lub EN
 * ("79,98 zł", "1 299,00", "79.98", "1,299.00"). Zwraca null, gdy nie da się
 * odczytać skończonej, nieujemnej kwoty.
 */
export function parsePriceToGrosze(
  raw: string | number | null | undefined,
): number | null {
  if (raw === null || raw === undefined) return null;

  let amount: number;
  if (typeof raw === "number") {
    amount = raw;
  } else {
    // Zostaw tylko cyfry, separatory i minus (tnie "zł", "PLN", spacje, nbsp).
    const cleaned = raw.replace(/[^\d.,-]/g, "");
    if (cleaned === "") return null;

    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    let normalized: string;
    if (lastComma !== -1 && lastDot !== -1) {
      // Oba separatory obecne: prawy = dziesiętny, lewy = tysięczny (usuwamy).
      const decimalSep = lastComma > lastDot ? "," : ".";
      const thousandsSep = decimalSep === "," ? "." : ",";
      normalized = cleaned
        .split(thousandsSep)
        .join("")
        .replace(decimalSep, ".");
    } else if (lastComma !== -1) {
      // Sam przecinek = separator dziesiętny (konwencja PL).
      normalized = cleaned.replace(",", ".");
    } else {
      // Sama kropka (lub brak) = separator dziesiętny.
      normalized = cleaned;
    }
    amount = Number(normalized);
  }

  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

/** Trim + redukcja wielokrotnych białych znaków do pojedynczej spacji. */
export function normalizeName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

/** Normalizuje jednostkę: trim + lowercase (np. " L " -> "l"). Null gdy pusta. */
export function normalizeUnit(
  unit: string | null | undefined,
): string | null {
  if (unit === null || unit === undefined) return null;
  const u = unit.trim().toLowerCase();
  return u === "" ? null : u;
}

/**
 * Cena efektywna (grosze) = promocyjna, a gdy brak — zwykła cena sprzedażowa.
 * Null gdy oferta nie ma żadnej ceny.
 */
export function effectivePriceGrosze(offer: {
  price: number | null;
  promoPrice: number | null;
}): number | null {
  return offer.promoPrice ?? offer.price;
}

/**
 * Wylicza stawkę za jednostkę: grosze / wielkość opakowania. Liczona z ceny
 * EFEKTYWNEJ. Null, gdy brak ceny lub wielkość opakowania <= 0. Wynik może być
 * ułamkiem grosza (np. 7998 gr / 10 l = 799.8 gr/l).
 */
export function computePricePerUnitGrosze(
  effectiveGrosze: number | null,
  packageSize: number | null,
): number | null {
  if (effectiveGrosze === null) return null;
  if (packageSize === null || !(packageSize > 0)) return null;
  return effectiveGrosze / packageSize;
}

/** Grosze -> tekstowy numeric dla DAO, np. 7998 -> "79.98". */
export function groszeToAmountString(
  grosze: number | null,
  fractionDigits = 2,
): string | null {
  if (grosze === null) return null;
  return (grosze / 100).toFixed(fractionDigits);
}

/** Luźny kształt oferty z adaptera przed normalizacją cen/jednostek. */
export interface RawOfferInput {
  ean?: string | null;
  gtin?: string | null;
  manufacturer?: string | null;
  name: string;
  packageSize?: number | null;
  packageUnit?: string | null;
  price?: string | number | null;
  promoPrice?: string | number | null;
  regularPrice?: string | number | null;
  unit?: string | null;
  availability?: string | null;
  url?: string | null;
}

/**
 * Buduje w pełni znormalizowaną ofertę z surowego wejścia adaptera: parsuje
 * ceny do groszy, wylicza pricePerUnit, przycina nazwę i wstrzykuje slug/walutę.
 */
export function normalizeOffer(
  raw: RawOfferInput,
  ctx: { source: string; currency: string },
): NormalizedOffer {
  const price = parsePriceToGrosze(raw.price);
  const promoPrice = parsePriceToGrosze(raw.promoPrice);
  const regularPrice = parsePriceToGrosze(raw.regularPrice);
  const packageSize = raw.packageSize ?? null;
  const unit = normalizeUnit(raw.unit ?? raw.packageUnit);
  const pricePerUnit = computePricePerUnitGrosze(
    effectivePriceGrosze({ price, promoPrice }),
    packageSize,
  );

  return {
    ean: raw.ean ?? null,
    gtin: raw.gtin ?? null,
    manufacturer: raw.manufacturer ?? null,
    name: normalizeName(raw.name),
    packageSize,
    packageUnit: normalizeUnit(raw.packageUnit),
    price,
    promoPrice,
    regularPrice,
    pricePerUnit,
    unit,
    availability: raw.availability ?? null,
    currency: ctx.currency,
    url: raw.url ?? null,
    source: ctx.source,
  };
}
