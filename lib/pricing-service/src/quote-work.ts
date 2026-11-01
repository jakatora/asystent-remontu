import type {BasketQuoter} from './delivery';

const CONCURRENCY=3;

/** Shared by every allocation, partition and stock-replanning pass of one
 * comparison. Admission happens before calling the transport, so its existing
 * deadline is checked after waiting; cached duplicates bypass this queue. */
export function limitBasketQuotes(quote:BasketQuoter):BasketQuoter {
  let active=0;
  const waiting:(()=>void)[]=[];
  return async(order,postcode,context)=>{
    await new Promise<void>(resolve=>{
      const admit=()=>{active++;resolve();};
      if(active<CONCURRENCY)admit();else waiting.push(admit);
    });
    try{return await quote(order,postcode,context);}
    finally{active--;waiting.shift()?.();}
  };
}

/** Independent cart shapes may overlap; preserve input order for deterministic
 * ranking and tie breaks. The transport still shares the comparison's gate. */
export async function mapQuoteWork<T,R>(items:readonly T[],read:(item:T)=>Promise<R>):Promise<R[]> {
  let cursor=0;
  const results:R[]=new Array(items.length);
  await Promise.all(Array.from({length:Math.min(CONCURRENCY,items.length)},async()=>{
    while(cursor<items.length){const index=cursor++;results[index]=await read(items[index]);}
  }));
  return results;
}
