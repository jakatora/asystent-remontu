import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'home',
    title: 'Witaj w Remont Asystent',
    description: 'Twój przewodnik po remontach. Prowadzimy Cię krok po kroku — nawet jeśli nigdy nie robiłeś remontu.',
    color: Colors.primary,
  },
  {
    id: '2',
    icon: 'list',
    title: 'Oblicz ile materiałów potrzebujesz',
    description: 'Podaj wymiary — my obliczymy ile farby, paneli czy kleju kupić. Zero zgadywania.',
    color: Colors.info,
  },
  {
    id: '3',
    icon: 'shopping-cart',
    title: 'Lista zakupów w jednym miejscu',
    description: 'Gotowa lista wszystkiego co potrzebujesz. Odhaczaj produkty w sklepie — nic nie zapomnisz.',
    color: Colors.success,
  },
  {
    id: '4',
    icon: 'alert-triangle',
    title: 'Bezpieczeństwo na pierwszym miejscu',
    description: 'Wyraźnie zaznaczymy kiedy praca jest niebezpieczna i kiedy lepiej zadzwonić do fachowca.',
    color: Colors.warning,
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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.skipRow}>
        {!isLast && (
          <Button label="Pomiń" variant="ghost" size="sm" onPress={handleSkip} />
        )}
      </View>

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
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '18' }]}>
              <Feather name={item.icon as any} size={60} color={item.color} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity, backgroundColor: Colors.primary }]}
            />
          );
        })}
      </View>

      <View style={styles.buttonContainer}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipRow: {
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    height: 48,
    justifyContent: 'center',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    flex: 1,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
});
