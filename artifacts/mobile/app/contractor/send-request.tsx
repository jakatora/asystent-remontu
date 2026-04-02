import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useContractor } from '@/context/ContractorContext';
import { isContractorVerified as isContractorVerifiedFn } from '@/features/contractor/contractor-trust';

export default function SendRequestScreen() {
  const { contractorId, requestId } = useLocalSearchParams<{
    contractorId?: string;
    requestId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { getContractorById, requests, saveRequest, updateRequestStatus } = useContractor();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  const contractor = contractorId ? getContractorById(contractorId) : undefined;
  const existingRequest = requestId ? requests.find((r) => r.id === requestId) : undefined;

  const [workDescription, setWorkDescription] = useState(existingRequest?.workDescription ?? '');
  const [city, setCity] = useState(existingRequest?.city ?? '');
  const [preferredDate, setPreferredDate] = useState(existingRequest?.preferredDate ?? '');
  const [notes, setNotes] = useState(existingRequest?.notes ?? '');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const canSend = workDescription.trim().length >= 10 && city.trim().length >= 2;

  const handleSend = async () => {
    if (!canSend) return;
    setIsSending(true);
    try {
      const existingIds = existingRequest?.selectedContractorIds ?? [];
      const mergedIds = contractorId && !existingIds.includes(contractorId)
        ? [...existingIds, contractorId]
        : existingIds.length > 0 ? existingIds : (contractorId ? [contractorId] : []);

      await saveRequest({
        ...(existingRequest ? { id: existingRequest.id } : {}),
        categoryId: existingRequest?.categoryId,
        categoryName: existingRequest?.categoryName,
        jobId: existingRequest?.jobId,
        jobName: existingRequest?.jobName,
        roomDescription: existingRequest?.roomDescription,
        workDescription,
        city,
        postalCode: existingRequest?.postalCode,
        preferredDate: preferredDate || undefined,
        budgetRange: existingRequest?.budgetRange ?? 'any',
        offerMode: existingRequest?.offerMode ?? 'single',
        notes: notes || undefined,
        photoRefs: existingRequest?.photoRefs,
        selectedContractorIds: mergedIds,
        status: 'sent',
        sentAt: new Date().toISOString(),
        estimatedMatchCount: existingRequest?.estimatedMatchCount,
      });
      setSent(true);
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Zapytanie wysłane',
            headerBackTitle: 'Wróć',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
          }}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: Colors.successBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Feather name="check" size={36} color={Colors.success} />
          </View>
          <Txt w="bold" style={{ fontSize: 22, color: Colors.text, textAlign: 'center', marginBottom: 8 }}>
            Zapytanie wysłane!
          </Txt>
          <Txt style={{ fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
            {contractor
              ? `Twoje zapytanie zostało wysłane do ${contractor.displayName}. Oczekuj na odpowiedź.`
              : 'Twoje zapytanie zostało zapisane. Fachowcy skontaktują się z Tobą.'}
          </Txt>
          <View style={{ width: '100%', marginBottom: 12 }}>
            <Button
              label="Moje zapytania"
              variant="primary"
              onPress={() => router.replace('/contractor/my-requests')}
              fullWidth
            />
          </View>
          <View style={{ width: '100%' }}>
            <Button
              label="Wróć na stronę główną"
              variant="secondary"
              onPress={() => router.replace('/(tabs)')}
              fullWidth
            />
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Wyślij zapytanie',
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {contractor && (
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              borderWidth: 1,
              borderColor: Colors.border,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: Colors.primaryBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Txt w="bold" style={{ fontSize: 18, color: Colors.primary }}>
                {contractor.displayName.charAt(0)}
              </Txt>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Txt w="bold" style={{ fontSize: 15, color: Colors.text }}>{contractor.displayName}</Txt>
                {isContractorVerifiedFn(contractor.verificationStatus) && (
                  <Feather name="check-circle" size={14} color={Colors.success} />
                )}
              </View>
              <Txt style={{ fontSize: 12, color: Colors.textMuted }}>{contractor.city}</Txt>
            </View>
          </View>
        )}

        <Txt w="bold" style={{ fontSize: 18, color: Colors.text, marginBottom: 4 }}>
          Opisz swoje potrzeby
        </Txt>
        <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 16 }}>
          Im dokładniej opiszesz, tym lepsza oferta
        </Txt>

        <LabeledInput
          label="Co chcesz zrobić? *"
          value={workDescription}
          onChangeText={setWorkDescription}
          placeholder="np. malowanie 3 pokoi, wymiana paneli w salonie..."
          multiline
        />

        <LabeledInput
          label="Miasto *"
          value={city}
          onChangeText={setCity}
          placeholder="np. Warszawa"
        />

        <LabeledInput
          label="Preferowany termin (opcjonalne)"
          value={preferredDate}
          onChangeText={setPreferredDate}
          placeholder="np. marzec 2026"
        />

        <LabeledInput
          label="Dodatkowe uwagi (opcjonalne)"
          value={notes}
          onChangeText={setNotes}
          placeholder="np. klucze do odbioru od sąsiada, pies w domu..."
          multiline
        />

        <TouchableOpacity
          style={{
            backgroundColor: Colors.surfaceAlt,
            borderRadius: 14,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            borderStyle: 'dashed',
          }}
          activeOpacity={0.7}
        >
          <Feather name="camera" size={20} color={Colors.textMuted} />
          <Txt style={{ fontSize: 14, color: Colors.textMuted }}>Dodaj zdjęcia (wkrótce)</Txt>
        </TouchableOpacity>
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
        }}
      >
        <Button
          label="Wyślij zapytanie"
          variant="primary"
          onPress={handleSend}
          loading={isSending}
          disabled={!canSend}
        />
      </View>
    </>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 6 }}>{label}</Txt>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 12,
          padding: 14,
          fontSize: 14,
          color: Colors.text,
          borderWidth: 1,
          borderColor: Colors.border,
          minHeight: multiline ? 100 : undefined,
          textAlignVertical: multiline ? 'top' : undefined,
          fontFamily: 'Inter_400Regular',
        }}
      />
    </View>
  );
}
