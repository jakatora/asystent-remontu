import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { COMPLETION_CHECKLIST } from '@/features/house-build/formal-checklists';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const PATH_INFO = {
  notice: {
    title: 'Zawiadomienie o zakonczeniu budowy',
    description: 'Standardowa sciezka — inwestor zawiadamia PINB o zakonczeniu budowy. Jesli w ciagu 14 dni organ nie wniesie sprzeciwu, mozna rozpoczac uzytkowanie budynku. Nie wymaga kontroli na budowie.',
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
  },
  permit: {
    title: 'Pozwolenie na uzytkowanie',
    description: 'Wymagane w okreslonych przypadkach: np. gdy dokonano istotnych odstepstw od projektu, zmieniono sposób uzytkowania, lub gdy obowiazek wynika z decyzji o pozwoleniu na budowe. PINB przeprowadza kontrole obiektu.',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
};

export default function CompletionScreen() {
  const insets = useSafeAreaInsets();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [showNotice, setShowNotice] = useState(true);
  const [showPermit, setShowPermit] = useState(false);
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const toggle = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredItems = COMPLETION_CHECKLIST.filter(item => {
    if (item.path === 'both') return true;
    if (item.path === 'notice' && showNotice) return true;
    if (item.path === 'permit' && showPermit) return true;
    return false;
  });

  const totalReq = filteredItems.filter(i => i.isRequired).length;
  const doneReq = filteredItems.filter(i => i.isRequired && completed.has(i.id)).length;

  return (
    <>
      <Stack.Screen options={{ title: 'Zakonczenie budowy' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Txt w="bold" style={{ fontSize: 20, color: Colors.text, marginBottom: 4 }}>Zakonczenie budowy</Txt>
          <Txt style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 16 }}>
            Formalne kroki zamykajace proces budowlany i umozliwiajace uzytkowanie budynku.
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
            <Feather name="info" size={16} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 12, color: '#92400E', flex: 1 }}>
              Sposób zakonczenia budowy zalezy od Twojej sytuacji. W wiekszosci przypadków wystarczy zawiadomienie. Zweryfikuj, która sciezka dotyczy Twojej budowy.
            </Txt>
          </View>

          <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginBottom: 10 }}>Sciezka zakonczenia</Txt>
          {(Object.keys(PATH_INFO) as Array<'notice' | 'permit'>).map(key => {
            const info = PATH_INFO[key];
            const isActive = key === 'notice' ? showNotice : showPermit;
            return (
              <TouchableOpacity
                key={key}
                style={{
                  backgroundColor: isActive ? info.bg : Colors.surface,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: isActive ? info.border : Colors.border,
                  flexDirection: 'row',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
                onPress={() => {
                  if (key === 'notice') setShowNotice(v => !v);
                  else setShowPermit(v => !v);
                }}
                activeOpacity={0.85}
              >
                <Feather
                  name={isActive ? 'check-square' : 'square'}
                  size={20}
                  color={isActive ? info.color : Colors.textMuted}
                  style={{ marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{info.title}</Txt>
                  <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4, lineHeight: 18 }}>{info.description}</Txt>
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={{
            backgroundColor: HB_ACCENT_BG,
            borderRadius: 14,
            padding: 14,
            marginVertical: 16,
            borderWidth: 1,
            borderColor: '#BFDBFE',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Txt w="semibold" style={{ fontSize: 13, color: HB_ACCENT }}>Dokumenty do przygotowania</Txt>
              <Txt w="semibold" style={{ fontSize: 13, color: HB_ACCENT }}>{doneReq}/{totalReq}</Txt>
            </View>
            <View style={{ height: 5, backgroundColor: '#BFDBFE', borderRadius: 3 }}>
              <View style={{ height: 5, backgroundColor: HB_ACCENT, borderRadius: 3, width: `${totalReq > 0 ? Math.round((doneReq / totalReq) * 100) : 0}%` }} />
            </View>
          </View>

          {filteredItems.map(item => {
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

          <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Zrodlo: Prawo budowlane (Dz.U. 2024 poz. 725 t.j.)</Txt>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Art. 54 — zawiadomienie, Art. 55 — pozwolenie na uzytkowanie</Txt>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Ostatnia weryfikacja: 2025-01-15</Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
