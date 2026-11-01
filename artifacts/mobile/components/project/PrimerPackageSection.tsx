import React from 'react';
import {Pressable,View} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {Txt} from '@/components/ui/Txt';
import {Button} from '@/components/ui/Button';
import {Colors} from '@/constants/colors';
import {useLanguage} from '@/context/LanguageContext';
import {PRIMER_PACKAGE_PRODUCTS,type PrimerPackageChoice} from '@/features/pricing/primerPackageChoice';
interface Props{
  references:typeof PRIMER_PACKAGE_PRODUCTS;choices:readonly PrimerPackageChoice[];
  ready:boolean;readFailed:boolean;saveFailed:boolean;saving:boolean;commonBasket:boolean;
  onChange:(choices:readonly PrimerPackageChoice[])=>Promise<boolean>;onRetry:()=>void;
}
export function PrimerPackageSection({references,choices,ready,readFailed,saveFailed,saving,commonBasket,onChange,onRetry}:Props){
  const{language}=useLanguage(),pl=language==='pl';if(!references.length)return null;
  return <View style={{padding:16,gap:12,borderRadius:16,borderWidth:1,borderColor:Colors.border,backgroundColor:Colors.surface}}>
    <View style={{flexDirection:'row',gap:8,alignItems:'center'}}><Feather name="package" size={20} color={Colors.primary}/><Txt w="bold" style={{flex:1,fontSize:18}}>{pl?'Opakowania gruntu Primer G Pro':'Primer G Pro pack sizes'}</Txt></View>
    <Txt style={{lineHeight:21,color:Colors.textSecondary}}>{pl?'Podaj potrzebne litry koncentratu. Automatyczny dobór porówna kanistry 1, 5, 10 i 20 l oraz ich mieszanki z dostawą całego zestawu. Wody do rozcieńczenia nie doliczamy do zakupów.':'Enter the litres of concentrate needed. Automatic sizing compares 1, 5, 10 and 20 l cans and mixtures, including delivery of the whole basket. Dilution water is not purchased primer.'}</Txt>
    {commonBasket&&<Txt style={{fontSize:13,lineHeight:19,color:Colors.textSecondary}}>{pl?'Domyślnie zachowujemy wybory zapisane w projektach. Zmiana tutaj dotyczy tylko wspólnego koszyka.':'Project choices are preserved by default. Changes here apply only to the common basket.'}</Txt>}
    {readFailed&&<><Txt accessibilityRole="alert" style={{color:Colors.danger}}>{pl?'Nie odczytano wyboru opakowań gruntu. Wycena jest wstrzymana, aby zachować Twój wybór.':'Primer pack choices could not be read. Pricing is paused to preserve your selection.'}</Txt><Button variant="outline" label={pl?'Odczytaj wybór opakowań gruntu ponownie':'Read primer pack choices again'} onPress={onRetry}/></>}
    {ready&&references.map(ref=>{const automatic=choices.some(c=>c.from===ref.id);return <View key={ref.id} style={{gap:8,paddingVertical:8}}>
      <Txt w="semibold">{ref.productLabel}</Txt>
      {[false,true].map(value=><Pressable key={String(value)} accessibilityRole="radio" accessibilityLabel={pl?`${value?'Automatyczny dobór':'Zachowaj wybór'} opakowań gruntu — ${ref.packageSize} l`:`${value?'Automatic':'Keep selected'} primer packs — ${ref.packageSize} l`} accessibilityState={{checked:automatic===value,disabled:saving}} disabled={saving} onPress={()=>{void onChange(value?[...choices.filter(c=>c.from!==ref.id),{from:ref.id,to:'automatic'}]:choices.filter(c=>c.from!==ref.id));}} style={{minHeight:52,padding:12,gap:10,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:automatic===value?Colors.primary:Colors.border,borderRadius:10,backgroundColor:automatic===value?Colors.primaryBg:Colors.surface}}>
        <Feather name={automatic===value?'check-circle':'circle'} size={22} color={automatic===value?Colors.primary:Colors.textSecondary}/><Txt style={{flex:1}}>{value?(pl?'Dobierz opakowania 1 / 5 / 10 / 20 l':'Choose 1 / 5 / 10 / 20 l cans'):(commonBasket?(pl?'Zachowaj wybory z projektów i pozycji':'Keep project and item choices'):(pl?`Tylko wybrane opakowanie ${ref.packageSize} l`:`Only the selected ${ref.packageSize} l can`))}</Txt>
      </Pressable>)}
    </View>;})}
    {saving&&<Txt accessibilityLiveRegion="polite">{pl?'Zapisuję wybór opakowań…':'Saving pack choices…'}</Txt>}
    {saveFailed&&<Txt accessibilityRole="alert" style={{color:Colors.danger}}>{pl?'Nie zapisano wyboru. Zachowano poprzednie ustawienie i wycenę. Spróbuj ponownie.':'The choice was not saved. The previous setting and quote are preserved. Try again.'}</Txt>}
  </View>;
}
