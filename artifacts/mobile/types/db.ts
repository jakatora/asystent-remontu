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
  room_name: string | null;
  room_width: number | null;
  room_length: number | null;
  room_height: number | null;
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
  owned: number;
  item_type: string;
  tier: string;
  category: string | null;
  custom_price: number | null;
  custom_quantity: number | null;
}

export interface OnboardingRow {
  id: number;
  completed_at: string;
}

export interface ProjectPhotoRow {
  id: string;
  project_id: string;
  uri: string;
  photo_type: string;
  caption: string | null;
  created_at: string;
}

export interface ProjectChecklistRow {
  id: string;
  project_id: string;
  step_index: number;
  title: string;
  description: string | null;
  completed: number;
  completed_at: string | null;
  created_at: string;
}

export interface ProjectActivityRow {
  id: string;
  project_id: string;
  action_type: string;
  description: string;
  created_at: string;
}

export interface SchemaVersionRow {
  version: number;
  applied_at: string;
}
