import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useHouseBuild } from '@/context/HouseBuildContext';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/constants/i18n';
import { BUILD_STAGES } from '@/features/house-build/stages';
import { Txt } from '@/components/ui/Txt';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Colors } from '@/constants/colors';
import { useCallback } from 'react';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';
const HB_ACCENT_LIGHT = '#BFDBFE';

const STATUS_LABEL_KEYS: Record<string, TranslationKey> = {
  planning: 'hb.index.status.planning',
  formalities: 'hb.index.status.formalities',
  'in-progress': 'hb.index.status.inProgress',
  paused: 'hb.index.status.paused',
  completed: 'hb.index.status.completed',
};

export default function HouseBuildHome() {
  const insets = useSafeAreaInsets();
  const { projects, refreshProjects } = useHouseBuild();
  const { t } = useLanguage();

  useFocusEffect(
    useCallback(() => {
      refreshProjects();
    }, [refreshProjects])
  );

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Txt w="bold" style={{ fontSize: 24, color: Colors.text }}>{t('hb.index.title')}</Txt>
            <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 2 }}>
              {t('hb.index.subtitle')}
            </Txt>
          </View>
          <TouchableOpacity
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: HB_ACCENT,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => router.push('/house-build/create')}
            activeOpacity={0.8}
            accessibilityLabel={t('hb.index.newProjectA11y')}
            accessibilityRole="button"
          >
            <Feather name="plus" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: HB_ACCENT_BG,
            borderRadius: 16,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: HB_ACCENT_LIGHT,
            marginBottom: 24,
          }}
          onPress={() => router.push('/house-build/create')}
          activeOpacity={0.85}
          accessibilityLabel={t('hb.index.startPlanningA11y')}
          accessibilityRole="button"
        >
          <View style={{ flex: 1 }}>
            <Txt w="bold" style={{ fontSize: 16, color: HB_ACCENT }}>{t('hb.index.planCardTitle')}</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
              {t('hb.index.planCardSubtitle')}
            </Txt>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="arrow-right" size={22} color={HB_ACCENT} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionHeader title={t('hb.index.projectsSection')} />
        {projects.length === 0 ? (
          <EmptyState
            icon="home"
            title={t('hb.index.emptyTitle')}
            description={t('hb.index.emptyDescription')}
          />
        ) : (
          projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: Colors.border,
                marginBottom: 12,
              }}
              onPress={() => router.push({ pathname: '/house-build/[id]', params: { id: p.id } })}
              activeOpacity={0.85}
              accessibilityLabel={t('hb.index.projectA11y', { name: p.name })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: HB_ACCENT_BG, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="home" size={20} color={HB_ACCENT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>{p.name}</Txt>
                  <Txt style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
                    {p.landContext.plotCity || t('hb.index.noLocation')} · {STATUS_LABEL_KEYS[p.status] ? t(STATUS_LABEL_KEYS[p.status]) : p.status}
                  </Txt>
                </View>
                <StatusBadge status={p.status} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionHeader title={t('hb.index.stagesSection')} />
        <View style={{ gap: 8 }}>
          {BUILD_STAGES.slice(0, 6).map((stage) => (
            <View
              key={stage.key}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 12,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: HB_ACCENT_BG, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={stage.icon as any} size={16} color={HB_ACCENT} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{stage.name}</Txt>
                <Txt style={{ fontSize: 11, color: Colors.textMuted }} numberOfLines={1}>{stage.description}</Txt>
              </View>
              <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
                {stage.estimatedWeeks ? t('hb.index.weeksShort', { weeks: stage.estimatedWeeks }) : ''}
              </Txt>
            </View>
          ))}
          <Txt style={{ fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 4 }}>
            {t('hb.index.moreStages', { count: BUILD_STAGES.length - 6 })}
          </Txt>
        </View>
      </View>
    </ScrollView>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const colorMap: Record<string, { bg: string; fg: string }> = {
    planning: { bg: Colors.infoBg, fg: Colors.info },
    formalities: { bg: Colors.warningBg, fg: Colors.warning },
    'in-progress': { bg: Colors.primaryBg, fg: Colors.primary },
    paused: { bg: Colors.surfaceAlt, fg: Colors.textMuted },
    completed: { bg: Colors.successBg, fg: Colors.success },
  };
  const c = colorMap[status] ?? colorMap.planning;
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
      <Txt w="semibold" style={{ fontSize: 10, color: c.fg }}>{STATUS_LABEL_KEYS[status] ? t(STATUS_LABEL_KEYS[status]) : status}</Txt>
    </View>
  );
}
