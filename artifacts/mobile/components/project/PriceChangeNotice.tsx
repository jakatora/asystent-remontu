import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatGrosze, type SerializedProject } from '@/features/pricing';
import { basketMaterialPriceDelta,isCutRollPrice, type BasketPricePack, type PriceChange } from '@/features/pricing/priceChanges';

const PriceChangesContext=createContext<Record<string,PriceChange>>({});
export function PriceChangesProvider({changes,children}:{changes:PriceChange[];children:React.ReactNode}) {
  return <PriceChangesContext.Provider value={Object.fromEntries(changes.map(c=>[c.offerId,c]))}>{children}</PriceChangesContext.Provider>;
}
export function PriceChangeBadge({ change:explicit, offerId, productName, basketPack }: { change?: PriceChange; offerId?:string; productName?:string; basketPack?:BasketPricePack }) {
  const { language }=useLanguage();
  const changes=useContext(PriceChangesContext);const change=explicit ?? (offerId?changes[offerId]:undefined);
  if (!change) return null;
  const up=change.deltaGrosze>0;
  const basketDelta=basketPack ? basketMaterialPriceDelta(change,basketPack) : null;
  const roll=isCutRollPrice(change);
  // Direction is conveyed by text and an icon as well as colour.
  const color=up ? Colors.text : Colors.primaryDark;
  return <View accessibilityLiveRegion="polite" style={{gap:4,backgroundColor:up?Colors.warningBg:Colors.successBg,padding:10,borderRadius:10}}>
    {productName && <Txt w="medium" style={{fontSize:13,color}}>{productName}</Txt>}
    <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
      <Feather name={up?'trending-up':'trending-down'} color={color} size={16} />
      <Txt w="semibold" style={{fontSize:13,color,flex:1}}>{language==='pl' ? `${up?'Podrożał':'Taniej'} o ${formatGrosze(Math.abs(change.deltaGrosze))} / ${roll?'m²':'opak.'}` : `${up?'Up':'Down'} ${formatGrosze(Math.abs(change.deltaGrosze))} / ${roll?'m²':'pack'}`}</Txt>
    </View>
    <Txt style={{fontSize:12,color:Colors.textSecondary}}>{formatGrosze(change.previousGrosze)} → {formatGrosze(change.priceGrosze)} · {change.store}</Txt>
    {basketPack && (basketPack.count > 1||roll) && basketDelta !== null && <Txt style={{fontSize:12,color}}>{language==='pl' ? `${roll?'Dla wycenionych odcinków':`Przy ${basketPack.count} op.`} koszt tego produktu ${up?'wzrósł':'spadł'} o ${formatGrosze(Math.abs(basketDelta))}. Dostawa jest liczona osobno.` : `${roll?'For the quoted cuts':`For ${basketPack.count} packs`}, this product costs ${formatGrosze(Math.abs(basketDelta))} ${up?'more':'less'}. Delivery is calculated separately.`}</Txt>}
  </View>;
}

export function PriceChangeNotice({changes,refresh,hasBaseline}:{changes:PriceChange[];refresh?:SerializedProject['priceRefresh'];hasBaseline:boolean}) {
  const {language}=useLanguage();const pl=language==='pl';
  if (!changes.length && !refresh) return null;
  return <View style={{gap:10,padding:14,borderRadius:14,borderWidth:1,borderColor:Colors.border,backgroundColor:Colors.surface}} accessibilityLiveRegion="polite">
    <Txt w="bold">{pl?'Ceny po odświeżeniu':'Prices after refresh'}</Txt>
    {changes.length>0 ? <>
      <Txt style={{fontSize:13,color:Colors.textSecondary}}>{pl?'Zmiana ceny opakowania lub m² wykładziny w tym samym sklepie od poprzedniego sprawdzenia.':'Change per pack or m² of cut flooring in the same store since your previous check.'}</Txt>
      {changes.map(change=><View key={change.key} style={{gap:6}}><Txt w="medium" style={{fontSize:14}}>{change.productName}</Txt><PriceChangeBadge change={change}/></View>)}
    </> : <Txt style={{fontSize:13}}>{refresh?.confirmedOfferIds.length ? (hasBaseline ? (pl?'Brak zmian cen w ponownie sprawdzonych ofertach.':'No price changes in the rechecked offers.') : (pl?'Zapisano pierwsze ceny. Przy kolejnym sprawdzeniu pokażemy różnice.':'First prices saved. The next check will show any differences.')) : (pl?'Nie udało się potwierdzić nowych cen. Zachowano poprzednie dane i daty.':'New prices could not be confirmed. Previous data and timestamps were retained.')}</Txt>}
    {refresh && <Txt style={{fontSize:12,lineHeight:18,color:Colors.textSecondary}}>{pl ? `Potwierdzone oferty: ${refresh.confirmedOfferIds.length}. Bez nowego odczytu: ${refresh.failedOfferIds.length}.` : `Confirmed offers: ${refresh.confirmedOfferIds.length}. Without a new reading: ${refresh.failedOfferIds.length}.`}{refresh.status==='recent' ? (pl?' Ceny sprawdzono niedawno; wynik pochodzi z ostatniego odczytu.':' Prices were checked recently; the latest reading is shown.') : ''}</Txt>}
  </View>;
}
