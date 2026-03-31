import type { Project, ShoppingItem } from '@/types/domain';
import type { SyncAdapter } from './sync.adapter';
import { getSupabase } from '@/lib/supabase';
import { SUPABASE_TABLES } from '@/constants/app';
import { nowISO } from '@/shared/lib/date';

// ─── Supabase table row shapes ────────────────────────────────────────────────
// These match the Supabase Postgres schema (snake_case).

interface SupabaseProjectRow {
  id:                 string;
  user_id:            string;
  name:               string;
  job_id:             string;
  job_name:           string;
  category_id:        string;
  measurements:       Record<string, number>;
  calculation_result: Record<string, unknown> | null;
  status:             string;
  total_budget:       number | null;
  actual_cost:        number | null;
  notes:              string | null;
  created_at:         string;
  updated_at:         string;
  synced_at:          string | null;
}

interface SupabaseShoppingRow {
  id:              string;
  project_id:      string;
  user_id:         string;
  material_id:     string;
  name:            string;
  quantity:        number;
  unit:            string;
  estimated_price: number;
  purchased:       boolean;
  notes:           string | null;
  created_at:      string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function projectToRow(project: Project, userId: string): Omit<SupabaseProjectRow, 'synced_at'> {
  return {
    id:                 project.id,
    user_id:            userId,
    name:               project.name,
    job_id:             project.jobId,
    job_name:           project.jobName,
    category_id:        project.categoryId,
    measurements:       project.measurements,
    calculation_result: (project.calculationResult as unknown as Record<string, unknown>) ?? null,
    status:             project.status,
    total_budget:       project.totalBudget ?? null,
    actual_cost:        project.actualCost ?? null,
    notes:              project.notes ?? null,
    created_at:         project.createdAt,
    updated_at:         project.updatedAt,
  };
}

function rowToProject(row: SupabaseProjectRow): Project {
  return {
    id:                row.id,
    name:              row.name,
    jobId:             row.job_id,
    jobName:           row.job_name,
    categoryId:        row.category_id,
    measurements:      row.measurements as Record<string, number>,
    calculationResult: row.calculation_result as unknown as Project['calculationResult'],
    status:            row.status as Project['status'],
    totalBudget:       row.total_budget ?? undefined,
    actualCost:        row.actual_cost ?? undefined,
    notes:             row.notes ?? undefined,
    createdAt:         row.created_at,
    updatedAt:         row.updated_at,
    syncedAt:          row.synced_at ?? undefined,
  };
}

function shoppingToRow(item: ShoppingItem, userId: string): SupabaseShoppingRow {
  return {
    id:              item.id,
    project_id:      item.projectId,
    user_id:         userId,
    material_id:     item.materialId,
    name:            item.name,
    quantity:        item.quantity,
    unit:            item.unit,
    estimated_price: item.estimatedPrice,
    purchased:       item.purchased,
    notes:           item.notes ?? null,
    created_at:      item.createdAt,
  };
}

function rowToShoppingItem(row: SupabaseShoppingRow): ShoppingItem {
  return {
    id:             row.id,
    projectId:      row.project_id,
    materialId:     row.material_id,
    name:           row.name,
    quantity:       row.quantity,
    unit:           row.unit,
    estimatedPrice: row.estimated_price,
    purchased:      row.purchased,
    notes:          row.notes ?? undefined,
    createdAt:      row.created_at,
  };
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class SupabaseSyncAdapter implements SyncAdapter {
  private readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async pushProject(project: Project): Promise<string> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const row = { ...projectToRow(project, this.userId), synced_at: nowISO() };
    const { error } = await supabase
      .from(SUPABASE_TABLES.projects)
      .upsert(row, { onConflict: 'id' });

    if (error) throw new Error(`Supabase pushProject: ${error.message}`);
    return row.synced_at;
  }

  async pullProjects(): Promise<Project[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.projects)
      .select('*')
      .eq('user_id', this.userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Supabase pullProjects: ${error.message}`);
    return (data as SupabaseProjectRow[]).map(rowToProject);
  }

  async pushShoppingItem(item: ShoppingItem): Promise<string> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const row = shoppingToRow(item, this.userId);
    const { error } = await supabase
      .from(SUPABASE_TABLES.shoppingItems)
      .upsert(row, { onConflict: 'id' });

    if (error) throw new Error(`Supabase pushShoppingItem: ${error.message}`);
    return nowISO();
  }

  async pullShoppingItems(projectId: string): Promise<ShoppingItem[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.shoppingItems)
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', this.userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Supabase pullShoppingItems: ${error.message}`);
    return (data as SupabaseShoppingRow[]).map(rowToShoppingItem);
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────
// Call this after the user is authenticated.

export function createSupabaseAdapter(userId: string): SupabaseSyncAdapter {
  return new SupabaseSyncAdapter(userId);
}
