import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import type { ShoppingItem } from '@/types/domain';
import { TierBadge } from './TierBadge';
import { getEffectivePrice, getEffectiveQuantity } from './helpers';

interface ShoppingItemCardProps {
  item: ShoppingItem;
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
            <Txt style={{ fontSize: 11, color: Colors.textSecondary }}>Ilość ({item.unit})</Txt>
            <TextInput
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
            <Txt style={{ fontSize: 11, color: Colors.textSecondary }}>Cena (PLN)</Txt>
            <TextInput
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
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' }}
          >
            <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>Zapisz</Txt>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCancelEdit}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.surfaceAlt, alignItems: 'center' }}
          >
            <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>Anuluj</Txt>
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
        <TouchableOpacity onPress={onTogglePurchased} activeOpacity={0.7}>
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
                <Txt style={{ fontSize: 9, color: Colors.warning }} w="semibold">edytowane</Txt>
              </View>
            )}
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
            {effectiveQty.toFixed(effectiveQty < 10 ? 1 : 0)} {item.unit}
          </Txt>
        </View>

        <Txt
          w="semibold"
          style={{ fontSize: 14, color: item.purchased ? Colors.textMuted : Colors.primary }}
        >
          {formatCurrency(effectivePrice)}
        </Txt>
      </View>

      {item.notes && (
        <Txt style={{ fontSize: 11, color: Colors.textMuted, paddingLeft: 38, lineHeight: 15 }}>
          {item.notes}
        </Txt>
      )}

      <View style={{ flexDirection: 'row', gap: 6, paddingLeft: 38 }}>
        <TouchableOpacity
          onPress={onStartEdit}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 5,
            backgroundColor: Colors.surfaceAlt,
            borderRadius: 8,
          }}
        >
          <Feather name="edit-2" size={11} color={Colors.textSecondary} />
          <Txt style={{ fontSize: 11, color: Colors.textSecondary }}>Edytuj</Txt>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleOwned}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 5,
            backgroundColor: Colors.surfaceAlt,
            borderRadius: 8,
          }}
        >
          <Feather name="home" size={11} color={Colors.textSecondary} />
          <Txt style={{ fontSize: 11, color: Colors.textSecondary }}>Mam to</Txt>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRemove}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 5,
            backgroundColor: Colors.dangerBg,
            borderRadius: 8,
          }}
        >
          <Feather name="x" size={11} color={Colors.danger} />
          <Txt style={{ fontSize: 11, color: Colors.danger }}>Usuń</Txt>
        </TouchableOpacity>
      </View>
    </View>
  );
}
