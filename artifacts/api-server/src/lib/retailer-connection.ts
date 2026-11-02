/** A short connection cooldown is not a delivery quote or stock decision.
 * Only failures before an HTTP response qualify; HTTP errors, price changes,
 * basket rules and caller cancellation keep their existing meanings.
 * source: https://nodejs.org/api/errors.html#common-system-errors
 * source: https://github.com/nodejs/undici/blob/main/docs/docs/api/Errors.md
 */
export const RETAILER_CONNECTION_COOLDOWN_MS = 30_000;
const CONNECTION_CODES = new Set(['UND_ERR_CONNECT_TIMEOUT','ETIMEDOUT','ECONNREFUSED','ENETUNREACH','EHOSTUNREACH','ENOTFOUND','EAI_AGAIN']);

function connectionFailure(error: unknown): boolean {
 const pending:unknown[]=[error],seen=new Set<unknown>();
 for(let i=0;i<8&&pending.length;i++){
  const item=pending.shift();if(!item||typeof item!=='object'||seen.has(item))continue;seen.add(item);
  const value=item as {code?:unknown;cause?:unknown;errors?:unknown};
  if(typeof value.code==='string'&&CONNECTION_CODES.has(value.code))return true;
  if(value.cause)pending.push(value.cause);
  if(Array.isArray(value.errors))pending.push(...value.errors.slice(0,8));
 }
 return false;
}

export interface RetailerConnectionGuard {
 fetch: typeof fetch;
 isUnavailable(url:string):boolean;
 confirmAvailable(url:string):void;
}

export function createRetailerConnectionGuard(fetchImpl:typeof fetch,reviewedUrls:readonly string[],now=Date.now):RetailerConnectionGuard {
 const origin=(url:string)=>{try{const u=new URL(url);return u.protocol==='https:'?u.origin:null;}catch{return null;}};
 const reviewed=new Set(reviewedUrls.map(origin).filter((value):value is string=>value!==null));
 const unavailableUntil=new Map<string,number>();
 const isUnavailable=(url:string)=>{const host=origin(url);if(!host||!reviewed.has(host))return false;const until=unavailableUntil.get(host);if(until===undefined)return false;if(until>now())return true;unavailableUntil.delete(host);return false;};
 const confirmAvailable=(url:string)=>{const host=origin(url);if(host)unavailableUntil.delete(host);};
 const guardedFetch:typeof fetch=async(input,init)=>{
  const url=input instanceof Request?input.url:String(input),host=origin(url);
  if(isUnavailable(url))throw Error('retailer_connection_unavailable');
  try{
   const response=await fetchImpl(input,init);
   // A response proves connectivity, even if the merchant rejects the request.
   // Its HTTP status still passes unchanged to the existing strict adapter.
   confirmAvailable(url);return response;
  }catch(error){
   if(host&&reviewed.has(host)&&!init?.signal?.aborted&&!(input instanceof Request&&input.signal.aborted)&&connectionFailure(error)){
    unavailableUntil.set(host,now()+RETAILER_CONNECTION_COOLDOWN_MS);
    throw new Error('retailer_connection_unavailable',{cause:error});
   }
   throw error;
  }
 };
 return{fetch:guardedFetch,isUnavailable,confirmAvailable};
}
