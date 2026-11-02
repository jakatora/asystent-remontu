import type { BasketQuoter, DeliveredStoreBasket, DeliveryQuoteResult } from './delivery';
import {currentDeliveryQuote as valid,quantityOrderPartitions,combineOrderQuotes,type QuotedOrder} from './quantity-order-partitions';
import {quoteRequiredDispatch} from './dispatch-order-partitions';
import {quotedMaterialsGrosze,quotedOrderTotal,supportsCartPricing} from './cart-pricing';

/** Suborders have separate anonymous sessions. Bound each parent's pending
 * work to three carts; the retailer quoter still enforces its shared FIFO,
 * request cap and deadline across parents/users. Fold results in input order
 * so network completion order cannot change an equally priced plan. */
async function readIndependentCarts<T,R>(values:readonly T[],read:(value:T)=>Promise<R>):Promise<R[]>{
  const results:R[]=new Array(values.length);let cursor=0;
  await Promise.all(Array.from({length:Math.min(3,values.length)},async()=>{
    while(cursor<values.length){const index=cursor++;results[index]=await read(values[index]);}
  }));
  return results;
}

/** Compare real separate orders, never divide a fee or invent a tariff.
 * The complete order must pass native stock/price checks first. Single-product
 * baskets may also split physical packs, retaining every per-order minimum and
 * purchase lot. Atomic quoting retains its global cache, budget and deadline. */
export function withOrderPartitions(atomic: BasketQuoter, limited: () => void, allowOptional: () => boolean = () => true): BasketQuoter {
  return async (order, postcode): Promise<DeliveryQuoteResult> => {
    const base = await atomic(order, postcode), count = order.lines.length;
    if ('reason' in base && base.reason==='requires_separate_dispatch' && order.store==='Sewera' && count>=2 && order.lines.every(line=>line.packages.length===1)) {
      return quoteRequiredDispatch(order,base,atomic,postcode,limited);
    }
    if (!('quote' in base) || !valid(base.quote, postcode) || base.quote.orders || !count || quotedMaterialsGrosze(order,base.quote)===null) return base;
    // The full renovation gets its mandatory whole-store quotes first. A
    // later pass reuses these exact native quotes before exploring optional
    // splits. Required Sewera branch dispatch remains above this gate.
    if(!allowOptional())return base;
    // Native line rounding is not additive across separate carts. Retain the
    // verified whole-cart total until partitions support those merchandise sums.
    if(base.quote.materialsRoundingGrosze!==undefined){if(count>1||order.lines.some(l=>l.packages.some(p=>p.count>1)))limited();return base;}
    if(!base.quote.costGrosze&&!supportsCartPricing(order.store))return base;
    const full:QuotedOrder={order,quote:base.quote};
    if(count===1){if(order.lines[0].packages.length>1&&order.lines[0].packages.some(p=>p.count>1))limited();const parts=await quantityOrderPartitions(full,atomic,postcode,limited);return{quote:await combineOrderQuotes(full,parts,postcode)};}
    // We compare whole-line groups and quantity splits within isolated lines.
    // Overlapping mixes such as A2+B and A2 are not exhaustively enumerated.
    if(order.lines.some(l=>l.packages.some(p=>p.count>1)))limited();
    if (new Set(order.lines.map(line => line.product.id)).size !== count) { limited(); return base; }
    const make = (indices: number[]): DeliveredStoreBasket => {
      const lines = indices.map(i => order.lines[i]);
      return { ...order, lines, materialsGrosze: lines.reduce((n, line) => n + line.packages.reduce((s, p) => s + p.lineCostGrosze, 0), 0), quote: undefined, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown' };
    };
    type Part = QuotedOrder;
    const read = async (indices: number[]): Promise<Part[] | null> => {
      const basket = make(indices);
      try {
        const result = await atomic(basket, postcode);
        if ('quote' in result && !result.quote.orders && valid(result.quote, postcode)&&quotedMaterialsGrosze(basket,result.quote)!==null) return quantityOrderPartitions({order:basket,quote:result.quote},atomic,postcode,limited);
        if (!('reason' in result) || !['no_home_delivery', 'product_unavailable', 'purchase_rules_changed'].includes(result.reason)) limited();
      } catch { limited(); /* An unchecked partial order never lowers the total. */ }
      return null;
    };
    let best: Part[] = [{ order, quote: base.quote }];
    const total = (parts: Part[]) => parts.reduce((n, p) => n + (quotedOrderTotal(p.order,p.quote)??Infinity), 0);
    if (count <= 5) {
      const all = (1 << count) - 1, parts = new Map<number, Part[]>([[all, best]]);
      // Singles and their complements first: useful complete plans survive a
      // bounded request budget even when later combinations cannot be checked.
      const masks = [...new Set([...Array.from({ length: count }, (_, i) => 1 << i), ...Array.from({ length: count }, (_, i) => all ^ (1 << i)), ...Array.from({ length: all - 1 }, (_, i) => i + 1)])];
      const properMasks=masks.filter(mask=>mask!==all);
      const quoted=await readIndependentCarts(properMasks,mask=>read(Array.from({length:count},(_,i)=>i).filter(i=>mask&(1<<i))));
      for(const[index,part]of quoted.entries())if(part)parts.set(properMasks[index],part);
      const memo = new Map<number, Part[] | null>([[0, []]]);
      const solve = (mask: number): Part[] | null => {
        if (memo.has(mask)) return memo.get(mask)!;
        let chosen: Part[] | null = parts.get(mask) ?? null;
        const first = mask & -mask;
        for (let sub = (mask - 1) & mask; sub; sub = (sub - 1) & mask) {
          if (!(sub & first) || !parts.has(sub)) continue;
          const rest = solve(mask ^ sub); if (!rest) continue;
          const candidate = [...parts.get(sub)!, ...rest];
          if (!chosen || total(candidate) < total(chosen) || total(candidate) === total(chosen) && candidate.length < chosen.length) chosen = candidate;
        }
        memo.set(mask, chosen); return chosen;
      };
      best = solve(all) ?? best;
    } else {
      limited();
      // Large orders retain a bounded selection of independently verified
      // two-order plans. Do not claim an exhaustive partition search.
      const quoted=await readIndependentCarts(Array.from({length:Math.min(count,8)},(_,i)=>i),async i=>{
        const one = await read([i]), rest = await read(Array.from({ length: count }, (_, j) => j).filter(j => j !== i));
        return one&&rest?[...one,...rest]:null;
      });
      for(const parts of quoted)if(parts&&total(parts)<total(best))best=parts;
    }
    const costGrosze = total(best);
    if (best.length < 2 || costGrosze >= quotedOrderTotal(order,base.quote)! || !Number.isSafeInteger(costGrosze)
        || best.some(part => !valid(part.quote, postcode)) || best.reduce((n, p) => n + p.order.materialsGrosze, 0) !== order.materialsGrosze) return base;
    return {quote:await combineOrderQuotes(full,best,postcode)};
  };
}
