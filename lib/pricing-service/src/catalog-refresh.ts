import {parseCatalogAvailabilitySnapshot,type CatalogAvailabilitySnapshot} from './catalog-availability';

export type CatalogRefreshIdentity={category:string;packageSize:number;unit:string}&({ean:string;productId?:never}|{productId:string;ean?:never});
export interface CatalogRefreshOffer {
  offerId:string;store:string;sourceUrl:string;currency:'PLN';
  packageSize:number;unit:string;priceGrosze:number;checkedAt:string;
  previous:{priceGrosze:number;checkedAt:string}|null;deltaGrosze:number|null;
}
export interface CatalogProductRefresh{version:1;identity:CatalogRefreshIdentity;refresh:{status:'updated'|'recent';checkedAt:string|null;confirmedOfferIds:string[];failedOfferIds:string[];retryAfterSeconds:number};availability:CatalogAvailabilitySnapshot;offers?:CatalogRefreshOffer[]}
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
  parseCatalogAvailabilitySnapshot(x.availability);
  if(x.offers!==undefined){
    const money=(n:unknown):n is number=>Number.isSafeInteger(n)&&Number(n)>0;
    const date=(s:unknown):s is string=>typeof s==='string'&&s.length<=40&&Number.isFinite(Date.parse(s));
    const url=(s:unknown)=>{try{const u=new URL(String(s));return text(s,2048)&&u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
    if(!Array.isArray(x.offers)||x.offers.length>100||new Set(x.offers.map(o=>o?.offerId)).size!==x.offers.length)throw Error('invalid_catalog_refresh_offers');
    for(const o of x.offers){
      if(!o||!id(o.offerId)||!r.confirmedOfferIds.includes(o.offerId)||!text(o.store)||!url(o.sourceUrl)||o.currency!=='PLN'||o.packageSize!==x.identity.packageSize||!text(o.unit,30)||catalogRefreshUnit(o.unit)!==catalogRefreshUnit(x.identity.unit)||!money(o.priceGrosze)||!date(o.checkedAt)||Date.parse(o.checkedAt)>Date.parse(x.availability.generatedAt)+60000)throw Error('invalid_catalog_refresh_offer');
      if(o.previous===null){if(o.deltaGrosze!==null)throw Error('invalid_catalog_refresh_delta');}
      else if(!o.previous||!money(o.previous.priceGrosze)||!date(o.previous.checkedAt)||Date.parse(o.previous.checkedAt)>=Date.parse(o.checkedAt)||!Number.isSafeInteger(o.deltaGrosze)||o.deltaGrosze!==o.priceGrosze-o.previous.priceGrosze)throw Error('invalid_catalog_refresh_delta');
    }
  }
  return x;
}
