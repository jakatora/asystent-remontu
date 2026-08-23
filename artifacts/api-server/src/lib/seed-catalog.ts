// Seed katalogu produktów z danych referencyjnych mobile
// (artifacts/mobile/data/prices/materials.ts) do realnych tabel `products` +
// `product_offers`. Cel: żeby wycena (estimateStage/ProjectCostFromCalculation)
// przestała zwracać materiały jako "nierozpoznane" i liczyła koszt na PEŁNYM
// katalogu, a nie na jednym EAN z fixture.
//
// Materiały referencyjne NIE mają kodów EAN/GTIN, więc:
//   - produkt dedupujemy po (znormalizowana nazwa + kategoria) przez
//     upsertByNormalizedNameAndCategory (idempotentny re-seed),
//   - oferta startowa idzie przez istniejące upsertOffer (dedup po
//     produkt+sklep+URL), co automatycznie zasila price_history przy zmianie ceny.
//
// Ceny w ofertach trzymamy jako numeric w ZŁOTÓWKACH (string "54.98") — tak jak
// zbiera je price-collector (groszeToAmountString) i tak jak czyta je estimate.ts
// (parsePriceToGrosze). Kwoty referencyjne z materials.ts są już w złotówkach.
//
// Zależności DAO są WSTRZYKIWANE (deps), żeby testować orkiestrator na atrapach
// bez realnego Postgresa (spójnie z price-collector/orchestrator.ts).

import {
  upsertByNormalizedNameAndCategory,
  upsertOffer,
  type Database,
} from "@workspace/db/repositories";
import type { Product, ProductOffer } from "@workspace/db/schema";

import { getEanOverlay } from "./ean-overlay";

/** Znacznik źródła oferty startowej — odróżnia seed od cen zebranych ze sklepów. */
export const SEED_OFFER_SOURCE = "reference-seed";

/**
 * Minimalny kształt materiału referencyjnego z materials.ts, który nas obchodzi.
 * Odwzorowuje `MaterialPriceReference` (types/pricing.ts) w zakresie pól seeda —
 * definiujemy go lokalnie, żeby nie importować typu z pakietu mobile.
 */
export interface SeedMaterial {
  readonly id: string;
  readonly materialType: string;
  readonly productLabel: string;
  readonly brand?: string;
  readonly packageSize: number;
  readonly packageUnit: string;
  readonly pricePerPackage: number;
  readonly pricePerM2?: number;
  readonly pricePerL?: number;
  readonly pricePerKg?: number;
  readonly pricePerMb?: number;
  readonly category: string; // economy | standard | better (tier jakości)
  readonly storeName: string;
  readonly sourceUrl?: string;
  readonly lastUpdated: string;
  readonly currency: string;
  readonly notes?: string;
  readonly regionSensitivityNote?: string;
}

/** Kontrakt na operacje DAO potrzebne seedowi (wstrzykiwane w testach). */
export interface SeedDeps {
  upsertProduct: (db: Database, input: unknown) => Promise<Product>;
  upsertOffer: (db: Database, input: unknown) => Promise<ProductOffer>;
}

const defaultDeps: SeedDeps = {
  upsertProduct: upsertByNormalizedNameAndCategory,
  upsertOffer,
};

export interface SeedResult {
  materialsProcessed: number;
  /** Produkty faktycznie zapisane (utworzone lub zaktualizowane). */
  productsUpserted: number;
  /** Produkty utworzone jako NOWE wpisy (best-effort: created_at == updated_at). */
  productsCreated: number;
  offersUpserted: number;
  /** Materiały, które się nie zapisały (label + komunikat błędu). */
  errors: Array<{ material: string; message: string }>;
}

/** numeric(package_size) w DAO jest tekstem — konwertujemy liczbę na string. */
function packageSizeToString(size: number): string {
  return String(size);
}

/** Cena jako numeric(10,2): zawsze 2 miejsca po przecinku (albo null). */
function toAmountString(value: number | null | undefined): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  return value.toFixed(2);
}

/**
 * Cena za jednostkę opakowania (numeric(12,4)). Liczymy pricePerPackage /
 * packageSize, gdy packageSize > 0 — inaczej null (nie zgadujemy).
 */
export function computePricePerUnit(m: SeedMaterial): string | null {
  if (!(m.packageSize > 0) || !Number.isFinite(m.pricePerPackage)) return null;
  return (m.pricePerPackage / m.packageSize).toFixed(4);
}

/**
 * Buduje parametry techniczne (jsonb) z pól, które nie mają własnej kolumny —
 * zachowuje traceability do rekordu źródłowego i ceny referencyjne per jednostka.
 * Pomija pola nieustawione, żeby nie zaśmiecać obiektu wartościami null.
 */
export function buildTechnicalParameters(
  m: SeedMaterial,
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    referenceId: m.id,
    materialType: m.materialType,
    tier: m.category,
    currency: m.currency,
    lastUpdated: m.lastUpdated,
  };
  if (m.pricePerM2 !== undefined) params.pricePerM2 = m.pricePerM2;
  if (m.pricePerL !== undefined) params.pricePerL = m.pricePerL;
  if (m.pricePerKg !== undefined) params.pricePerKg = m.pricePerKg;
  if (m.pricePerMb !== undefined) params.pricePerMb = m.pricePerMb;
  if (m.notes !== undefined) params.notes = m.notes;
  if (m.regionSensitivityNote !== undefined) {
    params.regionSensitivityNote = m.regionSensitivityNote;
  }
  return params;
}

/**
 * Mapuje materiał referencyjny na wejście produktu katalogowego.
 * - category = materialType (stabilny rodzaj: paint/primer/tile/...),
 * - subcategory = tier jakości (economy/standard/better),
 * - ean/gtin = z nakładki `MATERIAL_EAN_OVERLAY` (potwierdzone ≥2 źródłami) albo
 *   null, gdy brak pewnego kodu — NIGDY nie zmyślamy kodów (CLAUDE.md priorytet 1),
 * - variant/manufacturer = z nakładki, gdy zna konkretny wariant/producenta,
 * - productUrl = sourceUrl materiału, w drugiej kolejności realny link z nakładki.
 *
 * Kod EAN pozwala `upsertProductWithMatch` dopiąć ofertę z feedu do TEGO materiału
 * po kodzie (a nie tylko przez kruchy fallback nazwa+kategoria).
 */
export function materialToProductInput(m: SeedMaterial): Record<string, unknown> {
  const overlay = getEanOverlay(m.id);
  return {
    ean: overlay?.ean ?? null,
    gtin: overlay?.gtin ?? null,
    manufacturer: overlay?.manufacturer ?? null,
    brand: m.brand ?? null,
    name: m.productLabel,
    category: m.materialType,
    subcategory: m.category,
    variant: overlay?.variant ?? null,
    packageSize: packageSizeToString(m.packageSize),
    packageUnit: m.packageUnit,
    technicalParameters: buildTechnicalParameters(m),
    imageUrl: null,
    productUrl: m.sourceUrl ?? overlay?.productUrl ?? null,
  };
}

/**
 * Mapuje materiał referencyjny na wejście oferty startowej. Cena regularna =
 * pricePerPackage (bez promocji). Źródło = 'reference-seed'.
 */
export function materialToOfferInput(
  m: SeedMaterial,
  productId: string,
): Record<string, unknown> {
  const price = toAmountString(m.pricePerPackage);
  return {
    productId,
    store: m.storeName,
    price,
    promoPrice: null,
    regularPrice: price,
    unit: m.packageUnit,
    packageSize: packageSizeToString(m.packageSize),
    pricePerUnit: computePricePerUnit(m),
    productUrl: m.sourceUrl ?? null,
    availability: null,
    source: SEED_OFFER_SOURCE,
  };
}

/**
 * Produkt jest "świeżo utworzony", gdy created_at == updated_at (repo ustawia
 * updated_at = teraz przy KAŻDEJ aktualizacji). Metryka best-effort, tylko do
 * raportu — nie steruje logiką (spójnie z price-collector/orchestrator).
 */
function wasCreated(product: Product): boolean {
  return product.createdAt.getTime() === product.updatedAt.getTime();
}

/**
 * Seeduje katalog: dla każdego materiału upsertuje produkt (po nazwie+kategorii)
 * i dopisuje ofertę startową. Błąd pojedynczego materiału nie przerywa całości —
 * trafia do `errors[]`. Idempotentne: ponowne uruchomienie aktualizuje te same
 * rekordy i dokłada wpis do price_history tylko przy ZMIANIE ceny.
 */
export async function seedCatalog(
  db: Database,
  materials: readonly SeedMaterial[],
  deps: SeedDeps = defaultDeps,
): Promise<SeedResult> {
  const result: SeedResult = {
    materialsProcessed: 0,
    productsUpserted: 0,
    productsCreated: 0,
    offersUpserted: 0,
    errors: [],
  };

  for (const m of materials) {
    result.materialsProcessed += 1;
    try {
      const product = await deps.upsertProduct(db, materialToProductInput(m));
      result.productsUpserted += 1;
      if (wasCreated(product)) result.productsCreated += 1;

      await deps.upsertOffer(db, materialToOfferInput(m, product.id));
      result.offersUpserted += 1;
    } catch (err) {
      result.errors.push({
        material: m.productLabel,
        message: (err as Error)?.message ?? String(err),
      });
    }
  }

  return result;
}
