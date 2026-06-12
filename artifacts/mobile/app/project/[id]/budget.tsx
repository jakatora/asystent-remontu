import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { getJobById } from '@/data/jobs';
import { formatCurrency } from '@/utils/calculator';
import { Txt } from '@/components/ui/Txt';

export default function ProjectBudgetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { projects } = useApp();
  const { t } = useLanguage();

  const project = projects.find((p) => p.id === id);
  const job = project ? getJobById(project.jobId) : null;
  const calc = project?.calculationResult;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  if (!project || !calc) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <Txt w="medium" className="text-base text-slate">{t('project.budget.noData')}</Txt>
      </View>
    );
  }

  const laborMin = Math.round(calc.totalCost * 1.5);
  const laborMax = Math.round(calc.totalCost * 3.0);
  const totalMin = calc.totalCost + laborMin;
  const totalMax = calc.totalCost + laborMax;

  const materialPct = calc.materials.length > 0
    ? calc.materials.map((m) => ({ name: m.material.name, cost: m.cost, pct: calc.totalCost > 0 ? (m.cost / calc.totalCost) * 100 : 0 }))
    : [];

  return (
    <>
      <Stack.Screen
        options={{
          title: t('project.budget.title'),
          headerBackTitle: t('project.budget.headerBack'),
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerTintColor: '#0F172A',
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        className="flex-1 bg-bg"
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="bg-primary-bg rounded-2xl p-5 border border-primary-light mb-5">
          <Txt w="medium" className="text-sm text-primary mb-1">{t('project.budget.heroLabel')}</Txt>
          <Txt w="bold" className="text-4xl text-primary mb-1">{formatCurrency(calc.totalCost)}</Txt>
          <Txt className="text-xs text-slate">{t('project.budget.heroNote')}</Txt>
        </View>

        {/* Time */}
        <View className="bg-surface rounded-2xl border border-stroke p-4 mb-4">
          <View className="flex-row items-center gap-2.5 mb-3">
            <View className="w-9 h-9 rounded-xl bg-info-bg items-center justify-center">
              <Feather name="clock" size={18} color="#3B82F6" />
            </View>
            <Txt w="bold" className="text-base text-ink">{t('project.budget.timeTitle')}</Txt>
          </View>
          <View className="flex-row justify-between items-center">
            <Txt className="text-sm text-slate">{t('project.budget.timeEstimated')}</Txt>
            <Txt w="bold" className="text-base text-ink">{calc.totalDays} {calc.totalDays === 1 ? t('project.budget.dayOne') : t('project.budget.dayMany')}</Txt>
          </View>
        </View>

        {/* Labor estimate */}
        <View className="bg-surface rounded-2xl border border-stroke p-4 mb-4">
          <View className="flex-row items-center gap-2.5 mb-3">
            <View className="w-9 h-9 rounded-xl bg-warning-bg items-center justify-center">
              <Feather name="user" size={18} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Txt w="bold" className="text-base text-ink">{t('project.budget.laborTitle')}</Txt>
              <Txt className="text-xs text-muted">{t('project.budget.laborSubtitle')}</Txt>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-stroke-light">
            <Txt className="text-sm text-slate">{t('project.budget.laborMin')}</Txt>
            <Txt w="bold" className="text-base" style={{ color: '#F59E0B' }}>{formatCurrency(laborMin)}</Txt>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Txt className="text-sm text-slate">{t('project.budget.laborMax')}</Txt>
            <Txt w="bold" className="text-base" style={{ color: '#EF4444' }}>{formatCurrency(laborMax)}</Txt>
          </View>
        </View>

        {/* Total with labor */}
        <View className="bg-surface rounded-2xl border border-stroke p-4 mb-4">
          <View className="flex-row items-center gap-2.5 mb-3">
            <View className="w-9 h-9 rounded-xl bg-success-bg items-center justify-center">
              <Feather name="dollar-sign" size={18} color="#22C55E" />
            </View>
            <Txt w="bold" className="text-base text-ink">{t('project.budget.totalTitle')}</Txt>
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-stroke-light">
            <Txt className="text-sm text-slate">{t('project.budget.totalMin')}</Txt>
            <Txt w="bold" className="text-base text-success">{formatCurrency(totalMin)}</Txt>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Txt className="text-sm text-slate">{t('project.budget.totalMax')}</Txt>
            <Txt w="bold" className="text-base text-danger">{formatCurrency(totalMax)}</Txt>
          </View>
        </View>

        {/* Material breakdown */}
        {materialPct.length > 0 && (
          <View className="bg-surface rounded-2xl border border-stroke p-4">
            <Txt w="bold" className="text-base text-ink mb-3">{t('project.budget.breakdownTitle')}</Txt>
            {materialPct.map((m, i) => (
              <View key={i} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Txt w="medium" className="text-sm text-ink flex-1 mr-2" numberOfLines={1}>{m.name}</Txt>
                  <Txt w="semibold" className="text-sm text-primary">{formatCurrency(m.cost)}</Txt>
                </View>
                <View className="h-2 bg-stroke-light rounded-full overflow-hidden">
                  <View className="h-2 rounded-full bg-primary" style={{ width: `${m.pct}%` }} />
                </View>
                <Txt className="text-xs text-muted mt-0.5">{t('project.budget.breakdownPct', { pct: m.pct.toFixed(0) })}</Txt>
              </View>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View className="flex-row gap-2 mt-4 items-start">
          <Feather name="info" size={14} color="#94A3B8" style={{ marginTop: 1 }} />
          <Txt className="flex-1 text-xs text-muted leading-4">
            {t('project.budget.disclaimer')}
          </Txt>
        </View>
      </ScrollView>
    </>
  );
}
