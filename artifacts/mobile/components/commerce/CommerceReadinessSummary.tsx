import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type { ShoppingItem } from '@/types/domain';
import { useCommerce } from '@/context/CommerceContext';

interface CommerceReadinessSummaryProps {
  shoppingItems: readonly ShoppingItem[];
  compact?: boolean;
}

export function CommerceReadinessSummary({ shoppingItems, compact }: CommerceReadinessSummaryProps) {
  const { productMappings } = useCommerce();
  const mappingSet = useMemo(
    () => new Set(productMappings.filter((m) => m.activeForCommerce).map((m) => m.internalId)),
    [productMappings]
  );
  const nonOwned = shoppingItems.filter((i) => !i.owned);
  const materials = nonOwned.filter((i) => i.itemType === 'material');
  const tools = nonOwned.filter((i) => i.itemType === 'tool');
  const mapped = nonOwned.filter((i) => mappingSet.has(i.materialId));
  const unmapped = nonOwned.filter((i) => !mappingSet.has(i.materialId));

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: compact ? 10 : 14,
        gap: compact ? 6 : 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Feather name="shopping-bag" size={compact ? 14 : 16} color={Colors.primary} />
        <Txt w="semibold" style={{ fontSize: compact ? 12 : 14, color: Colors.text }}>
          Gotowość sklepowa
        </Txt>
      </View>

      <View style={{ gap: 4 }}>
        <ReadinessRow
          label="Gotowe do koszyka"
          value={`${mapped.length} / ${nonOwned.length}`}
          color="#059669"
          compact={compact}
        />
        <ReadinessRow
          label="Materiały"
          value={String(materials.length)}
          color={Colors.text}
          compact={compact}
        />
        <ReadinessRow
          label="Narzędzia"
          value={String(tools.length)}
          color={Colors.text}
          compact={compact}
        />
        {unmapped.length > 0 && (
          <ReadinessRow
            label="Niezmapowane"
            value={String(unmapped.length)}
            color="#92400E"
            compact={compact}
          />
        )}
      </View>
    </View>
  );
}

function ReadinessRow({
  label,
  value,
  color,
  compact,
}: {
  label: string;
  value: string;
  color: string;
  compact?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Txt style={{ fontSize: compact ? 11 : 12, color: Colors.textSecondary }}>{label}</Txt>
      <Txt w="semibold" style={{ fontSize: compact ? 11 : 12, color }}>{value}</Txt>
    </View>
  );
}
