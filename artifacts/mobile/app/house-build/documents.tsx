import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useHouseBuild } from '@/context/HouseBuildContext';
import { useLanguage } from '@/context/LanguageContext';
import { BUILD_STAGES } from '@/features/house-build/stages';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type { TranslationKey } from '@/constants/translations';
import type { DocumentRecord } from '@/db/repositories/house-build.repo';

const DOC_STATUS_KEYS: Record<string, TranslationKey> = {
  missing: 'hb.documents.status.missing',
  'in-progress': 'hb.documents.status.inProgress',
  obtained: 'hb.documents.status.obtained',
  'not-needed': 'hb.documents.status.notNeeded',
};

const DOC_COLORS: Record<string, { bg: string; fg: string }> = {
  missing: { bg: Colors.dangerBg, fg: Colors.danger },
  'in-progress': { bg: Colors.warningBg, fg: Colors.warning },
  obtained: { bg: Colors.successBg, fg: Colors.success },
  'not-needed': { bg: Colors.surfaceAlt, fg: Colors.textMuted },
};

export default function DocumentsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { getDocuments, updateDocumentStatus, seedDocumentsForStage } = useHouseBuild();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [seeded, setSeeded] = useState(false);

  const loadDocuments = useCallback(async () => {
    if (!seeded) {
      for (const stage of BUILD_STAGES) {
        await seedDocumentsForStage(projectId, stage.key);
      }
      setSeeded(true);
    }
    const docs = await getDocuments(projectId);
    setDocuments(docs);
  }, [projectId, getDocuments, seedDocumentsForStage, seeded]);

  useFocusEffect(useCallback(() => { loadDocuments(); }, [loadDocuments]));

  const handleCycle = async (docId: string, current: string) => {
    const next = current === 'missing' ? 'in-progress' : current === 'in-progress' ? 'obtained' : 'missing';
    await updateDocumentStatus(docId, next);
    await loadDocuments();
  };

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;
  const grouped = BUILD_STAGES.map((stage) => ({
    stage,
    docs: documents.filter((d) => d.stageKey === stage.key),
  })).filter((g) => g.docs.length > 0);

  const totalDocs = documents.length;
  const obtainedDocs = documents.filter((d) => d.status === 'obtained').length;
  const missingRequired = documents.filter((d) => d.isRequired && d.status === 'missing').length;

  return (
    <>
      <Stack.Screen options={{ title: 'Dokumenty' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: missingRequired > 0 ? Colors.warningBg : Colors.successBg,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: missingRequired > 0 ? '#FDE68A' : '#BBF7D0',
          }}>
            <Txt w="bold" style={{ fontSize: 16, color: missingRequired > 0 ? '#92400E' : '#166534' }}>
              {missingRequired > 0 ? t('hb.documents.missingRequired', { count: missingRequired }) : t('hb.documents.allComplete')}
            </Txt>
            <Txt style={{ fontSize: 13, color: missingRequired > 0 ? '#B45309' : '#15803D', marginTop: 4 }}>
              {t('hb.documents.obtainedOf', { obtained: obtainedDocs, total: totalDocs })}
            </Txt>
          </View>

          {grouped.map(({ stage, docs }) => (
            <View key={stage.key} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Feather name={stage.icon as any} size={16} color="#2563EB" />
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{stage.name}</Txt>
              </View>
              {docs.map((doc) => {
                const c = DOC_COLORS[doc.status] ?? DOC_COLORS.missing;
                return (
                  <TouchableOpacity
                    key={doc.id}
                    style={{
                      backgroundColor: Colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 6,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      borderWidth: 1,
                      borderColor: Colors.border,
                    }}
                    onPress={() => handleCycle(doc.id, doc.status)}
                    activeOpacity={0.8}
                  >
                    <Feather name="file-text" size={18} color={c.fg} />
                    <View style={{ flex: 1 }}>
                      <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{doc.name}</Txt>
                      <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{doc.description}</Txt>
                    </View>
                    <View style={{ backgroundColor: c.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Txt style={{ fontSize: 10, color: c.fg }}>{t(DOC_STATUS_KEYS[doc.status] ?? DOC_STATUS_KEYS.missing)}</Txt>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {grouped.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Feather name="file" size={40} color={Colors.textMuted} />
              <Txt style={{ fontSize: 14, color: Colors.textMuted, marginTop: 12 }}>{t('hb.documents.empty')}</Txt>
            </View>
          )}

          <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#BFDBFE' }}>
            <Txt style={{ fontSize: 12, color: '#1E40AF' }}>
              Stuknij dokument, aby zmienic jego status. Wymagane dokumenty sa oznaczone.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
