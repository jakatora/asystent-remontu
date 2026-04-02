import type {
  TimelineStageRecord,
  TimelineStageStatus,
  StageManagementMode,
  StageBudgetItem,
  StageCostCategory,
  BuildTimelineMilestone,
  TimelineNoteRecord,
  TimelineNoteType,
  StageProfessionalPlan,
  ProfessionalRole,
  ProfessionalNeedState,
  EnergyStrategyRecord,
} from '@/types/house-build';
import { getDb } from '@/db/client';

function generateId(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

interface TimelineStageRow {
  id: string;
  project_id: string;
  stage_key: string;
  status: string;
  custom_name: string | null;
  sort_order: number;
  estimated_weeks: number | null;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  management_mode: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface BudgetItemRow {
  id: string;
  project_id: string;
  stage_key: string;
  category: string;
  label: string;
  amount_low: number | null;
  amount_high: number | null;
  user_override: number | null;
  notes: string;
  created_at: string;
}

interface MilestoneRow {
  id: string;
  project_id: string;
  key: string;
  label: string;
  status: string;
  planned_date: string | null;
  completed_date: string | null;
  notes: string;
  sort_order: number;
  created_at: string;
}

interface TimelineNoteRow {
  id: string;
  project_id: string;
  stage_key: string;
  note_type: string;
  text: string;
  created_at: string;
}

interface ProfessionalPlanRow {
  id: string;
  project_id: string;
  stage_key: string;
  role: string;
  need_state: string;
  contractor_name: string | null;
  notes: string;
  created_at: string;
}

interface EnergyStrategyRow {
  id: string;
  project_id: string;
  heating_concept: string;
  ventilation_concept: string;
  insulation_notes: string;
  window_standard: string;
  is_decided: number;
  updated_at: string;
}

function timelineFromRow(row: TimelineStageRow): TimelineStageRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    stageKey: row.stage_key,
    status: row.status as TimelineStageStatus,
    customName: row.custom_name,
    sortOrder: row.sort_order,
    estimatedWeeks: row.estimated_weeks,
    plannedStart: row.planned_start,
    plannedEnd: row.planned_end,
    actualStart: row.actual_start,
    actualEnd: row.actual_end,
    managementMode: row.management_mode as StageManagementMode,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function budgetItemFromRow(row: BudgetItemRow): StageBudgetItem {
  return {
    id: row.id,
    projectId: row.project_id,
    stageKey: row.stage_key,
    category: row.category as StageCostCategory,
    label: row.label,
    amountLow: row.amount_low,
    amountHigh: row.amount_high,
    userOverride: row.user_override,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function milestoneFromRow(row: MilestoneRow): BuildTimelineMilestone {
  return {
    id: row.id,
    projectId: row.project_id,
    key: row.key,
    label: row.label,
    status: row.status as 'pending' | 'reached' | 'skipped',
    plannedDate: row.planned_date,
    completedDate: row.completed_date,
    notes: row.notes,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function timelineNoteFromRow(row: TimelineNoteRow): TimelineNoteRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    stageKey: row.stage_key,
    noteType: row.note_type as TimelineNoteType,
    text: row.text,
    createdAt: row.created_at,
  };
}

function professionalPlanFromRow(row: ProfessionalPlanRow): StageProfessionalPlan {
  return {
    id: row.id,
    projectId: row.project_id,
    stageKey: row.stage_key,
    role: row.role as ProfessionalRole,
    needState: row.need_state as ProfessionalNeedState,
    contractorName: row.contractor_name,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function energyFromRow(row: EnergyStrategyRow): EnergyStrategyRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    heatingConcept: row.heating_concept,
    ventilationConcept: row.ventilation_concept,
    insulationNotes: row.insulation_notes,
    windowStandard: row.window_standard,
    isDecided: row.is_decided === 1,
    updatedAt: row.updated_at,
  };
}

export const timelineBudgetRepo = {
  async getTimelineStages(projectId: string): Promise<TimelineStageRecord[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<TimelineStageRow>(
      'SELECT * FROM build_timeline_stages WHERE project_id = ? ORDER BY sort_order',
      [projectId]
    );
    return rows.map(timelineFromRow);
  },

  async upsertTimelineStage(projectId: string, stageKey: string, data: {
    status?: TimelineStageStatus;
    customName?: string | null;
    sortOrder?: number;
    estimatedWeeks?: number | null;
    plannedStart?: string | null;
    plannedEnd?: string | null;
    actualStart?: string | null;
    actualEnd?: string | null;
    managementMode?: StageManagementMode;
    notes?: string;
  }): Promise<string> {
    const db = await getDb();
    const existing = await db.getFirstAsync<TimelineStageRow>(
      'SELECT * FROM build_timeline_stages WHERE project_id = ? AND stage_key = ?',
      [projectId, stageKey]
    );
    const now = new Date().toISOString();
    if (existing) {
      const sets: string[] = [];
      const values: (string | number | null)[] = [];
      if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
      if (data.customName !== undefined) { sets.push('custom_name = ?'); values.push(data.customName); }
      if (data.sortOrder !== undefined) { sets.push('sort_order = ?'); values.push(data.sortOrder); }
      if (data.estimatedWeeks !== undefined) { sets.push('estimated_weeks = ?'); values.push(data.estimatedWeeks); }
      if (data.plannedStart !== undefined) { sets.push('planned_start = ?'); values.push(data.plannedStart); }
      if (data.plannedEnd !== undefined) { sets.push('planned_end = ?'); values.push(data.plannedEnd); }
      if (data.actualStart !== undefined) { sets.push('actual_start = ?'); values.push(data.actualStart); }
      if (data.actualEnd !== undefined) { sets.push('actual_end = ?'); values.push(data.actualEnd); }
      if (data.managementMode !== undefined) { sets.push('management_mode = ?'); values.push(data.managementMode); }
      if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
      sets.push('updated_at = ?');
      values.push(now);
      values.push(existing.id);
      await db.runAsync(`UPDATE build_timeline_stages SET ${sets.join(', ')} WHERE id = ?`, values);
      return existing.id;
    }
    const id = generateId('bts');
    await db.runAsync(
      `INSERT INTO build_timeline_stages (id, project_id, stage_key, status, custom_name, sort_order, estimated_weeks, planned_start, planned_end, actual_start, actual_end, management_mode, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, stageKey, data.status ?? 'not-started', data.customName ?? null, data.sortOrder ?? 0, data.estimatedWeeks ?? null, data.plannedStart ?? null, data.plannedEnd ?? null, data.actualStart ?? null, data.actualEnd ?? null, data.managementMode ?? 'self', data.notes ?? '', now, now]
    );
    return id;
  },

  async getBudgetItems(projectId: string, stageKey?: string): Promise<StageBudgetItem[]> {
    const db = await getDb();
    if (stageKey) {
      const rows = await db.getAllAsync<BudgetItemRow>(
        'SELECT * FROM build_budget_items WHERE project_id = ? AND stage_key = ? ORDER BY created_at',
        [projectId, stageKey]
      );
      return rows.map(budgetItemFromRow);
    }
    const rows = await db.getAllAsync<BudgetItemRow>(
      'SELECT * FROM build_budget_items WHERE project_id = ? ORDER BY stage_key, created_at',
      [projectId]
    );
    return rows.map(budgetItemFromRow);
  },

  async addBudgetItem(projectId: string, stageKey: string, data: {
    category: StageCostCategory;
    label: string;
    amountLow?: number | null;
    amountHigh?: number | null;
    userOverride?: number | null;
    notes?: string;
  }): Promise<string> {
    const db = await getDb();
    const id = generateId('bbi');
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO build_budget_items (id, project_id, stage_key, category, label, amount_low, amount_high, user_override, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, stageKey, data.category, data.label, data.amountLow ?? null, data.amountHigh ?? null, data.userOverride ?? null, data.notes ?? '', now]
    );
    return id;
  },

  async updateBudgetItem(id: string, data: {
    amountLow?: number | null;
    amountHigh?: number | null;
    userOverride?: number | null;
    notes?: string;
  }): Promise<void> {
    const db = await getDb();
    const sets: string[] = [];
    const values: (number | string | null)[] = [];
    if (data.amountLow !== undefined) { sets.push('amount_low = ?'); values.push(data.amountLow); }
    if (data.amountHigh !== undefined) { sets.push('amount_high = ?'); values.push(data.amountHigh); }
    if (data.userOverride !== undefined) { sets.push('user_override = ?'); values.push(data.userOverride); }
    if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
    if (sets.length === 0) return;
    values.push(id);
    await db.runAsync(`UPDATE build_budget_items SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async deleteBudgetItem(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_budget_items WHERE id = ?', [id]);
  },

  async getMilestones(projectId: string): Promise<BuildTimelineMilestone[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<MilestoneRow>(
      'SELECT * FROM build_milestones WHERE project_id = ? ORDER BY sort_order',
      [projectId]
    );
    return rows.map(milestoneFromRow);
  },

  async upsertMilestone(projectId: string, key: string, data: {
    label?: string;
    status?: 'pending' | 'reached' | 'skipped';
    plannedDate?: string | null;
    completedDate?: string | null;
    notes?: string;
    sortOrder?: number;
  }): Promise<string> {
    const db = await getDb();
    const existing = await db.getFirstAsync<MilestoneRow>(
      'SELECT * FROM build_milestones WHERE project_id = ? AND key = ?',
      [projectId, key]
    );
    const now = new Date().toISOString();
    if (existing) {
      const sets: string[] = [];
      const values: (string | number | null)[] = [];
      if (data.label !== undefined) { sets.push('label = ?'); values.push(data.label); }
      if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
      if (data.plannedDate !== undefined) { sets.push('planned_date = ?'); values.push(data.plannedDate); }
      if (data.completedDate !== undefined) { sets.push('completed_date = ?'); values.push(data.completedDate); }
      if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
      if (data.sortOrder !== undefined) { sets.push('sort_order = ?'); values.push(data.sortOrder); }
      if (sets.length === 0) return existing.id;
      values.push(existing.id);
      await db.runAsync(`UPDATE build_milestones SET ${sets.join(', ')} WHERE id = ?`, values);
      return existing.id;
    }
    const id = generateId('bml');
    await db.runAsync(
      `INSERT INTO build_milestones (id, project_id, key, label, status, planned_date, completed_date, notes, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, key, data.label ?? key, data.status ?? 'pending', data.plannedDate ?? null, data.completedDate ?? null, data.notes ?? '', data.sortOrder ?? 0, now]
    );
    return id;
  },

  async getTimelineNotes(projectId: string, stageKey?: string): Promise<TimelineNoteRecord[]> {
    const db = await getDb();
    if (stageKey) {
      const rows = await db.getAllAsync<TimelineNoteRow>(
        'SELECT * FROM build_timeline_notes WHERE project_id = ? AND stage_key = ? ORDER BY created_at DESC',
        [projectId, stageKey]
      );
      return rows.map(timelineNoteFromRow);
    }
    const rows = await db.getAllAsync<TimelineNoteRow>(
      'SELECT * FROM build_timeline_notes WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );
    return rows.map(timelineNoteFromRow);
  },

  async addTimelineNote(projectId: string, stageKey: string, data: {
    noteType: TimelineNoteType;
    text: string;
  }): Promise<string> {
    const db = await getDb();
    const id = generateId('btn');
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO build_timeline_notes (id, project_id, stage_key, note_type, text, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, projectId, stageKey, data.noteType, data.text, now]
    );
    return id;
  },

  async deleteTimelineNote(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_timeline_notes WHERE id = ?', [id]);
  },

  async getProfessionalPlans(projectId: string, stageKey?: string): Promise<StageProfessionalPlan[]> {
    const db = await getDb();
    if (stageKey) {
      const rows = await db.getAllAsync<ProfessionalPlanRow>(
        'SELECT * FROM build_professional_plans WHERE project_id = ? AND stage_key = ? ORDER BY created_at',
        [projectId, stageKey]
      );
      return rows.map(professionalPlanFromRow);
    }
    const rows = await db.getAllAsync<ProfessionalPlanRow>(
      'SELECT * FROM build_professional_plans WHERE project_id = ? ORDER BY stage_key, created_at',
      [projectId]
    );
    return rows.map(professionalPlanFromRow);
  },

  async upsertProfessionalPlan(projectId: string, stageKey: string, role: ProfessionalRole, data: {
    needState?: ProfessionalNeedState;
    contractorName?: string | null;
    notes?: string;
  }): Promise<string> {
    const db = await getDb();
    const existing = await db.getFirstAsync<ProfessionalPlanRow>(
      'SELECT * FROM build_professional_plans WHERE project_id = ? AND stage_key = ? AND role = ?',
      [projectId, stageKey, role]
    );
    const now = new Date().toISOString();
    if (existing) {
      const sets: string[] = [];
      const values: (string | null)[] = [];
      if (data.needState !== undefined) { sets.push('need_state = ?'); values.push(data.needState); }
      if (data.contractorName !== undefined) { sets.push('contractor_name = ?'); values.push(data.contractorName); }
      if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
      if (sets.length === 0) return existing.id;
      values.push(existing.id);
      await db.runAsync(`UPDATE build_professional_plans SET ${sets.join(', ')} WHERE id = ?`, values);
      return existing.id;
    }
    const id = generateId('bpp');
    await db.runAsync(
      `INSERT INTO build_professional_plans (id, project_id, stage_key, role, need_state, contractor_name, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, stageKey, role, data.needState ?? 'not-decided', data.contractorName ?? null, data.notes ?? '', now]
    );
    return id;
  },

  async getEnergyStrategy(projectId: string): Promise<EnergyStrategyRecord | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<EnergyStrategyRow>(
      'SELECT * FROM build_energy_strategy WHERE project_id = ?',
      [projectId]
    );
    return row ? energyFromRow(row) : null;
  },

  async upsertEnergyStrategy(projectId: string, data: {
    heatingConcept?: string;
    ventilationConcept?: string;
    insulationNotes?: string;
    windowStandard?: string;
    isDecided?: boolean;
  }): Promise<string> {
    const db = await getDb();
    const existing = await db.getFirstAsync<EnergyStrategyRow>(
      'SELECT * FROM build_energy_strategy WHERE project_id = ?',
      [projectId]
    );
    const now = new Date().toISOString();
    if (existing) {
      const sets: string[] = [];
      const values: (string | number | null)[] = [];
      if (data.heatingConcept !== undefined) { sets.push('heating_concept = ?'); values.push(data.heatingConcept); }
      if (data.ventilationConcept !== undefined) { sets.push('ventilation_concept = ?'); values.push(data.ventilationConcept); }
      if (data.insulationNotes !== undefined) { sets.push('insulation_notes = ?'); values.push(data.insulationNotes); }
      if (data.windowStandard !== undefined) { sets.push('window_standard = ?'); values.push(data.windowStandard); }
      if (data.isDecided !== undefined) { sets.push('is_decided = ?'); values.push(data.isDecided ? 1 : 0); }
      sets.push('updated_at = ?');
      values.push(now);
      values.push(existing.id);
      await db.runAsync(`UPDATE build_energy_strategy SET ${sets.join(', ')} WHERE id = ?`, values);
      return existing.id;
    }
    const id = generateId('bes');
    await db.runAsync(
      `INSERT INTO build_energy_strategy (id, project_id, heating_concept, ventilation_concept, insulation_notes, window_standard, is_decided, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, data.heatingConcept ?? '', data.ventilationConcept ?? '', data.insulationNotes ?? '', data.windowStandard ?? '', data.isDecided ? 1 : 0, now]
    );
    return id;
  },

  async getBudgetNotes(projectId: string, stageKey?: string): Promise<{ id: string; projectId: string; stageKey: string; text: string; createdAt: string }[]> {
    const db = await getDb();
    if (stageKey) {
      const rows = await db.getAllAsync<{ id: string; project_id: string; stage_key: string; text: string; created_at: string }>(
        'SELECT * FROM build_budget_notes WHERE project_id = ? AND stage_key = ? ORDER BY created_at DESC',
        [projectId, stageKey]
      );
      return rows.map((r) => ({ id: r.id, projectId: r.project_id, stageKey: r.stage_key, text: r.text, createdAt: r.created_at }));
    }
    const rows = await db.getAllAsync<{ id: string; project_id: string; stage_key: string; text: string; created_at: string }>(
      'SELECT * FROM build_budget_notes WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );
    return rows.map((r) => ({ id: r.id, projectId: r.project_id, stageKey: r.stage_key, text: r.text, createdAt: r.created_at }));
  },

  async addBudgetNote(projectId: string, stageKey: string, text: string): Promise<string> {
    const db = await getDb();
    const id = generateId('bbn');
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO build_budget_notes (id, project_id, stage_key, text, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, projectId, stageKey, text, now]
    );
    return id;
  },

  async deleteBudgetNote(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_budget_notes WHERE id = ?', [id]);
  },

  async deleteProjectData(projectId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_timeline_stages WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_budget_items WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_budget_notes WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_milestones WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_timeline_notes WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_professional_plans WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_energy_strategy WHERE project_id = ?', [projectId]);
  },
};
