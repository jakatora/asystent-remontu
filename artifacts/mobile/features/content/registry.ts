import type { RenovationJob, RenovationCategory } from '@/types/domain';

// ─── Job registry ─────────────────────────────────────────────────────────────
// Adding a new renovation type = one new job file + one entry here.
// No app screen changes needed.

import { paintJob, paintCeilingJob }                    from '@/data/jobs/paint';
import { primerJob, wallRepairJob, skimCoatJob }         from '@/data/jobs/walls';
import { laminateJob, vinylJob, floorTilesJob }          from '@/data/jobs/flooring';
import { waterproofingJob, siliconeJob }                 from '@/data/jobs/bathroom';
import { wallpaperJob, skirtingJob, doorsJob }           from '@/data/jobs/finishing';
import { minorPlumbingJob, electricalOverviewJob, highRiskJob } from '@/data/jobs/risky';
import { backsplashTilesJob, countertopInstallJob }      from '@/data/jobs/kitchen';
import { gypsumWallJob, gypsumCeilingJob }               from '@/data/jobs/gypsum';
import { windowSealingJob, windowsillJob }               from '@/data/jobs/windows';

// ─────────────────────────────────────────────────────────────────────────────
// THE SINGLE SOURCE OF TRUTH FOR ALL RENOVATION JOBS
// To add a new job: import it above and add it to this array.
// ─────────────────────────────────────────────────────────────────────────────

const JOB_REGISTRY: readonly RenovationJob[] = Object.freeze([
  // Painting
  paintJob,
  paintCeilingJob,
  // Walls
  primerJob,
  wallRepairJob,
  skimCoatJob,
  // Wallpaper & finishing
  wallpaperJob,
  skirtingJob,
  doorsJob,
  // Flooring
  laminateJob,
  vinylJob,
  floorTilesJob,
  // Bathroom
  waterproofingJob,
  siliconeJob,
  // Kitchen
  backsplashTilesJob,
  countertopInstallJob,
  // Gypsum / drywall
  gypsumWallJob,
  gypsumCeilingJob,
  // Windows
  windowSealingJob,
  windowsillJob,
  // Risky / specialist
  minorPlumbingJob,
  electricalOverviewJob,
  highRiskJob,
]);

// ─── Category metadata ────────────────────────────────────────────────────────
// jobCount is auto-computed from the registry — never goes stale.

import { Colors } from '@/constants/colors';

const CATEGORY_META: Omit<RenovationCategory, 'jobCount'>[] = [
  {
    id: 'paint',
    name: 'Malowanie',
    description: 'Malowanie ścian i sufitów',
    icon: 'droplet',
    color: Colors.categoryPaint,
  },
  {
    id: 'primer',
    name: 'Gruntowanie',
    description: 'Przygotowanie powierzchni pod malowanie',
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
    description: 'Naklejanie tapet na ściany',
    icon: 'image',
    color: Colors.categoryPaint,
  },
  {
    id: 'laminate',
    name: 'Panele podłogowe',
    description: 'Układanie paneli laminowanych',
    icon: 'grid',
    color: Colors.categoryFloor,
  },
  {
    id: 'vinyl',
    name: 'Panele winylowe',
    description: 'Układanie paneli winylowych LVT/SPC',
    icon: 'square',
    color: Colors.categoryFloor,
  },
  {
    id: 'floor-tiles',
    name: 'Płytki podłogowe',
    description: 'Układanie płytek ceramicznych',
    icon: 'grid',
    color: Colors.categoryFloor,
  },
  {
    id: 'waterproofing',
    name: 'Hydroizolacja łazienki',
    description: 'Uszczelnianie mokrych pomieszczeń',
    icon: 'shield',
    color: Colors.categoryBath,
  },
  {
    id: 'silicone',
    name: 'Silikonowanie',
    description: 'Uszczelnianie fug silikonem',
    icon: 'minus',
    color: Colors.categoryBath,
  },
  {
    id: 'kitchen-tiles',
    name: 'Kuchnia — płytki i blaty',
    description: 'Backsplash, blaty i wykończenie kuchni',
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
    description: 'Uszczelnianie okien i montaż parapetów',
    icon: 'wind',
    color: Colors.categoryWindows,
  },
  {
    id: 'skirting',
    name: 'Listwy przypodłogowe',
    description: 'Montaż listew przypodłogowych',
    icon: 'align-left',
    color: Colors.categoryDoors,
  },
  {
    id: 'doors',
    name: 'Drzwi i ościeżnice',
    description: 'Montaż drzwi wewnętrznych',
    icon: 'home',
    color: Colors.categoryDoors,
  },
  {
    id: 'plumbing',
    name: 'Prosta hydraulika',
    description: 'Wymiana kranów, uszczelek, syfonu',
    icon: 'droplet',
    color: Colors.categoryPlumbing,
  },
  {
    id: 'electrical',
    name: 'Instalacja elektryczna',
    description: 'Wymiana gniazdek i wyłączników',
    icon: 'zap',
    color: Colors.categoryElectric,
  },
  {
    id: 'high-risk',
    name: 'Prace niebezpieczne',
    description: 'Prąd, gaz, konstrukcja — tylko fachowiec',
    icon: 'alert-triangle',
    color: Colors.danger,
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
