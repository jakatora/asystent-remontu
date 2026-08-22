// Test integracyjny endpointu administracyjnego POST /admin/collect: żywy serwer
// Express + realny fetch HTTP. Zbieranie cen (buildSources/runCollection) jest
// wstrzykiwane, więc testujemy autoryzację i spięcie routingu BEZ Postgresa i
// bez sieci.
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";

import express, { type Express } from "express";

import type { Database } from "@workspace/db/repositories";
import type {
  CollectionResult,
  PriceSource,
} from "@workspace/price-collector";

import { createAdminRouter, type AdminRouterDeps } from "../src/routes/admin";

const dummyDb = {} as Database;

function fakeSource(slug: string): PriceSource {
  return {
    slug,
    displayName: slug,
    fetchProducts: async () => [],
    fetchOffers: async () => [],
  };
}

function fakeResult(source: string): CollectionResult {
  return {
    source,
    offersProcessed: 1,
    productsCreated: 1,
    productsMatched: 0,
    offersUpserted: 1,
    errors: [],
  };
}

function makeApp(overrides: AdminRouterDeps = {}): Express {
  const app = express();
  app.use(express.json());
  app.use(
    "/api",
    createAdminRouter({
      adminToken: "secret",
      getDb: () => dummyDb,
      buildSources: async (slugs) => slugs.map(fakeSource),
      runCollection: async (sources) => sources.map((s) => fakeResult(s.slug)),
      ...overrides,
    }),
  );
  return app;
}

async function listen(
  app: Express,
): Promise<{ url: string; close: () => Promise<void> }> {
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

test("POST /api/admin/collect: 403 gdy ADMIN_TOKEN nie ustawiony", async () => {
  const { url, close } = await listen(makeApp({ adminToken: undefined }));
  try {
    const resp = await fetch(`${url}/api/admin/collect`, { method: "POST" });
    assert.equal(resp.status, 403);
    assert.equal((await resp.json()).error, "admin_disabled");
  } finally {
    await close();
  }
});

test("POST /api/admin/collect: 401 gdy zły token", async () => {
  const { url, close } = await listen(makeApp());
  try {
    const resp = await fetch(`${url}/api/admin/collect`, {
      method: "POST",
      headers: { "x-admin-token": "wrong" },
    });
    assert.equal(resp.status, 401);
  } finally {
    await close();
  }
});

test("POST /api/admin/collect: 200 uruchamia zbieranie z wybranych źródeł", async () => {
  const { url, close } = await listen(
    makeApp({
      // Bez ENV domyślny resolver bierze wszystkie zarejestrowane; tu wybór z body.
      resolveSlugs: (requested) => ({
        slugs: requested ?? ["leroy-merlin", "mrowka"],
        unknown: [],
      }),
    }),
  );
  try {
    const resp = await fetch(`${url}/api/admin/collect`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": "secret" },
      body: JSON.stringify({ sources: ["leroy-merlin", "mrowka"] }),
    });
    assert.equal(resp.status, 200);
    const body = await resp.json();
    assert.equal(body.status, "ok");
    assert.equal(body.results.length, 2);
    assert.equal(body.totals.offersUpserted, 2);
    assert.equal(body.totals.errors, 0);
  } finally {
    await close();
  }
});

test("POST /api/admin/collect: 400 gdy brak znanych źródeł", async () => {
  const { url, close } = await listen(
    makeApp({ resolveSlugs: () => ({ slugs: [], unknown: ["nieznany"] }) }),
  );
  try {
    const resp = await fetch(`${url}/api/admin/collect`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": "secret" },
      body: JSON.stringify({ sources: ["nieznany"] }),
    });
    assert.equal(resp.status, 400);
    assert.equal((await resp.json()).error, "no_sources");
  } finally {
    await close();
  }
});
