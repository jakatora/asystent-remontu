import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { getJobById } from '@/data/jobs';
import { WarningBanner } from '@/components/ui/WarningBanner';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';

export default function ProjectWarningsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { projects } = useApp();

  const project = projects.find((p) => p.id === id);
  const job = project ? getJobById(project.jobId) : null;
  const calc = project?.calculationResult;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  if (!project || !job) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <Txt w="medium" className="text-base text-slate">Projekt nie znaleziony</Txt>
      </View>
    );
  }

  const jobWarnings = job.warningRules ?? [];
  const calcWarnings = calc?.warnings ?? [];
  const allWarnings = [...calcWarnings, ...jobWarnings];

  const dangerCount = allWarnings.filter((w) => w.level === 'danger').length;
  const warningCount = allWarnings.filter((w) => w.level === 'warning').length;
  const infoCount = allWarnings.filter((w) => w.level === 'info').length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ostrzeżenia',
          headerBackTitle: 'Wróć',
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
        {/* Summary */}
        <View className="flex-row gap-3 mb-5">
          {dangerCount > 0 && (
            <View className="flex-1 bg-danger-bg rounded-2xl p-3 border border-red-200 items-center">
              <Txt w="bold" className="text-2xl text-danger">{dangerCount}</Txt>
              <Txt w="medium" className="text-xs text-danger text-center mt-0.5">Krytyczne</Txt>
            </View>
          )}
          {warningCount > 0 && (
            <View className="flex-1 bg-warning-bg rounded-2xl p-3 border border-yellow-200 items-center">
              <Txt w="bold" className="text-2xl text-warning">{warningCount}</Txt>
              <Txt w="medium" className="text-xs text-warning text-center mt-0.5">Ostrzeżenia</Txt>
            </View>
          )}
          {infoCount > 0 && (
            <View className="flex-1 bg-info-bg rounded-2xl p-3 border border-blue-200 items-center">
              <Txt w="bold" className="text-2xl text-info">{infoCount}</Txt>
              <Txt w="medium" className="text-xs text-info text-center mt-0.5">Informacje</Txt>
            </View>
          )}
          {allWarnings.length === 0 && (
            <View className="flex-1 bg-success-bg rounded-2xl p-3 border border-green-200 items-center">
              <Feather name="check-circle" size={28} color="#22C55E" />
              <Txt w="medium" className="text-xs text-success text-center mt-1">Brak ostrzeżeń</Txt>
            </View>
          )}
        </View>

        {/* Calculation warnings */}
        {calcWarnings.length > 0 && (
          <View className="mb-5">
            <Txt w="bold" className="text-base text-ink mb-3">Ostrzeżenia kalkulacji</Txt>
            <WarningBanner warnings={calcWarnings} />
          </View>
        )}

        {/* Job warnings */}
        {jobWarnings.length > 0 && (
          <View className="mb-5">
            <Txt w="bold" className="text-base text-ink mb-3">Ostrzeżenia dla tej pracy</Txt>
            <WarningBanner warnings={jobWarnings} />
          </View>
        )}

        {/* No warnings */}
        {allWarnings.length === 0 && (
          <View className="items-center py-8 gap-3">
            <View className="w-20 h-20 rounded-full bg-success-bg items-center justify-center" style={{ width: 80, height: 80, borderRadius: 40 }}>
              <Feather name="shield" size={36} color="#22C55E" />
            </View>
            <Txt w="bold" className="text-lg text-ink">Praca bez ostrzeżeń</Txt>
            <Txt className="text-sm text-slate text-center" style={{ maxWidth: 260 }}>
              Ta praca remontowa nie zawiera szczególnych zagrożeń. Pamiętaj jednak o podstawowych zasadach bezpieczeństwa.
            </Txt>
          </View>
        )}

        {/* General safety */}
        <View className="bg-surface rounded-2xl border border-stroke p-4 mb-4">
          <View className="flex-row items-center gap-2.5 mb-3">
            <View className="w-9 h-9 rounded-xl bg-warning-bg items-center justify-center">
              <Feather name="shield" size={18} color="#F59E0B" />
            </View>
            <Txt w="bold" className="text-base text-ink">Ogólne zasady bezpieczeństwa</Txt>
          </View>
          {[
            'Używaj odpowiednich środków ochrony osobistej',
            'Sprawdź narzędzia przed użyciem',
            'Zadbaj o odpowiednie oświetlenie stanowiska pracy',
            'Nie pracuj sam przy ryzykownych zadaniach',
            'Miej pod ręką apteczkę pierwszej pomocy',
          ].map((tip, i) => (
            <View key={i} className="flex-row gap-2.5 mb-2 items-start">
              <Feather name="check" size={14} color="#22C55E" style={{ marginTop: 2 }} />
              <Txt className="flex-1 text-sm text-slate leading-5">{tip}</Txt>
            </View>
          ))}
        </View>

        {/* Hire professional CTA */}
        {job.hireProfessionalRecommended && (
          <Button
            label="Zatrudnij fachowca — dowiedz się jak"
            variant="danger"
            onPress={() => router.push({ pathname: '/hire-pro', params: { jobId: job.id } })}
            fullWidth
          />
        )}
      </ScrollView>
    </>
  );
}
