// ─────────────────────────────────────────────────────────────────────────────
// Resolve a thumbnail URL for a material/tool.
//
// Strategy:
//   1. Match the reviewed product catalogue by exact EAN, ID or source URL.
//   2. Otherwise use an explicit `thumbnailUrl` when present.
//   3. Otherwise, match the item's shopPrices[0].url against SHARED_SHOP_PRICES.
//      If we find the entry, return SHARED_THUMBNAILS[<key>] (when present).
//   4. Otherwise, return undefined — UI shows a fallback icon.
//
// This avoids duplicating thumbnailUrl on every shared material/tool — adding a
// thumbnail for a shared product = updating SHARED_THUMBNAILS in one place.
// ─────────────────────────────────────────────────────────────────────────────

import { SHARED_SHOP_PRICES, SHARED_THUMBNAILS } from '@/data/prices/shared-shop-prices';
import { getProductPhoto } from '@/data/products/photos';
import type { MaterialItem, ToolItem, ShopPrice } from '@/types/domain';

type WithShopPrices = {
  id?: string;
  ean?: string;
  imageUrl?: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  shopPrices?: readonly ShopPrice[];
};

const URL_TO_SHARED_KEY: Map<string, keyof typeof SHARED_SHOP_PRICES> = (() => {
  const map = new Map<string, keyof typeof SHARED_SHOP_PRICES>();
  for (const [key, prices] of Object.entries(SHARED_SHOP_PRICES) as [
    keyof typeof SHARED_SHOP_PRICES,
    readonly ShopPrice[],
  ][]) {
    for (const price of prices) {
      map.set(price.url, key);
    }
  }
  return map;
})();

export function resolveThumbnail(item: MaterialItem | ToolItem | WithShopPrices): string | undefined {
  const reviewed = getProductPhoto(item);
  if (reviewed) return reviewed;
  if (item.thumbnailUrl) return item.thumbnailUrl;
  const firstShop = item.shopPrices?.[0];
  if (!firstShop) return undefined;
  const key = URL_TO_SHARED_KEY.get(firstShop.url);
  if (!key) return undefined;
  return SHARED_THUMBNAILS[key];
}
