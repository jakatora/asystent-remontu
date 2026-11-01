import React from 'react';
import {useLanguage} from '@/context/LanguageContext';
import {PackageChoiceSection,type PackageChoiceSectionProps} from './PackageChoiceSection';
export function PrimerPackageSection(props:PackageChoiceSectionProps){
  const{language}=useLanguage(),pl=language==='pl';
  return <PackageChoiceSection {...props} copy={{
    title:pl?'Opakowania gruntu Primer G Pro':'Primer G Pro pack sizes',
    explanation:pl?'Podaj potrzebne litry koncentratu. Automatyczny dobór porówna kanistry 1, 5, 10 i 20 l oraz ich mieszanki z dostawą całego zestawu. Wody do rozcieńczenia nie doliczamy do zakupów.':'Enter the litres of concentrate needed. Automatic sizing compares 1, 5, 10 and 20 l cans and mixtures, including delivery of the whole basket. Dilution water is not purchased primer.',
    readError:pl?'Nie odczytano wyboru opakowań gruntu. Wycena jest wstrzymana, aby zachować Twój wybór.':'Primer pack choices could not be read. Pricing is paused to preserve your selection.',
    retry:pl?'Odczytaj wybór opakowań gruntu ponownie':'Read primer pack choices again',
    automatic:pl?'Dobierz opakowania 1 / 5 / 10 / 20 l':'Choose 1 / 5 / 10 / 20 l cans',
    accessibility:(ref,value)=>pl?(value?'Automatyczny dobór':'Zachowaj wybór')+' opakowań gruntu — '+ref.packageSize+' l':(value?'Automatic':'Keep selected')+' primer packs — '+ref.packageSize+' l',
    fixed:ref=>pl?'Tylko wybrane opakowanie '+ref.packageSize+' l':'Only the selected '+ref.packageSize+' l can',
  }}/>;
}
