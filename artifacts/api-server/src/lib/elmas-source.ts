import type {RetailSource} from './retail-pages';

export const ELMAS_ORIGIN='https://sklep-elmas.pl';
export const ELMAS_VARIANT='5e70dce30acac12465cf0ee1;1';
export const ELMAS_HOME_CARRIER=1785759636513;
// One complete 50 mm x 30 m roll. The category's imported dimension fields
// are inconsistent; the primary barcode, description and factory table agree.
// source: https://sklep-elmas.pl/p/tasma-akustyczna-samoprzylepna-z-klejem-50x3x30
// source: https://norgips.pl/media/repository/0/153/62d06729868d42beae6969cc0297c047/NORGIPS_PL_KT_akcesoria_tasma_akustyczna.pdf
export const ELMAS_TAPE:RetailSource={id:'elmas-norgips-acoustic-50x30',ean:'5907651698004',name:'TAŚMA AKUSTYCZNA SAMOPRZYLEPNA Z KLEJEM 50x3x30',brand:'Norgips',category:'drywall-accessory',packageSize:30,unit:'m',store:'Elmas',format:'elmas',retailerSku:'6a69c6cc869b9bc4c7953c25',variant:['50','3','30'],pickupRequiresConfirmation:true,url:ELMAS_ORIGIN+'/p/tasma-akustyczna-samoprzylepna-z-klejem-50x3x30',imageUrl:ELMAS_ORIGIN+'/upload/6b89e6014d62a9e7cb888fdfa8ba.jpg'};

// A separate 75 mm roll for the matching profile; never an alias for 30/50 mm.
// source: https://sklep-elmas.pl/p/tasma-akustyczna-norgips-3-mm-x-0075-m
// source: https://norgips.pl/media/repository/0/153/62d06729868d42beae6969cc0297c047/NORGIPS_PL_KT_akcesoria_tasma_akustyczna.pdf
export const ELMAS_TAPE_75:RetailSource={id:'elmas-norgips-acoustic-75x30',ean:'5907651698011',name:'Taśma akustyczna Norgips 3 mm x 0,075 m',brand:'Norgips',category:'drywall-accessory',packageSize:30,unit:'m',store:'Elmas',format:'elmas',retailerSku:'6a69c65d869b9bc4c79538c6',variant:['75','3','30'],pickupRequiresConfirmation:true,url:ELMAS_ORIGIN+'/p/tasma-akustyczna-norgips-3-mm-x-0075-m',imageUrl:ELMAS_ORIGIN+'/upload/2890a51b478292855b3e5e15866f.jpg'};
export const ELMAS_SOURCES:readonly RetailSource[]=[ELMAS_TAPE,ELMAS_TAPE_75];
// Reviewed native cart metadata, not the inconsistent imported dimension labels.
// source: https://sklep-elmas.pl/scripts/basket.js
export const ELMAS_ITEMS=[
  {source:ELMAS_TAPE,catalogueName:ELMAS_TAPE.name,weight:0.3,description:'Samoprzylepna TAŚMA USZCZELNIAJĄCA NORGIPS 50mm x 3mm x 30m',packageChecks:[/Samoprzylepna TAŚMA USZCZELNIAJĄCA NORGIPS 50mm x 3mm x 30m/],vars:{'6a69ca5e869b9bc4c7953c50':'0.05','6a69ca5e869b9bc4c7953c2f':'inny','6a69ca5e869b9bc4c7953c91':'1','5e70dce30acac12465cf0ee1':'none'}},
  {source:ELMAS_TAPE_75,catalogueName:'Taśma akustyczna Norgips 75 mm x 3 mm x 30 m',weight:0.4,description:'Taśma akustyczna Norgips 75 mm x 3 mm x 30 m',packageChecks:[/Długość\s*-\s*30 metrów/,/Szerokość\s*-\s*75 mm/,/Grubość\s*-\s*3 mm/],vars:{'6a69ca5e869b9bc4c7953c50':'0.075','6a69ca5e869b9bc4c7953c2f':'taśma akustyczna','6a69ca5e869b9bc4c7953c91':'75','6a69ca5e869b9bc4c7953c4f':'3','5e70dce30acac12465cf0ee1':'none'}},
] as const;

export function confirmElmasSource(source:RetailSource){
  const item=ELMAS_ITEMS.find(item=>item.source.id===source.id),expected=item?.source;
  if(!expected||!(['id','ean','name','brand','category','packageSize','unit','store','format','retailerSku','url','imageUrl'] as const).every(k=>source[k]===expected[k])||source.variant?.join('|')!==expected.variant!.join('|')||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1||source.skuIdentity!==undefined)throw Error('product_package_not_confirmed');
  return item!;
}
