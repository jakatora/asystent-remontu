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
import { useLanguage } from '@/context/LanguageContext';
import type { ContractorRequest } from '@/types/contractor';
import { ContractorServiceNotice } from '@/components/contractor/ServiceAvailability';

export default function MyRequestsScreen() {
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const pl = language === 'pl';
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
      t('contractor.myRequests.deleteTitle'),
      t('contractor.myRequests.deleteBody'),
      [
        { text: t('contractor.myRequests.cancel'), style: 'cancel' },
        { text: t('contractor.myRequests.delete'), style: 'destructive', onPress: () => removeRequest(req.id) },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: pl ? 'Moje szkice i zapisy' : 'My drafts and records',
          headerBackTitle: t('contractor.myRequests.headerBack'),
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
              <ContractorServiceNotice />
              {drafts.length > 0 && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Feather name="edit" size={16} color={Colors.textSecondary} />
                    <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>{t('contractor.myRequests.drafts', { count: drafts.length })}</Txt>
                  </View>
                  {drafts.map((req) => (
                    <View key={req.id}>
                      <RequestSummaryCard request={req} onPress={() => router.push({ pathname: '/contractor/send-request', params: { requestId: req.id } })} />
                      <Button label={pl ? 'Usuń szkic' : 'Delete draft'} variant="ghost" size="sm" onPress={() => handleDeleteRequest(req)} />
                    </View>
                  ))}
                </View>
              )}

              {sentRequests.length > 0 && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Feather name="file-text" size={16} color={Colors.textSecondary} />
                    <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>{pl ? `Zapisy z wcześniejszej wersji (${sentRequests.length})` : `Records from an earlier version (${sentRequests.length})`}</Txt>
                  </View>
                  {sentRequests.map((req) => (
                    <RequestSummaryCard key={req.id} request={req} onPress={() => router.push({ pathname: '/contractor/send-request', params: { requestId: req.id } })} />
                  ))}
                </View>
              )}

              {savedContractors.length > 0 && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Feather name="heart" size={16} color={Colors.danger} />
                    <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>
                      {t('contractor.myRequests.savedContractors', { count: savedContractors.length })}
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
                  title={pl ? 'Nie masz jeszcze zapisanych szkiców' : 'No saved drafts yet'}
                  description={pl ? 'Przygotuj zakres prac i zapisz go na tym urządzeniu.' : 'Prepare your scope of work and save it on this device.'}
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
            label={pl ? 'Przygotuj szkic zapytania' : 'Prepare a request draft'}
            variant="primary"
            onPress={() => router.push('/contractor')}
          />
        </View>
      </View>
    </>
  );
}
