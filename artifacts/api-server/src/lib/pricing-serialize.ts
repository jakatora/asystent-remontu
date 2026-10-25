// Serializacja wyniku wyceny do stabilnego JSON-a HTTP.
//
// KONWENCJA PIENIĘDZY: wszystkie kwoty w GROSZACH (integer), spójnie z
// @workspace/pricing-service. Pola kosztowe mają sufiks `Grosze`, żeby nie było
// wątpliwości co do jednostki. Serializer NIC nie przelicza ani nie zaokrągla —
// tylko wybiera pola i przepisuje liczby całkowite z serwisu wyceny 1:1.
//
// Pozycje nierozpoznane (brak produktu/oferty) NIE są ukrywane — trafiają do
// odpowiedzi z `resolved:false` i `reason`, żeby klient widział, czego nie
// dało się wycenić (a nie tylko zaniżoną sumę).
import type {
  ConsolidatedLine,
  ConsolidatedShoppingList,
  EstimateLine,
  ItemQuery,
  LaborLine,
  ProjectEstimate,
  StageEstimate,
  StageEstimateFromCalculation,
  StageLaborEstimate,
  StoreComparison,
  UnresolvedReason,
} from "@workspace/pricing-service";
import {
  effectivePriceGrosze,
  priceToGrosze,
  type PriceHistory,
  type PriceStatsGrosze,
  type Product,
  type ProductOffer,
} from "@workspace/db/repositories";

export interface SerializedProduct {
  imageUrl?: string | null;
  id: string;
  name: string;
  ean: string | null;
  gtin: string | null;
  category: string | null;
  /** numeric z bazy jest stringiem (albo null). */
  packageSize: string | null;
  packageUnit: string | null;
}

export interface SerializedOffer {
  offerId: string;
  store: string;
  url: string | null;
  /** Cena efektywna (promo ?? regular) za jedno opakowanie, w GROSZACH. */
  unitPriceGrosze: number;
}

/**
 * Pojedyncza oferta produktu w konkretnym sklepie — do porównania cen per produkt
 * na ekranie wyceny (Sklep A/B/C + najtańszy). Wszystkie kwoty w GROSZACH.
 * Serializer NIC nie liczy poza konwersją numeric(string PLN) -> grosze
 * (priceToGrosze); nie decyduje o „najtańszej" (to robi kolejność listy).
 */
export interface SerializedProductOffer {
  packageSize?: string | null;
  offerId: string;
  store: string;
  url: string | null;
  /** Cena aktualna (efektywna: promo ?? price) za opakowanie, w GROSZACH; null gdy brak. */
  priceGrosze: number | null;
  /** Cena regularna („była", przekreślana przy promocji), w GROSZACH; null gdy brak. */
  regularPriceGrosze: number | null;
  /** Cena za jednostkę odniesienia (zł/l, zł/szt) w GROSZACH; null gdy brak. */
  pricePerUnitGrosze: number | null;
  /** Jednostka opakowania/odniesienia (np. "l", "szt"); null gdy brak. */
  unit: string | null;
  /** Dostępność — surowy tekst ze sklepu (np. "in_stock"); null gdy brak. */
  availability: string | null;
  /** Moment pobrania ceny (ISO 8601 UTC) z kolumny offers.fetched_at; null gdy brak. */
  fetchedAt: string | null;
  /** Źródło danych oferty (np. "Leroy Merlin — feed") z kolumny offers.source; null gdy brak. */
  source: string | null;
}

/**
 * Jedna wybrana wielkość opakowania w optymalnym doborze zakupu (np. „2× 10 l").
 * Wszystkie kwoty w GROSZACH. Serializer przepisuje pola 1:1 z PackagePlanEntry.
 */
export interface SerializedPackage {
  /** Wielkość pojedynczego opakowania (w jednostce materiału, np. 10 = 10 l). */
  packageSize: number;
  /** Ile sztuk tego opakowania kupić (>= 1). */
  count: number;
  /** Cena jednego opakowania w GROSZACH. */
  unitPriceGrosze: number;
  /** Koszt tej pozycji = count * unitPriceGrosze (GROSZE). */
  lineCostGrosze: number;
  /** Sklep najtańszej oferty tej wielkości. */
  store: string;
  /** URL oferty (może być null). */
  url: string | null;
}

export interface SerializedLine {
  resolved: boolean;
  quantity: number;
  unit: string | null;
  /** Kryteria dopasowania (traceability: co próbowaliśmy dopasować). */
  query: ItemQuery;
  /** Koszt pozycji w GROSZACH (0 dla nierozpoznanych). */
  lineCostGrosze: number;
  // --- tylko dla resolved: true ---
  product?: SerializedProduct;
  cheapestOffer?: SerializedOffer;
  /**
   * Optymalny dobór wielkości opakowań: najtańsza KOMBINACJA rozmiarów pokrywająca
   * ilość (np. 2× 10 l + 1× 5 l), zamiast jednego rozmiaru × sufit. Obecne dla
   * resolved: true. Kwoty w GROSZACH.
   */
  packages?: SerializedPackage[];
  /** Łączny koszt optymalnej kombinacji opakowań w GROSZACH (suma packages[].lineCostGrosze). */
  packagesTotalGrosze?: number;
  /**
   * Oszczędność optymalnego doboru vs wycena naiwna (jeden rozmiar × sufit) =
   * lineCostGrosze - packagesTotalGrosze, w GROSZACH. >= 0. 0 gdy jedna wielkość.
   */
  packagesSavingsGrosze?: number;
  /** Naddatek optymalnej kombinacji = pokryta ilość - wymagana (w jednostkach materiału). */
  packagesOverage?: number;
  /**
   * WSZYSTKIE oferty dopasowanego produktu, POSORTOWANE od najtańszej (pierwsza =
   * najtańsza, spójna z `cheapestOffer`). Do porównania cen per produkt w UI.
   * Oferty bez ceny (priceGrosze === null) trafiają na koniec (nie da się ich
   * porównać, ale pokazują sklep/dostępność). Obecne tylko dla resolved: true.
   */
  offers?: SerializedProductOffer[];
  /** Wielkość opakowania użyta do zaokrąglenia w górę. */
  packageSize?: number;
  /** Liczba pełnych opakowań do kupienia. */
  packagesNeeded?: number;
  // --- tylko dla resolved: false ---
  reason?: UnresolvedReason;
}

/**
 * Jedna pozycja ROBOCIZNY etapu (m²/mb/szt × stawka). Kwoty w GROSZACH. Pozycje
 * nieoszacowane (`estimated: false`) mają `lineCostGrosze: 0` i NIE wchodzą do
 * `laborTotalGrosze` — ale są zwracane, żeby klient widział, czego nie policzono.
 */
export interface SerializedLaborLine {
  laborId: string;
  renovationJobId: string;
  regionCode: string;
  laborUnit: string;
  /** Ilość z obmiarów użyta do wyceny (m²/mb/szt); 0 gdy nieoszacowana. */
  quantity: number;
  /** Stawka bazowa w GROSZACH za jednostkę. */
  unitPriceGrosze: number;
  /** Koszt pozycji w GROSZACH (0 gdy nieoszacowana). */
  lineCostGrosze: number;
  /** true = policzona; false = nieoszacowana. */
  estimated: boolean;
  /** Powód, gdy `estimated === false` (no-rate/no-region-rate/no-quantity). */
  reason?: string;
  /** true, gdy użyto stawki 'lodzkie' mimo żądania innego regionu. */
  regionFallback?: boolean;
  /** Atrybucja źródła stawki (name + type + opcjonalny url + lastUpdated). */
  source: { name: string; type: string; url?: string; lastUpdated: string };
  notes?: string;
}

/** Rozbicie robocizny etapu (pozycje + suma oszacowanych + licznik nieoszacowanych). */
export interface SerializedStageLabor {
  jobId: string;
  regionCode: string;
  lines: SerializedLaborLine[];
  /** Suma pozycji OSZACOWANYCH, w GROSZACH. */
  laborTotalGrosze: number;
  unestimatedCount: number;
}

export interface SerializedStage {
  jobId?: string;
  lines: SerializedLine[];
  /** Ile pozycji nie udało się wycenić. */
  unresolvedCount: number;
  /** Suma kosztów rozpoznanych MATERIAŁÓW etapu, w GROSZACH (bez zmian znaczenia). */
  stageTotalGrosze: number;
  // ── ADDYTYWNE: rozbicie na materiały + robociznę ──
  /** Koszt materiałów etapu (= `stageTotalGrosze`), w GROSZACH. */
  materialsTotalGrosze?: number;
  /** Koszt robocizny etapu (suma pozycji oszacowanych), w GROSZACH. */
  laborTotalGrosze?: number;
  /** Pełny koszt etapu = materiały + robocizna, w GROSZACH. */
  stageTotalWithLaborGrosze?: number;
  /** Szczegóły robocizny (pozycje, źródła, nieoszacowane). */
  labor?: SerializedStageLabor;
}

/** Skonsolidowana pozycja zakupowa całego remontu (jeden produkt ze wszystkich etapów). */
export interface SerializedConsolidatedLine {
  packages?: SerializedPackage[];
  product: SerializedProduct;
  cheapestOffer: SerializedOffer;
  /** Łączna ilość natywna zsumowana ze wszystkich etapów (przed zaokrągleniem). */
  totalQuantity: number;
  unit: string | null;
  /** Wielkość opakowania użyta do zaokrąglenia w górę. */
  packageSize: number;
  /** Liczba pełnych opakowań policzona RAZ na zsumowanej ilości. */
  packagesNeeded: number;
  /** Koszt skonsolidowany, w GROSZACH. */
  lineCostGrosze: number;
  /** Suma kosztów per-etap tego produktu (osobne zaokrąglenia), w GROSZACH. */
  perStageCostGrosze: number;
  /** Oszczędność vs suma per-etap = perStageCostGrosze - lineCostGrosze, w GROSZACH. */
  savingsGrosze: number;
}

/** Skonsolidowana lista zakupowa całego remontu + łączna oszczędność. */
export interface SerializedConsolidatedList {
  lines: SerializedConsolidatedLine[];
  /** Suma po konsolidacji (zaokrąglenie do opakowań raz na produkt), w GROSZACH. */
  consolidatedTotalGrosze: number;
  /** Suma bez konsolidacji (zaokrąglenia per-etap) = projectTotalGrosze, w GROSZACH. */
  perStageTotalGrosze: number;
  /** Łączna oszczędność = perStageTotalGrosze - consolidatedTotalGrosze, w GROSZACH. */
  savingsGrosze: number;
}

/** Koszt kupienia całej listy w jednym sklepie (z niepokrytymi pozycjami). */
export interface SerializedStoreBasket {
  store: string;
  /** Suma kosztów pozycji, które sklep pokrywa, w GROSZACH. */
  totalGrosze: number;
  coveredCount: number;
  missingCount: number;
  /** ID produktów niepokrytych w tym sklepie (puste przy pełnym pokryciu). */
  missingProductIds: string[];
}

/** Fragment koszyka optymalnego pochodzący z jednego sklepu. */
export interface SerializedOptimalStoreLine {
  store: string;
  /** Suma najtańszych pozycji z tego sklepu, w GROSZACH. */
  totalGrosze: number;
  itemCount: number;
}

/** Porównanie sklepów: koszt całości per sklep vs koszyk optymalny. */
export interface SerializedStoreComparison {
  productCount: number;
  /** Koszyk optymalny = suma najtańszych ofert per produkt, w GROSZACH. */
  optimalBasketGrosze: number;
  optimalByStore: SerializedOptimalStoreLine[];
  /** Koszt całości per sklep, rosnąco po totalGrosze. */
  stores: SerializedStoreBasket[];
  /** Najtańszy sklep z pełnym pokryciem, albo null. */
  cheapestFullStore: SerializedStoreBasket | null;
  /** Ile więcej niż koszyk optymalny kosztuje najtańszy pełny sklep (GROSZE), albo null. */
  singleStoreExtraGrosze: number | null;
}

export interface SerializedProject {
  stages: SerializedStage[];
  /** Suma MATERIAŁÓW wszystkich etapów, w GROSZACH (bez zmian znaczenia). */
  projectTotalGrosze: number;
  // ── ADDYTYWNE: rozbicie całego remontu na materiały + robociznę ──
  /** Koszt materiałów całego remontu (= `projectTotalGrosze`), w GROSZACH. */
  materialsTotalGrosze?: number;
  /** Suma robocizny wszystkich etapów (pozycje oszacowane), w GROSZACH. */
  laborTotalGrosze?: number;
  /** Pełny koszt remontu = materiały + robocizna, w GROSZACH. */
  projectTotalWithLaborGrosze?: number;
  /** Skonsolidowana lista zakupowa całego remontu (kup raz, licz opakowania łącznie). */
  consolidated: SerializedConsolidatedList;
  /** Porównanie sklepów: koszt całości per sklep + koszyk optymalny + najtańszy sklep. */
  storeComparison: SerializedStoreComparison;
}

/** Wspólna serializacja produktu do stabilnego kształtu HTTP (id + kody + opakowanie). */
function serializeProduct(product: {
  imageUrl?: string | null;
  id: string;
  name: string;
  ean: string | null;
  gtin: string | null;
  category: string | null;
  packageSize: string | null;
  packageUnit: string | null;
}): SerializedProduct {
  return {
    ...(product.imageUrl ? { imageUrl: product.imageUrl } : {}),
    id: product.id,
    name: product.name,
    ean: product.ean,
    gtin: product.gtin,
    category: product.category,
    packageSize: product.packageSize,
    packageUnit: product.packageUnit,
  };
}

/** Serializuje jedną ofertę produktu do porównania cen (kwoty numeric -> grosze). */
function serializeProductOffer(offer: ProductOffer): SerializedProductOffer {
  return {
    packageSize: offer.packageSize,
    offerId: offer.id,
    store: offer.store,
    url: offer.productUrl,
    // Cena aktualna = efektywna (promo ?? price), spójnie z selectCheapestOffer.
    priceGrosze: priceToGrosze(offer.promoPrice ?? offer.price),
    regularPriceGrosze: priceToGrosze(offer.regularPrice),
    pricePerUnitGrosze: priceToGrosze(offer.pricePerUnit),
    unit: offer.unit,
    availability: offer.availability,
    // Świeżość i pochodzenie ceny — przepisywane 1:1 z rekordu oferty (nie zgadujemy).
    fetchedAt: offer.fetchedAt ? offer.fetchedAt.toISOString() : null,
    source: offer.source,
  };
}

/**
 * Serializuje i SORTUJE oferty produktu rosnąco po cenie aktualnej (najtańsza
 * pierwsza). Oferty bez ceny (priceGrosze === null) idą na koniec — nie da się
 * ich porównać, ale zostają, by pokazać sklep/dostępność. Stabilnie: przy równej
 * cenie zachowujemy kolejność wejściową (deterministyczne oferty produktu).
 */
function serializeOffers(
  offers: readonly ProductOffer[],
): SerializedProductOffer[] {
  return offers
    .map(serializeProductOffer)
    .sort((a, b) => {
      if (a.priceGrosze === null && b.priceGrosze === null) return 0;
      if (a.priceGrosze === null) return 1;
      if (b.priceGrosze === null) return -1;
      return a.priceGrosze - b.priceGrosze;
    });
}

function serializeLine(line: EstimateLine): SerializedLine {
  const base = {
    quantity: line.quantity,
    unit: line.unit,
    query: line.query,
  };

  if (!line.resolved) {
    return {
      resolved: false,
      ...base,
      reason: line.reason,
      lineCostGrosze: 0,
    };
  }

  return {
    resolved: true,
    ...base,
    lineCostGrosze: line.lineCost,
    product: serializeProduct(line.product),
    cheapestOffer: {
      offerId: line.cheapestOffer.offer.id,
      store: line.cheapestOffer.store,
      url: line.cheapestOffer.url,
      unitPriceGrosze: line.cheapestOffer.unitPriceGrosze,
    },
    offers: serializeOffers(line.offers),
    packageSize: line.packageSize,
    packagesNeeded: line.packagesNeeded,
    packages: line.packagePlan.packages.map((p) => ({
      packageSize: p.packageSize,
      count: p.count,
      unitPriceGrosze: p.unitPriceGrosze,
      lineCostGrosze: p.lineCostGrosze,
      store: p.store,
      url: p.url,
    })),
    packagesTotalGrosze: line.packagePlan.totalGrosze,
    // Oszczędność vs wycena naiwna (lineCost = pojedynczy rozmiar × sufit). >= 0,
    // bo kombinacja jest zawsze co najmniej tak dobra jak jeden rozmiar.
    packagesSavingsGrosze: line.lineCost - line.packagePlan.totalGrosze,
    packagesOverage: line.packagePlan.overage,
  };
}

/** Serializuje jedną pozycję robocizny (kwoty 1:1 w groszach, źródło przepisane). */
function serializeLaborLine(line: LaborLine): SerializedLaborLine {
  return {
    laborId: line.laborId,
    renovationJobId: line.renovationJobId,
    regionCode: line.regionCode,
    laborUnit: line.laborUnit,
    quantity: line.quantity,
    unitPriceGrosze: line.unitPriceGrosze,
    lineCostGrosze: line.lineCostGrosze,
    estimated: line.estimated,
    ...(line.reason !== undefined ? { reason: line.reason } : {}),
    ...(line.regionFallback ? { regionFallback: true } : {}),
    source: {
      name: line.source.name,
      type: line.source.type,
      ...(line.source.url !== undefined ? { url: line.source.url } : {}),
      lastUpdated: line.source.lastUpdated,
    },
    ...(line.notes !== undefined ? { notes: line.notes } : {}),
  };
}

/** Serializuje rozbicie robocizny etapu (pozycje + suma oszacowanych). */
function serializeStageLabor(labor: StageLaborEstimate): SerializedStageLabor {
  return {
    jobId: labor.jobId,
    regionCode: labor.regionCode,
    lines: labor.lines.map(serializeLaborLine),
    laborTotalGrosze: labor.laborTotalGrosze,
    unestimatedCount: labor.unestimatedCount,
  };
}

/** Serializuje wycenę jednego etapu (jobId dołączany, gdy pochodzi z kalkulatora). */
export function serializeStage(
  stage: StageEstimate & { jobId?: string },
): SerializedStage {
  const materialsTotalGrosze = stage.stageTotalGrosze;
  return {
    ...(stage.jobId !== undefined ? { jobId: stage.jobId } : {}),
    lines: stage.lines.map(serializeLine),
    unresolvedCount: stage.unresolved.length,
    stageTotalGrosze: stage.stageTotalGrosze,
    // Robocizna jest ADDYTYWNA — obecna, gdy etap pochodzi z adaptera kalkulatora.
    ...(stage.labor !== undefined
      ? {
          materialsTotalGrosze,
          laborTotalGrosze: stage.laborTotalGrosze ?? 0,
          stageTotalWithLaborGrosze:
            stage.stageTotalWithLaborGrosze ??
            materialsTotalGrosze + (stage.laborTotalGrosze ?? 0),
          labor: serializeStageLabor(stage.labor),
        }
      : {}),
  };
}

function serializeConsolidatedLine(
  line: ConsolidatedLine,
): SerializedConsolidatedLine {
  return {
    ...(line.packagePlan ? { packages: line.packagePlan.packages.map(entry => ({
      packageSize: entry.packageSize, count: entry.count, unitPriceGrosze: entry.unitPriceGrosze,
      lineCostGrosze: entry.lineCostGrosze, store: entry.store, url: entry.url,
    })) } : {}),
    product: serializeProduct(line.product),
    cheapestOffer: {
      offerId: line.cheapestOffer.offer.id,
      store: line.cheapestOffer.store,
      url: line.cheapestOffer.url,
      unitPriceGrosze: line.cheapestOffer.unitPriceGrosze,
    },
    totalQuantity: line.totalQuantity,
    unit: line.unit,
    packageSize: line.packageSize,
    packagesNeeded: line.packagesNeeded,
    lineCostGrosze: line.lineCostGrosze,
    perStageCostGrosze: line.perStageCostGrosze,
    savingsGrosze: line.savingsGrosze,
  };
}

/** Serializuje skonsolidowaną listę zakupową całego remontu (kwoty 1:1 w groszach). */
function serializeConsolidated(
  consolidated: ConsolidatedShoppingList,
): SerializedConsolidatedList {
  return {
    lines: consolidated.lines.map(serializeConsolidatedLine),
    consolidatedTotalGrosze: consolidated.consolidatedTotalGrosze,
    perStageTotalGrosze: consolidated.perStageTotalGrosze,
    savingsGrosze: consolidated.savingsGrosze,
  };
}

/**
 * Serializuje porównanie sklepów. Struktura jest już czysto liczbowa (grosze) —
 * serializer przepisuje pola 1:1, nic nie licząc ani nie zaokrąglając.
 */
function serializeStoreComparison(
  cmp: StoreComparison,
): SerializedStoreComparison {
  return {
    productCount: cmp.productCount,
    optimalBasketGrosze: cmp.optimalBasketGrosze,
    optimalByStore: cmp.optimalByStore.map((s) => ({
      store: s.store,
      totalGrosze: s.totalGrosze,
      itemCount: s.itemCount,
    })),
    stores: cmp.stores.map((s) => ({
      store: s.store,
      totalGrosze: s.totalGrosze,
      coveredCount: s.coveredCount,
      missingCount: s.missingCount,
      missingProductIds: [...s.missingProductIds],
    })),
    cheapestFullStore: cmp.cheapestFullStore
      ? {
          store: cmp.cheapestFullStore.store,
          totalGrosze: cmp.cheapestFullStore.totalGrosze,
          coveredCount: cmp.cheapestFullStore.coveredCount,
          missingCount: cmp.cheapestFullStore.missingCount,
          missingProductIds: [...cmp.cheapestFullStore.missingProductIds],
        }
      : null,
    singleStoreExtraGrosze: cmp.singleStoreExtraGrosze,
  };
}

/** Serializuje wycenę całego remontu (suma etapów + skonsolidowana lista zakupowa). */
export function serializeProject(
  project: ProjectEstimate & { stages: StageEstimateFromCalculation[] },
): SerializedProject {
  const laborTotalGrosze = project.laborTotalGrosze ?? 0;
  return {
    stages: project.stages.map(serializeStage),
    projectTotalGrosze: project.projectTotalGrosze,
    materialsTotalGrosze: project.materialsTotalGrosze ?? project.projectTotalGrosze,
    laborTotalGrosze,
    projectTotalWithLaborGrosze:
      project.projectTotalWithLaborGrosze ??
      project.projectTotalGrosze + laborTotalGrosze,
    consolidated: serializeConsolidated(project.consolidated),
    storeComparison: serializeStoreComparison(project.storeComparison),
  };
}

// ─── Historia cen (warstwa ODCZYTU: GET /pricing/history) ──────────────────────
//
// Wszystkie kwoty w GROSZACH, spójnie z resztą wyceny. Serializer NIE liczy
// statystyk — bierze gotowy PriceStatsGrosze z DAO (liczone po stronie SQL/agregacji)
// i przepisuje 1:1. Punkty historii dostają cenę efektywną w groszach do wykresu.

/** Statystyki cen produktu w GROSZACH (kontrakt HTTP = PriceStatsGrosze z DAO). */
export type SerializedPriceStats = PriceStatsGrosze;

export interface SerializedHistoryPoint {
  store: string;
  source: string | null;
  /** ISO 8601 (UTC) — moment odczytu ceny. */
  fetchedAt: string;
  /** Cena regularna w GROSZACH (null gdy brak). */
  priceGrosze: number | null;
  /** Cena promocyjna w GROSZACH (null gdy brak). */
  promoPriceGrosze: number | null;
  /** Cena efektywna (promo ?? regular) w GROSZACH (null gdy brak). */
  effectiveGrosze: number | null;
}

export interface SerializedPriceHistory {
  product: SerializedProduct;
  stats: SerializedPriceStats;
  /** Punkty historii chronologicznie (najstarsze najpierw). */
  history: SerializedHistoryPoint[];
}

function serializeHistoryPoint(row: PriceHistory): SerializedHistoryPoint {
  return {
    store: row.store,
    source: row.source,
    fetchedAt: row.fetchedAt.toISOString(),
    priceGrosze: priceToGrosze(row.price),
    promoPriceGrosze: priceToGrosze(row.promoPrice),
    effectiveGrosze: effectivePriceGrosze(row),
  };
}

/**
 * Serializuje odczyt historii cen produktu: produkt + statystyki (grosze) +
 * chronologiczna lista punktów. Kwoty przepisywane 1:1 z DAO/heleprów — bez
 * ponownego liczenia po stronie HTTP.
 */
export function serializePriceHistory(
  product: Product,
  stats: PriceStatsGrosze,
  history: readonly PriceHistory[],
): SerializedPriceHistory {
  return {
    product: serializeProduct(product),
    stats,
    history: history.map(serializeHistoryPoint),
  };
}
