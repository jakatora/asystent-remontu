import type {RetailSource} from './retail-pages';

export const ETAK_ORIGIN = 'https://etak.eu';
// Separate manufacturer models. One native retail piece is one connector.
// source: https://www.wago.com/ca-fr/interconnexions-%C3%A9lectriques/221
// source: https://etak.eu/pl/products/wago-zlaczka-instalacyjna-otwierana-2-przewodowa-do-linek-i-drutow-0-14-4-mm2-32a-221-412-735.html
// source: https://etak.eu/pl/products/wago-zlaczka-instalacyjna-otwierana-3-przewodowa-do-linek-i-drutow-0-14-4-mm2-32a-221-413-733.html
// source: https://etak.eu/pl/products/wago-zlaczka-instalacyjna-otwierana-5-przewodowa-do-linek-i-drutow-0-14-4-mm2-32a-221-415-732.html
export const ETAK_SOURCES: readonly RetailSource[] = [
  {id:'etak-wago-221412',ean:'4050821808435',name:'WAGO Złączka instalacyjna otwierana 2-przewodowa do linek i drutów 0,14-4 mm² 32A 221-412',productId:735,retailerSku:'221-412',imageUrl:'https://etak.eu/hpeciai/f094d901015eabafd8204dbb3b32d408/pol_il_WAGO-Zlaczka-instalacyjna-otwierana-2-przewodowa-do-linek-i-drutow-0-14-4-mm2-32A-221-412-735.jpg'},
  {id:'etak-wago-221413',ean:'4050821808442',name:'WAGO Złączka instalacyjna otwierana 3-przewodowa do linek i drutów 0,14-4 mm² 32A 221-413',productId:733,retailerSku:'221-413',imageUrl:'https://etak.eu/hpeciai/0abdd857ec50bc3258541869a2dc9e85/pol_il_WAGO-Zlaczka-instalacyjna-otwierana-3-przewodowa-do-linek-i-drutow-0-14-4-mm2-32A-221-413-733.jpg'},
  {id:'etak-wago-221415',ean:'4055143234658',name:'WAGO Złączka instalacyjna otwierana 5-przewodowa do linek i drutów 0,14-4 mm² 32A 221-415',productId:732,retailerSku:'221-415',imageUrl:'https://etak.eu/hpeciai/0e3ed8b880b3bf3b0e17066819a2a38a/pol_il_WAGO-Zlaczka-instalacyjna-otwierana-5-przewodowa-do-linek-i-drutow-0-14-4-mm2-32A-221-415-732.jpg'},
].map(row => ({...row,brand:'WAGO ELWAG',category:'wire-connector',packageSize:1,unit:'szt',store:'eTak',format:'idosell' as const,apiPurchaseUnit:'szt.',variant:[row.retailerSku],pickupRequiresConfirmation:true,url:`${ETAK_ORIGIN}/pl/products/wago-zlaczka-instalacyjna-otwierana-${row.productId===735?2:row.productId===733?3:5}-przewodowa-do-linek-i-drutow-0-14-4-mm2-32a-${row.retailerSku}-${row.productId}.html`}));

export function isReviewedEtakSource(source:RetailSource):boolean {
  const expected=ETAK_SOURCES.find(s=>s.id===source.id);
  return Boolean(expected&&['ean','name','brand','category','packageSize','unit','store','format','apiPurchaseUnit','productId','retailerSku','url','imageUrl'].every(key=>source[key as keyof RetailSource]===expected[key as keyof RetailSource])
    &&JSON.stringify(source.variant)===JSON.stringify(expected.variant)&&source.purchaseMultiple===undefined&&source.minimumPackages===undefined&&!source.skuIdentity&&!source.pickupOnly&&!source.disabledReason);
}
