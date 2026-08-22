// Testy cyklicznego schedulera Price Collectora. Deterministyczne: zegar,
// setInterval, budowa źródeł i runner są wstrzykiwane — bez Postgresa i bez sieci.
import assert from "node:assert/strict";
import test from "node:test";

import type { Database } from "@workspace/db/repositories";
import type { CollectionResult, PriceSource } from "@workspace/price-collector";

import {
  resolveSchedulerConfigFromEnv,
  startPriceCollectorScheduler,
  type SchedulerLogger,
} from "../src/scheduler";

const dummyDb = {} as Database;

function fakeResult(source: string, over: Partial<CollectionResult> = {}): CollectionResult {
  return {
    source,
    offersProcessed: 2,
    productsCreated: 1,
    productsMatched: 1,
    offersUpserted: 2,
    errors: [],
    ...over,
  };
}

function fakeSource(slug: string): PriceSource {
  return {
    slug,
    displayName: slug,
    fetchProducts: async () => [],
    fetchOffers: async () => [],
  };
}

const silentLogger: SchedulerLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

/** Fałszywy setInterval: zwraca uchwyt, a `fire()` odpala zarejestrowany callback. */
function makeFakeInterval() {
  let cb: (() => void) | null = null;
  let cleared = false;
  return {
    setIntervalFn: (callback: () => void) => {
      cb = callback;
      return { unref: () => {} };
    },
    clearIntervalFn: () => {
      cleared = true;
    },
    fire: () => cb?.(),
    get cleared() {
      return cleared;
    },
  };
}

test("resolveSchedulerConfigFromEnv: wyłączony bez COLLECT_INTERVAL_MS", () => {
  assert.deepEqual(resolveSchedulerConfigFromEnv({}), {
    enabled: false,
    intervalMs: 0,
    runOnStart: false,
  });
  assert.equal(resolveSchedulerConfigFromEnv({ COLLECT_INTERVAL_MS: "0" }).enabled, false);
  assert.equal(resolveSchedulerConfigFromEnv({ COLLECT_INTERVAL_MS: "abc" }).enabled, false);
  assert.equal(resolveSchedulerConfigFromEnv({ COLLECT_INTERVAL_MS: "-5" }).enabled, false);
});

test("resolveSchedulerConfigFromEnv: włączony z dodatnim interwałem i runOnStart", () => {
  const cfg = resolveSchedulerConfigFromEnv({
    COLLECT_INTERVAL_MS: "3600000",
    COLLECT_RUN_ON_START: "true",
  });
  assert.deepEqual(cfg, { enabled: true, intervalMs: 3_600_000, runOnStart: true });
});

test("startPriceCollectorScheduler: przebieg sumuje totals i ustawia znaczniki czasu", async () => {
  const fake = makeFakeInterval();
  const now = 1_000;
  const handle = startPriceCollectorScheduler({
    db: dummyDb,
    intervalMs: 10_000,
    logger: silentLogger,
    now: () => now,
    resolveSlugs: () => ({ slugs: ["leroy-merlin", "mrowka"], unknown: [] }),
    buildSources: async (slugs) => slugs.map(fakeSource),
    runCollection: async (sources) => sources.map((s) => fakeResult(s.slug)),
    setIntervalFn: fake.setIntervalFn,
    clearIntervalFn: fake.clearIntervalFn,
  });

  await handle.triggerNow();

  const status = handle.getStatus();
  assert.equal(status.enabled, true);
  assert.equal(status.running, false);
  assert.ok(status.runs >= 1);
  assert.equal(status.lastError, null);
  assert.deepEqual(status.lastTotals, {
    offersProcessed: 4,
    offersUpserted: 4,
    productsCreated: 2,
    productsMatched: 2,
    errors: 0,
  });
  assert.equal(status.lastRunAt, new Date(1_000).toISOString());
  assert.equal(status.nextRunAt, new Date(1_000 + 10_000).toISOString());

  handle.stop();
  assert.equal(fake.cleared, true);
  assert.equal(handle.getStatus().nextRunAt, null, "stop() zeruje nextRunAt");
});

test("startPriceCollectorScheduler: runOnStart odpala pierwszy przebieg bez tyknięcia timera", async () => {
  const fake = makeFakeInterval();
  let done!: () => void;
  const ran = new Promise<void>((r) => {
    done = r;
  });
  let calls = 0;

  const handle = startPriceCollectorScheduler({
    db: dummyDb,
    intervalMs: 10_000,
    runOnStart: true,
    logger: silentLogger,
    now: () => 0,
    resolveSlugs: () => ({ slugs: ["leroy-merlin"], unknown: [] }),
    buildSources: async (slugs) => slugs.map(fakeSource),
    runCollection: async (sources) => {
      calls += 1;
      done();
      return sources.map((s) => fakeResult(s.slug));
    },
    setIntervalFn: fake.setIntervalFn,
    clearIntervalFn: fake.clearIntervalFn,
  });

  // NIE wołamy fake.fire() — runOnStart musi sam odpalić przebieg.
  await ran;
  assert.equal(calls, 1);
  handle.stop();
});

test("startPriceCollectorScheduler: tyknięcie timera odpala przebieg", async () => {
  const fake = makeFakeInterval();
  let done!: () => void;
  const ran = new Promise<void>((r) => {
    done = r;
  });
  let calls = 0;
  const handle = startPriceCollectorScheduler({
    db: dummyDb,
    intervalMs: 10_000,
    logger: silentLogger,
    now: () => 0,
    resolveSlugs: () => ({ slugs: ["leroy-merlin"], unknown: [] }),
    buildSources: async (slugs) => slugs.map(fakeSource),
    runCollection: async (sources) => {
      calls += 1;
      done();
      return sources.map((s) => fakeResult(s.slug));
    },
    setIntervalFn: fake.setIntervalFn,
    clearIntervalFn: fake.clearIntervalFn,
  });

  fake.fire(); // symuluje tyknięcie timera
  await ran;
  assert.equal(calls, 1);
  handle.stop();
});

test("startPriceCollectorScheduler: nakładkowy lock pomija zazębiające się przebiegi", async () => {
  const fake = makeFakeInterval();
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });

  const handle = startPriceCollectorScheduler({
    db: dummyDb,
    intervalMs: 10_000,
    logger: silentLogger,
    now: () => 0,
    resolveSlugs: () => ({ slugs: ["leroy-merlin"], unknown: [] }),
    buildSources: async (slugs) => slugs.map(fakeSource),
    runCollection: async (sources) => {
      calls += 1;
      await gate; // pierwszy przebieg wisi, aż go zwolnimy
      return sources.map((s) => fakeResult(s.slug));
    },
    setIntervalFn: fake.setIntervalFn,
    clearIntervalFn: fake.clearIntervalFn,
  });

  const first = handle.triggerNow(); // startuje i blokuje się na gate
  await handle.triggerNow(); // powinien zostać POMINIĘTY (lock aktywny)
  assert.equal(calls, 1, "drugie tyknięcie nie może wejść, gdy pierwsze trwa");

  release();
  await first;
  assert.equal(handle.getStatus().running, false);

  handle.stop();
});

test("startPriceCollectorScheduler: błąd runnera trafia do lastError, lock zwolniony", async () => {
  const fake = makeFakeInterval();
  const handle = startPriceCollectorScheduler({
    db: dummyDb,
    intervalMs: 10_000,
    logger: silentLogger,
    now: () => 0,
    resolveSlugs: () => ({ slugs: ["leroy-merlin"], unknown: [] }),
    buildSources: async (slugs) => slugs.map(fakeSource),
    runCollection: async () => {
      throw new Error("bum feed");
    },
    setIntervalFn: fake.setIntervalFn,
    clearIntervalFn: fake.clearIntervalFn,
  });

  await handle.triggerNow();
  const status = handle.getStatus();
  assert.equal(status.lastError, "bum feed");
  assert.equal(status.running, false);
  assert.equal(status.runs, 1);

  handle.stop();
});

test("startPriceCollectorScheduler: brak źródeł => lastError bez wywołania runnera", async () => {
  const fake = makeFakeInterval();
  let ran = false;
  const handle = startPriceCollectorScheduler({
    db: dummyDb,
    intervalMs: 10_000,
    logger: silentLogger,
    now: () => 0,
    resolveSlugs: () => ({ slugs: [], unknown: ["nieznany"] }),
    buildSources: async () => {
      ran = true;
      return [];
    },
    runCollection: async () => {
      ran = true;
      return [];
    },
    setIntervalFn: fake.setIntervalFn,
    clearIntervalFn: fake.clearIntervalFn,
  });

  await handle.triggerNow();
  assert.equal(ran, false);
  assert.match(handle.getStatus().lastError ?? "", /brak znanych źródeł/);

  handle.stop();
});

test("startPriceCollectorScheduler: rzuca gdy intervalMs <= 0", () => {
  assert.throws(
    () =>
      startPriceCollectorScheduler({
        db: dummyDb,
        intervalMs: 0,
        logger: silentLogger,
      }),
    /intervalMs/,
  );
});
