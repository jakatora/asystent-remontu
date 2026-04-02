import React, { useEffect } from 'react';
import { View, FlatList, TextInput, Platform } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors } from '@/constants/colors';
import { ContractorCard } from '@/components/contractor/ContractorCard';
import { FilterBar } from '@/components/contractor/FilterBar';
import { useContractor } from '@/context/ContractorContext';

export default function ContractorResultsScreen() {
  const { categoryId, city, requestId, fromHouseBuild, stageKey, projectId } = useLocalSearchParams<{
    categoryId?: string;
    city?: string;
    requestId?: string;
    fromHouseBuild?: string;
    stageKey?: string;
    projectId?: string;
  }>();
  const isHouseBuild = fromHouseBuild === '1' && !!stageKey;
  const insets = useSafeAreaInsets();
  const {
    filteredContractors,
    filters,
    sortOption,
    searchQuery,
    setFilters,
    setSortOption,
    setSearchQuery,
    resetFilters,
    isContractorSaved,
    toggleSaveContractor,
  } = useContractor();

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  useEffect(() => {
    if (categoryId || city) {
      setFilters({
        ...filters,
        categoryId: categoryId || undefined,
        city: city || undefined,
      });
    }
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Fachowcy',
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.surface,
              borderRadius: 12,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Feather name="search" size={18} color={Colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Szukaj fachowca..."
              placeholderTextColor={Colors.textMuted}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 8,
                fontSize: 14,
                color: Colors.text,
                fontFamily: 'Inter_400Regular',
              }}
            />
          </View>
        </View>

        <FilterBar
          filters={filters}
          sortOption={sortOption}
          onFiltersChange={setFilters}
          onSortChange={setSortOption}
          onReset={resetFilters}
          resultCount={filteredContractors.length}
        />

        <FlatList
          data={filteredContractors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="users"
              title="Brak wyników"
              description="Spróbuj zmienić filtry lub wyszukiwanie"
            />
          }
          renderItem={({ item }) => (
            <ContractorCard
              contractor={item}
              onPress={() => router.push({
                pathname: '/contractor/[id]',
                params: {
                  id: item.id,
                  requestId,
                  ...(isHouseBuild ? { fromHouseBuild: '1', stageKey, projectId } : {}),
                },
              })}
              onSendRequest={() =>
                router.push({
                  pathname: '/contractor/send-request',
                  params: { contractorId: item.id, requestId },
                })
              }
              isSaved={isContractorSaved(item.id)}
              onToggleSave={() => toggleSaveContractor(item.id)}
            />
          )}
        />
      </View>
    </>
  );
}
