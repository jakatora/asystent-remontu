import { createProductChoiceGroup, type ProductChoice } from './productChoice';

export const FOIL_CHOICE_PREFIX = 'remont.foil-choice.v1:';
// Different thickness, tolerances and roll sizes require the user's choice.
// source: https://www.castorama.pl/folia-paroizolacyjna-diall-20-m2/5059340141428_CAPL.prd
// source: https://conkret.com.pl/conkret-products/folia-budowlana-conpar/
// source: https://parotec.pl/product-pol-18078-Folia-paroizolacyjna-zolta-CONPAR-0-2-mm-T30.html
// source: https://ebardo.pl/pl/p/Folia-paroizolacyjna-Ecovil-0%2C2mm-2mx50m-100m2/534
const group = createProductChoiceGroup(['mat-vapor-foil-diall-pe-20m2', 'mat-vapor-foil-conkret-conpar-100m2', 'mat-vapor-foil-conkret-ecovil-p-100m2', 'mat-vapor-foil-arbiton-aquaprotec-10m2'], 'vapor-barrier', 'm2');
export const FOIL_PRODUCTS = group.products;
export type FoilChoice = ProductChoice;
export const parseFoilChoices = group.parse;
export const foilReference = group.reference;
export const foilRequirements = group.requirements;
export const applyFoilChoices = group.apply;
