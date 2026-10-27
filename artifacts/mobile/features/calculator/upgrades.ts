import type { CalculationResult, Project, ShoppingItem } from '@/types/domain';
import { upgradeEpsCalculation, upgradeEpsProject, projectEpsShopping } from './eps';
import { upgradeSinkCalculation, upgradeSinkProject, projectSinkShopping } from './sink';
import { upgradeRepaintCalculation, upgradeRepaintProject } from './repaint';
import { upgradeCeilingCalculation, upgradeCeilingProject, projectCeilingShopping } from './ceilingPrimer';
import { reviewHistoricalSubstratePrimer, reviewSubstrateProject, reviewSubstrateShopping } from './substratePrimer';
import { reviewHistoricalLevelingTape, reviewLevelingTapeProject } from './levelingTape';

export const upgradeCalculation = (calc: CalculationResult | undefined) => reviewHistoricalLevelingTape(reviewHistoricalSubstratePrimer(upgradeCeilingCalculation(upgradeRepaintCalculation(upgradeSinkCalculation(upgradeEpsCalculation(calc))))));
export const upgradeProject = (project: Project) => reviewLevelingTapeProject(reviewSubstrateProject(upgradeCeilingProject(upgradeRepaintProject(upgradeSinkProject(upgradeEpsProject(project))))));
export const projectShopping = (items: readonly ShoppingItem[], calc?: CalculationResult) => reviewSubstrateShopping(projectCeilingShopping(projectSinkShopping(projectEpsShopping(items, calc), calc),calc),calc);
