import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
export const QUOTE_RELAY_URL='https://asystent-remontu-web-production.up.railway.app/internal/retailer-delivery';
export const relayDigest=(body:string)=>createHash('sha256').update(body).digest('hex');
export function relaySignature(secret:string,kind:'request'|'response',timestamp:string,nonce:string,body:string){return createHmac('sha256',secret).update([kind,timestamp,nonce,relayDigest(body)].join('\n')).digest('hex');}
export function equalSignature(actual:unknown,expected:string){return typeof actual==='string'&&/^[a-f0-9]{64}$/.test(actual)&&timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(expected,'hex'));}
export const relaySecretValid=(secret:unknown):secret is string=>typeof secret==='string'&&/^[a-f0-9]{64}$/.test(secret);
