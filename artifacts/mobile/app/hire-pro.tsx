import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { getJobById } from '@/data/jobs';

const TIPS = [
  {
    icon: 'search' as const,
    title: 'Jak znaleźć dobrego fachowca?',
    items: [
      'Poproś znajomych i rodzinę o polecenie',
      'Sprawdź opinie w internecie (Google, Oferto)',
      'Zadzwoń do kilku firm i porównaj oferty',
      'Poproś o referencje od poprzednich klientów',
    ],
  },
  {
    icon: 'file-text' as const,
    title: 'Co sprawdzić przed zatrudnieniem?',
    items: [
      'Poproś o pisemną wycenę z wyszczególnionymi kosztami',
      'Sprawdź uprawnienia (elektryka, gaz — wymagane prawem)',
      'Sprawdź wpis do działalności (CEIDG)',
      'Omów termin rozpoczęcia i zakończenia prac',
      'Zapytaj o gwarancję na wykonane prace',
    ],
  },
  {
    icon: 'clipboard' as const,
    title: 'Podpisz umowę!',
    items: [
      'Umowa powinna zawierać: zakres prac, termin, cenę',
      'Nie płać całości z góry — max 30% zaliczki',
      'Resztę płać po odbiorze i sprawdzeniu jakości',
      'Żądaj faktury lub rachunku',
    ],
  },
];

export default function HireProScreen() {
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const insets = useSafeAreaInsets();
  const job = jobId ? getJobById(jobId) : null;

  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Zatrudnij fachowca',
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
        {/* Warning Header */}
        <View style={styles.warningHeader}>
          <View style={styles.warningIconContainer}>
            <Feather name="shield" size={40} color={Colors.danger} />
          </View>
          <Text style={styles.warningTitle}>Ta praca wymaga fachowca</Text>
          {job?.hireProfessionalReason && (
            <Text style={styles.warningDesc}>{job.hireProfessionalReason}</Text>
          )}
        </View>

        <View style={styles.content}>
          {TIPS.map((tip, ti) => (
            <View key={ti} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View style={styles.tipIcon}>
                  <Feather name={tip.icon} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
              </View>
              {tip.items.map((item, ii) => (
                <View key={ii} style={styles.tipItem}>
                  <View style={styles.dot} />
                  <Text style={styles.tipItemText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.emergencyCard}>
            <Feather name="phone-call" size={20} color={Colors.danger} />
            <View style={styles.emergencyText}>
              <Text style={styles.emergencyTitle}>Nagłe przypadki</Text>
              <Text style={styles.emergencyDesc}>Awaria gazu, zalanie, brak prądu</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>Wróć do projektu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  warningHeader: {
    backgroundColor: Colors.dangerBg,
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#fca5a5',
  },
  warningIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  warningTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.danger, textAlign: 'center', marginBottom: 8 },
  warningDesc: { fontSize: 15, fontFamily: 'Inter_400Regular', color: '#b91c1c', textAlign: 'center', lineHeight: 22 },
  content: { padding: 20, gap: 16 },
  tipCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: { flex: 1, fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.text },
  tipItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 7, flexShrink: 0 },
  tipItemText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, lineHeight: 20 },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.dangerBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  emergencyText: { flex: 1 },
  emergencyTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.danger },
  emergencyDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#b91c1c', marginTop: 2 },
  backBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.white },
});
