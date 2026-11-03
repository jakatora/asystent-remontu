import React,{useState} from 'react';
import {View} from 'react-native';
import {Txt} from '@/components/ui/Txt';
import {Button} from '@/components/ui/Button';
import {Colors} from '@/constants/colors';
import {useLanguage} from '@/context/LanguageContext';
import {formatGrosze} from '@/features/pricing/pricingApi';
import {formatPackageSize,formatPackageUnit} from '@/features/pricing/packageDisplay';
import {storePriceComparisonLabel} from '@/features/pricing/priceChanges';
import type {CatalogRefreshOffer} from '../../../../lib/pricing-service/src/catalog-refresh';

export function CatalogRefreshPrices({offers}:{offers:readonly CatalogRefreshOffer[]}){
  const {language}=useLanguage(),pl=language==='pl';
  const [expanded,setExpanded]=useState(false);
  const date=(s:string)=>new Intl.DateTimeFormat(pl?'pl-PL':'en-GB',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Warsaw'}).format(new Date(s));
  if(!offers.length)return null;
  return <View style={{gap:10}} accessibilityLiveRegion="polite">
    <Txt w="semibold">{pl?'Potwierdzone ceny — bez dostawy':'Confirmed prices — delivery excluded'}</Txt>
    {(expanded?offers:offers.slice(0,1)).map(o=>{
      const pack=`${formatPackageSize(o.packageSize,language)} ${formatPackageUnit(o.unit)}`;
      const change=storePriceComparisonLabel(o.deltaGrosze,language);
      return <View key={o.offerId} style={{gap:6,padding:12,borderWidth:1,borderColor:Colors.border,borderRadius:12,backgroundColor:Colors.surface}}>
        <Txt w="semibold">{o.store}</Txt>
        <Txt w="bold" style={{fontSize:18}}>{formatGrosze(o.priceGrosze)} / {pack}</Txt>
        <Txt style={{fontSize:13,lineHeight:19,color:o.deltaGrosze?o.deltaGrosze>0?Colors.text:Colors.primaryDark:Colors.textSecondary}}>{change}{o.deltaGrosze ? ` / ${pack}` : ''}</Txt>
        {o.previous&&<Txt style={{fontSize:12,lineHeight:18,color:Colors.textSecondary}}>{pl?'Poprzednio w tym sklepie':'Previously at this store'}: {formatGrosze(o.previous.priceGrosze)} / {pack} · {date(o.previous.checkedAt)}</Txt>}
        <Txt style={{fontSize:12,lineHeight:18,color:Colors.textSecondary}}>{pl?'Sprawdzono':'Checked'}: {date(o.checkedAt)} · {pl?'czas Warszawy':'Warsaw time'}</Txt>
      </View>;
    })}
    {offers.length>1&&<Button variant="outline" label={expanded?(pl?'Zwiń listę cen':'Show fewer prices'):(pl?`Pokaż pozostałe ceny (${offers.length-1})`:`Show other prices (${offers.length-1})`)} onPress={()=>setExpanded(value=>!value)}/>}
  </View>;
}
