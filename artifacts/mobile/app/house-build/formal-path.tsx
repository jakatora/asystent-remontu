import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { assessFormalPath } from '@/features/house-build/formal-path';
import type { FormalPathInput } from '@/features/house-build/formal-path';
import { useLanguage } from '@/context/LanguageContext';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

type TriState = true | false | null;

export default function FormalPathWizard() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
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
    { title: t('hb.formalPath.step1Title'), subtitle: t('hb.formalPath.step1Subtitle') },
    { title: t('hb.formalPath.step2Title'), subtitle: t('hb.formalPath.step2Subtitle') },
    { title: t('hb.formalPath.step3Title'), subtitle: t('hb.formalPath.step3Subtitle') },
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
      <Stack.Screen options={{ title: t('hb.formalPath.title', { step: step + 1, total: steps.length }) }} />
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
              {t('hb.formalPath.disclaimer')}
            </Txt>
          </View>

          {step === 0 && (
            <View style={{ gap: 16 }}>
              <QuestionBlock
                label={t('hb.formalPath.q.mpzpLabel')}
                help={t('hb.formalPath.q.mpzpHelp')}
                value={hasMpzp}
                onChange={setHasMpzp}
                tristate
              />
              {hasMpzp !== true && (
                <QuestionBlock
                  label={t('hb.formalPath.q.wzLabel')}
                  help={t('hb.formalPath.q.wzHelp')}
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
                label={t('hb.formalPath.q.singleFamilyLabel')}
                value={isSingleFamily}
                onChange={setIsSingleFamily}
              />
              <QuestionBlock
                label={t('hb.formalPath.q.freeStandingLabel')}
                help={t('hb.formalPath.q.freeStandingHelp')}
                value={isFreeStanding}
                onChange={setIsFreeStanding}
              />
              <View>
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 6 }}>{t('hb.formalPath.q.footprintLabel')}</Txt>
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
                  placeholder={t('hb.formalPath.q.footprintPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View>
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 6 }}>{t('hb.formalPath.q.floorsLabel')}</Txt>
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
                label={t('hb.formalPath.q.ownHousingLabel')}
                value={forOwnHousing}
                onChange={setForOwnHousing}
              />
            </View>
          )}

          {step === 2 && (
            <View style={{ gap: 16 }}>
              <QuestionBlock
                label={t('hb.formalPath.q.firstTimeLabel')}
                help={t('hb.formalPath.q.firstTimeHelp')}
                value={isFirstTimeInvestor}
                onChange={setIsFirstTimeInvestor}
              />
              <QuestionBlock
                label={t('hb.formalPath.q.conservativeLabel')}
                help={t('hb.formalPath.q.conservativeHelp')}
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
                <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>{t('hb.formalPath.back')}</Txt>
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
                {canFinish ? t('hb.formalPath.seeResult') : t('hb.formalPath.next')}
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
  const { t } = useLanguage();
  const options: { label: string; val: boolean | null }[] = tristate
    ? [
        { label: t('hb.formalPath.opt.yes'), val: true },
        { label: t('hb.formalPath.opt.no'), val: false },
        { label: t('hb.formalPath.opt.dontKnow'), val: null },
      ]
    : [
        { label: t('hb.formalPath.opt.yes'), val: true },
        { label: t('hb.formalPath.opt.no'), val: false },
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
