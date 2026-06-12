import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { EDB_INFO } from '@/features/house-build/formal-checklists';
import { useLanguage } from '@/context/LanguageContext';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

interface SectionData {
  icon: string;
  title: string;
  content: string;
}

export default function EdbScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const sections: SectionData[] = [
    { icon: 'book-open', title: 'Czym jest EDB?', content: EDB_INFO.whatIs },
    { icon: 'users', title: 'Kto korzysta z EDB?', content: EDB_INFO.whoUses },
    { icon: 'plus-circle', title: 'Jak zalozyc EDB?', content: EDB_INFO.howToCreate },
    { icon: 'user-plus', title: 'Uczestnicy procesu', content: EDB_INFO.participants },
    { icon: 'check-circle', title: 'Zamkniecie dziennika', content: EDB_INFO.closing },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Elektroniczny Dziennik Budowy' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: HB_ACCENT_BG,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#BFDBFE',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="book" size={22} color={HB_ACCENT} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>{EDB_INFO.title}</Txt>
              </View>
            </View>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>{EDB_INFO.description}</Txt>
          </View>

          {sections.map((section, i) => (
            <View
              key={i}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 14,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: HB_ACCENT_BG, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={section.icon as any} size={15} color={HB_ACCENT} />
                </View>
                <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>{section.title}</Txt>
              </View>
              <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>{section.content}</Txt>
            </View>
          ))}

          <View style={{
            backgroundColor: '#FFFBEB',
            borderRadius: 12,
            padding: 12,
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#FDE68A',
            flexDirection: 'row',
            gap: 10,
          }}>
            <Feather name="info" size={16} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 12, color: '#92400E', flex: 1 }}>
              {t('hb.edb.warning')}
            </Txt>
          </View>

          <View style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            flexDirection: 'row',
            gap: 8,
          }}>
            <Feather name="shield" size={14} color={Colors.textMuted} style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 11, color: Colors.textMuted, flex: 1 }}>
              Informacje orientacyjne — zweryfikuj z urzedem, projektantem i na podstawie dokumentacji projektowej.
            </Txt>
          </View>

          <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Zrodlo: {EDB_INFO.source.sourceLabel}</Txt>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Ostatnia weryfikacja: {EDB_INFO.source.lastReviewedDate}</Txt>
            {EDB_INFO.source.notes && <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{EDB_INFO.source.notes}</Txt>}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
