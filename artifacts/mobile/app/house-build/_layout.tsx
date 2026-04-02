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
    </Stack>
  );
}
