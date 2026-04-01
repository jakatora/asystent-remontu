import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import type { BundleDefinition } from '@/types/commerce';

interface BundleSuggestionCardProps {
  bundle: BundleDefinition;
  onSelect?: (bundleId: string) => void;
}

export function BundleSuggestionCard({ bundle, onSelect }: BundleSuggestionCardProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.primaryLight,
        padding: 14,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: Colors.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="gift" size={16} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }} numberOfLines={1}>
            {bundle.title}
          </Txt>
          <Txt style={{ fontSize: 11, color: Colors.textSecondary }} numberOfLines={1}>
            {bundle.description}
          </Txt>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {bundle.items.slice(0, 4).map((item, idx) => (
          <View
            key={item.internalId + idx}
            style={{
              backgroundColor: Colors.surfaceAlt,
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Txt style={{ fontSize: 9, color: Colors.textSecondary }}>{item.name}</Txt>
          </View>
        ))}
        {bundle.items.length > 4 && (
          <View
            style={{
              backgroundColor: Colors.surfaceAlt,
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Txt style={{ fontSize: 9, color: Colors.textMuted }}>
              +{bundle.items.length - 4} więcej
            </Txt>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt w="bold" style={{ fontSize: 15, color: Colors.primary }}>
          ~{formatCurrency(bundle.estimatedSubtotal)}
        </Txt>
        {onSelect && (
          <TouchableOpacity
            onPress={() => onSelect(bundle.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: Colors.primaryBg,
            }}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={14} color={Colors.primary} />
            <Txt w="semibold" style={{ fontSize: 12, color: Colors.primary }}>Wybierz</Txt>
          </TouchableOpacity>
        )}
      </View>

      {bundle.optionalUpgrades.length > 0 && (
        <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
          + {bundle.optionalUpgrades.length} opcjonalnych ulepszeń
        </Txt>
      )}
    </View>
  );
}
