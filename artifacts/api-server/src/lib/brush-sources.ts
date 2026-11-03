import type {RetailSource} from './retail-pages';

// Exact one-piece model, not a price for any generic 50 mm brush.
// source: https://sklep.sewera.pl/pedzel-angielski-50mm-kraus-p22518
// source: https://www.kraus.net.pl/pl/oferta/15-test.html
export const BRUSH_SOURCES: readonly RetailSource[] = [{
  id:'sewera-kraus-a50-brush',ean:'5904178020035',
  name:'Pędzel angielski 50mm Kraus',brand:'Kraus',category:'paint-brush',
  packageSize:1,unit:'szt',store:'Sewera',format:'sewera',retailUnit:'SZT',
  variant:['50 mm'],pickupRequiresConfirmation:true,
  url:'https://sklep.sewera.pl/pedzel-angielski-50mm-kraus-p22518',
  imageUrl:'https://sklep.sewera.pl/photo/359076/pedzel-angielski-50mm-kraus.webp',
}, {
  id:'sewera-kraus-l19-brush',ean:'5904178021308',
  name:'Pędzel ławkowiec 190mm Kraus',brand:'Kraus',category:'paint-brush',
  packageSize:1,unit:'szt',store:'Sewera',format:'sewera',retailUnit:'SZT',
  variant:['190 mm'],pickupRequiresConfirmation:true,
  url:'https://sklep.sewera.pl/pedzel-lawkowiec-190mm-kraus-p22550',
  imageUrl:'https://sklep.sewera.pl/photo/359210/pedzel-lawkowiec-190mm-kraus.webp',
}];
