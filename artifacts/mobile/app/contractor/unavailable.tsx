import { Stack } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { ContractorUnavailableScreen } from '@/components/contractor/ServiceAvailability';

export default function ContractorUnavailable() {
  const { language } = useLanguage();
  return <>
    <Stack.Screen options={{ title: language === 'pl' ? 'Fachowcy' : 'Contractors' }} />
    <ContractorUnavailableScreen />
  </>;
}
