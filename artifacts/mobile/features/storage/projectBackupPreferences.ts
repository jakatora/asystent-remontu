import {PRIMER_PACKAGE_CHOICE_PREFIX,parsePrimerPackageChoices} from '../pricing/primerPackageChoice';
import {CERESIT_PACKAGE_CHOICE_PREFIX,parseCeresitPackageChoices} from '../pricing/ceresitPackageChoice';
import {MAPEGUM_PACKAGE_CHOICE_PREFIX,parseMapegumPackageChoices} from '../pricing/mapegumPackageChoice';
import {MAPEGUM_PRODUCT_CHOICE_PREFIX,parseMapegumProductChoices} from '../pricing/mapegumProductChoice';
import type {ProjectBackup} from './projectBackup';
import {parseDoorSelection} from '../pricing/doorSelection';
import {parseLaminateChoices} from '../pricing/laminateChoice';
import {parseFoilChoices} from '../pricing/foilChoice';
import {parseWashbasinChoices} from '../pricing/washbasinChoice';
import {parseFlushBoxChoices} from '../pricing/flushBoxChoice';
import {parseTileChoices} from '../pricing/tileChoice';
import {parseTileAdhesiveChoices} from '../pricing/tileAdhesiveChoice';
import {parsePriceSnapshot} from '../pricing/priceChanges';
import {parseBasketExtras} from '../pricing/basketExtras';
import {parseBasketSelection} from '../pricing/renovationBasket';
import {MATERIAL_STOCK_PREFIX,parseMaterialStock} from '../pricing/materialStock';
import type {CalculationResult} from '../../types/domain';
import {PREFERENCE_RECOVERY_PREFIX,parsePreferenceRecovery,recoveryArchiveKey} from './preferenceRecovery';

// One reviewed list drives validation and project/common-basket export keys.
// Adding a product selector must not silently omit it from a shared basket backup.
export const BACKUP_PRODUCT_CHOICE_PARSERS: Readonly<Record<string,(raw:string)=>readonly unknown[]>>={
  [PRIMER_PACKAGE_CHOICE_PREFIX]:parsePrimerPackageChoices,
  [CERESIT_PACKAGE_CHOICE_PREFIX]:parseCeresitPackageChoices,
  [MAPEGUM_PACKAGE_CHOICE_PREFIX]:parseMapegumPackageChoices,
  [MAPEGUM_PRODUCT_CHOICE_PREFIX]:parseMapegumProductChoices,
  'remont.laminate-choice.v1:':parseLaminateChoices,'remont.foil-choice.v1:':parseFoilChoices,
  'remont.washbasin-choice.v1:':parseWashbasinChoices,'remont.tile-choice.v1:':parseTileChoices,
  'remont.tile-adhesive-choice.v1:':parseTileAdhesiveChoices,'remont.flush-box-choice.v1:':parseFlushBoxChoices,
};
export const BACKUP_PRODUCT_CHOICE_PREFIXES=Object.keys(BACKUP_PRODUCT_CHOICE_PARSERS);

/** Use the same current product validators as the purchasing UI. A removed or
 * damaged choice must stop a transfer, never quietly revert to another product. */
export function validateBackupPreferences(backup:ProjectBackup):void{
  const projects=new Map(backup.tables.projects.map(row=>[String(row.id),row]));
  for(const[key,raw]of Object.entries(backup.preferences)){
    if(key.startsWith(PREFERENCE_RECOVERY_PREFIX)){
      if(recoveryArchiveKey(key.slice(PREFERENCE_RECOVERY_PREFIX.length))!==key)throw Error('backup_invalid_recovery');
      parsePreferenceRecovery(raw);continue;
    }
    const value=JSON.parse(raw);
    const prefix=BACKUP_PRODUCT_CHOICE_PREFIXES.find(prefix=>key.startsWith(prefix));
    if(prefix){const parsed=BACKUP_PRODUCT_CHOICE_PARSERS[prefix](raw);if(value.version!==1||!Array.isArray(value.choices)||parsed.length!==value.choices.length)throw Error('backup_invalid_product_choice');continue;}
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
    }else if(key===MATERIAL_STOCK_PREFIX+'renovation-basket')throw Error('backup_invalid_material_stock');
    else if(key.startsWith(MATERIAL_STOCK_PREFIX))parseMaterialStock(raw);
    else if(key==='remont.basket-extras.v1')parseBasketExtras(raw);
    else throw Error('backup_invalid_preference');
  }
}
