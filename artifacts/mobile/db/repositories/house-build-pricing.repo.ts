import type {
  HouseBuildPriceReference,
  HouseBuildPriceOverride,
  HouseBuildPriceSummary,
  PriceCategory,
  PriceSourceType,
} from '@/types/house-build';
import { getDb } from '@/db/client';
import { HOUSE_BUILD_PRICE_SEEDS, LAST_PRICE_UPDATE } from '@/features/house-build/house-build-prices';

function generateId(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

interface RefRow {
  id: string; category: string; stage_key: string | null; item_key: string;
  label: string; unit: string; price_min: number; price_max: number;
  baseline_price: number; currency: string; region_code: string; region_label: string;
  source_name: string; source_type: string; source_url: string; last_updated: string;
  notes: string; confidence_note: string; active: number; created_at: string;
}

interface OverrideRow {
  id: string; project_id: string; reference_id: string; item_key: string;
  override_min: number | null; override_max: number | null; override_baseline: number | null;
  label: string; notes: string; created_at: string; updated_at: string;
}

function refFromRow(r: RefRow): HouseBuildPriceReference {
  return {
    id: r.id, category: r.category as PriceCategory, stageKey: r.stage_key,
    itemKey: r.item_key, label: r.label, unit: r.unit,
    priceMin: r.price_min, priceMax: r.price_max, baselinePrice: r.baseline_price,
    currency: r.currency, regionCode: r.region_code, regionLabel: r.region_label,
    sourceName: r.source_name, sourceType: r.source_type as PriceSourceType,
    sourceUrl: r.source_url, lastUpdated: r.last_updated,
    notes: r.notes, confidenceNote: r.confidence_note, active: r.active === 1,
  };
}

function overrideFromRow(r: OverrideRow): HouseBuildPriceOverride {
  return {
    id: r.id, projectId: r.project_id, referenceId: r.reference_id,
    itemKey: r.item_key,
    overrideMin: r.override_min, overrideMax: r.override_max,
    overrideBaseline: r.override_baseline,
    label: r.label, notes: r.notes,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export const houseBuildPricingRepo = {
  async seedReferences(): Promise<void> {
    const db = await getDb();
    const count = await db.getFirstAsync<{ c: number }>(
      'SELECT COUNT(*) as c FROM build_price_references'
    );
    if (count && count.c > 0) return;

    for (const seed of HOUSE_BUILD_PRICE_SEEDS) {
      const id = generateId('bpr');
      await db.runAsync(
        `INSERT OR IGNORE INTO build_price_references
         (id, category, stage_key, item_key, label, unit, price_min, price_max, baseline_price,
          currency, region_code, region_label, source_name, source_type, source_url,
          last_updated, notes, confidence_note, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PLN', ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          id, seed.category, seed.stageKey, seed.itemKey, seed.label, seed.unit,
          seed.priceMin, seed.priceMax, seed.baselinePrice,
          seed.regionCode, seed.regionLabel, seed.sourceName, seed.sourceType,
          seed.sourceUrl, LAST_PRICE_UPDATE, seed.notes, seed.confidenceNote,
        ]
      );
    }
  },

  async getReferences(category?: PriceCategory): Promise<HouseBuildPriceReference[]> {
    const db = await getDb();
    if (category) {
      const rows = await db.getAllAsync<RefRow>(
        'SELECT * FROM build_price_references WHERE active = 1 AND category = ? ORDER BY item_key',
        [category]
      );
      return rows.map(refFromRow);
    }
    const rows = await db.getAllAsync<RefRow>(
      'SELECT * FROM build_price_references WHERE active = 1 ORDER BY category, item_key'
    );
    return rows.map(refFromRow);
  },

  async getReferencesByStage(stageKey: string): Promise<HouseBuildPriceReference[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<RefRow>(
      'SELECT * FROM build_price_references WHERE active = 1 AND stage_key = ? ORDER BY item_key',
      [stageKey]
    );
    return rows.map(refFromRow);
  },

  async getReferenceByItemKey(itemKey: string): Promise<HouseBuildPriceReference | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<RefRow>(
      'SELECT * FROM build_price_references WHERE item_key = ?',
      [itemKey]
    );
    return row ? refFromRow(row) : null;
  },

  async getOverrides(projectId: string): Promise<HouseBuildPriceOverride[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<OverrideRow>(
      'SELECT * FROM build_price_overrides WHERE project_id = ? ORDER BY created_at',
      [projectId]
    );
    return rows.map(overrideFromRow);
  },

  async upsertOverride(projectId: string, referenceId: string, itemKey: string, data: {
    overrideMin?: number | null;
    overrideMax?: number | null;
    overrideBaseline?: number | null;
    label?: string;
    notes?: string;
  }): Promise<string> {
    const db = await getDb();
    const existing = await db.getFirstAsync<OverrideRow>(
      'SELECT * FROM build_price_overrides WHERE project_id = ? AND reference_id = ?',
      [projectId, referenceId]
    );
    const now = new Date().toISOString();
    if (existing) {
      const sets: string[] = [];
      const values: (string | number | null)[] = [];
      if (data.overrideMin !== undefined) { sets.push('override_min = ?'); values.push(data.overrideMin); }
      if (data.overrideMax !== undefined) { sets.push('override_max = ?'); values.push(data.overrideMax); }
      if (data.overrideBaseline !== undefined) { sets.push('override_baseline = ?'); values.push(data.overrideBaseline); }
      if (data.label !== undefined) { sets.push('label = ?'); values.push(data.label); }
      if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
      sets.push('updated_at = ?'); values.push(now);
      values.push(existing.id);
      await db.runAsync(`UPDATE build_price_overrides SET ${sets.join(', ')} WHERE id = ?`, values);
      return existing.id;
    }
    const id = generateId('bpo');
    await db.runAsync(
      `INSERT INTO build_price_overrides
       (id, project_id, reference_id, item_key, override_min, override_max, override_baseline, label, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, projectId, referenceId, itemKey,
        data.overrideMin ?? null, data.overrideMax ?? null, data.overrideBaseline ?? null,
        data.label ?? '', data.notes ?? '', now, now,
      ]
    );
    return id;
  },

  async deleteOverride(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_price_overrides WHERE id = ?', [id]);
  },

  async resetOverrides(projectId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_price_overrides WHERE project_id = ?', [projectId]);
  },

  async getSummary(projectId: string): Promise<HouseBuildPriceSummary> {
    const db = await getDb();
    const refs = await db.getAllAsync<RefRow>(
      'SELECT * FROM build_price_references WHERE active = 1'
    );
    const overrides = await db.getAllAsync<OverrideRow>(
      'SELECT * FROM build_price_overrides WHERE project_id = ?',
      [projectId]
    );

    const categoryCounts: Record<string, number> = {};
    for (const r of refs) {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    }
    const hasRegional = refs.some((r) => r.region_code !== 'PL');

    return {
      totalReferences: refs.length,
      totalOverrides: overrides.length,
      categoryCounts: categoryCounts as Record<PriceCategory, number>,
      hasRegionalData: hasRegional,
      lastUpdated: LAST_PRICE_UPDATE,
    };
  },

  async deleteProjectData(projectId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_price_overrides WHERE project_id = ?', [projectId]);
  },
};
