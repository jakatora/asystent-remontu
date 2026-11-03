import React, { useState } from 'react';
import { Platform, Share, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { contractorRequestText } from '@/features/contractor/local-requests';
import type { ContractorRequest } from '@/types/contractor';

export function RequestDraftShare({ request }: { request: ContractorRequest }) {
  const { language } = useLanguage();
  const pl = language === 'pl';
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [fallback, setFallback] = useState(false);
  const text = contractorRequestText(request, language);
  const share = async () => {
    setBusy(true);
    setMessage('');
    setFallback(false);
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
        setMessage(
          pl
            ? 'Skopiowano treść. Wklej ją w wiadomości do wybranego wykonawcy.'
            : 'Text copied. Paste it into a message to your chosen contractor.',
        );
      } else {
        const result = await Share.share({ message: text });
        if (result.action === Share.sharedAction)
          setMessage(
            pl
              ? 'Przekazano treść do wybranej aplikacji. Sprawdź w niej wysłanie wiadomości.'
              : 'Text handed to the selected app. Check that app to send your message.',
          );
      }
    } catch {
      setFallback(true);
      setMessage(
        pl
          ? 'Nie udało się udostępnić treści. Możesz zaznaczyć i skopiować ją poniżej.'
          : 'Sharing failed. Select and copy the text below.',
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 12 }}>
      <Button
        label={
          Platform.OS === 'web'
            ? pl
              ? 'Kopiuj zakres prac'
              : 'Copy scope of work'
            : pl
              ? 'Udostępnij zakres prac'
              : 'Share scope of work'
        }
        variant="outline"
        onPress={share}
        loading={busy}
      />
      {message ? (
        <Txt
          accessibilityLiveRegion="polite"
          style={{ color: Colors.textSecondary, fontSize: 14, lineHeight: 22 }}
        >
          {message}
        </Txt>
      ) : null}
      {fallback && (
        <TextInput
          accessibilityLabel={
            pl
              ? 'Treść zakresu prac do skopiowania'
              : 'Scope of work text to copy'
          }
          value={text}
          editable={false}
          multiline
          selectTextOnFocus
          style={{
            color: Colors.text,
            fontSize: 15,
            lineHeight: 22,
            borderColor: Colors.border,
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
          }}
        />
      )}
    </View>
  );
}
