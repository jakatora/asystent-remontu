import React from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { SHOP_DISPLAY_NAMES, type ShopPrice } from '@/types/domain';
import { formatCurrency } from '@/utils/calculator';

interface ShopPriceListProps {
  prices: readonly ShopPrice[];
  /** Optional: shown next to the price ("za puszkę 5L"). */
  unitLabel?: string;
}

export function ShopPriceList({ prices, unitLabel }: ShopPriceListProps) {
  const { t } = useLanguage();

  if (!prices || prices.length === 0) {
    return (
      <View style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 10, padding: 10 }}>
        <Txt style={{ fontSize: 12, color: Colors.textMuted, textAlign: 'center' }}>
          {t('cmp.ShopPriceList.noShops')}
        </Txt>
      </View>
    );
  }

  // Cheapest known price (skip undefined). Used for the "najtaniej" badge.
  const known = prices.filter((p): p is ShopPrice & { pricePLN: number } => typeof p.pricePLN === 'number');
  const minPrice = known.length > 0 ? Math.min(...known.map((p) => p.pricePLN)) : undefined;

  // Sort: known prices ascending, then unknown prices in declaration order.
  const sorted = [...prices].sort((a, b) => {
    const aKnown = typeof a.pricePLN === 'number';
    const bKnown = typeof b.pricePLN === 'number';
    if (aKnown && bKnown) return (a.pricePLN as number) - (b.pricePLN as number);
    if (aKnown) return -1;
    if (bKnown) return 1;
    return 0;
  });

  // Take the newest verifiedAt to show in the footer.
  const newestVerified = sorted.reduce(
    (acc, p) => (p.verifiedAt > acc ? p.verifiedAt : acc),
    sorted[0].verifiedAt,
  );

  return (
    <View>
      <View style={{ backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
        {sorted.map((entry, idx) => {
          const isCheapest = typeof entry.pricePLN === 'number' && entry.pricePLN === minPrice && (known.length > 1);
          const isLast = idx === sorted.length - 1;
          return (
            <TouchableOpacity
              key={entry.shop}
              onPress={() => Linking.openURL(entry.url).catch(() => undefined)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: Colors.border,
                gap: 10,
                backgroundColor: isCheapest ? '#F0FDF4' : Colors.surface,
              }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="shopping-bag" size={16} color={Colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>
                    {SHOP_DISPLAY_NAMES[entry.shop]}
                  </Txt>
                  {isCheapest && (
                    <View style={{ backgroundColor: '#16A34A', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                      <Txt w="semibold" style={{ fontSize: 9, color: '#fff' }}>
                        ⭐ {t('cmp.ShopPriceList.cheapest')}
                      </Txt>
                    </View>
                  )}
                </View>
                {typeof entry.pricePLN === 'number' ? (
                  <Txt w="bold" style={{ fontSize: 15, color: isCheapest ? '#15803D' : Colors.text, marginTop: 1 }}>
                    {formatCurrency(entry.pricePLN)}
                    {unitLabel ? <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{` ${unitLabel}`}</Txt> : null}
                  </Txt>
                ) : (
                  <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 1 }}>
                    {t('cmp.ShopPriceList.priceUnknown')}
                  </Txt>
                )}
              </View>
              <Feather name="external-link" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          );
        })}
      </View>
      <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 6, textAlign: 'right' }}>
        {t('cmp.ShopPriceList.verifiedAt', { date: newestVerified })}
      </Txt>
    </View>
  );
}
