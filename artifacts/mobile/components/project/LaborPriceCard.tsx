import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import type { LaborLineItem } from '@/types/pricing';
import { useLanguage } from '@/context/LanguageContext';

interface LaborPriceCardProps {
  item: LaborLineItem;
  onOverride: (laborId: string, pricePerUnit: number) => void;
  onReset: (laborId: string) => void;
}

export function LaborPriceCard({ item, onOverride, onReset }: LaborPriceCardProps) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const ref = item.laborRef;
  const hasOverride = item.overridePrice !== undefined;

  const handleSave = () => {
    const val = parseFloat(editValue.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      onOverride(ref.id, val);
    }
    setEditing(false);
  };

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: hasOverride ? Colors.primary + '40' : Colors.border,
        padding: 12,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <Feather name="users" size={14} color={Colors.warning} />
          <Txt w="semibold" style={{ fontSize: 13, color: Colors.text, flex: 1 }} numberOfLines={1}>
            {t('cmp.LaborPriceCard.labor')}
          </Txt>
        </View>
        {!editing && (
          <TouchableOpacity
            onPress={() => { setEditValue(ref.laborPriceBaseline.toFixed(2)); setEditing(true); }}
            hitSlop={8}
          >
            <Feather name="edit-2" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>
          {ref.laborPriceMin.toFixed(2)}–{ref.laborPriceMax.toFixed(2)} PLN/{ref.laborUnit}
        </Txt>
        <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
          × {item.area.toFixed(1)} {ref.laborUnit}
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
            placeholder={`PLN/${ref.laborUnit}`}
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
            {formatCurrency(item.costMin)}–{formatCurrency(item.costMax)}
          </Txt>
          {hasOverride && (
            <TouchableOpacity onPress={() => onReset(ref.id)} hitSlop={8}>
              <Txt style={{ fontSize: 11, color: Colors.primary }}>{t('cmp.LaborPriceCard.reset')}</Txt>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
          {t('cmp.LaborPriceCard.source', { name: ref.sourceName })}
        </Txt>
        {hasOverride && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Feather name="edit-3" size={9} color={Colors.primary} />
            <Txt style={{ fontSize: 10, color: Colors.primary }}>{t('cmp.LaborPriceCard.customPrice')}</Txt>
          </View>
        )}
      </View>

      {ref.notes && (
        <Txt style={{ fontSize: 10, color: Colors.textMuted, fontStyle: 'italic' }}>{ref.notes}</Txt>
      )}
    </View>
  );
}
