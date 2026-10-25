import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import type { CalculationResult } from '@/types/domain';
import { useLanguage } from '@/context/LanguageContext';
import { ProductImage } from './ProductImage';
import { getProductPhoto } from '@/data/products/photos';

interface MaterialsTabProps {
  calc: CalculationResult;
  hasShoppingItems: boolean;
  onGenerateShoppingList: () => Promise<void>;
}

export function MaterialsTab({ calc, hasShoppingItems, onGenerateShoppingList }: MaterialsTabProps) {
  const { t, language } = useLanguage();
  return (
    <View style={{ gap: 12 }}>
      <Txt w="bold" style={{ fontSize: 18, color: Colors.text, marginBottom: 4 }}>
        {t('cmp.MaterialsTab.title')}
      </Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>
        {calc.jobId === 'eps-insulation-bso' ? (language === 'pl' ? 'Ilości wynikają z obmiarów i pokazanych założeń zapasu. Dobierz produkty w jednym zgodnym systemie ocieplenia i według projektu.' : 'Quantities follow your measurements and stated reserve assumptions. Select products from a compatible insulation system and follow its design.') : t('cmp.MaterialsTab.subtitle')}
      </Txt>
      {Boolean(calc.quantityIssues?.length) && <Txt accessibilityRole="alert" style={{ color: Colors.warning, lineHeight: 20 }}>{language === 'pl' ? `Dla ${calc.quantityIssues!.length} pozycji podaj ilości z projektu lub karty wybranego produktu. Pokazany koszt jest częściowym szacunkiem według cen referencyjnych.` : `Enter design or selected-product quantities for ${calc.quantityIssues!.length} items. The displayed cost is a partial estimate using reference prices.`}</Txt>}

      {calc.materials.map((m, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.surface,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            gap: 10,
          }}
        >
          <ProductImage uri={getProductPhoto(m.material)} name={m.material.name} size={52} />
          <View style={{ flex: 1 }}>
            <Txt w="medium" style={{ fontSize: 14, color: Colors.text }}>
              {m.material.name}
            </Txt>
            {m.packs !== undefined && m.material.packaging && <Txt w="semibold" style={{ fontSize: 13, marginTop: 4, color: Colors.text }}>{t('upgrade.product.packagingLabel', { count: m.packs, label: m.material.packaging.label })}</Txt>}
            {m.material.notes && (
              <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
                {m.material.notes}
              </Txt>
            )}
          </View>
          <View style={{ alignItems: 'center', minWidth: 52 }}>
            <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>
              {m.quantityKnown === false ? (language === 'pl' ? 'Do ustalenia' : 'To confirm') : m.quantity.toLocaleString(language === 'pl' ? 'pl-PL' : 'en-GB', { maximumFractionDigits: 3 })}
            </Txt>
            <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
              {m.material.unit}
            </Txt>
          </View>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.primary, minWidth: 70, textAlign: 'right' }}>
            {m.quantityKnown === false ? '—' : formatCurrency(m.cost)}
          </Txt>
        </View>
      ))}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: Colors.primaryBg,
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: Colors.primaryLight,
        }}
      >
        <Txt w="semibold" style={{ fontSize: 15, color: Colors.primaryDark }}>
          {calc.quantityIssues?.length ? (language === 'pl' ? 'Częściowy szacunek materiałów' : 'Partial material estimate') : calc.jobId === 'eps-insulation-bso' ? (language === 'pl' ? 'Szacunek wg cen referencyjnych' : 'Estimate using reference prices') : t('cmp.MaterialsTab.totalCost')}
        </Txt>
        <Txt w="bold" style={{ fontSize: 20, color: Colors.primary }}>
          {formatCurrency(calc.totalCost)}
        </Txt>
      </View>

      <Button
        label={hasShoppingItems ? t('cmp.MaterialsTab.refreshList') : t('cmp.MaterialsTab.generateList')}
        onPress={onGenerateShoppingList}
        fullWidth
        icon={<Feather name="shopping-cart" size={16} color="#fff" />}
      />
    </View>
  );
}
