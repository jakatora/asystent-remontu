import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isSentryConfigured } from '@/lib/sentry';
import { Txt } from '@/components/ui/Txt';

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

function SettingRow({ icon, title, subtitle, onPress, iconColor = '#F97316', iconBg = '#FFF7ED', danger = false, badge }: SettingRowProps) {
  const color = danger ? '#EF4444' : iconColor;
  const bg = danger ? '#FEF2F2' : iconBg;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center p-3.5 gap-3.5"
    >
      <View className="w-[38px] h-[38px] rounded-[10px] items-center justify-center" style={{ backgroundColor: bg }}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <View className="flex-1">
        <Txt w="medium" className="text-[15px]" style={{ color: danger ? '#EF4444' : '#0F172A' }}>{title}</Txt>
        {subtitle && <Txt className="text-xs text-muted mt-0.5">{subtitle}</Txt>}
      </View>
      {badge && (
        <View className="px-2 py-0.5 rounded-full bg-success-bg">
          <Txt w="semibold" className="text-xs text-success">{badge}</Txt>
        </View>
      )}
      {onPress && <Feather name="chevron-right" size={18} color="#94A3B8" />}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View className="h-px bg-stroke-light" style={{ marginLeft: 66 }} />;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { projects } = useApp();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const handleAbout = () => {
    Alert.alert(
      'Remont Asystent',
      'Wersja 1.0.0\n\nTwój przewodnik po remontach. Prowadzi krok po kroku, oblicza materiały i pomaga zaplanować każdy remont.\n\nDane przechowywane lokalnie na urządzeniu.',
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

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5 mb-4">
        <Txt w="bold" className="text-[26px] text-ink">Ustawienia</Txt>
      </View>

      {/* Profile card */}
      <View className="flex-row items-center gap-3.5 mx-5 mb-6 bg-surface rounded-2xl p-4 border border-stroke">
        <View className="w-14 h-14 rounded-full bg-primary-bg items-center justify-center">
          <Feather name="home" size={28} color="#F97316" />
        </View>
        <View>
          <Txt w="bold" className="text-[18px] text-ink">Remont Asystent</Txt>
          <Txt className="text-[13px] text-slate mt-0.5">{projects.length} projektów zapisanych</Txt>
        </View>
      </View>

      {/* Dane */}
      <View className="px-5 mb-6">
        <Txt w="semibold" className="text-[13px] text-muted mb-2 uppercase tracking-wide">Dane</Txt>
        <View className="bg-surface rounded-2xl border border-stroke overflow-hidden">
          <SettingRow
            icon="folder"
            title="Moje projekty"
            subtitle={`${projects.length} projektów w pamięci urządzenia`}
            iconColor="#3B82F6"
            iconBg="#EFF6FF"
          />
          <Divider />
          <SettingRow
            icon="shield"
            title="Dane offline"
            subtitle="Wszystkie dane są na Twoim urządzeniu"
            iconColor="#22C55E"
            iconBg="#F0FDF4"
            badge="Aktywne"
          />
        </View>
      </View>

      {/* Sync */}
      <View className="px-5 mb-6">
        <Txt w="semibold" className="text-[13px] text-muted mb-2 uppercase tracking-wide">Synchronizacja</Txt>
        <View className="bg-surface rounded-2xl border border-stroke overflow-hidden">
          <SettingRow
            icon="cloud"
            title="Synchronizacja z chmurą"
            subtitle={isSupabaseConfigured ? 'Połączone z Supabase' : 'Niedostępne — brak konfiguracji'}
            iconColor="#3B82F6"
            iconBg="#EFF6FF"
          />
          <Divider />
          <SettingRow
            icon="user"
            title="Konto użytkownika"
            subtitle="Zaloguj się aby synchronizować projekty"
            iconColor="#8B5CF6"
            iconBg="#F5F3FF"
          />
        </View>
      </View>

      {/* Aplikacja */}
      <View className="px-5 mb-6">
        <Txt w="semibold" className="text-[13px] text-muted mb-2 uppercase tracking-wide">Aplikacja</Txt>
        <View className="bg-surface rounded-2xl border border-stroke overflow-hidden">
          <SettingRow
            icon="info"
            title="O aplikacji"
            subtitle="Wersja 1.0.0"
            onPress={handleAbout}
            iconColor="#1E293B"
            iconBg="#F1F5F9"
          />
          <Divider />
          <SettingRow
            icon="book-open"
            title="Jak korzystać z aplikacji"
            subtitle="Przewodnik po funkcjach"
            onPress={handleHelp}
            iconColor="#3B82F6"
            iconBg="#EFF6FF"
          />
          <Divider />
          <SettingRow
            icon="activity"
            title="Raportowanie błędów"
            subtitle={isSentryConfigured ? 'Sentry aktywne' : 'Wyłączone'}
            iconColor="#F59E0B"
            iconBg="#FFFBEB"
          />
        </View>
      </View>

      {/* Bezpieczeństwo */}
      <View className="px-5 mb-6">
        <Txt w="semibold" className="text-[13px] text-muted mb-2 uppercase tracking-wide">Bezpieczeństwo</Txt>
        <View className="bg-surface rounded-2xl border border-stroke overflow-hidden">
          <SettingRow
            icon="alert-triangle"
            title="Zasady bezpieczeństwa"
            subtitle="Ważne informacje przed pracami"
            onPress={handleSafety}
            iconColor="#F59E0B"
            iconBg="#FFFBEB"
          />
        </View>
      </View>

      <Txt className="text-center text-xs text-muted mb-5">
        Remont Asystent v1.0.0 • Dane offline
      </Txt>
    </ScrollView>
  );
}
