import type { RetailSource } from './retail-pages';
import { cleanHtml, htmlElements, htmlAttributes, htmlText, htmlLabel } from './retail-microdata';

/** Merchant codes are not GTINs. A reviewed store/native SKU has its own
 * namespace and cannot merge into a similar product with a real EAN. */
export interface RetailSkuIdentity {
  readonly catalogKey: string;
  readonly kind?: 'merchant-only';
  readonly manufacturerSku?: string;
  readonly merchantProductId: string;
  readonly pageBarcode?: string;
}

const URL = 'https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282';
// source: https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282
// source: https://tape.pl/marki/31-goldflex (manufacturer lists TB-FB00202)
export function isReviewedSkuSource(source: RetailSource): boolean {
  if (isReviewedIrbudSource(source)) return true;
  const sku = source.skuIdentity;
  return source.id === 'sewera-packcenter-edge-tape-50m' && source.ean === ''
    && source.store === 'Sewera' && source.format === 'sewera' && source.url === URL
    && source.name === 'Taśma dylatacyjna 5mm x 10cm x 50m' && source.brand === 'Pack-Center'
    && source.packageSize === 50 && source.unit === 'mb' && source.retailUnit === 'SZT'
    && sku?.catalogKey === 'sewera-465325' && sku.manufacturerSku === 'TB-FB00202'
    && sku.merchantProductId === '465325' && sku.pageBarcode === '465325'
    && source.dispatchDepartment?.id === '3' && source.dispatchDepartment.name === 'Gliwice';
}

/** An EAN-verified paint card and its observed shipping branch. A changed
 * merchant card or branch must be reviewed before checkout uses it. */
export function isReviewedSeweraDispatchSource(source: RetailSource): boolean {
  if (isReviewedSkuSource(source)) return true;
  if (source.id === 'sewera-atlas-gta-18kg') return source.ean === '5905400542509'
    && source.skuIdentity === undefined && source.store === 'Sewera' && source.format === 'sewera'
    && source.url === 'https://sklep.sewera.pl/atlas-gta-gotowa-gladz-polimerowa-18kg-p6321'
    && source.name === 'Atlas GTA gotowa gładź polimerowa 18kg'
    && source.brand === 'Atlas' && source.packageSize === 18 && source.unit === 'kg'
    && source.dispatchDepartment?.id === '1' && source.dispatchDepartment.name === 'Katowice';
  return source.id === 'sewera-dulux-9l' && source.ean === '5904078198759'
    && source.skuIdentity === undefined && source.store === 'Sewera' && source.format === 'sewera'
    && source.url === 'https://sklep.sewera.pl/farba-wewnetrzna-biala-easycare-nieskazitelna-biel-9l-mat-dulux-p21385'
    && source.name === 'Farba wewnętrzna biała Easycare nieskazitelna biel 9l mat Dulux'
    && source.brand === 'Dulux' && source.packageSize === 9 && source.unit === 'l'
    && source.dispatchDepartment?.id === '4' && source.dispatchDepartment.name === 'Tarnowskie Góry';
}

// source: https://irbudsklep.pl/produkt/profil-glowny-sufitowy-cd60-3-mb-06/
export function isReviewedIrbudSource(source:RetailSource):boolean {
 const sku=source.skuIdentity;
 return source.id==='irbud-norgips-cd60-06-3m'&&source.ean===''&&source.store==='IRBUD'&&source.format==='irbud-woo'
  &&source.name==='Profil główny sufitowy CD60 3 MB / 0,6'&&source.brand==='Norgips'&&source.category==='profile'&&source.packageSize===3&&source.unit==='mb'&&source.productId===10911
  &&source.url==='https://irbudsklep.pl/produkt/profil-glowny-sufitowy-cd60-3-mb-06/'&&sku?.kind==='merchant-only'&&sku.catalogKey==='irbud-10911'&&sku.merchantProductId==='10911'&&sku.manufacturerSku===undefined&&sku.pageBarcode===undefined;
}
export function retailSkuCode(source:RetailSource):string|undefined{return isReviewedIrbudSource(source)?source.skuIdentity!.merchantProductId:source.skuIdentity?.manufacturerSku;}
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
  return isReviewedIrbudSource(source) ? `${source.name} (${source.brand}, oferta ${source.store})` : `${source.name} (${source.brand} ${source.skuIdentity.manufacturerSku})`;
}

export function confirmRetailSkuProduct(html: string, product: Record<string, any>, source: RetailSource): Record<string, any> {
  if (!isReviewedSkuSource(source) || isReviewedIrbudSource(source)) throw Error('retailer_sku_source_not_reviewed');
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
