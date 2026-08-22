// Serwis wyceny etapu i całego remontu — most między kalkulatorem a katalogiem
// cen. Dla każdej pozycji: dopasuj produkt (EAN/GTIN, potem nazwa+kategoria),
// wybierz NAJTAŃSZĄ aktualną ofertę, zaokrąglij ilość w górę do pełnych
// opakowań i policz koszt. Wszystko w GROSZACH (spójnie z price-collector).
//
// Zależności DAO są WSTRZYKIWANE (deps), żeby:
//   1) nie ładować singletona `db` (wymaga DATABASE_URL) przy imporcie,
//   2) testować logikę na atrapach bez realnego Postgresa.

import {
  findByEanOrGtin,
  findByNormalizedNameAndCategory,
  listOffersForProduct,
  type Database,
} from "@workspace/db/repositories";
import type { Product, ProductOffer } from "@workspace/db/schema";
import { parsePriceToGrosze } from "@workspace/price-collector";

import type {
  CheapestOffer,
  ConsolidatedLine,
  ConsolidatedShoppingList,
  EstimateItem,
  EstimateLine,
  EstimateOptions,
  ItemQuery,
  ProjectEstimate,
  ResolvedLine,
  StageEstimate,
  UnresolvedReason,
} from "./types";

/** Kontrakt na operacje DAO potrzebne do wyceny (read-only). */
export interface EstimateDeps {
  /** Produkt po EAN/GTIN (EAN pierwszy). null gdy brak dopasowania/kodów. */
  findProductByCode: (
    db: Database,
    code: { ean?: string | null; gtin?: string | null },
  ) => Promise<Product | null>;
  /** Produkt po DOKŁADNEJ nazwie + kategorii. null gdy brak dopasowania. */
  findProductByNameAndCategory: (
    db: Database,
    q: { normalizedName: string; category: string },
  ) => Promise<Product | null>;
  /** Wszystkie aktualne oferty produktu (dowolna kolejność). */
  listOffers: (db: Database, productId: string) => Promise<ProductOffer[]>;
}

const defaultDeps: EstimateDeps = {
  findProductByCode: async (db, code) =>
    (await findByEanOrGtin(db, code)) ?? null,
  findProductByNameAndCategory: async (db, q) =>
    (await findByNormalizedNameAndCategory(db, q.normalizedName, q.category)) ??
    null,
  listOffers: (db, productId) => listOffersForProduct(db, productId),
};

/**
 * Wybiera najtańszą ofertę po cenie EFEKTYWNEJ (promo ?? regular) w groszach.
 * Gdy podano `store` — bierze pod uwagę tylko oferty z tego sklepu. Oferty bez
 * ceny są pomijane. Zwraca null, gdy nie ma żadnej kwalifikującej się oferty.
 * Czysta funkcja — bez I/O, w pełni testowalna.
 */
export function selectCheapestOffer(
  offers: readonly ProductOffer[],
  store?: string | null,
): CheapestOffer | null {
  let best: CheapestOffer | null = null;
  for (const offer of offers) {
    if (store && offer.store !== store) continue;
    const unitPriceGrosze = parsePriceToGrosze(offer.promoPrice ?? offer.price);
    if (unitPriceGrosze === null) continue;
    if (best === null || unitPriceGrosze < best.unitPriceGrosze) {
      best = {
        offer,
        store: offer.store,
        url: offer.productUrl,
        unitPriceGrosze,
      };
    }
  }
  return best;
}

/**
 * Wielkość opakowania do zaokrąglania: preferuje `packageSize` OFERTY (konkretny
 * wariant sprzedaży), potem PRODUKTU. Gdy brak/niepoprawna (<= 0) — zwraca 1
 * (traktujemy cenę jako za pojedynczą sztukę). numeric w DAO to string.
 */
export function resolvePackageSize(
  offer: ProductOffer,
  product: Product,
): number {
  const raw = offer.packageSize ?? product.packageSize;
  const n = raw === null || raw === undefined ? NaN : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * Liczba pełnych opakowań potrzebna, by pokryć `quantity` — zaokrąglenie W GÓRĘ.
 * quantity <= 0 -> 0. packageSize <= 0 traktowane jak 1.
 */
export function computePackagesNeeded(
  quantity: number,
  packageSize: number,
): number {
  if (!(quantity > 0)) return 0;
  const size = packageSize > 0 ? packageSize : 1;
  return Math.ceil(quantity / size);
}

/** Wybiera produkt: NAJPIERW EAN/GTIN, potem nazwa+kategoria (obie wymagane). */
async function resolveProduct(
  db: Database,
  deps: EstimateDeps,
  query: ItemQuery,
): Promise<{ product: Product | null; hadCriteria: boolean }> {
  const ean = query.ean?.trim() || null;
  const gtin = query.gtin?.trim() || null;
  const name = query.normalizedName?.trim() || null;
  const category = query.category?.trim() || null;

  const hadCriteria = Boolean(ean || gtin || (name && category));
  if (!hadCriteria) return { product: null, hadCriteria: false };

  if (ean || gtin) {
    const byCode = await deps.findProductByCode(db, { ean, gtin });
    if (byCode) return { product: byCode, hadCriteria };
  }
  // Dopasowanie po nazwie WYŁĄCZNIE razem z kategorią (nigdy po samej nazwie).
  if (name && category) {
    const byName = await deps.findProductByNameAndCategory(db, {
      normalizedName: name,
      category,
    });
    if (byName) return { product: byName, hadCriteria };
  }
  return { product: null, hadCriteria };
}

async function estimateLine(
  db: Database,
  deps: EstimateDeps,
  item: EstimateItem,
  options: EstimateOptions,
): Promise<EstimateLine> {
  const unit = item.unit ?? null;
  const base = { query: item.query, quantity: item.quantity, unit };

  const { product, hadCriteria } = await resolveProduct(db, deps, item.query);
  if (!product) {
    const reason: UnresolvedReason = hadCriteria ? "no-product" : "no-query";
    return { resolved: false, ...base, reason, lineCost: 0 };
  }

  const offers = await deps.listOffers(db, product.id);
  const cheapestOffer = selectCheapestOffer(offers, options.store);
  if (!cheapestOffer) {
    return { resolved: false, ...base, reason: "no-offer", lineCost: 0 };
  }

  const packageSize = resolvePackageSize(cheapestOffer.offer, product);
  const packagesNeeded = computePackagesNeeded(item.quantity, packageSize);
  const lineCost = packagesNeeded * cheapestOffer.unitPriceGrosze;

  return {
    resolved: true,
    ...base,
    product,
    cheapestOffer,
    packageSize,
    packagesNeeded,
    lineCost,
  };
}

/**
 * Wycena JEDNEGO etapu remontu. Dla każdej pozycji dopasowuje produkt, wybiera
 * najtańszą aktualną ofertę i liczy koszt z uwzględnieniem opakowań. Pozycje
 * nierozpoznane trafiają do `unresolved[]` i NIE wchodzą do sumy etapu.
 */
export async function estimateStageCost(
  db: Database,
  items: readonly EstimateItem[],
  options: EstimateOptions = {},
  deps: EstimateDeps = defaultDeps,
): Promise<StageEstimate> {
  const lines: EstimateLine[] = [];
  for (const item of items) {
    lines.push(await estimateLine(db, deps, item, options));
  }

  const unresolved = lines.filter(
    (l): l is Extract<EstimateLine, { resolved: false }> => !l.resolved,
  );
  const stageTotalGrosze = lines.reduce((sum, l) => sum + l.lineCost, 0);

  return { lines, unresolved, stageTotalGrosze };
}

/**
 * Konsolidacja materiałów w całym remoncie („kup raz, licz opakowania łącznie").
 * Grupuje rozpoznane pozycje WSZYSTKICH etapów po produkcie (ten sam `product.id`
 * = ten sam produkt, niezależnie czy trafiony po EAN czy nazwie+kategorii),
 * SUMUJE ilości natywne i DOPIERO na zsumowanej ilości liczy opakowania i koszt.
 *
 * Czysta funkcja — bez I/O. Najtańsza oferta i wielkość opakowania są dla danego
 * produktu deterministyczne (te same oferty + ta sama opcja `store` w każdym
 * etapie), więc bierzemy je z pierwszej rozpoznanej pozycji produktu — nie ma
 * potrzeby ponownego odpytywania katalogu.
 *
 * Zaokrąglenie w górę raz na zsumowanej ilości jest zawsze <= sumie zaokrągleń
 * per-etap (ceil(a+b) <= ceil(a)+ceil(b)), więc `savingsGrosze` >= 0.
 */
export function consolidateProject(
  stages: readonly StageEstimate[],
): ConsolidatedShoppingList {
  interface Group {
    product: ResolvedLine["product"];
    cheapestOffer: CheapestOffer;
    packageSize: number;
    unit: string | null;
    totalQuantity: number;
    perStageCostGrosze: number;
  }
  const groups = new Map<string, Group>();

  for (const stage of stages) {
    for (const line of stage.lines) {
      if (!line.resolved) continue;
      const key = line.product.id;
      const existing = groups.get(key);
      if (existing) {
        existing.totalQuantity += line.quantity;
        existing.perStageCostGrosze += line.lineCost;
        if (existing.unit === null && line.unit !== null) existing.unit = line.unit;
      } else {
        groups.set(key, {
          product: line.product,
          cheapestOffer: line.cheapestOffer,
          packageSize: line.packageSize,
          unit: line.unit,
          totalQuantity: line.quantity,
          perStageCostGrosze: line.lineCost,
        });
      }
    }
  }

  const lines: ConsolidatedLine[] = [];
  for (const g of groups.values()) {
    const packagesNeeded = computePackagesNeeded(g.totalQuantity, g.packageSize);
    const lineCostGrosze = packagesNeeded * g.cheapestOffer.unitPriceGrosze;
    lines.push({
      product: g.product,
      cheapestOffer: g.cheapestOffer,
      totalQuantity: g.totalQuantity,
      unit: g.unit,
      packageSize: g.packageSize,
      packagesNeeded,
      lineCostGrosze,
      perStageCostGrosze: g.perStageCostGrosze,
      savingsGrosze: g.perStageCostGrosze - lineCostGrosze,
    });
  }

  const consolidatedTotalGrosze = lines.reduce((s, l) => s + l.lineCostGrosze, 0);
  const perStageTotalGrosze = lines.reduce((s, l) => s + l.perStageCostGrosze, 0);
  return {
    lines,
    consolidatedTotalGrosze,
    perStageTotalGrosze,
    savingsGrosze: perStageTotalGrosze - consolidatedTotalGrosze,
  };
}

/**
 * Sumuje już wyliczone etapy do wyceny całego remontu. Czysta agregacja — nie
 * odpytuje DB (etapy policz wcześniej przez estimateStageCost). Dokłada dwie
 * warstwy: koszt per-etap (`projectTotalGrosze`) ORAZ skonsolidowaną listę
 * zakupową całego remontu (`consolidated`, patrz consolidateProject).
 */
export function estimateProjectCost(
  stages: readonly StageEstimate[],
): ProjectEstimate {
  const projectTotalGrosze = stages.reduce(
    (sum, s) => sum + s.stageTotalGrosze,
    0,
  );
  return {
    stages: [...stages],
    projectTotalGrosze,
    consolidated: consolidateProject(stages),
  };
}
