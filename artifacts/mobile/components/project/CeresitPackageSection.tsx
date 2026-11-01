import React from 'react';
import {useLanguage} from '@/context/LanguageContext';
import {PackageChoiceSection,type PackageChoiceSectionProps} from './PackageChoiceSection';
const variant=(label:string)=>label.toLowerCase().includes('transparent')?'Transparent':'PROFI';
export function CeresitPackageSection(props:PackageChoiceSectionProps){
  const{language}=useLanguage(),pl=language==='pl';
  return <PackageChoiceSection {...props} copy={{
    title:pl?'Opakowania gruntów Ceresit CT17':'Ceresit CT17 can sizes',
    explanation:pl?'Porównamy kanistry 5 i 10 l oraz ich mieszanki z dostawą całego zestawu. PROFI i Transparent liczymy osobno. Zmieniamy tylko wielkość opakowań wybranego gruntu; potrzebne litry pozostają zachowane.':'We compare 5 and 10 l cans and mixtures with whole-basket delivery. PROFI and Transparent are kept separate. Only pack sizes change; the required litres are preserved.',
    readError:pl?'Nie odczytano wyboru opakowań Ceresit CT17. Wycena jest wstrzymana, aby zachować wybory PROFI i Transparent.':'Ceresit CT17 choices could not be read. Pricing is paused to preserve PROFI and Transparent selections.',
    retry:pl?'Odczytaj wybór opakowań Ceresit ponownie':'Read Ceresit pack choices again',
    automatic:pl?'Dobierz kanistry 5 / 10 l':'Choose 5 / 10 l cans',
    accessibility:(ref,value)=>pl?`${value?'Automatyczny dobór':'Zachowaj wybór'} Ceresit CT17 ${variant(ref.productLabel)} — ${ref.packageSize} l`:`${value?'Automatic':'Keep selected'} Ceresit CT17 ${variant(ref.productLabel)} — ${ref.packageSize} l`,
    fixed:ref=>pl?`Tylko wybrany kanister ${ref.packageSize} l`:`Only the selected ${ref.packageSize} l can`,
  }}/>;
}
