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
  EXPECTED_PAINT_STAGE_GROSZE,
  emptyJob,
  fakeDeps,
  paintJob,
} from "./fixtures";

const dummyDb = {} as Database;

function makeApp(getDb: () => Database): Express {
  const app = express();
  app.use(express.json());
  app.use("/api", createPricingRouter({ getDb, deps: fakeDeps }));
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
