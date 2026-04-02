import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { OFFICIAL_CHECKLIST_GROUPS } from '@/features/house-build/formal-checklists';
import type { FormalPathId } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const PATH_LABELS: Record<FormalPathId, string> = {
  'building-permit': 'Pozwolenie',
  'notification-with-design': 'Zgloszenie',
  'simplified-70m2': 'Do 70 m2',
};

export default function FormalDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleItem = (id: string) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalItems = OFFICIAL_CHECKLIST_GROUPS.reduce((s, g) => s + g.items.length, 0);
  const doneItems = OFFICIAL_CHECKLIST_GROUPS.reduce((s, g) => s + g.items.filter(i => completedItems.has(i.id)).length, 0);
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Dokumenty i formalnosci' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: '#FFFBEB',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#FDE68A',
            flexDirection: 'row',
            gap: 10,
          }}>
            <Feather name="info" size={16} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 12, color: '#92400E', flex: 1 }}>
              Lista dokumentow i kroków formalnych. Nie wszystkie elementy dotycza kazdej budowy — zweryfikuj z urzedem i projektantem.
            </Txt>
          </View>

          <View style={{
            backgroundColor: HB_ACCENT_BG,
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#BFDBFE',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Txt w="semibold" style={{ fontSize: 14, color: HB_ACCENT }}>Postep</Txt>
              <Txt w="semibold" style={{ fontSize: 14, color: HB_ACCENT }}>{doneItems}/{totalItems}</Txt>
            </View>
            <View style={{ height: 6, backgroundColor: '#BFDBFE', borderRadius: 3 }}>
              <View style={{ height: 6, backgroundColor: HB_ACCENT, borderRadius: 3, width: `${progress}%` }} />
            </View>
          </View>

          {OFFICIAL_CHECKLIST_GROUPS.map(group => {
            const expanded = expandedGroups.has(group.id);
            const groupDone = group.items.filter(i => completedItems.has(i.id)).length;
            return (
              <View key={group.id} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                  onPress={() => toggleGroup(group.id)}
                  activeOpacity={0.85}
                >
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: groupDone === group.items.length && group.items.length > 0 ? '#DCFCE7' : HB_ACCENT_BG,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Feather
                      name={groupDone === group.items.length && group.items.length > 0 ? 'check-circle' : 'file-text'}
                      size={16}
                      color={groupDone === group.items.length && group.items.length > 0 ? '#16A34A' : HB_ACCENT}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{group.title}</Txt>
                    <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{groupDone}/{group.items.length} wykonane</Txt>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4, marginRight: 4 }}>
                    {group.pathIds.map(pid => (
                      <View key={pid} style={{ backgroundColor: '#E0E7FF', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Txt style={{ fontSize: 9, color: '#4338CA' }}>{PATH_LABELS[pid]}</Txt>
                      </View>
                    ))}
                  </View>
                  <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>

                {expanded && (
                  <View style={{ paddingLeft: 12, paddingTop: 8 }}>
                    {group.description && (
                      <Txt style={{ fontSize: 12, color: Colors.textMuted, marginBottom: 10 }}>{group.description}</Txt>
                    )}
                    {group.items.map(item => {
                      const done = completedItems.has(item.id);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={{
                            flexDirection: 'row',
                            gap: 10,
                            paddingVertical: 10,
                            paddingHorizontal: 8,
                            borderBottomWidth: 1,
                            borderBottomColor: Colors.border,
                            alignItems: 'flex-start',
                          }}
                          onPress={() => toggleItem(item.id)}
                          activeOpacity={0.85}
                        >
                          <Feather
                            name={done ? 'check-square' : 'square'}
                            size={18}
                            color={done ? '#16A34A' : Colors.textMuted}
                            style={{ marginTop: 1 }}
                          />
                          <View style={{ flex: 1 }}>
                            <Txt style={{ fontSize: 13, color: done ? Colors.textMuted : Colors.text, textDecorationLine: done ? 'line-through' : 'none' }}>
                              {item.title}
                            </Txt>
                            {item.description && (
                              <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{item.description}</Txt>
                            )}
                            {!item.isRequired && (
                              <Txt style={{ fontSize: 10, color: '#8B5CF6', marginTop: 2 }}>opcjonalne</Txt>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                    {group.source && (
                      <View style={{ paddingVertical: 6, paddingHorizontal: 8 }}>
                        <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Zrodlo: {group.source.sourceLabel}</Txt>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}
