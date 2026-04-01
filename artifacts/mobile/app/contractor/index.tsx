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
import type { BudgetRange, OfferMode } from '@/types/contractor';
import { BUDGET_RANGE_LABELS } from '@/types/contractor';

type WizardStep = 'category' | 'room' | 'description' | 'location' | 'date' | 'budget' | 'offers' | 'summary';

const STEPS: WizardStep[] = ['category', 'room', 'description', 'location', 'date', 'budget', 'offers', 'summary'];

export default function ContractorRequestWizard() {
  const { prefillCategoryId, prefillJobId, prefillJobName } = useLocalSearchParams<{
    prefillCategoryId?: string;
    prefillJobId?: string;
    prefillJobName?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { getMatchCount, saveRequest } = useContractor();

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
  const [offerMode, setOfferMode] = useState<OfferMode>('multiple');
  const [isSaving, setIsSaving] = useState(false);

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
      case 'offers': return true;
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
    setIsSaving(true);
    try {
      await saveRequest({
        categoryId: categoryId || undefined,
        categoryName: categoryName || undefined,
        jobId: prefillJobId || undefined,
        jobName: jobName || undefined,
        roomDescription: roomDescription || undefined,
        workDescription: workDescription || 'Szkic zapytania',
        city: city || 'Nie podano',
        postalCode: postalCode || undefined,
        preferredDate: preferredDate || undefined,
        budgetRange,
        offerMode,
        selectedContractorIds: [],
        status: 'draft',
        estimatedMatchCount: matchCount,
      });
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  const handleShowResults = () => {
    router.push({
      pathname: '/contractor/results',
      params: { categoryId, city },
    });
  };

  const handleSendRequest = async () => {
    setIsSaving(true);
    try {
      const id = await saveRequest({
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
      router.push({
        pathname: '/contractor/results',
        params: { categoryId, city, requestId: id },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Znajdź fachowca',
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={handleSaveDraft} style={{ marginRight: 8 }}>
              <Txt w="medium" style={{ fontSize: 14, color: Colors.primary }}>Zapisz szkic</Txt>
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
            Krok {stepIdx + 1} z {STEPS.length}
          </Txt>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 80 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'category' && (
            <StepCategory
              selected={categoryId}
              onSelect={(id, name) => { setCategoryId(id); setCategoryName(name); }}
            />
          )}
          {step === 'room' && (
            <StepText
              title="Jaki pokój lub obszar?"
              hint="np. łazienka, kuchnia, salon, cały dom (opcjonalne)"
              value={roomDescription}
              onChangeText={setRoomDescription}
              placeholder="Opisz pomieszczenie..."
            />
          )}
          {step === 'description' && (
            <StepText
              title="Opisz co chcesz zrobić"
              hint="Napisz krótko, np.: malowanie ścian i sufitu, wymiana paneli, remont łazienki"
              value={workDescription}
              onChangeText={setWorkDescription}
              placeholder="Opisz zakres prac..."
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
              title="Preferowany termin (opcjonalne)"
              hint="Wpisz orientacyjny termin rozpoczęcia prac"
              value={preferredDate}
              onChangeText={setPreferredDate}
              placeholder="np. styczeń 2026, jak najszybciej..."
            />
          )}
          {step === 'budget' && (
            <StepBudget selected={budgetRange} onSelect={setBudgetRange} />
          )}
          {step === 'offers' && (
            <StepOfferMode selected={offerMode} onSelect={setOfferMode} />
          )}
          {step === 'summary' && (
            <StepSummary
              categoryName={categoryName}
              roomDescription={roomDescription}
              workDescription={workDescription}
              city={city}
              preferredDate={preferredDate}
              budgetRange={budgetRange}
              offerMode={offerMode}
              matchCount={matchCount}
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
            <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Button
                  label="Pokaż fachowców"
                  variant="secondary"
                  onPress={handleShowResults}
                  fullWidth
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label="Wyślij zapytanie"
                  variant="primary"
                  onPress={handleSendRequest}
                  loading={isSaving}
                  fullWidth
                />
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Button
                label="Dalej"
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
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>
        Jakiego rodzaju pracy szukasz?
      </Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
        Wybierz kategorię, a my dopasujemy fachowców
      </Txt>
      <View style={{ gap: 8 }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
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
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>{title}</Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>{hint}</Txt>
      <TextInput
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
          minHeight: multiline ? 120 : undefined,
          textAlignVertical: multiline ? 'top' : undefined,
          fontFamily: 'Inter_400Regular',
        }}
      />
      {minLength !== undefined && value.length > 0 && value.length < minLength && (
        <Txt style={{ fontSize: 12, color: Colors.warning, marginTop: 6 }}>
          Minimum {minLength} znaków ({value.length}/{minLength})
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
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>Gdzie szukasz fachowca?</Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
        Podaj miasto, abyśmy znaleźli fachowców w Twojej okolicy
      </Txt>
      <TextInput
        value={city}
        onChangeText={onCityChange}
        placeholder="Miasto"
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
        value={postalCode}
        onChangeText={onPostalChange}
        placeholder="Kod pocztowy (opcjonalnie)"
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
  const options: BudgetRange[] = ['any', 'low', 'medium', 'high'];
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>Orientacyjny budżet</Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
        Pomoże to dopasować fachowców do Twoich oczekiwań (opcjonalne)
      </Txt>
      <View style={{ gap: 8 }}>
        {options.map((b) => (
          <TouchableOpacity
            key={b}
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

function StepOfferMode({ selected, onSelect }: { selected: OfferMode; onSelect: (m: OfferMode) => void }) {
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>
        Jeden fachowiec czy kilka ofert?
      </Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
        Możesz wybrać jednego fachowca lub poprosić o oferty od kilku
      </Txt>
      <View style={{ gap: 8 }}>
        <TouchableOpacity
          onPress={() => onSelect('single')}
          style={{
            backgroundColor: selected === 'single' ? Colors.primaryBg : Colors.surface,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1.5,
            borderColor: selected === 'single' ? Colors.primary : Colors.border,
          }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Feather name="user" size={20} color={selected === 'single' ? Colors.primary : Colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>Jeden fachowiec</Txt>
              <Txt style={{ fontSize: 12, color: Colors.textMuted }}>Wybiorę sam/a z listy</Txt>
            </View>
            {selected === 'single' && <Feather name="check-circle" size={20} color={Colors.primary} />}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSelect('multiple')}
          style={{
            backgroundColor: selected === 'multiple' ? Colors.primaryBg : Colors.surface,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1.5,
            borderColor: selected === 'multiple' ? Colors.primary : Colors.border,
          }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Feather name="users" size={20} color={selected === 'multiple' ? Colors.primary : Colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>Kilka ofert</Txt>
              <Txt style={{ fontSize: 12, color: Colors.textMuted }}>Wyślij zapytanie do wielu i porównaj</Txt>
            </View>
            {selected === 'multiple' && <Feather name="check-circle" size={20} color={Colors.primary} />}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StepSummary({
  categoryName,
  roomDescription,
  workDescription,
  city,
  preferredDate,
  budgetRange,
  offerMode,
  matchCount,
}: {
  categoryName: string;
  roomDescription: string;
  workDescription: string;
  city: string;
  preferredDate: string;
  budgetRange: BudgetRange;
  offerMode: OfferMode;
  matchCount: number;
}) {
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>
        Podsumowanie zapytania
      </Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
        Sprawdź czy wszystko się zgadza
      </Txt>

      <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 12 }}>
        <SummaryRow label="Rodzaj pracy" value={categoryName || 'Nie wybrano'} />
        {roomDescription ? <SummaryRow label="Pomieszczenie" value={roomDescription} /> : null}
        <SummaryRow label="Opis" value={workDescription} />
        <SummaryRow label="Lokalizacja" value={city} />
        {preferredDate ? <SummaryRow label="Termin" value={preferredDate} /> : null}
        <SummaryRow label="Budżet" value={BUDGET_RANGE_LABELS[budgetRange]} />
        <SummaryRow label="Tryb" value={offerMode === 'single' ? 'Jeden fachowiec' : 'Kilka ofert'} />
      </View>

      <View
        style={{
          backgroundColor: Colors.primaryBg,
          borderRadius: 14,
          padding: 16,
          marginTop: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Txt w="bold" style={{ fontSize: 16, color: '#fff' }}>{matchCount}</Txt>
        </View>
        <View style={{ flex: 1 }}>
          <Txt w="semibold" style={{ fontSize: 15, color: Colors.primaryDark }}>
            {matchCount === 0 ? 'Brak dopasowań' : `Pasujących fachowców: ${matchCount}`}
          </Txt>
          <Txt style={{ fontSize: 12, color: Colors.primary }}>
            {matchCount === 0
              ? 'Spróbuj zmienić kategorię lub lokalizację'
              : 'Gotowi do przyjęcia Twojego zapytania'}
          </Txt>
        </View>
      </View>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Txt w="semibold" style={{ fontSize: 13, color: Colors.textSecondary, width: 100 }}>{label}</Txt>
      <Txt style={{ fontSize: 13, color: Colors.text, flex: 1 }}>{value}</Txt>
    </View>
  );
}
