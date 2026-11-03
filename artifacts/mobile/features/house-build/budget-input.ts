import { parseDecimal } from '@/shared/lib/number';

function parseAmount(input: string): number | null {
  const value = input.trim();
  if (!value) return null;
  const amount = parseDecimal(value);
  return amount >= 0 && !/[.,]\d{3,}$/.test(value) && Number.isSafeInteger(Math.round(amount * 100))
    ? amount : NaN;
}

export function parseBudgetRange(low: string, high: string) {
  const amountLow = parseAmount(low);
  const amountHigh = parseAmount(high);
  if (Number.isNaN(amountLow) || Number.isNaN(amountHigh)) return { error: 'amount' } as const;
  if (amountLow !== null && amountHigh !== null && amountLow > amountHigh) return { error: 'order' } as const;
  return { error: null, amountLow, amountHigh } as const;
}

export function parseReferenceOverride(low: string, high: string, referenceMin: number, referenceMax: number) {
  const range = parseBudgetRange(low, high);
  if (range.error) return range;
  const { amountLow, amountHigh } = range;
  if ((amountLow ?? referenceMin) > (amountHigh ?? referenceMax)) return { error: 'order' } as const;
  const baseline = amountLow === null || amountHigh === null ? null : (() => {
    const min = Math.round(amountLow * 100);
    const max = Math.round(amountHigh * 100);
    return (min + Math.round((max - min) / 2)) / 100;
  })();
  return { error: null, overrideMin: amountLow, overrideMax: amountHigh, overrideBaseline: baseline } as const;
}
