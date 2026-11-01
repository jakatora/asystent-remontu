import React from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatGrosze } from '@/features/pricing';
import { basketOrderCount, type BasketChoice, type ConfirmedBasketOptions } from '@/features/pricing/basketOptions';
export function BasketOptionsSection({ options, choice, onChange, disabled }: { options: ConfirmedBasketOptions; choice: BasketChoice; onChange: (choice: BasketChoice) => void; disabled: boolean }) {
  const { language } = useLanguage(), pl = language === 'pl', tr = (a: string, b: string) => pl ? a : b;
  const counts = (stores: number, orders: number) => tr(`Sklepy: ${stores} · zamówienia: ${orders}`, `Stores: ${stores} · orders: ${orders}`);
  if (options.alreadySingleStore) return <View style={{ padding: 14, gap: 6, borderRadius: 14, backgroundColor: Colors.successBg }}>
    <Txt w="semibold">{tr('Najtańszy potwierdzony wariant jest już w jednym sklepie', 'The lowest confirmed option already uses one store')}</Txt>
    <Txt>{options.lowest.stores[0].store} · {counts(1, basketOrderCount(options.lowest))}</Txt>
  </View>;
  const variants = [{ value: 'lowest' as const, basket: options.lowest, title: tr('Najniższy potwierdzony koszt', 'Lowest confirmed total') },
    ...(options.singleStore ? [{ value: 'single_store' as const, basket: options.singleStore, title: tr('Wszystko w jednym sklepie', 'Everything from one store') }] : [])];
  return <View style={{ gap: 12 }}>
    <Txt w="semibold" style={{ fontSize: 16 }}>{tr('Wybierz sposób zakupów', 'Choose how to buy')}</Txt>
    {variants.map(({ value, basket, title }) => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={title} aria-checked={choice === value} accessibilityState={{ checked: choice === value, disabled }} disabled={disabled} onPress={() => onChange(value)}
      style={{ minHeight: 64, padding: 16, gap: 8, borderWidth: 1, borderColor: choice === value ? Colors.primary : Colors.border, backgroundColor: choice === value ? Colors.primaryBg : Colors.surface, borderRadius: 14 }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><Feather name={choice === value ? 'check-circle' : 'circle'} size={22} color={choice === value ? Colors.primary : Colors.textSecondary} /><Txt w="semibold" style={{ flex: 1 }}>{title}</Txt></View>
      <Txt w="bold" style={{ fontSize: 23, color: Colors.primaryDark }}>{formatGrosze(basket.totalGrosze!)}</Txt>
      <Txt style={{ lineHeight: 21, color: Colors.textSecondary }}>{basket.stores.map(store => store.store).join(' + ')}</Txt>
      <Txt style={{ fontSize: 13, lineHeight: 20 }}>{counts(basket.stores.length, basketOrderCount(basket))}</Txt>
      {value === 'single_store' && <Txt w="semibold" style={{ lineHeight: 21 }}>{options.extraGrosze === 0 ? tr('Ta sama cena z dostawą', 'Same total including delivery') : tr('Dopłata za jeden sklep: ', 'Extra for one store: ') + formatGrosze(options.extraGrosze!)}</Txt>}
    </Pressable>)}
    {!options.singleStore && <Txt style={{ color: Colors.textSecondary, lineHeight: 21 }}>{tr('Nie potwierdzono pełnego koszyka z dostawą w jednym sklepie. Dostępne warianty mogą obejmować kilka sklepów.', 'A complete one-store basket with delivery has not been confirmed. Available options may use several stores.')}</Txt>}
    <Txt style={{ fontSize: 13, lineHeight: 20, color: Colors.textSecondary }}>{tr('Poniższe produkty, kwoty i plan zakupów dotyczą wybranego wariantu. Jeden sklep może wymagać kilku osobnych zamówień.', 'The products, totals and shopping plan below follow your selection. One store may require several separate orders.')}</Txt>
  </View>;
}
