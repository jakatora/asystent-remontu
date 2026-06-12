import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getJobById } from '@/data/jobs';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { getDifficultyLabel, getRiskLabel } from '@/utils/calculator';
import { useLanguage } from '@/context/LanguageContext';
import { RenovationTabBar, type RenovationTab } from '@/components/renovation/RenovationTabBar';
import { IntroTab } from '@/components/renovation/tabs/IntroTab';
import { HowToTab } from '@/components/renovation/tabs/HowToTab';
import { CostTab } from '@/components/renovation/tabs/CostTab';
import { RenovationToolsTab } from '@/components/renovation/tabs/RenovationToolsTab';
import { FindProTab } from '@/components/renovation/tabs/FindProTab';
import { SafetyTab } from '@/components/renovation/tabs/SafetyTab';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [tab, setTab] = useState<RenovationTab>('intro');

  const job = getJobById(id || '');
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 100;

  if (!job) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>{t('job.detail.notFound')}</Txt>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: job.name,
          headerBackTitle: t('job.detail.headerBack'),
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      {/* Hero header */}
      <View
        style={{
          backgroundColor: Colors.primaryBg,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 14,
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#FED7AA',
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
            shadowColor: '#F97316',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Feather name={job.coverIcon as any} size={26} color={Colors.primary} />
        </View>
        <Txt w="bold" style={{ fontSize: 20, color: Colors.text, textAlign: 'center' }}>
          {job.name}
        </Txt>
        {job.shortDescription && (
          <Txt style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
            {job.shortDescription}
          </Txt>
        )}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Badge label={getDifficultyLabel(job.difficulty)} variant={job.difficulty} />
          <Badge
            label={getRiskLabel(job.riskLevel)}
            variant={job.riskLevel === 'low' ? 'success' : job.riskLevel === 'medium' ? 'warning' : 'high'}
          />
          <Badge
            label={`${job.estimatedDays} ${job.estimatedDays === 1 ? t('job.detail.dayOne') : t('job.detail.dayMany')}`}
            variant="info"
          />
        </View>
      </View>

      {/* Tab bar */}
      <RenovationTabBar current={tab} onChange={setTab} />

      {/* Tab content */}
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Recommend hiring a pro — pinned above tab content for emphasis */}
        {job.hireProfessionalRecommended && tab !== 'safety' && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.dangerBg,
              borderRadius: 12,
              padding: 12,
              margin: 16,
              marginBottom: 0,
              gap: 12,
              borderWidth: 1,
              borderColor: '#FECACA',
            }}
            onPress={() => router.push({ pathname: '/hire-pro', params: { jobId: job.id } })}
            activeOpacity={0.85}
          >
            <Feather name="phone" size={18} color={Colors.danger} />
            <View style={{ flex: 1 }}>
              <Txt w="bold" style={{ fontSize: 13, color: Colors.danger }}>
                {t('job.detail.hireProTitle')}
              </Txt>
              <Txt style={{ fontSize: 11, color: '#991B1B', marginTop: 2 }}>
                {job.hireProfessionalReason || t('job.detail.hireProDefaultReason')}
              </Txt>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.danger} />
          </TouchableOpacity>
        )}

        {tab === 'intro'   && <IntroTab job={job} />}
        {tab === 'howTo'   && <HowToTab job={job} />}
        {tab === 'cost'    && <CostTab job={job} />}
        {tab === 'tools'   && <RenovationToolsTab job={job} />}
        {tab === 'findPro' && <FindProTab job={job} />}
        {tab === 'safety'  && <SafetyTab job={job} />}
      </ScrollView>

      {/* Bottom CTA — calculate (always visible) */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 10,
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: Platform.OS === 'web' ? 16 : insets.bottom + 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/wizard', params: { jobId: job.id } })}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: Colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
          }}
        >
          <Feather name="hash" size={18} color="#fff" />
          <Txt w="bold" style={{ fontSize: 14, color: '#fff' }}>{t('job.detail.calculateCta')}</Txt>
        </TouchableOpacity>
      </View>
    </>
  );
}
