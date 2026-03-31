import '../global.css';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppProvider, useApp } from '@/context/AppContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { queryClient } from '@/lib/query-client';
import { initSentry } from '@/lib/sentry';

SplashScreen.preventAutoHideAsync();

initSentry().catch(() => {});

function RootLayoutNav() {
  const { onboardingDone, isLoading } = useApp();

  useEffect(() => {
    if (!isLoading) {
      if (!onboardingDone) {
        router.replace('/onboarding');
      }
    }
  }, [onboardingDone, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              backgroundColor: Colors.primaryBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Txt w="bold" style={{ fontSize: 28, color: Colors.primary }}>RA</Txt>
          </View>
          <LoadingState message="Przygotowuję dane..." />
        </View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="wizard" options={{ headerShown: true, presentation: 'modal' }} />
      <Stack.Screen name="category/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="job/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="project/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="hire-pro" options={{ headerShown: true, presentation: 'modal' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <RootLayoutNav />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
