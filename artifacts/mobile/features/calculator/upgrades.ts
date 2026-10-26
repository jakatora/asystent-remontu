import type { CalculationResult, Project, ShoppingItem } from '@/types/domain';
import { upgradeEpsCalculation, upgradeEpsProject, projectEpsShopping } from './eps';
import { upgradeSinkCalculation, upgradeSinkProject, projectSinkShopping } from './sink';

export const upgradeCalculation = (calc: CalculationResult | undefined) => upgradeSinkCalculation(upgradeEpsCalculation(calc));
export const upgradeProject = (project: Project) => upgradeSinkProject(upgradeEpsProject(project));
export const projectShopping = (items: readonly ShoppingItem[], calc?: CalculationResult) => projectSinkShopping(projectEpsShopping(items, calc), calc);
