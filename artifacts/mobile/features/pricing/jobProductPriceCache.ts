import type {CatalogProductRefresh,CatalogRefreshIdentity} from '../../../../lib/pricing-service/src/catalog-refresh';
import {jobProductKey} from './jobProduct';

/** Share duplicate card reads, cap merchant requests at two and retain at most
 * 64 short-lived entries. There is no polling, persisted price or delivery. */
export class JobProductPriceCache {
  private entries=new Map<string,{expiresAt:number;promise:Promise<CatalogProductRefresh>}>();
  private queue:Array<()=>void>=[];
  private active=0;
  constructor(private load:(identity:CatalogRefreshIdentity)=>Promise<CatalogProductRefresh>,private now=Date.now){}
  read(identity:CatalogRefreshIdentity,force=false):Promise<CatalogProductRefresh>{
    const key=jobProductKey(identity),cached=this.entries.get(key);
    if(cached&&(cached.expiresAt===Infinity||!force&&cached.expiresAt>this.now()))return cached.promise;
    if(this.queue.length>=20)return Promise.reject(Error('job_price_queue_full'));
    const entry={expiresAt:Infinity,promise:undefined as unknown as Promise<CatalogProductRefresh>};
    entry.promise=new Promise<CatalogProductRefresh>((resolve,reject)=>{
      this.queue.push(()=>{
        this.active++;
        Promise.resolve().then(()=>this.load(identity)).then(result=>{
          if(jobProductKey(result.identity)!==key)throw Error('job_price_identity_mismatch');
          entry.expiresAt=this.now()+60_000;resolve(result);
        }).catch(error=>{entry.expiresAt=this.now()+15_000;reject(error);}).finally(()=>{this.active--;this.drain();});
      });
    });
    this.entries.delete(key);this.entries.set(key,entry);
    for(const [old,value]of this.entries){if(this.entries.size<=64)break;if(value.expiresAt!==Infinity)this.entries.delete(old);}
    this.drain();return entry.promise;
  }
  private drain(){while(this.active<2&&this.queue.length)this.queue.shift()!();}
}
