import {MAPEGUM_WPS_FAMILY,REVIEWED_PACKAGE_FAMILIES} from '../../../../lib/pricing-service/src/reviewed-package-families';
import {createPackageChoiceModel,type PackageChoice} from './packageChoiceModel';
export const MAPEGUM_PACKAGE_CHOICE_PREFIX='remont.mapegum-package-choice.v1:';
export type MapegumPackageChoice=PackageChoice;
const model=createPackageChoiceModel(REVIEWED_PACKAGE_FAMILIES.find(f=>f.key===MAPEGUM_WPS_FAMILY)!,'invalid_mapegum_package_choices');
export const MAPEGUM_PACKAGE_PRODUCTS=model.products,parseMapegumPackageChoices=model.parse,mapegumPackageReference=model.reference,mapegumPackageRequirements=model.requirements,applyMapegumPackageChoices=model.apply;
