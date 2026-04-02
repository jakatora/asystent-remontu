import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useHouseBuild } from '@/context/HouseBuildContext';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type { UtilityRequirement, UtilityType } from '@/types/house-build';

const UTILITY_LABELS: Record<UtilityType, { name: string; icon: string; color: string }> = {
  electricity: { name: 'Prad', icon: 'zap', color: '#F59E0B' },
  water: { name: 'Woda', icon: 'droplet', color: '#3B82F6' },
  sewage: { name: 'Kanalizacja', icon: 'git-merge', color: '#6B7280' },
  gas: { name: 'Gaz', icon: 'thermometer', color: '#EF4444' },
  telecom: { name: 'Internet / telekomunikacja', icon: 'wifi', color: '#8B5CF6' },
  heating: { name: 'Ogrzewanie', icon: 'sun', color: '#F97316' },
};

const STATUS_LABELS: Record<string, string> = {
  'not-started': 'Nie rozpoczeto',
  applied: 'Zlozono wniosek',
  'in-progress': 'W realizacji',
  connected: 'Podlaczone',
};

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  'not-started': { bg: Colors.surfaceAlt, fg: Colors.textMuted },
  applied: { bg: Colors.warningBg, fg: Colors.warning },
  'in-progress': { bg: Colors.infoBg, fg: Colors.info },
  connected: { bg: Colors.successBg, fg: Colors.success },
};

const ALL_UTILITY_TYPES: UtilityType[] = ['electricity', 'water', 'sewage', 'gas', 'telecom', 'heating'];

export default function UtilitiesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const { getUtilities, addUtility, updateUtility } = useHouseBuild();
  const [utilities, setUtilities] = useState<UtilityRequirement[]>([]);

  const load = useCallback(async () => {
    const u = await getUtilities(projectId);
    setUtilities(u);
  }, [projectId, getUtilities]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAdd = async (type: UtilityType) => {
    await addUtility(projectId, type);
    await load();
  };

  const handleCycleStatus = async (id: string, current: string) => {
    const order = ['not-started', 'applied', 'in-progress', 'connected'];
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    await updateUtility(id, { status: next as any });
    await load();
  };

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;
  const existingTypes = new Set(utilities.map((u) => u.utilityType));
  const missingTypes = ALL_UTILITY_TYPES.filter((t) => !existingTypes.has(t));

  return (
    <>
      <Stack.Screen options={{ title: 'Przylacza i media' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: '#FFF7ED',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#FED7AA',
          }}>
            <Txt w="bold" style={{ fontSize: 16, color: '#C2410C' }}>Przylacza i media</Txt>
            <Txt style={{ fontSize: 13, color: '#EA580C', marginTop: 4 }}>
              Sledzenie statusu podlaczen do sieci. Stuknij przylacze, aby zmienic status.
            </Txt>
          </View>

          {utilities.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginBottom: 10 }}>Twoje przylacza</Txt>
              {utilities.map((u) => {
                const info = UTILITY_LABELS[u.utilityType];
                const sc = STATUS_COLORS[u.status] ?? STATUS_COLORS['not-started'];
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={{
                      backgroundColor: Colors.surface,
                      borderRadius: 14,
                      padding: 14,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      borderWidth: 1,
                      borderColor: Colors.border,
                    }}
                    onPress={() => handleCycleStatus(u.id, u.status)}
                    activeOpacity={0.8}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: sc.bg, alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={info.icon as any} size={18} color={info.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{info.name}</Txt>
                    </View>
                    <View style={{ backgroundColor: sc.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Txt style={{ fontSize: 10, color: sc.fg }}>{STATUS_LABELS[u.status]}</Txt>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {missingTypes.length > 0 && (
            <View>
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginBottom: 10 }}>Dodaj przylacze</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {missingTypes.map((type) => {
                  const info = UTILITY_LABELS[type];
                  return (
                    <TouchableOpacity
                      key={type}
                      style={{
                        backgroundColor: Colors.surface,
                        borderRadius: 12,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        borderWidth: 1,
                        borderColor: Colors.border,
                        borderStyle: 'dashed',
                      }}
                      onPress={() => handleAdd(type)}
                      activeOpacity={0.8}
                    >
                      <Feather name="plus-circle" size={16} color={info.color} />
                      <Txt style={{ fontSize: 13, color: Colors.text }}>{info.name}</Txt>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
