export function formatCurrency(amount: number, currency = 'PLN'): string {
  if (!isFinite(amount)) return `0.00 ${currency}`;
  return `${amount.toFixed(2)} ${currency}`;
}

export function formatCurrencyShort(amount: number, currency = 'zł'): string {
  if (!isFinite(amount)) return `0 ${currency}`;
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)} tys. ${currency}`;
  }
  return `${Math.round(amount)} ${currency}`;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
