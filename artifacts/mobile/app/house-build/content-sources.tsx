import { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { houseBuildContentAdminRepo } from '@/db/repositories/house-build-content-admin.repo';
import type { AdminSourceRegistryEntry } from '@/types/house-build';
import { SOURCE_TYPE_LABELS, RELIABILITY_LABELS } from '@/features/house-build/content-admin-seeds';

const HB_ACCENT = '#2563EB';

export default function ContentSourcesScreen() {
  const insets = useSafeAreaInsets();
  const [sources, setSources] = useState<AdminSourceRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const load = useCallback(async () => {
    try {
    await houseBuildContentAdminRepo.seedAll();
    const data = await houseBuildContentAdminRepo.getSources();
    setSources(data);
    setLoading(false);
    } catch (err) { console.error("Admin load error:", err); setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const startEdit = (s: AdminSourceRegistryEntry) => { setEditingId(s.id); setEditName(s.sourceName); setEditUrl(s.sourceUrl); setEditNotes(s.notes); };
  const saveEdit = async (s: AdminSourceRegistryEntry) => {
    await houseBuildContentAdminRepo.upsertSource({ ...s, sourceName: editName, sourceUrl: editUrl, notes: editNotes });
    setEditingId(null); load();
  };

  const confirmDelete = (s: AdminSourceRegistryEntry) => {
    Alert.alert('Usun zrodlo', `Usunac "${s.sourceName}"?`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: async () => { await houseBuildContentAdminRepo.deleteSource(s.id); load(); } },
    ]);
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={HB_ACCENT} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <Txt style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 12 }}>{sources.length} zrodel w rejestrze</Txt>

      {sources.map((s) => (
        <View key={s.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 }}>
          {editingId === s.id ? (
            <View style={{ gap: 8 }}>
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 13, borderWidth: 1, borderColor: '#E2E8F0' }} value={editName} onChangeText={setEditName} placeholder="Nazwa zrodla" placeholderTextColor={Colors.textMuted} />
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0' }} value={editUrl} onChangeText={setEditUrl} placeholder="URL" placeholderTextColor={Colors.textMuted} />
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0' }} value={editNotes} onChangeText={setEditNotes} placeholder="Notatki" multiline placeholderTextColor={Colors.textMuted} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => saveEdit(s)} style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 6, padding: 8, alignItems: 'center' }}><Txt style={{ fontSize: 12, color: '#FFFFFF' }}>Zapisz</Txt></TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingId(null)} style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 6, padding: 8, alignItems: 'center' }}><Txt style={{ fontSize: 12, color: Colors.textMuted }}>Anuluj</Txt></TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{s.sourceName}</Txt>
                  {s.sourceUrl ? <Txt style={{ fontSize: 10, color: HB_ACCENT, marginTop: 2 }}>{s.sourceUrl}</Txt> : null}
                  {s.notes ? <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>{s.notes}</Txt> : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => startEdit(s)}><Feather name="edit-2" size={16} color={HB_ACCENT} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(s)}><Feather name="trash-2" size={16} color="#DC2626" /></TouchableOpacity>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                <View style={{ backgroundColor: '#EFF6FF', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: HB_ACCENT }}>{SOURCE_TYPE_LABELS[s.sourceType] || s.sourceType}</Txt></View>
                <View style={{ backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: Colors.textMuted }}>{RELIABILITY_LABELS[s.reliabilityLevel] || s.reliabilityLevel}</Txt></View>
                {s.regionRelevance ? <View style={{ backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: Colors.textMuted }}>{s.regionRelevance}</Txt></View> : null}
                <View style={{ backgroundColor: s.active ? '#F0FDF4' : '#FEF2F2', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: s.active ? '#16A34A' : '#DC2626' }}>{s.active ? 'Aktywne' : 'Nieaktywne'}</Txt></View>
              </View>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
