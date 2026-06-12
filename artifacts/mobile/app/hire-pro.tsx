import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getJobById } from '@/data/jobs';
import { Txt } from '@/components/ui/Txt';
import { useLanguage } from '@/context/LanguageContext';

export default function HireProScreen() {
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const job = jobId ? getJobById(jobId) : null;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  const TIPS = [
    {
      icon: 'search' as const,
      title: t('hirePro.tip1.title'),
      items: [
        t('hirePro.tip1.item1'),
        t('hirePro.tip1.item2'),
        t('hirePro.tip1.item3'),
        t('hirePro.tip1.item4'),
      ],
    },
    {
      icon: 'file-text' as const,
      title: t('hirePro.tip2.title'),
      items: [
        t('hirePro.tip2.item1'),
        t('hirePro.tip2.item2'),
        t('hirePro.tip2.item3'),
        t('hirePro.tip2.item4'),
        t('hirePro.tip2.item5'),
      ],
    },
    {
      icon: 'clipboard' as const,
      title: t('hirePro.tip3.title'),
      items: [
        t('hirePro.tip3.item1'),
        t('hirePro.tip3.item2'),
        t('hirePro.tip3.item3'),
        t('hirePro.tip3.item4'),
      ],
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: t('hirePro.title'),
          headerBackTitle: t('hirePro.headerBack'),
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerTintColor: '#0F172A',
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        className="flex-1 bg-bg"
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning header */}
        <View className="bg-danger-bg p-8 items-center border-b border-red-200">
          <View className="w-[88px] h-[88px] rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="shield" size={40} color="#EF4444" />
          </View>
          <Txt w="bold" className="text-[22px] text-danger text-center mb-2">{t('hirePro.warningTitle')}</Txt>
          {job?.hireProfessionalReason && (
            <Txt className="text-[15px] text-red-700 text-center leading-6">{job.hireProfessionalReason}</Txt>
          )}
        </View>

        <View className="p-5 gap-4">
          {TIPS.map((tip, ti) => (
            <View key={ti} className="bg-surface rounded-2xl p-[18px] border border-stroke gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary-bg items-center justify-center">
                  <Feather name={tip.icon} size={20} color="#F97316" />
                </View>
                <Txt w="bold" className="flex-1 text-base text-ink">{tip.title}</Txt>
              </View>
              {tip.items.map((item, ii) => (
                <View key={ii} className="flex-row gap-2.5 items-start">
                  <View className="w-1.5 h-1.5 rounded-full bg-primary mt-[7px] shrink-0" />
                  <Txt className="flex-1 text-sm text-slate leading-5">{item}</Txt>
                </View>
              ))}
            </View>
          ))}

          {/* Emergency */}
          <View className="flex-row items-center gap-3.5 bg-danger-bg rounded-2xl p-4 border border-red-200">
            <Feather name="phone-call" size={20} color="#EF4444" />
            <View className="flex-1">
              <Txt w="bold" className="text-[15px] text-danger">{t('hirePro.emergency.title')}</Txt>
              <Txt className="text-[13px] text-red-700 mt-0.5">{t('hirePro.emergency.subtitle')}</Txt>
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center mb-3"
            onPress={() => router.push({
              pathname: '/contractor',
              params: jobId ? { prefillCategoryId: job?.categoryId, prefillJobId: jobId, prefillJobName: job?.name } : {},
            })}
            activeOpacity={0.8}
            style={{ shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
          >
            <Txt w="bold" className="text-base text-white">{t('hirePro.findCta')}</Txt>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface rounded-2xl py-4 items-center border border-stroke"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Txt w="bold" className="text-base text-ink">{t('hirePro.backCta')}</Txt>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
