import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { migration_005 } from '../../db/migrations/005_contractor';
import { queuedDatabase } from '../../db/connection';
import { createLocalContractorRequestsRepository } from './local-request-repository';
import {
  assertLocalRequestStatus,
  contractorRequestText,
  isLocalContractorRoute,
  localRequestDraft,
  type LocalRequestInput,
} from './local-requests';
import type { RequestStatus } from '../../types/contractor';

const input: LocalRequestInput = {
  workDescription: 'Malowanie pokoju i zabezpieczenie mebli',
  city: 'Kraków',
  postalCode: '30-001',
  budgetRange: 'any',
  offerMode: 'multiple',
  selectedContractorIds: ['c-001'],
  notes: 'Proszę o własną wycenę',
  photoRefs: ['file:///private/local-photo.jpg'],
  status: 'sent',
  sentAt: '2026-11-02T10:00:00Z',
  estimatedMatchCount: 13,
};

async function fixture(t: TestContext) {
  const sqlite = new DatabaseSync(':memory:');
  t.after(() => sqlite.close());
  const raw = {
    execAsync: async (sql: string) => {
      sqlite.exec(sql);
    },
    runAsync: async (sql: string, params: any[] = []) => {
      const result = sqlite.prepare(sql).run(...params);
      return {
        changes: Number(result.changes),
        lastInsertRowId: Number(result.lastInsertRowid),
      };
    },
    getAllAsync: async (sql: string, params: any[] = []) =>
      sqlite.prepare(sql).all(...params),
    getFirstAsync: async (sql: string, params: any[] = []) =>
      sqlite.prepare(sql).get(...params) ?? null,
  };
  await migration_005(raw as any);
  return {
    sqlite,
    repo: createLocalContractorRequestsRepository(async () =>
      queuedDatabase(raw as any, () => {}),
    ),
  };
}

test('deep links cannot expose directory samples, registration, billing or administration', () => {
  for (const route of [
    '/contractor',
    '/contractor/',
    '/contractor/my-requests',
    '/contractor/send-request',
    '/contractor/unavailable',
  ])
    assert.equal(isLocalContractorRoute(route), true, route);
  for (const route of [
    '/contractor/results',
    '/contractor/c-001',
    '/contractor/register',
    '/contractor/plans',
    '/contractor/admin-plans',
    '/contractor/admin-board',
    '/contractor/my-requests/admin',
  ])
    assert.equal(isLocalContractorRoute(route), false, route);
});

test('local write cannot manufacture delivery, while preserving the user text and photo references', () => {
  const draft = localRequestDraft(input);
  assert.equal(draft.status, 'draft');
  assert.equal(draft.sentAt, undefined);
  assert.equal(draft.estimatedMatchCount, undefined);
  assert.equal(draft.notes, input.notes);
  assert.deepEqual(draft.photoRefs, input.photoRefs);
  assert.equal(input.status, 'sent');
  assert.equal(input.sentAt, '2026-11-02T10:00:00Z');
  for (const status of [
    'sent',
    'viewed',
    'replied',
    'accepted',
    'declined',
    'expired',
  ] as RequestStatus[])
    assert.throws(
      () => assertLocalRequestStatus(status),
      /contractor_delivery_unavailable/,
    );
  assert.doesNotThrow(() => assertLocalRequestStatus('draft'));
});

test('real SQLite stores a draft even if an old caller asks to mark it sent', async (t) => {
  const { repo } = await fixture(t),
    id = await repo.upsert(input),
    row = await repo.findById(id);
  assert.equal(row?.status, 'draft');
  assert.equal(row?.sentAt, undefined);
  assert.equal((await repo.findByStatus('sent')).length, 0);
  assert.equal((await repo.findByStatus('draft')).length, 1);
  assert.deepEqual(row?.photoRefs, input.photoRefs);
  assert.equal(row?.workDescription, input.workDescription);
});

test('editing keeps the same SQLite row, original creation time and photos; old records survive a read', async (t) => {
  const { repo, sqlite } = await fixture(t),
    id = await repo.upsert(input);
  sqlite
    .prepare(
      'UPDATE contractor_requests SET status=?,sent_at=?,created_at=? WHERE id=?',
    )
    .run('sent', input.sentAt!, '2026-10-24T08:00:00Z', id);
  const historical = (await repo.findAll())[0];
  assert.equal(historical.status, 'sent');
  assert.equal(historical.sentAt, input.sentAt);
  assert.equal(
    (
      sqlite
        .prepare('SELECT status FROM contractor_requests WHERE id=?')
        .get(id) as any
    ).status,
    'sent',
  );
  assert.equal(
    await repo.upsert({
      ...historical,
      notes: 'Dopisane po ponownym otwarciu',
    }),
    id,
  );
  const restored = await repo.findById(id);
  assert.equal((await repo.findAll()).length, 1);
  assert.equal(restored?.createdAt, historical.createdAt);
  assert.equal(restored?.status, 'draft');
  assert.equal(restored?.sentAt, undefined);
  assert.equal(restored?.notes, 'Dopisane po ponownym otwarciu');
  assert.deepEqual(restored?.photoRefs, input.photoRefs);
});

test('status update rejects false delivery without changing a persisted record', async (t) => {
  const { repo } = await fixture(t),
    id = await repo.upsert(input);
  await assert.rejects(
    repo.updateStatus(id, 'sent'),
    /contractor_delivery_unavailable/,
  );
  assert.equal((await repo.findById(id))?.status, 'draft');
});

test('sharing includes the scope and optional fields in PL/EN without internal IDs, fake status or local photo URIs', () => {
  for (const language of ['pl', 'en'] as const) {
    const text = contractorRequestText(
      { ...input, roomDescription: 'Pokój 12 m²', preferredDate: '2026-11-15' },
      language,
    );
    for (const value of [
      input.workDescription,
      input.city,
      input.notes!,
      input.postalCode!,
      '2026-11-15',
      'Pokój 12 m²',
    ])
      assert.ok(text.includes(value));
    for (const value of [
      'c-001',
      'file:///',
      'undefined',
      'Zapytanie wysłane',
      'Request sent',
    ])
      assert.ok(!text.includes(value));
    assert.ok(text.includes(language === 'pl' ? 'Miejscowość' : 'Location'));
  }
});
