import {parseCatalogAvailabilitySnapshot,type CatalogAvailabilitySnapshot} from './catalog-availability';

export type CatalogRefreshIdentity={category:string;packageSize:number;unit:string}&({ean:string;productId?:never}|{productId:string;ean?:never});
export interface CatalogProductRefresh{version:1;identity:CatalogRefreshIdentity;refresh:{status:'updated'|'recent';checkedAt:string|null;confirmedOfferIds:string[];failedOfferIds:string[];retryAfterSeconds:number};availability:CatalogAvailabilitySnapshot}
const text=(x:unknown,max=100):x is string=>typeof x==='string'&&x.trim()===x&&x.length>0&&x.length<=max&&!/[\u0000-\u001f]/.test(x);
const units:Readonly<Record<string,string>>={m:'m',mb:'m','m²':'m2',litr:'l',litry:'l','szt.':'szt'};
export const catalogRefreshUnit=(u:string)=>units[u]??u;

/** A pinned identity, never a client URL, search expression or typed price. */
export function parseCatalogRefreshIdentity(value:unknown):CatalogRefreshIdentity{
  const x=value as any;
  if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).some(k=>!['ean','productId','category','packageSize','unit'].includes(k))||Object.hasOwn(x,'ean')===Object.hasOwn(x,'productId')||!text(x.category)||!text(x.unit,30)||!Number.isFinite(x.packageSize)||x.packageSize<=0||x.packageSize>1_000_000||('ean'in x?!/^\d{13}$/.test(x.ean)||typeof x.ean!=='string':!text(x.productId,170)||!/^remont-sku-[a-z0-9-]{1,150}$/.test(x.productId)))throw Error('invalid_catalog_refresh_identity');
  return x;
}

export function parseCatalogProductRefresh(value:unknown):CatalogProductRefresh{
  const x=value as CatalogProductRefresh;parseCatalogRefreshIdentity(x?.identity);
  const r=x?.refresh,id=(s:unknown)=>text(s,200),ids=(v:unknown):v is string[]=>Array.isArray(v)&&v.length<=100&&v.every(id)&&new Set(v).size===v.length;
  if(x.version!==1||!r||!['updated','recent'].includes(r.status)||!(r.checkedAt===null||typeof r.checkedAt==='string'&&Number.isFinite(Date.parse(r.checkedAt)))||!ids(r.confirmedOfferIds)||!ids(r.failedOfferIds)||r.confirmedOfferIds.some(id=>r.failedOfferIds.includes(id))||!Number.isSafeInteger(r.retryAfterSeconds)||r.retryAfterSeconds<0||r.retryAfterSeconds>60)throw Error('invalid_catalog_product_refresh');
  parseCatalogAvailabilitySnapshot(x.availability);return x;
}
