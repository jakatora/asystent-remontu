import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { getJobById } from '@/data/jobs';
import { ShoppingItem } from '@/types/renovation';
import { formatCurrency } from '@/utils/calculator';
import { WarningBanner } from '@/components/ui/WarningBanner';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';

type Tab = 'overview' | 'materials' | 'guide' | 'shopping';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { projects, updateProject, removeProject, getProjectShoppingItems, generateAndAddShoppingItems, toggleItem } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);

  const project = projects.find((p) => p.id === id);
  const job = project ? getJobById(project.jobId) : null;

  const loadShopping = useCallback(async () => {
    if (!id) return;
    const items = await getProjectShoppingItems(id);
    setShoppingItems(items);
  }, [id, getProjectShoppingItems]);

  useFocusEffect(useCallback(() => { loadShopping(); }, [loadShopping]));

  const handleGenerateShoppingList = async () => {
    if (!project?.calculationResult) return;
    await generateAndAddShoppingItems(project.id, project.calculationResult);
    await loadShopping();
    setTab('shopping');
  };

  const handleStatusChange = async (status: 'planning' | 'in-progress' | 'completed') => {
    if (!project) return;
    await updateProject({ ...project, status });
  };

  const handleDelete = () => {
    Alert.alert('Usuń projekt', `Usunąć projekt "${project?.name}"? Tej operacji nie można cofnąć.`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usuń', style: 'destructive', onPress: async () => { await removeProject(id!); router.back(); } },
    ]);
  };

  if (!project || !job) {
    return (
      <View className="flex-1 items-center justify-center bg-bg gap-4">
        <Txt w="medium" className="text-base text-slate">Projekt nie znaleziony</Txt>
        <Button label="Wróć" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const calc = project.calculationResult;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;
  const purchasedCount = shoppingItems.filter((i) => i.purchased).length;

  const tabLabels: Record<Tab, string> = { overview: 'Przegląd', materials: 'Materiały', guide: 'Instrukcja', shopping: 'Zakupy' };

  const statusColors = {
    planning:     { active: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
    'in-progress': { active: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
    completed:    { active: '#22C55E', bg: '#F0FDF4', border: '#BBF7D0' },
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: project.name,
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerTintColor: '#0F172A',
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={{ marginRight: 4 }}>
              <Feather name="trash-2" size={20} color="#EF4444" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tab bar */}
      <View className="flex-row bg-surface border-b border-stroke">
        {(['overview', 'materials', 'guide', 'shopping'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-3 items-center ${tab === t ? 'border-b-2 border-primary' : ''}`}
          >
            <Txt w={tab === t ? 'bold' : 'medium'} className={`text-xs ${tab === t ? 'text-primary' : 'text-muted'}`}>
              {tabLabels[t]}
            </Txt>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1 bg-bg"
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── OVERVIEW TAB ─── */}
        {tab === 'overview' && (
          <View className="gap-4">
            <View>
              <Txt w="bold" className="text-[22px] text-ink">{project.name}</Txt>
              <Txt className="text-sm text-slate mt-1">{job.name}</Txt>
            </View>

            {/* Status buttons */}
            <View className="flex-row gap-2">
              {(['planning', 'in-progress', 'completed'] as const).map((s) => {
                const labels = { planning: 'Planowanie', 'in-progress': 'W trakcie', completed: 'Ukończony' };
                const cfg = statusColors[s];
                const isActive = project.status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => handleStatusChange(s)}
                    className="flex-1 py-2.5 rounded-xl items-center"
                    style={{
                      borderWidth: 1.5,
                      borderColor: isActive ? cfg.active : '#E2E8F0',
                      backgroundColor: isActive ? cfg.bg : '#fff',
                    }}
                  >
                    <Txt w="semibold" className="text-xs" style={{ color: isActive ? cfg.active : '#64748B' }}>
                      {labels[s]}
                    </Txt>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cost card */}
            {calc && (
              <View className="bg-surface rounded-2xl border border-stroke p-4">
                <View className="flex-row justify-between items-center py-2">
                  <Txt className="text-sm text-slate">Szacowany koszt materiałów</Txt>
                  <Txt w="bold" className="text-base text-ink">{formatCurrency(calc.totalCost)}</Txt>
                </View>
                <View className="h-px bg-stroke-light" />
                <View className="flex-row justify-between items-center py-2">
                  <Txt className="text-sm text-slate">Czas realizacji</Txt>
                  <Txt w="bold" className="text-base text-ink">{calc.totalDays} {calc.totalDays === 1 ? 'dzień' : 'dni'}</Txt>
                </View>
                {shoppingItems.length > 0 && (
                  <>
                    <View className="h-px bg-stroke-light" />
                    <View className="flex-row justify-between items-center py-2">
                      <Txt className="text-sm text-slate">Zakupy</Txt>
                      <Txt w="bold" className="text-base text-ink">{purchasedCount}/{shoppingItems.length} kupionych</Txt>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Warnings */}
            {calc?.warnings && calc.warnings.length > 0 && <WarningBanner warnings={calc.warnings} />}

            {/* Hire pro */}
            {job.hireProfessionalRecommended && (
              <TouchableOpacity
                className="flex-row items-center gap-2.5 bg-danger-bg rounded-xl p-3 border border-red-200"
                onPress={() => router.push({ pathname: '/hire-pro', params: { jobId: job.id } })}
                activeOpacity={0.8}
              >
                <Feather name="phone" size={18} color="#EF4444" />
                <Txt w="medium" className="flex-1 text-sm text-danger">Rozważ zatrudnienie fachowca</Txt>
                <Feather name="chevron-right" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}

            <Button label="Otwórz pełny opis pracy" variant="outline" onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })} fullWidth />
          </View>
        )}

        {/* ─── MATERIALS TAB ─── */}
        {tab === 'materials' && calc && (
          <View className="gap-4">
            <Txt w="bold" className="text-lg text-ink">Lista materiałów</Txt>
            {calc.materials.map((m, i) => (
              <View key={i} className="flex-row items-center bg-surface rounded-xl p-3 border border-stroke gap-2.5">
                <View className="flex-1">
                  <Txt w="medium" className="text-sm text-ink">{m.material.name}</Txt>
                  {m.material.notes && <Txt className="text-[11px] text-muted mt-0.5">{m.material.notes}</Txt>}
                </View>
                <View className="items-center" style={{ minWidth: 50 }}>
                  <Txt w="bold" className="text-base text-ink">{m.quantity.toFixed(m.quantity < 10 ? 1 : 0)}</Txt>
                  <Txt className="text-[11px] text-muted">{m.material.unit}</Txt>
                </View>
                <Txt w="semibold" className="text-sm text-primary text-right" style={{ minWidth: 70 }}>{formatCurrency(m.cost)}</Txt>
              </View>
            ))}
            {/* Total */}
            <View className="flex-row justify-between items-center bg-primary-bg rounded-xl p-3.5 border border-primary-light">
              <Txt w="semibold" className="text-[15px] text-primary-dark">Łączny koszt</Txt>
              <Txt w="bold" className="text-xl text-primary">{formatCurrency(calc.totalCost)}</Txt>
            </View>
            <Button
              label={shoppingItems.length > 0 ? 'Odśwież listę zakupów' : 'Generuj listę zakupów'}
              onPress={handleGenerateShoppingList}
              fullWidth
            />
          </View>
        )}

        {/* ─── GUIDE TAB ─── */}
        {tab === 'guide' && (
          <View className="gap-3">
            <Txt w="bold" className="text-lg text-ink mb-1">Instrukcja krok po kroku</Txt>
            {job.instructions.map((step) => {
              const dur = step.durationMin >= 60
                ? `${Math.round(step.durationMin / 60)}h`
                : `${step.durationMin}min`;
              return (
                <View key={step.step} className="flex-row gap-3.5 bg-surface rounded-2xl p-3.5 border border-stroke">
                  <View className="w-8 h-8 rounded-full bg-primary items-center justify-center shrink-0">
                    <Txt w="bold" className="text-sm text-white">{step.step}</Txt>
                  </View>
                  <View className="flex-1 gap-1.5">
                    <View className="flex-row justify-between items-center gap-2">
                      <Txt w="bold" className="flex-1 text-[15px] text-ink">{step.title}</Txt>
                      <View className="flex-row items-center gap-1 bg-surface-alt px-2 py-1 rounded-lg">
                        <Feather name="clock" size={11} color="#94A3B8" />
                        <Txt w="medium" className="text-[11px] text-muted">~{dur}</Txt>
                      </View>
                    </View>
                    <Txt className="text-sm text-slate leading-5">{step.description}</Txt>
                    {step.tip && (
                      <View className="flex-row gap-2 bg-warning-bg rounded-lg p-2.5 items-start">
                        <Feather name="lightbulb" size={13} color="#F59E0B" style={{ marginTop: 1 }} />
                        <Txt className="flex-1 text-[13px] leading-[18px]" style={{ color: '#92400e' }}>{step.tip}</Txt>
                      </View>
                    )}
                    {step.warning && (
                      <View className="flex-row gap-2 bg-danger-bg rounded-lg p-2.5 items-start">
                        <Feather name="alert-triangle" size={13} color="#EF4444" style={{ marginTop: 1 }} />
                        <Txt className="flex-1 text-[13px] leading-[18px]" style={{ color: '#991b1b' }}>{step.warning}</Txt>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ─── SHOPPING TAB ─── */}
        {tab === 'shopping' && (
          <View className="gap-3">
            <Txt w="bold" className="text-lg text-ink mb-1">Lista zakupów</Txt>
            {shoppingItems.length === 0 ? (
              <View className="items-center gap-3 py-8">
                <Feather name="shopping-cart" size={32} color="#94A3B8" />
                <Txt w="semibold" className="text-[17px] text-slate">Brak listy zakupów</Txt>
                <Txt className="text-sm text-muted text-center" style={{ maxWidth: 260 }}>
                  Przejdź do zakładki "Materiały" i wygeneruj listę zakupów
                </Txt>
                <Button label="Przejdź do materiałów" onPress={() => setTab('materials')} variant="outline" />
              </View>
            ) : (
              <>
                {/* Progress */}
                <View className="gap-2">
                  <Txt w="medium" className="text-[13px] text-slate">{purchasedCount} z {shoppingItems.length} kupionych</Txt>
                  <View className="h-2 rounded-full bg-stroke-light overflow-hidden">
                    <View
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(purchasedCount / shoppingItems.length) * 100}%` }}
                    />
                  </View>
                </View>

                {shoppingItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className={`flex-row items-center gap-3 bg-surface rounded-xl p-3.5 border border-stroke ${item.purchased ? 'opacity-60' : ''}`}
                    onPress={async () => { await toggleItem(item.id, !item.purchased); loadShopping(); }}
                    activeOpacity={0.7}
                  >
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${item.purchased ? 'bg-success border-success' : 'border-stroke'}`}
                    >
                      {item.purchased && <Feather name="check" size={14} color="#fff" />}
                    </View>
                    <View className="flex-1">
                      <Txt w="medium" className={`text-sm ${item.purchased ? 'line-through text-muted' : 'text-ink'}`}>{item.name}</Txt>
                      <Txt className="text-xs text-muted mt-0.5">{item.quantity.toFixed(1)} {item.unit}</Txt>
                    </View>
                    <Txt w="semibold" className={`text-sm ${item.purchased ? 'text-muted' : 'text-primary'}`}>~{formatCurrency(item.estimatedPrice)}</Txt>
                  </TouchableOpacity>
                ))}

                {/* Total */}
                <View className="flex-row justify-between items-center pt-3 border-t border-stroke">
                  <Txt w="semibold" className="text-[15px] text-ink">Suma</Txt>
                  <Txt w="bold" className="text-lg text-primary">{formatCurrency(shoppingItems.reduce((s, i) => s + i.estimatedPrice, 0))}</Txt>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}
