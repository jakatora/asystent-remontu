import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

interface InfoItem {
  icon: string;
  title: string;
  description: string;
}

export default function StartWorksScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;
  const { t } = useLanguage();

  const NOTIFICATION_STEPS: InfoItem[] = [
    { icon: 'calendar', title: t('hb.startWorks.step1Title'), description: t('hb.startWorks.step1Desc') },
    { icon: 'user', title: t('hb.startWorks.step2Title'), description: t('hb.startWorks.step2Desc') },
    { icon: 'file-text', title: t('hb.startWorks.step3Title'), description: t('hb.startWorks.step3Desc') },
    { icon: 'monitor', title: t('hb.startWorks.step4Title'), description: t('hb.startWorks.step4Desc') },
  ];

  return (
    <>
      <Stack.Screen options={{ title: t('hb.startWorks.title') }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Txt w="bold" style={{ fontSize: 20, color: Colors.text, marginBottom: 4 }}>{t('hb.startWorks.headerTitle')}</Txt>
          <Txt style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 16 }}>
            {t('hb.startWorks.headerSubtitle')}
          </Txt>

          <View style={{
            backgroundColor: '#FEF2F2',
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#FECACA',
            flexDirection: 'row',
            gap: 10,
          }}>
            <Feather name="alert-triangle" size={16} color="#991B1B" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 12, color: '#991B1B', flex: 1 }}>
              {t('hb.startWorks.warning')}
            </Txt>
          </View>

          <View style={{
            backgroundColor: HB_ACCENT_BG,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#BFDBFE',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="send" size={18} color={HB_ACCENT} />
              </View>
              <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>{t('hb.startWorks.cardTitle')}</Txt>
            </View>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>
              {t('hb.startWorks.cardBody')}
            </Txt>
          </View>

          {NOTIFICATION_STEPS.map((item, i) => (
            <View
              key={i}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: Colors.border,
                flexDirection: 'row',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: HB_ACCENT_BG,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Feather name={item.icon as any} size={16} color={HB_ACCENT} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{item.title}</Txt>
                <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4, lineHeight: 18 }}>{item.description}</Txt>
              </View>
            </View>
          ))}

          <View style={{
            backgroundColor: '#FFFBEB',
            borderRadius: 12,
            padding: 12,
            marginTop: 10,
            borderWidth: 1,
            borderColor: '#FDE68A',
            flexDirection: 'row',
            gap: 10,
          }}>
            <Feather name="info" size={16} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 12, color: '#92400E', flex: 1 }}>
              {t('hb.startWorks.note')}
            </Txt>
          </View>

          <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{t('hb.startWorks.source')}</Txt>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{t('hb.startWorks.lastReviewed')}</Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
