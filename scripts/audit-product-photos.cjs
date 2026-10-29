#!/usr/bin/env node
/** Check that reviewed catalogue photos still return image bytes. No prices are read. */
const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(__dirname, '../artifacts/mobile/data/products/photos.ts');
const source = fs.readFileSync(file, 'utf8');
const urls = [...new Set([...source.matchAll(/["']?imageUrl["']?\s*:\s*['"]([^'"]+)['"]/g)].map(match => match[1]))];
if (urls.length === 0) throw new Error('No product photo URLs found');

let cursor = 0;
const failures = [];
async function checkNext() {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    try {
      const response = await fetch(url, {
        headers: { range: 'bytes=0-1024', 'user-agent': 'Mozilla/5.0 (AsystentRemontu photo audit)' },
        signal: AbortSignal.timeout(12000),
      });
      const type = response.headers.get('content-type') ?? '';
      if (!response.ok || !type.toLowerCase().startsWith('image/')) {
        failures.push({ url, status: response.status, contentType: type });
      }
      await response.body?.cancel();
    } catch (error) {
      failures.push({ url, error: String(error) });
    }
  }
}

Promise.all(Array.from({ length: 12 }, checkNext)).then(() => {
  console.log(JSON.stringify({ checked: urls.length, valid: urls.length - failures.length, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}).catch(error => { console.error(error); process.exitCode = 1; });
