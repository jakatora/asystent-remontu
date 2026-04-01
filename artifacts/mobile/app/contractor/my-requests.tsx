import React, { useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { RequestSummaryCard } from '@/components/contractor/RequestSummary';
import { useContractor } from '@/context/ContractorContext';
import type { ContractorRequest } from '@/types/contractor';

export default function MyRequestsScreen() {
  const insets = useSafeAreaInsets();
  const { requests, refreshRequests, removeRequest, contractors, savedContractorIds, isContractorSaved } = useContractor();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  useFocusEffect(
    useCallback(() => {
      refreshRequests();
    }, [refreshRequests]),
  );

  const drafts = requests.filter((r) => r.status === 'draft');
  const sentRequests = requests.filter((r) => r.status !== 'draft');
  const savedContractors = contractors.filter((c) => savedContractorIds.has(c.id));

  const handleDeleteRequest = (req: ContractorRequest) => {
    Alert.alert(
      'Usuń zapytanie',
      'Czy na pewno chcesz usunąć to zapytanie?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Usuń', style: 'destructive', onPress: () => removeRequest(req.id) },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Moje zapytania',
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={{ padding: 20, gap: 24 }}>
              {drafts.length > 0 && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Feather name="edit" size={16} color={Colors.textSecondary} />
                    <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>Szkice ({drafts.length})</Txt>
                  </View>
                  {drafts.map((req) => (
                    <RequestSummaryCard
                      key={req.id}
                      request={req}
                      onPress={() => handleDeleteRequest(req)}
                    />
                  ))}
                </View>
              )}

              {sentRequests.length > 0 && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Feather name="send" size={16} color={Colors.textSecondary} />
                    <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>Wysłane ({sentRequests.length})</Txt>
                  </View>
                  {sentRequests.map((req) => (
                    <RequestSummaryCard key={req.id} request={req} />
                  ))}
                </View>
              )}

              {savedContractors.length > 0 && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Feather name="heart" size={16} color={Colors.danger} />
                    <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>
                      Zapisani fachowcy ({savedContractors.length})
                    </Txt>
                  </View>
                  {savedContractors.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => router.push({ pathname: '/contractor/[id]', params: { id: c.id } })}
                      style={{
                        backgroundColor: Colors.surface,
                        borderRadius: 14,
                        padding: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        borderWidth: 1,
                        borderColor: Colors.border,
                        marginBottom: 8,
                      }}
                      activeOpacity={0.85}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: Colors.primaryBg,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Txt w="bold" style={{ fontSize: 16, color: Colors.primary }}>
                          {c.displayName.charAt(0)}
                        </Txt>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{c.displayName}</Txt>
                        <Txt style={{ fontSize: 12, color: Colors.textMuted }}>{c.city}</Txt>
                      </View>
                      <Feather name="chevron-right" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {requests.length === 0 && savedContractors.length === 0 && (
                <EmptyState
                  icon="search"
                  title="Brak zapytań"
                  description="Nie masz jeszcze żadnych zapytań do fachowców. Zacznij od wyszukania fachowca."
                />
              )}
            </View>
          }
          contentContainerStyle={{ paddingBottom: bottomPad + 80 }}
          showsVerticalScrollIndicator={false}
        />

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: Colors.background,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: bottomPad,
          }}
        >
          <Button
            label="Znajdź fachowca"
            variant="primary"
            onPress={() => router.push('/contractor')}
          />
        </View>
      </View>
    </>
  );
}
