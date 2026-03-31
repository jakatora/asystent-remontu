import type { Project, ShoppingItem } from '@/types/domain';

// ─── Sync adapter interface ──────────────────────────────────────────────────
// This interface is the contract for future remote sync (e.g. Supabase).
// The local SQLite implementation satisfies this interface by default.
// To add Supabase sync: implement SyncAdapter and inject it into the context.

export interface SyncAdapter {
  /**
   * Push local project to remote. Returns the synced-at timestamp on success.
   * Throws on error (caller should catch and handle offline gracefully).
   */
  pushProject(project: Project): Promise<string>;

  /**
   * Pull all remote projects for the current user.
   */
  pullProjects(): Promise<Project[]>;

  /**
   * Push a shopping item to remote.
   */
  pushShoppingItem(item: ShoppingItem): Promise<string>;

  /**
   * Pull shopping items for a project from remote.
   */
  pullShoppingItems(projectId: string): Promise<ShoppingItem[]>;
}

// ─── Null adapter (no-op — used when offline sync is disabled) ──────────────

export class NullSyncAdapter implements SyncAdapter {
  async pushProject(_project: Project): Promise<string> {
    return new Date().toISOString();
  }
  async pullProjects(): Promise<Project[]> {
    return [];
  }
  async pushShoppingItem(_item: ShoppingItem): Promise<string> {
    return new Date().toISOString();
  }
  async pullShoppingItems(_projectId: string): Promise<ShoppingItem[]> {
    return [];
  }
}

export const nullSyncAdapter = new NullSyncAdapter();
