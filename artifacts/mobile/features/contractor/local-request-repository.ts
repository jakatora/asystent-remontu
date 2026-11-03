import type {
  ContractorRequest,
  RequestStatus,
  BudgetRange,
  OfferMode,
} from '../../types/contractor';
import type { DatabaseConnection } from '../../db/connection';
import { assertLocalRequestStatus, localRequestDraft } from './local-requests';

function generateId(): string {
  return (
    'req-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 8)
  );
}

interface RequestRow {
  id: string;
  category_id: string | null;
  category_name: string | null;
  job_id: string | null;
  job_name: string | null;
  room_description: string | null;
  work_description: string;
  city: string;
  postal_code: string | null;
  preferred_date: string | null;
  budget_range: string;
  offer_mode: string;
  photo_refs: string | null;
  notes: string | null;
  selected_contractor_ids: string | null;
  status: string;
  estimated_match_count: number | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
}

function fromRow(row: RequestRow): ContractorRequest {
  return {
    id: row.id,
    categoryId: row.category_id ?? undefined,
    categoryName: row.category_name ?? undefined,
    jobId: row.job_id ?? undefined,
    jobName: row.job_name ?? undefined,
    roomDescription: row.room_description ?? undefined,
    workDescription: row.work_description,
    city: row.city,
    postalCode: row.postal_code ?? undefined,
    preferredDate: row.preferred_date ?? undefined,
    budgetRange: row.budget_range as BudgetRange,
    offerMode: row.offer_mode as OfferMode,
    photoRefs: row.photo_refs ? JSON.parse(row.photo_refs) : undefined,
    notes: row.notes ?? undefined,
    selectedContractorIds: row.selected_contractor_ids
      ? JSON.parse(row.selected_contractor_ids)
      : [],
    status: row.status as RequestStatus,
    estimatedMatchCount: row.estimated_match_count ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sentAt: row.sent_at ?? undefined,
  };
}

export function createLocalContractorRequestsRepository(
  getDb: () => Promise<DatabaseConnection>,
) {
  return {
    async findAll(): Promise<ContractorRequest[]> {
      const db = await getDb();
      const rows = await db.getAllAsync<RequestRow>(
        'SELECT * FROM contractor_requests ORDER BY updated_at DESC',
      );
      return rows.map(fromRow);
    },

    async findByStatus(status: RequestStatus): Promise<ContractorRequest[]> {
      const db = await getDb();
      const rows = await db.getAllAsync<RequestRow>(
        'SELECT * FROM contractor_requests WHERE status = ? ORDER BY updated_at DESC',
        [status],
      );
      return rows.map(fromRow);
    },

    async findById(id: string): Promise<ContractorRequest | undefined> {
      const db = await getDb();
      const row = await db.getFirstAsync<RequestRow>(
        'SELECT * FROM contractor_requests WHERE id = ?',
        [id],
      );
      return row ? fromRow(row) : undefined;
    },

    async upsert(
      request: Omit<ContractorRequest, 'id' | 'createdAt' | 'updatedAt'> & {
        id?: string;
      },
    ): Promise<string> {
      request = localRequestDraft(request);
      const db = await getDb();
      const id = request.id ?? generateId();
      const now = new Date().toISOString();

      // source: https://www.sqlite.org/lang_upsert.html
      // Preserve creation time and references when the user edits a local draft.
      await db.runAsync(
        `INSERT INTO contractor_requests
       (id, category_id, category_name, job_id, job_name, room_description,
        work_description, city, postal_code, preferred_date, budget_range,
        offer_mode, photo_refs, notes, selected_contractor_ids, status,
        estimated_match_count, created_at, updated_at, sent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
       category_id=excluded.category_id, category_name=excluded.category_name,
       job_id=excluded.job_id, job_name=excluded.job_name, room_description=excluded.room_description,
       work_description=excluded.work_description, city=excluded.city, postal_code=excluded.postal_code,
       preferred_date=excluded.preferred_date, budget_range=excluded.budget_range, offer_mode=excluded.offer_mode,
       photo_refs=excluded.photo_refs, notes=excluded.notes, selected_contractor_ids=excluded.selected_contractor_ids,
       status=excluded.status, estimated_match_count=excluded.estimated_match_count,
       updated_at=excluded.updated_at, sent_at=excluded.sent_at`,
        [
          id,
          request.categoryId ?? null,
          request.categoryName ?? null,
          request.jobId ?? null,
          request.jobName ?? null,
          request.roomDescription ?? null,
          request.workDescription,
          request.city,
          request.postalCode ?? null,
          request.preferredDate ?? null,
          request.budgetRange,
          request.offerMode,
          request.photoRefs ? JSON.stringify(request.photoRefs) : null,
          request.notes ?? null,
          JSON.stringify(request.selectedContractorIds ?? []),
          request.status,
          request.estimatedMatchCount ?? null,
          now,
          now,
          request.sentAt ?? null,
        ],
      );
      return id;
    },

    async updateStatus(id: string, status: RequestStatus): Promise<void> {
      assertLocalRequestStatus(status);
      const db = await getDb();
      const now = new Date().toISOString();
      await db.runAsync(
        'UPDATE contractor_requests SET status = ?, updated_at = ?, sent_at = NULL WHERE id = ?',
        [status, now, id],
      );
    },

    async remove(id: string): Promise<void> {
      const db = await getDb();
      await db.runAsync('DELETE FROM contractor_requests WHERE id = ?', [id]);
    },
  };
}
