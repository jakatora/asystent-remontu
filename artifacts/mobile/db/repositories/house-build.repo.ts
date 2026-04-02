import type {
  HouseBuildProject,
  BuildProjectStatus,
  LandContext,
  PlanningContext,
  UtilityRequirement,
  UtilityType,
  UtilityStatus,
} from '@/types/house-build';
import { getDb } from '@/db/client';

function generateId(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  land_context: string;
  planning_context: string;
  current_stage_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface ChecklistRow {
  id: string;
  project_id: string;
  stage_key: string;
  title: string;
  description: string | null;
  completed: number;
  completed_at: string | null;
  priority: string;
  requires_professional: number;
  warning_category: string | null;
  created_at: string;
}

interface DocumentRow {
  id: string;
  project_id: string;
  stage_key: string;
  name: string;
  description: string;
  status: string;
  is_required: number;
  obtained_at: string | null;
  created_at: string;
}

interface UtilityRow {
  id: string;
  project_id: string;
  utility_type: string;
  provider_name: string;
  status: string;
  application_date: string | null;
  connection_date: string | null;
  notes: string;
  created_at: string;
}

function projectFromRow(row: ProjectRow): HouseBuildProject {
  return {
    id: row.id,
    name: row.name,
    status: row.status as BuildProjectStatus,
    landContext: JSON.parse(row.land_context) as LandContext,
    planningContext: JSON.parse(row.planning_context) as PlanningContext,
    currentStageId: row.current_stage_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface ChecklistItemRecord {
  readonly id: string;
  readonly projectId: string;
  readonly stageKey: string;
  readonly title: string;
  readonly description: string;
  readonly completed: boolean;
  readonly completedAt: string | null;
  readonly priority: string;
  readonly requiresProfessional: boolean;
  readonly warningCategory: string | null;
  readonly createdAt: string;
}

function checklistFromRow(row: ChecklistRow): ChecklistItemRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    stageKey: row.stage_key,
    title: row.title,
    description: row.description ?? '',
    completed: row.completed === 1,
    completedAt: row.completed_at,
    priority: row.priority,
    requiresProfessional: row.requires_professional === 1,
    warningCategory: row.warning_category,
    createdAt: row.created_at,
  };
}

export interface DocumentRecord {
  readonly id: string;
  readonly projectId: string;
  readonly stageKey: string;
  readonly name: string;
  readonly description: string;
  readonly status: string;
  readonly isRequired: boolean;
  readonly obtainedAt: string | null;
  readonly createdAt: string;
}

function documentFromRow(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    stageKey: row.stage_key,
    name: row.name,
    description: row.description,
    status: row.status,
    isRequired: row.is_required === 1,
    obtainedAt: row.obtained_at,
    createdAt: row.created_at,
  };
}

function utilityFromRow(row: UtilityRow): UtilityRequirement {
  return {
    id: row.id,
    projectId: row.project_id,
    utilityType: row.utility_type as UtilityType,
    providerName: row.provider_name,
    status: row.status as UtilityStatus,
    applicationDate: row.application_date ?? undefined,
    connectionDate: row.connection_date ?? undefined,
    notes: row.notes,
  };
}

export const houseBuildRepo = {
  async findAllProjects(): Promise<HouseBuildProject[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ProjectRow>(
      'SELECT * FROM house_build_projects ORDER BY updated_at DESC'
    );
    return rows.map(projectFromRow);
  },

  async findProjectById(id: string): Promise<HouseBuildProject | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<ProjectRow>(
      'SELECT * FROM house_build_projects WHERE id = ?',
      [id]
    );
    return row ? projectFromRow(row) : null;
  },

  async createProject(data: {
    name: string;
    landContext: LandContext;
    planningContext: PlanningContext;
  }): Promise<string> {
    const db = await getDb();
    const id = generateId('hbp');
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO house_build_projects (id, name, status, land_context, planning_context, notes, created_at, updated_at)
       VALUES (?, ?, 'planning', ?, ?, '', ?, ?)`,
      [id, data.name, JSON.stringify(data.landContext), JSON.stringify(data.planningContext), now, now]
    );
    return id;
  },

  async updateProject(id: string, updates: Partial<Pick<HouseBuildProject, 'name' | 'status' | 'currentStageId' | 'notes'>>): Promise<void> {
    const db = await getDb();
    const sets: string[] = [];
    const values: (string | null)[] = [];
    if (updates.name !== undefined) { sets.push('name = ?'); values.push(updates.name); }
    if (updates.status !== undefined) { sets.push('status = ?'); values.push(updates.status); }
    if (updates.currentStageId !== undefined) { sets.push('current_stage_id = ?'); values.push(updates.currentStageId); }
    if (updates.notes !== undefined) { sets.push('notes = ?'); values.push(updates.notes); }
    if (sets.length === 0) return;
    sets.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
    await db.runAsync(`UPDATE house_build_projects SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async deleteProject(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_timeline_stages WHERE project_id = ?', [id]);
    await db.runAsync('DELETE FROM build_budget_items WHERE project_id = ?', [id]);
    await db.runAsync('DELETE FROM build_budget_notes WHERE project_id = ?', [id]);
    await db.runAsync('DELETE FROM build_milestones WHERE project_id = ?', [id]);
    await db.runAsync('DELETE FROM build_timeline_notes WHERE project_id = ?', [id]);
    await db.runAsync('DELETE FROM build_professional_plans WHERE project_id = ?', [id]);
    await db.runAsync('DELETE FROM build_energy_strategy WHERE project_id = ?', [id]);
    await db.runAsync('DELETE FROM build_utilities WHERE project_id = ?', [id]);
    await db.runAsync('DELETE FROM build_documents WHERE project_id = ?', [id]);
    await db.runAsync('DELETE FROM build_checklist_items WHERE project_id = ?', [id]);
    await db.runAsync('DELETE FROM house_build_projects WHERE id = ?', [id]);
  },

  async getChecklistForProject(projectId: string, stageKey?: string): Promise<ChecklistItemRecord[]> {
    const db = await getDb();
    if (stageKey) {
      const rows = await db.getAllAsync<ChecklistRow>(
        'SELECT * FROM build_checklist_items WHERE project_id = ? AND stage_key = ? ORDER BY created_at',
        [projectId, stageKey]
      );
      return rows.map(checklistFromRow);
    }
    const rows = await db.getAllAsync<ChecklistRow>(
      'SELECT * FROM build_checklist_items WHERE project_id = ? ORDER BY stage_key, created_at',
      [projectId]
    );
    return rows.map(checklistFromRow);
  },

  async addChecklistItem(projectId: string, stageKey: string, data: {
    title: string;
    description?: string;
    priority?: string;
    requiresProfessional?: boolean;
    warningCategory?: string;
  }): Promise<string> {
    const db = await getDb();
    const id = generateId('bcl');
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO build_checklist_items (id, project_id, stage_key, title, description, priority, requires_professional, warning_category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, stageKey, data.title, data.description ?? null, data.priority ?? 'normal', data.requiresProfessional ? 1 : 0, data.warningCategory ?? null, now]
    );
    return id;
  },

  async toggleChecklistItem(id: string, completed: boolean): Promise<void> {
    const db = await getDb();
    const completedAt = completed ? new Date().toISOString() : null;
    await db.runAsync(
      'UPDATE build_checklist_items SET completed = ?, completed_at = ? WHERE id = ?',
      [completed ? 1 : 0, completedAt, id]
    );
  },

  async getDocumentsForProject(projectId: string, stageKey?: string): Promise<DocumentRecord[]> {
    const db = await getDb();
    if (stageKey) {
      const rows = await db.getAllAsync<DocumentRow>(
        'SELECT * FROM build_documents WHERE project_id = ? AND stage_key = ? ORDER BY created_at',
        [projectId, stageKey]
      );
      return rows.map(documentFromRow);
    }
    const rows = await db.getAllAsync<DocumentRow>(
      'SELECT * FROM build_documents WHERE project_id = ? ORDER BY stage_key, created_at',
      [projectId]
    );
    return rows.map(documentFromRow);
  },

  async addDocument(projectId: string, stageKey: string, data: {
    name: string;
    description?: string;
    isRequired?: boolean;
  }): Promise<string> {
    const db = await getDb();
    const id = generateId('bdc');
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO build_documents (id, project_id, stage_key, name, description, is_required, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, stageKey, data.name, data.description ?? '', data.isRequired !== false ? 1 : 0, now]
    );
    return id;
  },

  async updateDocumentStatus(id: string, status: string): Promise<void> {
    const db = await getDb();
    const obtainedAt = status === 'obtained' ? new Date().toISOString() : null;
    await db.runAsync(
      'UPDATE build_documents SET status = ?, obtained_at = COALESCE(?, obtained_at) WHERE id = ?',
      [status, obtainedAt, id]
    );
  },

  async getUtilitiesForProject(projectId: string): Promise<UtilityRequirement[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<UtilityRow>(
      'SELECT * FROM build_utilities WHERE project_id = ? ORDER BY created_at',
      [projectId]
    );
    return rows.map(utilityFromRow);
  },

  async addUtility(projectId: string, data: {
    utilityType: UtilityType;
    providerName?: string;
  }): Promise<string> {
    const db = await getDb();
    const id = generateId('but');
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO build_utilities (id, project_id, utility_type, provider_name, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, projectId, data.utilityType, data.providerName ?? '', now]
    );
    return id;
  },

  async updateUtility(id: string, updates: { status?: UtilityStatus; providerName?: string; notes?: string }): Promise<void> {
    const db = await getDb();
    const sets: string[] = [];
    const values: (string | null)[] = [];
    if (updates.status !== undefined) { sets.push('status = ?'); values.push(updates.status); }
    if (updates.providerName !== undefined) { sets.push('provider_name = ?'); values.push(updates.providerName); }
    if (updates.notes !== undefined) { sets.push('notes = ?'); values.push(updates.notes); }
    if (sets.length === 0) return;
    values.push(id);
    await db.runAsync(`UPDATE build_utilities SET ${sets.join(', ')} WHERE id = ?`, values);
  },
};
