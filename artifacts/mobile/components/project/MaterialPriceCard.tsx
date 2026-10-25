import { parseDecimal } from '@/shared/lib/number';
import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import type { MaterialLineItemPriced } from '@/types/pricing';
import { useLanguage } from '@/context/LanguageContext';
import { ProductImage } from './ProductImage';
import { getProductPhoto } from '@/data/products/photos';
import { getProductReferenceStatus } from '@/data/products/availability';

interface MaterialPriceCardProps {
  item: MaterialLineItemPriced;
  onOverride: (materialId: string, pricePerPackage: number) => void;
  onReset: (materialId: string) => void;
}

export function MaterialPriceCard({ item, onOverride, onReset }: MaterialPriceCardProps) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const ref = item.materialRef;
  const referenceStatus = getProductReferenceStatus(ref.id, ref.sourceUrl);
  const hasOverride = item.overridePrice !== undefined;

  const handleSave = () => {
    const val = parseDecimal(editValue);
    if (!isNaN(val) && val > 0) {
      onOverride(ref.id, val);
    }
    setEditing(false);
  };

  const categoryLabels: Record<string, string> = {
    economy: t('cmp.MaterialPriceCard.economy'),
    standard: t('cmp.MaterialPriceCard.standard'),
    better: t('cmp.MaterialPriceCard.premium'),
  };

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: hasOverride ? Colors.primary + '40' : Colors.border,
        padding: 12,
        gap: 6,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ marginRight: 12 }}><ProductImage uri={getProductPhoto(ref)} name={ref.productLabel} /></View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Txt w="semibold" style={{ fontSize: 15, lineHeight: 21, color: Colors.text }}>
            {ref.productLabel}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 3 }}>
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
                backgroundColor: ref.category === 'economy' ? '#D1FAE5' : ref.category === 'better' ? '#EDE9FE' : Colors.primaryBg,
              }}
            >
              <Txt style={{ fontSize: 9, color: ref.category === 'economy' ? '#059669' : ref.category === 'better' ? '#7C3AED' : Colors.primary }}>
                {categoryLabels[ref.category] ?? ref.category}
              </Txt>
            </View>
            {ref.brand && (
              <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{ref.brand}</Txt>
            )}
          </View>
        </View>
        {!editing && (
          <TouchableOpacity
            onPress={() => { setEditValue((item.overridePrice ?? ref.pricePerPackage).toFixed(2)); setEditing(true); }}
            hitSlop={8}
          >
            <Feather name="edit-2" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{t('upgrade.product.packages', { count: item.packagesNeeded, size: ref.packageSize, unit: ref.packageUnit })}</Txt>
      <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{t('upgrade.product.need', { quantity: Number(item.quantity.toFixed(2)), unit: ref.packageUnit })}</Txt>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>
          {ref.pricePerPackage.toFixed(2)} PLN / {ref.packageSize} {ref.packageUnit}
        </Txt>
        <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
          {t('cmp.MaterialPriceCard.packagesShort', { count: item.packagesNeeded })}
        </Txt>
      </View>

      {editing ? (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={editValue}
            onChangeText={setEditValue}
            keyboardType="decimal-pad"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: Colors.primary,
              borderRadius: 8,
              padding: 8,
              fontSize: 14,
              color: Colors.text,
              backgroundColor: Colors.surface,
            }}
            placeholder={t('cmp.MaterialPriceCard.pricePlaceholder')}
          />
          <TouchableOpacity onPress={handleSave} style={{ padding: 8 }}>
            <Feather name="check" size={18} color={Colors.success} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditing(false)} style={{ padding: 8 }}>
            <Feather name="x" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt w="bold" style={{ fontSize: 15, color: Colors.text }}>
            {formatCurrency(item.totalCost)}
          </Txt>
          {hasOverride && (
            <TouchableOpacity onPress={() => onReset(ref.id)} hitSlop={8}>
              <Txt style={{ fontSize: 11, color: Colors.primary }}>{t('cmp.MaterialPriceCard.reset')}</Txt>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
          {t('cmp.MaterialPriceCard.storeUpdated', { store: ref.storeName, date: ref.lastUpdated })}
        </Txt>
        {hasOverride && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Feather name="edit-3" size={9} color={Colors.primary} />
            <Txt style={{ fontSize: 10, color: Colors.primary }}>{t('cmp.MaterialPriceCard.customPrice')}</Txt>
          </View>
        )}
      </View>
      {referenceStatus && (
        <Txt style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>
          {t(referenceStatus.state === 'no_online_offer' ? 'upgrade.product.noOnlineOffer' : 'upgrade.product.storeConfirmation')}
        </Txt>
      )}
    </View>
  );
}
