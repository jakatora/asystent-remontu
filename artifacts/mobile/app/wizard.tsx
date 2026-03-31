import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '@/data/categories';
import { getJobsByCategory, getJobById } from '@/data/jobs';
import { RenovationJob, RenovationCategory } from '@/types/renovation';
import { calculateMaterials } from '@/utils/calculator';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';

type Step = 'name' | 'category' | 'job' | 'measure';

export default function WizardScreen() {
  const { jobId: initialJobId } = useLocalSearchParams<{ jobId?: string }>();
  const insets = useSafeAreaInsets();
  const { createProject } = useApp();

  const [step, setStep] = useState<Step>('name');
  const [projectName, setProjectName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RenovationCategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<RenovationJob | null>(
    initialJobId ? getJobById(initialJobId) || null : null
  );
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const availableJobs = selectedCategory ? getJobsByCategory(selectedCategory.id) : [];

  const stepOrder: Step[] = ['name', 'category', 'job', 'measure'];
  const stepIdx = stepOrder.indexOf(step);

  const handleNext = () => {
    const idx = stepOrder.indexOf(step);
    if (idx < stepOrder.length - 1) setStep(stepOrder[idx + 1]);
  };

  const handleBack = () => {
    const idx = stepOrder.indexOf(step);
    if (idx > 0) setStep(stepOrder[idx - 1]);
    else router.back();
  };

  const handleSave = async () => {
    if (!selectedJob) return;
    setSaving(true);
    try {
      const meas: Record<string, number> = {};
      for (const input of selectedJob.measurementInputs) {
        const val = parseFloat(measurements[input.id] || '0');
        meas[input.id] = isNaN(val) ? 0 : val;
      }
      const calcResult = calculateMaterials(selectedJob, meas);
      const id = await createProject({
        name: projectName.trim() || selectedJob.name,
        jobId: selectedJob.id,
        jobName: selectedJob.name,
        categoryId: selectedJob.categoryId,
        measurements: meas,
        calculationResult: calcResult,
        status: 'planning',
      });
      router.replace({ pathname: '/project/[id]', params: { id } });
    } catch {
      Alert.alert('Błąd', 'Nie udało się zapisać projektu. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  };

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  const stepLabels: Record<Step, string> = {
    name: 'Nazwa projektu',
    category: 'Kategoria',
    job: 'Rodzaj pracy',
    measure: 'Wymiary',
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nowy projekt',
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerTintColor: '#0F172A',
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Progress bar */}
        <View className="flex-row gap-2 px-5 py-3">
          {stepOrder.map((s, i) => (
            <View
              key={s}
              className={`flex-1 h-1 rounded-full ${i < stepIdx ? 'bg-primary' : i === stepIdx ? 'bg-primary-light' : 'bg-stroke'}`}
            />
          ))}
        </View>
        <Txt w="semibold" className="text-xs text-primary px-5 mb-2 uppercase tracking-wide">
          {stepLabels[step]}
        </Txt>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step: Name */}
          {step === 'name' && (
            <View className="p-5 gap-4">
              <Txt w="bold" className="text-[22px] text-ink" style={{ lineHeight: 30 }}>Jak chcesz nazwać ten projekt?</Txt>
              <Txt className="text-sm text-slate -mt-2">Np. "Salon 2024", "Łazienka na górze"</Txt>
              <TextInput
                className="bg-surface rounded-2xl px-[18px] py-4 text-lg text-ink"
                placeholder="Wpisz nazwę projektu..."
                placeholderTextColor="#94A3B8"
                value={projectName}
                onChangeText={setProjectName}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleNext}
                style={{
                  fontFamily: 'Inter_500Medium',
                  borderWidth: 1.5,
                  borderColor: '#F97316',
                }}
              />
              <Button label="Dalej" onPress={handleNext} size="lg" fullWidth disabled={projectName.trim().length === 0} />
            </View>
          )}

          {/* Step: Category */}
          {step === 'category' && (
            <View className="p-5 gap-4">
              <Txt w="bold" className="text-[22px] text-ink" style={{ lineHeight: 30 }}>Jaki rodzaj pracy chcesz zrobić?</Txt>
              <Txt className="text-sm text-slate -mt-2">Wybierz kategorię pasującą do Twojego remontu</Txt>
              <View className="flex-row flex-wrap gap-3 mb-2">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => { setSelectedCategory(cat); setSelectedJob(null); }}
                    activeOpacity={0.8}
                    className={`rounded-2xl p-3.5 items-start ${selectedCategory?.id === cat.id ? 'bg-primary-bg' : 'bg-surface'}`}
                    style={{
                      width: '47%',
                      borderWidth: 1.5,
                      borderColor: selectedCategory?.id === cat.id ? '#F97316' : '#E2E8F0',
                    }}
                  >
                    <View className="w-11 h-11 rounded-xl items-center justify-center mb-2.5" style={{ backgroundColor: cat.color + '20' }}>
                      <Feather name={cat.icon as any} size={22} color={cat.color} />
                    </View>
                    <Txt w="semibold" className="text-[13px] text-ink" numberOfLines={2}>{cat.name}</Txt>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedCategory && <Button label="Dalej" onPress={handleNext} size="lg" fullWidth />}
            </View>
          )}

          {/* Step: Job */}
          {step === 'job' && (
            <View className="p-5 gap-3">
              <Txt w="bold" className="text-[22px] text-ink" style={{ lineHeight: 30 }}>Wybierz konkretną pracę</Txt>
              {availableJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <TouchableOpacity
                    key={job.id}
                    onPress={() => setSelectedJob(job)}
                    activeOpacity={0.8}
                    className={`flex-row items-center gap-3.5 rounded-2xl p-3.5 ${isSelected ? 'bg-primary-bg' : 'bg-surface'}`}
                    style={{ borderWidth: 1.5, borderColor: isSelected ? '#F97316' : '#E2E8F0' }}
                  >
                    <Feather name={job.coverIcon as any} size={22} color={isSelected ? '#F97316' : '#64748B'} />
                    <View className="flex-1">
                      <Txt w="semibold" className={`text-[15px] ${isSelected ? 'text-primary' : 'text-ink'}`}>{job.name}</Txt>
                      <Txt className="text-xs text-muted mt-0.5" numberOfLines={1}>{job.description}</Txt>
                    </View>
                    {isSelected && <Feather name="check-circle" size={20} color="#F97316" />}
                  </TouchableOpacity>
                );
              })}
              {selectedJob && (
                <View className="mt-2">
                  <Button label="Dalej" onPress={handleNext} size="lg" fullWidth />
                </View>
              )}
            </View>
          )}

          {/* Step: Measure */}
          {step === 'measure' && selectedJob && (
            <View className="p-5 gap-4">
              <Txt w="bold" className="text-[22px] text-ink" style={{ lineHeight: 30 }}>Podaj wymiary</Txt>
              <Txt className="text-sm text-slate -mt-2">Na ich podstawie obliczymy ile materiałów potrzebujesz</Txt>

              {selectedJob.measurementInputs.map((input) => (
                <View key={input.id} className="gap-1.5">
                  <Txt w="semibold" className="text-[15px] text-ink">{input.label}</Txt>
                  {input.hint && <Txt className="text-xs text-slate">{input.hint}</Txt>}
                  <View className="flex-row gap-2.5">
                    <TextInput
                      className="flex-1 bg-surface rounded-xl px-4 py-3.5 text-lg text-ink"
                      placeholder={input.placeholder}
                      placeholderTextColor="#94A3B8"
                      keyboardType="decimal-pad"
                      value={measurements[input.id] || ''}
                      onChangeText={(v) => setMeasurements((m) => ({ ...m, [input.id]: v }))}
                      style={{ fontFamily: 'Inter_600SemiBold', borderWidth: 1.5, borderColor: '#E2E8F0' }}
                    />
                    <View className="bg-surface-alt rounded-xl px-4 justify-center border border-stroke">
                      <Txt w="semibold" className="text-sm text-slate">{input.unit}</Txt>
                    </View>
                  </View>
                </View>
              ))}

              {selectedJob.measurementInputs.length === 0 && (
                <View className="flex-row gap-2.5 items-center bg-info-bg rounded-xl p-3.5">
                  <Feather name="info" size={20} color="#3B82F6" />
                  <Txt w="medium" className="flex-1 text-sm text-info">Ta praca nie wymaga podawania wymiarów</Txt>
                </View>
              )}

              <Button label="Oblicz i zapisz projekt" onPress={handleSave} size="lg" fullWidth loading={saving} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
