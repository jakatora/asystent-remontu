import React from 'react';
import {useLanguage} from '@/context/LanguageContext';
import {PackageChoiceSection,type PackageChoiceSectionProps} from './PackageChoiceSection';
const variant=(label:string)=>label.toLowerCase().includes('transparent')?'Transparent':'PROFI';
export function CeresitPackageSection(props:PackageChoiceSectionProps){
  const{language}=useLanguage(),pl=language==='pl';
  const viva=props.references.some(ref=>ref.materialType==='grout'),primer=props.references.some(ref=>ref.materialType==='primer');
  return <PackageChoiceSection {...props} copy={{
    title:viva?(pl?primer?'Opakowania Ceresit':'Wiadra fugi Ceresit Viva White 01':primer?'Ceresit pack sizes':'Ceresit Viva White 01 bucket sizes'):pl?'Opakowania gruntów Ceresit CT17':'Ceresit CT17 can sizes',
    explanation:viva?(pl?'Porównamy wiadra Viva White 01 o masie 2 i 4 kg oraz ich mieszanki, z dostawą całego zestawu. Nie zmieniamy produktu ani koloru; zachowujemy potrzebne kilogramy. Do jednego pomieszczenia zamów jedną partię produkcyjną White 01.'+(primer?' Grunty CT17 PROFI i Transparent dobieramy osobno w kanistrach 5/10 l.':''):'We compare Viva White 01 2 and 4 kg buckets and mixtures with delivery for the whole basket. The product, shade and required kilograms stay the same. Order one manufacturing batch of White 01 for each room.'+(primer?' CT17 PROFI and Transparent are kept separate in 5/10 l cans.':'')):pl?'Porównamy kanistry 5 i 10 l oraz ich mieszanki z dostawą całego zestawu. PROFI i Transparent liczymy osobno. Zmieniamy tylko wielkość opakowań wybranego gruntu; potrzebne litry pozostają zachowane.':'We compare 5 and 10 l cans and mixtures with whole-basket delivery. PROFI and Transparent are kept separate. Only pack sizes change; the required litres are preserved.',
    readError:pl?'Nie odczytano wyboru opakowań Ceresit. Wycena jest wstrzymana, aby zachować wybrane produkty.':'Ceresit pack choices could not be read. Pricing is paused to preserve the selected products.',
    retry:pl?'Odczytaj wybór opakowań Ceresit ponownie':'Read Ceresit pack choices again',
    automatic:viva?(pl?primer?'Dobierz opakowania wybranego produktu':'Dobierz wiadra 2 / 4 kg':primer?'Choose pack sizes of this product':'Choose 2 / 4 kg buckets'):pl?'Dobierz kanistry 5 / 10 l':'Choose 5 / 10 l cans',
    accessibility:(ref,value)=>ref.materialType==='grout'?(pl?`${value?'Automatyczny dobór':'Zachowaj wybór'} Ceresit Viva White 01 — ${ref.packageSize} kg`:`${value?'Automatic':'Keep selected'} Ceresit Viva White 01 — ${ref.packageSize} kg`):pl?`${value?'Automatyczny dobór':'Zachowaj wybór'} Ceresit CT17 ${variant(ref.productLabel)} — ${ref.packageSize} l`:`${value?'Automatic':'Keep selected'} Ceresit CT17 ${variant(ref.productLabel)} — ${ref.packageSize} l`,
    fixed:ref=>ref.materialType==='grout'?(pl?`Tylko wybrane wiadro ${ref.packageSize} kg`:`Only the selected ${ref.packageSize} kg bucket`):pl?`Tylko wybrany kanister ${ref.packageSize} l`:`Only the selected ${ref.packageSize} l can`,
  }}/>;
}
