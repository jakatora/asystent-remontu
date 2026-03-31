import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { getJobById } from '@/data/jobs';
import { Badge } from '@/components/ui/Badge';
import { WarningBanner } from '@/components/ui/WarningBanner';
import { getDifficultyLabel, getRiskLabel } from '@/utils/calculator';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const job = getJobById(id || '');
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 100;

  if (!job) {
    return (
      <View style={styles.center}>
        <Text>Nie znaleziono pracy</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: job.name,
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name={job.coverIcon as any} size={28} color={Colors.primary} />
          </View>
          <Text style={styles.jobName}>{job.name}</Text>
          <Text style={styles.jobDesc}>{job.description}</Text>
          <View style={styles.badges}>
            <Badge label={getDifficultyLabel(job.difficulty)} variant={job.difficulty} />
            <Badge label={getRiskLabel(job.riskLevel)} variant={job.riskLevel === 'low' ? 'success' : job.riskLevel === 'medium' ? 'warning' : 'high'} />
            <Badge label={`${job.estimatedDays} ${job.estimatedDays === 1 ? 'dzień' : 'dni'}`} variant="info" />
          </View>
        </View>

        <View style={styles.content}>
          {/* Warnings */}
          {job.warningRules.length > 0 && (
            <View style={styles.section}>
              <WarningBanner warnings={job.warningRules} />
            </View>
          )}

          {/* Hire Professional */}
          {job.hireProfessionalRecommended && (
            <TouchableOpacity
              style={styles.hireBanner}
              onPress={() => router.push({ pathname: '/hire-pro', params: { jobId: job.id } })}
              activeOpacity={0.8}
            >
              <Feather name="phone" size={20} color={Colors.danger} />
              <View style={styles.hireText}>
                <Text style={styles.hireTitle}>Zalecamy fachowca</Text>
                <Text style={styles.hireSub}>{job.hireProfessionalReason || 'Ta praca jest ryzykowna dla osoby bez doświadczenia'}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.danger} />
            </TouchableOpacity>
          )}

          {/* Tools */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Potrzebne narzędzia</Text>
            {job.tools.map((tool) => (
              <View key={tool.id} style={styles.toolRow}>
                <View style={[styles.toolIcon, !tool.required && { opacity: 0.5 }]}>
                  <Feather name={tool.icon as any} size={16} color={Colors.secondary} />
                </View>
                <View style={styles.toolText}>
                  <Text style={styles.toolName}>{tool.name}</Text>
                  {tool.notes && <Text style={styles.toolNote}>{tool.notes}</Text>}
                </View>
                {!tool.required && <Text style={styles.optional}>opcja</Text>}
                {tool.rentable && <Text style={styles.rentable}>wynajem</Text>}
              </View>
            ))}
          </View>

          {/* Common Mistakes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Częste błędy</Text>
            {job.commonMistakes.map((mistake, i) => (
              <View key={i} style={styles.mistakeRow}>
                <Feather name="x-circle" size={16} color={Colors.danger} />
                <Text style={styles.mistakeText}>{mistake}</Text>
              </View>
            ))}
          </View>

          {/* Quality Checklist */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jak sprawdzić jakość</Text>
            {job.qualityChecklist.map((check) => (
              <View key={check.id} style={styles.checkRow}>
                <Feather name="check-circle" size={16} color={Colors.success} />
                <Text style={styles.checkText}>{check.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push({ pathname: '/wizard', params: { jobId: job.id } })}
          activeOpacity={0.85}
        >
          <Feather name="calculator" size={20} color={Colors.white} />
          <Text style={styles.ctaBtnText}>Oblicz materiały i koszty</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primaryBg,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  jobName: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  jobDesc: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, textAlign: 'center', marginBottom: 14, lineHeight: 22 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  content: { padding: 20, gap: 8 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: Colors.text, marginBottom: 12 },
  hireBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fca5a5',
    gap: 12,
  },
  hireText: { flex: 1 },
  hireTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.danger },
  hireSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#b91c1c', marginTop: 2 },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  toolIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolText: { flex: 1 },
  toolName: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text },
  toolNote: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textMuted, marginTop: 2 },
  optional: { fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.textMuted, backgroundColor: Colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  rentable: { fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.info, backgroundColor: Colors.infoBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  mistakeRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  mistakeText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, lineHeight: 20 },
  checkRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  checkText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, lineHeight: 20 },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ctaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.white },
});
