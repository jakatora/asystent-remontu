import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { getJobById } from '@/data/jobs';
import { Txt } from '@/components/ui/Txt';

export default function ProjectToolsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { projects } = useApp();
  const [checkedTools, setCheckedTools] = useState<Set<string>>(new Set());

  const project = projects.find((p) => p.id === id);
  const job = project ? getJobById(project.jobId) : null;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  if (!project || !job) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <Txt w="medium" className="text-base text-slate">Projekt nie znaleziony</Txt>
      </View>
    );
  }

  const tools = job.tools ?? [];
  const required = tools.filter((t) => t.required);
  const optional = tools.filter((t) => !t.required);
  const checkedCount = checkedTools.size;

  const toggleTool = (toolId: string) => {
    setCheckedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Narzędzia',
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerTintColor: '#0F172A',
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        className="flex-1 bg-bg"
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        {tools.length > 0 && (
          <View className="bg-surface rounded-2xl border border-stroke p-4 mb-5">
            <View className="flex-row justify-between items-center mb-2">
              <Txt w="semibold" className="text-sm text-ink">Mam już przygotowane</Txt>
              <Txt w="bold" className="text-sm text-primary">{checkedCount}/{tools.length}</Txt>
            </View>
            <View className="h-2 bg-stroke-light rounded-full overflow-hidden">
              <View
                className="h-2 rounded-full bg-primary"
                style={{ width: tools.length > 0 ? `${(checkedCount / tools.length) * 100}%` : '0%' }}
              />
            </View>
            {checkedCount === tools.length && tools.length > 0 && (
              <View className="flex-row items-center gap-2 mt-2">
                <Feather name="check-circle" size={14} color="#22C55E" />
                <Txt w="medium" className="text-xs text-success">Wszystkie narzędzia przygotowane!</Txt>
              </View>
            )}
          </View>
        )}

        {/* Required */}
        {required.length > 0 && (
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-2 h-2 rounded-full bg-danger" />
              <Txt w="bold" className="text-base text-ink">Wymagane</Txt>
              <View className="px-2 py-0.5 rounded-full bg-danger-bg">
                <Txt w="semibold" className="text-xs text-danger">{required.length}</Txt>
              </View>
            </View>
            {required.map((tool) => {
              const checked = checkedTools.has(tool.id);
              return (
                <TouchableOpacity
                  key={tool.id}
                  onPress={() => toggleTool(tool.id)}
                  className={`flex-row items-center gap-3 bg-surface rounded-xl p-3.5 border border-stroke mb-2.5 ${checked ? 'opacity-70' : ''}`}
                  activeOpacity={0.7}
                >
                  <View className={`w-9 h-9 rounded-[10px] items-center justify-center ${checked ? 'bg-success' : 'bg-surface-alt'}`}>
                    <Feather name={tool.icon as any} size={18} color={checked ? '#fff' : '#0F172A'} />
                  </View>
                  <View className="flex-1">
                    <Txt w="medium" className={`text-sm ${checked ? 'line-through text-muted' : 'text-ink'}`}>{tool.name}</Txt>
                    {tool.notes && <Txt className="text-xs text-muted mt-0.5">{tool.notes}</Txt>}
                  </View>
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${checked ? 'bg-success border-success' : 'border-stroke'}`}>
                    {checked && <Feather name="check" size={12} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Optional */}
        {optional.length > 0 && (
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-2 h-2 rounded-full bg-slate" />
              <Txt w="bold" className="text-base text-ink">Opcjonalne</Txt>
              <View className="px-2 py-0.5 rounded-full bg-surface-alt">
                <Txt w="semibold" className="text-xs text-slate">{optional.length}</Txt>
              </View>
            </View>
            {optional.map((tool) => {
              const checked = checkedTools.has(tool.id);
              return (
                <TouchableOpacity
                  key={tool.id}
                  onPress={() => toggleTool(tool.id)}
                  className={`flex-row items-center gap-3 bg-surface rounded-xl p-3.5 border border-stroke mb-2.5 ${checked ? 'opacity-70' : ''}`}
                  activeOpacity={0.7}
                >
                  <View className={`w-9 h-9 rounded-[10px] items-center justify-center opacity-70 ${checked ? 'bg-success' : 'bg-surface-alt'}`}>
                    <Feather name={tool.icon as any} size={18} color={checked ? '#fff' : '#0F172A'} />
                  </View>
                  <View className="flex-1">
                    <Txt w="medium" className={`text-sm ${checked ? 'line-through text-muted' : 'text-ink'}`}>{tool.name}</Txt>
                    {tool.notes && <Txt className="text-xs text-muted mt-0.5">{tool.notes}</Txt>}
                    {tool.rentable && (
                      <View className="self-start mt-1 px-2 py-0.5 rounded-lg bg-info-bg">
                        <Txt w="medium" className="text-[10px] text-info">dostępny wynajem</Txt>
                      </View>
                    )}
                  </View>
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${checked ? 'bg-success border-success' : 'border-stroke'}`}>
                    {checked && <Feather name="check" size={12} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* No tools */}
        {tools.length === 0 && (
          <View className="items-center py-8 gap-3">
            <View className="w-20 h-20 rounded-full bg-surface-alt items-center justify-center">
              <Feather name="tool" size={36} color="#94A3B8" />
            </View>
            <Txt w="bold" className="text-lg text-ink">Brak listy narzędzi</Txt>
            <Txt className="text-sm text-slate text-center" style={{ maxWidth: 260 }}>
              Dla tej pracy nie zdefiniowano listy wymaganych narzędzi.
            </Txt>
          </View>
        )}

        {/* Tip */}
        {tools.length > 0 && (
          <View className="flex-row gap-2 items-start">
            <Feather name="info" size={14} color="#94A3B8" style={{ marginTop: 1 }} />
            <Txt className="flex-1 text-xs text-muted leading-4">
              Zaznacz narzędzia które już posiadasz. Narzędzia z opcją "wynajem" możesz wypożyczyć w wypożyczalniach sprzętu budowlanego.
            </Txt>
          </View>
        )}
      </ScrollView>
    </>
  );
}
