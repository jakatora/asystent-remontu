import { useState, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { houseBuildContentAdminRepo } from '@/db/repositories/house-build-content-admin.repo';
import type { AdminContentDashboardStats } from '@/types/house-build';

const HB_ACCENT = '#2563EB';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: string;
  warning?: boolean;
}

function StatCard({ label, value, icon, color = HB_ACCENT, warning }: StatCardProps) {
  return (
    <View style={{
      backgroundColor: warning ? '#FEF2F2' : '#FFFFFF', borderRadius: 10, padding: 12,
      borderWidth: 1, borderColor: warning ? '#FECACA' : '#E2E8F0', flex: 1, minWidth: 140,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Feather name={icon as any} size={14} color={warning ? '#DC2626' : color} />
        <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{label}</Txt>
      </View>
      <Txt w="bold" style={{ fontSize: 20, color: warning ? '#DC2626' : Colors.text }}>{value}</Txt>
    </View>
  );
}

export default function ContentDashboardScreen() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<AdminContentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await houseBuildContentAdminRepo.seedAll();
          const s = await houseBuildContentAdminRepo.getDashboardStats();
          if (!cancelled) { setStats(s); setLoading(false); }
        } catch (err) {
          console.error('Dashboard load error:', err);
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  if (loading || !stats) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={HB_ACCENT} /></View>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <Txt w="bold" style={{ fontSize: 16, color: HB_ACCENT, marginBottom: 16 }}>Panel tresci</Txt>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <StatCard label="Rekordy tresci" value={stats.totalContentRecords} icon="database" />
        <StatCard label="Ostrzezenia" value={stats.totalWarningNotes} icon="alert-triangle" />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <StatCard label="Szablony decyzji" value={stats.totalDecisionTemplates} icon="check-square" />
        <StatCard label="Szablony pytan" value={stats.totalQuestionTemplates} icon="help-circle" />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <StatCard label="Zrodla" value={stats.totalSourceRecords} icon="book-open" />
        <StatCard label="Checklisty" value={stats.totalChecklistGroups} icon="check-circle" />
      </View>

      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8, marginTop: 8 }}>Daty aktualizacji</Txt>
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Txt style={{ fontSize: 11, color: Colors.textMuted }}>Najnowsza aktualizacja</Txt>
          <Txt style={{ fontSize: 11, color: Colors.text }}>{stats.newestUpdate ? new Date(stats.newestUpdate).toLocaleDateString('pl-PL') : '-'}</Txt>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt style={{ fontSize: 11, color: Colors.textMuted }}>Najstarsza aktualizacja</Txt>
          <Txt style={{ fontSize: 11, color: Colors.text }}>{stats.oldestUpdate ? new Date(stats.oldestUpdate).toLocaleDateString('pl-PL') : '-'}</Txt>
        </View>
      </View>

      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Problemy</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <StatCard label="Brak zrodla" value={stats.missingSourceMetadata} icon="alert-circle" warning={stats.missingSourceMetadata > 0} />
        <StatCard label="Brak przegladow" value={stats.missingLastReviewed} icon="clock" warning={stats.missingLastReviewed > 0} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        <StatCard label="Nieaktywne" value={stats.inactiveRecords} icon="eye-off" warning={stats.inactiveRecords > 0} />
        <StatCard label="Przestarzale" value={stats.outdatedRecords} icon="calendar" warning={stats.outdatedRecords > 0} />
      </View>
    </ScrollView>
  );
}
