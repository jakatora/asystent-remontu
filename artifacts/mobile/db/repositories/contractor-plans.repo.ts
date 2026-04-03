import { getDb } from '@/db/client';
import type {
  ContractorPlanDefinition,
  ContractorPlanId,
  ContractorPlanAssignment,
  AssignmentState,
  ContractorUsageCounter,
  UsageCounterKey,
  BillingEvent,
  BillingEventType,
  BillingProviderType,
  PromotionSlot,
  PromotionSlotScope,
  ContractorEntitlementSet,
} from '@/types/contractor-plans';

function uuid(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

const now = () => new Date().toISOString();

export const contractorPlansRepo = {
  async upsertPlan(plan: ContractorPlanDefinition): Promise<void> {
    const db = await getDb();
    const ts = now();
    await db.runAsync(
      `INSERT OR REPLACE INTO contractor_plans (id, name, short_description, monthly_price, yearly_price, status, display_order, notes, entitlements, highlight_features, badge, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM contractor_plans WHERE id = ?), ?), ?)`,
      [plan.id, plan.name, plan.shortDescription, plan.monthlyPricePlaceholder, plan.yearlyPricePlaceholder,
       plan.status, plan.displayOrder, plan.notes, JSON.stringify(plan.entitlements),
       JSON.stringify(plan.highlightFeatures), plan.badge ?? null, plan.color, plan.id, ts, ts]
    );
  },

  async getAllPlans(): Promise<ContractorPlanDefinition[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM contractor_plans ORDER BY display_order ASC');
    return rows.map(mapPlanRow);
  },

  async getActivePlans(): Promise<ContractorPlanDefinition[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM contractor_plans WHERE status = ? ORDER BY display_order ASC', ['active']);
    return rows.map(mapPlanRow);
  },

  async getPlanById(id: ContractorPlanId): Promise<ContractorPlanDefinition | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<any>('SELECT * FROM contractor_plans WHERE id = ?', [id]);
    return row ? mapPlanRow(row) : null;
  },

  async deactivatePlan(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE contractor_plans SET status = ?, updated_at = ? WHERE id = ?', ['inactive', now(), id]);
  },

  async getAssignment(contractorId: string): Promise<ContractorPlanAssignment | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<any>(
      `SELECT id, contractor_id as contractorId, plan_id as planId, state,
       start_date as startDate, end_date as endDate, trial_end_date as trialEndDate,
       assigned_by as assignedBy, notes, created_at as createdAt, updated_at as updatedAt
       FROM contractor_plan_assignments WHERE contractor_id = ? ORDER BY created_at DESC LIMIT 1`,
      [contractorId]
    );
    return row ?? null;
  },

  async assignPlan(assignment: Omit<ContractorPlanAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const id = uuid('pa');
    const ts = now();
    await db.runAsync(
      `INSERT INTO contractor_plan_assignments (id, contractor_id, plan_id, state, start_date, end_date, trial_end_date, assigned_by, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, assignment.contractorId, assignment.planId, assignment.state, assignment.startDate,
       assignment.endDate ?? null, assignment.trialEndDate ?? null, assignment.assignedBy,
       assignment.notes ?? null, ts, ts]
    );
    return id;
  },

  async updateAssignmentState(contractorId: string, state: AssignmentState, notes?: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE contractor_plan_assignments SET state = ?, notes = COALESCE(?, notes), updated_at = ?
       WHERE contractor_id = ? AND id = (SELECT id FROM contractor_plan_assignments WHERE contractor_id = ? ORDER BY created_at DESC LIMIT 1)`,
      [state, notes ?? null, now(), contractorId, contractorId]
    );
  },

  async getAllAssignments(): Promise<ContractorPlanAssignment[]> {
    const db = await getDb();
    return db.getAllAsync<ContractorPlanAssignment>(
      `SELECT id, contractor_id as contractorId, plan_id as planId, state,
       start_date as startDate, end_date as endDate, trial_end_date as trialEndDate,
       assigned_by as assignedBy, notes, created_at as createdAt, updated_at as updatedAt
       FROM contractor_plan_assignments ORDER BY created_at DESC`
    );
  },

  async getUsageCounters(contractorId: string): Promise<ContractorUsageCounter[]> {
    const db = await getDb();
    return db.getAllAsync<ContractorUsageCounter>(
      `SELECT id, contractor_id as contractorId, counter_key as counterKey,
       current_value as currentValue, limit_value as limitValue, updated_at as updatedAt
       FROM contractor_usage_counters WHERE contractor_id = ?`,
      [contractorId]
    );
  },

  async upsertUsageCounter(contractorId: string, key: UsageCounterKey, currentValue: number, limitValue: number): Promise<void> {
    const db = await getDb();
    const existing = await db.getFirstAsync<any>(
      'SELECT id FROM contractor_usage_counters WHERE contractor_id = ? AND counter_key = ?',
      [contractorId, key]
    );
    if (existing) {
      await db.runAsync(
        'UPDATE contractor_usage_counters SET current_value = ?, limit_value = ?, updated_at = ? WHERE id = ?',
        [currentValue, limitValue, now(), existing.id]
      );
    } else {
      await db.runAsync(
        'INSERT INTO contractor_usage_counters (id, contractor_id, counter_key, current_value, limit_value, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [uuid('uc'), contractorId, key, currentValue, limitValue, now()]
      );
    }
  },

  async addBillingEvent(event: Omit<BillingEvent, 'id' | 'createdAt'>): Promise<string> {
    const db = await getDb();
    const id = uuid('be');
    await db.runAsync(
      `INSERT INTO contractor_billing_events (id, contractor_id, event_type, plan_id, provider_type, amount, currency, notes, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, event.contractorId, event.eventType, event.planId, event.providerType,
       event.amount ?? null, event.currency ?? null, event.notes ?? null, event.metadata ?? null, now()]
    );
    return id;
  },

  async getBillingEvents(contractorId: string): Promise<BillingEvent[]> {
    const db = await getDb();
    return db.getAllAsync<BillingEvent>(
      `SELECT id, contractor_id as contractorId, event_type as eventType,
       plan_id as planId, provider_type as providerType, amount, currency,
       notes, metadata, created_at as createdAt
       FROM contractor_billing_events WHERE contractor_id = ? ORDER BY created_at DESC`,
      [contractorId]
    );
  },

  async getAllBillingEvents(): Promise<BillingEvent[]> {
    const db = await getDb();
    return db.getAllAsync<BillingEvent>(
      `SELECT id, contractor_id as contractorId, event_type as eventType,
       plan_id as planId, provider_type as providerType, amount, currency,
       notes, metadata, created_at as createdAt
       FROM contractor_billing_events ORDER BY created_at DESC`
    );
  },

  async upsertPromotionSlot(slot: Omit<PromotionSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const ts = now();
    const existing = await db.getFirstAsync<any>(
      'SELECT id FROM contractor_promotion_slots WHERE contractor_id = ? AND scope = ? AND COALESCE(scope_value, \'\') = COALESCE(?, \'\')',
      [slot.contractorId, slot.scope, slot.scopeValue ?? null]
    );
    if (existing) {
      await db.runAsync(
        `UPDATE contractor_promotion_slots SET label = ?, priority = ?, is_active = ?, start_date = ?, end_date = ?, plan_id = ?, updated_at = ? WHERE id = ?`,
        [slot.label, slot.priority, slot.isActive ? 1 : 0, slot.startDate, slot.endDate ?? null, slot.planId ?? null, ts, existing.id]
      );
      return existing.id;
    }
    const id = uuid('ps');
    await db.runAsync(
      `INSERT INTO contractor_promotion_slots (id, contractor_id, scope, scope_value, label, priority, is_active, start_date, end_date, plan_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, slot.contractorId, slot.scope, slot.scopeValue ?? null, slot.label,
       slot.priority, slot.isActive ? 1 : 0, slot.startDate, slot.endDate ?? null,
       slot.planId ?? null, ts, ts]
    );
    return id;
  },

  async getPromotionSlots(contractorId: string): Promise<PromotionSlot[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(
      `SELECT id, contractor_id as contractorId, scope, scope_value as scopeValue,
       label, priority, is_active as isActive, start_date as startDate, end_date as endDate,
       plan_id as planId, created_at as createdAt, updated_at as updatedAt
       FROM contractor_promotion_slots WHERE contractor_id = ? ORDER BY priority DESC`,
      [contractorId]
    );
    return rows.map((r: any) => ({ ...r, isActive: !!r.isActive }));
  },

  async getActivePromotionSlots(): Promise<PromotionSlot[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(
      `SELECT id, contractor_id as contractorId, scope, scope_value as scopeValue,
       label, priority, is_active as isActive, start_date as startDate, end_date as endDate,
       plan_id as planId, created_at as createdAt, updated_at as updatedAt
       FROM contractor_promotion_slots WHERE is_active = 1 ORDER BY priority DESC`
    );
    return rows.map((r: any) => ({ ...r, isActive: !!r.isActive }));
  },

  async deactivatePromotionSlot(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE contractor_promotion_slots SET is_active = 0, updated_at = ? WHERE id = ?', [now(), id]);
  },

  async getActiveSlotsByScope(scope: PromotionSlotScope, scopeValue?: string): Promise<PromotionSlot[]> {
    const db = await getDb();
    let query = `SELECT id, contractor_id as contractorId, scope, scope_value as scopeValue,
       label, priority, is_active as isActive, start_date as startDate, end_date as endDate,
       plan_id as planId, created_at as createdAt, updated_at as updatedAt
       FROM contractor_promotion_slots WHERE is_active = 1 AND scope = ?`;
    const params: any[] = [scope];
    if (scopeValue) {
      query += ' AND scope_value = ?';
      params.push(scopeValue);
    }
    query += ' ORDER BY priority DESC';
    const rows = await db.getAllAsync<any>(query, params);
    return rows.map((r: any) => ({ ...r, isActive: !!r.isActive }));
  },

  async deletePromotionSlotsByContractor(contractorId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM contractor_promotion_slots WHERE contractor_id = ?', [contractorId]);
  },
};

function mapPlanRow(row: any): ContractorPlanDefinition {
  return {
    id: row.id,
    name: row.name,
    shortDescription: row.short_description,
    monthlyPricePlaceholder: row.monthly_price,
    yearlyPricePlaceholder: row.yearly_price,
    status: row.status,
    displayOrder: row.display_order,
    notes: row.notes,
    entitlements: JSON.parse(row.entitlements || '{}'),
    highlightFeatures: JSON.parse(row.highlight_features || '[]'),
    badge: row.badge ?? undefined,
    color: row.color,
  };
}
