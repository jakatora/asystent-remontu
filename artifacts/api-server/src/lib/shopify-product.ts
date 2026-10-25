import type { RetailSource } from './retail-pages';

/** Exact public variant, never a product-wide minimum or another colour. */
export function confirmShopifyProduct(product: any, source: RetailSource): { variantId: number; priceGrosze: number; name: string; imageUrl: string | undefined } {
  if (!Number.isSafeInteger(source.productId) || !Number.isSafeInteger(source.variantId) || product.id !== source.productId || !Array.isArray(product.variants)) throw Error('product_id_not_confirmed');
  const matches = product.variants.filter((v: any) => v.id === source.variantId && String(v.barcode) === source.ean);
  if (matches.length !== 1) throw Error('product_ean_not_confirmed');
  const variant = matches[0];
  if (variant.available !== true || product.available !== true) throw Error('retailer_out_of_stock');
  if (!Number.isSafeInteger(variant.price) || variant.price <= 0 || typeof product.title !== 'string') throw Error('invalid_money');
  if (variant.quantity_rule && (variant.quantity_rule.min !== 1 || variant.quantity_rule.increment !== 1)) throw Error('retailer_unit_not_confirmed');
  const image = variant.featured_image?.src ?? product.featured_image;
  return { variantId:variant.id, priceGrosze:variant.price, name:product.title, imageUrl:typeof image === 'string' ? new URL(image,source.url).href : source.imageUrl };
}
