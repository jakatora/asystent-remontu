import type {Product} from '@workspace/db/schema';
import type {PackagePlan,PackagePlanEntry,PurchaseOffer} from './types';
import {parsePriceToGrosze} from '../../price-collector/src/normalize';

export interface CutRollDemand {
  version:1;
  widthMm:2000|4000;
  cuts:{id:string;lengthMm:number}[];
}
export interface CutRollPurchase {
  widthMm:number;
  lengthMm:number;
  pricePerM2Grosze:number;
  cutLengthsMm?:number[];
}
export const ORION_ROLLS = [
  {id:'remont-sku-ewinyl-5329-2m',widthMm:2000,name:'Wykładzina PCV Lentex Orion 514-05 — szerokość 2 m'},
  {id:'remont-sku-ewinyl-5329-4m',widthMm:4000,name:'Wykładzina PCV Lentex Orion 514-05 — szerokość 4 m'},
] as const;
export function reviewedCutRoll(product:Pick<Product,'id'|'name'|'ean'|'gtin'|'brand'|'category'|'packageUnit'|'packageSize'>){
  const spec=ORION_ROLLS.find(row=>row.id===product.id);
  return spec&&product.name===spec.name&&!product.ean&&!product.gtin&&product.brand==='Lentex'&&product.category==='vinyl-roll'&&product.packageUnit==='m2'&&Number(product.packageSize)===1?spec:null;
}
/** Lengths describe full-width cuts, never a flat floor area with guessed waste.
 * Source: https://ewinyl.pl/produkt/orion-514-05-wykladzina-winylowy-3m-4m/
 * Each cut is bought to a whole centimetre; stock-length limits are conservative
 * application bounds, not a promise of merchant stock or a universal roll size. */
export function validCutRollDemand(value:CutRollDemand|undefined):value is CutRollDemand {
  return value?.version===1&&[2000,4000].includes(value.widthMm)&&Array.isArray(value.cuts)&&value.cuts.length>0&&value.cuts.length<=100
    &&value.cuts.every(c=>typeof c.id==='string'&&c.id.length>0&&c.id.length<=200&&Number.isSafeInteger(c.lengthMm)&&c.lengthMm>=100&&c.lengthMm<=25000&&c.lengthMm%10===0)
    &&new Set(value.cuts.map(c=>c.id)).size===value.cuts.length;
}
export function cutRollArea(demand:CutRollDemand):number|null {
  return validCutRollDemand(demand)?demand.widthMm*demand.cuts.reduce((n,c)=>n+c.lengthMm,0)/1_000_000:null;
}
/** Round the WHOLE cut once, using integer square millimetres and grosze. */
export function cutRollCost(widthMm:number,lengthMm:number,pricePerM2Grosze:number):number|null {
  if(![2000,4000].includes(widthMm)||!Number.isSafeInteger(lengthMm)||lengthMm<100||lengthMm>25000||lengthMm%10!==0||!Number.isSafeInteger(pricePerM2Grosze)||pricePerM2Grosze<1)return null;
  const value=(BigInt(widthMm)*BigInt(lengthMm)*BigInt(pricePerM2Grosze)+500000n)/1000000n;
  return value<=BigInt(Number.MAX_SAFE_INTEGER)?Number(value):null;
}
/** Preserve room cuts while buying continuous pieces that can be cut at home.
 * No leftover is assumed reusable across a width, colour or different product.
 * The bounded packing is feasible, not a claim of globally optimal packing. */
function cutRollPurchaseBins(demand:CutRollDemand):{lengthMm:number;cuts:number[]}[]|null {
  if(!validCutRollDemand(demand))return null;
  const bins:{lengthMm:number;cuts:number[]}[]=[];
  for(const {lengthMm}of [...demand.cuts].sort((a,b)=>b.lengthMm-a.lengthMm)){
    let at=-1;
    for(let i=0;i<bins.length;i++)if(bins[i].lengthMm+lengthMm<=25000&&(at<0||bins[i].lengthMm>bins[at].lengthMm))at=i;
    if(at<0)bins.push({lengthMm,cuts:[lengthMm]});else{bins[at].lengthMm+=lengthMm;bins[at].cuts.push(lengthMm);}
  }
  return bins.sort((a,b)=>b.lengthMm-a.lengthMm);
}
export function cutRollPurchaseLengths(demand:CutRollDemand):number[]|null{return cutRollPurchaseBins(demand)?.map(b=>b.lengthMm)??null;}
export function cutRollPackagePlan(product:Product,demand:CutRollDemand|undefined,quantity:number,offers:readonly PurchaseOffer[]):PackagePlan|null {
  const spec=reviewedCutRoll(product),area=demand&&cutRollArea(demand),lengths=demand&&cutRollPurchaseBins(demand);
  if(!spec||!demand||spec.widthMm!==demand.widthMm||area===null||area===undefined||!lengths||!Number.isFinite(quantity)||Math.abs(quantity-area)>1e-8)return null;
  let best:PackagePlan|null=null;
  for(const offer of offers){
    const price=parsePriceToGrosze(offer.promoPrice??offer.price);
    if(price===null||price<1||offer.store!=='eWinyl'||offer.id!==`ewinyl-orion514-${spec.widthMm/1000}m`||offer.productId!==product.id||(offer.purchaseMultiple??1)!==1||(offer.minimumPackages??1)!==1)continue;
    const packs:PackagePlanEntry[]=lengths.map(({lengthMm,cuts})=>({product,packageSize:spec.widthMm*lengthMm/1_000_000,count:1,unitPriceGrosze:cutRollCost(spec.widthMm,lengthMm,price)!,lineCostGrosze:cutRollCost(spec.widthMm,lengthMm,price)!,store:offer.store,url:offer.productUrl,offerId:offer.id,cutRoll:{widthMm:spec.widthMm,lengthMm,pricePerM2Grosze:price,cutLengthsMm:cuts}}));
    if(packs.some(p=>p.unitPriceGrosze===null))continue;
    const total=packs.reduce((n,p)=>n+p.lineCostGrosze,0);
    if(!Number.isSafeInteger(total))continue;
    const plan={packages:packs,totalGrosze:total,requiredQuantity:area,coveredQuantity:area,overage:0};
    if(!best||total<best.totalGrosze)best=plan;
  }
  return best;
}
