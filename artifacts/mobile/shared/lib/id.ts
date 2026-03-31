const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateId(prefix?: string): string {
  let rand = '';
  for (let i = 0; i < 9; i++) {
    rand += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  const ts = Date.now().toString(36);
  return prefix ? `${prefix}_${ts}${rand}` : `${ts}${rand}`;
}
