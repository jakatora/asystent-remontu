import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const SOURCE_LABEL = 'Art. 41 Prawa budowlanego — zawiadomienie o rozpoczeciu robót';
const SOURCE_DATE = '2025-01-15';

interface InfoItem {
  icon: string;
  title: string;
  description: string;
}

const NOTIFICATION_STEPS: InfoItem[] = [
  {
    icon: 'calendar',
    title: 'Termin zawiadomienia',
    description: 'Inwestor zawiadamia organ nadzoru budowlanego (PINB) oraz projektanta co najmniej 7 dni przed planowanym rozpoczeciem robót budowlanych.',
  },
  {
    icon: 'user',
    title: 'Wymagane dane',
    description: 'W zawiadomieniu podaje sie dane inwestora, kierownika budowy (imie, nazwisko, nr uprawnien, przynaleznosc do izby), adres budowy, nr pozwolenia/zgloszenia.',
  },
  {
    icon: 'file-text',
    title: 'Dokumenty do dolaczenia',
    description: 'Oswiadczenie kierownika budowy o przyjeciu obowiazków, plan BIOZ (jesli wymagany), potwierdzenie uprawnien kierownika budowy.',
  },
  {
    icon: 'monitor',
    title: 'e-Budownictwo',
    description: 'Zawiadomienie mozna zlozyc online przez platforme e-Budownictwo (e-budownictwo.gunb.gov.pl) z Profilem Zaufanym.',
  },
];

export default function StartWorksScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  return (
    <>
      <Stack.Screen options={{ title: 'Rozpoczecie robót' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Txt w="bold" style={{ fontSize: 20, color: Colors.text, marginBottom: 4 }}>Rozpoczecie robót budowlanych</Txt>
          <Txt style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 16 }}>
            Formalne kroki zwiazane z zawiadomieniem o rozpoczeciu robót.
          </Txt>

          <View style={{
            backgroundColor: '#FEF2F2',
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#FECACA',
            flexDirection: 'row',
            gap: 10,
          }}>
            <Feather name="alert-triangle" size={16} color="#991B1B" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 12, color: '#991B1B', flex: 1 }}>
              Nie rozpoczynaj robót budowlanych przed zlozeniem wymaganego zawiadomienia i uplywie wymaganego terminu. Rozpoczecie robót bez dopelnienia formalnosci moze skutkowac konsekwencjami prawnymi.
            </Txt>
          </View>

          <View style={{
            backgroundColor: HB_ACCENT_BG,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#BFDBFE',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="send" size={18} color={HB_ACCENT} />
              </View>
              <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>Zawiadomienie o rozpoczeciu robót</Txt>
            </View>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>
              Przed rozpoczeciem budowy inwestor jest zobowiazany zawiadomic powiatowego inspektora nadzoru budowlanego (PINB) i projektanta o zamierzonym terminie rozpoczecia robót budowlanych.
            </Txt>
          </View>

          {NOTIFICATION_STEPS.map((item, i) => (
            <View
              key={i}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: Colors.border,
                flexDirection: 'row',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: HB_ACCENT_BG,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Feather name={item.icon as any} size={16} color={HB_ACCENT} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{item.title}</Txt>
                <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4, lineHeight: 18 }}>{item.description}</Txt>
              </View>
            </View>
          ))}

          <View style={{
            backgroundColor: '#FFFBEB',
            borderRadius: 12,
            padding: 12,
            marginTop: 10,
            borderWidth: 1,
            borderColor: '#FDE68A',
            flexDirection: 'row',
            gap: 10,
          }}>
            <Feather name="info" size={16} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 12, color: '#92400E', flex: 1 }}>
              Szczególowe wymagania moga sie róznic w zaleznosci od sciezki formalnej (pozwolenie vs zgloszenie vs dom do 70 m2). Szczególy potwierdz z urzedem.
            </Txt>
          </View>

          <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Zrodlo: {SOURCE_LABEL}</Txt>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Ostatnia weryfikacja: {SOURCE_DATE}</Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
