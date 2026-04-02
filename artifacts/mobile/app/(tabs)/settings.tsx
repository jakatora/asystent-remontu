import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isSentryConfigured } from '@/lib/sentry';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { pluralize } from '@/utils/format';
import { APP_CONFIG } from '@/config/contact';

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  iconColor?: string;
  iconBg?: string;
  danger?: boolean;
  badge?: string;
}

function SettingRow({ icon, title, subtitle, onPress, iconColor = Colors.primary, iconBg = Colors.primaryBg, danger = false, badge }: SettingRowProps) {
  const color = danger ? Colors.danger : iconColor;
  const bg = danger ? Colors.dangerBg : iconBg;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
      }}
      accessibilityLabel={`${title}${subtitle ? `. ${subtitle}` : ''}`}
      accessibilityRole={onPress ? 'button' : 'text'}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
        }}
      >
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt w="medium" style={{ fontSize: 15, color: danger ? Colors.danger : Colors.text }}>
          {title}
        </Txt>
        {subtitle && (
          <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
            {subtitle}
          </Txt>
        )}
      </View>
      {badge && (
        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: Colors.successBg }}>
          <Txt w="semibold" style={{ fontSize: 12, color: Colors.success }}>{badge}</Txt>
        </View>
      )}
      {onPress && <Feather name="chevron-right" size={18} color={Colors.textMuted} />}
    </TouchableOpacity>
  );
}

function SettingDivider() {
  return <View style={{ height: 1, backgroundColor: Colors.borderLight, marginLeft: 66 }} />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Txt
      w="semibold"
      style={{
        fontSize: 13,
        color: Colors.textMuted,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Txt>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { projects } = useApp();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const projectWord = pluralize(projects.length, 'projekt zapisany', 'projekty zapisane', 'projektów zapisanych');

  const handleAbout = () => {
    Alert.alert(
      APP_CONFIG.appName,
      `Wersja ${APP_CONFIG.version}\n\nTwój przewodnik po remontach. Prowadzi krok po kroku, oblicza materiały i pomaga zaplanować każdy remont.\n\nDane przechowywane lokalnie na urządzeniu.`,
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Jak korzystać z aplikacji',
      '1. Wybierz kategorię pracy z listy\n2. Podaj wymiary pomieszczenia\n3. Aplikacja obliczy potrzebne materiały\n4. Skorzystaj z listy zakupów\n5. Śledź postęp projektu',
      [{ text: 'Rozumiem' }]
    );
  };

  const handleSafety = () => {
    Alert.alert(
      'Zasady bezpieczeństwa',
      '⚠️ Przed każdą pracą:\n\n• Przy elektryce — zawsze wyłącz bezpiecznik\n• Przy hydraulice — zakręć wodę\n• Przy gazie lub nośnych ścianach — zadzwoń do fachowca\n• Używaj okularów i rękawic ochronnych\n• Czytaj instrukcje produktów',
      [{ text: 'Rozumiem' }]
    );
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Błąd', 'Nie udało się otworzyć linku.');
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Txt w="bold" style={{ fontSize: 26, color: Colors.text }}>Ustawienia</Txt>
      </View>

      <View
        style={{
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
        }}
        accessibilityLabel={`${projects.length} ${projectWord}`}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: Colors.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="home" size={28} color={Colors.primary} />
        </View>
        <View>
          <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>{APP_CONFIG.appName}</Txt>
          <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
            {projects.length} {projectWord}
          </Txt>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionLabel label="Dane" />
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          <SettingRow
            icon="folder"
            title="Moje projekty"
            subtitle={`${projects.length} ${projectWord} w pamięci urządzenia`}
            iconColor={Colors.info}
            iconBg={Colors.infoBg}
          />
          <SettingDivider />
          <SettingRow
            icon="shield"
            title="Dane offline"
            subtitle="Wszystkie dane są na Twoim urządzeniu"
            iconColor={Colors.success}
            iconBg={Colors.successBg}
            badge="Aktywne"
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionLabel label="Synchronizacja" />
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          <SettingRow
            icon="cloud"
            title="Synchronizacja z chmurą"
            subtitle={isSupabaseConfigured ? 'Połączone z Supabase' : 'Niedostępne — brak konfiguracji'}
            iconColor={Colors.info}
            iconBg={Colors.infoBg}
          />
          <SettingDivider />
          <SettingRow
            icon="user"
            title="Konto użytkownika"
            subtitle="Zaloguj się aby synchronizować projekty"
            iconColor="#8B5CF6"
            iconBg="#F5F3FF"
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionLabel label="Aplikacja" />
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          <SettingRow
            icon="info"
            title="O aplikacji"
            subtitle={`Wersja ${APP_CONFIG.version}`}
            onPress={handleAbout}
            iconColor={Colors.secondary}
            iconBg={Colors.surfaceAlt}
          />
          <SettingDivider />
          <SettingRow
            icon="book-open"
            title="Jak korzystać z aplikacji"
            subtitle="Przewodnik po funkcjach"
            onPress={handleHelp}
            iconColor={Colors.info}
            iconBg={Colors.infoBg}
          />
          <SettingDivider />
          <SettingRow
            icon="activity"
            title="Raportowanie błędów"
            subtitle={isSentryConfigured ? 'Sentry aktywne' : 'Wyłączone'}
            iconColor={Colors.warning}
            iconBg={Colors.warningBg}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionLabel label="Pomoc i prawne" />
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          <SettingRow
            icon="help-circle"
            title="Pomoc i wsparcie"
            subtitle="FAQ, poradniki, kontakt"
            onPress={() => openUrl(APP_CONFIG.supportUrl)}
            iconColor={Colors.info}
            iconBg={Colors.infoBg}
          />
          <SettingDivider />
          <SettingRow
            icon="lock"
            title="Polityka prywatności"
            subtitle="Jak chronimy Twoje dane"
            onPress={() => openUrl(APP_CONFIG.privacyUrl)}
            iconColor="#8B5CF6"
            iconBg="#F5F3FF"
          />
          <SettingDivider />
          <SettingRow
            icon="mail"
            title="Kontakt"
            subtitle={APP_CONFIG.supportEmail}
            onPress={() => openUrl(`mailto:${APP_CONFIG.supportEmail}`)}
            iconColor={Colors.primary}
            iconBg={Colors.primaryBg}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionLabel label="Bezpieczeństwo" />
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          <SettingRow
            icon="alert-triangle"
            title="Zasady bezpieczeństwa"
            subtitle="Ważne informacje przed pracami"
            onPress={handleSafety}
            iconColor={Colors.warning}
            iconBg={Colors.warningBg}
          />
        </View>
      </View>

      <Txt style={{ textAlign: 'center', fontSize: 12, color: Colors.textMuted, marginBottom: 20 }}>
        {APP_CONFIG.appName} v{APP_CONFIG.version} · Dane offline
      </Txt>
    </ScrollView>
  );
}
