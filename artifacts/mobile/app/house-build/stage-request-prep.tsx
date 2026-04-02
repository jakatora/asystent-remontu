import { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { getStageByKey } from '@/features/house-build/stages';
import { getRequestPresetForStage } from '@/features/house-build/contractor-mapping';
import { contractorRequestsRepo } from '@/db/repositories/contractor-requests.repo';
import { houseBuildContractorsRepo } from '@/db/repositories/house-build-contractors.repo';
import { houseBuildRepo } from '@/db/repositories/house-build.repo';

const HB_ACCENT = '#2563EB';

export default function StageRequestPrepScreen() {
  const { projectId, stageKey } = useLocalSearchParams<{ projectId: string; stageKey: string }>();
  const insets = useSafeAreaInsets();
  const stage = getStageByKey(stageKey);
  const preset = getRequestPresetForStage(stageKey);

  const [workDescription, setWorkDescription] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preset) {
      setWorkDescription(preset.templateText);
    }
    if (projectId) {
      houseBuildRepo.findProjectById(projectId).then((proj: any) => {
        if (proj?.landContext) {
          try {
            const ctx = typeof proj.landContext === 'string' ? JSON.parse(proj.landContext) : proj.landContext;
            if (ctx.plotCity) setCity(ctx.plotCity);
            else if (ctx.city) setCity(ctx.city);
            else if (ctx.voivodeship) setCity(ctx.voivodeship);
          } catch { /* ignore */ }
        }
      });
    }
  }, [projectId, preset]);

  const handleSaveDraft = async () => {
    if (!workDescription.trim()) {
      Alert.alert('Blad', 'Opis pracy nie moze byc pusty.');
      return;
    }
    setSaving(true);
    try {
      const requestId = await contractorRequestsRepo.upsert({
        workDescription: workDescription.trim(),
        city: city.trim() || 'Nie podano',
        budgetRange: 'any',
        offerMode: 'multiple',
        selectedContractorIds: [],
        status: 'draft',
        categoryName: preset?.workCategory ?? stage?.name,
        jobName: preset?.summaryPrefix ?? stage?.name,
        notes: notes.trim() || undefined,
      });
      if (projectId && stageKey) {
        await houseBuildContractorsRepo.upsertNeed(projectId, stageKey, {
          status: 'request-prepared',
          requestId,
        });
      }
      Alert.alert('Zapisano', 'Zapytanie zapisane jako szkic. Mozesz je wyslac z listy zapytan.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Save draft error:', err);
      Alert.alert('Blad', 'Nie udalo sie zapisac zapytania.');
    } finally {
      setSaving(false);
    }
  };

  const handleBrowse = () => {
    if (projectId && stageKey) {
      houseBuildContractorsRepo.upsertNeed(projectId, stageKey, { status: 'browsing' });
    }
    router.push({ pathname: '/contractor/results' as any, params: { fromHouseBuild: '1', stageKey, projectId } });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <View style={{ backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 16 }}>
        <Txt w="semibold" style={{ fontSize: 13, color: HB_ACCENT }}>{stage?.name ?? stageKey}</Txt>
        {preset && <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>{preset.workCategory}</Txt>}
        <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 4 }}>
          Przygotuj zapytanie do wykonawcy. Szablon zostal wypelniony danymi z projektu — mozesz go dostosowac.
        </Txt>
      </View>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 }}>
        <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 6 }}>Opis pracy</Txt>
        <TextInput
          style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 10, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 120, textAlignVertical: 'top' }}
          value={workDescription}
          onChangeText={setWorkDescription}
          multiline
          placeholder="Opisz zakres prac..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 }}>
        <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 6 }}>Miasto / rejon</Txt>
        <TextInput
          style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 10, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0' }}
          value={city}
          onChangeText={setCity}
          placeholder="Np. Warszawa, Krakow..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
        <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 6 }}>Dodatkowe notatki (opcjonalne)</Txt>
        <TextInput
          style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 10, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 60, textAlignVertical: 'top' }}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Np. preferowany termin, uwagi..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <TouchableOpacity
        onPress={handleSaveDraft}
        disabled={saving}
        style={{ backgroundColor: HB_ACCENT, borderRadius: 10, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 8 }}
      >
        <Feather name="save" size={16} color="#FFFFFF" />
        <Txt w="semibold" style={{ fontSize: 13, color: '#FFFFFF' }}>{saving ? 'Zapisywanie...' : 'Zapisz zapytanie (szkic)'}</Txt>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleBrowse}
        style={{ backgroundColor: '#059669', borderRadius: 10, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
      >
        <Feather name="search" size={16} color="#FFFFFF" />
        <Txt w="semibold" style={{ fontSize: 13, color: '#FFFFFF' }}>Tylko przegladaj wykonawcow</Txt>
      </TouchableOpacity>
    </ScrollView>
  );
}
