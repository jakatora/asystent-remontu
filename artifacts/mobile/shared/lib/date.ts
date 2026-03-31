export function nowISO(): string {
  return new Date().toISOString();
}

export function formatDatePL(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return isoString;
  }
}

export function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}
