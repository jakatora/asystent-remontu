import type { RenovationJob, RenovationCategory } from '@/types/domain';

// ─── Job registry ─────────────────────────────────────────────────────────────
// Adding a new renovation type = one new job file + one entry here.
// No app screen changes needed.

import { paintJob, paintCeilingJob }                                          from '@/data/jobs/paint';
import { primerJob, wallRepairJob, skimCoatJob,
         repaintJob, wallpaperInstallJob, wallpaperRemoveJob }                from '@/data/jobs/walls';
import { underlayJob, laminateJob, vinylJob, vinylGluedJob,
         floorTilesJob, skirtingBoardsJob }                                   from '@/data/jobs/flooring';
import { waterproofingJob, bathroomWallTilesJob, groutJob, siliconeJob }      from '@/data/jobs/bathroom';
import { wallpaperJob, doorsJob }                                             from '@/data/jobs/finishing';
import { minorPlumbingJob, electricalOverviewJob, highRiskJob,
         gasInstallationJob, structuralDemolitionJob, mainElectricalJob,
         roofRepairJob, chimneyWorkJob }                                      from '@/data/jobs/risky';
import { backsplashTilesJob, countertopInstallJob,
         kitchenCabinetPaintJob, kitchenHardwareJob,
         kitchenHoodJob }                                                     from '@/data/jobs/kitchen';
import { gypsumWallJob, gypsumCeilingJob }                                    from '@/data/jobs/gypsum';
import { windowSealingJob, windowsillJob, paintFramesJob, trimFinishingJob }  from '@/data/jobs/windows';
import { shelfMountingJob, curtainRodJob, bathroomAccessoriesJob,
         mirrorInstallJob, furnitureAssemblyJob,
         pictureHangingJob }                                                  from '@/data/jobs/fixtures';
import { doorPaintingJob, doorHandleReplaceJob, doorSealReplaceJob,
         toiletSeatReplaceJob, sinkTrapReplaceJob, drainUnblockJob,
         lightFixtureJob, socketFrameReplaceJob,
         siliconeRefreshJob }                                                 from '@/data/jobs/small-repairs';
import { selfLevelingJob, epoxFloorJob, parquetSandingJob }                  from '@/data/jobs/floor-prep';
import { airConditioningSplitJob }                                            from '@/data/jobs/hvac';
import { epsInsulationBsoJob, acousticSuspendedCeilingJob, fireplaceInstallationJob,
         interiorWoodenStairsJob, mechanicalVentilationMvhrJob }              from '@/data/jobs/new-additions';

// ─────────────────────────────────────────────────────────────────────────────
// THE SINGLE SOURCE OF TRUTH FOR ALL RENOVATION JOBS
// To add a new job: import it above and add it to this array.
// ─────────────────────────────────────────────────────────────────────────────

const JOB_REGISTRY: readonly RenovationJob[] = Object.freeze([
  // ── Painting & walls ──────────────────────────────────────────────────────
  paintJob,
  paintCeilingJob,
  repaintJob,
  primerJob,
  wallRepairJob,
  skimCoatJob,
  // ── Wallpaper ─────────────────────────────────────────────────────────────
  wallpaperJob,          // legacy (id: 'wallpaper') — kept for existing saved projects
  wallpaperInstallJob,   // rich (id: 'wallpaper-install')
  wallpaperRemoveJob,
  // ── Flooring ──────────────────────────────────────────────────────────────
  underlayJob,
  laminateJob,
  vinylJob,
  vinylGluedJob,
  floorTilesJob,
  skirtingBoardsJob,     // replaces old skirtingJob (same id: 'skirting-boards')
  // ── Floor preparation ─────────────────────────────────────────────────────
  selfLevelingJob,
  epoxFloorJob,
  parquetSandingJob,
  // ── Bathroom & wet areas ───────────────────────────────────────────────────
  waterproofingJob,
  bathroomWallTilesJob,
  groutJob,
  siliconeJob,
  siliconeRefreshJob,
  // ── Kitchen ──────────────────────────────────────────────────────────────
  backsplashTilesJob,
  countertopInstallJob,
  kitchenCabinetPaintJob,
  kitchenHardwareJob,
  kitchenHoodJob,
  // ── Gypsum / drywall ────────────────────────────────────────────────────
  gypsumWallJob,
  gypsumCeilingJob,
  // ── Doors & windows ──────────────────────────────────────────────────────
  windowSealingJob,
  windowsillJob,
  paintFramesJob,
  trimFinishingJob,
  doorsJob,
  doorPaintingJob,
  doorHandleReplaceJob,
  doorSealReplaceJob,
  // ── Fixtures & small mounting ─────────────────────────────────────────────
  shelfMountingJob,
  curtainRodJob,
  bathroomAccessoriesJob,
  mirrorInstallJob,
  furnitureAssemblyJob,
  pictureHangingJob,
  // ── Small repairs ─────────────────────────────────────────────────────────
  toiletSeatReplaceJob,
  sinkTrapReplaceJob,
  drainUnblockJob,
  lightFixtureJob,
  socketFrameReplaceJob,
  // ── Risky / specialist ────────────────────────────────────────────────────
  minorPlumbingJob,
  electricalOverviewJob,
  gasInstallationJob,
  structuralDemolitionJob,
  mainElectricalJob,
  roofRepairJob,
  chimneyWorkJob,
  highRiskJob,
  // ── HVAC (Faza 4) ─────────────────────────────────────────────────────────
  airConditioningSplitJob,
  mechanicalVentilationMvhrJob,
  // ── Insulation / Ceiling / Fireplace / Stairs (Faza 4) ───────────────────
  epsInsulationBsoJob,
  acousticSuspendedCeilingJob,
  fireplaceInstallationJob,
  interiorWoodenStairsJob,
]);

// ─── Category metadata ────────────────────────────────────────────────────────
// jobCount is auto-computed from the registry — never goes stale.

import { Colors } from '@/constants/colors';

const CATEGORY_META: Omit<RenovationCategory, 'jobCount'>[] = [
  {
    id: 'paint',
    name: 'Malowanie',
    description: 'Malowanie i przemalowanie ścian i sufitów',
    icon: 'droplet',
    color: Colors.categoryPaint,
  },
  {
    id: 'primer',
    name: 'Gruntowanie',
    description: 'Przygotowanie powierzchni pod malowanie lub tapety',
    icon: 'layers',
    color: Colors.categoryWall,
  },
  {
    id: 'wall-repair',
    name: 'Naprawa ścian',
    description: 'Uzupełnianie ubytków i pęknięć',
    icon: 'tool',
    color: Colors.categoryWall,
  },
  {
    id: 'skim-coat',
    name: 'Szpachlowanie',
    description: 'Wyrównywanie ścian masą szpachlową',
    icon: 'edit-3',
    color: Colors.categoryWall,
  },
  {
    id: 'wallpaper',
    name: 'Tapetowanie',
    description: 'Naklejanie i zrywanie tapet',
    icon: 'image',
    color: Colors.categoryPaint,
  },
  {
    id: 'underlay',
    name: 'Podkład podłogowy',
    description: 'Podkład i folia przed panelami',
    icon: 'layers',
    color: Colors.categoryFloor,
  },
  {
    id: 'laminate',
    name: 'Panele laminowane',
    description: 'Układanie paneli laminowanych',
    icon: 'grid',
    color: Colors.categoryFloor,
  },
  {
    id: 'vinyl',
    name: 'Panele winylowe',
    description: 'Panele winylowe LVT/SPC i wykładziny klejone',
    icon: 'square',
    color: Colors.categoryFloor,
  },
  {
    id: 'floor-tiles',
    name: 'Płytki podłogowe',
    description: 'Układanie płytek ceramicznych na podłodze',
    icon: 'grid',
    color: Colors.categoryFloor,
  },
  {
    id: 'floor-prep',
    name: 'Przygotowanie podłoży',
    description: 'Wylewki samopoziomujące, epoksyd, cyklinowanie',
    icon: 'layers',
    color: Colors.categoryFloor,
  },
  {
    id: 'skirting',
    name: 'Listwy przypodłogowe',
    description: 'Montaż listew przypodłogowych',
    icon: 'align-left',
    color: Colors.categoryDoors,
  },
  {
    id: 'waterproofing',
    name: 'Hydroizolacja łazienki',
    description: 'Uszczelnianie mokrych pomieszczeń',
    icon: 'shield',
    color: Colors.categoryBath,
  },
  {
    id: 'wall-tiles',
    name: 'Płytki ścienne',
    description: 'Układanie płytek ceramicznych na ścianach',
    icon: 'grid',
    color: Colors.categoryBath,
  },
  {
    id: 'grout',
    name: 'Fugowanie',
    description: 'Wypełnianie spoin między płytkami',
    icon: 'grid',
    color: Colors.categoryBath,
  },
  {
    id: 'silicone',
    name: 'Silikonowanie',
    description: 'Uszczelnianie fug silikonem sanitarnym',
    icon: 'minus',
    color: Colors.categoryBath,
  },
  {
    id: 'kitchen-tiles',
    name: 'Kuchnia — płytki i wykończenie',
    description: 'Backsplash, blaty, szafki i akcesoria kuchenne',
    icon: 'coffee',
    color: Colors.categoryKitchen,
  },
  {
    id: 'gypsum',
    name: 'Sucha zabudowa (GK)',
    description: 'Ścianki i sufity z gipsowo-kartonowych płyt',
    icon: 'columns',
    color: Colors.categoryGypsum,
  },
  {
    id: 'windows',
    name: 'Okna i parapety',
    description: 'Uszczelnianie, malowanie i wykończenie okien',
    icon: 'wind',
    color: Colors.categoryWindows,
  },
  {
    id: 'doors',
    name: 'Drzwi wewnętrzne',
    description: 'Montaż, malowanie i naprawa drzwi wewnętrznych',
    icon: 'home',
    color: Colors.categoryDoors,
  },
  {
    id: 'fixtures',
    name: 'Drobne montaże',
    description: 'Półki, karniszе, lustra, meble i dekoracje',
    icon: 'anchor',
    color: Colors.categoryDoors,
  },
  {
    id: 'plumbing',
    name: 'Prosta hydraulika',
    description: 'Wymiana kranów, uszczelek, syfonu, udrożnianie',
    icon: 'droplet',
    color: Colors.categoryPlumbing,
  },
  {
    id: 'electrical',
    name: 'Instalacja elektryczna',
    description: 'Wymiana gniazdek, wyłączników i opraw',
    icon: 'zap',
    color: Colors.categoryElectric,
  },
  {
    id: 'high-risk',
    name: 'Prace niebezpieczne',
    description: 'Prąd, gaz, konstrukcja, dach — tylko fachowiec',
    icon: 'alert-triangle',
    color: Colors.danger,
  },
  {
    id: 'hvac',
    name: 'Klimatyzacja i wentylacja',
    description: 'Klimatyzacja split, wentylacja mechaniczna, rekuperacja',
    icon: 'wind',
    color: Colors.info,
  },
  {
    id: 'insulation',
    name: 'Ocieplenie elewacji',
    description: 'BSO/ETICS — styropian + siatka + tynk cienkowarstwowy',
    icon: 'shield',
    color: Colors.categoryWall,
  },
  {
    id: 'ceiling-acoustic',
    name: 'Sufit podwieszany akustyczny',
    description: 'Panele rastrowe 60×60 na ruszcie T-15/T-24',
    icon: 'grid',
    color: Colors.categoryGypsum,
  },
  {
    id: 'fireplace',
    name: 'Kominek',
    description: 'Wkład kominkowy, izolacja, obudowa, odbiór kominiarski',
    icon: 'thermometer',
    color: Colors.danger,
  },
  {
    id: 'stairs',
    name: 'Schody',
    description: 'Schody drewniane wewnętrzne — montaż i balustrada',
    icon: 'corner-up-right',
    color: Colors.categoryWindows,
  },
];

// ─── Auto-computed categories ──────────────────────────────────────────────────

function buildCategories(): RenovationCategory[] {
  const countsByCategoryId = new Map<string, number>();
  for (const job of JOB_REGISTRY) {
    countsByCategoryId.set(
      job.categoryId,
      (countsByCategoryId.get(job.categoryId) ?? 0) + 1
    );
  }

  return CATEGORY_META
    .map((meta) => ({
      ...meta,
      jobCount: countsByCategoryId.get(meta.id) ?? 0,
    }))
    .filter((cat) => cat.jobCount > 0 || cat.id === 'high-risk');
}

// ─── Dev-mode validation ─────────────────────────────────────────────────────
// Catches common mistakes when adding new jobs (missing fields, duplicate IDs).

function validateRegistry(jobs: readonly RenovationJob[]): void {
  const ids = new Set<string>();
  for (const job of jobs) {
    if (ids.has(job.id)) {
      console.warn(`[JobRegistry] Duplicate job id: "${job.id}"`);
    }
    ids.add(job.id);

    if (!job.name || !job.categoryId) {
      console.warn(`[JobRegistry] Job "${job.id}" is missing name or categoryId`);
    }
    if (!job.description) {
      console.warn(`[JobRegistry] Job "${job.id}" has no description`);
    }
    if (!job.instructions || job.instructions.length === 0) {
      console.warn(`[JobRegistry] Job "${job.id}" has no instructions`);
    }
    if (!job.materials || job.materials.length === 0) {
      console.warn(`[JobRegistry] Job "${job.id}" has no materials — intentional?`);
    }
    if (!job.measurementInputs || job.measurementInputs.length === 0) {
      console.warn(`[JobRegistry] Job "${job.id}" has no measurementInputs`);
    }
    if (job.estimatedDays <= 0) {
      console.warn(`[JobRegistry] Job "${job.id}" has invalid estimatedDays: ${job.estimatedDays}`);
    }

    const catExists = CATEGORY_META.some((c) => c.id === job.categoryId);
    if (!catExists) {
      console.warn(`[JobRegistry] Job "${job.id}" references unknown category "${job.categoryId}"`);
    }

    const stepNumbers = job.instructions.map((s) => s.step);
    if (new Set(stepNumbers).size !== stepNumbers.length) {
      console.warn(`[JobRegistry] Job "${job.id}" has duplicate step numbers in instructions`);
    }

    const matIds = job.materials.map((m) => m.id);
    if (new Set(matIds).size !== matIds.length) {
      console.warn(`[JobRegistry] Job "${job.id}" has duplicate material ids`);
    }

    const toolIds = job.tools.map((t) => t.id);
    if (new Set(toolIds).size !== toolIds.length) {
      console.warn(`[JobRegistry] Job "${job.id}" has duplicate tool ids`);
    }
  }
}

if (__DEV__) {
  validateRegistry(JOB_REGISTRY);
}

// ─── Singletons ───────────────────────────────────────────────────────────────

export const ALL_JOBS: readonly RenovationJob[] = JOB_REGISTRY;
export const CATEGORIES: readonly RenovationCategory[] = Object.freeze(buildCategories());

// ─── Query helpers ────────────────────────────────────────────────────────────

const JOB_BY_ID = new Map<string, RenovationJob>(
  JOB_REGISTRY.map((j) => [j.id, j])
);

const JOBS_BY_CATEGORY = new Map<string, RenovationJob[]>();
for (const job of JOB_REGISTRY) {
  const list = JOBS_BY_CATEGORY.get(job.categoryId) ?? [];
  list.push(job);
  JOBS_BY_CATEGORY.set(job.categoryId, list);
}

export function getJobById(id: string): RenovationJob | undefined {
  return JOB_BY_ID.get(id);
}

export function getJobsByCategory(categoryId: string): RenovationJob[] {
  return JOBS_BY_CATEGORY.get(categoryId) ?? [];
}

export function searchJobs(query: string): RenovationJob[] {
  const q = query.toLowerCase();
  return JOB_REGISTRY.filter(
    (j) =>
      j.name.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q) ||
      j.tags?.some((t) => t.toLowerCase().includes(q))
  );
}

export function getCategoryById(id: string): RenovationCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
