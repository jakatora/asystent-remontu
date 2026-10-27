import type { SerializedProject } from './pricingApi';
import { pendingDeliveryPlan } from './pendingDeliveryPlan';
import { groupUnpricedLines } from './unpricedGroups';

export type PurchaseSnapshot = { kind: 'empty'; observedAt: number } | {
  kind: 'quote'; observedAt: number; validUntil: number; selectedStore: string | null; data: SerializedProject;
};
export function purchaseSnapshot(data: SerializedProject, selectedStore: string | null, now = Date.now()): PurchaseSnapshot {
  const expiries = [now + 10 * 60_000];
  for (const store of (data.deliveryComparison?.best ?? data.deliveryComparison?.purchasePlan ?? data.deliveryComparison?.lowerBound)?.stores ?? []) {
    if (store.quote) expiries.push(Date.parse(store.quote.expiresAt));
  }
  for (const line of data.consolidated.lines) for (const pack of line.packages ?? []) {
    if (pack.verification) expiries.push(Date.parse(pack.verification.expiresAt));
  }
  return { kind: 'quote', observedAt: now, validUntil: expiries.every(Number.isFinite) ? Math.min(...expiries) : 0, selectedStore, data };
}
const money = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

/** Display only the server's amount, never fill an absent fee or incomplete
 * basket with zero. This is an in-session comparison, not a persisted price. */
export function purchaseSummary(snapshot: PurchaseSnapshot | null, now = Date.now()) {
  if (!snapshot) return { status: 'unavailable' as const };
  if (snapshot.kind === 'empty') return { status: 'empty' as const };
  if (!Number.isFinite(snapshot.observedAt) || !Number.isFinite(snapshot.validUntil) || snapshot.observedAt > now || now >= snapshot.validUntil) return { status: 'expired' as const };
  const data = snapshot.data, comparison = data.deliveryComparison;
  const missing = groupUnpricedLines(data.stages).length || comparison?.missingProductCount || 0;
  const best = comparison?.best;
  // needs_delivery_costs can describe unquoted competing combinations while
  // best contains a complete, verified basket. Show that basket consistently
  // with the comparison screen, retaining the limited-market notice below.
  const complete = (comparison?.status === 'compared' || comparison?.status === 'needs_delivery_costs') && missing === 0 && data.stages.every(stage => stage.unresolvedCount === 0)
    && best && money(best.materialsGrosze) && money(best.deliveryGrosze) && money(best.totalGrosze)
    && best.materialsGrosze + best.deliveryGrosze === best.totalGrosze
    && best.stores.length > 0 && best.stores.every(store => comparison.mode === 'pickup' || store.source === 'retailer' && store.quote && Date.parse(store.quote.expiresAt) > now);
  const pending = comparison ? pendingDeliveryPlan(comparison, true, now) : null;
  const materials = complete ? best.materialsGrosze : pending ? pending.materialsGrosze : data.consolidated.lines.length > 0 && money(data.consolidated.consolidatedTotalGrosze) ? data.consolidated.consolidatedTotalGrosze : null;
  return {
    status: complete ? 'complete' as const : missing > 0 || comparison?.status === 'partial' ? 'partial' as const : 'shipping_unknown' as const,
    materialsGrosze: materials, deliveryGrosze: complete ? best.deliveryGrosze : null, totalGrosze: complete ? best.totalGrosze : null,
    mode: comparison?.mode ?? 'shipping', postalCode: comparison?.postalCode ?? null, missing,
    selectedStore: snapshot.selectedStore, observedAt: snapshot.observedAt,
    separateOrders: complete ? best.stores.filter(store => (store.quote?.orders?.length ?? 0) > 1).map(store => ({ store: store.store, count: store.quote!.orders!.length })) : [],
    limited: Boolean(comparison?.status === 'needs_delivery_costs' || comparison?.searchLimited || comparison?.unavailableStores?.length || comparison?.partiallyQuotedStores?.length),
    products: data.consolidated.lines.map(line => line.product.name),
  };
}
