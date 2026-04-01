import type {
  ProductMapping,
  MappingExportData,
  MappingImportPreview,
  MappingImportResult,
  MappingImportError,
  CommerceProviderType,
} from '@/types/commerce';
import { nowISO } from '@/shared/lib/date';

const EXPORT_VERSION = '1.0.0';

export function exportMappings(
  mappings: readonly ProductMapping[],
  provider: CommerceProviderType
): MappingExportData {
  return {
    version: EXPORT_VERSION,
    exportedAt: nowISO(),
    provider,
    mappings: [...mappings],
  };
}

export function exportMappingsToJson(
  mappings: readonly ProductMapping[],
  provider: CommerceProviderType
): string {
  return JSON.stringify(exportMappings(mappings, provider), null, 2);
}

export function parseMappingsFromJson(json: string): MappingExportData {
  const data = JSON.parse(json);
  if (!data.version || !data.mappings || !Array.isArray(data.mappings)) {
    throw new Error('Nieprawidłowy format pliku mapowań.');
  }
  return data as MappingExportData;
}

export function previewImport(
  existing: readonly ProductMapping[],
  incoming: readonly ProductMapping[]
): MappingImportPreview {
  const existingMap = new Map<string, ProductMapping>(
    existing.map((m) => [m.internalId, m])
  );

  const newMappings: ProductMapping[] = [];
  const updatedMappings: { existing: ProductMapping; incoming: ProductMapping }[] = [];
  const seenIds = new Set<string>();
  const duplicates: string[] = [];

  for (const item of incoming) {
    if (seenIds.has(item.internalId)) {
      duplicates.push(item.internalId);
      continue;
    }
    seenIds.add(item.internalId);

    const ex = existingMap.get(item.internalId);
    if (ex) {
      if (
        ex.externalProductId !== item.externalProductId ||
        ex.externalVariantId !== item.externalVariantId ||
        ex.sku !== item.sku ||
        ex.activeForCommerce !== item.activeForCommerce
      ) {
        updatedMappings.push({ existing: ex, incoming: item });
      }
    } else {
      newMappings.push(item);
    }
  }

  return {
    newMappings,
    updatedMappings,
    duplicates,
    totalChanges: newMappings.length + updatedMappings.length,
  };
}

export function applyImport(
  existing: readonly ProductMapping[],
  incoming: readonly ProductMapping[]
): { mappings: ProductMapping[]; result: MappingImportResult } {
  const preview = previewImport(existing, incoming);
  const errors: MappingImportError[] = [];

  const resultMap = new Map<string, ProductMapping>(
    existing.map((m) => [m.internalId, m])
  );

  for (const m of preview.newMappings) {
    if (!m.internalId || !m.externalProductId) {
      errors.push({ internalId: m.internalId || '(empty)', reason: 'Brakujące pola wymagane.' });
      continue;
    }
    resultMap.set(m.internalId, m);
  }

  for (const { incoming: inc } of preview.updatedMappings) {
    resultMap.set(inc.internalId, inc);
  }

  return {
    mappings: Array.from(resultMap.values()),
    result: {
      imported: preview.newMappings.length - errors.length,
      updated: preview.updatedMappings.length,
      skipped: preview.duplicates.length,
      errors,
    },
  };
}

export function validateMappingIntegrity(
  mappings: readonly ProductMapping[]
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const ids = new Set<string>();

  for (const m of mappings) {
    if (ids.has(m.internalId)) {
      issues.push(`Duplikat internalId: ${m.internalId}`);
    }
    ids.add(m.internalId);

    if (!m.externalProductId) {
      issues.push(`${m.internalId}: brak externalProductId`);
    }
    if (!m.externalVariantId) {
      issues.push(`${m.internalId}: brak externalVariantId`);
    }
    if (!m.sku) {
      issues.push(`${m.internalId}: brak SKU`);
    }
  }

  return { valid: issues.length === 0, issues };
}
