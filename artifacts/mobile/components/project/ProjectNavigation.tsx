import React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { TAB_LABEL_KEYS, type Tab } from './types';

const PRIMARY = [
  { id: 'overview', key: 'upgrade.nav.plan', icon: 'clipboard' },
  { id: 'estimate', key: 'upgrade.nav.compare', icon: 'tag' },
  { id: 'shopping', key: 'upgrade.nav.shopping', icon: 'shopping-cart' },
  { id: 'guide', key: 'upgrade.nav.work', icon: 'check-square' },
] as const;
const SECONDARY: readonly Tab[] = ['materials', 'tools', 'budget', 'photos'];

export function ProjectNavigation({ selected, onSelect }: { selected: Tab; onSelect: (tab: Tab) => void }) {
  const { t } = useLanguage();
  return (
    <View style={{ backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
      <View style={{ flexDirection: 'row', paddingHorizontal: 8, paddingTop: 8, gap: 4 }} accessibilityRole="tablist">
        {PRIMARY.map(tab => (
          <Pressable key={tab.id} onPress={() => onSelect(tab.id)} accessibilityRole="tab" accessibilityState={{ selected: selected === tab.id }}
            testID={`project-tab-${tab.id}`}
            style={({ pressed }) => ({ flex: 1, minHeight: 64, borderRadius: 12, gap: 5, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: selected === tab.id ? Colors.primaryBg : pressed ? Colors.surfaceAlt : Colors.surface })}>
            <Feather name={tab.icon} size={20} color={selected === tab.id ? Colors.primaryDark : Colors.textSecondary} />
            <Txt w={selected === tab.id ? 'bold' : 'medium'} style={{ fontSize: 12, textAlign: 'center', color: selected === tab.id ? Colors.primaryDark : Colors.textSecondary }}>{t(tab.key)}</Txt>
          </Pressable>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 4 }}>
        {SECONDARY.map(tab => (
          <Pressable key={tab} onPress={() => onSelect(tab)} accessibilityRole="tab" accessibilityState={{ selected: selected === tab }}
            style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: selected === tab ? Colors.primaryDark : 'transparent' }}>
            <Txt w="medium" style={{ fontSize: 13, color: selected === tab ? Colors.primaryDark : Colors.textSecondary }}>{t(TAB_LABEL_KEYS[tab])}</Txt>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
