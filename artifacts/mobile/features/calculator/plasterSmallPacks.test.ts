import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {PLASTER_JOB,PLASTER_MODEL,plasterReference,plasterQuantity,plasterInputs} from './plastering';
import {generateShoppingItems} from './shopping';
import {projectShopping} from './upgrades';
const job=getJobById(PLASTER_JOB)!,base={wallArea:1,plasterThickness:15,plasterFinish:0,plasterReservePercent:10,plasterPrimerChoice:1,plasterMeshChoice:1,plasterMeshArea:1,plasterCornerFit:1,plasterCornerCount:1};
const calc=(plasterSystem:number,patch:Record<string,number>={})=>calculatorEngine.calculate(job,{...base,plasterSystem,...patch});

test('Goldband 5 and 10 kg keep exact factory barcodes and all four required plastering materials',()=>{
 for(const [choice,ean,size]of [[6,'5901793354729',5],[7,'5901793351162',10]] as const){const c=calc(choice),input=toPricingStageInput(c),l=input.materials.find(l=>l.material.id==='plaster-base')!;assert.equal(c.quantityModel,PLASTER_MODEL);assert.equal(input.materials.length,4);assert.equal(l.quantity,14.3);assert.equal(l.material.ean,ean);assert.equal(l.material.unit,'kg');assert.equal(c.materials.find(l=>l.material.id==='plaster-base')!.material.packaging?.size,size);assert.equal(input.materials.find(l=>l.material.id==='plaster-primer')!.quantity,0.2475);assert.equal(input.materials.find(l=>l.material.id==='plaster-mesh')!.quantity,1.1);assert.equal(input.materials.find(l=>l.material.id==='plaster-corner')!.quantity,2.5);}
});

test('a small work keeps the same raw kilograms before package rounding and does not infer accessories from zero',()=>{
 for(const choice of [6,7]){const c=calc(choice,{plasterThickness:8,plasterMeshArea:0,plasterCornerCount:0}),input=toPricingStageInput(c);assert.equal(input.materials.length,2);assert.equal(input.materials.find(l=>l.material.id==='plaster-base')!.quantity,7.62666667);assert.equal(plasterQuantity('plaster-base',c.measurements),7.62666667);}
 const options=plasterInputs.find(i=>i.id==='plasterSystem')!;assert.equal(options.max,7);assert(options.options?.some(o=>o.value===6&&o.label.includes('5 kg')));assert(options.options?.some(o=>o.value===7&&o.label.includes('10 kg')));
});

test('five saved plaster choices retain their original references and the quantity model is unchanged',()=>{
 const references=['mat-plaster-gypsum-machine-knauf-mp75-25kg','mat-plaster-gypsum-manual-knauf-goldband-25kg','mat-plaster-cementlime-baumit-mpi25-30kg','mat-plaster-knauf-mp75l-30kg','mat-plaster-knauf-goldband-30kg'];for(const [index,id]of references.entries()){assert.equal(plasterReference('plaster-base',{plasterSystem:index+1}),id);const c=calc(index+1);assert.equal(c.measurements.plasterSystem,index+1);assert.deepEqual(toPricingStageInput(JSON.parse(JSON.stringify(c))),toPricingStageInput(c));}assert.equal(PLASTER_MODEL,'wall-plastering-v2');
});

test('small bags preserve substrate and thickness gates instead of making an incomplete system buyable',()=>{
 for(const choice of [6,7]){assert.equal(plasterQuantity('plaster-base',{...base,plasterSystem:choice,plasterThickness:7}),null);assert.equal(plasterQuantity('plaster-base',{...base,plasterSystem:choice,plasterThickness:10}),null);assert.equal(plasterReference('plaster-primer',{plasterSystem:choice,plasterPrimerChoice:0}),null);assert.equal(plasterReference('plaster-primer',{plasterSystem:choice,plasterPrimerChoice:3}),'mat-plaster-primer-knauf-grundiermittel60-15kg');assert(toPricingStageInput(calc(choice,{plasterPrimerChoice:0})).materials.some(l=>l.material.unit==='pozycja'));}
});

test('changing the small bag requires confirming owned stock again',()=>{
 const old=calc(6),next=calc(7),items=generateShoppingItems('small-bags',old).map((item,i)=>({...item,id:'owned-'+i,owned:true,purchased:true,needsQuantityConfirmation:false})),result=projectShopping(items,next),plaster=result.find(i=>i.materialId==='plaster-base')!;assert.equal(plaster.owned,false);assert.equal(plaster.purchased,false);assert.equal(plaster.needsQuantityConfirmation,true);assert.equal(next.measurements.plasterSystem,7);
});
