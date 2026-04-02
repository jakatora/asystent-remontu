import { getDb } from '@/db/client';
import type { ContractorReview, ContractorReviewSummary, ReviewModerationStatus } from '@/types/contractor';

function uuid(): string {
  return 'rv-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

const now = () => new Date().toISOString();

const REVIEW_SELECT = `SELECT id, contractor_id as contractorId, rating, title, comment,
  author_name as authorName, reviewer_type as reviewerType, request_id as requestId,
  moderation_status as moderationStatus, is_visible as isVisible,
  is_flagged as isFlagged, flag_reason as flagReason,
  created_at as createdAt, updated_at as updatedAt
  FROM contractor_reviews`;

export const contractorReviewsRepo = {
  async getByContractor(contractorId: string, visibleOnly = true): Promise<ContractorReview[]> {
    const db = await getDb();
    const where = visibleOnly
      ? ' WHERE contractor_id = ? AND is_visible = 1 ORDER BY created_at DESC'
      : ' WHERE contractor_id = ? ORDER BY created_at DESC';
    const rows = await db.getAllAsync<any>(REVIEW_SELECT + where, [contractorId]);
    return rows.map((r: any) => ({ ...r, isVisible: !!r.isVisible, isFlagged: !!r.isFlagged }));
  },

  async getById(id: string): Promise<ContractorReview | null> {
    const db = await getDb();
    const r = await db.getFirstAsync<any>(REVIEW_SELECT + ' WHERE id = ?', [id]);
    if (!r) return null;
    return { ...r, isVisible: !!r.isVisible, isFlagged: !!r.isFlagged };
  },

  async create(review: Omit<ContractorReview, 'id' | 'createdAt' | 'updatedAt' | 'moderationStatus' | 'isVisible' | 'isFlagged'>): Promise<string> {
    const db = await getDb();
    const id = uuid();
    const ts = now();
    await db.runAsync(
      `INSERT INTO contractor_reviews (id, contractor_id, rating, title, comment, author_name, reviewer_type, request_id, moderation_status, is_visible, is_flagged, flag_reason, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1, 0, NULL, ?, ?)`,
      [id, review.contractorId, review.rating, review.title ?? null, review.comment ?? null,
       review.authorName ?? null, review.reviewerType, review.requestId ?? null, ts, ts]
    );
    return id;
  },

  async updateModerationStatus(id: string, status: ReviewModerationStatus): Promise<void> {
    const db = await getDb();
    const visible = status === 'approved' || status === 'pending' ? 1 : 0;
    await db.runAsync(
      'UPDATE contractor_reviews SET moderation_status = ?, is_visible = ?, updated_at = ? WHERE id = ?',
      [status, visible, now(), id]
    );
  },

  async flagReview(id: string, reason: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE contractor_reviews SET is_flagged = 1, flag_reason = ?, moderation_status = ?, updated_at = ? WHERE id = ?',
      [reason, 'flagged', now(), id]
    );
  },

  async getSummary(contractorId: string): Promise<ContractorReviewSummary> {
    const db = await getDb();
    const all = await this.getByContractor(contractorId, false);
    const visible = all.filter((r) => r.isVisible);
    const verified = visible.filter((r) => r.reviewerType === 'verified-request' || r.reviewerType === 'verified-job');

    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    for (const r of visible) {
      const bucket = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      distribution[bucket]++;
      ratingSum += r.rating;
    }

    return {
      contractorId,
      averageRating: visible.length > 0 ? Math.round((ratingSum / visible.length) * 10) / 10 : 0,
      totalCount: visible.length,
      verifiedCount: verified.length,
      distribution,
      recentReviews: visible.slice(0, 5),
      hiddenCount: all.filter((r) => !r.isVisible).length,
      flaggedCount: all.filter((r) => r.isFlagged).length,
    };
  },

  async getByModerationStatus(status: ReviewModerationStatus): Promise<ContractorReview[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(REVIEW_SELECT + ' WHERE moderation_status = ? ORDER BY created_at DESC', [status]);
    return rows.map((r: any) => ({ ...r, isVisible: !!r.isVisible, isFlagged: !!r.isFlagged }));
  },

  async getFlagged(): Promise<ContractorReview[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(REVIEW_SELECT + ' WHERE is_flagged = 1 ORDER BY created_at DESC');
    return rows.map((r: any) => ({ ...r, isVisible: !!r.isVisible, isFlagged: !!r.isFlagged }));
  },

  async deleteByContractor(contractorId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM contractor_reviews WHERE contractor_id = ?', [contractorId]);
  },
};
