import { MATERIAL_STOCK_PREFIX, parseMaterialStock, type MaterialStockEntry } from './materialStock';
interface StockStorage { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> }
const pendingWrites = new WeakMap<StockStorage, Map<string, Promise<void>>>();
/** Navigation and backup exports wait for the same in-flight project write. */
export async function waitForMaterialStockWrites(storage: StockStorage, projectId: string): Promise<void> {
  await pendingWrites.get(storage)?.get(projectId);
}
export async function readMaterialStock(storage: StockStorage, projectId: string): Promise<MaterialStockEntry[]> {
  await waitForMaterialStockWrites(storage, projectId);
  return parseMaterialStock(await storage.getItem(MATERIAL_STOCK_PREFIX + projectId));
}
export async function writeMaterialStock(storage: StockStorage, projectId: string, entries: readonly MaterialStockEntry[]): Promise<MaterialStockEntry[]> {
  if (!projectId || projectId === 'renovation-basket' || projectId.length > 200) throw Error('invalid_material_stock_project');
  const serialized = JSON.stringify({ version: 1, entries }), validated = parseMaterialStock(serialized);
  const writes = pendingWrites.get(storage) ?? new Map<string, Promise<void>>(); pendingWrites.set(storage, writes);
  const previous = writes.get(projectId);
  const write = (previous ?? Promise.resolve()).catch(() => {}).then(() => storage.setItem(MATERIAL_STOCK_PREFIX + projectId, serialized));
  writes.set(projectId, write);
  try { await write; return validated; }
  finally { if (writes.get(projectId) === write) writes.delete(projectId); }
}
