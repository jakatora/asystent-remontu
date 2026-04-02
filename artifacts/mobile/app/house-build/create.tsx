import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useHouseBuild } from '@/context/HouseBuildContext';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type {
  HouseType,
  UserConfidenceLevel,
  PlanningMode,
  LandContext,
  PlanningContext,
} from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

type WizardStep = 'name' | 'location' | 'legal' | 'house' | 'confidence' | 'summary';
const STEPS: WizardStep[] = ['name', 'location', 'legal', 'house', 'confidence', 'summary'];
const STEP_TITLES: Record<WizardStep, string> = {
  name: 'Nazwa projektu',
  location: 'Lokalizacja',
  legal: 'Formalnosci',
  house: 'Typ domu',
  confidence: 'Doswiadczenie',
  summary: 'Podsumowanie',
};

export default function CreateHouseBuildProject() {
  const insets = useSafeAreaInsets();
  const { createProject } = useHouseBuild();
  const [step, setStep] = useState<WizardStep>('name');

  const [projectName, setProjectName] = useState('');
  const [plotCity, setPlotCity] = useState('');
  const [hasMpzp, setHasMpzp] = useState<boolean | null>(null);
  const [hasWz, setHasWz] = useState<boolean | null>(null);
  const [houseType, setHouseType] = useState<HouseType>('detached');
  const [footprint, setFootprint] = useState('');
  const [floors, setFloors] = useState(1);
  const [forOwnHousing, setForOwnHousing] = useState(true);
  const [confidence, setConfidence] = useState<UserConfidenceLevel>('beginner');
  const [planningMode, setPlanningMode] = useState<PlanningMode>('planning-and-contractors');
  const [saving, setSaving] = useState(false);

  const stepIdx = STEPS.indexOf(step);
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const canNext = useCallback(() => {
    if (step === 'name') return projectName.trim().length > 0;
    if (step === 'location') return plotCity.trim().length > 0;
    return true;
  }, [step, projectName, plotCity]);

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) setStep(STEPS[stepIdx + 1]);
  };
  const goBack = () => {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1]);
    else router.back();
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const landContext: LandContext = {
        hasMpzp,
        hasWz,
        plotCity: plotCity.trim(),
      };
      const planningContext: PlanningContext = {
        legalPath: hasMpzp ? 'mpzp' : hasWz ? 'wz' : null,
        houseType,
        approximateFootprint: footprint ? parseFloat(footprint) : null,
        floorsAboveGround: floors,
        forOwnHousing,
        userConfidence: confidence,
        planningMode,
      };
      const id = await createProject({ name: projectName.trim(), landContext, planningContext });
      router.replace({ pathname: '/house-build/[id]', params: { id } });
    } catch (e) {
      Alert.alert('Blad', 'Nie udalo sie utworzyc projektu.');
      setSaving(false);
    }
  };

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 20;

  return (
    <>
      <Stack.Screen options={{ title: STEP_TITLES[step] }} />
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ height: 4, backgroundColor: Colors.border }}>
          <View style={{ height: 4, backgroundColor: HB_ACCENT, width: `${progress}%` }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'name' && (
            <StepCard title="Jak nazwiemy ten projekt?">
              <TextInput
                value={projectName}
                onChangeText={setProjectName}
                placeholder="np. Dom w Kowalach"
                placeholderTextColor={Colors.textMuted}
                style={{
                  backgroundColor: Colors.surface,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: Colors.text,
                  fontFamily: 'Inter_400Regular',
                }}
                autoFocus
              />
            </StepCard>
          )}

          {step === 'location' && (
            <StepCard title="Gdzie planowana jest budowa?">
              <TextInput
                value={plotCity}
                onChangeText={setPlotCity}
                placeholder="Miasto / gmina"
                placeholderTextColor={Colors.textMuted}
                style={{
                  backgroundColor: Colors.surface,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: Colors.text,
                  fontFamily: 'Inter_400Regular',
                }}
                autoFocus
              />
            </StepCard>
          )}

          {step === 'legal' && (
            <StepCard title="Stan formalny dzialki">
              <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 16 }}>
                Czy znasz status planistyczny dzialki?
              </Txt>
              <ToggleOption
                label="Dzialka ma MPZP"
                description="Miejscowy Plan Zagospodarowania Przestrzennego"
                value={hasMpzp}
                onToggle={(v) => setHasMpzp(v)}
              />
              <ToggleOption
                label="Mam decyzje WZ"
                description="Warunki Zabudowy"
                value={hasWz}
                onToggle={(v) => setHasWz(v)}
              />
              <View style={{ backgroundColor: Colors.warningBg, borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#FDE68A' }}>
                <Txt style={{ fontSize: 12, color: '#92400E' }}>
                  Nie wiesz? Nie szkodzi — mozesz to uzupelnic pozniej. Sprawdzisz w urzedzie gminy lub na geoportalu.
                </Txt>
              </View>
            </StepCard>
          )}

          {step === 'house' && (
            <StepCard title="Jaki dom planujesz?">
              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 10 }}>Typ domu</Txt>
              {HOUSE_TYPE_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  selected={houseType === opt.value}
                  onPress={() => setHouseType(opt.value)}
                />
              ))}

              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginTop: 20, marginBottom: 10 }}>
                Orientacyjna powierzchnia zabudowy (m2)
              </Txt>
              <TextInput
                value={footprint}
                onChangeText={setFootprint}
                placeholder="np. 120"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                style={{
                  backgroundColor: Colors.surface,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: Colors.text,
                  fontFamily: 'Inter_400Regular',
                }}
              />

              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginTop: 20, marginBottom: 10 }}>
                Kondygnacje nadziemne
              </Txt>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[1, 2, 3].map((n) => (
                  <OptionCard key={n} label={`${n}`} selected={floors === n} onPress={() => setFloors(n)} />
                ))}
              </View>

              <View style={{ marginTop: 20 }}>
                <ToggleOption
                  label="Na wlasne cele mieszkaniowe"
                  description="Wplyw na formalnosci i ewentualne ulgi"
                  value={forOwnHousing}
                  onToggle={(v) => setForOwnHousing(v)}
                />
              </View>
            </StepCard>
          )}

          {step === 'confidence' && (
            <StepCard title="Twoje doswiadczenie">
              <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 16 }}>
                Pomoze nam dostosowac wskazówki do Twojego poziomu
              </Txt>
              {CONFIDENCE_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  description={opt.description}
                  selected={confidence === opt.value}
                  onPress={() => setConfidence(opt.value)}
                />
              ))}

              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginTop: 24, marginBottom: 10 }}>
                Tryb planowania
              </Txt>
              {PLANNING_MODE_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  description={opt.description}
                  selected={planningMode === opt.value}
                  onPress={() => setPlanningMode(opt.value)}
                />
              ))}
            </StepCard>
          )}

          {step === 'summary' && (
            <StepCard title="Podsumowanie">
              <SummaryRow label="Nazwa" value={projectName} />
              <SummaryRow label="Lokalizacja" value={plotCity} />
              <SummaryRow label="MPZP" value={hasMpzp === true ? 'Tak' : hasMpzp === false ? 'Nie' : 'Nie wiem'} />
              <SummaryRow label="WZ" value={hasWz === true ? 'Tak' : hasWz === false ? 'Nie' : 'Nie wiem'} />
              <SummaryRow label="Typ domu" value={HOUSE_TYPE_OPTIONS.find((o) => o.value === houseType)?.label ?? houseType} />
              <SummaryRow label="Powierzchnia" value={footprint ? `${footprint} m2` : 'Nie podano'} />
              <SummaryRow label="Kondygnacje" value={`${floors}`} />
              <SummaryRow label="Cel" value={forOwnHousing ? 'Wlasne mieszkanie' : 'Inny cel'} />
              <SummaryRow label="Doswiadczenie" value={CONFIDENCE_OPTIONS.find((o) => o.value === confidence)?.label ?? confidence} />
            </StepCard>
          )}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingBottom: bottomPad, paddingTop: 12, backgroundColor: Colors.background }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: Colors.surface,
              borderRadius: 14,
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
            }}
            onPress={goBack}
            activeOpacity={0.8}
          >
            <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>Wróc</Txt>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 2,
              backgroundColor: canNext() ? HB_ACCENT : Colors.border,
              borderRadius: 14,
              padding: 16,
              alignItems: 'center',
            }}
            onPress={step === 'summary' ? handleSave : goNext}
            disabled={!canNext() || saving}
            activeOpacity={0.8}
          >
            <Txt w="bold" style={{ fontSize: 15, color: '#fff' }}>
              {step === 'summary' ? (saving ? 'Tworzenie...' : 'Utworz projekt') : 'Dalej'}
            </Txt>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 20, color: Colors.text, marginBottom: 16 }}>{title}</Txt>
      {children}
    </View>
  );
}

function OptionCard({ label, description, selected, onPress }: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: selected ? HB_ACCENT_BG : Colors.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: selected ? HB_ACCENT : Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: selected ? HB_ACCENT : Colors.textMuted,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {selected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: HB_ACCENT }} />}
      </View>
      <View style={{ flex: 1 }}>
        <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{label}</Txt>
        {description && <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{description}</Txt>}
      </View>
    </TouchableOpacity>
  );
}

function ToggleOption({ label, description, value, onToggle }: {
  label: string;
  description?: string;
  value: boolean | null;
  onToggle: (v: boolean) => void;
}) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: value ? HB_ACCENT_BG : Colors.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: value ? HB_ACCENT : Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
      onPress={() => onToggle(!value)}
      activeOpacity={0.8}
    >
      <View style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: value ? HB_ACCENT : Colors.textMuted,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {value && <Feather name="check" size={14} color={HB_ACCENT} />}
      </View>
      <View style={{ flex: 1 }}>
        <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{label}</Txt>
        {description && <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{description}</Txt>}
      </View>
    </TouchableOpacity>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>{label}</Txt>
      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{value}</Txt>
    </View>
  );
}

const HOUSE_TYPE_OPTIONS: { value: HouseType; label: string }[] = [
  { value: 'detached', label: 'Dom wolnostojacy' },
  { value: 'semi-detached', label: 'Blizniak' },
  { value: 'row-house', label: 'Szeregówka' },
  { value: 'modular', label: 'Dom modulowy / prefabrykowany' },
  { value: 'other', label: 'Inny' },
];

const CONFIDENCE_OPTIONS: { value: UserConfidenceLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Poczatkujacy', description: 'Buduje dom po raz pierwszy' },
  { value: 'some-experience', label: 'Mam pewne doswiadczenie', description: 'Mam kontakt z budowa lub remontem' },
  { value: 'experienced', label: 'Doswiadczony', description: 'Znam procesy budowlane' },
];

const PLANNING_MODE_OPTIONS: { value: PlanningMode; label: string; description: string }[] = [
  { value: 'planning-only', label: 'Tylko planowanie', description: 'Chce planowac i sledzic etapy' },
  { value: 'planning-and-contractors', label: 'Planowanie + wykonawcy', description: 'Chce tez szukac fachowców' },
];
