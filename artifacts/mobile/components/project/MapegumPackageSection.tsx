import React from 'react';
import {useLanguage} from '@/context/LanguageContext';
import {PackageChoiceSection,type PackageChoiceSectionProps} from './PackageChoiceSection';
export function MapegumPackageSection(props:PackageChoiceSectionProps){
  const{language}=useLanguage(),pl=language==='pl';
  return <PackageChoiceSection {...props} copy={{
    title:pl?'Opakowania folii Mapegum WPS':'Mapegum WPS bucket sizes',
    explanation:pl?'Podaj potrzebne kilogramy gotowej folii. Porównamy wiadra Mapegum WPS 3, 5, 10 i 20 kg oraz ich mieszanki z dostawą całego zestawu.':'Enter the kilograms of ready-to-use membrane needed. We compare Mapegum WPS 3, 5, 10 and 20 kg buckets and mixtures, including delivery of the whole basket.',
    readError:pl?'Nie odczytano wyboru opakowań Mapegum. Wycena jest wstrzymana, aby zachować Twój wybór.':'Mapegum bucket choices could not be read. Pricing is paused to preserve your selection.',
    retry:pl?'Odczytaj wybór opakowań Mapegum ponownie':'Read Mapegum bucket choices again',
    automatic:pl?'Dobierz opakowania 3 / 5 / 10 / 20 kg':'Choose 3 / 5 / 10 / 20 kg buckets',
    accessibility:(ref,value)=>pl?`${value?'Automatyczny dobór':'Zachowaj wybór'} opakowań Mapegum — ${ref.packageSize} kg`:`${value?'Automatic':'Keep selected'} Mapegum buckets — ${ref.packageSize} kg`,
    fixed:ref=>pl?`Tylko wybrane wiadro ${ref.packageSize} kg`:`Only the selected ${ref.packageSize} kg bucket`,
  }}/>;
}
