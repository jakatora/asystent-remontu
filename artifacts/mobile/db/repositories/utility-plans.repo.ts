import type {
  UtilityType,
  UtilityConnectionPlan,
  UtilityConnectionStatus,
  GasPurpose,
  UtilityChecklistItem,
  UtilityAlternative,
  UtilityReadinessSummary,
  InvestorDocStatus,
} from '@/types/house-build';
import { getDb } from '@/db/client';

function generateId(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

interface PlanRow {
  id: string; project_id: string; utility_type: string; status: string;
  provider_name: string; connection_power: string; gas_purpose: string;
  temporary_supply: number; alternative_needed: number;
  application_date: string | null; conditions_date: string | null; connection_date: string | null;
  notes: string; created_at: string; updated_at: string;
}

interface ChecklistRow {
  id: string; project_id: string; utility_type: string; item_key: string;
  title: string; completed: number; notes: string; sort_order: number; created_at: string;
}

interface AlternativeRow {
  id: string; project_id: string; utility_type: string; title: string;
  description: string; status: string; notes: string; created_at: string;
}

function planFromRow(r: PlanRow): UtilityConnectionPlan {
  return {
    id: r.id, projectId: r.project_id, utilityType: r.utility_type as UtilityType,
    status: r.status as UtilityConnectionStatus, providerName: r.provider_name,
    connectionPower: r.connection_power, gasPurpose: r.gas_purpose as GasPurpose,
    temporarySupply: r.temporary_supply === 1, alternativeNeeded: r.alternative_needed === 1,
    applicationDate: r.application_date, conditionsDate: r.conditions_date,
    connectionDate: r.connection_date, notes: r.notes,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function checklistFromRow(r: ChecklistRow): UtilityChecklistItem {
  return {
    id: r.id, projectId: r.project_id, utilityType: r.utility_type as UtilityType,
    itemKey: r.item_key, title: r.title, completed: r.completed === 1,
    notes: r.notes, sortOrder: r.sort_order, createdAt: r.created_at,
  };
}

function altFromRow(r: AlternativeRow): UtilityAlternative {
  return {
    id: r.id, projectId: r.project_id, utilityType: r.utility_type as UtilityType,
    title: r.title, description: r.description, status: r.status as InvestorDocStatus,
    notes: r.notes, createdAt: r.created_at,
  };
}

export const utilityPlansRepo = {
  async getPlans(projectId: string): Promise<UtilityConnectionPlan[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<PlanRow>(
      'SELECT * FROM build_utility_plans WHERE project_id = ? ORDER BY created_at',
      [projectId]
    );
    return rows.map(planFromRow);
  },

  async getPlan(projectId: string, utilityType: UtilityType): Promise<UtilityConnectionPlan | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<PlanRow>(
      'SELECT * FROM build_utility_plans WHERE project_id = ? AND utility_type = ?',
      [projectId, utilityType]
    );
    return row ? planFromRow(row) : null;
  },

  async upsertPlan(projectId: string, utilityType: UtilityType, data: {
    status?: UtilityConnectionStatus; providerName?: string; connectionPower?: string;
    gasPurpose?: GasPurpose; temporarySupply?: boolean; alternativeNeeded?: boolean;
    applicationDate?: string | null; conditionsDate?: string | null;
    connectionDate?: string | null; notes?: string;
  }): Promise<string> {
    const db = await getDb();
    const existing = await db.getFirstAsync<PlanRow>(
      'SELECT * FROM build_utility_plans WHERE project_id = ? AND utility_type = ?',
      [projectId, utilityType]
    );
    const now = new Date().toISOString();
    if (existing) {
      const sets: string[] = [];
      const values: (string | number | null)[] = [];
      if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
      if (data.providerName !== undefined) { sets.push('provider_name = ?'); values.push(data.providerName); }
      if (data.connectionPower !== undefined) { sets.push('connection_power = ?'); values.push(data.connectionPower); }
      if (data.gasPurpose !== undefined) { sets.push('gas_purpose = ?'); values.push(data.gasPurpose); }
      if (data.temporarySupply !== undefined) { sets.push('temporary_supply = ?'); values.push(data.temporarySupply ? 1 : 0); }
      if (data.alternativeNeeded !== undefined) { sets.push('alternative_needed = ?'); values.push(data.alternativeNeeded ? 1 : 0); }
      if (data.applicationDate !== undefined) { sets.push('application_date = ?'); values.push(data.applicationDate); }
      if (data.conditionsDate !== undefined) { sets.push('conditions_date = ?'); values.push(data.conditionsDate); }
      if (data.connectionDate !== undefined) { sets.push('connection_date = ?'); values.push(data.connectionDate); }
      if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
      sets.push('updated_at = ?'); values.push(now);
      values.push(existing.id);
      await db.runAsync(`UPDATE build_utility_plans SET ${sets.join(', ')} WHERE id = ?`, values);
      return existing.id;
    }
    const id = generateId('bup');
    await db.runAsync(
      `INSERT INTO build_utility_plans (id, project_id, utility_type, status, provider_name, connection_power, gas_purpose, temporary_supply, alternative_needed, application_date, conditions_date, connection_date, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, utilityType, data.status ?? 'not-planned', data.providerName ?? '', data.connectionPower ?? '', data.gasPurpose ?? 'not-planned', data.temporarySupply ? 1 : 0, data.alternativeNeeded ? 1 : 0, data.applicationDate ?? null, data.conditionsDate ?? null, data.connectionDate ?? null, data.notes ?? '', now, now]
    );
    return id;
  },

  async getChecklist(projectId: string, utilityType?: UtilityType): Promise<UtilityChecklistItem[]> {
    const db = await getDb();
    if (utilityType) {
      const rows = await db.getAllAsync<ChecklistRow>(
        'SELECT * FROM build_utility_checklist WHERE project_id = ? AND utility_type = ? ORDER BY sort_order',
        [projectId, utilityType]
      );
      return rows.map(checklistFromRow);
    }
    const rows = await db.getAllAsync<ChecklistRow>(
      'SELECT * FROM build_utility_checklist WHERE project_id = ? ORDER BY utility_type, sort_order',
      [projectId]
    );
    return rows.map(checklistFromRow);
  },

  async upsertChecklistItem(projectId: string, utilityType: UtilityType, itemKey: string, data: {
    title?: string; completed?: boolean; notes?: string; sortOrder?: number;
  }): Promise<string> {
    const db = await getDb();
    const existing = await db.getFirstAsync<ChecklistRow>(
      'SELECT * FROM build_utility_checklist WHERE project_id = ? AND utility_type = ? AND item_key = ?',
      [projectId, utilityType, itemKey]
    );
    if (existing) {
      const sets: string[] = [];
      const values: (string | number | null)[] = [];
      if (data.title !== undefined) { sets.push('title = ?'); values.push(data.title); }
      if (data.completed !== undefined) { sets.push('completed = ?'); values.push(data.completed ? 1 : 0); }
      if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
      if (data.sortOrder !== undefined) { sets.push('sort_order = ?'); values.push(data.sortOrder); }
      if (sets.length === 0) return existing.id;
      values.push(existing.id);
      await db.runAsync(`UPDATE build_utility_checklist SET ${sets.join(', ')} WHERE id = ?`, values);
      return existing.id;
    }
    const id = generateId('buc');
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO build_utility_checklist (id, project_id, utility_type, item_key, title, completed, notes, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, utilityType, itemKey, data.title ?? itemKey, data.completed ? 1 : 0, data.notes ?? '', data.sortOrder ?? 0, now]
    );
    return id;
  },

  async getAlternatives(projectId: string, utilityType?: UtilityType): Promise<UtilityAlternative[]> {
    const db = await getDb();
    if (utilityType) {
      const rows = await db.getAllAsync<AlternativeRow>(
        'SELECT * FROM build_utility_alternatives WHERE project_id = ? AND utility_type = ? ORDER BY created_at',
        [projectId, utilityType]
      );
      return rows.map(altFromRow);
    }
    const rows = await db.getAllAsync<AlternativeRow>(
      'SELECT * FROM build_utility_alternatives WHERE project_id = ? ORDER BY utility_type, created_at',
      [projectId]
    );
    return rows.map(altFromRow);
  },

  async addAlternative(projectId: string, data: {
    utilityType: UtilityType; title: string; description?: string;
  }): Promise<string> {
    const db = await getDb();
    const id = generateId('bua');
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO build_utility_alternatives (id, project_id, utility_type, title, description, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, 'missing', '', ?)`,
      [id, projectId, data.utilityType, data.title, data.description ?? '', now]
    );
    return id;
  },

  async updateAlternative(id: string, data: { status?: InvestorDocStatus; notes?: string }): Promise<void> {
    const db = await getDb();
    const sets: string[] = [];
    const values: (string | null)[] = [];
    if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
    if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
    if (sets.length === 0) return;
    values.push(id);
    await db.runAsync(`UPDATE build_utility_alternatives SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async deleteAlternative(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_utility_alternatives WHERE id = ?', [id]);
  },

  async getReadinessSummary(projectId: string): Promise<UtilityReadinessSummary> {
    const db = await getDb();
    const plans = await db.getAllAsync<PlanRow>(
      'SELECT * FROM build_utility_plans WHERE project_id = ?',
      [projectId]
    );
    const checklist = await db.getAllAsync<ChecklistRow>(
      'SELECT * FROM build_utility_checklist WHERE project_id = ?',
      [projectId]
    );
    const alternatives = await db.getAllAsync<AlternativeRow>(
      'SELECT * FROM build_utility_alternatives WHERE project_id = ? AND status != ?',
      [projectId, 'approved']
    );

    const getStatus = (type: string): UtilityConnectionStatus => {
      const p = plans.find((r) => r.utility_type === type);
      return (p?.status as UtilityConnectionStatus) ?? 'not-planned';
    };

    const planned = plans.filter((p) => p.status !== 'not-applicable');
    const connected = plans.filter((p) => p.status === 'connected' || p.status === 'not-applicable');
    const blockedItems = checklist.filter((c) => c.completed === 0).length;

    return {
      electricityStatus: getStatus('electricity'),
      waterStatus: getStatus('water'),
      sewerStatus: getStatus('sewage'),
      gasStatus: getStatus('gas'),
      internetStatus: getStatus('telecom'),
      totalPlanned: planned.length,
      totalConnected: connected.length,
      blockedItems,
      unresolvedDecisions: alternatives.length,
    };
  },

  async deleteProjectData(projectId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_utility_plans WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_utility_checklist WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_utility_alternatives WHERE project_id = ?', [projectId]);
  },
};
