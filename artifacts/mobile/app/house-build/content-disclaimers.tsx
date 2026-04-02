import { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { houseBuildContentAdminRepo } from '@/db/repositories/house-build-content-admin.repo';
import type { AdminTrustDisclaimer } from '@/types/house-build';

const HB_ACCENT = '#2563EB';

export default function ContentDisclaimersScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AdminTrustDisclaimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const load = useCallback(async () => {
    try {
    await houseBuildContentAdminRepo.seedAll();
    const data = await houseBuildContentAdminRepo.getDisclaimers();
    setItems(data);
    setLoading(false);
    } catch (err) { console.error("Admin load error:", err); setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const startEdit = (d: AdminTrustDisclaimer) => { setEditingId(d.id); setEditText(d.text); setEditCategory(d.category); };
  const saveEdit = async (d: AdminTrustDisclaimer) => {
    await houseBuildContentAdminRepo.upsertDisclaimer({ ...d, text: editText, category: editCategory });
    setEditingId(null); load();
  };

  const confirmDelete = (d: AdminTrustDisclaimer) => {
    Alert.alert('Usun zastrzezenie', `Usunac "${d.disclaimerKey}"?`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: async () => { await houseBuildContentAdminRepo.deleteDisclaimer(d.id); load(); } },
    ]);
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={HB_ACCENT} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <View style={{ backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', gap: 8 }}>
        <Feather name="info" size={14} color="#D97706" style={{ marginTop: 1 }} />
        <Txt style={{ fontSize: 11, color: '#92400E', flex: 1 }}>
          Zastrzezenia i noty zaufania sa centralnymi, wielokrotnie uzywanymi tekstami wyswietlanymi w roznych miejscach aplikacji.
        </Txt>
      </View>

      <Txt style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 8 }}>{items.length} zastrzezen</Txt>

      {items.map((d) => (
        <View key={d.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 }}>
          {editingId === d.id ? (
            <View style={{ gap: 8 }}>
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0' }} value={editText} onChangeText={setEditText} multiline placeholder="Tresc zastrzezenia" placeholderTextColor={Colors.textMuted} />
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0' }} value={editCategory} onChangeText={setEditCategory} placeholder="Kategoria" placeholderTextColor={Colors.textMuted} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => saveEdit(d)} style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 6, padding: 8, alignItems: 'center' }}><Txt style={{ fontSize: 12, color: '#FFFFFF' }}>Zapisz</Txt></TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingId(null)} style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 6, padding: 8, alignItems: 'center' }}><Txt style={{ fontSize: 12, color: Colors.textMuted }}>Anuluj</Txt></TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Txt w="semibold" style={{ fontSize: 11, color: HB_ACCENT, marginBottom: 4 }}>{d.disclaimerKey}</Txt>
                  <Txt style={{ fontSize: 12, color: Colors.text }}>{d.text}</Txt>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => startEdit(d)}><Feather name="edit-2" size={16} color={HB_ACCENT} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(d)}><Feather name="trash-2" size={16} color="#DC2626" /></TouchableOpacity>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                <View style={{ backgroundColor: '#EFF6FF', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: HB_ACCENT }}>{d.category}</Txt></View>
                <View style={{ backgroundColor: d.active ? '#F0FDF4' : '#FEF2F2', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}><Txt style={{ fontSize: 8, color: d.active ? '#16A34A' : '#DC2626' }}>{d.active ? 'Aktywne' : 'Nieaktywne'}</Txt></View>
              </View>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
