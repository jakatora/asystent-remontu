import type { RetailSource } from './retail-pages';
import { cleanHtml, htmlElements, htmlAttributes, htmlText, htmlLabel } from './retail-microdata';

/** Merchant codes are not GTINs. A reviewed store/native SKU has its own
 * namespace and cannot merge into a similar product with a real EAN. */
export interface RetailSkuIdentity {
  readonly catalogKey: string;
  readonly manufacturerSku: string;
  readonly merchantProductId: string;
  readonly pageBarcode: string;
}

const URL = 'https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282';
// source: https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282
// source: https://tape.pl/marki/31-goldflex (manufacturer lists TB-FB00202)
export function isReviewedSkuSource(source: RetailSource): boolean {
  const sku = source.skuIdentity;
  return source.id === 'sewera-packcenter-edge-tape-50m' && source.ean === ''
    && source.store === 'Sewera' && source.format === 'sewera' && source.url === URL
    && source.name === 'Taśma dylatacyjna 5mm x 10cm x 50m' && source.brand === 'Pack-Center'
    && source.packageSize === 50 && source.unit === 'mb' && source.retailUnit === 'SZT'
    && sku?.catalogKey === 'sewera-465325' && sku.manufacturerSku === 'TB-FB00202'
    && sku.merchantProductId === '465325' && sku.pageBarcode === '465325'
    && source.dispatchDepartment?.id === '3' && source.dispatchDepartment.name === 'Gliwice';
}

export function retailProductId(source: RetailSource): string {
  if (source.skuIdentity) {
    if (!isReviewedSkuSource(source)) throw Error('retailer_sku_source_not_reviewed');
    return `remont-sku-${source.skuIdentity.catalogKey}`;
  }
  if (!source.ean) throw Error('product_code_not_confirmed');
  return `remont-${source.ean}`;
}

export function retailProductName(source: RetailSource): string {
  if (!source.skuIdentity) return source.name;
  if (!isReviewedSkuSource(source)) throw Error('retailer_sku_source_not_reviewed');
  return `${source.name} (${source.brand} ${source.skuIdentity.manufacturerSku})`;
}

export function confirmRetailSkuProduct(html: string, product: Record<string, any>, source: RetailSource): Record<string, any> {
  if (!isReviewedSkuSource(source)) throw Error('retailer_sku_source_not_reviewed');
  const safe = cleanHtml(html), sku = source.skuIdentity!;
  const one = (rows: string[]) => { if (rows.length !== 1) throw Error('retailer_sku_identity_not_confirmed'); return rows[0]; };
  const primary = one(htmlElements(safe, attributes => /\/Product$/.test(attributes.itemtype ?? '')));
  const canonical = one(htmlElements(safe, attributes => attributes.rel === 'canonical'));
  if (htmlAttributes(canonical).href !== source.url || product.name !== source.name
    || product.gtin13 !== sku.pageBarcode || htmlLabel(primary, 'Kod producenta:', 'strong') !== sku.manufacturerSku
    || htmlLabel(primary, 'Producent:', 'strong') !== 'PACK-CENTER KOŁODZIEJ I WSPÓLNICY SP.J.') throw Error('retailer_sku_identity_not_confirmed');
  // A real selected branch may have zero stock and omit its purchase form.
  // Identity still has to match; an unavailable card is never a priced cart.
  if (/\/OutOfStock$/.test(String(product.offers?.availability))) throw Error('retailer_out_of_stock');
  const form = one(htmlElements(primary, attributes => attributes.name === 'add_to_basket_pid'));
  if (htmlAttributes(form).value !== sku.merchantProductId) throw Error('retailer_sku_identity_not_confirmed');
  // The schema.org microdata reader exposes the page's "Kod kreskowy" as gtin.
  // This known six-digit store code is deliberately removed, not padded or
  // published as an EAN. Price/stock/image still come from that same main card.
  const { gtin13: _barcode, gtin: _gtin, gtin14: _gtin14, ...verified } = product;
  return { ...verified, sku: sku.manufacturerSku };
}
