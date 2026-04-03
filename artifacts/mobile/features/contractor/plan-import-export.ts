import type {
  ContractorPlanDefinition,
  ContractorPlanAssignment,
  PromotionSlot,
  PlanImportExportData,
  ImportValidationResult,
  ContractorPlanId,
} from '@/types/contractor-plans';
import { contractorPlansRepo } from '@/db/repositories/contractor-plans.repo';

const VALID_PLAN_IDS: ContractorPlanId[] = ['free', 'starter', 'pro', 'featured', 'enterprise'];

export function exportPlansToJSON(
  plans: ContractorPlanDefinition[],
  promotionSlots: PromotionSlot[],
  assignments: ContractorPlanAssignment[],
): string {
  const data: PlanImportExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    plans,
    promotionSlots,
    assignments,
  };
  return JSON.stringify(data, null, 2);
}

export function validateImportData(jsonString: string): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const duplicates: string[] = [];

  let data: PlanImportExportData;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return { isValid: false, errors: ['Nieprawidlowy format JSON.'], warnings: [], planCount: 0, slotCount: 0, assignmentCount: 0, duplicates: [] };
  }

  if (!data.version) errors.push('Brak pola version.');
  if (!data.plans || !Array.isArray(data.plans)) errors.push('Brak lub nieprawidlowe pole plans.');
  if (!data.promotionSlots || !Array.isArray(data.promotionSlots)) warnings.push('Brak pola promotionSlots - zostanie pominiete.');
  if (!data.assignments || !Array.isArray(data.assignments)) warnings.push('Brak pola assignments - zostanie pominiete.');

  const plans = data.plans ?? [];
  const slots = data.promotionSlots ?? [];
  const assignments = data.assignments ?? [];

  const seenPlanIds = new Set<string>();
  for (const p of plans) {
    if (!p.id) { errors.push('Plan bez id.'); continue; }
    if (!VALID_PLAN_IDS.includes(p.id as ContractorPlanId)) errors.push(`Plan ${p.id} nie jest standardowym planem (dozwolone: ${VALID_PLAN_IDS.join(', ')}).`);
    if (seenPlanIds.has(p.id)) duplicates.push(`Plan: ${p.id}`);
    seenPlanIds.add(p.id);
    if (!p.name) errors.push(`Plan ${p.id}: brak nazwy.`);
    if (!p.entitlements) errors.push(`Plan ${p.id}: brak entitlements.`);
  }

  for (const s of slots) {
    if (!s.contractorId) errors.push('Slot bez contractorId.');
    if (!s.scope) errors.push('Slot bez scope.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    planCount: plans.length,
    slotCount: slots.length,
    assignmentCount: assignments.length,
    duplicates,
  };
}

export async function applyImportData(jsonString: string): Promise<{ applied: boolean; summary: string }> {
  const validation = validateImportData(jsonString);
  if (!validation.isValid) {
    return { applied: false, summary: `Blad walidacji: ${validation.errors.join('; ')}` };
  }

  const data: PlanImportExportData = JSON.parse(jsonString);
  let plansImported = 0;
  let slotsImported = 0;
  let assignmentsImported = 0;

  for (const plan of data.plans) {
    await contractorPlansRepo.upsertPlan(plan);
    plansImported++;
  }

  for (const slot of (data.promotionSlots ?? [])) {
    await contractorPlansRepo.upsertPromotionSlot({
      contractorId: slot.contractorId,
      scope: slot.scope,
      scopeValue: slot.scopeValue,
      label: slot.label,
      priority: slot.priority,
      isActive: slot.isActive,
      startDate: slot.startDate,
      endDate: slot.endDate,
      planId: slot.planId,
    });
    slotsImported++;
  }

  for (const assignment of (data.assignments ?? [])) {
    await contractorPlansRepo.assignPlan({
      contractorId: assignment.contractorId,
      planId: assignment.planId,
      state: assignment.state,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      trialEndDate: assignment.trialEndDate,
      assignedBy: assignment.assignedBy,
      notes: assignment.notes,
    });
    assignmentsImported++;
  }

  return {
    applied: true,
    summary: `Zaimportowano: ${plansImported} planow, ${slotsImported} slotow, ${assignmentsImported} przypisah.`,
  };
}

export async function exportCurrentData(): Promise<string> {
  const plans = await contractorPlansRepo.getAllPlans();
  const slots = await contractorPlansRepo.getActivePromotionSlots();
  const assignments = await contractorPlansRepo.getAllAssignments();
  return exportPlansToJSON(plans, slots, assignments);
}
