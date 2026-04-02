import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function HouseBuildLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerBackTitle: 'Wróć',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Budowa domu' }} />
      <Stack.Screen name="create" options={{ title: 'Nowy projekt budowy', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Projekt budowy' }} />
      <Stack.Screen name="stage" options={{ title: 'Etap budowy' }} />
      <Stack.Screen name="documents" options={{ title: 'Dokumenty' }} />
      <Stack.Screen name="professionals" options={{ title: 'Specjalisci' }} />
      <Stack.Screen name="utilities" options={{ title: 'Przylacza' }} />
      <Stack.Screen name="formal-path" options={{ title: 'Sciezka formalna', presentation: 'modal' }} />
      <Stack.Screen name="formal-result" options={{ title: 'Wynik oceny formalnej' }} />
      <Stack.Screen name="formal-documents" options={{ title: 'Wymagane dokumenty' }} />
      <Stack.Screen name="before-works" options={{ title: 'Przed rozpoczeciem robót' }} />
      <Stack.Screen name="start-works" options={{ title: 'Rozpoczecie robót' }} />
      <Stack.Screen name="edb" options={{ title: 'Elektroniczny Dziennik Budowy' }} />
      <Stack.Screen name="completion" options={{ title: 'Zakonczenie budowy' }} />
      <Stack.Screen name="energy-planning" options={{ title: 'Planowanie energetyczne' }} />
      <Stack.Screen name="timeline" options={{ title: 'Harmonogram budowy' }} />
      <Stack.Screen name="budget" options={{ title: 'Budzet budowy' }} />
      <Stack.Screen name="milestones" options={{ title: 'Kamienie milowe' }} />
      <Stack.Screen name="stage-plan" options={{ title: 'Plan etapu' }} />
      <Stack.Screen name="doc-dashboard" options={{ title: 'Centrum dokumentow' }} />
      <Stack.Screen name="official-forms" options={{ title: 'Formularze urzedowe' }} />
      <Stack.Screen name="decisions" options={{ title: 'Decyzje inwestora' }} />
      <Stack.Screen name="questions" options={{ title: 'Pytania do specjalistow' }} />
      <Stack.Screen name="completion-package" options={{ title: 'Pakiet zakonczeniowy' }} />
      <Stack.Screen name="investor-docs" options={{ title: 'Dokumenty projektu' }} />
      <Stack.Screen name="utility-hub" options={{ title: 'Przylacza i media' }} />
      <Stack.Screen name="utility-electricity" options={{ title: 'Przylacze elektryczne' }} />
      <Stack.Screen name="utility-water" options={{ title: 'Przylacze wodociagowe' }} />
      <Stack.Screen name="utility-sewer" options={{ title: 'Przylacze kanalizacyjne' }} />
      <Stack.Screen name="utility-gas" options={{ title: 'Przylacze gazowe' }} />
      <Stack.Screen name="utility-internet" options={{ title: 'Internet / telekomunikacja' }} />
      <Stack.Screen name="utility-alternatives" options={{ title: 'Rozwiazania alternatywne' }} />
      <Stack.Screen name="pricing-references" options={{ title: 'Ceny referencyjne' }} />
      <Stack.Screen name="content-admin-hub" options={{ title: 'Administracja tresci' }} />
      <Stack.Screen name="content-dashboard" options={{ title: 'Panel tresci' }} />
      <Stack.Screen name="content-stages" options={{ title: 'Etapy - tresc' }} />
      <Stack.Screen name="content-formal" options={{ title: 'Wytyczne formalne' }} />
      <Stack.Screen name="content-utilities" options={{ title: 'Przylacza - tresc' }} />
      <Stack.Screen name="content-decisions" options={{ title: 'Szablony decyzji' }} />
      <Stack.Screen name="content-questions" options={{ title: 'Szablony pytan' }} />
      <Stack.Screen name="content-warnings" options={{ title: 'Ostrzezenia' }} />
      <Stack.Screen name="content-sources" options={{ title: 'Rejestr zrodel' }} />
      <Stack.Screen name="content-import-export" options={{ title: 'Import / Eksport' }} />
      <Stack.Screen name="content-snapshots" options={{ title: 'Wersjonowanie' }} />
      <Stack.Screen name="content-health" options={{ title: 'Kontrola jakosci' }} />
      <Stack.Screen name="content-disclaimers" options={{ title: 'Zastrzezenia' }} />
      <Stack.Screen name="contractor-board" options={{ title: 'Tablica wykonawcow' }} />
      <Stack.Screen name="stage-contractors" options={{ title: 'Wykonawcy etapu' }} />
      <Stack.Screen name="stage-request-prep" options={{ title: 'Przygotuj zapytanie' }} />
    </Stack>
  );
}
