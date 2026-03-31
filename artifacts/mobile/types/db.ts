// ─── Raw SQLite row shapes (no `any`) ──────────────────────────────────────
// These mirror the database columns exactly (snake_case).
// Deserialization to domain types happens in repositories.

export interface ProjectRow {
  id: string;
  name: string;
  job_id: string;
  job_name: string;
  category_id: string;
  measurements: string;
  calculation_result: string | null;
  status: string;
  total_budget: number | null;
  actual_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
}

export interface ShoppingItemRow {
  id: string;
  project_id: string;
  material_id: string;
  name: string;
  quantity: number;
  unit: string;
  estimated_price: number;
  purchased: number;
  notes: string | null;
  created_at: string;
}

export interface OnboardingRow {
  id: number;
  completed_at: string;
}

export interface SchemaVersionRow {
  version: number;
  applied_at: string;
}
