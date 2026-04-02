import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { START_WORKS_CHECKLIST } from '@/features/house-build/formal-checklists';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const CATEGORY_LABELS = {
  formal: { label: 'Formalne', color: '#2563EB', bg: '#EFF6FF' },
  site: { label: 'Plac budowy', color: '#D97706', bg: '#FFFBEB' },
  utility: { label: 'Media', color: '#16A34A', bg: '#F0FDF4' },
};

export default function BeforeWorksScreen() {
  const insets = useSafeAreaInsets();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const toggle = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const categories = ['formal', 'site', 'utility'] as const;

  const totalRequired = START_WORKS_CHECKLIST.filter(i => i.isRequired).length;
  const doneRequired = START_WORKS_CHECKLIST.filter(i => i.isRequired && completed.has(i.id)).length;

  return (
    <>
      <Stack.Screen options={{ title: 'Przed rozpoczeciem robót' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Txt w="bold" style={{ fontSize: 20, color: Colors.text, marginBottom: 4 }}>Przed rozpoczeciem robót</Txt>
          <Txt style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 16 }}>
            Lista kroków, które warto wykonac przed faktycznym rozpoczeciem prac budowlanych.
          </Txt>

          <View style={{
            backgroundColor: '#FFFBEB',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#FDE68A',
            flexDirection: 'row',
            gap: 10,
          }}>
            <Feather name="alert-circle" size={16} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 12, color: '#92400E', flex: 1 }}>
              Roboty budowlane nie powinny sie rozpoczac przed zakonczeniem wymaganych kroków formalnych (w tym zawiadomienia o terminie rozpoczecia robót).
            </Txt>
          </View>

          <View style={{
            backgroundColor: HB_ACCENT_BG,
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#BFDBFE',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Txt w="semibold" style={{ fontSize: 13, color: HB_ACCENT }}>Wymagane kroki</Txt>
              <Txt w="semibold" style={{ fontSize: 13, color: HB_ACCENT }}>{doneRequired}/{totalRequired}</Txt>
            </View>
            <View style={{ height: 5, backgroundColor: '#BFDBFE', borderRadius: 3 }}>
              <View style={{ height: 5, backgroundColor: HB_ACCENT, borderRadius: 3, width: `${totalRequired > 0 ? Math.round((doneRequired / totalRequired) * 100) : 0}%` }} />
            </View>
          </View>

          {categories.map(cat => {
            const items = START_WORKS_CHECKLIST.filter(i => i.category === cat);
            const catStyle = CATEGORY_LABELS[cat];
            return (
              <View key={cat} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <View style={{ backgroundColor: catStyle.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Txt w="semibold" style={{ fontSize: 11, color: catStyle.color }}>{catStyle.label}</Txt>
                  </View>
                </View>
                {items.map(item => {
                  const done = completed.has(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={{
                        backgroundColor: Colors.surface,
                        borderRadius: 12,
                        padding: 14,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: done ? '#BBF7D0' : Colors.border,
                        flexDirection: 'row',
                        gap: 12,
                        alignItems: 'flex-start',
                      }}
                      onPress={() => toggle(item.id)}
                      activeOpacity={0.85}
                    >
                      <Feather
                        name={done ? 'check-square' : 'square'}
                        size={20}
                        color={done ? '#16A34A' : Colors.textMuted}
                        style={{ marginTop: 1 }}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Txt w="semibold" style={{ fontSize: 13, color: done ? Colors.textMuted : Colors.text, flex: 1, textDecorationLine: done ? 'line-through' : 'none' }}>
                            {item.title}
                          </Txt>
                          {item.isRequired && (
                            <View style={{ backgroundColor: '#FEE2E2', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                              <Txt style={{ fontSize: 9, color: '#DC2626' }}>wymagane</Txt>
                            </View>
                          )}
                        </View>
                        <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4, lineHeight: 18 }}>{item.description}</Txt>
                        {item.source && (
                          <Txt style={{ fontSize: 10, color: Colors.textMuted, opacity: 0.7, marginTop: 4 }}>
                            Zrodlo: {item.source.sourceLabel}
                          </Txt>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}

          <View style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 10,
            padding: 12,
            marginTop: 8,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            flexDirection: 'row',
            gap: 8,
          }}>
            <Feather name="shield" size={14} color={Colors.textMuted} style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 11, color: Colors.textMuted, flex: 1 }}>
              To lista orientacyjna. Szczególowe wymagania potwierdz z urzedem, projektantem i kierownikiem budowy.
            </Txt>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: HB_ACCENT,
              borderRadius: 14,
              padding: 16,
              alignItems: 'center',
              marginTop: 12,
            }}
            onPress={() => router.push('/house-build/start-works')}
          >
            <Txt w="bold" style={{ fontSize: 15, color: '#fff' }}>Rozpoczecie robót</Txt>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
