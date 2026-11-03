import React from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

export function ContractorServiceNotice() {
  const { language } = useLanguage();
  const pl = language === 'pl';
  return (
    <View
      testID="contractor-local-notice"
      style={{
        backgroundColor: Colors.primaryBg,
        borderColor: Colors.primaryLight,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 8,
      }}
    >
      <Txt w="bold" style={{ color: Colors.primaryDark, fontSize: 16 }}>
        {pl ? 'Przygotuj zakres prac' : 'Prepare your scope of work'}
      </Txt>
      <Txt
        style={{ color: Colors.textSecondary, fontSize: 14, lineHeight: 22 }}
      >
        {pl
          ? 'Możesz zapisać szkic na tym urządzeniu i samodzielnie przekazać jego treść wybranemu wykonawcy. Wyszukiwanie fachowców, zakładanie ich kont i wysyłanie zapytań przez aplikację nie są jeszcze dostępne.'
          : 'Save a draft on this device and share its text with a contractor you choose. Contractor search, registration and sending requests through the app are not available yet.'}
      </Txt>
    </View>
  );
}

export function ContractorUnavailableScreen() {
  const { language } = useLanguage();
  const pl = language === 'pl';
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
        gap: 16,
        maxWidth: 640,
        width: '100%',
        alignSelf: 'center',
      }}
    >
      <Txt
        accessibilityRole="header"
        w="bold"
        style={{ fontSize: 24, color: Colors.text }}
      >
        {pl
          ? 'Wyszukiwarka fachowców w przygotowaniu'
          : 'Contractor search is in preparation'}
      </Txt>
      <ContractorServiceNotice />
      <Button
        label={pl ? 'Przygotuj szkic zapytania' : 'Prepare a request draft'}
        onPress={() => router.replace('/contractor')}
      />
      <Button
        label={pl ? 'Moje szkice i zapisy' : 'My drafts and records'}
        variant="outline"
        onPress={() => router.replace('/contractor/my-requests')}
      />
      <Button
        label={pl ? 'Wróć do projektów' : 'Back to projects'}
        variant="ghost"
        onPress={() => router.replace('/projects')}
      />
    </ScrollView>
  );
}
