import type { RetailSource } from './retail-pages';
import { cleanHtml, htmlAttributes, htmlElements } from './retail-microdata';

export const UNIMET_ORIGIN = 'https://www.unimet.pl';
export const UNIMET_CORNER_ID = 'unimet-corner-mesh-25m';
export const UNIMET_AJAX_PATH = '/module/supercheckout/pl/index.php?fc=module&module=supercheckout&controller=supercheckout';

// A physical 2.5 m strip is priced per piece, but this retailer requires at least 25.
// This minimum does not establish a 25-piece increment for larger purchases.
// source: https://www.unimet.pl/narozniki-6/262771-naroznik-aluminiowy-z-siatka-7070-250cm-5900308102411.html
export function confirmUnimetPurchase(raw: string, source: RetailSource): void {
  if (source.id !== UNIMET_CORNER_ID) return;
  if (source.ean !== '5900308102411' || source.packageSize !== 2.5 || source.unit !== 'mb'
    || source.store !== 'Unimet' || source.brand !== 'Budmat' || source.format !== 'unimet'
    || source.url !== 'https://www.unimet.pl/narozniki-6/262771-naroznik-aluminiowy-z-siatka-7070-250cm-5900308102411.html'
    || source.minimumPackages !== 25 || (source.purchaseMultiple ?? 1) !== 1) throw Error('product_package_not_confirmed');
  const html = cleanHtml(raw);
  const forms = htmlElements(html, (a, tag) => tag === 'form' && a.id === 'add-to-cart-or-refresh');
  if (forms.length !== 1) throw Error('product_package_not_confirmed');
  const attributes = htmlAttributes(forms[0].match(/^<[^>]+>/)?.[0] ?? '');
  if (attributes.action !== 'https://www.unimet.pl/koszyk' || attributes.method !== 'post') throw Error('product_package_not_confirmed');
  const product = htmlElements(forms[0], (a, tag) => tag === 'input' && a.name === 'id_product');
  const quantity = htmlElements(forms[0], (a, tag) => tag === 'input' && a.name === 'qty' && a.id === 'quantity_wanted');
  if (product.length !== 1 || quantity.length !== 1 || htmlAttributes(product[0]).value !== '262771') throw Error('product_package_not_confirmed');
  const native = htmlAttributes(quantity[0]);
  if (/^[1-9]\d*$/.test(native.min ?? '') && Number(native.min) !== source.minimumPackages) throw Error('purchase_rules_changed');
  if (native.min !== '25' || (native.step ?? '1') !== '1') throw Error('product_package_not_confirmed');
}
