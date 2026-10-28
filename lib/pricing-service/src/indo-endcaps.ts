/** One sealed EAN contains one left and one right INDO ending. */
// source: https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/zakonczenie-l-p-indo-bialy-polysk-1-arbiton
export const INDO_ENDCAP_EAN='5905167726358';
export interface IndoEndcapDemand {version:1;left:number;right:number;}
export interface IndoEndcapPlan {left:number;right:number;pairs:number;additionalPairs:number;savedPairs:number;}
export function validIndoEndcapDemand(value:unknown):value is IndoEndcapDemand {
 const p=value as IndoEndcapDemand|undefined;
 return p?.version===1&&[p.left,p.right].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=200);
}
export function confirmedIndoEndcapDemand(ean:string|null|undefined,unit:string|null,pack:number,quantity:number,value:unknown):IndoEndcapDemand|null {
 return ean===INDO_ENDCAP_EAN&&unit==='kpl'&&pack===1&&validIndoEndcapDemand(value)&&quantity===Math.max(value.left,value.right)?{...value}:null;
}
