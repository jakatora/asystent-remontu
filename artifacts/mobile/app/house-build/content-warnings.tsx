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

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  danger: { bg: '#FEF2F2', text: '#DC2626' },
  warning: { bg: '#FFFBEB', text: '#D97706' },
  info: { bg: '#EFF6FF', text: '#2563EB' },
};

export default function ContentWarningsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editSeverity, setEditSeverity] = useState('');

  const load = useCallback(async () => {
    try {
    await houseBuildContentAdminRepo.seedAll();
    const data = await houseBuildContentAdminRepo.getContentItems('warning-note');
    setItems(data);
    setLoading(false);
    } catch (err) { console.error("Admin load error:", err); setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = items.filter((i) => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.summary.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (item: AdminContentItem) => { setEditingId(item.id); setEditTitle(item.title); setEditSummary(item.summary); setEditSeverity(item.severity); };
  const saveEdit = async (item: AdminContentItem) => {
    await houseBuildContentAdminRepo.upsertContentItem({ ...item, title: editTitle, summary: editSummary, severity: editSeverity });
    setEditingId(null); load();
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={HB_ACCENT} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <TextInput style={{ backgroundColor: '#FFFFFF', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 13, marginBottom: 12 }} placeholder="Szukaj ostrzezen..." value={search} onChangeText={setSearch} placeholderTextColor={Colors.textMuted} />
      <Txt style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 8 }}>{filtered.length} ostrzezen</Txt>

      {filtered.map((item) => {
        const sev = SEVERITY_COLORS[item.severity] || SEVERITY_COLORS.info;
        return (
          <View key={item.id} style={{ backgroundColor: sev.bg, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 }}>
            {editingId === item.id ? (
              <View style={{ gap: 8 }}>
                <TextInput style={{ backgroundColor: '#FFFFFF', borderRadius: 6, padding: 8, fontSize: 13, borderWidth: 1, borderColor: '#E2E8F0' }} value={editTitle} onChangeText={setEditTitle} placeholderTextColor={Colors.textMuted} />
                <TextInput style={{ backgroundColor: '#FFFFFF', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0' }} value={editSummary} onChangeText={setEditSummary} multiline placeholderTextColor={Colors.textMuted} />
                <TextInput style={{ backgroundColor: '#FFFFFF', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0' }} value={editSeverity} onChangeText={setEditSeverity} placeholder="danger / warning / info" placeholderTextColor={Colors.textMuted} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => saveEdit(item)} style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 6, padding: 8, alignItems: 'center' }}><Txt style={{ fontSize: 12, color: '#FFFFFF' }}>Zapisz</Txt></TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingId(null)} style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 6, padding: 8, alignItems: 'center' }}><Txt style={{ fontSize: 12, color: Colors.textMuted }}>Anuluj</Txt></TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Feather name="alert-triangle" size={14} color={sev.text} />
                      <Txt w="semibold" style={{ fontSize: 13, color: sev.text }}>{item.title}</Txt>
                    </View>
                    <Txt style={{ fontSize: 11, color: Colors.text, marginTop: 4 }}>{item.summary}</Txt>
                  </View>
                  <TouchableOpacity onPress={() => startEdit(item)}><Feather name="edit-2" size={16} color={HB_ACCENT} /></TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  <View style={{ backgroundColor: '#FFFFFF', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: sev.text }}>{item.severity}</Txt></View>
                  {item.stageId ? <View style={{ backgroundColor: '#FFFFFF', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: Colors.textMuted }}>Etapy: {item.stageId}</Txt></View> : null}
                  {item.category ? <View style={{ backgroundColor: '#FFFFFF', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: Colors.textMuted }}>{item.category}</Txt></View> : null}
                </View>
              </>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
