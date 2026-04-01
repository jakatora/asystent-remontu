import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function ContractorLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    />
  );
}
