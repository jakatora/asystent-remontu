import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import type { CalculationResult } from '@/types/domain';

interface MaterialsTabProps {
  calc: CalculationResult;
  hasShoppingItems: boolean;
  onGenerateShoppingList: () => Promise<void>;
}

export function MaterialsTab({ calc, hasShoppingItems, onGenerateShoppingList }: MaterialsTabProps) {
  return (
    <View style={{ gap: 12 }}>
      <Txt w="bold" style={{ fontSize: 18, color: Colors.text, marginBottom: 4 }}>
        Lista materiałów
      </Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>
        Ilości uwzględniają 10% zapasu na straty i docięcia.
      </Txt>

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
          <View style={{ flex: 1 }}>
            <Txt w="medium" style={{ fontSize: 14, color: Colors.text }}>
              {m.material.name}
            </Txt>
            {m.material.notes && (
              <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
                {m.material.notes}
              </Txt>
            )}
          </View>
          <View style={{ alignItems: 'center', minWidth: 52 }}>
            <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>
              {m.quantity.toFixed(m.quantity < 10 ? 1 : 0)}
            </Txt>
            <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
              {m.material.unit}
            </Txt>
          </View>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.primary, minWidth: 70, textAlign: 'right' }}>
            {formatCurrency(m.cost)}
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
          Łączny koszt materiałów
        </Txt>
        <Txt w="bold" style={{ fontSize: 20, color: Colors.primary }}>
          {formatCurrency(calc.totalCost)}
        </Txt>
      </View>

      <Button
        label={hasShoppingItems ? 'Odśwież listę zakupów' : 'Generuj listę zakupów'}
        onPress={onGenerateShoppingList}
        fullWidth
        icon={<Feather name="shopping-cart" size={16} color="#fff" />}
      />
    </View>
  );
}
