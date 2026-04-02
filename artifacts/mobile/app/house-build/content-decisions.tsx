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

export default function ContentDecisionsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStageId, setEditStageId] = useState('');

  const load = useCallback(async () => {
    try {
    await houseBuildContentAdminRepo.seedAll();
    const data = await houseBuildContentAdminRepo.getContentItems('decision-template');
    setItems(data);
    setLoading(false);
    } catch (err) { console.error("Admin load error:", err); setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = items.filter((i) => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (item: AdminContentItem) => { setEditingId(item.id); setEditTitle(item.title); setEditCategory(item.category); setEditStageId(item.stageId); };
  const saveEdit = async (item: AdminContentItem) => {
    await houseBuildContentAdminRepo.upsertContentItem({ ...item, title: editTitle, category: editCategory, stageId: editStageId });
    setEditingId(null); load();
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={HB_ACCENT} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <TextInput style={{ backgroundColor: '#FFFFFF', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 13, marginBottom: 12 }} placeholder="Szukaj decyzji..." value={search} onChangeText={setSearch} placeholderTextColor={Colors.textMuted} />
      <Txt style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 8 }}>{filtered.length} szablonow decyzji</Txt>

      {filtered.map((item) => (
        <View key={item.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 }}>
          {editingId === item.id ? (
            <View style={{ gap: 8 }}>
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 13, borderWidth: 1, borderColor: '#E2E8F0' }} value={editTitle} onChangeText={setEditTitle} placeholder="Tytul decyzji" placeholderTextColor={Colors.textMuted} />
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0' }} value={editCategory} onChangeText={setEditCategory} placeholder="Kategoria" placeholderTextColor={Colors.textMuted} />
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0' }} value={editStageId} onChangeText={setEditStageId} placeholder="ID etapu" placeholderTextColor={Colors.textMuted} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => saveEdit(item)} style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 6, padding: 8, alignItems: 'center' }}><Txt style={{ fontSize: 12, color: '#FFFFFF' }}>Zapisz</Txt></TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingId(null)} style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 6, padding: 8, alignItems: 'center' }}><Txt style={{ fontSize: 12, color: Colors.textMuted }}>Anuluj</Txt></TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Txt w="semibold" style={{ fontSize: 13, color: Colors.text, flex: 1 }}>{item.title}</Txt>
                <TouchableOpacity onPress={() => startEdit(item)}><Feather name="edit-2" size={16} color={HB_ACCENT} /></TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                {item.category ? <View style={{ backgroundColor: '#EFF6FF', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: HB_ACCENT }}>{item.category}</Txt></View> : null}
                {item.stageId ? <View style={{ backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: Colors.textMuted }}>Etap: {item.stageId}</Txt></View> : <View style={{ backgroundColor: '#FEF2F2', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: '#DC2626' }}>Brak etapu</Txt></View>}
              </View>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
