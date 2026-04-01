import type { BundleDefinition } from '@/types/commerce';

export const BUNDLE_DEFINITIONS: readonly BundleDefinition[] = [
  {
    id: 'bundle-wall-painting-basic',
    title: 'Zestaw do malowania ścian — podstawowy',
    description: 'Wszystko czego potrzebujesz do malowania jednego pokoju farbą ekonomiczną.',
    jobIds: ['paint-walls', 'wall-primer'],
    items: [
      { internalId: 'mat-paint-economy-white-10l', name: 'Farba biała mat 10 l', type: 'material', quantity: 1, unit: 'op.', unitPrice: 54.98 },
      { internalId: 'mat-universal-primer-5l', name: 'Grunt uniwersalny Knauf 5 l', type: 'material', quantity: 1, unit: 'op.', unitPrice: 30.98 },
      { internalId: 'tool-paint-roller-25cm', name: 'Wałek malarski 25 cm', type: 'tool', quantity: 1, unit: 'szt', unitPrice: 12.99 },
      { internalId: 'tool-paint-tray', name: 'Kuweta malarska', type: 'tool', quantity: 1, unit: 'szt', unitPrice: 8.99 },
      { internalId: 'tool-masking-tape', name: 'Taśma maskująca', type: 'tool', quantity: 2, unit: 'szt', unitPrice: 7.49 },
    ],
    optionalUpgrades: [
      { internalId: 'mat-paint-standard-white-10l', name: 'Farba GoodHome biała mat 10 l (upgrade)', type: 'material', quantity: 1, unit: 'op.', unitPrice: 72.98 },
      { internalId: 'tool-brush-flat-50mm', name: 'Pędzel płaski 50 mm', type: 'tool', quantity: 1, unit: 'szt', unitPrice: 9.99 },
    ],
    quantityRules: {
      scaleWithArea: true,
      baseAreaM2: 40,
      minQuantityMultiplier: 1,
      maxQuantityMultiplier: 5,
    },
    compatibilityTags: ['paint', 'walls', 'interior'],
    estimatedSubtotal: 122.92,
    currency: 'PLN',
  },
  {
    id: 'bundle-wall-painting-standard',
    title: 'Zestaw do malowania ścian — standard',
    description: 'Kompletny zestaw z farbą GoodHome i profesjonalnymi narzędziami.',
    jobIds: ['paint-walls', 'wall-primer'],
    items: [
      { internalId: 'mat-paint-standard-white-10l', name: 'Farba GoodHome biała mat 10 l', type: 'material', quantity: 1, unit: 'op.', unitPrice: 72.98 },
      { internalId: 'mat-universal-primer-5l', name: 'Grunt uniwersalny Knauf 5 l', type: 'material', quantity: 1, unit: 'op.', unitPrice: 30.98 },
      { internalId: 'tool-paint-roller-25cm', name: 'Wałek malarski 25 cm', type: 'tool', quantity: 1, unit: 'szt', unitPrice: 12.99 },
      { internalId: 'tool-paint-tray', name: 'Kuweta malarska', type: 'tool', quantity: 1, unit: 'szt', unitPrice: 8.99 },
      { internalId: 'tool-masking-tape', name: 'Taśma maskująca', type: 'tool', quantity: 2, unit: 'szt', unitPrice: 7.49 },
      { internalId: 'tool-brush-flat-50mm', name: 'Pędzel płaski 50 mm', type: 'tool', quantity: 1, unit: 'szt', unitPrice: 9.99 },
    ],
    optionalUpgrades: [
      { internalId: 'mat-paint-better-white-10l', name: 'Farba Śnieżka Eko Plus biała 10 l (upgrade)', type: 'material', quantity: 1, unit: 'op.', unitPrice: 108.00 },
    ],
    quantityRules: {
      scaleWithArea: true,
      baseAreaM2: 40,
      minQuantityMultiplier: 1,
      maxQuantityMultiplier: 5,
    },
    compatibilityTags: ['paint', 'walls', 'interior'],
    estimatedSubtotal: 150.91,
    currency: 'PLN',
  },
  {
    id: 'bundle-laminate-starter',
    title: 'Zestaw startowy — panele podłogowe',
    description: 'Panele, podkład i listwy — gotowe do montażu.',
    jobIds: ['laminate-flooring', 'skirting-boards'],
    items: [
      { internalId: 'mat-laminate-oakland-ac4', name: 'Panele Oakland AC4 2.51 m²', type: 'material', quantity: 4, unit: 'op.', unitPrice: 67.72 },
      { internalId: 'mat-underlay-volden-xps-10m2', name: 'Podkład Volden XPS 10 m²', type: 'material', quantity: 1, unit: 'op.', unitPrice: 69.80 },
      { internalId: 'mat-skirting-arbiton-2500', name: 'Listwa Arbiton Indo 2500 mm', type: 'material', quantity: 8, unit: 'szt', unitPrice: 31.98 },
    ],
    optionalUpgrades: [],
    quantityRules: {
      scaleWithArea: true,
      baseAreaM2: 10,
      minQuantityMultiplier: 1,
      maxQuantityMultiplier: 10,
    },
    compatibilityTags: ['flooring', 'laminate'],
    estimatedSubtotal: 596.52,
    currency: 'PLN',
  },
  {
    id: 'bundle-tiles-starter',
    title: 'Zestaw startowy — płytki',
    description: 'Gres, klej i silikon — podstawowy zestaw do układania płytek.',
    jobIds: ['floor-tiles', 'wall-tiles-bathroom'],
    items: [
      { internalId: 'mat-gres-guigliano-1m2', name: 'Gres Guigliano GoodHome 1 m²', type: 'material', quantity: 10, unit: 'op.', unitPrice: 69.98 },
      { internalId: 'mat-tile-adhesive-buildfix-25kg', name: 'Klej Buildfix 25 kg', type: 'material', quantity: 2, unit: 'op.', unitPrice: 48.98 },
      { internalId: 'mat-sanitary-silicone-soudal-280ml', name: 'Silikon Soudal 280 ml', type: 'material', quantity: 2, unit: 'szt', unitPrice: 18.98 },
    ],
    optionalUpgrades: [],
    quantityRules: {
      scaleWithArea: true,
      baseAreaM2: 10,
      minQuantityMultiplier: 1,
      maxQuantityMultiplier: 5,
    },
    compatibilityTags: ['tiles', 'bathroom', 'floor'],
    estimatedSubtotal: 835.72,
    currency: 'PLN',
  },
];

export function getBundlesForJob(jobId: string): BundleDefinition[] {
  return BUNDLE_DEFINITIONS.filter((b) => b.jobIds.includes(jobId));
}

export function getBundleById(bundleId: string): BundleDefinition | undefined {
  return BUNDLE_DEFINITIONS.find((b) => b.id === bundleId);
}
