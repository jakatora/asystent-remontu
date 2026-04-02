import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useContractor } from '@/context/ContractorContext';
import { LISTING_TIER_LABELS } from '@/types/contractor';
import { houseBuildContractorsRepo } from '@/db/repositories/house-build-contractors.repo';

export default function ContractorProfileScreen() {
  const { id, requestId, fromHouseBuild, stageKey, projectId } = useLocalSearchParams<{
    id: string;
    requestId?: string;
    fromHouseBuild?: string;
    stageKey?: string;
    projectId?: string;
  }>();
  const isHouseBuild = fromHouseBuild === '1' && !!stageKey && !!projectId;
  const insets = useSafeAreaInsets();
  const { getContractorById, isContractorSaved, toggleSaveContractor } = useContractor();
  const c = getContractorById(id);
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;
  const saved = c ? isContractorSaved(c.id) : false;

  if (!c) {
    return (
      <>
        <Stack.Screen options={{ title: 'Profil fachowca' }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
          <Txt style={{ color: Colors.textMuted }}>Nie znaleziono fachowca</Txt>
        </View>
      </>
    );
  }

  const handleReport = () => {
    Alert.alert(
      'Zgłoś profil',
      'Czy chcesz zgłosić ten profil do moderacji?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Zgłoś', style: 'destructive', onPress: () => Alert.alert('Dziękujemy', 'Zgłoszenie zostało przyjęte.') },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: c.displayName,
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => toggleSaveContractor(c.id)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Feather name="heart" size={22} color={saved ? Colors.danger : Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReport} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Feather name="flag" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 20 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: Colors.primaryBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Txt w="bold" style={{ fontSize: 32, color: Colors.primary }}>
              {c.displayName.charAt(0)}
            </Txt>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Txt w="bold" style={{ fontSize: 20, color: Colors.text, textAlign: 'center' }}>
              {c.displayName}
            </Txt>
            {c.verificationStatus === 'verified' && (
              <Feather name="check-circle" size={18} color={Colors.success} />
            )}
          </View>

          {c.companyName && c.companyName !== c.displayName && (
            <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>{c.companyName}</Txt>
          )}

          {(c.isPromoted || c.listingTier !== 'free') && (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              {c.isPromoted && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: Colors.primaryBg,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Feather name="star" size={12} color={Colors.primary} />
                  <Txt w="semibold" style={{ fontSize: 12, color: Colors.primary }}>Promowany</Txt>
                </View>
              )}
              {c.listingTier === 'premium' && (
                <View style={{ backgroundColor: '#F3E8FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Txt w="semibold" style={{ fontSize: 12, color: '#7C3AED' }}>Premium</Txt>
                </View>
              )}
              {c.listingTier === 'basic' && (
                <View style={{ backgroundColor: Colors.infoBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Txt w="semibold" style={{ fontSize: 12, color: Colors.info }}>Podstawowy</Txt>
                </View>
              )}
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 20, marginTop: 16 }}>
            <StatItem icon="map-pin" value={c.city} />
            {c.rating !== undefined && (
              <StatItem icon="star" value={`${c.rating.toFixed(1)} (${c.reviewCount})`} />
            )}
            {c.yearsExperience !== undefined && (
              <StatItem icon="calendar" value={`${c.yearsExperience} lat`} />
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          <Section title="Opis">
            <Txt style={{ fontSize: 14, color: Colors.text, lineHeight: 22 }}>
              {c.longDescription ?? c.shortDescription}
            </Txt>
          </Section>

          <Section title="Specjalizacje">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {c.specialties.map((s) => (
                <View
                  key={s.categoryId}
                  style={{
                    backgroundColor: Colors.surfaceAlt,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Txt w="medium" style={{ fontSize: 13, color: Colors.text }}>{s.categoryName}</Txt>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Zasięg usług">
            <View style={{ gap: 6 }}>
              <InfoRow icon="map-pin" text={`${c.serviceArea.city}${c.serviceArea.radiusKm ? ` (+${c.serviceArea.radiusKm} km)` : ''}`} />
              {(c.serviceArea.regions ?? []).length > 0 && (
                <InfoRow icon="globe" text={`Województwo: ${c.serviceArea.regions!.join(', ')}`} />
              )}
            </View>
          </Section>

          <Section title="Informacje">
            <View style={{ gap: 6 }}>
              <InfoRow
                icon="package"
                text={c.materialsIncluded ? 'Materiały wliczone w cenę' : 'Materiały po stronie klienta'}
              />
              <InfoRow
                icon="briefcase"
                text={`Zlecenia: ${c.jobScales.map((s) => s === 'small' ? 'małe' : s === 'medium' ? 'średnie' : 'duże').join(', ')}`}
              />
              {c.responseTimeHours !== undefined && (
                <InfoRow
                  icon="clock"
                  text={`Czas odpowiedzi: ~${c.responseTimeHours < 24 ? `${c.responseTimeHours}h` : `${Math.round(c.responseTimeHours / 24)} dni`}`}
                />
              )}
              <InfoRow
                icon={c.availableSoon ? 'check-circle' : 'x-circle'}
                text={c.availableSoon ? 'Dostępny wkrótce' : 'Zajęty — może być wolny później'}
                color={c.availableSoon ? Colors.success : Colors.textMuted}
              />
            </View>
          </Section>

          {c.verificationStatus === 'verified' && (
            <View
              style={{
                backgroundColor: Colors.successBg,
                borderRadius: 14,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Feather name="shield" size={18} color={Colors.success} />
              <View style={{ flex: 1 }}>
                <Txt w="semibold" style={{ fontSize: 13, color: Colors.success }}>Zweryfikowany profil</Txt>
                <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>
                  Dane firmy zostały sprawdzone przez moderację
                </Txt>
              </View>
            </View>
          )}

          <View
            style={{
              backgroundColor: Colors.surfaceAlt,
              borderRadius: 14,
              padding: 14,
            }}
          >
            <Txt style={{ fontSize: 12, color: Colors.textMuted, lineHeight: 18 }}>
              Ostateczna cena i warunki są ustalane bezpośrednio z fachowcem. Remont Asystent nie pośredniczy w płatnościach ani nie odpowiada za jakość wykonanych prac.
            </Txt>
          </View>

          <View style={{ height: 16 }} />

          {c.galleryUrls && c.galleryUrls.length > 0 && (
            <Section title="Galeria">
              <View
                style={{
                  backgroundColor: Colors.surfaceAlt,
                  borderRadius: 14,
                  padding: 32,
                  alignItems: 'center',
                }}
              >
                <Feather name="image" size={24} color={Colors.textMuted} />
                <Txt style={{ fontSize: 13, color: Colors.textMuted, marginTop: 8 }}>
                  Galeria zdjęć realizacji
                </Txt>
              </View>
            </Section>
          )}

          <Section title="Opinie">
            <View
              style={{
                backgroundColor: Colors.surfaceAlt,
                borderRadius: 14,
                padding: 24,
                alignItems: 'center',
              }}
            >
              <Feather name="message-circle" size={24} color={Colors.textMuted} />
              <Txt style={{ fontSize: 13, color: Colors.textMuted, marginTop: 8 }}>
                {c.reviewCount} opinii — szczegóły wkrótce
              </Txt>
            </View>
          </Section>
        </View>
      </ScrollView>

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
        {isHouseBuild && (
          <View style={{ marginBottom: 8 }}>
            <Button
              label="Dodaj do krotkiej listy etapu"
              variant="secondary"
              onPress={async () => {
                try {
                  await houseBuildContractorsRepo.addToShortlist(
                    projectId!, stageKey!, c.id, c.displayName, ''
                  );
                  Alert.alert('Dodano', `${c.displayName} dodany do krotkiej listy etapu.`);
                } catch (err) {
                  console.error('Add to shortlist error:', err);
                  Alert.alert('Blad', 'Nie udalo sie dodac do listy.');
                }
              }}
            />
          </View>
        )}
        <Button
          label="Wyslij zapytanie"
          variant="primary"
          onPress={() =>
            router.push({
              pathname: '/contractor/send-request',
              params: { contractorId: c.id, requestId },
            })
          }
        />
      </View>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Txt w="bold" style={{ fontSize: 16, color: Colors.text, marginBottom: 10 }}>{title}</Txt>
      {children}
    </View>
  );
}

function StatItem({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Feather name={icon as any} size={14} color={Colors.textMuted} />
      <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>{value}</Txt>
    </View>
  );
}

function InfoRow({ icon, text, color }: { icon: string; text: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Feather name={icon as any} size={14} color={color ?? Colors.textMuted} />
      <Txt style={{ fontSize: 13, color: Colors.text, flex: 1 }}>{text}</Txt>
    </View>
  );
}
