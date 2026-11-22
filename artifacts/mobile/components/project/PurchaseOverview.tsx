import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatGrosze } from '@/features/pricing';
import { purchaseSummary, type PurchaseSnapshot } from '@/features/pricing/purchaseSummary';

/** Uses the same verified totals and expiry guards as the detailed comparison. */
export function PurchaseOverview({snapshot, includesTools=false, omissions=0, onDetails}: {snapshot:PurchaseSnapshot|null; includesTools?:boolean; omissions?:number; onDetails?:()=>void}) {
  const {language}=useLanguage(), pl=language==='pl';
  const [now,setNow]=useState(Date.now);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),15000);return()=>clearInterval(timer);},[]);
  const result=purchaseSummary(snapshot,Math.max(now,Date.now()));
  return <View style={{gap:8,padding:16,borderRadius:16,borderWidth:1,borderColor:Colors.primary,backgroundColor:Colors.primaryBg}} accessibilityLiveRegion="polite">
    <Txt w="bold" style={{fontSize:18}}>{pl?'Twoje zakupy':'Your purchases'}</Txt>
    {result.status==='complete'?<>
      <Txt w="bold" style={{fontSize:30,color:Colors.primaryDark}}>{formatGrosze(result.totalGrosze!)}</Txt>
      <Txt style={{lineHeight:20}}>{includesTools?(pl?'Materiały i wybrane narzędzia':'Materials and selected tools'):(pl?'Materiały':'Materials')}: {formatGrosze(result.materialsGrosze!)}{result.mode==='shipping'?` + ${pl?'dostawa':'delivery'} ${formatGrosze(result.deliveryGrosze!)}`:''}</Txt>
      <Txt w="semibold" style={{lineHeight:20}}>{result.storeSteps.map(step=>step.store).join(' + ')}</Txt>
      <Txt style={{fontSize:13,lineHeight:19}}>{result.mode==='shipping'?(pl?`Z dostawą${result.postalCode?' do '+result.postalCode:''}.`:`With delivery${result.postalCode?' to '+result.postalCode:''}.`):(pl?'Odbiór osobisty; dojazd poza kwotą.':'Collection; travel excluded.')}{' '}{pl?'Robocizna poza kwotą.':'Labour excluded.'}{!includesTools?' '+(pl?'Narzędzia sprawdź osobno.':'Check tools separately.'):''}</Txt>
      {result.basketChoice!=='lowest'&&result.basketChoice&&<Txt style={{fontSize:13,lineHeight:19}}>{pl?'Kwota wybranego wariantu zakupów.':'Total for the selected purchase option.'}</Txt>}
      {result.limited&&<Txt style={{fontSize:13,lineHeight:19}}>{pl?'Porównanie obejmuje potwierdzone wyceny. Inne sklepy mogą być tańsze.':'The comparison covers confirmed quotes. Other stores may be cheaper.'}</Txt>}
      {result.separateOrders.length>0&&<Txt style={{fontSize:13,lineHeight:19}}>{pl?'Cena wymaga osobnych zamówień — podział w szczegółach.':'This price requires separate orders — see details.'}</Txt>}
    </>:<Txt style={{lineHeight:21}}>{result.status==='partial'?(pl?'Koszyk jest niepełny. Uzupełnij brakujące produkty lub ilości przed porównaniem pełnej ceny.':'The basket is incomplete. Confirm missing products or quantities first.'):result.status==='shipping_unknown'?(pl?'Ceny produktów są dostępne. Do pełnej kwoty potrzebna jest potwierdzona dostawa.':'Product prices are available. A confirmed delivery quote is needed for the full total.'):result.status==='expired'?(pl?'Wycena wygasła. Odśwież porównanie przed zakupem.':'The quote expired. Refresh the comparison before buying.'):result.status==='empty'?(pl?'Nie ma pozycji do dokupienia w tym porównaniu.':'No items remain to buy in this comparison.'):(pl?'Przygotowujemy porównanie. Wybierz produkty i podaj kod dostawy, aby zobaczyć pełną kwotę.':'Preparing the comparison. Select products and enter a delivery postcode to see the full total.')}</Txt>}
    {omissions>0&&<Txt accessibilityRole="alert" style={{lineHeight:20}}>{pl?`Poza kwotą: ${omissions} pozycji narzędzi do ustalenia lub wypożyczenia.`:`Excluded: ${omissions} tool items to confirm or rent.`}</Txt>}
    {onDetails&&<Button label={pl?'Dostawa i szczegóły porównania':'Delivery and comparison details'} variant="outline" onPress={onDetails}/>}
  </View>;
}
