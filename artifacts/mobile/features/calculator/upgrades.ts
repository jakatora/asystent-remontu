import type { CalculationResult, Project, ShoppingItem } from '@/types/domain';
import { upgradeEpsCalculation, upgradeEpsProject, projectEpsShopping } from './eps';
import { upgradeSinkCalculation, upgradeSinkProject, projectSinkShopping } from './sink';
import { upgradeRepaintCalculation, upgradeRepaintProject } from './repaint';
import { upgradeCeilingCalculation, upgradeCeilingProject, projectCeilingShopping } from './ceilingPrimer';

export const upgradeCalculation = (calc: CalculationResult | undefined) => upgradeCeilingCalculation(upgradeRepaintCalculation(upgradeSinkCalculation(upgradeEpsCalculation(calc))));
export const upgradeProject = (project: Project) => upgradeCeilingProject(upgradeRepaintProject(upgradeSinkProject(upgradeEpsProject(project))));
export const projectShopping = (items: readonly ShoppingItem[], calc?: CalculationResult) => projectCeilingShopping(projectSinkShopping(projectEpsShopping(items, calc), calc),calc);
