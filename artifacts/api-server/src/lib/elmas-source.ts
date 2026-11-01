import type {RetailSource} from './retail-pages';

export const ELMAS_ORIGIN='https://sklep-elmas.pl';
export const ELMAS_VARIANT='5e70dce30acac12465cf0ee1;1';
export const ELMAS_HOME_CARRIER=1785759636513;
// One complete 50 mm x 30 m roll. The category's imported dimension fields
// are inconsistent; the primary barcode, description and factory table agree.
// source: https://sklep-elmas.pl/p/tasma-akustyczna-samoprzylepna-z-klejem-50x3x30
// source: https://norgips.pl/media/repository/0/153/36260b03960b449691b96488c1d9b974/NORGIPS_PL_KT_akcesoria_tasma_akustyczna.pdf
export const ELMAS_TAPE:RetailSource={id:'elmas-norgips-acoustic-50x30',ean:'5907651698004',name:'TAŚMA AKUSTYCZNA SAMOPRZYLEPNA Z KLEJEM 50x3x30',brand:'Norgips',category:'drywall-accessory',packageSize:30,unit:'m',store:'Elmas',format:'elmas',retailerSku:'6a69c6cc869b9bc4c7953c25',variant:['50','3','30'],pickupRequiresConfirmation:true,url:ELMAS_ORIGIN+'/p/tasma-akustyczna-samoprzylepna-z-klejem-50x3x30',imageUrl:ELMAS_ORIGIN+'/upload/6b89e6014d62a9e7cb888fdfa8ba.jpg'};

export function confirmElmasSource(source:RetailSource):void{
  if(!(['id','ean','name','brand','category','packageSize','unit','store','format','retailerSku','url'] as const).every(k=>source[k]===ELMAS_TAPE[k])||source.variant?.join('|')!==ELMAS_TAPE.variant!.join('|')||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1||source.skuIdentity!==undefined)throw Error('product_package_not_confirmed');
}
