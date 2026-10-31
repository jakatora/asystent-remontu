import type {IncomingMessage,ServerResponse} from 'node:http';
import type {BasketQuoter,DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {quoteAbud} from './abud-delivery';
import {quoteChemia} from './chemia-delivery';
import {relaySignature,relayDigest,relaySecretValid,equalSignature} from './quote-relay-auth';
import {QuoteQueue} from './quote-queue';
import {RETAIL_SOURCES} from './retail-catalog';
import {readRetailSource,type RetailSource,type RetailObservation} from './retail-pages';
const REASONS=['price_changed','product_unavailable','insufficient_stock','basket_not_confirmed','no_home_delivery','address_required','purchase_rules_changed'];
const native:BasketQuoter=(order,postcode)=>order.store==='ABUD'?quoteAbud(order,postcode,fetch):quoteChemia(order,postcode,fetch);
/** No URL, product action or arbitrary GraphQL can be supplied over this route.
 * A caller must hold the service-only key; bodies/replies are signed and bound
 * to a fresh nonce. Replayed or malformed requests never reach a merchant. */
export function createQuoteRelayHandler({secret=process.env.REMONT_QUOTE_RELAY_SECRET,quote=native,readSource=readRetailSource,now=Date.now,queue=new QuoteQueue(3,12,3000)}:{secret?:string;quote?:BasketQuoter;readSource?:(source:RetailSource)=>Promise<RetailObservation>;now?:()=>number;queue?:QuoteQueue}={}){
 const seen=new Map<string,number>();
 return async(req:IncomingMessage,res:ServerResponse)=>{
  const send=(status:number,value:unknown,signature?:string)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...(signature?{'X-Remont-Signature':signature}:{})});res.end(JSON.stringify(value));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');send(405,{error:'method_not_allowed'});return;}
  if(!relaySecretValid(secret)){send(503,{error:'quote_unavailable'});return;}
  const timestamp=req.headers['x-remont-time'],nonce=req.headers['x-remont-nonce'];
  if(typeof timestamp!=='string'||!/^\d{13}$/.test(timestamp)||Math.abs(now()-Number(timestamp))>30000||typeof nonce!=='string'||!/^[a-f0-9]{48}$/.test(nonce)||typeof req.headers['x-remont-signature']!=='string'||!/^[a-f0-9]{64}$/.test(req.headers['x-remont-signature'])){send(401,{error:'unauthorized'});req.resume();return;}
  if(!req.headers['content-type']?.startsWith('application/json')||Number(req.headers['content-length']??0)>65536){send(413,{error:'invalid_request'});req.resume();return;}
  const chunks:Buffer[]=[];let size=0;for await(const chunk of req){const bytes=Buffer.from(chunk);size+=bytes.length;if(size>65536){send(413,{error:'invalid_request'});return;}chunks.push(bytes);}const raw=Buffer.concat(chunks).toString('utf8');
  if(!equalSignature(req.headers['x-remont-signature'],relaySignature(secret,'request',timestamp,nonce,raw))){send(401,{error:'unauthorized'});return;}
  for(const [key,expiry]of seen)if(expiry<=now())seen.delete(key);
  if(seen.has(nonce)){send(409,{error:'replay_rejected'});return;}
  const reply=(result:DeliveryQuoteResult|{observation:RetailObservation})=>{const value={version:1,requestDigest:relayDigest(raw),result},body=JSON.stringify(value);send(200,value,relaySignature(secret,'response',timestamp,nonce,body));};
  if(seen.size>=512){reply({reason:'quote_busy'});return;}seen.set(nonce,now()+60000);
  let data:any;try{data=JSON.parse(raw);}catch{reply({reason:'invalid_basket'});return;}
  if(!data||typeof data!=='object'||Array.isArray(data)){reply({reason:'invalid_basket'});return;}
  if(data?.action==='read'){
    const source=RETAIL_SOURCES.find(s=>s.id===data.sourceId&&s.format==='idosell'&&['ABUD','ChemiaDoParkietu25'].includes(s.store)&&!s.disabledReason);
    if(data.version!==1||!source||Object.keys(data).some(k=>!['version','action','sourceId'].includes(k))){reply({reason:'invalid_basket'});return;}
    const release=await queue.acquire();if(!release){reply({reason:'quote_busy'});return;}
    try{reply({observation:await readSource(source)});}catch(error){reply({reason:error instanceof Error&&['retailer_out_of_stock','purchase_rules_changed'].includes(error.message)?error.message:'quote_unavailable'});}finally{release();}return;
  }
  const basket=data?.basket as DeliveredStoreBasket;
  if(data.version!==1||data.action!=='quote'||Object.keys(data).some(k=>!['version','action','basket','postalCode'].includes(k))||!/^\d{2}-\d{3}$/.test(data.postalCode??'')||!basket||!['ABUD','ChemiaDoParkietu25'].includes(basket.store)||!Number.isSafeInteger(basket.materialsGrosze)||basket.materialsGrosze<=0||!Array.isArray(basket.lines)||basket.lines.length<1||basket.lines.length>20||basket.lines.some(l=>!l?.product||typeof l.product.id!=='string'||!Array.isArray(l.packages)||l.packages.length<1||l.packages.length>20)){reply({reason:'invalid_basket'});return;}
  const release=await queue.acquire();if(!release){reply({reason:'quote_busy'});return;}
  try{reply(await quote(basket,data.postalCode));}catch(error){reply({reason:error instanceof Error&&error.message==='retailer_out_of_stock'?'product_unavailable':error instanceof Error&&REASONS.includes(error.message)?error.message:'quote_unavailable'});}finally{release();}
 };
}
