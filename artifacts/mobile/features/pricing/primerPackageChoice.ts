import {PRIMER_G_PRO_FAMILY,REVIEWED_PACKAGE_FAMILIES} from '../../../../lib/pricing-service/src/reviewed-package-families';
import {createPackageChoiceModel,type PackageChoice} from './packageChoiceModel';
export const PRIMER_PACKAGE_CHOICE_PREFIX='remont.primer-package-choice.v1:';
export type PrimerPackageChoice=PackageChoice;
const model=createPackageChoiceModel(REVIEWED_PACKAGE_FAMILIES.find(f=>f.key===PRIMER_G_PRO_FAMILY)!,'invalid_primer_package_choices');
export const PRIMER_PACKAGE_PRODUCTS=model.products,parsePrimerPackageChoices=model.parse,primerPackageReference=model.reference,primerPackageRequirements=model.requirements,applyPrimerPackageChoices=model.apply;
