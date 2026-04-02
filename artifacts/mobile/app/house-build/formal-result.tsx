import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { FORMAL_PATHS } from '@/features/house-build/formal-path';
import type { FormalPathAssessment, FormalPathId } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const CAUTION_STYLES = {
  info: { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF', icon: 'info' as const },
  caution: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E', icon: 'alert-circle' as const },
  important: { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B', icon: 'alert-triangle' as const },
};

export default function FormalResultScreen() {
  const { assessment: assessmentStr } = useLocalSearchParams<{ assessment: string }>();
  const insets = useSafeAreaInsets();

  const assessment: FormalPathAssessment | null = useMemo(() => {
    try { return JSON.parse(assessmentStr || ''); } catch { return null; }
  }, [assessmentStr]);

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 20;

  if (!assessment) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ color: Colors.textMuted }}>Brak danych oceny</Txt>
      </View>
    );
  }

  const mainPath = FORMAL_PATHS[assessment.recommendedPath];
  const altPaths = assessment.alternativePaths.map(id => FORMAL_PATHS[id]);

  return (
    <>
      <Stack.Screen options={{ title: 'Wynik oceny formalnej' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: HB_ACCENT_BG,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: '#BFDBFE',
            marginBottom: 20,
          }}>
            <Txt style={{ fontSize: 12, color: HB_ACCENT, marginBottom: 4 }}>REKOMENDOWANA SCIEZKA</Txt>
            <Txt w="bold" style={{ fontSize: 20, color: Colors.text, marginBottom: 6 }}>{mainPath.name}</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{mainPath.shortDescription}</Txt>
          </View>

          <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 20 }}>
            {mainPath.longDescription}
          </Txt>

          <View style={{ marginBottom: 20 }}>
            <Txt w="semibold" style={{ fontSize: 14, color: '#16A34A', marginBottom: 8 }}>Zalety</Txt>
            {mainPath.pros.map((p, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <Feather name="check" size={14} color="#16A34A" style={{ marginTop: 2 }} />
                <Txt style={{ fontSize: 13, color: Colors.text, flex: 1 }}>{p}</Txt>
              </View>
            ))}
          </View>

          <View style={{ marginBottom: 24 }}>
            <Txt w="semibold" style={{ fontSize: 14, color: '#DC2626', marginBottom: 8 }}>Ograniczenia</Txt>
            {mainPath.cons.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <Feather name="minus" size={14} color="#DC2626" style={{ marginTop: 2 }} />
                <Txt style={{ fontSize: 13, color: Colors.text, flex: 1 }}>{c}</Txt>
              </View>
            ))}
          </View>

          {assessment.cautionNotes.map(note => {
            const style = CAUTION_STYLES[note.level];
            return (
              <View
                key={note.id}
                style={{
                  backgroundColor: style.bg,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: style.border,
                  flexDirection: 'row',
                  gap: 10,
                }}
              >
                <Feather name={style.icon} size={16} color={style.color} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontSize: 12, color: style.color }}>{note.text}</Txt>
                  {note.source && (
                    <Txt style={{ fontSize: 10, color: style.color, opacity: 0.7, marginTop: 4 }}>
                      Zrodlo: {note.source.sourceLabel}
                    </Txt>
                  )}
                </View>
              </View>
            );
          })}

          {altPaths.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginBottom: 12 }}>Alternatywne sciezki</Txt>
              {altPaths.map(alt => (
                <View
                  key={alt.id}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: Colors.border,
                  }}
                >
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{alt.name}</Txt>
                  <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4 }}>{alt.shortDescription}</Txt>
                </View>
              ))}
            </View>
          )}

          <SourceLabel text={mainPath.source.sourceLabel} date={mainPath.source.lastReviewedDate} />

          <View style={{ gap: 10, marginTop: 20 }}>
            <TouchableOpacity
              style={{
                backgroundColor: HB_ACCENT,
                borderRadius: 14,
                padding: 16,
                alignItems: 'center',
              }}
              onPress={() => router.push('/house-build/formal-documents')}
            >
              <Txt w="bold" style={{ fontSize: 15, color: '#fff' }}>Zobacz wymagane dokumenty</Txt>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 14,
                padding: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.border,
              }}
              onPress={() => router.back()}
            >
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>Zmien odpowiedzi</Txt>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function SourceLabel({ text, date }: { text: string; date: string }) {
  return (
    <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
      <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Zrodlo: {text}</Txt>
      <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Ostatnia weryfikacja: {date}</Txt>
    </View>
  );
}
