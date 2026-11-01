import React from 'react';
import {Pressable,View} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {Txt} from '@/components/ui/Txt';
import {Button} from '@/components/ui/Button';
import {Colors} from '@/constants/colors';
import {useLanguage} from '@/context/LanguageContext';
import type {MaterialPriceReference} from '@/types/pricing';
import type {PackageChoice} from '@/features/pricing/packageChoiceModel';
export interface PackageChoiceSectionProps{
  references:readonly MaterialPriceReference[];choices:readonly PackageChoice[];
  ready:boolean;readFailed:boolean;saveFailed:boolean;saving:boolean;commonBasket:boolean;
  onChange:(choices:readonly PackageChoice[])=>Promise<boolean>;onRetry:()=>void;
}
export interface PackageChoiceCopy{
  title:string;explanation:string;readError:string;retry:string;automatic:string;
  accessibility:(ref:MaterialPriceReference,automatic:boolean)=>string;fixed:(ref:MaterialPriceReference)=>string;
}
export function PackageChoiceSection({references,choices,ready,readFailed,saveFailed,saving,commonBasket,onChange,onRetry,copy}:PackageChoiceSectionProps&{copy:PackageChoiceCopy}){
  const{language}=useLanguage(),pl=language==='pl';if(!references.length)return null;
  return <View style={{padding:16,gap:12,borderRadius:16,borderWidth:1,borderColor:Colors.border,backgroundColor:Colors.surface}}>
    <View style={{flexDirection:'row',gap:8,alignItems:'center'}}><Feather name="package" size={20} color={Colors.primary}/><Txt w="bold" style={{flex:1,fontSize:18}}>{copy.title}</Txt></View>
    <Txt style={{lineHeight:21,color:Colors.textSecondary}}>{copy.explanation}</Txt>
    {commonBasket&&<Txt style={{fontSize:13,lineHeight:19,color:Colors.textSecondary}}>{pl?'Domyślnie zachowujemy wybory zapisane w projektach. Zmiana tutaj dotyczy tylko wspólnego koszyka.':'Project choices are preserved by default. Changes here apply only to the common basket.'}</Txt>}
    {readFailed&&<><Txt accessibilityRole="alert" style={{color:Colors.danger}}>{copy.readError}</Txt><Button variant="outline" label={copy.retry} onPress={onRetry}/></>}
    {ready&&references.map(ref=>{const automatic=choices.some(c=>c.from===ref.id);return <View key={ref.id} style={{gap:8,paddingVertical:8}}>
      <Txt w="semibold">{ref.productLabel}</Txt>
      {[false,true].map(value=><Pressable key={String(value)} accessibilityRole="radio" accessibilityLabel={copy.accessibility(ref,value)} aria-checked={automatic===value} accessibilityState={{checked:automatic===value,disabled:saving}} disabled={saving} onPress={()=>{void onChange(value?[...choices.filter(c=>c.from!==ref.id),{from:ref.id,to:'automatic'}]:choices.filter(c=>c.from!==ref.id));}} style={{minHeight:52,padding:12,gap:10,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:automatic===value?Colors.primary:Colors.border,borderRadius:10,backgroundColor:automatic===value?Colors.primaryBg:Colors.surface}}>
        <Feather name={automatic===value?'check-circle':'circle'} size={22} color={automatic===value?Colors.primary:Colors.textSecondary}/><Txt style={{flex:1}}>{value?copy.automatic:commonBasket?(pl?'Zachowaj wybory z projektów i pozycji':'Keep project and item choices'):copy.fixed(ref)}</Txt>
      </Pressable>)}
    </View>;})}
    {saving&&<Txt accessibilityLiveRegion="polite">{pl?'Zapisuję wybór opakowań…':'Saving pack choices…'}</Txt>}
    {saveFailed&&<Txt accessibilityRole="alert" style={{color:Colors.danger}}>{pl?'Nie zapisano wyboru. Zachowano poprzednie ustawienie i wycenę. Spróbuj ponownie.':'The choice was not saved. The previous setting and quote are preserved. Try again.'}</Txt>}
  </View>;
}
