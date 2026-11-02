import React, { useState, useRef } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Colors } from '@/constants/colors';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savingRef = useRef(false);
  const { completeOnboarding } = useApp();
  const slides = [
    { id: '1', icon: 'home' as const, title: t('onboarding.slide1.title'), description: t('onboarding.slide1.description'), color: Colors.primary, bgColor: Colors.primaryBg },
    { id: '2', icon: 'bar-chart-2' as const, title: t('onboarding.slide2.title'), description: t('onboarding.slide2.description'), color: Colors.info, bgColor: Colors.infoBg },
    { id: '3', icon: 'shopping-cart' as const, title: t('onboarding.slide3.title'), description: t('onboarding.slide3.description'), color: Colors.success, bgColor: Colors.successBg },
    { id: '4', icon: 'shield' as const, title: t('onboarding.slide4.title'), description: t('onboarding.slide4.description'), color: Colors.warning, bgColor: Colors.warningBg },
  ];
  const slide = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;

  const finish = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      await completeOnboarding();
      router.replace('/(tabs)');
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  // Display follows state rather than platform-specific imperative scrolling
  // or momentum events. A resized browser cannot lose the requested next step.
  const next = () => {
    if (savingRef.current) return;
    if (isLast) void finish();
    else setCurrentIndex(index => Math.min(index + 1, slides.length - 1));
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: Platform.OS === 'web' ? 16 : insets.top, paddingBottom: insets.bottom + 24 }}>
      <View style={{ paddingHorizontal: 16, minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {currentIndex > 0 ? <Button label={t('onboarding.back')} variant="ghost" disabled={saving} onPress={() => setCurrentIndex(index => Math.max(0, index - 1))} testID="onboarding-back" /> : <View />}
        {!isLast && <Button label={t('onboarding.skip')} variant="ghost" disabled={saving} onPress={() => void finish()} testID="onboarding-skip" />}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 }}>
        <View key={slide.id} style={{ width: '100%', maxWidth: 420, alignItems: 'center' }} accessibilityLiveRegion="polite">
          <View style={{ width: 120, height: 120, borderRadius: 32, backgroundColor: slide.bgColor, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <Feather name={slide.icon} size={48} color={slide.color} />
          </View>
          <Txt w="bold" accessibilityRole="header" style={{ fontSize: 26, color: Colors.text, textAlign: 'center', marginBottom: 12, lineHeight: 34 }}>{slide.title}</Txt>
          <Txt style={{ fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, maxWidth: 320 }}>{slide.description}</Txt>
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 }} accessible={false}>
        {slides.map((item, index) => <View key={item.id} style={{ width: index === currentIndex ? 28 : 8, height: 8, borderRadius: 4, opacity: index === currentIndex ? 1 : 0.25, backgroundColor: Colors.primary }} />)}
      </View>
      <Txt style={{ textAlign: 'center', color: Colors.textSecondary, fontSize: 13, marginBottom: 18 }}>{t('onboarding.step', { current: currentIndex + 1, total: slides.length })}</Txt>
      {saveError && <Txt accessibilityRole="alert" style={{ color: Colors.text, textAlign: 'center', marginHorizontal: 24, marginBottom: 12 }}>{t('onboarding.saveError')}</Txt>}
      <View style={{ paddingHorizontal: 24 }}>
        <Button label={isLast ? t('onboarding.start') : t('onboarding.next')} onPress={next} loading={saving} size="lg" fullWidth testID="onboarding-next" />
      </View>
    </View>
  );
}
