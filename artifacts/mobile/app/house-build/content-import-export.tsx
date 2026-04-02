import { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { houseBuildContentAdminRepo } from '@/db/repositories/house-build-content-admin.repo';

const HB_ACCENT = '#2563EB';

export default function ContentImportExportScreen() {
  const insets = useSafeAreaInsets();
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [importResult, setImportResult] = useState<{ created: number; updated: number; skipped: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const json = await houseBuildContentAdminRepo.exportAllContent();
      setExportData(json);
    } catch (err) {
      console.error('Export error:', err);
      Alert.alert('Blad', 'Nie udalo sie wyeksportowac danych.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      Alert.alert('Blad', 'Wklej dane JSON do importu.');
      return;
    }

    Alert.alert('Import tresci', 'Dane zostana zaimportowane. Istniejace rekordy beda zaktualizowane. Kontynuowac?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Importuj',
        onPress: async () => {
          setLoading(true);
          try {
            const result = await houseBuildContentAdminRepo.importContent(importData);
            setImportResult(result);
          } catch (err) {
            console.error('Import error:', err);
            Alert.alert('Blad', 'Nie udalo sie zaimportowac danych.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Feather name="upload" size={18} color={HB_ACCENT} />
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>Eksport</Txt>
        </View>
        <Txt style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 8 }}>Eksportuj wszystkie tresci (etapy, wytyczne, szablony, ostrzezenia, zrodla, zastrzezenia) do formatu JSON.</Txt>
        <TouchableOpacity onPress={handleExport} disabled={loading} style={{ backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center' }}>
          <Txt style={{ fontSize: 12, color: '#FFFFFF' }}>{loading ? 'Eksportowanie...' : 'Eksportuj dane'}</Txt>
        </TouchableOpacity>
        {exportData ? (
          <View style={{ marginTop: 8 }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted, marginBottom: 4 }}>Wyeksportowano ({Math.round(exportData.length / 1024)} KB)</Txt>
            <TextInput
              style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 10, borderWidth: 1, borderColor: '#E2E8F0', maxHeight: 200, fontFamily: 'monospace' }}
              value={exportData}
              multiline
              editable={false}
              selectTextOnFocus
            />
          </View>
        ) : null}
      </View>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Feather name="download" size={18} color={HB_ACCENT} />
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>Import</Txt>
        </View>
        <Txt style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 8 }}>Wklej dane JSON do importu. Istniejace rekordy zostana zaktualizowane, nowe - utworzone.</Txt>
        <TextInput
          style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 10, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 100, fontFamily: 'monospace' }}
          value={importData}
          onChangeText={setImportData}
          multiline
          placeholder='{"items": [...], "sources": [...], "disclaimers": [...]}'
          placeholderTextColor={Colors.textMuted}
        />
        <TouchableOpacity onPress={handleImport} disabled={loading} style={{ backgroundColor: '#16A34A', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 }}>
          <Txt style={{ fontSize: 12, color: '#FFFFFF' }}>{loading ? 'Importowanie...' : 'Importuj dane'}</Txt>
        </TouchableOpacity>

        {importResult ? (
          <View style={{ marginTop: 12, backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 4 }}>Wynik importu</Txt>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 4 }}>
              <Txt style={{ fontSize: 11, color: '#16A34A' }}>Utworzone: {importResult.created}</Txt>
              <Txt style={{ fontSize: 11, color: HB_ACCENT }}>Zaktualizowane: {importResult.updated}</Txt>
              <Txt style={{ fontSize: 11, color: Colors.textMuted }}>Pominiete: {importResult.skipped}</Txt>
            </View>
            {importResult.errors.length > 0 && (
              <View style={{ marginTop: 4 }}>
                <Txt style={{ fontSize: 10, color: '#DC2626', marginBottom: 2 }}>Bledy:</Txt>
                {importResult.errors.map((e, i) => <Txt key={i} style={{ fontSize: 9, color: '#DC2626' }}>- {e}</Txt>)}
              </View>
            )}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
