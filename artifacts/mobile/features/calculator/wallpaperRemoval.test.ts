import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {removalQuantity,REMOVAL_MODEL} from './wallpaperRemoval';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {resolveMaterialQuantity} from '@/features/pricing/quantity';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {upgradeCalculation,projectShopping} from './upgrades';
import type {ShoppingItem} from '@/types/domain';
const calc=(extra:Record<string,number>={})=>calculatorEngine.calculate(getJobById('wallpaper-remove')!,{wallArea:50,removalRepairKg:2,removalFilmArea:25,...extra});

test('the500ml bottle allowance includes wallpaper type, real applications and an explicit reserve',()=>{
 assert.equal(removalQuantity('wallpaper-remover',{wallArea:50}),137.5);
 assert.equal(removalQuantity('wallpaper-remover',{wallArea:50,removalWallpaperType:1}),275);
 assert.equal(removalQuantity('wallpaper-remover',{wallArea:50,removalWallpaperType:2}),550);
 assert.equal(removalQuantity('wallpaper-remover',{wallArea:50,removalWallpaperType:2,removalApplications:1,removalReservePercent:0}),250);
 const invalid:Record<string,number>[]=[{wallArea:0},{wallArea:501},{wallArea:50,removalWallpaperType:9},{wallArea:50,removalApplications:0.5},{wallArea:50,removalReservePercent:-1}];
 for(const m of invalid)assert.equal(removalQuantity('wallpaper-remover',m),null);
});
test('real quantities and identities reach the basket rather than rounded bottles or constant2kg repairs',()=>{
 const c=calc(),r=c.materials.find(l=>l.material.id==='wallpaper-remover')!,film=c.materials.find(l=>l.material.id==='removal-film')!;
 assert.equal(c.quantityModel,REMOVAL_MODEL);assert.equal(c.materials.length,4);assert.ok(c.materials.every(l=>!('formula'in l.material)));
 assert.equal(r.rawQuantity,137.5);assert.equal(r.packs,1);assert.equal(r.material.packaging?.size,500);assert.equal(film.rawQuantity,25);assert.equal(film.packs,2);
 for(const tier of ['economy','standard','better'] as const)for(const ref of getMaterialsForJob(c.jobId,tier,c.measurements)){const q=resolveMaterialQuantity(ref,c);assert.ok(q,ref.id);assert.equal(q.quantity,q.source.rawQuantity);}
 const stage=toPricingStageInput(c);assert.equal(stage.materials.find(l=>l.material.id==='wallpaper-remover')!.quantity,137.5);assert.equal(stage.materials.find(l=>l.material.id==='removal-film')!.quantity,25);
});
test('unknown repairs and protection remain visible; deliberate zeros omit purchases',()=>{
 const missing=calc({removalRepairKg:NaN,removalFilmArea:NaN});assert.equal(missing.materials.find(l=>l.material.id==='filler-after')!.quantityKnown,false);assert.equal(missing.materials.find(l=>l.material.id==='removal-film')!.quantityKnown,false);
 assert.ok(missing.warnings.some(w=>w.message.startsWith('Niepełna wycena: 2')));
 const c=calc({removalRepairKg:0,removalFilmArea:0}),stage=toPricingStageInput(c);assert.ok(!stage.materials.some(l=>['filler-after','removal-film'].includes(l.material.id)));
 assert.equal(removalQuantity('filler-after',{wallArea:10,removalRepairKg:2,removalRepairPackKg:7}),null);
});
test('historical snapshots are read only and cannot silently retain owned litres as the new concentrate',()=>{
 const c=calc(),old={...c,quantityModel:'substrate-primer-v1',materials:c.materials.filter(l=>l.material.id!=='removal-film').map(l=>l.material.id==='wallpaper-remover'?{...l,material:{...l.material,ean:undefined,unit:'litr',name:'Środek do usuwania tapet (koncentrat)'}}:l)},before=JSON.stringify(old),review=upgradeCalculation(old)!;
 assert.equal(JSON.stringify(old),before);assert.equal(review.materials.find(l=>l.material.id==='wallpaper-remover')!.quantityKnown,false);assert.equal(review.materials.find(l=>l.material.id==='removal-film')!.quantityKnown,false);
 const item:ShoppingItem={id:'x',projectId:'p',materialId:'wallpaper-remover',name:'Środek do usuwania tapet (koncentrat)',unit:'litr',quantity:1,estimatedPrice:35,owned:true,purchased:true,itemType:'material',tier:'standard',createdAt:''};assert.equal(projectShopping([item],c)[0].owned,false);assert.equal(projectShopping([item],c)[0].purchased,false);
 assert.equal(calc({removalRepairPackKg:20}).materials.find(l=>l.material.id==='filler-after')!.material.packaging?.size,20);
});
