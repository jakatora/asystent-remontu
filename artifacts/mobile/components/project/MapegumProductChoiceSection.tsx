import React from 'react';
import {View} from 'react-native';
import {Txt} from '@/components/ui/Txt';
import {Button} from '@/components/ui/Button';
import {Colors} from '@/constants/colors';
import {useLanguage} from '@/context/LanguageContext';
import {getProductPhoto} from '@/data/products/photos';
import {MAPEGUM_PRODUCT_PAIRS,mapegumProductReference,mapegumProductEan,type MapegumProductChoice} from '@/features/pricing/mapegumProductChoice';
import type {MaterialPriceReference} from '@/types/pricing';
import {ProductImage} from './ProductImage';
import {PreferenceRecoveryAction,type PreferenceRecoveryProps} from './PreferenceRecoveryAction';

interface Props extends PreferenceRecoveryProps {
  references:readonly MaterialPriceReference[]; choices:readonly MapegumProductChoice[];
  ready:boolean;readFailed:boolean;saveFailed:boolean;saving:boolean;commonBasket:boolean;
  onChange:(choices:readonly MapegumProductChoice[])=>Promise<boolean>;onRetry:()=>void;
}
export function MapegumProductChoiceSection({references,choices,ready,readFailed,saveFailed,saving,commonBasket,onChange,onRetry,...recovery}:Props){
  const{language}=useLanguage(),pl=language==='pl';
  if(!references.length&&!readFailed&&!recovery.recovered)return null;
  return <View style={{padding:16,gap:12,borderRadius:16,borderWidth:1,borderColor:Colors.border,backgroundColor:Colors.surface}}>
    <Txt w="bold" style={{fontSize:18}}>{pl?'Wybierz opakowanie Mapegum WPS':'Choose a Mapegum WPS product'}</Txt>
    <Txt style={{lineHeight:21,color:Colors.textSecondary}}>{pl?'W projekcie zapisano wcześniejszy kod produktu. Możesz wybrać aktualne opakowanie o tej samej masie. Przed zakupem sprawdź etykietę i kartę techniczną. Cenę i dostawę sprawdzimy po wyborze.':'The project uses an earlier product code. You can choose the current pack of the same weight. Check its label and technical sheet before purchase. We recheck price and delivery after selection.'}</Txt>
    {commonBasket&&<Txt style={{lineHeight:21,color:Colors.textSecondary}}>{pl?'Ta zmiana dotyczy tylko wspólnego koszyka. Wybory zapisane w projektach pozostają zachowane.':'This change applies only to the common basket. Project selections are preserved.'}</Txt>}
    {readFailed&&<><Txt accessibilityRole="alert" style={{color:Colors.danger}}>{pl?'Nie odczytano wyboru produktu. Wycena jest wstrzymana.':'The product choice could not be read. Pricing is paused.'}</Txt><Button variant="outline" label={pl?'Odczytaj wybór produktu ponownie':'Read product choice again'} disabled={recovery.recovering} onPress={onRetry}/></>}
    <PreferenceRecoveryAction key={recovery.recoveryKey} {...recovery} readFailed={readFailed} kind="products"/>
    {ready&&references.map(ref=>{
      const pair=MAPEGUM_PRODUCT_PAIRS.find(pair=>pair.from===ref.id)!,target=mapegumProductReference(pair.to)!,selected=choices.some(choice=>choice.from===pair.from);
      const photo=getProductPhoto({id:target.id,ean:mapegumProductEan(target.id)});
      return <View key={ref.id} style={{gap:10,paddingVertical:8}}>
        <Txt>{pl?'Zapisany produkt: ':'Saved product: '}{ref.productLabel} · EAN {mapegumProductEan(ref.id)}</Txt>
        <View style={{flexDirection:'row',gap:12,alignItems:'center'}}><ProductImage uri={photo} name={target.productLabel}/><View style={{flex:1,gap:4}}><Txt w="semibold">{target.productLabel}</Txt><Txt style={{color:Colors.textSecondary}}>EAN {mapegumProductEan(target.id)}</Txt></View></View>
        {selected&&<Txt accessibilityLiveRegion="polite" style={{color:Colors.primary}}>{pl?'Wybrano aktualne opakowanie. Wycena uwzględnia jego kod produktu.':'Current pack selected. Pricing uses its product code.'}</Txt>}
        <Button variant={selected?'ghost':'outline'} disabled={saving} label={pl?selected?`Przywróć zapisany produkt Mapegum ${ref.packageSize} kg`:`Porównaj aktualne opakowanie Mapegum ${ref.packageSize} kg`:selected?`Restore saved Mapegum ${ref.packageSize} kg product`:`Compare current Mapegum ${ref.packageSize} kg pack`} onPress={()=>{void onChange(selected?choices.filter(choice=>choice.from!==pair.from):[...choices.filter(choice=>choice.from!==pair.from),pair]);}}/>
      </View>;
    })}
    {saving&&<Txt accessibilityLiveRegion="polite">{pl?'Zapisuję wybór produktu…':'Saving product choice…'}</Txt>}
    {saveFailed&&<Txt accessibilityRole="alert" style={{color:Colors.danger}}>{pl?'Nie zapisano wyboru. Zachowano poprzedni produkt. Spróbuj ponownie.':'The choice was not saved. The previous product is preserved. Try again.'}</Txt>}
  </View>;
}
