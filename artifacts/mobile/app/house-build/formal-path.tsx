import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { assessFormalPath } from '@/features/house-build/formal-path';
import type { FormalPathInput } from '@/features/house-build/formal-path';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

type TriState = true | false | null;

export default function FormalPathWizard() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const [hasMpzp, setHasMpzp] = useState<TriState>(null);
  const [hasWz, setHasWz] = useState<TriState>(null);
  const [isSingleFamily, setIsSingleFamily] = useState(true);
  const [isFreeStanding, setIsFreeStanding] = useState(true);
  const [footprintArea, setFootprintArea] = useState('');
  const [floorsAboveGround, setFloorsAboveGround] = useState('1');
  const [forOwnHousing, setForOwnHousing] = useState(true);
  const [isFirstTimeInvestor, setIsFirstTimeInvestor] = useState(true);
  const [prefersConservativePath, setPrefersConservativePath] = useState(false);

  const steps = [
    { title: 'Plan zagospodarowania', subtitle: 'MPZP i warunki zabudowy' },
    { title: 'Typ budynku', subtitle: 'Parametry domu' },
    { title: 'Dane inwestora', subtitle: 'Twoje doswiadczenie' },
  ];

  const handleFinish = useCallback(() => {
    const input: FormalPathInput = {
      hasMpzp,
      hasWz,
      isSingleFamily,
      isFreeStanding,
      footprintArea: footprintArea ? parseFloat(footprintArea) : null,
      floorsAboveGround: parseInt(floorsAboveGround, 10) || 1,
      forOwnHousing,
      isFirstTimeInvestor,
      prefersConservativePath,
    };
    const assessment = assessFormalPath(input);
    router.replace({
      pathname: '/house-build/formal-result',
      params: { assessment: JSON.stringify(assessment) },
    });
  }, [hasMpzp, hasWz, isSingleFamily, isFreeStanding, footprintArea, floorsAboveGround, forOwnHousing, isFirstTimeInvestor, prefersConservativePath]);

  const canNext = step < 2;
  const canFinish = step === 2;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 20;

  return (
    <>
      <Stack.Screen options={{ title: `Sciezka formalna (${step + 1}/${steps.length})` }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
            {steps.map((_, i) => (
              <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? HB_ACCENT : Colors.border }} />
            ))}
          </View>

          <Txt w="bold" style={{ fontSize: 20, color: Colors.text, marginBottom: 4 }}>{steps[step].title}</Txt>
          <Txt style={{ fontSize: 14, color: Colors.textMuted, marginBottom: 20 }}>{steps[step].subtitle}</Txt>

          <View style={{
            backgroundColor: '#FFFBEB',
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#FDE68A',
            flexDirection: 'row',
            gap: 10,
          }}>
            <Feather name="info" size={16} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 12, color: '#92400E', flex: 1 }}>
              To narzedzie pomoze Ci zorientowac sie w mozliwych sciezkach formalnych. Nie jest to porada prawna — koncowy wybór potwierdz z urzedem i projektantem.
            </Txt>
          </View>

          {step === 0 && (
            <View style={{ gap: 16 }}>
              <QuestionBlock
                label="Czy dzialka ma MPZP (Miejscowy Plan Zagospodarowania Przestrzennego)?"
                help="MPZP okresla, co mozna wybudowac na danej dzialce. Sprawdz w urzedzie gminy lub na geoportalu."
                value={hasMpzp}
                onChange={setHasMpzp}
                tristate
              />
              {hasMpzp !== true && (
                <QuestionBlock
                  label="Czy masz juz decyzje o Warunkach Zabudowy (WZ)?"
                  help="Jesli nie ma MPZP, WZ okresla warunki zabudowy dla Twojej dzialki."
                  value={hasWz}
                  onChange={setHasWz}
                  tristate
                />
              )}
            </View>
          )}

          {step === 1 && (
            <View style={{ gap: 16 }}>
              <QuestionBlock
                label="Czy planujesz dom jednorodzinny?"
                value={isSingleFamily}
                onChange={setIsSingleFamily}
              />
              <QuestionBlock
                label="Czy dom bedzie wolnostojacy?"
                help="Blizniak lub zabudowa szeregowa to nie dom wolnostojacy."
                value={isFreeStanding}
                onChange={setIsFreeStanding}
              />
              <View>
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 6 }}>Planowana powierzchnia zabudowy (m2)</Txt>
                <TextInput
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    padding: 14,
                    fontSize: 16,
                    color: Colors.text,
                  }}
                  keyboardType="numeric"
                  value={footprintArea}
                  onChangeText={setFootprintArea}
                  placeholder="np. 120"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View>
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 6 }}>Liczba kondygnacji nadziemnych</Txt>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {['1', '2', '3'].map(v => (
                    <TouchableOpacity
                      key={v}
                      style={{
                        flex: 1,
                        backgroundColor: floorsAboveGround === v ? HB_ACCENT : Colors.surface,
                        borderRadius: 12,
                        padding: 14,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: floorsAboveGround === v ? HB_ACCENT : Colors.border,
                      }}
                      onPress={() => setFloorsAboveGround(v)}
                    >
                      <Txt w="semibold" style={{ fontSize: 16, color: floorsAboveGround === v ? '#fff' : Colors.text }}>{v}</Txt>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <QuestionBlock
                label="Czy budowa jest na wlasne cele mieszkaniowe?"
                value={forOwnHousing}
                onChange={setForOwnHousing}
              />
            </View>
          )}

          {step === 2 && (
            <View style={{ gap: 16 }}>
              <QuestionBlock
                label="Czy to Twoja pierwsza budowa domu?"
                help="Poczatkujacym inwestorom moze byc bezpieczniej skorzystac z bardziej klasycznej sciezki formalnej."
                value={isFirstTimeInvestor}
                onChange={setIsFirstTimeInvestor}
              />
              <QuestionBlock
                label="Czy wolisz bezpieczniejsza (bardziej konserwatywna) sciezke?"
                help="Jesli tak, pokaze Ci klasyczne pozwolenie na budowe jako rekomendacje."
                value={prefersConservativePath}
                onChange={setPrefersConservativePath}
              />
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 28 }}>
            {step > 0 && (
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
                onPress={() => setStep(s => s - 1)}
              >
                <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>Wstecz</Txt>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: HB_ACCENT,
                borderRadius: 14,
                padding: 16,
                alignItems: 'center',
              }}
              onPress={canFinish ? handleFinish : () => setStep(s => s + 1)}
            >
              <Txt w="bold" style={{ fontSize: 15, color: '#fff' }}>
                {canFinish ? 'Zobacz wynik' : 'Dalej'}
              </Txt>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function QuestionBlock({
  label,
  help,
  value,
  onChange,
  tristate,
}: {
  label: string;
  help?: string;
  value: boolean | null;
  onChange: (v: any) => void;
  tristate?: boolean;
}) {
  const options: { label: string; val: boolean | null }[] = tristate
    ? [
        { label: 'Tak', val: true },
        { label: 'Nie', val: false },
        { label: 'Nie wiem', val: null },
      ]
    : [
        { label: 'Tak', val: true },
        { label: 'Nie', val: false },
      ];

  return (
    <View>
      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 4 }}>{label}</Txt>
      {help && <Txt style={{ fontSize: 12, color: Colors.textMuted, marginBottom: 8 }}>{help}</Txt>}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {options.map(opt => {
          const selected = value === opt.val;
          return (
            <TouchableOpacity
              key={String(opt.val)}
              style={{
                flex: 1,
                backgroundColor: selected ? HB_ACCENT : Colors.surface,
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: selected ? HB_ACCENT : Colors.border,
              }}
              onPress={() => onChange(opt.val)}
            >
              <Txt w="semibold" style={{ fontSize: 13, color: selected ? '#fff' : Colors.text }}>{opt.label}</Txt>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
