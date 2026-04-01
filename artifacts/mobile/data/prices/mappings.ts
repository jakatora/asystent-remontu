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
      standard: ['mat-gres-guigliano-1m2', 'mat-tile-adhesive-buildfix-25kg'],
    },
  },
  {
    jobId: 'wall-tiles-bathroom',
    materialTypeMap: {
      standard: ['mat-gres-guigliano-1m2', 'mat-tile-adhesive-buildfix-25kg', 'mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    jobId: 'silicone-sealing',
    materialTypeMap: {
      standard: ['mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    jobId: 'grout-only',
    materialTypeMap: {},
  },
  {
    jobId: 'bathroom-waterproofing',
    materialTypeMap: {},
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
