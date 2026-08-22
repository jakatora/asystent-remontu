// Generyczny "plumbing" produktowego feedu sklepu, WSPÓŁDZIELONY przez adaptery
// oparte o feed (PSB Mrówka, Castorama, ...). Store-agnostyczny: parsowanie
// (Google Merchant / RSS XML albo JSON), odporne pobieranie po HTTP (timeout +
// retry-lite, 4xx fail-fast — BEZ omijania blokad) oraz generyczny PriceSource
// budowany z itemów feedu. Konkretny adapter dokleja tylko slug + displayName +
// źródło danych (fixture albo URL feedu).
//
// DLACZEGO wydzielone: parser XML/JSON i mapowanie pól feedu na Product/Offer są
// z natury store-agnostyczne (feed Google Merchant ma ten sam kształt u każdego
// sklepu). Trzymanie logiki w jednym miejscu = jeden test prawdy i zero
// duplikacji sieci/parsowania przy dodawaniu kolejnego sklepu.

import { BasePriceSource } from "../base-source";
import type { NormalizedOffer, NormalizedProduct } from "../types";
import {
  feedItemToProduct,
  feedItemToRawOffer,
  type ProductFeedItem,
} from "./mrowka.feed";
import { parseMrowkaFeedAuto } from "./mrowka.feed.xml";

// Generyczne aliasy parsera feedu (jedna implementacja w mrowka.feed.xml — tu
// tylko store-agnostyczne nazwy, żeby nowe adaptery nie zależały od "mrowka").
export {
  parseMrowkaFeedXml as parseMerchantFeedXml,
  parseMrowkaFeedAuto as parseMerchantFeedAuto,
  splitPriceCurrency,
} from "./mrowka.feed.xml";

/** Minimalny kontrakt fetcha (podzbiór globalnego `fetch`) — wstrzykiwalny w testach. */
export type FetchLike = (
  url: string,
  init?: { signal?: AbortSignal },
) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;

/** Opcje ostrożnego pobierania feedu po sieci (timeout + lekki retry). */
export interface FeedFetchOptions {
  /** Limit czasu pojedynczej próby w ms (AbortController). 0/undefined -> 15000. */
  timeoutMs?: number;
  /** Liczba DODATKOWYCH prób po błędzie przejściowym (sieć/timeout/5xx). Domyślnie 2. */
  retries?: number;
  /** Odczekanie między próbami (wstrzykiwalne w testach). Domyślnie realny setTimeout. */
  sleep?: (ms: number) => Promise<void>;
}

const DEFAULT_FEED_TIMEOUT_MS = 15_000;
const DEFAULT_FEED_RETRIES = 2;

/** Pojedyncze pobranie z limitem czasu przez AbortController. */
async function fetchWithTimeout(
  fetchImpl: FetchLike,
  url: string,
  timeoutMs: number,
): Promise<{ ok: boolean; status: number; text: () => Promise<string> }> {
  if (!(timeoutMs > 0) || typeof AbortController === "undefined") {
    return fetchImpl(url);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Pobiera feed produktowy z podanego URL (LEGALNE odczytanie oficjalnego feedu)
 * i zwraca sparsowane itemy. Format wykrywany automatycznie: XML (Google Merchant
 * / RSS) albo JSON.
 *
 * Odporność sieciowa: każda próba ma limit czasu (`timeoutMs`), a błędy
 * PRZEJŚCIOWE (wyjątek sieci/timeout albo HTTP 5xx) są ponawiane do `retries`
 * razy z krótkim odczekaniem. HTTP 4xx nie ponawiamy (fail-fast) — i NIE omijamy
 * blokad: przy 403/429 rzucamy jasny błąd zamiast kombinować z nagłówkami.
 *
 * `fetchImpl` domyślnie korzysta z globalnego `fetch`; w testach można wstrzyknąć
 * atrapę. Rzuca po wyczerpaniu prób.
 */
export async function fetchFeedItemsFromUrl(
  url: string,
  fetchImpl: FetchLike = globalThis.fetch as unknown as FetchLike,
  options: FeedFetchOptions = {},
): Promise<ProductFeedItem[]> {
  if (typeof fetchImpl !== "function") {
    throw new Error(
      "fetchFeedItemsFromUrl: brak dostępnego fetch (podaj fetchImpl).",
    );
  }
  const timeoutMs = options.timeoutMs ?? DEFAULT_FEED_TIMEOUT_MS;
  const retries = Math.max(0, options.retries ?? DEFAULT_FEED_RETRIES);
  const sleep =
    options.sleep ??
    ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      // Lekki, liniowy backoff (200ms, 400ms, ...) — bez zależności od zegara/losowości.
      await sleep(200 * attempt);
    }

    let res: { ok: boolean; status: number; text: () => Promise<string> };
    try {
      res = await fetchWithTimeout(fetchImpl, url, timeoutMs);
    } catch (err) {
      // Wyjątek sieci/timeout = przejściowy -> ponów (jeśli zostały próby).
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }

    if (res.ok) {
      const text = await res.text();
      return parseMrowkaFeedAuto(text);
    }

    if (res.status >= 500) {
      // Błąd serwera = przejściowy -> ponów.
      lastError = new Error(
        `fetchFeedItemsFromUrl: HTTP ${res.status} przy pobieraniu feedu ${url}`,
      );
      continue;
    }

    // 4xx (w tym 403/429) -> fail-fast, nie omijamy blokad.
    throw new Error(
      `fetchFeedItemsFromUrl: HTTP ${res.status} przy pobieraniu feedu ${url}`,
    );
  }

  throw (
    lastError ??
    new Error(`fetchFeedItemsFromUrl: nie udało się pobrać feedu ${url}`)
  );
}

/**
 * Generyczny adapter sklepu oparty o produktowy feed (Google Merchant / Ceneo).
 * Trzyma itemy feedu (z fixture albo pobrane z URL) i mapuje je na kontrakt
 * PriceSource. Konkretny sklep = podklasa dostarczająca slug + displayName +
 * domyślny fixture.
 */
export class FeedPriceSource extends BasePriceSource {
  readonly slug: string;
  readonly displayName: string;

  // Itemy feedu (domyślnie fixture podklasy) — wstrzykiwalne, ułatwia testy i
  // podmianę na pobrany feed bez zmiany reszty adaptera.
  protected readonly items: readonly ProductFeedItem[];

  constructor(
    slug: string,
    displayName: string,
    items: readonly ProductFeedItem[],
  ) {
    super();
    this.slug = slug;
    this.displayName = displayName;
    this.items = items;
  }

  async fetchProducts(): Promise<NormalizedProduct[]> {
    return this.items.map((item) => feedItemToProduct(item));
  }

  async fetchOffers(): Promise<NormalizedOffer[]> {
    return this.items.map((item) => {
      const offer = this.toOffer(feedItemToRawOffer(item));
      // Feed może jawnie podać walutę (np. "86.99 PLN") — uszanuj ją zamiast
      // sztywnego domyślnego PLN z BasePriceSource. Brak -> zostaje domyślna.
      return item.currency ? { ...offer, currency: item.currency } : offer;
    });
  }
}
