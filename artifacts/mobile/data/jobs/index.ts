import { RenovationJob } from '@/types/renovation';
import { paintJob, paintCeilingJob } from './paint';
import { primerJob, wallRepairJob, skimCoatJob } from './walls';
import { laminateJob, vinylJob, floorTilesJob } from './flooring';
import { waterproofingJob, siliconeJob } from './bathroom';
import { wallpaperJob, skirtingJob, doorsJob } from './finishing';
import { minorPlumbingJob, electricalOverviewJob, highRiskJob } from './risky';

export const ALL_JOBS: RenovationJob[] = [
  paintJob,
  paintCeilingJob,
  primerJob,
  wallRepairJob,
  skimCoatJob,
  wallpaperJob,
  laminateJob,
  vinylJob,
  floorTilesJob,
  waterproofingJob,
  siliconeJob,
  skirtingJob,
  doorsJob,
  minorPlumbingJob,
  electricalOverviewJob,
  highRiskJob,
];

export function getJobsByCategory(categoryId: string): RenovationJob[] {
  return ALL_JOBS.filter((j) => j.categoryId === categoryId);
}

export function getJobById(id: string): RenovationJob | undefined {
  return ALL_JOBS.find((j) => j.id === id);
}
