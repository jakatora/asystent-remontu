import { getDb } from '@/db/client';
import type {
  AdminContentItem,
  AdminSourceRegistryEntry,
  AdminTrustDisclaimer,
  AdminContentSnapshot,
  AdminContentDashboardStats,
  AdminContentHealthIssue,
  AdminContentType,
} from '@/types/house-build';
import {
  getAllContentSeeds,
  SOURCE_SEEDS,
  DISCLAIMER_SEEDS,
  OUTDATED_RULES,
} from '@/features/house-build/content-admin-seeds';

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const now = () => new Date().toISOString();

const CONTENT_SELECT = `SELECT id, content_type as contentType, content_key as contentKey, title, summary, body,
  stage_id as stageId, category, target_role as targetRole, severity,
  source_id as sourceId, source_text as sourceText, active,
  last_reviewed as lastReviewed, last_updated as lastUpdated,
  created_at as createdAt, notes FROM hb_admin_content_items`;

const SOURCE_SELECT = `SELECT id, source_name as sourceName, source_type as sourceType,
  source_url as sourceUrl, region_relevance as regionRelevance,
  reliability_level as reliabilityLevel, notes, last_checked as lastChecked,
  active, created_at as createdAt FROM hb_admin_source_registry`;

const DISCLAIMER_SELECT = `SELECT id, disclaimer_key as disclaimerKey, text, category,
  active, last_updated as lastUpdated, created_at as createdAt FROM hb_admin_trust_disclaimers`;

const SNAPSHOT_SELECT = `SELECT id, label, notes, created_at as createdAt,
  stage_count as stageCount, formal_count as formalCount, utilities_count as utilitiesCount,
  decision_count as decisionCount, question_count as questionCount, warning_count as warningCount,
  active FROM hb_admin_content_snapshots`;

export const houseBuildContentAdminRepo = {
  async seedContent(): Promise<void> {
    const db = await getDb();
    const count = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM hb_admin_content_items');
    if (count && count.c > 0) return;

    const seeds = getAllContentSeeds();
    const ts = now();
    for (const s of seeds) {
      await db.runAsync(
        `INSERT OR IGNORE INTO hb_admin_content_items
         (id, content_type, content_key, title, summary, body, stage_id, category, target_role, severity, source_id, source_text, active, last_reviewed, last_updated, created_at, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, 1, ?, ?, ?, '')`,
        [uuid(), s.contentType, s.contentKey, s.title, s.summary, s.body, s.stageId, s.category, s.targetRole, s.severity, s.sourceText, ts, ts, ts]
      );
    }
  },

  async seedSources(): Promise<void> {
    const db = await getDb();
    const count = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM hb_admin_source_registry');
    if (count && count.c > 0) return;

    const ts = now();
    for (const s of SOURCE_SEEDS) {
      await db.runAsync(
        `INSERT OR IGNORE INTO hb_admin_source_registry
         (id, source_name, source_type, source_url, region_relevance, reliability_level, notes, last_checked, active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [s.id, s.sourceName, s.sourceType, s.sourceUrl, s.regionRelevance, s.reliabilityLevel, s.notes, ts, ts]
      );
    }
  },

  async seedDisclaimers(): Promise<void> {
    const db = await getDb();
    const count = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM hb_admin_trust_disclaimers');
    if (count && count.c > 0) return;

    const ts = now();
    for (const s of DISCLAIMER_SEEDS) {
      await db.runAsync(
        `INSERT OR IGNORE INTO hb_admin_trust_disclaimers
         (id, disclaimer_key, text, category, active, last_updated, created_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)`,
        [uuid(), s.disclaimerKey, s.text, s.category, ts, ts]
      );
    }
  },

  async seedAll(): Promise<void> {
    await this.seedContent();
    await this.seedSources();
    await this.seedDisclaimers();
  },

  async getContentItems(contentType?: AdminContentType, activeOnly?: boolean): Promise<AdminContentItem[]> {
    const db = await getDb();
    let query = CONTENT_SELECT + ' WHERE 1=1';
    const params: (string | number)[] = [];
    if (contentType) { query += ' AND content_type = ?'; params.push(contentType); }
    if (activeOnly) { query += ' AND active = 1'; }
    query += ' ORDER BY content_type, title';
    return db.getAllAsync<AdminContentItem>(query, params);
  },

  async getContentItemsByStage(stageId: string): Promise<AdminContentItem[]> {
    const db = await getDb();
    return db.getAllAsync<AdminContentItem>(
      CONTENT_SELECT + ` WHERE stage_id LIKE ? AND active = 1 ORDER BY content_type, title`,
      [`%${stageId}%`]
    );
  },

  async getContentItem(id: string): Promise<AdminContentItem | null> {
    const db = await getDb();
    return db.getFirstAsync<AdminContentItem>(CONTENT_SELECT + ' WHERE id = ?', [id]);
  },

  async upsertContentItem(item: Omit<AdminContentItem, 'id' | 'createdAt'> & { id?: string }): Promise<void> {
    const db = await getDb();
    const ts = now();
    const id = item.id || uuid();
    await db.runAsync(
      `INSERT INTO hb_admin_content_items
       (id, content_type, content_key, title, summary, body, stage_id, category, target_role, severity, source_id, source_text, active, last_reviewed, last_updated, created_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(content_type, content_key) DO UPDATE SET
         title = excluded.title, summary = excluded.summary, body = excluded.body,
         stage_id = excluded.stage_id, category = excluded.category, target_role = excluded.target_role,
         severity = excluded.severity, source_id = excluded.source_id, source_text = excluded.source_text,
         active = excluded.active, last_reviewed = excluded.last_reviewed, last_updated = excluded.last_updated,
         notes = excluded.notes`,
      [id, item.contentType, item.contentKey, item.title, item.summary, item.body, item.stageId, item.category, item.targetRole, item.severity, item.sourceId, item.sourceText, item.active, item.lastReviewed, ts, ts, item.notes]
    );
  },

  async deleteContentItem(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM hb_admin_content_items WHERE id = ?', [id]);
  },

  async toggleContentActive(id: string, active: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE hb_admin_content_items SET active = ?, last_updated = ? WHERE id = ?', [active ? 1 : 0, now(), id]);
  },

  async searchContent(query: string): Promise<AdminContentItem[]> {
    const db = await getDb();
    const pattern = `%${query}%`;
    return db.getAllAsync<AdminContentItem>(
      CONTENT_SELECT + ` WHERE title LIKE ? OR summary LIKE ? OR body LIKE ? OR notes LIKE ? ORDER BY content_type, title`,
      [pattern, pattern, pattern, pattern]
    );
  },

  async getSources(activeOnly?: boolean): Promise<AdminSourceRegistryEntry[]> {
    const db = await getDb();
    const query = activeOnly
      ? SOURCE_SELECT + ' WHERE active = 1 ORDER BY source_name'
      : SOURCE_SELECT + ' ORDER BY source_name';
    return db.getAllAsync<AdminSourceRegistryEntry>(query);
  },

  async upsertSource(item: Omit<AdminSourceRegistryEntry, 'createdAt'> & { createdAt?: string }): Promise<void> {
    const db = await getDb();
    const ts = now();
    await db.runAsync(
      `INSERT INTO hb_admin_source_registry (id, source_name, source_type, source_url, region_relevance, reliability_level, notes, last_checked, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         source_name = excluded.source_name, source_type = excluded.source_type, source_url = excluded.source_url,
         region_relevance = excluded.region_relevance, reliability_level = excluded.reliability_level,
         notes = excluded.notes, last_checked = excluded.last_checked, active = excluded.active`,
      [item.id, item.sourceName, item.sourceType, item.sourceUrl, item.regionRelevance, item.reliabilityLevel, item.notes, item.lastChecked, item.active, ts]
    );
  },

  async deleteSource(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM hb_admin_source_registry WHERE id = ?', [id]);
  },

  async getDisclaimers(activeOnly?: boolean): Promise<AdminTrustDisclaimer[]> {
    const db = await getDb();
    const query = activeOnly
      ? DISCLAIMER_SELECT + ' WHERE active = 1 ORDER BY category, disclaimer_key'
      : DISCLAIMER_SELECT + ' ORDER BY category, disclaimer_key';
    return db.getAllAsync<AdminTrustDisclaimer>(query);
  },

  async upsertDisclaimer(item: Omit<AdminTrustDisclaimer, 'createdAt'> & { createdAt?: string }): Promise<void> {
    const db = await getDb();
    const ts = now();
    await db.runAsync(
      `INSERT INTO hb_admin_trust_disclaimers (id, disclaimer_key, text, category, active, last_updated, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(disclaimer_key) DO UPDATE SET
         text = excluded.text, category = excluded.category, active = excluded.active, last_updated = excluded.last_updated`,
      [item.id, item.disclaimerKey, item.text, item.category, item.active, ts, ts]
    );
  },

  async deleteDisclaimer(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM hb_admin_trust_disclaimers WHERE id = ?', [id]);
  },

  async createSnapshot(label: string, notes: string): Promise<string> {
    const db = await getDb();
    const id = uuid();
    const ts = now();

    const items = await db.getAllAsync<AdminContentItem>(CONTENT_SELECT);
    const sources = await db.getAllAsync<AdminSourceRegistryEntry>(SOURCE_SELECT);
    const disclaimers = await db.getAllAsync<AdminTrustDisclaimer>(DISCLAIMER_SELECT);

    const data = JSON.stringify({ items, sources, disclaimers });

    const stageCt = items.filter((i: AdminContentItem) => i.contentType === 'stage-description').length;
    const formalCt = items.filter((i: AdminContentItem) => i.contentType === 'formal-guidance').length;
    const utilitiesCt = items.filter((i: AdminContentItem) => i.contentType === 'utility-guidance').length;
    const decisionCt = items.filter((i: AdminContentItem) => i.contentType === 'decision-template').length;
    const questionCt = items.filter((i: AdminContentItem) => i.contentType === 'question-template').length;
    const warningCt = items.filter((i: AdminContentItem) => i.contentType === 'warning-note').length;

    await db.runAsync(
      `INSERT INTO hb_admin_content_snapshots
       (id, label, notes, created_at, snapshot_data, stage_count, formal_count, utilities_count, decision_count, question_count, warning_count, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, label, notes, ts, data, stageCt, formalCt, utilitiesCt, decisionCt, questionCt, warningCt]
    );

    return id;
  },

  async getSnapshots(): Promise<AdminContentSnapshot[]> {
    const db = await getDb();
    return db.getAllAsync<AdminContentSnapshot>(SNAPSHOT_SELECT + ' ORDER BY created_at DESC');
  },

  async getSnapshotData(id: string): Promise<{ items: AdminContentItem[]; sources: AdminSourceRegistryEntry[]; disclaimers: AdminTrustDisclaimer[] } | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ snapshot_data: string }>('SELECT snapshot_data FROM hb_admin_content_snapshots WHERE id = ?', [id]);
    if (!row) return null;
    try { return JSON.parse(row.snapshot_data); } catch { return null; }
  },

  async restoreSnapshot(id: string): Promise<void> {
    const data = await this.getSnapshotData(id);
    if (!data) throw new Error('Snapshot nie znaleziony lub uszkodzony.');
    if (!Array.isArray(data.items) || !Array.isArray(data.sources) || !Array.isArray(data.disclaimers)) {
      throw new Error('Nieprawidlowa struktura danych snapshota.');
    }
    const db = await getDb();

    await db.execAsync('BEGIN TRANSACTION');
    try {
      await db.runAsync('DELETE FROM hb_admin_content_items');
      await db.runAsync('DELETE FROM hb_admin_source_registry');
      await db.runAsync('DELETE FROM hb_admin_trust_disclaimers');

      for (const item of data.items) {
        await db.runAsync(
          `INSERT OR IGNORE INTO hb_admin_content_items
           (id, content_type, content_key, title, summary, body, stage_id, category, target_role, severity, source_id, source_text, active, last_reviewed, last_updated, created_at, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [item.id, item.contentType, item.contentKey, item.title, item.summary, item.body, item.stageId, item.category, item.targetRole, item.severity, item.sourceId, item.sourceText, item.active, item.lastReviewed, item.lastUpdated, item.createdAt, item.notes]
        );
      }
      for (const s of data.sources) {
        await db.runAsync(
          `INSERT OR IGNORE INTO hb_admin_source_registry (id, source_name, source_type, source_url, region_relevance, reliability_level, notes, last_checked, active, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.id, s.sourceName, s.sourceType, s.sourceUrl, s.regionRelevance, s.reliabilityLevel, s.notes, s.lastChecked, s.active, s.createdAt]
        );
      }
      for (const d of data.disclaimers) {
        await db.runAsync(
          `INSERT OR IGNORE INTO hb_admin_trust_disclaimers (id, disclaimer_key, text, category, active, last_updated, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [d.id, d.disclaimerKey, d.text, d.category, d.active, d.lastUpdated, d.createdAt]
        );
      }

      await db.runAsync('UPDATE hb_admin_content_snapshots SET active = 0');
      await db.runAsync('UPDATE hb_admin_content_snapshots SET active = 1 WHERE id = ?', [id]);

      await db.execAsync('COMMIT');
    } catch (err) {
      await db.execAsync('ROLLBACK');
      throw err;
    }
  },

  async deleteSnapshot(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM hb_admin_content_snapshots WHERE id = ?', [id]);
  },

  async getDashboardStats(): Promise<AdminContentDashboardStats> {
    const db = await getDb();

    const total = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM hb_admin_content_items');
    const checklists = await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) as c FROM hb_admin_content_items WHERE content_type = 'checklist-group'`);
    const warnings = await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) as c FROM hb_admin_content_items WHERE content_type = 'warning-note'`);
    const decisions = await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) as c FROM hb_admin_content_items WHERE content_type = 'decision-template'`);
    const questions = await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) as c FROM hb_admin_content_items WHERE content_type = 'question-template'`);
    const sources = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM hb_admin_source_registry');
    const newest = await db.getFirstAsync<{ d: string }>('SELECT MAX(last_updated) as d FROM hb_admin_content_items');
    const oldest = await db.getFirstAsync<{ d: string }>('SELECT MIN(last_updated) as d FROM hb_admin_content_items');
    const missingSrc = await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) as c FROM hb_admin_content_items WHERE source_text = '' AND source_id = ''`);
    const missingReview = await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) as c FROM hb_admin_content_items WHERE last_reviewed = ''`);
    const inactive = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM hb_admin_content_items WHERE active = 0');

    const cutoff = new Date(Date.now() - OUTDATED_RULES.outdatedDays * 24 * 60 * 60 * 1000).toISOString();
    const outdated = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM hb_admin_content_items WHERE last_updated < ? AND last_updated != ""', [cutoff]);

    return {
      totalContentRecords: total?.c ?? 0,
      totalChecklistGroups: checklists?.c ?? 0,
      totalWarningNotes: warnings?.c ?? 0,
      totalDecisionTemplates: decisions?.c ?? 0,
      totalQuestionTemplates: questions?.c ?? 0,
      totalSourceRecords: sources?.c ?? 0,
      newestUpdate: newest?.d ?? '',
      oldestUpdate: oldest?.d ?? '',
      missingSourceMetadata: missingSrc?.c ?? 0,
      missingLastReviewed: missingReview?.c ?? 0,
      inactiveRecords: inactive?.c ?? 0,
      outdatedRecords: outdated?.c ?? 0,
    };
  },

  async getHealthIssues(): Promise<AdminContentHealthIssue[]> {
    const db = await getDb();
    const issues: AdminContentHealthIssue[] = [];

    const stagesMissingSummary = await db.getAllAsync<AdminContentItem>(
      CONTENT_SELECT + ` WHERE content_type = 'stage-description' AND (summary = '' OR body = '')`
    );
    for (const s of stagesMissingSummary) {
      issues.push({ type: 'missing-summary', severity: 'warning', message: `Etap "${s.title}" bez opisu lub podsumowania.`, contentKey: s.contentKey, contentType: s.contentType });
    }

    const warningsMissingSrc = await db.getAllAsync<AdminContentItem>(
      CONTENT_SELECT + ` WHERE content_type = 'warning-note' AND source_text = '' AND source_id = ''`
    );
    for (const w of warningsMissingSrc) {
      issues.push({ type: 'missing-source', severity: 'warning', message: `Ostrzezenie "${w.title}" bez metadanych zrodla.`, contentKey: w.contentKey, contentType: w.contentType });
    }

    const decisionsNoStage = await db.getAllAsync<AdminContentItem>(
      CONTENT_SELECT + ` WHERE content_type = 'decision-template' AND stage_id = ''`
    );
    for (const d of decisionsNoStage) {
      issues.push({ type: 'no-stage-link', severity: 'info', message: `Decyzja "${d.title}" bez przypisanego etapu.`, contentKey: d.contentKey, contentType: d.contentType });
    }

    const questionsNoRole = await db.getAllAsync<AdminContentItem>(
      CONTENT_SELECT + ` WHERE content_type = 'question-template' AND target_role = ''`
    );
    for (const q of questionsNoRole) {
      issues.push({ type: 'no-target-role', severity: 'warning', message: `Pytanie "${q.title}" bez roli docelowej.`, contentKey: q.contentKey, contentType: q.contentType });
    }

    const formalMissingSrc = await db.getAllAsync<AdminContentItem>(
      CONTENT_SELECT + ` WHERE content_type = 'formal-guidance' AND source_text = '' AND source_id = ''`
    );
    for (const f of formalMissingSrc) {
      issues.push({ type: 'missing-source', severity: 'error', message: `Wytyczne formalne "${f.title}" bez zrodla.`, contentKey: f.contentKey, contentType: f.contentType });
    }

    const cutoff = new Date(Date.now() - OUTDATED_RULES.outdatedDays * 24 * 60 * 60 * 1000).toISOString();
    const outdated = await db.getAllAsync<AdminContentItem>(
      CONTENT_SELECT + ` WHERE last_updated < ? AND last_updated != ''`,
      [cutoff]
    );
    for (const o of outdated) {
      issues.push({ type: 'outdated', severity: 'warning', message: `"${o.title}" nie aktualizowane ponad ${OUTDATED_RULES.outdatedDays} dni.`, contentKey: o.contentKey, contentType: o.contentType });
    }

    return issues;
  },

  async exportAllContent(): Promise<string> {
    const db = await getDb();
    const items = await db.getAllAsync<AdminContentItem>(CONTENT_SELECT);
    const sources = await db.getAllAsync<AdminSourceRegistryEntry>(SOURCE_SELECT);
    const disclaimers = await db.getAllAsync<AdminTrustDisclaimer>(DISCLAIMER_SELECT);
    return JSON.stringify({ items, sources, disclaimers, exportedAt: now() }, null, 2);
  },

  async importContent(jsonData: string): Promise<{ created: number; updated: number; skipped: number; errors: string[] }> {
    const result = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };
    let parsed: { items?: unknown[]; sources?: unknown[]; disclaimers?: unknown[] };
    try {
      parsed = JSON.parse(jsonData);
    } catch {
      result.errors.push('Nieprawidlowy format JSON.');
      return result;
    }

    const db = await getDb();

    if (Array.isArray(parsed.items)) {
      for (const raw of parsed.items) {
        const item = raw as Record<string, unknown>;
        if (!item.contentType || !item.contentKey || !item.title) {
          result.errors.push(`Brak wymaganych pol w rekordzie: ${JSON.stringify(item).slice(0, 80)}`);
          result.skipped++;
          continue;
        }
        const existing = await db.getFirstAsync<{ id: string }>(
          'SELECT id FROM hb_admin_content_items WHERE content_type = ? AND content_key = ?',
          [item.contentType as string, item.contentKey as string]
        );
        const ts = now();
        if (existing) {
          await db.runAsync(
            `UPDATE hb_admin_content_items SET title = ?, summary = ?, body = ?, stage_id = ?, category = ?, target_role = ?, severity = ?, source_text = ?, last_updated = ?, notes = ? WHERE id = ?`,
            [item.title as string, (item.summary as string) ?? '', (item.body as string) ?? '', (item.stageId as string) ?? '', (item.category as string) ?? '', (item.targetRole as string) ?? '', (item.severity as string) ?? '', (item.sourceText as string) ?? '', ts, (item.notes as string) ?? '', existing.id]
          );
          result.updated++;
        } else {
          await db.runAsync(
            `INSERT INTO hb_admin_content_items (id, content_type, content_key, title, summary, body, stage_id, category, target_role, severity, source_id, source_text, active, last_reviewed, last_updated, created_at, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, 1, ?, ?, ?, ?)`,
            [uuid(), item.contentType as string, item.contentKey as string, item.title as string, (item.summary as string) ?? '', (item.body as string) ?? '', (item.stageId as string) ?? '', (item.category as string) ?? '', (item.targetRole as string) ?? '', (item.severity as string) ?? '', (item.sourceText as string) ?? '', ts, ts, ts, (item.notes as string) ?? '']
          );
          result.created++;
        }
      }
    }

    if (Array.isArray(parsed.sources)) {
      for (const raw of parsed.sources) {
        const src = raw as Record<string, unknown>;
        if (!src.id || !src.sourceName) {
          result.errors.push(`Brak wymaganych pol w zrodle: ${JSON.stringify(src).slice(0, 80)}`);
          result.skipped++;
          continue;
        }
        const ts = now();
        await db.runAsync(
          `INSERT INTO hb_admin_source_registry (id, source_name, source_type, source_url, region_relevance, reliability_level, notes, last_checked, active, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             source_name = excluded.source_name, source_type = excluded.source_type, source_url = excluded.source_url,
             region_relevance = excluded.region_relevance, reliability_level = excluded.reliability_level,
             notes = excluded.notes, last_checked = excluded.last_checked, active = excluded.active`,
          [src.id as string, src.sourceName as string, (src.sourceType as string) ?? '', (src.sourceUrl as string) ?? '', (src.regionRelevance as string) ?? '', (src.reliabilityLevel as string) ?? '', (src.notes as string) ?? '', ts, (src.active as number) ?? 1, ts]
        );
        result.updated++;
      }
    }

    if (Array.isArray(parsed.disclaimers)) {
      for (const raw of parsed.disclaimers) {
        const disc = raw as Record<string, unknown>;
        if (!disc.disclaimerKey || !disc.text) {
          result.errors.push(`Brak wymaganych pol w disclaimerze: ${JSON.stringify(disc).slice(0, 80)}`);
          result.skipped++;
          continue;
        }
        const ts = now();
        await db.runAsync(
          `INSERT INTO hb_admin_trust_disclaimers (id, disclaimer_key, text, category, active, last_updated, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(disclaimer_key) DO UPDATE SET
             text = excluded.text, category = excluded.category, active = excluded.active, last_updated = excluded.last_updated`,
          [disc.id as string || uuid(), disc.disclaimerKey as string, disc.text as string, (disc.category as string) ?? '', (disc.active as number) ?? 1, ts, ts]
        );
        result.updated++;
      }
    }

    return result;
  },

  async deleteAllContent(): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM hb_admin_content_items');
    await db.runAsync('DELETE FROM hb_admin_source_registry');
    await db.runAsync('DELETE FROM hb_admin_trust_disclaimers');
    await db.runAsync('DELETE FROM hb_admin_content_snapshots');
  },
};
