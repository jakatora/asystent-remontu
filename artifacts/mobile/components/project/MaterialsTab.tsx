import { useMaterialPreview, pricingProductPhoto } from '@/features/pricing/useMaterialPreview';
import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import type { CalculationResult } from '@/types/domain';
import type { QualityTier } from '@/types/pricing';
import { useLanguage } from '@/context/LanguageContext';
import { ProductImage } from './ProductImage';
import { getRequiredQuantity } from '@/features/calculator/requirements';

interface MaterialsTabProps {
  calc: CalculationResult;
  projectId: string;
  qualityTier: QualityTier;
  hasShoppingItems: boolean;
  onGenerateShoppingList: () => Promise<void>;
  onCompareStores: () => void;
}

export function MaterialsTab({ calc, projectId, qualityTier, hasShoppingItems, onGenerateShoppingList, onCompareStores }: MaterialsTabProps) {
  const { t, language } = useLanguage(), pl=language==='pl';
  const {stage,failed}=useMaterialPreview(projectId,calc,qualityTier);
  return <View style={{gap:12}}>
    <Txt w="bold" style={{fontSize:20}}>{t('cmp.MaterialsTab.title')}</Txt>
    <Txt style={{fontSize:14,lineHeight:21,color:Colors.textSecondary}}>{pl?'Tu sprawdzisz zapotrzebowanie. W porównaniu sklepów zobaczysz wybrane opakowania, aktualne oferty i dostawę. Ilość potrzebna do pracy może być mniejsza niż zawartość kupowanych opakowań.':'Check quantities here. The store comparison shows selected packs, current offers and delivery. Required quantities may be smaller than full packs.'}</Txt>
    <Button label={t('cmp.MaterialsTab.compareStores')} onPress={onCompareStores} variant="outline" fullWidth/>
    {calc.jobId==='eps-insulation-bso'&&<Txt style={{lineHeight:20}}>{pl?'Dobierz produkty w jednym zgodnym systemie ocieplenia i według projektu.':'Select products from one compatible insulation system and follow the design.'}</Txt>}
    {failed&&<Txt accessibilityRole="alert">{pl?'Nie odczytano wybranych modeli. Otwórz porównanie sklepów, aby sprawdzić ustawienia.':'Selected models could not be read. Open the store comparison to check settings.'}</Txt>}
    {calc.materials.map((line,index)=>{
      const product=stage?.materials.find(row=>row.material.id===line.material.id)?.material;
      const photo=product?pricingProductPhoto(product):undefined;
      return <View key={`${line.material.id}:${index}`} style={{gap:10,padding:14,borderRadius:14,backgroundColor:Colors.surface,borderWidth:1,borderColor:Colors.border}}>
        <View style={{flexDirection:'row',gap:12,alignItems:'flex-start'}}>
          <ProductImage uri={photo} name={product?.name??line.material.name} size={64}/>
          <View style={{flex:1,minWidth:0,gap:5}}>
            <Txt w="semibold" style={{fontSize:15,lineHeight:21}}>{line.material.name}</Txt>
            {product&&product.name!==line.material.name&&<Txt style={{fontSize:13,lineHeight:19,color:Colors.textSecondary}}>{pl?'Model do porównania':'Model for comparison'}: {product.name}</Txt>}
          </View>
        </View>
        <Txt w="semibold" style={{fontSize:16,lineHeight:23}}>{pl?'Potrzebujesz':'Required'}: {line.quantityKnown===false?(pl?'ilość do ustalenia':'quantity to confirm'):`${getRequiredQuantity(line,calc).toLocaleString(pl?'pl-PL':'en-GB',{maximumFractionDigits:3})} ${line.material.unit}`}</Txt>
        {line.material.notes&&<Txt style={{fontSize:13,lineHeight:19,color:Colors.textSecondary}}>{line.material.notes.replace(/Referencyjny produkt:[^.]*\./g,'').trim()}</Txt>}
      </View>;
    })}
    <Button label={hasShoppingItems?t('cmp.MaterialsTab.refreshList'):t('cmp.MaterialsTab.generateList')} onPress={onGenerateShoppingList} fullWidth icon={<Feather name="shopping-cart" size={16} color="#fff"/>}/>
  </View>;
}
