import { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { houseBuildContentAdminRepo } from '@/db/repositories/house-build-content-admin.repo';
import type { AdminContentItem } from '@/types/house-build';

const HB_ACCENT = '#2563EB';

export default function ContentStagesScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editBody, setEditBody] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const load = useCallback(async () => {
    try {
    await houseBuildContentAdminRepo.seedAll();
    const data = await houseBuildContentAdminRepo.getContentItems('stage-description');
    setItems(data);
    setLoading(false);
    } catch (err) { console.error("Admin load error:", err); setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = items.filter((i) => {
    if (filter === 'active' && !i.active) return false;
    if (filter === 'inactive' && i.active) return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.summary.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const startEdit = (item: AdminContentItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditSummary(item.summary);
    setEditBody(item.body);
  };

  const saveEdit = async (item: AdminContentItem) => {
    await houseBuildContentAdminRepo.upsertContentItem({
      ...item,
      title: editTitle,
      summary: editSummary,
      body: editBody,
    });
    setEditingId(null);
    load();
  };

  const toggleActive = async (item: AdminContentItem) => {
    await houseBuildContentAdminRepo.toggleContentActive(item.id, !item.active);
    load();
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={HB_ACCENT} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <TextInput
        style={{ backgroundColor: '#FFFFFF', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 13, marginBottom: 8 }}
        placeholder="Szukaj etapu..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor={Colors.textMuted}
      />

      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}
            style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: filter === f ? HB_ACCENT : '#F1F5F9' }}>
            <Txt style={{ fontSize: 11, color: filter === f ? '#FFFFFF' : Colors.textMuted }}>
              {f === 'all' ? 'Wszystkie' : f === 'active' ? 'Aktywne' : 'Nieaktywne'}
            </Txt>
          </TouchableOpacity>
        ))}
      </View>

      <Txt style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 8 }}>{filtered.length} rekordow</Txt>

      {filtered.map((item) => (
        <View key={item.id} style={{
          backgroundColor: item.active ? '#FFFFFF' : '#F8FAFC', borderRadius: 10, padding: 12,
          borderWidth: 1, borderColor: item.active ? '#E2E8F0' : '#FDE68A', marginBottom: 8,
        }}>
          {editingId === item.id ? (
            <View style={{ gap: 8 }}>
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 13, borderWidth: 1, borderColor: '#E2E8F0' }} value={editTitle} onChangeText={setEditTitle} placeholder="Tytul" placeholderTextColor={Colors.textMuted} />
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0' }} value={editSummary} onChangeText={setEditSummary} placeholder="Podsumowanie" multiline placeholderTextColor={Colors.textMuted} />
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 60 }} value={editBody} onChangeText={setEditBody} placeholder="Opis szczegolowy" multiline placeholderTextColor={Colors.textMuted} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => saveEdit(item)} style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 6, padding: 8, alignItems: 'center' }}>
                  <Txt style={{ fontSize: 12, color: '#FFFFFF' }}>Zapisz</Txt>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingId(null)} style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 6, padding: 8, alignItems: 'center' }}>
                  <Txt style={{ fontSize: 12, color: Colors.textMuted }}>Anuluj</Txt>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{item.title}</Txt>
                  <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{item.summary}</Txt>
                  {item.body ? <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 4 }}>{item.body}</Txt> : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity onPress={() => startEdit(item)}>
                    <Feather name="edit-2" size={16} color={HB_ACCENT} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleActive(item)}>
                    <Feather name={item.active ? 'eye' : 'eye-off'} size={16} color={item.active ? '#16A34A' : '#EAB308'} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                <View style={{ backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                  <Txt style={{ fontSize: 8, color: Colors.textMuted }}>Etap: {item.stageId || '-'}</Txt>
                </View>
                {item.sourceText ? (
                  <View style={{ backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                    <Txt style={{ fontSize: 8, color: Colors.textMuted }}>Zrodlo: {item.sourceText}</Txt>
                  </View>
                ) : null}
                <View style={{ backgroundColor: item.active ? '#F0FDF4' : '#FEF2F2', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                  <Txt style={{ fontSize: 8, color: item.active ? '#16A34A' : '#DC2626' }}>{item.active ? 'Aktywny' : 'Nieaktywny'}</Txt>
                </View>
              </View>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
