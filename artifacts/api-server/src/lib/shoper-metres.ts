import type {RetailSource} from './retail-pages';
import {htmlText} from './retail-microdata';

/** This reviewed offer sells metres cut from a roll. Our existing 1 mb pack
 * comparison buys whole metres; a native floating-point unit is not a carton.
 * source: https://www.plus-market.pl/pl/p/Rura-pexalpex-16-mmx2-1mb/12990
 * source: https://www.plus-market.pl/webapi/front/pl_PL/products/PLN/12990 */
export function shoperFloatingPointUnit(source:RetailSource):boolean{
  if(source.id!=='plusmarket-pex-pipe-16x2')return false;
  if(source.ean!=='5901095517976'||source.name!=='Rura pex/al/pex/ 16 mmx2 - 1mb'||source.store!=='Plus-Market'||source.brand!=='PLUS-MARKET'||source.category!=='pipe'||source.format!=='shoper-api'||source.productId!==12990||source.packageSize!==1||source.unit!=='mb'||source.apiPurchaseUnit!=='mb'||source.url!=='https://www.plus-market.pl/pl/p/Rura-pexalpex-16-mmx2-1mb/12990'||(source.minimumPackages??1)!==1||(source.purchaseMultiple??1)!==1)throw Error('product_package_not_confirmed');
  return true;
}

export function confirmShoperMetreCard(item:any,source:RetailSource):void{
  if(!shoperFloatingPointUnit(source))return;
  if(item?.id!==12990||item.stockId!==13709||item.name!==source.name||item.ean!==source.ean||item.code!==source.ean||item.producer?.id!==174||item.producer?.name!=='PLUS-MARKET'||item.url!==source.url||!/^Oferta dotyczy 1mb!?/.test(htmlText(String(item.description??''))))throw Error('product_package_not_confirmed');
}
