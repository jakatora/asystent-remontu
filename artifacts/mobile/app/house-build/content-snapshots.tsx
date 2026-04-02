import { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { houseBuildContentAdminRepo } from '@/db/repositories/house-build-content-admin.repo';
import type { AdminContentSnapshot } from '@/types/house-build';

const HB_ACCENT = '#2563EB';

export default function ContentSnapshotsScreen() {
  const insets = useSafeAreaInsets();
  const [snapshots, setSnapshots] = useState<AdminContentSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([null, null]);
  const [diffResult, setDiffResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await houseBuildContentAdminRepo.getSnapshots();
      setSnapshots(data);
    } catch (err) {
      console.error('Snapshot load error:', err);
      Alert.alert('Blad', 'Nie udalo sie wczytac snapshotow.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const createSnapshot = async () => {
    if (!newLabel.trim()) { Alert.alert('Blad', 'Podaj etykiete snapshota.'); return; }
    setLoading(true);
    try {
      await houseBuildContentAdminRepo.createSnapshot(newLabel.trim(), newNotes.trim());
      setNewLabel('');
      setNewNotes('');
    } catch (err) {
      console.error('Create snapshot error:', err);
      Alert.alert('Blad', 'Nie udalo sie utworzyc snapshota.');
    }
    load();
  };

  const restoreSnapshot = (snap: AdminContentSnapshot) => {
    Alert.alert('Przywroc snapshot', `Przywrocic "${snap.label}"? Obecne tresci zostana zastapione.`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Przywroc', style: 'destructive', onPress: async () => { setLoading(true); try { await houseBuildContentAdminRepo.restoreSnapshot(snap.id); } catch (err) { console.error('Restore error:', err); Alert.alert('Blad', 'Nie udalo sie przywrocic snapshota.'); } load(); } },
    ]);
  };

  const deleteSnapshot = (snap: AdminContentSnapshot) => {
    Alert.alert('Usun snapshot', `Usunac "${snap.label}"?`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: async () => { await houseBuildContentAdminRepo.deleteSnapshot(snap.id); load(); } },
    ]);
  };

  const compareSnapshots = async () => {
    if (!compareIds[0] || !compareIds[1]) { Alert.alert('Blad', 'Wybierz dwa snapshoty do porownania.'); return; }
    const d1 = await houseBuildContentAdminRepo.getSnapshotData(compareIds[0]);
    const d2 = await houseBuildContentAdminRepo.getSnapshotData(compareIds[1]);
    if (!d1 || !d2) { setDiffResult('Nie mozna wczytac danych snapshota.'); return; }

    const s1Keys = new Set((d1.items || []).map(i => i.contentKey));
    const s2Keys = new Set((d2.items || []).map(i => i.contentKey));
    const added = [...s2Keys].filter(k => !s1Keys.has(k));
    const removed = [...s1Keys].filter(k => !s2Keys.has(k));
    const changed: string[] = [];
    for (const item of d2.items || []) {
      const prev = (d1.items || []).find(i => i.contentKey === item.contentKey);
      if (prev && (prev.title !== item.title || prev.summary !== item.summary || prev.body !== item.body)) {
        changed.push(item.contentKey);
      }
    }
    setDiffResult(`Dodane: ${added.length}\nUsuniete: ${removed.length}\nZmienione: ${changed.length}\n\n${added.length > 0 ? 'Nowe: ' + added.join(', ') + '\n' : ''}${removed.length > 0 ? 'Usuniete: ' + removed.join(', ') + '\n' : ''}${changed.length > 0 ? 'Zmienione: ' + changed.join(', ') : ''}`);
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={HB_ACCENT} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
        <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Nowy snapshot</Txt>
        <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 13, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 }} value={newLabel} onChangeText={setNewLabel} placeholder="Etykieta (np. v1.0, backup)" placeholderTextColor={Colors.textMuted} />
        <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 }} value={newNotes} onChangeText={setNewNotes} placeholder="Notatki (opcjonalne)" multiline placeholderTextColor={Colors.textMuted} />
        <TouchableOpacity onPress={createSnapshot} style={{ backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center' }}>
          <Txt style={{ fontSize: 12, color: '#FFFFFF' }}>Utworz snapshot</Txt>
        </TouchableOpacity>
      </View>

      {snapshots.length >= 2 && (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Porownaj snapshoty</Txt>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {[0, 1].map((idx) => (
              <View key={idx} style={{ flex: 1 }}>
                <Txt style={{ fontSize: 10, color: Colors.textMuted, marginBottom: 4 }}>{idx === 0 ? 'Starszy' : 'Nowszy'}</Txt>
                {snapshots.map((s) => (
                  <TouchableOpacity key={s.id} onPress={() => { const nc = [...compareIds] as [string | null, string | null]; nc[idx] = s.id; setCompareIds(nc); }}
                    style={{ padding: 6, borderRadius: 4, backgroundColor: compareIds[idx] === s.id ? '#EFF6FF' : '#F8FAFC', marginBottom: 2 }}>
                    <Txt style={{ fontSize: 10, color: compareIds[idx] === s.id ? HB_ACCENT : Colors.textMuted }}>{s.label}</Txt>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={compareSnapshots} style={{ backgroundColor: HB_ACCENT, borderRadius: 8, padding: 8, alignItems: 'center' }}>
            <Txt style={{ fontSize: 12, color: '#FFFFFF' }}>Porownaj</Txt>
          </TouchableOpacity>
          {diffResult && (
            <View style={{ marginTop: 8, backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, borderWidth: 1, borderColor: '#E2E8F0' }}>
              <Txt style={{ fontSize: 10, color: Colors.text, fontFamily: 'monospace' }}>{diffResult}</Txt>
            </View>
          )}
        </View>
      )}

      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Snapshoty ({snapshots.length})</Txt>
      {snapshots.map((snap) => (
        <View key={snap.id} style={{ backgroundColor: snap.active ? '#F0FDF4' : '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: snap.active ? '#BBF7D0' : '#E2E8F0', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{snap.label}</Txt>
                {snap.active ? <View style={{ backgroundColor: '#16A34A', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: '#FFFFFF' }}>Aktywny</Txt></View> : null}
              </View>
              {snap.notes ? <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>{snap.notes}</Txt> : null}
              <Txt style={{ fontSize: 9, color: Colors.textMuted, marginTop: 4 }}>
                Etapy: {snap.stageCount} | Formalne: {snap.formalCount} | Media: {snap.utilitiesCount} | Decyzje: {snap.decisionCount} | Pytania: {snap.questionCount} | Ostrzezenia: {snap.warningCount}
              </Txt>
              <Txt style={{ fontSize: 8, color: Colors.textMuted, marginTop: 2 }}>{new Date(snap.createdAt).toLocaleString('pl-PL')}</Txt>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => restoreSnapshot(snap)}><Feather name="rotate-ccw" size={16} color={HB_ACCENT} /></TouchableOpacity>
              <TouchableOpacity onPress={() => deleteSnapshot(snap)}><Feather name="trash-2" size={16} color="#DC2626" /></TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {snapshots.length === 0 && (
        <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Feather name="git-branch" size={20} color={Colors.textMuted} />
          <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4 }}>Brak snapshotow</Txt>
        </View>
      )}
    </ScrollView>
  );
}
