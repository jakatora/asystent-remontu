import React, { useState, useRef } from 'react';
import { View, Animated, FlatList, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';
import { useApp } from '@/context/AppContext';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'home' as const,
    title: 'Witaj w Remont Asystent',
    description:
      'Twój przewodnik po remontach.\nProwadzimy Cię krok po kroku — nawet jeśli nigdy nie robiłeś remontu.',
    color: Colors.primary,
    bgColor: Colors.primaryBg,
  },
  {
    id: '2',
    icon: 'bar-chart-2' as const,
    title: 'Precyzyjne obliczenia',
    description:
      'Podaj wymiary pokoju — my obliczymy ile farby, paneli czy kleju potrzebujesz. Zero zgadywania, zero marnowania.',
    color: Colors.info,
    bgColor: Colors.infoBg,
  },
  {
    id: '3',
    icon: 'shopping-cart' as const,
    title: 'Gotowa lista zakupów',
    description:
      'Lista zakupów z cenami i ilościami. Odhaczaj produkty w sklepie — niczego nie zapomnisz.',
    color: Colors.success,
    bgColor: Colors.successBg,
  },
  {
    id: '4',
    icon: 'shield' as const,
    title: 'Bezpieczeństwo',
    description:
      'Wyraźnie pokażemy co możesz zrobić sam, a kiedy lepiej wezwać fachowca. Twoje bezpieczeństwo jest najważniejsze.',
    color: Colors.warning,
    bgColor: Colors.warningBg,
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
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'web' ? 16 : insets.top,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View style={{ paddingHorizontal: 16, height: 48, alignItems: 'flex-end', justifyContent: 'center' }}>
        {!isLast && (
          <Button
            label="Pomiń"
            variant="ghost"
            size="sm"
            onPress={handleSkip}
            testID="onboarding-skip"
          />
        )}
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View
            style={{ width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, flex: 1 }}
            accessibilityRole="text"
            accessibilityLabel={`${item.title}. ${item.description}`}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 32,
                backgroundColor: item.bgColor,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32,
              }}
            >
              <Feather name={item.icon} size={48} color={item.color} />
            </View>
            <Txt
              w="bold"
              style={{
                fontSize: 26,
                color: Colors.text,
                textAlign: 'center',
                marginBottom: 12,
                lineHeight: 34,
              }}
            >
              {item.title}
            </Txt>
            <Txt
              style={{
                fontSize: 16,
                color: Colors.textSecondary,
                textAlign: 'center',
                lineHeight: 24,
                maxWidth: 320,
              }}
            >
              {item.description}
            </Txt>
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 28, 8], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.25, 1, 0.25], extrapolate: 'clamp' });
          return (
            <Animated.View
              key={i}
              style={{
                width: dotWidth,
                height: 8,
                borderRadius: 4,
                opacity,
                backgroundColor: Colors.primary,
              }}
            />
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 24 }}>
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
