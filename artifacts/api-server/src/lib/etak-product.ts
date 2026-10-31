import {parsePriceToGrosze} from '@workspace/price-collector';
import {cleanHtml,htmlAttributes,htmlElements} from './retail-microdata';
import type {RetailSource} from './retail-pages';
import {isReviewedEtakSource} from './etak-sources';

export function etakMoney(value:unknown,formatted?:unknown):number {
  if(typeof value!=='string'&&typeof value!=='number')throw Error('invalid_money');
  const amount=parsePriceToGrosze(value);
  if(amount===null||!Number.isSafeInteger(amount)||amount<0||formatted!==undefined&&(typeof formatted!=='string'||!/^[\d\s,.]+\s*zł$/.test(formatted)||parsePriceToGrosze(formatted.replace(/\s*zł$/,''))!==amount))throw Error('invalid_money');
  return amount;
}

/** The reviewed cards declare23% VAT. Integer arithmetic rounds the whole net
 * position, not the displayed gross unit price multiplied by quantity.
 * source: https://etak.eu/pl/products/wago-zlaczka-instalacyjna-otwierana-5-przewodowa-do-linek-i-drutow-0-14-4-mm2-32a-221-415-732.html */
export function etakGrossFromNet(net:number):number {
  if(!Number.isSafeInteger(net)||net<=0||!Number.isSafeInteger(net*123+50))throw Error('invalid_money');
  return Math.floor((net*123+50)/100);
}

/** Parse data only; never evaluate storefront JavaScript. Both the native
 * single-size state and the visible form must agree with the pinned model. */
export function readEtakCard(html:string,source:RetailSource) {
  if(!isReviewedEtakSource(source))throw Error('product_identity_not_confirmed');
  const states=[...html.matchAll(/\bvar\s+product_data\s*=\s*(\{[\s\S]*?\})\s*var\s+trust_level\s*=/g)];
  if(states.length!==1)throw Error('product_identity_not_confirmed');
  const raw=states[0][1].replace(/^(\{\s*"product_id"\s*:\s*)'(\d+)'/,'$1"$2"');
  let state:any;try{state=JSON.parse(raw);}catch{throw Error('product_identity_not_confirmed');}
  const size=state?.sizes?.uniw;
  if(state.product_id!==String(source.productId)||state.product_type!=='product_item'||state.currency!=='zł'||state.unit!=='szt.'||state.unit_sellby!=='1'||state.unit_precision!=='0'
    ||!state.order_quantity_range||Array.isArray(state.order_quantity_range)||Object.keys(state.order_quantity_range).length||!size||Object.keys(state.sizes).join(',')!=='uniw'
    ||size.type!=='uniw'||size.name!=='uniw'||size.code_extern!==source.retailerSku||size.code_producer!==source.ean)throw Error('product_identity_not_confirmed');
  if(!Number.isSafeInteger(size.amount)||size.amount<=0||size.amount_mw!==size.amount||size.amount_mo!==0||size.amount_mp!==0)throw Error('retailer_out_of_stock');
  const prices=[state.base_price,size.price];let gross=0,net=0;
  for(const price of prices){
    if(!price||price.vat!=='23'||price.basket_enable!=='y'||price.special_offer!=='false'||price.rebate_code_active!=='n'||price.priceformula_error!=='false')throw Error('price_changed');
    const current=etakMoney(price.value,price.price_formatted),currentNet=etakMoney(price.price_net,price.price_net_formatted);
    if(!current||!currentNet||etakGrossFromNet(currentNet)!==current||gross&&gross!==current||net&&net!==currentNet)throw Error('price_changed');
    gross=current;net=currentNet;
  }
  const safe=cleanHtml(html),forms=htmlElements(safe,(a,t)=>t==='form'&&a.id==='projector_form'&&a['data-product_id']===String(source.productId));
  if(forms.length!==1)throw Error('product_id_not_confirmed');
  for(const [id,value]of [['projector_size_hidden','onesize'],['projector_mode_hidden','1']]){
    const rows=htmlElements(forms[0],a=>a.id===id);if(rows.length!==1||htmlAttributes(rows[0].match(/^<[^>]+>/)?.[0]??'').value!==value)throw Error('purchase_rules_changed');
  }
  const selected=htmlElements(forms[0],(a,t)=>t==='option'&&a['data-link']===new URL(source.url).pathname);
  if(selected.length!==1||!/^<option\b[^>]*\bselected(?:\s|=|>)/i.test(selected[0])||new URL(htmlAttributes(selected[0].match(/^<[^>]+>/)?.[0]??'')['data-gfx']??'',source.url).href!==source.imageUrl)throw Error('product_identity_not_confirmed');
  return{priceGrosze:gross,netPriceGrosze:net,maxPackages:size.amount as number};
}
