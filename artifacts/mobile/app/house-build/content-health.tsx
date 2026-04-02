import { useState, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { houseBuildContentAdminRepo } from '@/db/repositories/house-build-content-admin.repo';
import type { AdminContentHealthIssue } from '@/types/house-build';
import { CONTENT_TYPE_LABELS } from '@/features/house-build/content-admin-seeds';

const HB_ACCENT = '#2563EB';

const SEVERITY_STYLE: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  error: { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', icon: 'x-circle' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', icon: 'alert-triangle' },
  info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB', icon: 'info' },
};

export default function ContentHealthScreen() {
  const insets = useSafeAreaInsets();
  const [issues, setIssues] = useState<AdminContentHealthIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await houseBuildContentAdminRepo.seedAll();
          const data = await houseBuildContentAdminRepo.getHealthIssues();
          if (!cancelled) { setIssues(data); setLoading(false); }
        } catch (err) {
          console.error('Health check error:', err);
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={HB_ACCENT} /></View>;

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <View style={{ flex: 1, backgroundColor: errors.length > 0 ? '#FEF2F2' : '#F0FDF4', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: errors.length > 0 ? '#FECACA' : '#BBF7D0' }}>
          <Txt w="bold" style={{ fontSize: 18, color: errors.length > 0 ? '#DC2626' : '#16A34A' }}>{errors.length}</Txt>
          <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Bledy</Txt>
        </View>
        <View style={{ flex: 1, backgroundColor: warnings.length > 0 ? '#FFFBEB' : '#F0FDF4', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: warnings.length > 0 ? '#FDE68A' : '#BBF7D0' }}>
          <Txt w="bold" style={{ fontSize: 18, color: warnings.length > 0 ? '#D97706' : '#16A34A' }}>{warnings.length}</Txt>
          <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Ostrzezenia</Txt>
        </View>
        <View style={{ flex: 1, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE' }}>
          <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>{infos.length}</Txt>
          <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Info</Txt>
        </View>
      </View>

      {issues.length === 0 ? (
        <View style={{ backgroundColor: '#F0FDF4', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#BBF7D0' }}>
          <Feather name="check-circle" size={24} color="#16A34A" />
          <Txt w="semibold" style={{ fontSize: 14, color: '#16A34A', marginTop: 8 }}>Tresci sa zdrowe</Txt>
          <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 4 }}>Nie wykryto problemow.</Txt>
        </View>
      ) : (
        issues.map((issue, idx) => {
          const style = SEVERITY_STYLE[issue.severity] || SEVERITY_STYLE.info;
          return (
            <View key={idx} style={{ backgroundColor: style.bg, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: style.border, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <Feather name={style.icon as any} size={14} color={style.text} style={{ marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontSize: 12, color: style.text }}>{issue.message}</Txt>
                  <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                      <Txt style={{ fontSize: 8, color: Colors.textMuted }}>{CONTENT_TYPE_LABELS[issue.contentType] || issue.contentType}</Txt>
                    </View>
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                      <Txt style={{ fontSize: 8, color: Colors.textMuted }}>{issue.contentKey}</Txt>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
