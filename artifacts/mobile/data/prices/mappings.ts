import type { MaterialCategory } from '@/types/pricing';

export interface JobLaborMapping {
  readonly jobId: string;
  readonly laborPriceIds: readonly string[];
}

export interface JobMaterialMapping {
  readonly jobId: string;
  readonly materialTypeMap: Partial<Record<MaterialCategory, readonly string[]>>;
}

export const JOB_LABOR_MAPPINGS: readonly JobLaborMapping[] = [
  { jobId: 'wall-primer', laborPriceIds: ['labor-wall-primer'] },
  { jobId: 'paint-walls', laborPriceIds: ['labor-wall-painting-3-coats'] },
  { jobId: 'paint-ceiling', laborPriceIds: ['labor-wall-painting-3-coats'] },
  { jobId: 'wallpaper-install', laborPriceIds: ['labor-wallpaper-installation'] },
  { jobId: 'wallpaper-remove', laborPriceIds: ['labor-wallpaper-installation'] },
  { jobId: 'wall-repair', laborPriceIds: ['labor-repair-holes-cracks'] },
  { jobId: 'skim-coat', laborPriceIds: ['labor-skim-coat'] },
  { jobId: 'laminate-flooring', laborPriceIds: ['labor-laminate-installation'] },
  { jobId: 'skirting-boards', laborPriceIds: ['labor-skirting-installation'] },
  { jobId: 'vinyl-flooring', laborPriceIds: ['labor-vinyl-click-installation'] },
  { jobId: 'vinyl-click-flooring', laborPriceIds: ['labor-vinyl-click-installation'] },
  { jobId: 'vinyl-glued', laborPriceIds: ['labor-glued-vinyl-installation'] },
  { jobId: 'wall-tiles-bathroom', laborPriceIds: ['labor-wall-tiles-installation', 'labor-substrate-primer-tiles'] },
  { jobId: 'floor-tiles', laborPriceIds: ['labor-standard-tiles-installation'] },
  { jobId: 'grout-only', laborPriceIds: [] },
  { jobId: 'silicone-sealing', laborPriceIds: [] },
  { jobId: 'bathroom-waterproofing', laborPriceIds: [] },
  { jobId: 'sink-installation', laborPriceIds: ['labor-sink-installation'] },
  { jobId: 'toilet-installation', laborPriceIds: ['labor-toilet-installation'] },
  { jobId: 'minor-plumbing', laborPriceIds: ['labor-sink-installation'] },
  { jobId: 'gypsum-wall', laborPriceIds: ['labor-skim-coat'] },
  { jobId: 'gypsum-ceiling', laborPriceIds: ['labor-skim-coat'] },
  { jobId: 'paint-frames', laborPriceIds: ['labor-wall-painting-3-coats'] },
  { jobId: 'kitchen-cabinet-paint', laborPriceIds: ['labor-wall-painting-3-coats'] },
  { jobId: 'kitchen-backsplash', laborPriceIds: ['labor-wall-tiles-installation'] },
  { jobId: 'door-painting', laborPriceIds: ['labor-wall-painting-3-coats'] },
  { jobId: 'epoxy-floor', laborPriceIds: ['labor-glued-vinyl-installation'] },
  { jobId: 'parquet-sanding', laborPriceIds: ['labor-laminate-installation'] },
  { jobId: 'underlay-install', laborPriceIds: [] },
];

export const JOB_MATERIAL_MAPPINGS: readonly JobMaterialMapping[] = [
  {
    jobId: 'wall-primer',
    materialTypeMap: {
      standard: ['mat-universal-primer-5l'],
      // Tier premium = grunt głęboko penetrujący (chłonne/pylące podłoża). Dodane
      // jako NOWY tier 'better' (economy/standard bez zmian). Materiał z EAN.
      better: ['mat-primer-deep-ceresit-ct17-10l'],
    },
  },
  {
    jobId: 'paint-walls',
    materialTypeMap: {
      economy: ['mat-paint-economy-white-10l', 'mat-universal-primer-5l'],
      standard: ['mat-paint-standard-white-10l', 'mat-universal-primer-5l'],
      better: ['mat-paint-better-white-10l', 'mat-universal-primer-5l'],
    },
  },
  {
    jobId: 'paint-ceiling',
    materialTypeMap: {
      economy: ['mat-paint-economy-white-10l'],
      standard: ['mat-paint-standard-white-10l'],
      better: ['mat-paint-better-white-10l'],
    },
  },
  {
    jobId: 'skim-coat',
    materialTypeMap: {
      economy: ['mat-skim-coat-economy-20kg', 'mat-universal-primer-5l'],
      standard: ['mat-skim-coat-standard-18kg', 'mat-universal-primer-5l'],
    },
  },
  {
    jobId: 'wall-repair',
    materialTypeMap: {
      economy: ['mat-skim-coat-economy-20kg'],
      standard: ['mat-skim-coat-standard-18kg'],
    },
  },
  {
    jobId: 'laminate-flooring',
    materialTypeMap: {
      economy: ['mat-laminate-oakland-ac4', 'mat-underlay-volden-xps-10m2', 'mat-skirting-arbiton-2500'],
      standard: ['mat-laminate-oakland-ac4', 'mat-underlay-volden-xps-10m2', 'mat-skirting-arbiton-2500'],
    },
  },
  {
    jobId: 'skirting-boards',
    materialTypeMap: {
      standard: ['mat-skirting-arbiton-2500'],
    },
  },
  {
    jobId: 'floor-tiles',
    materialTypeMap: {
      // + fuga (mat-grout-ceresit-ce40-white-2kg) — job ma spoinowanie, a materiał
      //   z EAN daje realną ofertę zamiast pominięcia pozycji.
      standard: [
        'mat-gres-guigliano-1m2',
        'mat-tile-adhesive-buildfix-25kg',
        'mat-grout-ceresit-ce40-white-2kg',
      ],
      // Tier premium = markowy klej Ceresit CM 11 (EAN) zamiast marki własnej.
      better: [
        'mat-gres-guigliano-1m2',
        'mat-tile-adhesive-ceresit-cm11-25kg',
        'mat-grout-ceresit-ce40-white-2kg',
      ],
    },
  },
  {
    jobId: 'wall-tiles-bathroom',
    materialTypeMap: {
      // + fuga (mat-grout-ceresit-ce40-white-2kg, EAN) — job ma spoinę ścienną.
      standard: [
        'mat-gres-guigliano-1m2',
        'mat-tile-adhesive-buildfix-25kg',
        'mat-grout-ceresit-ce40-white-2kg',
        'mat-sanitary-silicone-soudal-280ml',
      ],
      // Tier premium = markowy klej Ceresit CM 11 (EAN).
      better: [
        'mat-gres-guigliano-1m2',
        'mat-tile-adhesive-ceresit-cm11-25kg',
        'mat-grout-ceresit-ce40-white-2kg',
        'mat-sanitary-silicone-soudal-280ml',
      ],
    },
  },
  {
    jobId: 'silicone-sealing',
    materialTypeMap: {
      standard: ['mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    // Fugowanie: fuga + silikon — oba materiały z EAN (≥2 oferty w katalogu).
    jobId: 'grout-only',
    materialTypeMap: {
      standard: ['mat-grout-ceresit-ce40-white-2kg', 'mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    jobId: 'bathroom-waterproofing',
    materialTypeMap: {},
  },

  // ── Etapy podłączone do katalogu cen (materiały z EAN → oferty ≥2 sklepów) ──
  // Każdy materialId istnieje w MATERIAL_PRICES; materiały markowe mają EAN w
  // MATERIAL_EAN_OVERLAY (api-server), więc feedy/seed dopinają im realne oferty.
  // Nowe wpisy NIE ruszają istniejących jobów ani measurementInputs — dokładają
  // tylko pokrycie materiałowe dla etapów dotąd bez wyceny materiałów.
  {
    // Uszczelnianie okien: piana montażowa + silikon (oba z EAN).
    jobId: 'window-sealing',
    materialTypeMap: {
      standard: ['mat-foam-tytan-pro65-750ml', 'mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    // Montaż parapetu: piana montażowa + silikon (oba z EAN).
    jobId: 'windowsill-install',
    materialTypeMap: {
      standard: ['mat-foam-tytan-pro65-750ml', 'mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    // Zabudowa GK (ściana): gładź wykończeniowa na spoiny + grunt. Duże pozycje
    // (płyta GK, profile, wełna) nie są jeszcze w katalogu — pokrywamy dostępne.
    jobId: 'gypsum-wall',
    materialTypeMap: {
      economy: ['mat-skim-coat-economy-20kg', 'mat-universal-primer-5l'],
      standard: ['mat-skim-coat-acrylputz-fs20-27kg', 'mat-universal-primer-5l'],
    },
  },
  {
    // Zabudowa GK (sufit): jak wyżej.
    jobId: 'gypsum-ceiling',
    materialTypeMap: {
      economy: ['mat-skim-coat-economy-20kg', 'mat-universal-primer-5l'],
      standard: ['mat-skim-coat-acrylputz-fs20-27kg', 'mat-universal-primer-5l'],
    },
  },
  {
    // Odświeżenie silikonu: sam silikon sanitarny (z EAN).
    jobId: 'silicone-refresh',
    materialTypeMap: {
      standard: ['mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    // Wykończenie listwami/opaskami: klej montażowy + silikon (oba z EAN).
    jobId: 'trim-finishing',
    materialTypeMap: {
      standard: ['mat-mounting-adhesive-soudal-fixall-290ml', 'mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    // Malowanie drzwi: farba + grunt + taśma malarska (taśma z EAN).
    jobId: 'door-painting',
    materialTypeMap: {
      standard: ['mat-paint-standard-white-10l', 'mat-universal-primer-5l', 'mat-masking-tape-bluedolphin-38mm'],
    },
  },
];

const LABOR_MAP = new Map(JOB_LABOR_MAPPINGS.map((m) => [m.jobId, m.laborPriceIds]));
const MATERIAL_MAP = new Map(JOB_MATERIAL_MAPPINGS.map((m) => [m.jobId, m.materialTypeMap]));

export function getLaborIdsForJob(jobId: string): readonly string[] {
  return LABOR_MAP.get(jobId) ?? [];
}

export function getMaterialIdsForJob(jobId: string, tier: MaterialCategory): readonly string[] {
  const mapping = MATERIAL_MAP.get(jobId);
  if (!mapping) return [];
  return mapping[tier] ?? mapping.standard ?? mapping.economy ?? [];
}
