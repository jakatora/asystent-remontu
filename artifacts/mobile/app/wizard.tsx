import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { CATEGORIES } from '@/data/categories';
import { getJobsByCategory, getJobById } from '@/data/jobs';
import { RenovationJob, RenovationCategory } from '@/types/renovation';
import { calculateMaterials } from '@/utils/calculator';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';

type Step = 'name' | 'category' | 'job' | 'measure' | 'done';

export default function WizardScreen() {
  const { jobId: initialJobId } = useLocalSearchParams<{ jobId?: string }>();
  const insets = useSafeAreaInsets();
  const { createProject } = useApp();

  const [step, setStep] = useState<Step>(initialJobId ? 'name' : 'name');
  const [projectName, setProjectName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RenovationCategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<RenovationJob | null>(initialJobId ? getJobById(initialJobId) || null : null);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const availableJobs = selectedCategory ? getJobsByCategory(selectedCategory.id) : [];

  const handleNext = () => {
    const order: Step[] = ['name', 'category', 'job', 'measure', 'done'];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) {
      setStep(order[idx + 1]);
    }
  };

  const handleBack = () => {
    const order: Step[] = ['name', 'category', 'job', 'measure', 'done'];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
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
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się zapisać projektu. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  };

  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  const stepLabels: Record<Step, string> = {
    name: 'Nazwa projektu',
    category: 'Kategoria',
    job: 'Rodzaj pracy',
    measure: 'Wymiary',
    done: 'Gotowe',
  };

  const stepOrder: Step[] = ['name', 'category', 'job', 'measure', 'done'];
  const stepIdx = stepOrder.indexOf(step);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nowy projekt',
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Progress */}
        <View style={styles.progressRow}>
          {stepOrder.slice(0, 4).map((s, i) => (
            <View
              key={s}
              style={[styles.progressDot, i <= stepIdx && styles.progressDotActive, i < stepIdx && styles.progressDotDone]}
            />
          ))}
        </View>
        <Text style={styles.stepLabel}>{stepLabels[step]}</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step: Name */}
          {step === 'name' && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Jak chcesz nazwać ten projekt?</Text>
              <Text style={styles.stepHint}>Np. "Salon 2024", "Łazienka na górze"</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="Wpisz nazwę projektu..."
                placeholderTextColor={Colors.textMuted}
                value={projectName}
                onChangeText={setProjectName}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleNext}
              />
              <Button
                label="Dalej"
                onPress={handleNext}
                size="lg"
                fullWidth
                disabled={projectName.trim().length === 0}
              />
            </View>
          )}

          {/* Step: Category */}
          {step === 'category' && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Jaki rodzaj pracy chcesz zrobić?</Text>
              <Text style={styles.stepHint}>Wybierz kategorię pasującą do Twojego remontu</Text>
              <View style={styles.optionsGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.optionCard, selectedCategory?.id === cat.id && styles.optionCardSelected]}
                    onPress={() => { setSelectedCategory(cat); setSelectedJob(null); }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: cat.color + '20' }]}>
                      <Feather name={cat.icon as any} size={22} color={cat.color} />
                    </View>
                    <Text style={styles.optionName} numberOfLines={2}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedCategory && (
                <Button label="Dalej" onPress={handleNext} size="lg" fullWidth />
              )}
            </View>
          )}

          {/* Step: Job */}
          {step === 'job' && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Wybierz konkretną pracę</Text>
              {availableJobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={[styles.jobOption, selectedJob?.id === job.id && styles.jobOptionSelected]}
                  onPress={() => setSelectedJob(job)}
                  activeOpacity={0.8}
                >
                  <Feather name={job.coverIcon as any} size={22} color={selectedJob?.id === job.id ? Colors.primary : Colors.textSecondary} />
                  <View style={styles.jobOptionText}>
                    <Text style={[styles.jobOptionName, selectedJob?.id === job.id && { color: Colors.primary }]}>
                      {job.name}
                    </Text>
                    <Text style={styles.jobOptionDesc} numberOfLines={1}>{job.description}</Text>
                  </View>
                  {selectedJob?.id === job.id && (
                    <Feather name="check-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
              {selectedJob && (
                <Button label="Dalej" onPress={handleNext} size="lg" fullWidth />
              )}
            </View>
          )}

          {/* Step: Measure */}
          {step === 'measure' && selectedJob && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Podaj wymiary</Text>
              <Text style={styles.stepHint}>Na ich podstawie obliczymy ile materiałów potrzebujesz</Text>
              {selectedJob.measurementInputs.map((input) => (
                <View key={input.id} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{input.label}</Text>
                  {input.hint && <Text style={styles.inputHint}>{input.hint}</Text>}
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.measureInput}
                      placeholder={input.placeholder}
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="decimal-pad"
                      value={measurements[input.id] || ''}
                      onChangeText={(v) => setMeasurements((m) => ({ ...m, [input.id]: v }))}
                    />
                    <View style={styles.unitBadge}>
                      <Text style={styles.unitText}>{input.unit}</Text>
                    </View>
                  </View>
                </View>
              ))}
              {selectedJob.measurementInputs.length === 0 && (
                <View style={styles.noMeasure}>
                  <Feather name="info" size={20} color={Colors.info} />
                  <Text style={styles.noMeasureText}>Ta praca nie wymaga podawania wymiarów</Text>
                </View>
              )}
              <Button
                label="Oblicz i zapisz projekt"
                onPress={handleSave}
                size="lg"
                fullWidth
                loading={saving}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  progressDotActive: { backgroundColor: Colors.primaryLight },
  progressDotDone: { backgroundColor: Colors.primary },
  stepLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    paddingHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  stepContent: { padding: 20, gap: 16 },
  stepTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.text, lineHeight: 30 },
  stepHint: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: -8 },
  nameInput: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
    marginBottom: 8,
  },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  optionCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  optionCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  optionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  optionName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  jobOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  jobOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  jobOptionText: { flex: 1 },
  jobOptionName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  jobOptionDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textMuted, marginTop: 2 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  inputHint: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  inputRow: { flexDirection: 'row', gap: 10 },
  measureInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  unitBadge: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  noMeasure: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: Colors.infoBg,
    borderRadius: 12,
    padding: 14,
  },
  noMeasureText: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.info },
});
