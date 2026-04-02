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
    </Stack>
  );
}
