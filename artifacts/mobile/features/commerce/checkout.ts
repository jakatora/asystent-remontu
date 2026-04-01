import type {
  CheckoutHandoff,
  CheckoutPayload,
  CheckoutPayloadLine,
  CartDraft,
  CommerceProviderType,
  CheckoutMode,
} from '@/types/commerce';
import { nowISO } from '@/shared/lib/date';
import { roundMoney } from '@/shared/lib/currency';

export interface CheckoutHandoffOptions {
  provider: CommerceProviderType;
  mode: CheckoutMode;
  locale?: string;
  currency?: string;
  redirectUrl?: string;
  orderNote?: string;
}

export function buildCheckoutHandoff(
  draft: CartDraft,
  options: CheckoutHandoffOptions
): CheckoutHandoff {
  const mappedLines = draft.lines.filter(
    (l) => l.included && l.mappingStatus === 'mapped' && l.mapping
  );

  const payloadLines: CheckoutPayloadLine[] = mappedLines.map((l) => ({
    externalVariantId: l.mapping!.externalVariantId,
    quantity: l.effectiveQuantity,
    properties: {
      renovationJobSource: 'remont-asystent',
      internalId: l.internalId,
    },
  }));

  const estimatedTotal = roundMoney(
    mappedLines.reduce((s, l) => s + l.lineTotal, 0)
  );

  const payload: CheckoutPayload = {
    lines: payloadLines,
    currency: options.currency ?? 'PLN',
    locale: options.locale ?? 'pl-PL',
    note: options.orderNote,
    redirectUrl: options.redirectUrl,
    estimatedTotal,
  };

  const checkoutUrl = buildMockCheckoutUrl(draft.id, options.provider);

  return {
    cartDraftId: draft.id,
    provider: options.provider,
    mode: options.mode,
    checkoutUrl,
    payload,
    createdAt: nowISO(),
  };
}

function buildMockCheckoutUrl(draftId: string, provider: CommerceProviderType): string {
  switch (provider) {
    case 'shopify':
      return `https://store.example.com/cart/${draftId}`;
    case 'woocommerce':
      return `https://store.example.com/checkout?draft=${draftId}`;
    case 'manual_link':
      return `https://store.example.com/products`;
    case 'mock':
    default:
      return `https://mock-store.example.com/checkout/${draftId}`;
  }
}

export function getUnmappedItemsFromDraft(draft: CartDraft): {
  count: number;
  items: { name: string; type: string }[];
} {
  const unmapped = draft.lines.filter(
    (l) => l.included && l.mappingStatus !== 'mapped'
  );
  return {
    count: unmapped.length,
    items: unmapped.map((l) => ({ name: l.internalName, type: l.sourceType })),
  };
}

export function canProceedToCheckout(draft: CartDraft): {
  ready: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const included = draft.lines.filter((l) => l.included);

  if (included.length === 0) {
    reasons.push('Koszyk jest pusty.');
  }

  const mapped = included.filter((l) => l.mappingStatus === 'mapped');
  if (mapped.length === 0) {
    reasons.push('Żaden produkt nie jest zmapowany do sklepu.');
  }

  const zeroQty = included.filter((l) => l.effectiveQuantity <= 0);
  if (zeroQty.length > 0) {
    reasons.push(`${zeroQty.length} pozycji ma zerową ilość.`);
  }

  return { ready: reasons.length === 0, reasons };
}
