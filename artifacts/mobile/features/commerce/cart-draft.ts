import type {
  CartDraft,
  CartDraftLine,
  CartDraftSummary,
  CartDraftStatus,
  ToolCartPreference,
  MappingStatus,
  ToolCartConfig,
  ProductMapping,
} from '@/types/commerce';
import type { QualityTier } from '@/types/pricing';
import type { ShoppingItem, RenovationJob } from '@/types/domain';
import { generateId } from '@/shared/lib/id';
import { nowISO } from '@/shared/lib/date';
import { roundMoney } from '@/shared/lib/currency';

export interface CartDraftInput {
  projectId: string;
  shoppingItems: readonly ShoppingItem[];
  job: RenovationJob;
  qualityTier: QualityTier;
  toolPreference: ToolCartPreference;
  toolConfigs?: readonly ToolCartConfig[];
  mappings?: readonly ProductMapping[];
  currency?: string;
}

export function buildCartDraft(input: CartDraftInput): CartDraft {
  const { projectId, shoppingItems, job, qualityTier, toolPreference, toolConfigs, mappings, currency } = input;
  const now = nowISO();
  const mappingIndex = new Map<string, ProductMapping>(
    (mappings ?? []).map((m) => [m.internalId, m])
  );

  const materialItems = shoppingItems.filter((i) => i.itemType === 'material' && !i.owned);
  const toolItems = shoppingItems.filter((i) => i.itemType === 'tool' && !i.owned);

  const materialLines = materialItems.map((item) => buildLine(item, 'material', mappingIndex));

  const toolConfigMap = new Map<string, ToolCartConfig>(
    (toolConfigs ?? []).map((tc) => [tc.toolId, tc])
  );

  const toolLines: CartDraftLine[] = [];
  if (toolPreference !== 'materials_only') {
    for (const item of toolItems) {
      const config = toolConfigMap.get(item.materialId);
      if (config && !config.addToCart) continue;
      if (config && config.owned) continue;

      const isRequired = job.tools.some((t) => t.id === item.materialId && t.required);
      const isOptional = job.tools.some((t) => t.id === item.materialId && !t.required);

      if (toolPreference === 'materials_and_required_tools' && !isRequired) continue;

      const line = buildLine(item, 'tool', mappingIndex);
      toolLines.push(line);
    }
  }

  const allLines = [...materialLines, ...toolLines];
  const summary = computeSummary(allLines, currency ?? 'PLN');

  return {
    id: generateId('cdraft'),
    projectId,
    status: 'draft',
    lines: allLines,
    toolPreference,
    qualityTier,
    summary,
    createdAt: now,
    updatedAt: now,
  };
}

function buildLine(
  item: ShoppingItem,
  sourceType: 'material' | 'tool',
  mappingIndex: Map<string, ProductMapping>
): CartDraftLine {
  const mapping = mappingIndex.get(item.materialId) ?? null;
  const mappingStatus: MappingStatus = mapping && mapping.activeForCommerce ? 'mapped' : 'unmapped';

  const effectivePrice = item.customPrice ?? item.estimatedPrice;
  const effectiveQty = item.customQuantity ?? item.quantity;

  return {
    lineId: generateId('cl'),
    internalId: item.materialId,
    internalName: item.name,
    sourceType,
    mappingStatus,
    mapping: mapping ?? undefined,
    calculatedQuantity: item.quantity,
    userOverrideQuantity: item.customQuantity ?? undefined,
    effectiveQuantity: effectiveQty,
    packageSize: mapping?.packageSize,
    packageUnit: mapping?.packageUnit ?? item.unit,
    unitPrice: effectivePrice,
    lineTotal: roundMoney(effectivePrice * effectiveQty),
    tier: item.tier,
    notes: item.notes ?? undefined,
    included: true,
  };
}

function computeSummary(lines: readonly CartDraftLine[], currency: string): CartDraftSummary {
  const included = lines.filter((l) => l.included);
  const mapped = included.filter((l) => l.mappingStatus === 'mapped');
  const unmapped = included.filter((l) => l.mappingStatus !== 'mapped');
  const materials = included.filter((l) => l.sourceType === 'material');
  const tools = included.filter((l) => l.sourceType === 'tool');
  const addOns = included.filter((l) => l.sourceType === 'add_on' || l.sourceType === 'bundle_item');
  const subtotal = roundMoney(included.reduce((s, l) => s + l.lineTotal, 0));

  return {
    totalLines: included.length,
    mappedLines: mapped.length,
    unmappedLines: unmapped.length,
    materialLines: materials.length,
    toolLines: tools.length,
    addOnLines: addOns.length,
    estimatedSubtotal: subtotal,
    currency,
    toolsIncluded: tools.length > 0,
  };
}

export function updateCartDraftLineQuantity(
  draft: CartDraft,
  lineId: string,
  newQuantity: number
): CartDraft {
  const now = nowISO();
  const lines = draft.lines.map((l) => {
    if (l.lineId !== lineId) return l;
    const qty = Math.max(0, newQuantity);
    return {
      ...l,
      userOverrideQuantity: qty,
      effectiveQuantity: qty,
      lineTotal: roundMoney(l.unitPrice * qty),
    };
  });
  return { ...draft, lines, summary: computeSummary(lines, draft.summary.currency), updatedAt: now };
}

export function toggleCartDraftLine(
  draft: CartDraft,
  lineId: string,
  included: boolean
): CartDraft {
  const now = nowISO();
  const lines = draft.lines.map((l) => {
    if (l.lineId !== lineId) return l;
    return { ...l, included };
  });
  return { ...draft, lines, summary: computeSummary(lines, draft.summary.currency), updatedAt: now };
}

export function buildToolConfigs(job: RenovationJob, ownedToolIds: readonly string[]): ToolCartConfig[] {
  const ownedSet = new Set(ownedToolIds);
  return job.tools.map((t) => ({
    toolId: t.id,
    toolName: t.name,
    required: t.required,
    owned: ownedSet.has(t.id),
    addToCart: t.required && !ownedSet.has(t.id),
    recommendedAddOn: !t.required && !ownedSet.has(t.id),
  }));
}
