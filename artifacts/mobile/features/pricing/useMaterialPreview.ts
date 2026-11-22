import {useEffect,useState} from 'react';
import type {CalculationResult} from '@/types/domain';
import type {QualityTier} from '@/types/pricing';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {getProductPhoto} from '@/data/products/photos';
import {toPricingStageInput,type PricingMaterialInput,type PricingStageInput} from './pricingApi';
import {projectQualityTier} from './projectQuality';
import {readSelectedStage} from './readProductSelections';
import {useDoorSelection} from './useDoorSelection';

export function pricingProductPhoto(product:PricingMaterialInput):string|undefined {
  const direct=getProductPhoto(product);
  if(direct || product.ean || product.gtin)return direct;
  const references=MATERIAL_PRICES.filter(ref=>ref.productLabel===product.name&&ref.materialType===product.category&&ref.packageUnit===product.unit);
  return references.length===1?getProductPhoto(references[0]):undefined;
}

/** A read-only model preview shared by requirements and the saved shopping list. */
export function useMaterialPreview(projectId:string,calc:CalculationResult|undefined,tier:QualityTier){
  const doors=useDoorSelection(projectId,calc);
  const [selected,setSelected]=useState<{scope:string;stage:PricingStageInput}|null>(null);
  const [failed,setFailed]=useState(false);
  const scope=JSON.stringify([projectId,calc,tier,doors.selection,doors.ready,doors.readFailed]);
  useEffect(()=>{
    let active=true;setSelected(null);setFailed(false);
    if(!calc || !doors.ready || doors.readFailed)return;
    readSelectedStage(projectId,toPricingStageInput(calc,projectQualityTier(calc,tier),doors.selection))
      .then(stage=>{if(active)setSelected({scope,stage});}).catch(()=>{if(active)setFailed(true);});
    return()=>{active=false;};
  },[scope]);
  return {stage:selected?.scope===scope?selected.stage:null,failed:failed||doors.readFailed};
}
