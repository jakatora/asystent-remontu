import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getJobById } from '@/data/jobs';
import { Badge } from '@/components/ui/Badge';
import { WarningBanner } from '@/components/ui/WarningBanner';
import { Txt } from '@/components/ui/Txt';
import { getDifficultyLabel, getRiskLabel } from '@/utils/calculator';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const job = getJobById(id || '');
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 100;

  if (!job) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <Txt className="text-base text-slate">Nie znaleziono pracy</Txt>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: job.name,
          headerBackTitle: 'Wróć',
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
        {/* Header */}
        <View className="bg-primary-bg p-6 items-center border-b border-primary-light">
          <View
            className="w-16 h-16 bg-white items-center justify-center mb-3"
            style={{ borderRadius: 20, shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }}
          >
            <Feather name={job.coverIcon as any} size={28} color="#F97316" />
          </View>
          <Txt w="bold" className="text-[22px] text-ink text-center mb-2">{job.name}</Txt>
          <Txt className="text-[15px] text-slate text-center mb-3.5 leading-[22px]">{job.description}</Txt>
          <View className="flex-row gap-2 flex-wrap justify-center">
            <Badge label={getDifficultyLabel(job.difficulty)} variant={job.difficulty} />
            <Badge label={getRiskLabel(job.riskLevel)} variant={job.riskLevel === 'low' ? 'success' : job.riskLevel === 'medium' ? 'warning' : 'high'} />
            <Badge label={`${job.estimatedDays} ${job.estimatedDays === 1 ? 'dzień' : 'dni'}`} variant="info" />
          </View>
        </View>

        <View className="p-5 gap-5">
          {/* Warnings */}
          {job.warningRules.length > 0 && <WarningBanner warnings={job.warningRules} />}

          {/* Hire professional */}
          {job.hireProfessionalRecommended && (
            <TouchableOpacity
              className="flex-row items-center bg-danger-bg rounded-2xl p-3.5 border border-red-200 gap-3"
              onPress={() => router.push({ pathname: '/hire-pro', params: { jobId: job.id } })}
              activeOpacity={0.8}
            >
              <Feather name="phone" size={20} color="#EF4444" />
              <View className="flex-1">
                <Txt w="bold" className="text-[15px] text-danger">Zalecamy fachowca</Txt>
                <Txt className="text-[13px] text-red-700 mt-0.5">{job.hireProfessionalReason || 'Ta praca jest ryzykowna dla osoby bez doświadczenia'}</Txt>
              </View>
              <Feather name="chevron-right" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}

          {/* Tools */}
          <View>
            <Txt w="bold" className="text-[17px] text-ink mb-3">Potrzebne narzędzia</Txt>
            {job.tools.map((tool) => (
              <View key={tool.id} className="flex-row items-center gap-3 mb-2.5">
                <View className="w-9 h-9 rounded-[10px] bg-surface-alt items-center justify-center" style={{ opacity: tool.required ? 1 : 0.5 }}>
                  <Feather name={tool.icon as any} size={16} color="#1E293B" />
                </View>
                <View className="flex-1">
                  <Txt w="medium" className="text-sm text-ink">{tool.name}</Txt>
                  {tool.notes && <Txt className="text-xs text-muted mt-0.5">{tool.notes}</Txt>}
                </View>
                {!tool.required && (
                  <View className="bg-surface-alt px-2 py-0.5 rounded-lg">
                    <Txt w="medium" className="text-[11px] text-muted">opcja</Txt>
                  </View>
                )}
                {tool.rentable && (
                  <View className="bg-info-bg px-2 py-0.5 rounded-lg">
                    <Txt w="medium" className="text-[11px] text-info">wynajem</Txt>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Common mistakes */}
          <View>
            <Txt w="bold" className="text-[17px] text-ink mb-3">Częste błędy</Txt>
            {job.commonMistakes.map((mistake, i) => (
              <View key={i} className="flex-row gap-2.5 mb-2 items-start">
                <Feather name="x-circle" size={16} color="#EF4444" style={{ marginTop: 2 }} />
                <Txt className="flex-1 text-sm text-slate leading-5">{mistake}</Txt>
              </View>
            ))}
          </View>

          {/* Quality checklist */}
          <View>
            <Txt w="bold" className="text-[17px] text-ink mb-3">Jak sprawdzić jakość</Txt>
            {job.qualityChecklist.map((check) => (
              <View key={check.id} className="flex-row gap-2.5 mb-2 items-start">
                <Feather name="check-circle" size={16} color="#22C55E" style={{ marginTop: 2 }} />
                <Txt className="flex-1 text-sm text-slate leading-5">{check.description}</Txt>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        className="px-5 pt-3 bg-surface border-t border-stroke"
        style={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }}
      >
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2.5"
          onPress={() => router.push({ pathname: '/wizard', params: { jobId: job.id } })}
          activeOpacity={0.85}
          style={{ shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
        >
          <Feather name="calculator" size={20} color="#fff" />
          <Txt w="bold" className="text-base text-white">Oblicz materiały i koszty</Txt>
        </TouchableOpacity>
      </View>
    </>
  );
}
