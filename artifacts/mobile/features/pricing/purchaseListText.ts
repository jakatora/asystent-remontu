import type { DeliveredBasket, DeliveryQuote } from '../../../../lib/pricing-service/src/delivery';
import { formatGrosze } from './pricingApi';
import { formatPurchase,formatPackageSize,formatPackageUnit } from './packageDisplay';
import { displayProductName } from './productDisplay';
import {confirmedDeliveredBasket} from './basketOptions';
import {extraPackageAdditions} from '../../../../lib/pricing-service/src/extra-package-difference';

export interface PurchaseListInput {
  basket: DeliveredBasket;
  mode: 'shipping' | 'pickup';
  postalCode: string | null;
  partial?: boolean;
  limited?: boolean;
  /** Preserve the explicit surplus decision in the exported shopping plan. */
  extraPackageBaseline?:DeliveredBasket;
}
const money = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
const inline = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
function productLink(value: string | null | undefined): string | null {
  try { const url = new URL(value ?? ''); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}

/** A portable copy of this allocation, never a checkout or an exhaustive
 * market claim. Recheck expiry at the actual copy click, not only at render. */
export function purchaseListText(input: PurchaseListInput, language = 'pl', now = Date.now()): string | null {
  const additions=input.extraPackageBaseline?extraPackageAdditions(input.extraPackageBaseline,input.basket):null;
  if(input.extraPackageBaseline&&(!additions||input.mode!=='shipping'||!/^\d{2}-\d{3}$/.test(input.postalCode??'')
    ||!confirmedDeliveredBasket(input.extraPackageBaseline,input.postalCode!,now)||!confirmedDeliveredBasket(input.basket,input.postalCode!,now)
    ||input.extraPackageBaseline.totalGrosze!<=input.basket.totalGrosze!))return null;
  const { basket, mode, postalCode } = input, pl = language === 'pl';
  const tr = (a: string, b: string) => pl ? a : b;
  const amount = (n: number) => formatGrosze(n, 'PLN', pl ? 'pl-PL' : 'en-GB');
  const time = (n: number) => new Date(n).toLocaleString(pl ? 'pl-PL' : 'en-GB', { timeZone: 'Europe/Warsaw' });
  if (!Number.isFinite(now) || !basket.stores.length || !money(basket.materialsGrosze)
    || basket.stores.reduce((sum, store) => sum + store.materialsGrosze, 0) !== basket.materialsGrosze) return null;
  for (const store of basket.stores) {
    if (!inline(store.store) || !money(store.materialsGrosze) || !store.lines.length) return null;
    for (const line of store.lines) {
      if (!line.packages.length) return null;
      for (const pack of line.packages) {
        if (pack.store !== store.store || !Number.isSafeInteger(pack.count) || pack.count < 1
          || !Number.isFinite(pack.packageSize) || pack.packageSize <= 0 || !money(pack.lineCostGrosze)) return null;
      }
    }
  }
  const activeQuote = (quote: DeliveryQuote | undefined, cost: number | null): boolean => {
    if (!quote || !money(cost) || quote.costGrosze !== cost || !/^\d{2}-\d{3}$/.test(postalCode ?? '')) return false;
    const checked = Date.parse(quote.checkedAt), expires = Date.parse(quote.expiresAt);
    return Number.isFinite(checked) && checked <= now + 5000 && Number.isFinite(expires) && expires > now
      && expires > checked && expires - checked <= 600000
      && (quote.destinationScope === 'PL' || quote.destinationScope === 'postal_code' && quote.postalCode === postalCode);
  };
  const storeConfirmed = basket.stores.map(store => store.source === 'retailer' && activeQuote(store.quote, store.deliveryGrosze)
    && (!store.quote?.orders || store.quote.orders.every(order => activeQuote(order.quote, order.quote.costGrosze)))
    && store.lines.every(line => line.packages.every(pack => !pack.verification || Date.parse(pack.verification.expiresAt) > now))
    && money(store.totalGrosze) && store.totalGrosze === store.materialsGrosze + store.deliveryGrosze!);
  const complete = mode === 'shipping' && storeConfirmed.every(Boolean)
    && money(basket.deliveryGrosze) && money(basket.totalGrosze)
    && basket.stores.reduce((sum, store) => sum + store.deliveryGrosze!, 0) === basket.deliveryGrosze
    && basket.totalGrosze === basket.materialsGrosze + basket.deliveryGrosze;
  const text = [tr('Plan zakupów — Asystent Remontu', 'Shopping plan — Asystent Remontu'),
    tr(`Kopia z ${time(now)} (czas Warszawy).`, `Copied ${time(now)} (Warsaw time).`),
    tr('Ceny i dostępność mogą się zmienić. Przed zakupem sprawdź koszyk sklepu.', 'Prices and availability may change. Check the store cart before purchasing.')];
  if(additions&&input.extraPackageBaseline){
    text.push(tr('Wybrany wariant: dodatkowe opakowania.','Selected option: extra packs.'),
      tr('Standardowy zestaw z dostawą: ','Standard basket including delivery: ')+formatGrosze(input.extraPackageBaseline.totalGrosze!),
      tr('Całość tańsza o: ','Full total lower by: ')+formatGrosze(input.extraPackageBaseline.totalGrosze!-input.basket.totalGrosze!));
    for(const item of additions)text.push(tr('Dodatkowo kupisz: ','Extra to buy: ')+inline(displayProductName(item.product))+' — '+item.extraPackages+' × '+formatPackageSize(item.packageSize,language)+' '+formatPackageUnit(item.unit)+'. '+tr(`Liczba opakowań: ${item.baselinePackages} → ${item.proposedPackages}.`,`Pack count: ${item.baselinePackages} → ${item.proposedPackages}.`));
  }
  if (input.partial) text.push(tr('NIEPEŁNY KOSZYK: lista i kwoty obejmują tylko dostępną część. Brakujące zakupy i ich dostawa są poza wyceną.', 'INCOMPLETE BASKET: only the available part is listed and priced. Missing purchases and their delivery are excluded.'));
  if (mode === 'shipping') {
    if (postalCode) text.push(tr('Podany kod pocztowy: ', 'Entered postcode: ') + inline(postalCode));
    if (!complete) text.push(tr('Dostawa nie jest w pełni potwierdzona lub wycena wygasła. Nie ma potwierdzonego kosztu całości. Odśwież wycenę lub sprawdź brakującą dostawę w sklepie.', 'Delivery is not fully confirmed or the quote expired. There is no confirmed full total. Refresh the quote or check missing shipping at the store.'));
  } else text.push(tr('Odbiór osobisty: sprawdź dostępność w wybranej placówce. Koszt dojazdu nie jest wliczony.', 'Collection: check stock at your chosen branch. Travel costs are excluded.'));
  if (input.limited) text.push(tr('Porównanie obejmuje potwierdzone warianty. Inny zestaw może być tańszy.', 'The comparison covers confirmed options. Another allocation may cost less.'));
  const linesText = (lines: DeliveredBasket['stores'][number]['lines']) => {
    for (const line of lines) {
      text.push(inline(displayProductName(line.product)));
      for (const pack of line.packages) {
        text.push(`  ${formatPurchase(pack, line.unit, language)} — ${amount(pack.lineCostGrosze)}`);
        if (pack.cutRoll?.cutLengthsMm) text.push(tr('  Odcinek podziel na: ', '  Divide this cut into: ') + pack.cutRoll.cutLengthsMm.map(mm => `${mm / 1000} m`).join(' + '));
        if ((pack.minimumPackages ?? 1) > 1) text.push(tr('  Minimum opakowań: ', '  Minimum packs: ') + pack.minimumPackages);
        if ((pack.purchaseMultiple ?? 1) > 1) text.push(tr('  Zakup w partiach po ', '  Purchase in lots of ') + pack.purchaseMultiple + tr(' opakowań.', ' packs.'));
        const url = productLink(pack.url); if (url) text.push(`  ${url}`);
      }
    }
  };
  const shipping = (quote: DeliveryQuote | undefined, cost: number | null, confirmed: boolean) => {
    if (!confirmed || !quote || cost === null) { text.push(tr('Dostawa: do potwierdzenia', 'Delivery: pending confirmation')); return; }
    text.push(tr('Dostawa: ', 'Delivery: ') + amount(cost) + ` (${inline(quote.carrier)}; ${inline(quote.payment)})`);
    if (quote.dispatchFrom) text.push(tr('Wysyłka z: ', 'Dispatched from: ') + inline(quote.dispatchFrom));
    text.push(quote.destinationScope === 'PL' ? tr('Taryfa krajowa PL, bez osobnej wyceny dla kodu.', 'Nationwide PL rate, without a separate postcode quote.') : tr('Wycena dla kodu: ', 'Quoted for postcode: ') + quote.postalCode);
    text.push(tr('Sprawdzono: ', 'Checked: ') + time(Date.parse(quote.checkedAt)) + tr(' · ważna do: ', ' · valid until: ') + time(Date.parse(quote.expiresAt)));
  };
  basket.stores.forEach((store, index) => {
    text.push('', `${index + 1}. ${inline(store.store)}`);
    const orders = store.quote?.orders;
    if (orders && orders.length > 1) {
      text.push(tr('Złóż osobne zamówienia według tego podziału. Połączenie ich może zmienić transport.', 'Place separate orders using this allocation. Combining them may change delivery.'));
      orders.forEach((order, n) => {
        text.push(tr(`Zamówienie ${n + 1} z ${orders.length}`, `Order ${n + 1} of ${orders.length}`));
        linesText(order.lines);
        if (mode === 'shipping') shipping(order.quote, order.quote.costGrosze, storeConfirmed[index]);
      });
    } else { linesText(store.lines); if (mode === 'shipping') shipping(store.quote, store.deliveryGrosze, storeConfirmed[index]); }
    text.push(tr('Materiały według planu: ', 'Materials in this plan: ') + amount(store.materialsGrosze));
    if (store.quote?.cartPricing) text.push(tr('Rabat koszyka już wliczony: ', 'Cart discount already included: ') + amount(store.quote.cartPricing.discountGrosze));
    if (store.quote?.materialsRoundingGrosze) text.push(tr('Zaokrąglenie cen w koszyku już wliczone: ', 'Cart price rounding already included: ') + amount(store.quote.materialsRoundingGrosze));
  });
  text.push('', tr('Materiały według planu: ', 'Materials in this plan: ') + amount(basket.materialsGrosze));
  if (complete) {
    text.push(tr('Potwierdzone dostawy: ', 'Confirmed shipping: ') + amount(basket.deliveryGrosze!));
    text.push(input.partial ? tr('Razem za dostępną część: ', 'Total for the available part: ') + amount(basket.totalGrosze!) : tr('Zestaw z potwierdzoną dostawą: ', 'Basket with confirmed shipping: ') + amount(basket.totalGrosze!));
  }
  text.push(tr('Narzędzia i robocizna nie są wliczone. Lista nie rezerwuje produktów ani nie składa zamówień.', 'Tools and labour are excluded. This list does not reserve products or place orders.'));
  return text.join('\n');
}
