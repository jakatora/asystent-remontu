import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatGrosze } from '@/features/pricing';
import type { DeliveredBasket, DeliveryComparison } from '../../../../lib/pricing-service/src/delivery';

/** The parent supplies a validated, current pending plan. An empty set of
 * confirmed fees must not look like a confirmed free delivery. */
export function PendingDeliverySummary({ plan, basis }: { plan: DeliveredBasket; basis?: DeliveryComparison['purchasePlanBasis'] }) {
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => language === 'pl' ? pl : en;
  const [details, setDetails] = useState(false);
  const pending = plan.stores.filter(store => store.deliveryGrosze === null);
  const confirmedCount = plan.stores.length - pending.length;
  const confirmedCost = plan.stores.reduce((sum, store) => sum + (store.deliveryGrosze ?? 0), 0);
  useEffect(() => { setDetails(false); }, [plan]);

  return <View style={{ padding: 16, gap: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
    <Txt w="bold" style={{ fontSize: 18 }}>{tr('Plan zakupów — dostawy do potwierdzenia', 'Purchase plan — delivery pending')}</Txt>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Txt style={{ flex: 1 }}>{tr('Materiały w tym planie', 'Materials in this plan')}</Txt>
      <Txt w="bold">{formatGrosze(plan.materialsGrosze)}</Txt>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Txt style={{ flex: 1 }}>{confirmedCount > 0
        ? tr(`Potwierdzone dostawy (${confirmedCount} z ${plan.stores.length})`, `Confirmed delivery charges (${confirmedCount} of ${plan.stores.length})`)
        : tr('Dostawa', 'Delivery')}</Txt>
      <Txt w="semibold">{confirmedCount > 0 ? formatGrosze(confirmedCost) : tr('Brak wyceny', 'Not quoted')}</Txt>
    </View>
    {pending.length > 0 && <Txt w="semibold" style={{ lineHeight: 22 }}>{tr('Dostawa do potwierdzenia', 'Delivery to confirm')}: {pending.map(store => store.store).join(', ')}.</Txt>}
    <Txt style={{ lineHeight: 21, color: Colors.textSecondary }}>{tr('Pełny koszt poznamy po potwierdzeniu dostaw. Opakowania i linki do sklepów są poniżej.', 'The full total depends on the missing delivery quotes. Packs and store links are below.')}</Txt>
    <Pressable accessibilityRole="button" accessibilityLabel={tr('Jak wybrano plan zakupów', 'How this shopping plan was chosen')} aria-expanded={details} accessibilityState={{ expanded: details }} onPress={() => setDetails(value => !value)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Txt w="semibold" style={{ flex: 1, color: Colors.primary, fontSize: 14 }}>{tr('Jak wybrano plan zakupów', 'How this shopping plan was chosen')}</Txt>
      <Feather name={details ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.primary} />
    </Pressable>
    {details && <View style={{ gap: 10 }}>
      {basis === 'fewest_unquoted_stores' && <Txt style={{ lineHeight: 21, color: Colors.textSecondary }}>{tr('Spośród sprawdzonych wariantów wybraliśmy plan z najmniejszą liczbą sklepów bez wyceny dostawy, a następnie najniższym znanym kosztem. Inny podział może okazać się tańszy po potwierdzeniu brakujących opłat.', 'Among the checked allocations, this plan has the fewest stores without a delivery quote, then the lowest known cost. Another allocation may be cheaper once missing fees are confirmed.')}</Txt>}
      <Txt style={{ lineHeight: 21, color: Colors.textSecondary }}>{tr('Poniżej znajdziesz wszystkie potrzebne opakowania i ceny materiałów w każdym sklepie. Pełny koszt i najtańszy zestaw z dostawą poznamy po potwierdzeniu brakujących opłat.', 'All required packs and each store’s material prices are listed below. The full total and lowest delivered basket depend on the missing delivery quotes.')}</Txt>
    </View>}
  </View>;
}
