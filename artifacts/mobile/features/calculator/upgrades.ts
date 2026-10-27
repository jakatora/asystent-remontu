import { reviewRemovalCalculation, reviewRemovalProject, reviewRemovalShopping } from './wallpaperRemoval';
import { reviewWallpaperAdhesiveCalculation, reviewWallpaperAdhesiveProject, reviewWallpaperAdhesiveShopping } from './wallpaperAdhesive';
import { reviewWallpaperTapeCalculation, reviewWallpaperTapeProject, reviewWallpaperTapeShopping } from './wallpaperTape';
import { reviewGypsumCalculation, reviewGypsumProject, reviewGypsumShopping } from './gypsumBoard';
import { reviewFrameCalculation, reviewFrameProject, reviewFrameShopping } from './framePainting';
import { reviewFinishingCalculation, reviewFinishingProject, reviewFinishingShopping } from './wallFinishing';
import type { CalculationResult, Project, ShoppingItem } from '@/types/domain';
import { upgradeEpsCalculation, upgradeEpsProject, projectEpsShopping } from './eps';
import { upgradeSinkCalculation, upgradeSinkProject, projectSinkShopping } from './sink';
import { upgradeRepaintCalculation, upgradeRepaintProject } from './repaint';
import { upgradeCeilingCalculation, upgradeCeilingProject, projectCeilingShopping } from './ceilingPrimer';
import { reviewHistoricalSubstratePrimer, reviewSubstrateProject, reviewSubstrateShopping } from './substratePrimer';
import { reviewHistoricalLevelingTape, reviewLevelingTapeProject } from './levelingTape';
import { reviewSanitaryCalculation, reviewSanitaryProject, reviewSanitaryShopping } from './sanitarySealant';
import { reviewLaminateCalculation, reviewLaminateProject, reviewLaminateShopping } from './laminateSupplies';

const upgradePreviousCalculation = (calc: CalculationResult | undefined) => reviewRemovalCalculation(reviewGypsumCalculation(reviewFrameCalculation(reviewFinishingCalculation(reviewSanitaryCalculation(reviewHistoricalLevelingTape(reviewHistoricalSubstratePrimer(upgradeCeilingCalculation(upgradeRepaintCalculation(upgradeSinkCalculation(upgradeEpsCalculation(calc)))))))))));
const upgradePreviousProject = (project: Project) => reviewRemovalProject(reviewGypsumProject(reviewFrameProject(reviewFinishingProject(reviewSanitaryProject(reviewLevelingTapeProject(reviewSubstrateProject(upgradeCeilingProject(upgradeRepaintProject(upgradeSinkProject(upgradeEpsProject(project)))))))))));
export const upgradeCalculation = (calc: CalculationResult | undefined) => reviewWallpaperTapeCalculation(reviewWallpaperAdhesiveCalculation(reviewLaminateCalculation(upgradePreviousCalculation(calc))));
export const upgradeProject = (project: Project) => reviewWallpaperTapeProject(reviewWallpaperAdhesiveProject(reviewLaminateProject(upgradePreviousProject(project))));
export const projectShopping = (items: readonly ShoppingItem[], calc?: CalculationResult) => {
  const previous = reviewFinishingShopping(reviewSanitaryShopping(reviewSubstrateShopping(projectCeilingShopping(projectSinkShopping(projectEpsShopping(items, calc), calc),calc),calc),calc),calc);
  return reviewWallpaperTapeShopping(reviewWallpaperAdhesiveShopping(reviewLaminateShopping(reviewRemovalShopping(reviewGypsumShopping(reviewFrameShopping(previous,calc),calc),calc),calc),calc),calc);
};
