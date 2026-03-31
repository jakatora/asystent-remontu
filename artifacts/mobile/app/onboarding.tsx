import React, { useState, useRef } from 'react';
import { View, Animated, FlatList, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';
import { useApp } from '@/context/AppContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'home',
    title: 'Witaj w Remont Asystent',
    description: 'Twój przewodnik po remontach. Prowadzimy Cię krok po kroku — nawet jeśli nigdy nie robiłeś remontu.',
    color: '#F97316',
  },
  {
    id: '2',
    icon: 'list',
    title: 'Oblicz ile materiałów potrzebujesz',
    description: 'Podaj wymiary — my obliczymy ile farby, paneli czy kleju kupić. Zero zgadywania.',
    color: '#3B82F6',
  },
  {
    id: '3',
    icon: 'shopping-cart',
    title: 'Lista zakupów w jednym miejscu',
    description: 'Gotowa lista wszystkiego co potrzebujesz. Odhaczaj produkty w sklepie — nic nie zapomnisz.',
    color: '#22C55E',
  },
  {
    id: '4',
    icon: 'alert-triangle',
    title: 'Bezpieczeństwo na pierwszym miejscu',
    description: 'Wyraźnie zaznaczymy kiedy praca jest niebezpieczna i kiedy lepiej zadzwonić do fachowca.',
    color: '#F59E0B',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { completeOnboarding } = useApp();

  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await completeOnboarding();
      router.replace('/(tabs)');
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View
      className="flex-1 bg-bg"
      style={{ paddingTop: Platform.OS === 'web' ? 0 : insets.top, paddingBottom: insets.bottom + 24 }}
    >
      {/* Skip */}
      <View className="px-4 items-end justify-center" style={{ height: 48 }}>
        {!isLast && <Button label="Pomiń" variant="ghost" size="sm" onPress={handleSkip} />}
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={{ width }} className="items-center justify-center px-8 flex-1">
            <View
              className="items-center justify-center mb-10"
              style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: item.color + '18' }}
            >
              <Feather name={item.icon as any} size={60} color={item.color} />
            </View>
            <Txt w="bold" className="text-[26px] text-ink text-center mb-4" style={{ lineHeight: 34 }}>{item.title}</Txt>
            <Txt className="text-base text-slate text-center leading-6">{item.description}</Txt>
          </View>
        )}
      />

      {/* Dots */}
      <View className="flex-row justify-center gap-1.5 mb-8">
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
          return (
            <Animated.View
              key={i}
              style={{ width: dotWidth, height: 8, borderRadius: 4, opacity, backgroundColor: '#F97316' }}
            />
          );
        })}
      </View>

      {/* Button */}
      <View className="px-6">
        <Button
          label={isLast ? 'Zacznij korzystać' : 'Dalej'}
          onPress={handleNext}
          size="lg"
          fullWidth
          testID="onboarding-next"
        />
      </View>
    </View>
  );
}
