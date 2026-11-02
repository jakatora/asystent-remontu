import type {estimateProject,PricingOptions,PricingStageInput} from './pricingApi';
import {estimateHonoursStore} from './storeChoice';

/** One request on the current API. The bounded fallback preserves the store
 * picker when an older server ignores the optional comparison capability. */
export async function estimateStoreSelection(
  stages:readonly PricingStageInput[],options:PricingOptions,includeStoreChoices:boolean,
  active:()=>boolean,estimate:typeof estimateProject,
){
  const needsChoices=Boolean(options.store&&includeStoreChoices);
  const data=await estimate(stages,{...options,...(needsChoices?{includeStoreChoices:true}:{})});
  if(!active())return null;
  if(options.store&&!estimateHonoursStore(data,options.store))throw Error('store_selection_not_confirmed');
  let choiceSource=!options.store||needsChoices&&data.storeChoiceComparison?data:undefined;
  if(needsChoices&&!data.storeChoiceComparison){
    choiceSource=await estimate(stages,{region:options.region,delivery:options.delivery,refreshPrices:false});
    if(!active())return null;
  }
  return{data,choiceSource};
}
