import { createProductChoiceGroup, type ProductChoice } from './productChoice';

export const WASHBASIN_CHOICE_PREFIX = 'remont.washbasin-choice.v1:';
// Both use a standing tap, but are distinct basins with different dimensions
// and mounting accessories. Only an explicit choice changes the quoted SKU.
// source: https://www.grupapsb.com.pl/produkt/umywalka-facile-50-cm-cersanit-5907720650025.html
// source: https://www.castorama.pl/umywalka-cersanit-atlantic-new-50-cm/5901771226987_CAPL.prd
// source: https://www.cersanit.com.pl/lazienka/umywalka-wiszaca-ovida-50,3252.html
const group = createProductChoiceGroup(['mat-washbasin-cersanit-facile-50', 'mat-washbasin-cersanit-atlantic-new-50'], 'washbasin', 'szt');
export const WASHBASIN_PRODUCTS = group.products;
export type WashbasinChoice = ProductChoice;
export const parseWashbasinChoices = group.parse;
export const washbasinReference = group.reference;
export const washbasinRequirements = group.requirements;
export const applyWashbasinChoices = group.apply;
