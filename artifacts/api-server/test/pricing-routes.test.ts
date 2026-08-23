// Test integracyjny endpointów wyceny: żywy serwer Express + realny fetch HTTP.
// DAO wstrzykiwane (fakeDeps), więc pieniądze przepływają przez cały łańcuch
// routing -> pricing-service -> serializacja BEZ Postgresa. Health testujemy z
// atrapą `db.execute` (obecność/brak tabel).
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";

import express, { type Express } from "express";

import type { Database } from "@workspace/db/repositories";

import { createPricingRouter } from "../src/routes/pricing";
import {
  EXPECTED_CHEAPEST,
  EXPECTED_HISTORY_STATS,
  EXPECTED_PAINT_STAGE_GROSZE,
  emptyJob,
  fakeDeps,
  fakeHistoryDeps,
  paintJob,
} from "./fixtures";

const dummyDb = {} as Database;

function makeApp(getDb: () => Database): Express {
  const app = express();
  app.use(express.json());
  app.use(
    "/api",
    createPricingRouter({ getDb, deps: fakeDeps, historyDeps: fakeHistoryDeps }),
  );
  return app;
}

/** Startuje app na losowym porcie i zwraca bazowy URL + funkcję zamykającą. */
async function listen(app: Express): Promise<{ url: string; close: () => Promise<void> }> {
  return await new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

test("POST /api/pricing/stage zwraca sumę etapu, najtańszą ofertę i opakowania", async () => {
  const { url, close } = await listen(makeApp(() => dummyDb));
  try {
    const resp = await fetch(`${url}/api/pricing/stage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ job: paintJob }),
    });
    assert.equal(resp.status, 200);
    const body = await resp.json();

    assert.equal(body.jobId, "paint");
    assert.equal(body.stageTotalGrosze, EXPECTED_PAINT_STAGE_GROSZE);
    assert.equal(body.unresolvedCount, 1);

    const resolved = body.lines.find((l: { resolved: boolean }) => l.resolved);
    assert.equal(resolved.cheapestOffer.store, EXPECTED_CHEAPEST.store);
    assert.equal(resolved.cheapestOffer.url, EXPECTED_CHEAPEST.url);
    assert.equal(
      resolved.cheapestOffer.unitPriceGrosze,
      EXPECTED_CHEAPEST.unitPriceGrosze,
    );
    assert.equal(resolved.packagesNeeded, EXPECTED_CHEAPEST.packagesNeeded);
  } finally {
    await close();
  }
});

test("POST /api/pricing/stage: obmiary => robocizna w odpowiedzi (materiały bez zmian)", async () => {
  const { url, close } = await listen(makeApp(() => dummyDb));
  try {
    // Etap malowania ścian z obmiarem 20 m² => robocizna 2360 gr/m² * 20 = 47200.
    const job = { jobId: "paint-walls", materials: [], measurements: { wallArea: 20 } };
    const resp = await fetch(`${url}/api/pricing/stage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ job }),
    });
    assert.equal(resp.status, 200);
    const body = await resp.json();

    assert.equal(body.stageTotalGrosze, 0); // materiały bez zmian znaczenia
    assert.equal(body.materialsTotalGrosze, 0);
    assert.equal(body.laborTotalGrosze, 47200);
    assert.equal(body.stageTotalWithLaborGrosze, 47200);
    assert.equal(body.labor.lines.length, 1);
    assert.equal(body.labor.lines[0].estimated, true);
    assert.equal(body.labor.lines[0].lineCostGrosze, 47200);
    assert.ok(body.labor.lines[0].source.name.length > 0);
  } finally {
    await close();
  }
});

test("POST /api/pricing/stage waliduje wejście (400 na złym body)", async () => {
  const { url, close } = await listen(makeApp(() => dummyDb));
  try {
    const resp = await fetch(`${url}/api/pricing/stage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ job: { jobId: "x" } }), // brak materials
    });
    assert.equal(resp.status, 400);
    const body = await resp.json();
    assert.equal(body.error, "invalid_request");
  } finally {
    await close();
  }
});

test("POST /api/pricing/project sumuje etapy remontu", async () => {
  const { url, close } = await listen(makeApp(() => dummyDb));
  try {
    const resp = await fetch(`${url}/api/pricing/project`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jobs: [paintJob, emptyJob] }),
    });
    assert.equal(resp.status, 200);
    const body = await resp.json();
    assert.equal(body.stages.length, 2);
    assert.equal(body.projectTotalGrosze, EXPECTED_PAINT_STAGE_GROSZE);
  } finally {
    await close();
  }
});

test("GET /api/pricing/project czyta payload z query", async () => {
  const { url, close } = await listen(makeApp(() => dummyDb));
  try {
    const payload = encodeURIComponent(JSON.stringify({ jobs: [paintJob] }));
    const resp = await fetch(`${url}/api/pricing/project?payload=${payload}`);
    assert.equal(resp.status, 200);
    const body = await resp.json();
    assert.equal(body.projectTotalGrosze, EXPECTED_PAINT_STAGE_GROSZE);
  } finally {
    await close();
  }
});

test("GET /api/pricing/project bez payload => 400", async () => {
  const { url, close } = await listen(makeApp(() => dummyDb));
  try {
    const resp = await fetch(`${url}/api/pricing/project`);
    assert.equal(resp.status, 400);
    const body = await resp.json();
    assert.equal(body.error, "missing_payload");
  } finally {
    await close();
  }
});

test("GET /api/pricing/history?productId= zwraca statystyki w groszach + historię", async () => {
  const { url, close } = await listen(makeApp(() => dummyDb));
  try {
    const resp = await fetch(`${url}/api/pricing/history?productId=p1`);
    assert.equal(resp.status, 200);
    const body = await resp.json();

    assert.equal(body.product.id, "p1");
    assert.equal(body.stats.lowest, EXPECTED_HISTORY_STATS.lowest);
    assert.equal(body.stats.average, EXPECTED_HISTORY_STATS.average);
    assert.equal(body.stats.current, EXPECTED_HISTORY_STATS.current);
    assert.equal(body.stats.changeVsLowest, EXPECTED_HISTORY_STATS.changeVsLowest);
    assert.equal(body.stats.changePct, EXPECTED_HISTORY_STATS.changePct);
    assert.equal(body.stats.isRealPromo, EXPECTED_HISTORY_STATS.isRealPromo);

    assert.equal(body.history.length, 3);
    // Punkty chronologicznie, ceny w groszach.
    assert.equal(body.history[0].effectiveGrosze, 10000);
    assert.equal(body.history[2].effectiveGrosze, 9000);
    assert.equal(body.history[2].store, "Leroy Merlin");
  } finally {
    await close();
  }
});

test("GET /api/pricing/history?ean= resolwuje produkt po kodzie", async () => {
  const { url, close } = await listen(makeApp(() => dummyDb));
  try {
    const resp = await fetch(`${url}/api/pricing/history?ean=111`);
    assert.equal(resp.status, 200);
    const body = await resp.json();
    assert.equal(body.product.ean, "111");
    assert.equal(body.stats.isRealPromo, true);
  } finally {
    await close();
  }
});

test("GET /api/pricing/history bez identyfikatora => 400", async () => {
  const { url, close } = await listen(makeApp(() => dummyDb));
  try {
    const resp = await fetch(`${url}/api/pricing/history`);
    assert.equal(resp.status, 400);
    const body = await resp.json();
    assert.equal(body.error, "missing_identifier");
  } finally {
    await close();
  }
});

test("GET /api/pricing/history: nieznany produkt => 404", async () => {
  const { url, close } = await listen(makeApp(() => dummyDb));
  try {
    const resp = await fetch(`${url}/api/pricing/history?productId=nope`);
    assert.equal(resp.status, 404);
    const body = await resp.json();
    assert.equal(body.error, "product_not_found");
  } finally {
    await close();
  }
});

test("GET /api/pricing/health: 200 gdy wszystkie tabele istnieją", async () => {
  const okDb = {
    execute: async () => ({ rows: [{ reg: "public.table" }] }),
  } as unknown as Database;
  const { url, close } = await listen(makeApp(() => okDb));
  try {
    const resp = await fetch(`${url}/api/pricing/health`);
    assert.equal(resp.status, 200);
    const body = await resp.json();
    assert.equal(body.status, "ok");
    assert.equal(body.tables.length, 3);
    assert.ok(body.tables.every((t: { exists: boolean }) => t.exists));
  } finally {
    await close();
  }
});

test("GET /api/pricing/health: 503 gdy brakuje tabel", async () => {
  const missingDb = {
    execute: async () => ({ rows: [{ reg: null }] }),
  } as unknown as Database;
  const { url, close } = await listen(makeApp(() => missingDb));
  try {
    const resp = await fetch(`${url}/api/pricing/health`);
    assert.equal(resp.status, 503);
    const body = await resp.json();
    assert.equal(body.status, "degraded");
  } finally {
    await close();
  }
});
