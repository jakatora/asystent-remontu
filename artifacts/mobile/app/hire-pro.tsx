import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getJobById } from '@/data/jobs';
import { Txt } from '@/components/ui/Txt';

const TIPS = [
  {
    icon: 'search' as const,
    title: 'Jak znaleźć dobrego fachowca?',
    items: [
      'Poproś znajomych i rodzinę o polecenie',
      'Sprawdź opinie w internecie (Google, Oferto)',
      'Zadzwoń do kilku firm i porównaj oferty',
      'Poproś o referencje od poprzednich klientów',
    ],
  },
  {
    icon: 'file-text' as const,
    title: 'Co sprawdzić przed zatrudnieniem?',
    items: [
      'Poproś o pisemną wycenę z wyszczególnionymi kosztami',
      'Sprawdź uprawnienia (elektryka, gaz — wymagane prawem)',
      'Sprawdź wpis do działalności (CEIDG)',
      'Omów termin rozpoczęcia i zakończenia prac',
      'Zapytaj o gwarancję na wykonane prace',
    ],
  },
  {
    icon: 'clipboard' as const,
    title: 'Podpisz umowę!',
    items: [
      'Umowa powinna zawierać: zakres prac, termin, cenę',
      'Nie płać całości z góry — max 30% zaliczki',
      'Resztę płać po odbiorze i sprawdzeniu jakości',
      'Żądaj faktury lub rachunku',
    ],
  },
];

export default function HireProScreen() {
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const insets = useSafeAreaInsets();
  const job = jobId ? getJobById(jobId) : null;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Zatrudnij fachowca',
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerTintColor: '#0F172A',
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        className="flex-1 bg-bg"
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning header */}
        <View className="bg-danger-bg p-8 items-center border-b border-red-200">
          <View className="w-[88px] h-[88px] rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="shield" size={40} color="#EF4444" />
          </View>
          <Txt w="bold" className="text-[22px] text-danger text-center mb-2">Ta praca wymaga fachowca</Txt>
          {job?.hireProfessionalReason && (
            <Txt className="text-[15px] text-red-700 text-center leading-6">{job.hireProfessionalReason}</Txt>
          )}
        </View>

        <View className="p-5 gap-4">
          {TIPS.map((tip, ti) => (
            <View key={ti} className="bg-surface rounded-2xl p-[18px] border border-stroke gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary-bg items-center justify-center">
                  <Feather name={tip.icon} size={20} color="#F97316" />
                </View>
                <Txt w="bold" className="flex-1 text-base text-ink">{tip.title}</Txt>
              </View>
              {tip.items.map((item, ii) => (
                <View key={ii} className="flex-row gap-2.5 items-start">
                  <View className="w-1.5 h-1.5 rounded-full bg-primary mt-[7px] shrink-0" />
                  <Txt className="flex-1 text-sm text-slate leading-5">{item}</Txt>
                </View>
              ))}
            </View>
          ))}

          {/* Emergency */}
          <View className="flex-row items-center gap-3.5 bg-danger-bg rounded-2xl p-4 border border-red-200">
            <Feather name="phone-call" size={20} color="#EF4444" />
            <View className="flex-1">
              <Txt w="bold" className="text-[15px] text-danger">Nagłe przypadki</Txt>
              <Txt className="text-[13px] text-red-700 mt-0.5">Awaria gazu, zalanie, brak prądu</Txt>
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center"
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={{ shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
          >
            <Txt w="bold" className="text-base text-white">Wróć do projektu</Txt>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
