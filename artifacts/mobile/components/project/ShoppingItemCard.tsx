import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import type { ShoppingItem } from '@/types/domain';
import { TierBadge } from './TierBadge';
import { getEffectivePrice, getEffectiveQuantity, hasShoppingPrice } from './helpers';
import { useLanguage } from '@/context/LanguageContext';
import { ProductImage } from './ProductImage';

interface ShoppingItemCardProps {
  item: ShoppingItem;
  imageUrl?: string;
  packageLabel?: string;
  editing: boolean;
  editPrice: string;
  editQty: string;
  onEditPrice: (v: string) => void;
  onEditQty: (v: string) => void;
  onTogglePurchased: () => void;
  onToggleOwned: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
}

export function ShoppingItemCard({
  item,
  imageUrl,
  packageLabel,
  editing,
  editPrice,
  editQty,
  onEditPrice,
  onEditQty,
  onTogglePurchased,
  onToggleOwned,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: ShoppingItemCardProps) {
  const { t, language } = useLanguage();
  const effectivePrice = getEffectivePrice(item);
  const effectiveQty = getEffectiveQuantity(item);
  const isCustomized = item.customPrice !== undefined || item.customQuantity !== undefined;

  if (editing) {
    return (
      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 14,
          padding: 14,
          borderWidth: 2,
          borderColor: Colors.primary,
          gap: 12,
        }}
      >
        <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{item.name}</Txt>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{t('cmp.ShoppingItemCard.quantity', { unit: item.unit })}</Txt>
            <TextInput
              accessibilityLabel={`${t('cmp.ShoppingItemCard.quantity', {unit:item.unit})}: ${item.name}`}
              value={editQty}
              onChangeText={onEditQty}
              keyboardType="decimal-pad"
              style={{
                backgroundColor: Colors.surfaceAlt,
                borderRadius: 10,
                padding: 10,
                fontSize: 16,
                fontFamily: 'Inter_500Medium',
                color: Colors.text,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{t('cmp.ShoppingItemCard.price')}</Txt>
            <TextInput
              accessibilityLabel={`${t('cmp.ShoppingItemCard.price')}: ${item.name}`}
              value={editPrice}
              onChangeText={onEditPrice}
              keyboardType="decimal-pad"
              style={{
                backgroundColor: Colors.surfaceAlt,
                borderRadius: 10,
                padding: 10,
                fontSize: 16,
                fontFamily: 'Inter_500Medium',
                color: Colors.text,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={onSaveEdit}
            accessibilityRole="button" accessibilityLabel={`${t('cmp.ShoppingItemCard.save')}: ${item.name}`}
            style={{ flex: 1, minHeight:48, justifyContent:'center', paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' }}
          >
            <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>{t('cmp.ShoppingItemCard.save')}</Txt>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCancelEdit}
            accessibilityRole="button" accessibilityLabel={`${t('cmp.ShoppingItemCard.cancel')}: ${item.name}`}
            style={{ flex: 1, minHeight:48, justifyContent:'center', paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.surfaceAlt, alignItems: 'center' }}
          >
            <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>{t('cmp.ShoppingItemCard.cancel')}</Txt>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: item.purchased ? '#BBF7D0' : Colors.border,
        padding: 12,
        gap: 8,
        opacity: item.purchased ? 0.7 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={onTogglePurchased} disabled={item.quantityKnown === false} activeOpacity={0.7} accessibilityRole="checkbox" aria-checked={item.purchased} aria-disabled={item.quantityKnown === false} accessibilityState={{ checked: item.purchased, disabled: item.quantityKnown === false }} accessibilityLabel={item.name} style={{ minWidth: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: item.purchased ? Colors.success : Colors.border,
              backgroundColor: item.purchased ? Colors.success : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.purchased && <Feather name="check" size={15} color="#fff" />}
          </View>
        </TouchableOpacity>

        <ProductImage uri={imageUrl} name={item.name} size={52} />

        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Txt
              w="medium"
              style={{
                fontSize: 14,
                color: item.purchased ? Colors.textMuted : Colors.text,
                textDecorationLine: item.purchased ? 'line-through' : 'none',
              }}
            >
              {item.name}
            </Txt>
            <TierBadge tier={item.tier} />
            {isCustomized && (
              <View style={{ paddingHorizontal: 5, paddingVertical: 1, backgroundColor: Colors.warningBg, borderRadius: 4 }}>
                <Txt style={{ fontSize: 9, color: Colors.warning }} w="semibold">{t('cmp.ShoppingItemCard.edited')}</Txt>
              </View>
            )}
          </View>
          <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>
            {item.quantityKnown === false ? (language === 'pl' ? 'Ilość do ustalenia w obmiarach' : 'Confirm quantity in measurements') : item.customQuantity === undefined && packageLabel ? packageLabel : `${Number(effectiveQty.toFixed(item.requiredQuantity === undefined ? 2 : 3))} ${item.unit}`}
          </Txt>
        </View>

        <Txt
          w="semibold"
          style={{ fontSize: 14, color: item.purchased ? Colors.textMuted : Colors.primary }}
        >
          {hasShoppingPrice(item) ? formatCurrency(effectivePrice) : '—'}
        </Txt>
      </View>

      {!hasShoppingPrice(item) && item.quantityKnown !== false && <Txt style={{fontSize:12,color:Colors.textSecondary}}>{t('upgrade.shopping.priceUnknown')}</Txt>}

      {item.selectedProductChanged && <Txt accessibilityRole="alert" style={{ fontSize: 14, color: Colors.text, backgroundColor: Colors.warningBg, padding: 10, borderRadius: 8, lineHeight: 21 }}>{language === 'pl' ? 'Wybrano inny produkt. Wcześniejsza cena oraz oznaczenia „Mam” i „Kupione” dotyczą poprzedniego modelu. Potwierdź je ponownie dla produktu pokazanego powyżej.' : 'A different product is selected. The earlier price and Owned or Purchased marks belong to the previous model. Confirm them again for the product shown above.'}</Txt>}
      {item.needsQuantityConfirmation && item.quantityKnown !== false && <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>{language === 'pl' ? `Aktualny obmiar wymaga ${item.requiredQuantity} ${item.unit}. Oznaczenie „Mam” lub „Kupione” potwierdzi całą tę ilość. Wcześniejsze oznaczenia nie pokrywają automatycznie nowego zapotrzebowania.` : `Current measurements require ${item.requiredQuantity} ${item.unit}. “Owned” or “Purchased” confirms that whole quantity. Earlier marks do not automatically cover the new requirement.`}</Txt>}

      {item.notes && (
        <Txt style={{ fontSize: 12, color: Colors.textMuted, paddingLeft: 0, lineHeight: 18 }}>
          {item.notes}
        </Txt>
      )}

      <View style={{ flexDirection: 'row', gap: 6, paddingLeft: 38 }}>
        <TouchableOpacity
          onPress={onStartEdit}
          accessibilityRole="button" accessibilityLabel={`${t('cmp.ShoppingItemCard.edit')}: ${item.name}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 10,
            minHeight: 44,
            backgroundColor: Colors.surfaceAlt,
            borderRadius: 8,
          }}
        >
          <Feather name="edit-2" size={11} color={Colors.textSecondary} />
          <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{t('cmp.ShoppingItemCard.edit')}</Txt>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleOwned}
          accessibilityRole="button" accessibilityLabel={`${t('cmp.ShoppingItemCard.haveIt')}: ${item.name}`}
          disabled={item.quantityKnown === false}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 10,
            minHeight: 44,
            backgroundColor: Colors.surfaceAlt,
            borderRadius: 8,
          }}
        >
          <Feather name="home" size={11} color={Colors.textSecondary} />
          <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{t('cmp.ShoppingItemCard.haveIt')}</Txt>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRemove}
          accessibilityRole="button" accessibilityLabel={`${t('cmp.ShoppingItemCard.remove')}: ${item.name}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 10,
            minHeight: 44,
            backgroundColor: Colors.dangerBg,
            borderRadius: 8,
          }}
        >
          <Feather name="x" size={11} color={Colors.danger} />
          <Txt style={{ fontSize: 11, color: Colors.danger }}>{t('cmp.ShoppingItemCard.remove')}</Txt>
        </TouchableOpacity>
      </View>
    </View>
  );
}
