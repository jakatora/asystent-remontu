// Adapter sklepu Leroy Merlin PL. Czyta lokalny fixture z realnymi danymi
// (patrz leroy-merlin.fixture.ts po uzasadnienie). Cała normalizacja cen/nazw
// dzieje się w BasePriceSource — tu jest tylko mapowanie kształtu źródła.

import { BasePriceSource } from "../base-source";
import type { NormalizedOffer, NormalizedProduct } from "../types";
import {
  LEROY_MERLIN_FIXTURE,
  type LeroyFixtureRecord,
} from "./leroy-merlin.fixture";

export class LeroyMerlinSource extends BasePriceSource {
  readonly slug = "leroy-merlin";
  readonly displayName = "Leroy Merlin";

  // Źródło danych wstrzykiwalne (domyślnie fixture) — ułatwia testy i podmianę
  // na przyszły feed API/XML bez zmiany reszty adaptera.
  private readonly records: readonly LeroyFixtureRecord[];

  constructor(records: readonly LeroyFixtureRecord[] = LEROY_MERLIN_FIXTURE) {
    super();
    this.records = records;
  }

  async fetchProducts(): Promise<NormalizedProduct[]> {
    return this.records.map((r) => ({
      ean: r.ean,
      gtin: r.gtin,
      manufacturer: r.manufacturer,
      brand: r.brand,
      name: this.normalizeName(r.name),
      category: r.category,
      packageSize: r.packageSize,
      packageUnit: r.packageUnit,
      imageUrl: r.imageUrl,
      productUrl: r.productUrl,
    }));
  }

  async fetchOffers(): Promise<NormalizedOffer[]> {
    return this.records.map((r) =>
      this.toOffer({
        ean: r.ean,
        gtin: r.gtin,
        manufacturer: r.manufacturer,
        name: r.name,
        packageSize: r.packageSize,
        packageUnit: r.packageUnit,
        price: r.price,
        promoPrice: r.promoPrice,
        regularPrice: r.regularPrice,
        unit: r.packageUnit,
        availability: r.availability,
        url: r.productUrl,
      }),
    );
  }
}
