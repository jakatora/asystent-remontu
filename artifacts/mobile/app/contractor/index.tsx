import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { CATEGORIES } from '@/data/categories';
import { useContractor } from '@/context/ContractorContext';
import { useLanguage } from '@/context/LanguageContext';
import type { BudgetRange, OfferMode } from '@/types/contractor';
import { BUDGET_RANGE_LABELS } from '@/types/contractor';
import { ContractorServiceNotice } from '@/components/contractor/ServiceAvailability';

type WizardStep = 'category' | 'room' | 'description' | 'location' | 'date' | 'budget' | 'summary';

const STEPS: WizardStep[] = ['category', 'room', 'description', 'location', 'date', 'budget', 'summary'];

export default function ContractorRequestWizard() {
  const { prefillCategoryId, prefillJobId, prefillJobName } = useLocalSearchParams<{
    prefillCategoryId?: string;
    prefillJobId?: string;
    prefillJobName?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { getMatchCount, saveRequest } = useContractor();
  const { t, language } = useLanguage();

  const [stepIdx, setStepIdx] = useState(0);
  const [categoryId, setCategoryId] = useState(prefillCategoryId ?? '');
  const [categoryName, setCategoryName] = useState(
    prefillCategoryId ? CATEGORIES.find((c) => c.id === prefillCategoryId)?.name ?? '' : '',
  );
  const [jobName, setJobName] = useState(prefillJobName ?? '');
  const [roomDescription, setRoomDescription] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [budgetRange, setBudgetRange] = useState<BudgetRange>('any');
  const offerMode: OfferMode = 'multiple';
  const [isSaving, setIsSaving] = useState(false);
  const [draftId] = useState(() => `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  const [saveError, setSaveError] = useState('');

  const step = STEPS[stepIdx];
  const progress = (stepIdx + 1) / STEPS.length;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  const matchCount = getMatchCount(categoryId || undefined, city || undefined);

  const canGoNext = useCallback((): boolean => {
    switch (step) {
      case 'category': return !!categoryId;
      case 'room': return true;
      case 'description': return workDescription.trim().length >= 10;
      case 'location': return city.trim().length >= 2;
      case 'date': return true;
      case 'budget': return true;
      case 'summary': return true;
      default: return false;
    }
  }, [step, categoryId, workDescription, city]);

  const handleNext = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };

  const handleBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
    else router.back();
  };

  const handleSaveDraft = async () => {
    if (isSaving) return;
    setIsSaving(true); setSaveError('');
    try {
      await saveRequest({
        id: draftId,
        categoryId: categoryId || undefined,
        categoryName: categoryName || undefined,
        jobId: prefillJobId || undefined,
        jobName: jobName || undefined,
        roomDescription: roomDescription || undefined,
        workDescription: workDescription || t('contractor.index.draftWorkDescription'),
        city: city || t('contractor.index.draftCity'),
        postalCode: postalCode || undefined,
        preferredDate: preferredDate || undefined,
        budgetRange,
        offerMode,
        selectedContractorIds: [],
        status: 'draft',
        estimatedMatchCount: matchCount,
      });
      router.dismissTo('/contractor/my-requests');
    } catch {
      setSaveError(language === 'pl' ? 'Nie udało się zapisać szkicu. Spróbuj ponownie.' : 'The draft could not be saved. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveComplete = async () => {
    if (isSaving) return;
    setIsSaving(true); setSaveError('');
    try {
      const id = await saveRequest({
        id: draftId,
        categoryId: categoryId || undefined,
        categoryName: categoryName || undefined,
        jobId: prefillJobId || undefined,
        jobName: jobName || undefined,
        roomDescription: roomDescription || undefined,
        workDescription,
        city,
        postalCode: postalCode || undefined,
        preferredDate: preferredDate || undefined,
        budgetRange,
        offerMode,
        selectedContractorIds: [],
        status: 'draft',
        estimatedMatchCount: matchCount,
      });
      router.replace({
        pathname: '/contractor/send-request',
        params: { requestId: id },
      });
    } catch {
      setSaveError(language === 'pl' ? 'Nie udało się zapisać szkicu. Spróbuj ponownie.' : 'The draft could not be saved. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: language === 'pl' ? 'Przygotuj zakres prac' : 'Prepare scope of work',
          headerBackTitle: t('contractor.index.headerBack'),
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity accessibilityRole="button" accessibilityState={{disabled:isSaving}} disabled={isSaving} onPress={handleSaveDraft} style={{ marginRight: 8, minHeight:48, justifyContent:'center' }}>
              <Txt w="medium" style={{ fontSize: 14, color: Colors.primary }}>{t('contractor.index.saveDraft')}</Txt>
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <View
            style={{
              height: 4,
              backgroundColor: Colors.surfaceAlt,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: 4,
                backgroundColor: Colors.primary,
                borderRadius: 2,
              }}
            />
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4, textAlign: 'right' }}>
            {t('contractor.index.stepCounter', { current: stepIdx + 1, total: STEPS.length })}
          </Txt>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 80 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'category' && <View style={{marginBottom:16}}><ContractorServiceNotice /></View>}
          {saveError ? <Txt accessibilityRole="alert" style={{fontSize:15,color:Colors.text,marginBottom:16}}>{saveError}</Txt> : null}
          {step === 'category' && (
            <StepCategory
              selected={categoryId}
              onSelect={(id, name) => { setCategoryId(id); setCategoryName(name); }}
            />
          )}
          {step === 'room' && (
            <StepText
              title={t('contractor.index.room.title')}
              hint={t('contractor.index.room.hint')}
              value={roomDescription}
              onChangeText={setRoomDescription}
              placeholder={t('contractor.index.room.placeholder')}
            />
          )}
          {step === 'description' && (
            <StepText
              title={t('contractor.index.description.title')}
              hint={t('contractor.index.description.hint')}
              value={workDescription}
              onChangeText={setWorkDescription}
              placeholder={t('contractor.index.description.placeholder')}
              multiline
              minLength={10}
            />
          )}
          {step === 'location' && (
            <StepLocation
              city={city}
              postalCode={postalCode}
              onCityChange={setCity}
              onPostalChange={setPostalCode}
            />
          )}
          {step === 'date' && (
            <StepText
              title={t('contractor.index.date.title')}
              hint={t('contractor.index.date.hint')}
              value={preferredDate}
              onChangeText={setPreferredDate}
              placeholder={t('contractor.index.date.placeholder')}
            />
          )}
          {step === 'budget' && (
            <StepBudget selected={budgetRange} onSelect={setBudgetRange} />
          )}
          {step === 'summary' && (
            <StepSummary
              categoryName={categoryName}
              roomDescription={roomDescription}
              workDescription={workDescription}
              city={city}
              preferredDate={preferredDate}
              budgetRange={budgetRange}
            />
          )}
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: Colors.background,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: bottomPad,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('contractor.index.headerBack')}
            onPress={handleBack}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: Colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {step === 'summary' ? (
            <View style={{ flex: 1 }}>
              <Button label={language === 'pl' ? 'Zapisz szkic na urządzeniu' : 'Save draft on this device'} onPress={handleSaveComplete} loading={isSaving} fullWidth />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Button
                label={t('contractor.index.next')}
                variant="primary"
                onPress={handleNext}
                disabled={!canGoNext()}
                fullWidth
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

function StepCategory({ selected, onSelect }: { selected: string; onSelect: (id: string, name: string) => void }) {
  const { t } = useLanguage();
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>
        {t('contractor.index.category.title')}
      </Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
        {t('contractor.index.category.subtitle')}
      </Txt>
      <View style={{ gap: 8 }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            accessibilityRole="radio"
            aria-checked={selected===cat.id}
            accessibilityLabel={cat.name}
            accessibilityState={{checked:selected===cat.id}}
            onPress={() => onSelect(cat.id, cat.name)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: selected === cat.id ? Colors.primaryBg : Colors.surface,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1.5,
              borderColor: selected === cat.id ? Colors.primary : Colors.border,
              gap: 12,
            }}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: selected === cat.id ? Colors.primary + '20' : Colors.surfaceAlt,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather
                name={cat.icon as any}
                size={18}
                color={selected === cat.id ? Colors.primary : Colors.textSecondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>{cat.name}</Txt>
              <Txt style={{ fontSize: 12, color: Colors.textMuted }} numberOfLines={1}>{cat.description}</Txt>
            </View>
            {selected === cat.id && <Feather name="check-circle" size={20} color={Colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function StepText({
  title,
  hint,
  value,
  onChangeText,
  placeholder,
  multiline,
  minLength,
}: {
  title: string;
  hint: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
  minLength?: number;
}) {
  const { t } = useLanguage();
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>{title}</Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>{hint}</Txt>
      <TextInput
        accessibilityLabel={title}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 14,
          padding: 16,
          fontSize: 15,
          color: Colors.text,
          borderWidth: 1,
          borderColor: Colors.border,
          minHeight: multiline ? 120 : 48,
          textAlignVertical: multiline ? 'top' : undefined,
          fontFamily: 'Inter_400Regular',
        }}
      />
      {minLength !== undefined && value.length > 0 && value.length < minLength && (
        <Txt style={{ fontSize: 12, color: Colors.warning, marginTop: 6 }}>
          {t('contractor.index.minChars', { min: minLength, current: value.length })}
        </Txt>
      )}
    </View>
  );
}

function StepLocation({
  city,
  postalCode,
  onCityChange,
  onPostalChange,
}: {
  city: string;
  postalCode: string;
  onCityChange: (t: string) => void;
  onPostalChange: (t: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>{t('contractor.index.location.title')}</Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
        {t('contractor.index.location.subtitle')}
      </Txt>
      <TextInput
        accessibilityLabel={t('contractor.index.location.cityPlaceholder')}
        value={city}
        onChangeText={onCityChange}
        placeholder={t('contractor.index.location.cityPlaceholder')}
        placeholderTextColor={Colors.textMuted}
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 14,
          padding: 16,
          fontSize: 15,
          color: Colors.text,
          borderWidth: 1,
          borderColor: Colors.border,
          marginBottom: 12,
          fontFamily: 'Inter_400Regular',
        }}
      />
      <TextInput
        accessibilityLabel={t('contractor.index.location.postalPlaceholder')}
        value={postalCode}
        onChangeText={onPostalChange}
        placeholder={t('contractor.index.location.postalPlaceholder')}
        placeholderTextColor={Colors.textMuted}
        keyboardType="numeric"
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 14,
          padding: 16,
          fontSize: 15,
          color: Colors.text,
          borderWidth: 1,
          borderColor: Colors.border,
          fontFamily: 'Inter_400Regular',
        }}
      />
    </View>
  );
}

function StepBudget({ selected, onSelect }: { selected: BudgetRange; onSelect: (b: BudgetRange) => void }) {
  const { t } = useLanguage();
  const options: BudgetRange[] = ['any', 'low', 'medium', 'high'];
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>{t('contractor.index.budget.title')}</Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
        {t('contractor.index.budget.subtitle')}
      </Txt>
      <View style={{ gap: 8 }}>
        {options.map((b) => (
          <TouchableOpacity
            key={b}
            accessibilityRole="radio"
            aria-checked={selected===b}
            accessibilityState={{checked:selected===b}}
            accessibilityLabel={BUDGET_RANGE_LABELS[b]}
            onPress={() => onSelect(b)}
            style={{
              backgroundColor: selected === b ? Colors.primaryBg : Colors.surface,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1.5,
              borderColor: selected === b ? Colors.primary : Colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            activeOpacity={0.7}
          >
            <Txt w={selected === b ? 'semibold' : 'regular'} style={{ fontSize: 15, color: Colors.text }}>
              {BUDGET_RANGE_LABELS[b]}
            </Txt>
            {selected === b && <Feather name="check-circle" size={20} color={Colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function StepSummary({ categoryName, roomDescription, workDescription, city, preferredDate, budgetRange }: {
  categoryName: string; roomDescription: string; workDescription: string; city: string;
  preferredDate: string; budgetRange: BudgetRange;
}) {
  const { t } = useLanguage();
  return <View style={{gap:16}}>
    <Txt w="bold" style={{fontSize:22,color:Colors.text}}>{t('contractor.index.summary.title')}</Txt>
    <View style={{backgroundColor:Colors.surface,borderRadius:16,padding:16,borderWidth:1,borderColor:Colors.border,gap:12}}>
      <SummaryRow label={t('contractor.index.summary.workType')} value={categoryName || t('contractor.index.summary.notSelected')} />
      {roomDescription ? <SummaryRow label={t('contractor.index.summary.room')} value={roomDescription} /> : null}
      <SummaryRow label={t('contractor.index.summary.description')} value={workDescription} />
      <SummaryRow label={t('contractor.index.summary.location')} value={city} />
      {preferredDate ? <SummaryRow label={t('contractor.index.summary.date')} value={preferredDate} /> : null}
      <SummaryRow label={t('contractor.index.summary.budget')} value={BUDGET_RANGE_LABELS[budgetRange]} />
    </View>
    <ContractorServiceNotice />
  </View>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Txt w="semibold" style={{ fontSize: 13, color: Colors.textSecondary, width: 100 }}>{label}</Txt>
      <Txt style={{ fontSize: 13, color: Colors.text, flex: 1 }}>{value}</Txt>
    </View>
  );
}
