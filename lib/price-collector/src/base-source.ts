// Abstrakcyjna baza adapterów sklepów. Trzyma slug/currency i udostępnia
// wspólną normalizację (parsowanie ceny do groszy, wyliczenie ceny za
// jednostkę, trim/normalizacja nazwy). Konkretny adapter dostarcza tylko
// surowe dane (z API, feedu XML/JSON albo lokalnego fixture).

import {
  normalizeName,
  normalizeOffer,
  parsePriceToGrosze,
  type RawOfferInput,
} from "./normalize";
import type { NormalizedOffer, NormalizedProduct, PriceSource } from "./types";

export abstract class BasePriceSource implements PriceSource {
  abstract readonly slug: string;
  abstract readonly displayName: string;
  /** Waluta ofert sklepu (domyślnie PLN). Nadpisywalna w podklasie. */
  protected readonly currency: string = "PLN";

  abstract fetchProducts(): Promise<NormalizedProduct[]>;
  abstract fetchOffers(): Promise<NormalizedOffer[]>;

  /** Parsowanie ceny do groszy — współdzielone przez adaptery. */
  protected parsePrice(raw: string | number | null | undefined): number | null {
    return parsePriceToGrosze(raw);
  }

  /** Trim/normalizacja nazwy handlowej. */
  protected normalizeName(name: string): string {
    return normalizeName(name);
  }

  /**
   * Zamienia surowe wejście na znormalizowaną ofertę, wstrzykując slug sklepu
   * i walutę. Adaptery wołają to na każdym rekordzie z feedu/fixture.
   */
  protected toOffer(raw: RawOfferInput): NormalizedOffer {
    return normalizeOffer(raw, { source: this.slug, currency: this.currency });
  }
}
