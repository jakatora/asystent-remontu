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

export const upgradeCalculation = (calc: CalculationResult | undefined) => reviewGypsumCalculation(reviewFrameCalculation(reviewFinishingCalculation(reviewSanitaryCalculation(reviewHistoricalLevelingTape(reviewHistoricalSubstratePrimer(upgradeCeilingCalculation(upgradeRepaintCalculation(upgradeSinkCalculation(upgradeEpsCalculation(calc))))))))));
export const upgradeProject = (project: Project) => reviewGypsumProject(reviewFrameProject(reviewFinishingProject(reviewSanitaryProject(reviewLevelingTapeProject(reviewSubstrateProject(upgradeCeilingProject(upgradeRepaintProject(upgradeSinkProject(upgradeEpsProject(project))))))))));
export const projectShopping = (items: readonly ShoppingItem[], calc?: CalculationResult) => {
  const previous = reviewFinishingShopping(reviewSanitaryShopping(reviewSubstrateShopping(projectCeilingShopping(projectSinkShopping(projectEpsShopping(items, calc), calc),calc),calc),calc),calc);
  return reviewGypsumShopping(reviewFrameShopping(previous,calc),calc);
};
