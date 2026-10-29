import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatGrosze } from '@/features/pricing';
import { purchaseSummary, type PurchaseSnapshot } from '@/features/pricing/purchaseSummary';

export function ProjectPurchaseSummary({ snapshot, onCompare }: { snapshot: PurchaseSnapshot | null; onCompare: () => void }) {
  const { language } = useLanguage(), pl = language === 'pl';
  const [now, setNow] = useState(Date.now);
  useEffect(() => { setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 15_000); return () => clearInterval(timer); }, [snapshot]);
  const summary = purchaseSummary(snapshot, Math.max(now, Date.now()));
  return <View style={{ padding: 16, gap: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.primaryBg }}>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Feather name="shopping-bag" size={20} color={Colors.primary}/><Txt w="bold" style={{flex:1,fontSize:18}}>{pl ? 'Koszt zakupów w sklepach' : 'Store purchase cost'}</Txt></View>
    {summary.status === 'unavailable' || summary.status === 'expired' ? <Txt style={{lineHeight:21}}>{summary.status === 'expired'
      ? (pl ? 'Poprzednie porównanie wymaga odświeżenia. Sprawdź aktualny zestaw przed zakupem.' : 'The previous comparison needs refreshing. Check the current basket before buying.')
      : (pl ? 'Sprawdź wybrane modele i pełne opakowania w sklepach. Materiały oznaczone jako „Mam” lub „Kupione” pominiemy w zakupach.' : 'Compare your selected models and full packs in stores. Materials marked as owned or purchased are excluded from the shopping basket.')}</Txt>
    : summary.status === 'empty' ? <Txt style={{lineHeight:21}}>{pl ? 'Nie ma materiałów do dokupienia z tej listy. Narzędzia, robociznę i inne potrzebne elementy sprawdź osobno.' : 'There are no materials left to buy from this list. Check tools, labour and other required items separately.'}</Txt>
    : <>
      <Txt w="semibold">{summary.selectedStore ? `${pl?'Koszyk':'Basket'}: ${summary.selectedStore}` : pl ? 'Wybrane oferty sklepów' : 'Selected store offers'}</Txt>
      {summary.materialsGrosze !== null && <Txt>{pl ? 'Materiały z potwierdzoną ceną' : 'Materials with a confirmed price'}: {formatGrosze(summary.materialsGrosze)}</Txt>}
      {summary.status === 'complete' ? <>
        {summary.mode === 'shipping' && <Txt>{pl?'Dostawa':'Delivery'}{summary.postalCode ? ` (${summary.postalCode})` : ''}: {formatGrosze(summary.deliveryGrosze!)}</Txt>}
        <Txt w="bold" style={{fontSize:24,color:Colors.primaryDark}}>{formatGrosze(summary.totalGrosze!)}</Txt>
        {summary.storeSteps.length > 1 && <View style={{padding:12,gap:9,borderRadius:12,borderWidth:1,borderColor:Colors.border,backgroundColor:Colors.surface}}>
          <Txt w="bold" style={{fontSize:15}}>{pl?`Kup w ${summary.storeSteps.length} sklepach`:`Buy from ${summary.storeSteps.length} stores`}</Txt>
          {summary.storeSteps.map((step,index)=><View key={step.store} style={{gap:3,paddingTop:8,borderTopWidth:1,borderTopColor:Colors.borderLight}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',gap:10}}><Txt w="semibold" style={{flex:1,fontSize:15}}>{index+1}. {step.store}</Txt><Txt w="bold" style={{fontSize:15}}>{formatGrosze(step.totalGrosze)}</Txt></View>
            <Txt style={{fontSize:13,lineHeight:19,color:Colors.textSecondary}}>{pl?'Dostawa':'Delivery'}: {formatGrosze(step.deliveryGrosze)}{step.orderCount>1?pl?` · ${step.orderCount} osobne zamówienia`:` · ${step.orderCount} separate orders`:''}</Txt>
            <Txt style={{fontSize:13,lineHeight:19}}>{step.products.slice(0,2).join(' · ')}{step.products.length>2?pl?` · +${step.products.length-2} produktów`:` · +${step.products.length-2} products`:''}</Txt>
          </View>)}
        </View>}
        <Txt style={{fontSize:13,lineHeight:19}}>{summary.mode === 'pickup' ? (pl?'Zestaw do odbioru. Dojazd nie jest wliczony; potwierdź cenę i zapas w wybranych placówkach.':'Basket for collection. Travel is excluded; confirm prices and stock at the chosen branches.') : (pl?'Wycenione materiały z dostawą. Narzędzia i robocizna są osobno.':'Quoted materials including delivery. Tools and labour are separate.')}</Txt>
      </> : <Txt accessibilityRole="alert" style={{lineHeight:21}}>{summary.status === 'partial'
        ? (pl?`Niepełny koszyk. Braki do potwierdzenia: ${summary.missing || '—'}. Pełna suma nie jest jeszcze dostępna.`:`Incomplete basket. Items to confirm: ${summary.missing || '—'}. A complete total is not available yet.`)
        : (pl?'Brakuje pełnej wyceny dostawy. Kwota materiałów nie jest ceną całego zestawu z transportem.':'A complete delivery quote is missing. The material amount is not the total including transport.')}</Txt>}
      {summary.availablePart&&<View style={{gap:4}}>
        <Txt w="semibold">{pl?'Dostępna część z dostawą':'Available part with delivery'}: {formatGrosze(summary.availablePart.totalGrosze)}</Txt>
        <Txt style={{fontSize:13,lineHeight:19}}>{pl?'Materiały':'Materials'}: {formatGrosze(summary.availablePart.materialsGrosze)} · {pl?'ich dostawa':'their delivery'}: {formatGrosze(summary.availablePart.deliveryGrosze)}. {pl?'Brakujące zakupy nie są wliczone.':'Missing purchases are excluded.'}</Txt>
      </View>}
      {summary.separateOrders.map(part=><Txt key={part.store} accessibilityRole="alert" w="semibold" style={{fontSize:13,lineHeight:19}}>{pl?`Ta cena wymaga ${part.count} osobnych zamówień w ${part.store}. Podział produktów sprawdzisz w „Gdzie najtaniej”.`:`This price requires ${part.count} separate orders at ${part.store}. See the product grouping in the price comparison.`}</Txt>)}
      {summary.limited && <Txt style={{fontSize:13,lineHeight:19}}>{pl?'Porównanie obejmuje potwierdzone wyceny. Inne sklepy lub kombinacje mogą być tańsze.':'The comparison covers confirmed quotes. Other stores or combinations may cost less.'}</Txt>}
      {summary.products.length > 0 && <Txt numberOfLines={3} style={{fontSize:12,lineHeight:18,color:Colors.textSecondary}}>{pl?'Modele w wycenie':'Quoted models'}: {summary.products.join(' · ')}</Txt>}
      <Txt style={{fontSize:12,lineHeight:18,color:Colors.textSecondary}}>{pl?'Kwota obejmuje wycenione pozycje. Pozostałe elementy montażowe, narzędzia i robociznę sprawdź osobno.':'This amount covers the quoted items. Check other installation parts, tools and labour separately.'}</Txt>
      <Txt style={{fontSize:12,color:Colors.textSecondary}}>{pl?'Porównanie z':'Compared at'} {new Date(summary.observedAt).toLocaleTimeString(pl?'pl-PL':'en-GB',{hour:'2-digit',minute:'2-digit'})}. {pl?'Szczegóły i daty cen w porównaniu sklepów.':'See store comparison for details and price dates.'}</Txt>
    </>}
    <Button label={pl?'Otwórz porównanie sklepów':'Open store comparison'} onPress={onCompare} variant="outline"/>
  </View>;
}
