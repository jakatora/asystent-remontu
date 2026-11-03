import { Redirect, Stack, usePathname } from 'expo-router';
import { Colors } from '@/constants/colors';
import { isLocalContractorRoute } from '@/features/contractor/local-requests';

export default function ContractorLayout() {
  const pathname = usePathname();
  if (!isLocalContractorRoute(pathname)) return <Redirect href="/contractor/unavailable" />;
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
