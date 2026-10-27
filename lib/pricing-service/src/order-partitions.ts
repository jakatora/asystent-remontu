import type { BasketQuoter, DeliveredStoreBasket, DeliveryQuote, DeliveryQuoteResult } from './delivery';

const valid = (quote: DeliveryQuote, postcode: string) => Number.isSafeInteger(quote.costGrosze) && quote.costGrosze >= 0
  && Date.parse(quote.expiresAt) > Date.now() && Date.parse(quote.checkedAt) <= Date.now()
  && Date.parse(quote.checkedAt) >= Date.now() - 600_000 && Date.parse(quote.expiresAt) <= Date.parse(quote.checkedAt) + 600_000 && /^[a-f0-9]{64}$/.test(quote.evidenceSha256)
  && (quote.destinationScope === 'PL' || quote.destinationScope === 'postal_code' && quote.postalCode === postcode);

/** Compare real separate orders, never divide a fee or invent a tariff.
 * Full product lines stay together, so a stock limit or purchase minimum cannot
 * be evaded by splitting the same SKU. Atomic quoting retains its global cache,
 * request budget, deadline and native stock checks. */
export function withOrderPartitions(atomic: BasketQuoter, limited: () => void): BasketQuoter {
  return async (order, postcode): Promise<DeliveryQuoteResult> => {
    const base = await atomic(order, postcode), count = order.lines.length;
    if (!('quote' in base) || !valid(base.quote, postcode) || base.quote.orders || !base.quote.costGrosze || count < 2) return base;
    if (new Set(order.lines.map(line => line.product.id)).size !== count) { limited(); return base; }
    const make = (indices: number[]): DeliveredStoreBasket => {
      const lines = indices.map(i => order.lines[i]);
      return { ...order, lines, materialsGrosze: lines.reduce((n, line) => n + line.packages.reduce((s, p) => s + p.lineCostGrosze, 0), 0), quote: undefined, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown' };
    };
    type Part = { order: DeliveredStoreBasket; quote: DeliveryQuote };
    const read = async (indices: number[]): Promise<Part | null> => {
      const basket = make(indices);
      try {
        const result = await atomic(basket, postcode);
        if ('quote' in result && !result.quote.orders && valid(result.quote, postcode)) return { order: basket, quote: result.quote };
        if (!('reason' in result) || !['no_home_delivery', 'product_unavailable', 'purchase_rules_changed'].includes(result.reason)) limited();
      } catch { limited(); /* An unchecked partial order never lowers the total. */ }
      return null;
    };
    let best: Part[] = [{ order, quote: base.quote }];
    const fee = (parts: Part[]) => parts.reduce((n, p) => n + p.quote.costGrosze, 0);
    if (count <= 5) {
      const all = (1 << count) - 1, parts = new Map<number, Part>([[all, best[0]]]);
      // Singles and their complements first: useful complete plans survive a
      // bounded request budget even when later combinations cannot be checked.
      const masks = [...new Set([...Array.from({ length: count }, (_, i) => 1 << i), ...Array.from({ length: count }, (_, i) => all ^ (1 << i)), ...Array.from({ length: all - 1 }, (_, i) => i + 1)])];
      for (const mask of masks) {
        if (mask === all) continue;
        const part = await read(Array.from({ length: count }, (_, i) => i).filter(i => mask & (1 << i)));
        if (part) parts.set(mask, part);
      }
      const memo = new Map<number, Part[] | null>([[0, []]]);
      const solve = (mask: number): Part[] | null => {
        if (memo.has(mask)) return memo.get(mask)!;
        let chosen: Part[] | null = parts.has(mask) ? [parts.get(mask)!] : null;
        const first = mask & -mask;
        for (let sub = (mask - 1) & mask; sub; sub = (sub - 1) & mask) {
          if (!(sub & first) || !parts.has(sub)) continue;
          const rest = solve(mask ^ sub); if (!rest) continue;
          const candidate = [parts.get(sub)!, ...rest];
          if (!chosen || fee(candidate) < fee(chosen) || fee(candidate) === fee(chosen) && candidate.length < chosen.length) chosen = candidate;
        }
        memo.set(mask, chosen); return chosen;
      };
      best = solve(all) ?? best;
    } else {
      limited();
      // Large orders retain a bounded selection of independently verified
      // two-order plans. Do not claim an exhaustive partition search.
      for (let i = 0; i < Math.min(count, 8); i++) {
        const one = await read([i]), rest = await read(Array.from({ length: count }, (_, j) => j).filter(j => j !== i));
        if (one && rest && fee([one, rest]) < fee(best)) best = [one, rest];
      }
    }
    const costGrosze = fee(best);
    if (best.length < 2 || costGrosze >= base.quote.costGrosze || !Number.isSafeInteger(costGrosze)
        || best.some(part => !valid(part.quote, postcode)) || best.reduce((n, p) => n + p.order.materialsGrosze, 0) !== order.materialsGrosze) return base;
    const orders = best.map(part => ({ materialsGrosze: part.order.materialsGrosze, lines: part.order.lines, quote: part.quote }));
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(orders)));
    return { quote: { ...base.quote, costGrosze, orders, singleOrderCostGrosze: base.quote.costGrosze,
      carrier: [...new Set(best.map(p => p.quote.carrier))].join(' + '), payment: [...new Set(best.map(p => p.quote.payment))].join(' + '),
      checkedAt: new Date(Math.min(...best.map(p => Date.parse(p.quote.checkedAt)))).toISOString(),
      expiresAt: new Date(Math.min(...best.map(p => Date.parse(p.quote.expiresAt)))).toISOString(),
      evidenceSha256: Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join(''),
      destinationScope: best.some(p => p.quote.destinationScope === 'postal_code') ? 'postal_code' : 'PL',
      basis: best.some(p => p.quote.destinationScope === 'postal_code') ? 'retailer_basket_postcode' : best.every(p => p.quote.basis === 'retailer_tariff_national') ? 'retailer_tariff_national' : 'retailer_basket_national',
      dispatchFrom: best.every(p => p.quote.dispatchFrom === best[0].quote.dispatchFrom) ? best[0].quote.dispatchFrom : undefined,
      ...(best.some(p => p.quote.destinationScope === 'postal_code') ? { postalCode: postcode } : {}),
    } };
  };
}
