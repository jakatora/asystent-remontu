import React, { useEffect, useState } from 'react';
import { View, ScrollView, TextInput, Platform } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useContractor } from '@/context/ContractorContext';
import { useLanguage } from '@/context/LanguageContext';
import { ContractorServiceNotice } from '@/components/contractor/ServiceAvailability';
import { RequestDraftShare } from '@/components/contractor/RequestDraftShare';
import type { ContractorRequest } from '@/types/contractor';

export default function RequestDraftScreen() {
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  const { requests, saveRequest, isLoading } = useContractor();
  const { language } = useLanguage();
  const pl = language === 'pl';
  const insets = useSafeAreaInsets();
  const [draftId, setDraftId] = useState(
    () =>
      requestId ??
      `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  );
  const existing = draftId
    ? requests.find((request) => request.id === draftId)
    : undefined;
  const [workDescription, setWorkDescription] = useState('');
  const [city, setCity] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<ContractorRequest | null>(null);
  useEffect(() => {
    // Populate once after the asynchronous local read, preserving unsaved edits.
    if (!existing || loadedId === existing.id) return;
    setWorkDescription(existing.workDescription);
    setCity(existing.city);
    setPreferredDate(existing.preferredDate ?? '');
    setNotes(existing.notes ?? '');
    setLoadedId(existing.id);
    setSaved(existing);
  }, [existing, loadedId]);
  const save = async () => {
    if (busy || !workDescription.trim() || !city.trim()) return;
    setBusy(true);
    setError('');
    try {
      const input = {
        ...existing,
        id: draftId,
        workDescription: workDescription.trim(),
        city: city.trim(),
        preferredDate: preferredDate.trim() || undefined,
        notes: notes.trim() || undefined,
        budgetRange: existing?.budgetRange ?? ('any' as const),
        offerMode: existing?.offerMode ?? ('single' as const),
        selectedContractorIds: existing?.selectedContractorIds ?? [],
        status: 'draft' as const,
        sentAt: undefined,
      };
      const id = await saveRequest(input);
      const now = new Date().toISOString();
      setDraftId(id);
      setLoadedId(id);
      setSaved({
        ...input,
        id,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
    } catch {
      setError(
        pl
          ? 'Nie udało się zapisać szkicu. Treść pozostaje w formularzu. Spróbuj ponownie.'
          : 'The draft could not be saved. Your text is still in the form. Try again.',
      );
    } finally {
      setBusy(false);
    }
  };
  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setSaved(null);
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: pl ? 'Szkic zapytania' : 'Request draft',
          headerBackTitle: pl ? 'Wstecz' : 'Back',
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Platform.OS === 'web' ? 24 : insets.bottom + 24,
          gap: 16,
          maxWidth: 640,
          width: '100%',
          alignSelf: 'center',
        }}
        keyboardShouldPersistTaps="handled"
      >
        <ContractorServiceNotice />
        {requestId && !existing ? (
          <>
            <Txt
              accessibilityRole="alert"
              style={{ color: Colors.textSecondary, fontSize: 16 }}
            >
              {isLoading
                ? pl
                  ? 'Wczytywanie szkicu…'
                  : 'Loading draft…'
                : pl
                  ? 'Nie znaleziono tego zapisu na tym urządzeniu.'
                  : 'This record was not found on this device.'}
            </Txt>
            <Button
              label={pl ? 'Moje szkice i zapisy' : 'My drafts and records'}
              onPress={() => router.dismissTo('/contractor/my-requests')}
            />
          </>
        ) : (
          <>
            {existing && existing.status !== 'draft' && (
              <Txt
                style={{
                  color: Colors.textSecondary,
                  fontSize: 14,
                  lineHeight: 22,
                }}
              >
                {pl
                  ? 'To zapis z wcześniejszej wersji. Dawny status nie potwierdza dostarczenia wiadomości. Zapisanie zmian utworzy z niego lokalny szkic.'
                  : 'This is a record from an earlier version. Its old status does not confirm message delivery. Saving changes will make it a local draft.'}
              </Txt>
            )}
            <DraftField
              label={pl ? 'Opis prac' : 'Scope of work'}
              value={workDescription}
              onChangeText={edit(setWorkDescription)}
              multiline
            />
            <DraftField
              label={pl ? 'Miejscowość' : 'City or town'}
              value={city}
              onChangeText={edit(setCity)}
            />
            <DraftField
              label={
                pl
                  ? 'Preferowany termin (opcjonalnie)'
                  : 'Preferred date (optional)'
              }
              value={preferredDate}
              onChangeText={edit(setPreferredDate)}
            />
            <DraftField
              label={pl ? 'Uwagi (opcjonalnie)' : 'Notes (optional)'}
              value={notes}
              onChangeText={edit(setNotes)}
              multiline
            />
            {existing?.photoRefs?.length ? (
              <Txt style={{ color: Colors.textSecondary, fontSize: 14 }}>
                {pl
                  ? 'Zachowamy zapisane odwołania do zdjęć. Udostępnienie tekstu nie dołącza zdjęć.'
                  : 'Saved photo references will be preserved. Sharing text does not attach photos.'}
              </Txt>
            ) : null}
            {error ? (
              <Txt
                accessibilityRole="alert"
                style={{ color: Colors.text, fontSize: 15, lineHeight: 22 }}
              >
                {error}
              </Txt>
            ) : null}
            <Button
              label={
                pl ? 'Zapisz szkic na urządzeniu' : 'Save draft on this device'
              }
              onPress={save}
              loading={busy}
              disabled={!workDescription.trim() || !city.trim()}
            />
            {saved && (
              <View testID="contractor-draft-saved" style={{ gap: 12 }}>
                <Txt
                  accessibilityLiveRegion="polite"
                  w="bold"
                  style={{ color: Colors.primaryDark, fontSize: 16 }}
                >
                  {pl
                    ? 'Treść zapisana lokalnie. Aplikacja nie wysłała jej do wykonawcy.'
                    : 'Text saved locally. The app has not sent it to a contractor.'}
                </Txt>
                <RequestDraftShare request={saved} />
              </View>
            )}
            <Button
              label={pl ? 'Moje szkice i zapisy' : 'My drafts and records'}
              variant="ghost"
            onPress={() => router.dismissTo('/contractor/my-requests')}
            />
          </>
        )}
      </ScrollView>
    </>
  );
}

function DraftField({
  label,
  value,
  onChangeText,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
        {label}
      </Txt>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={{
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: 12,
          padding: 14,
          minHeight: multiline ? 112 : 48,
          fontSize: 16,
          lineHeight: 24,
          color: Colors.text,
        }}
      />
    </View>
  );
}
