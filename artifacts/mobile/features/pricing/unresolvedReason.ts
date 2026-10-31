import type { UnresolvedReason } from './pricingApi';

/** Current server statuses plus persisted responses from the earlier client
 * contract. An existing product without an offer must not look unknown. */
export function isMissingOffer(reason: UnresolvedReason | undefined): boolean {
  return reason === 'no-offer' || reason === 'no_offer' || reason === 'no_price';
}

export function unresolvedReasonKey(reason: UnresolvedReason | undefined) {
  switch (reason) {
    case 'cut-dimensions-required': return 'cmp.CostEstimate.reason.cut_dimensions' as const;
    case 'insufficient-stock': return 'cmp.CostEstimate.reason.insufficient_stock' as const;
    case 'no-product':
    case 'not_found': return 'cmp.CostEstimate.reason.not_found' as const;
    case 'no-offer':
    case 'no_offer': return 'cmp.CostEstimate.reason.no_offer' as const;
    case 'no_price': return 'cmp.CostEstimate.reason.no_price' as const;
    case 'no-query':
    case 'empty_query': return 'cmp.CostEstimate.reason.empty_query' as const;
    default: return 'cmp.CostEstimate.reason.unknown' as const;
  }
}
