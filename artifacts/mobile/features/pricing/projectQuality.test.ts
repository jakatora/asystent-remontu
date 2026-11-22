import assert from 'node:assert/strict';
import {test} from 'node:test';
import {projectQualityTier,wizardQualityTier} from './projectQuality';
import {calculatorEngine} from '@/features/calculator/engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from './pricingApi';
import {buildRenovationBasket} from './renovationBasket';
import type {Project} from '@/types/domain';

test('wizard level changes the actual quoted models and survives saved calculation hydration',()=>{
  const base=calculatorEngine.calculate(getJobById('paint-walls')!,{wallArea:40,coats:2,coveragePerLiter:10,tapeRolls:1,protectiveFilmPacks:1});
  const economy=JSON.parse(JSON.stringify({...base,pricingQualityTier:wizardQualityTier('economy')}));
  const premium=JSON.parse(JSON.stringify({...base,pricingQualityTier:wizardQualityTier('premium')}));
  const a=toPricingStageInput(economy,projectQualityTier(economy,'better'));
  const b=toPricingStageInput(premium,projectQualityTier(premium,'economy'));
  assert.notDeepEqual(a.materials,b.materials);
  const projects=[economy,premium].map((calc,index)=>({id:String(index),name:String(index),jobId:calc.jobId,jobName:'Malowanie',categoryId:'paint',measurements:calc.measurements,calculationResult:calc,status:'planning',createdAt:'',updatedAt:''} as Project));
  const basket=buildRenovationBasket(projects,['0','1'],'standard');
  assert.deepEqual(basket.selectionStages[0].materials,a.materials);
  assert.deepEqual(basket.selectionStages[1].materials,b.materials);
});
test('historical projects keep the chosen fallback and invalid saved tiers cannot enter requests',()=>{
  assert.equal(projectQualityTier(undefined,'economy'),'economy');
  assert.equal(projectQualityTier(undefined,'custom'),'standard');
  assert.equal(projectQualityTier({pricingQualityTier:'unexpected'} as any,'better'),'better');
  assert.equal(wizardQualityTier(null),'standard');
});
