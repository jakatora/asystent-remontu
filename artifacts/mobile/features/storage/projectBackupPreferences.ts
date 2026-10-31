import type {ProjectBackup} from './projectBackup';
import {parseDoorSelection} from '../pricing/doorSelection';
import {parseLaminateChoices} from '../pricing/laminateChoice';
import {parseFoilChoices} from '../pricing/foilChoice';
import {parseWashbasinChoices} from '../pricing/washbasinChoice';
import {parseTileChoices} from '../pricing/tileChoice';
import {parseTileAdhesiveChoices} from '../pricing/tileAdhesiveChoice';
import {parsePriceSnapshot} from '../pricing/priceChanges';
import {parseBasketExtras} from '../pricing/basketExtras';
import {parseBasketSelection} from '../pricing/renovationBasket';
import type {CalculationResult} from '../../types/domain';

/** Use the same current product validators as the purchasing UI. A removed or
 * damaged choice must stop a transfer, never quietly revert to another product. */
export function validateBackupPreferences(backup:ProjectBackup):void{
  const projects=new Map(backup.tables.projects.map(row=>[String(row.id),row]));
  for(const[key,raw]of Object.entries(backup.preferences)){
    const value=JSON.parse(raw);
    const choiceParsers:Record<string,(raw:string)=>readonly unknown[]>={
      'remont.laminate-choice.v1:':parseLaminateChoices,'remont.foil-choice.v1:':parseFoilChoices,
      'remont.washbasin-choice.v1:':parseWashbasinChoices,'remont.tile-choice.v1:':parseTileChoices,
      'remont.tile-adhesive-choice.v1:':parseTileAdhesiveChoices,
    };
    const prefix=Object.keys(choiceParsers).find(prefix=>key.startsWith(prefix));
    if(prefix){const parsed=choiceParsers[prefix](raw);if(value.version!==1||!Array.isArray(value.choices)||parsed.length!==value.choices.length)throw Error('backup_invalid_product_choice');continue;}
    if(key.startsWith('remont.door-selection.v1:')){
      const row=projects.get(key.slice('remont.door-selection.v1:'.length));
      if(!row?.calculation_result||!parseDoorSelection(raw,JSON.parse(String(row.calculation_result)) as CalculationResult))throw Error('backup_invalid_product_choice');
    }else if(key.startsWith('remont.delivery.v2:')){
      if(!value||!['shipping','pickup'].includes(value.settings?.mode)||value.settings.postalCode!==undefined&&!/^\d{2}-\d{3}$/.test(value.settings.postalCode))throw Error('backup_invalid_delivery');
      // Historical delivery quotes and hand-entered tariffs never move as proof.
      backup.preferences[key]=JSON.stringify({store:typeof value.store==='string'?value.store:null,settings:{mode:value.settings.mode,method:'automatic',...(typeof value.settings.postalCode==='string'?{postalCode:value.settings.postalCode}:{}),...(typeof value.settings.allowSeparateOrders==='boolean'?{allowSeparateOrders:value.settings.allowSeparateOrders}:{})}});
    }else if(key.startsWith('remont.price-seen.v1:')){
      const parsed=parsePriceSnapshot(raw);
      if(value?.version!==1||!value.offers||Object.keys(value.offers).length!==Object.keys(parsed.offers).length)throw Error('backup_invalid_price_history');
    }else if(key==='remont.renovation-basket.v1'){
      const ids=parseBasketSelection(raw);
      if(value?.version!==1||!Array.isArray(value.projectIds)||ids.length!==value.projectIds.length||ids.some(id=>!projects.has(id)))throw Error('backup_invalid_basket');
    }else if(key==='remont.basket-extras.v1')parseBasketExtras(raw);
    else throw Error('backup_invalid_preference');
  }
}
