/** Only an address preference is shared. Fees and quotes always belong to a basket. */
export const DELIVERY_POSTCODE_KEY = 'remont.delivery-postcode.v1';
export function isClearedSharedPostcode(raw: string | null): boolean {
  try { const value=raw?JSON.parse(raw):null; return value?.version===1 && value.postalCode===null; }
  catch { return false; }
}
export function parseSharedPostcode(raw: string | null): string | null {
  try {
    const value = raw ? JSON.parse(raw) : null;
    return value?.version === 1 && typeof value.postalCode === 'string' && /^\d{2}-\d{3}$/.test(value.postalCode) ? value.postalCode : null;
  } catch { return null; }
}
export function serializeSharedPostcode(postalCode: string | undefined): string | null {
  return postalCode === undefined ? JSON.stringify({version:1,postalCode:null}) : /^\d{2}-\d{3}$/.test(postalCode) ? JSON.stringify({version:1,postalCode}) : null;
}
