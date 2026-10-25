/** Postal code belongs to each project/user; both commonly typed forms work. */
export function normalizeDeliveryPostalCode(value: string): string | null {
  if (!/^\d{2}-?\d{3}$/.test(value.trim())) return null;
  const compact = value.trim().replace('-', '');
  return /^\d{5}$/.test(compact) ? compact.slice(0, 2) + '-' + compact.slice(2) : null;
}

/** Convert typed PLN into integer grosze without floating-point arithmetic. */
export function parseDeliveryCosts(values: Readonly<Record<string, string>>):
  { ok: true; costsGrosze: Record<string, number> } | { ok: false; store: string } {
  const costsGrosze: Record<string, number> = Object.create(null);
  for (const [store, raw] of Object.entries(values)) {
    const value = raw.trim();
    if (!value) continue; // Unknown delivery is deliberately different from free.
    const match = /^(\d{1,6})(?:[.,](\d{1,2}))?$/.exec(value);
    if (!match) return { ok: false, store };
    const grosze = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
    if (!Number.isSafeInteger(grosze) || grosze > 10_000_000) return { ok: false, store };
    costsGrosze[store] = grosze;
  }
  return { ok: true, costsGrosze };
}
