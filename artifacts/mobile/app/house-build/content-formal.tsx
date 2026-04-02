import { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { houseBuildContentAdminRepo } from '@/db/repositories/house-build-content-admin.repo';
import type { AdminContentItem } from '@/types/house-build';

const HB_ACCENT = '#2563EB';

export default function ContentFormalScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editBody, setEditBody] = useState('');

  const load = useCallback(async () => {
    try {
    await houseBuildContentAdminRepo.seedAll();
    const data = await houseBuildContentAdminRepo.getContentItems('formal-guidance');
    setItems(data);
    setLoading(false);
    } catch (err) { console.error("Admin load error:", err); setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = items.filter((i) => {
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
    await houseBuildContentAdminRepo.upsertContentItem({ ...item, title: editTitle, summary: editSummary, body: editBody });
    setEditingId(null);
    load();
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={HB_ACCENT} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <TextInput
        style={{ backgroundColor: '#FFFFFF', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 13, marginBottom: 12 }}
        placeholder="Szukaj wytycznych..."
        value={search} onChangeText={setSearch} placeholderTextColor={Colors.textMuted}
      />
      <Txt style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 8 }}>{filtered.length} rekordow</Txt>

      {filtered.map((item) => (
        <View key={item.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 }}>
          {editingId === item.id ? (
            <View style={{ gap: 8 }}>
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 13, borderWidth: 1, borderColor: '#E2E8F0' }} value={editTitle} onChangeText={setEditTitle} placeholder="Tytul" placeholderTextColor={Colors.textMuted} />
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0' }} value={editSummary} onChangeText={setEditSummary} placeholder="Podsumowanie" multiline placeholderTextColor={Colors.textMuted} />
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 60 }} value={editBody} onChangeText={setEditBody} placeholder="Tresc" multiline placeholderTextColor={Colors.textMuted} />
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
                <TouchableOpacity onPress={() => startEdit(item)}>
                  <Feather name="edit-2" size={16} color={HB_ACCENT} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                {item.stageId ? <View style={{ backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: Colors.textMuted }}>Etap: {item.stageId}</Txt></View> : null}
                {item.category ? <View style={{ backgroundColor: '#EFF6FF', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: HB_ACCENT }}>{item.category}</Txt></View> : null}
                {item.sourceText ? <View style={{ backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: Colors.textMuted }}>{item.sourceText}</Txt></View> : null}
              </View>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
