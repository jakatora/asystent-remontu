import {randomBytes} from 'node:crypto';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {QUOTE_RELAY_URL,relaySignature,relayDigest,relaySecretValid,equalSignature} from './quote-relay-auth';
import type {RetailSource,RetailObservation} from './retail-pages';
export function quoteRelayEnabled(store:string){return process.env.REMONT_QUOTE_RELAY_MODE==='client'&&['ABUD','ChemiaDoParkietu25'].includes(store)&&relaySecretValid(process.env.REMONT_QUOTE_RELAY_SECRET);}
/** Private signed transport between the existing API and web services. Only
 * merchant quote results are returned; the real merchant remains the source. */
async function requestRelay(payload:unknown,fetchImpl:typeof fetch,secret:unknown):Promise<any>{
 if(!relaySecretValid(secret))throw Error('invalid_basket');
 const body=JSON.stringify(payload);if(Buffer.byteLength(body)>65536)throw Error('invalid_basket');
 const timestamp=String(Date.now()),nonce=randomBytes(24).toString('hex'),signature=relaySignature(secret,'request',timestamp,nonce,body);
 const response=await fetchImpl(QUOTE_RELAY_URL,{method:'POST',headers:{'Content-Type':'application/json','X-Remont-Time':timestamp,'X-Remont-Nonce':nonce,'X-Remont-Signature':signature},body,redirect:'error',signal:AbortSignal.timeout(20000)});
 if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw Error('quote_unavailable');
 const reader=response.body?.getReader();if(!reader)throw Error('quote_unavailable');const chunks:Uint8Array[]=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536)throw Error('quote_unavailable');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});}const raw=Buffer.concat(chunks).toString('utf8');
 if(!equalSignature(response.headers.get('x-remont-signature'),relaySignature(secret,'response',timestamp,nonce,raw)))throw Error('quote_unavailable');
 const data=JSON.parse(raw);if(!data||data.version!==1||data.requestDigest!==relayDigest(body)||!data.result||typeof data.result!=='object')throw Error('quote_unavailable');
 return data.result;
}
export async function quoteThroughRelay(order:DeliveredStoreBasket,postalCode:string,fetchImpl:typeof fetch=fetch,secret=process.env.REMONT_QUOTE_RELAY_SECRET):Promise<DeliveryQuoteResult>{
 if(!['ABUD','ChemiaDoParkietu25'].includes(order.store)||!/^\d{2}-\d{3}$/.test(postalCode))throw Error('invalid_basket');
 const result=await requestRelay({version:1,action:'quote',basket:order,postalCode},fetchImpl,secret) as DeliveryQuoteResult;
 if('quote'in result){if(result.quote?.postalCode!==postalCode||result.quote?.destinationScope!=='postal_code'||!Number.isSafeInteger(result.quote.costGrosze)||result.quote.costGrosze<0||!Number.isFinite(Date.parse(result.quote.expiresAt))||Date.parse(result.quote.expiresAt)<=Date.now())throw Error('quote_unavailable');}
 else if(typeof result.reason!=='string'||result.reason.length>80)throw Error('quote_unavailable');
 return result;
}
/** Refresh prices through the same signed path. The source ID selects a pinned
 * merchant card; no URL from the browser or request body is ever fetched. */
export async function readThroughRelay(source:RetailSource,fetchImpl:typeof fetch=fetch,secret=process.env.REMONT_QUOTE_RELAY_SECRET):Promise<RetailObservation>{
 const result=await requestRelay({version:1,action:'read',sourceId:source.id},fetchImpl,secret);
 if(typeof result.reason==='string')throw Error(result.reason);
 const row=result.observation as RetailObservation;
 if(!row||row.sourceId!==source.id||row.ean!==source.ean||row.sourceUrl!==source.url||row.currency!=='PLN'||row.availability!=='in_stock'||!Number.isSafeInteger(row.priceGrosze)||row.priceGrosze<=0||!/^[a-f0-9]{64}$/.test(row.evidenceSha256)||!Number.isFinite(Date.parse(row.observedAt))||Math.abs(Date.now()-Date.parse(row.observedAt))>30000||row.verification!==undefined)throw Error('retailer_observation_not_confirmed');
 return row;
}
