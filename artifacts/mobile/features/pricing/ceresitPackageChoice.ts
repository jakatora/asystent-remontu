import {CT17_PROFI_FAMILY,CT17_TRANSPARENT_FAMILY,REVIEWED_PACKAGE_FAMILIES} from '../../../../lib/pricing-service/src/reviewed-package-families';
import {createPackageChoiceModel,type PackageChoice} from './packageChoiceModel';
import type {PricingStageInput} from './pricingApi';

export const CERESIT_PACKAGE_CHOICE_PREFIX='remont.ceresit-package-choice.v1:';
export type CeresitPackageChoice=PackageChoice;
const invalid='invalid_ceresit_package_choices';
const models=[CT17_PROFI_FAMILY,CT17_TRANSPARENT_FAMILY].map(key=>createPackageChoiceModel(REVIEWED_PACKAGE_FAMILIES.find(f=>f.key===key)!,invalid));
export const CERESIT_PACKAGE_PRODUCTS=models.flatMap(model=>model.products);

/** Both reviewed families share persistence, never a product family or demand.
 * Unknown identities and a corrupt row must stop the entire saved choice. */
export function parseCeresitPackageChoices(raw:string|null):CeresitPackageChoice[]{
  if(raw===null)return [];
  if(raw.length>8000)throw Error(invalid);
  const saved=JSON.parse(raw);
  if(saved?.version!==1||Object.keys(saved).sort().join(',')!=='choices,version'||!Array.isArray(saved.choices)||saved.choices.length>CERESIT_PACKAGE_PRODUCTS.length)throw Error(invalid);
  const parsed=models.flatMap(model=>model.parse(JSON.stringify({version:1,choices:saved.choices.filter((row:PackageChoice)=>model.products.some(ref=>ref.id===row?.from))})));
  if(parsed.length!==saved.choices.length)throw Error(invalid);
  return saved.choices.map((row:PackageChoice)=>parsed.find(choice=>choice.from===row.from)!);
}
export const ceresitPackageRequirements=(stages:readonly PricingStageInput[])=>models.flatMap(model=>model.requirements(stages));
export function applyCeresitPackageChoices(stages:readonly PricingStageInput[],choices:readonly CeresitPackageChoice[]):PricingStageInput[]{
  const valid=parseCeresitPackageChoices(JSON.stringify({version:1,choices}));
  return models.reduce((selected,model)=>model.apply(selected,valid.filter(choice=>model.products.some(ref=>ref.id===choice.from))),[...stages]);
}
