import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  tint?: string;
  danger?: boolean;
}

function SettingRow({ icon, title, subtitle, onPress, tint = Colors.primary, danger = false }: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.settingRow}
    >
      <View style={[styles.settingIcon, { backgroundColor: (danger ? Colors.danger : tint) + '18' }]}>
        <Feather name={icon as any} size={18} color={danger ? Colors.danger : tint} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, danger && { color: Colors.danger }]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {onPress && <Feather name="chevron-right" size={18} color={Colors.textMuted} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { projects } = useApp();

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const handleAbout = () => {
    Alert.alert(
      'Remont Asystent',
      'Wersja 1.0.0\n\nTwój przewodnik po remontach. Prowadzi krok po kroku, oblicza materiały i pomaga zaplanować każdy remont.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: topPadding + 16, paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Ustawienia</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileIcon}>
          <Feather name="home" size={28} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.profileName}>Remont Asystent</Text>
          <Text style={styles.profileSub}>{projects.length} projektów zapisanych</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dane</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="folder"
            title="Moje projekty"
            subtitle={`${projects.length} projektów w pamięci urządzenia`}
            tint={Colors.info}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield"
            title="Dane offline"
            subtitle="Wszystkie dane są na Twoim urządzeniu"
            tint={Colors.success}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aplikacja</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="info"
            title="O aplikacji"
            subtitle="Wersja 1.0.0"
            onPress={handleAbout}
            tint={Colors.secondary}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="book-open"
            title="Jak korzystać z aplikacji"
            subtitle="Przewodnik po funkcjach"
            onPress={() => Alert.alert('Pomoc', '1. Wybierz rodzaj pracy z listy\n2. Podaj wymiary\n3. Oblicz potrzebne materiały\n4. Zapisz projekt\n5. Korzystaj z listy zakupów')}
            tint={Colors.info}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bezpieczeństwo</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="alert-triangle"
            title="Zasady bezpieczeństwa"
            subtitle="Ważne informacje przed pracami"
            onPress={() => Alert.alert(
              'Bezpieczeństwo',
              '⚠️ Przed każdą pracą:\n\n• Przy elektryce — zawsze wyłącz bezpiecznik\n• Przy hydraulice — zakręć wodę\n• Przy gazownicy lub nośnych ścianach — zadzwoń do fachowca\n• Używaj sprzętu ochronnego\n• Czytaj instrukcje produktów',
              [{ text: 'Rozumiem' }]
            )}
            tint={Colors.warning}
          />
        </View>
      </View>

      <Text style={styles.footer}>Remont Asystent v1.0.0 • Dane offline</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', color: Colors.text },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.text },
  profileSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.text },
  settingSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 66 },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginBottom: 20,
  },
});
