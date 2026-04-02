import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, Alert, Modal, TextInput } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useContractor } from '@/context/ContractorContext';
import { LISTING_TIER_LABELS, VERIFICATION_BADGES, REPORT_REASON_LABELS, CONTRACTOR_TRUST_INFO } from '@/types/contractor';
import type { ReportReason, ContractorReviewSummary } from '@/types/contractor';
import { houseBuildContractorsRepo } from '@/db/repositories/house-build-contractors.repo';
import { contractorReportsRepo } from '@/db/repositories/contractor-reports.repo';
import { contractorBlocksRepo } from '@/db/repositories/contractor-blocks.repo';
import { contractorReviewsRepo } from '@/db/repositories/contractor-reviews.repo';
import { TrustBadge, PromotedLabel } from '@/components/contractor/TrustBadge';
import { ReviewSection } from '@/components/contractor/ReviewSection';
import { isContractorVerified, computeProfileCompleteness } from '@/features/contractor/contractor-trust';

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
  const { getContractorById, isContractorSaved, toggleSaveContractor, refreshBlockedIds } = useContractor();
  const c = getContractorById(id);
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;
  const saved = c ? isContractorSaved(c.id) : false;

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | null>(null);
  const [reportNote, setReportNote] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<ContractorReviewSummary | null>(null);

  const loadExtras = useCallback(async () => {
    if (!id) return;
    try {
      const [blocked, summary] = await Promise.all([
        contractorBlocksRepo.isBlocked(id),
        contractorReviewsRepo.getSummary(id),
      ]);
      setIsBlocked(blocked);
      setReviewSummary(summary);
    } catch (err) {
      console.error('Load extras error:', err);
    }
  }, [id]);

  useEffect(() => { loadExtras(); }, [loadExtras]);

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

  const verified = isContractorVerified(c.verificationStatus);
  const completeness = computeProfileCompleteness(c);
  const badge = VERIFICATION_BADGES[c.verificationStatus];

  const handleReport = async () => {
    if (!reportReason) {
      Alert.alert('Blad', 'Wybierz powod zgloszenia.');
      return;
    }
    try {
      await contractorReportsRepo.create(c.id, reportReason, reportNote.trim());
      setShowReportModal(false);
      setReportReason(null);
      setReportNote('');
      Alert.alert('Dziekujemy', 'Zgloszenie zostalo przyjete. Nasz zespol zweryfikuje je w ciagu 48 godzin.');
    } catch (err) {
      console.error('Report error:', err);
      Alert.alert('Blad', 'Nie udalo sie wyslac zgloszenia.');
    }
  };

  const handleBlock = () => {
    Alert.alert(
      isBlocked ? 'Odblokuj profil' : 'Zablokuj profil',
      isBlocked
        ? 'Czy chcesz przywrocic ten profil w wynikach wyszukiwania?'
        : 'Zablokowany profil nie bedzie sie pojawial w wynikach wyszukiwania.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: isBlocked ? 'Odblokuj' : 'Zablokuj',
          style: isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              if (isBlocked) { await contractorBlocksRepo.unblock(c.id); }
              else { await contractorBlocksRepo.block(c.id); }
              setIsBlocked(!isBlocked);
              await refreshBlockedIds();
            } catch (err) { console.error('Block error:', err); }
          },
        },
      ]
    );
  };

  const handleFlagReview = (reviewId: string) => {
    Alert.alert('Zglos opinie', 'Czy chcesz zglosic te opinie do moderacji?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Zglos', style: 'destructive', onPress: async () => {
        try {
          await contractorReviewsRepo.flagReview(reviewId, 'Zgloszone przez uzytkownika');
          await loadExtras();
          Alert.alert('Dziekujemy', 'Opinia zostala zgloszona.');
        } catch (err) { console.error('Flag review error:', err); }
      }},
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: c.displayName,
          headerBackTitle: 'Wroc',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => toggleSaveContractor(c.id)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Feather name="heart" size={22} color={saved ? Colors.danger : Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowReportModal(true)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
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
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Txt w="bold" style={{ fontSize: 32, color: Colors.primary }}>{c.displayName.charAt(0)}</Txt>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Txt w="bold" style={{ fontSize: 20, color: Colors.text, textAlign: 'center' }}>{c.displayName}</Txt>
            {verified && <Feather name="check-circle" size={18} color={Colors.success} />}
          </View>

          {c.companyName && c.companyName !== c.displayName && (
            <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>{c.companyName}</Txt>
          )}

          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <TrustBadge status={c.verificationStatus} size="medium" />
            <PromotedLabel isPromoted={c.isPromoted} listingTier={c.listingTier} size="medium" />
          </View>

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
            <Txt style={{ fontSize: 14, color: Colors.text, lineHeight: 22 }}>{c.longDescription ?? c.shortDescription}</Txt>
          </Section>

          <Section title="Specjalizacje">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {c.specialties.map((s) => (
                <View key={s.categoryId} style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Txt w="medium" style={{ fontSize: 13, color: Colors.text }}>{s.categoryName}</Txt>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Zasieg uslug">
            <View style={{ gap: 6 }}>
              <InfoRow icon="map-pin" text={`${c.serviceArea.city}${c.serviceArea.radiusKm ? ` (+${c.serviceArea.radiusKm} km)` : ''}`} />
              {(c.serviceArea.regions ?? []).length > 0 && (
                <InfoRow icon="globe" text={`Wojewodztwo: ${c.serviceArea.regions!.join(', ')}`} />
              )}
            </View>
          </Section>

          <Section title="Informacje">
            <View style={{ gap: 6 }}>
              <InfoRow icon="package" text={c.materialsIncluded ? 'Materialy wliczone w cene' : 'Materialy po stronie klienta'} />
              <InfoRow icon="briefcase" text={`Zlecenia: ${c.jobScales.map((s) => s === 'small' ? 'male' : s === 'medium' ? 'srednie' : 'duze').join(', ')}`} />
              {c.responseTimeHours !== undefined && (
                <InfoRow icon="clock" text={`Czas odpowiedzi: ~${c.responseTimeHours < 24 ? `${c.responseTimeHours}h` : `${Math.round(c.responseTimeHours / 24)} dni`}`} />
              )}
              <InfoRow
                icon={c.availableSoon ? 'check-circle' : 'x-circle'}
                text={c.availableSoon ? 'Dostepny wkrotce' : 'Zajety - moze byc wolny pozniej'}
                color={c.availableSoon ? Colors.success : Colors.textMuted}
              />
              {c.currentLeadCapacity && c.currentLeadCapacity !== 'unknown' && (
                <InfoRow
                  icon="activity"
                  text={c.currentLeadCapacity === 'available' ? 'Przyjmuje nowe zlecenia' : c.currentLeadCapacity === 'busy' ? 'Zajety, ale otwarty na kontakt' : 'Aktualnie pelne obciazenie'}
                  color={c.currentLeadCapacity === 'available' ? Colors.success : c.currentLeadCapacity === 'full' ? Colors.danger : Colors.textMuted}
                />
              )}
            </View>
          </Section>

          <View style={{ backgroundColor: badge.color + '10', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Feather name="shield" size={18} color={badge.color} />
            <View style={{ flex: 1 }}>
              <Txt w="semibold" style={{ fontSize: 13, color: badge.color }}>{badge.label}</Txt>
              <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{badge.explanation}</Txt>
            </View>
          </View>

          {completeness.percentage < 80 && (
            <View style={{ backgroundColor: '#FFFBEB', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#FDE68A' }}>
              <Feather name="info" size={14} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Txt style={{ fontSize: 11, color: '#D97706' }}>
                  Profil uzupelniony w {completeness.percentage}%. Brakuje: {completeness.missing.slice(0, 3).join(', ')}.
                </Txt>
              </View>
            </View>
          )}

          <View style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 14, padding: 14 }}>
            <Txt style={{ fontSize: 12, color: Colors.textMuted, lineHeight: 18 }}>
              {CONTRACTOR_TRUST_INFO.verificationExplanation}
            </Txt>
          </View>

          {c.galleryUrls && c.galleryUrls.length > 0 && (
            <Section title="Galeria">
              <View style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 14, padding: 32, alignItems: 'center' }}>
                <Feather name="image" size={24} color={Colors.textMuted} />
                <Txt style={{ fontSize: 13, color: Colors.textMuted, marginTop: 8 }}>Galeria zdjec realizacji</Txt>
              </View>
            </Section>
          )}

          <Section title="Opinie">
            <ReviewSection summary={reviewSummary} onFlagReview={handleFlagReview} />
          </Section>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setShowReportModal(true)}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#FEF2F2', borderRadius: 8, paddingVertical: 8 }}
            >
              <Feather name="flag" size={12} color="#DC2626" />
              <Txt style={{ fontSize: 11, color: '#DC2626' }}>Zglos profil</Txt>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBlock}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: isBlocked ? '#ECFDF5' : '#F8FAFC', borderRadius: 8, paddingVertical: 8, borderWidth: 1, borderColor: isBlocked ? '#BBF7D0' : '#E2E8F0' }}
            >
              <Feather name={isBlocked ? 'eye' : 'eye-off'} size={12} color={isBlocked ? '#059669' : Colors.textMuted} />
              <Txt style={{ fontSize: 11, color: isBlocked ? '#059669' : Colors.textMuted }}>{isBlocked ? 'Odblokuj' : 'Zablokuj'}</Txt>
            </TouchableOpacity>
          </View>

          {c.isPromoted && (
            <View style={{ backgroundColor: '#F5F3FF', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#DDD6FE' }}>
              <Txt style={{ fontSize: 10, color: '#7C3AED' }}>{CONTRACTOR_TRUST_INFO.promotedExplanation}</Txt>
            </View>
          )}

          <View style={{ height: 16 }} />
        </View>
      </ScrollView>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border,
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: bottomPad,
      }}>
        {isHouseBuild && (
          <View style={{ marginBottom: 8 }}>
            <Button
              label="Dodaj do krotkiej listy etapu"
              variant="secondary"
              onPress={async () => {
                try {
                  await houseBuildContractorsRepo.addToShortlist(projectId!, stageKey!, c.id, c.displayName, '');
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
          onPress={() => router.push({ pathname: '/contractor/send-request', params: { contractorId: c.id, requestId } })}
        />
      </View>

      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>Zglos profil</Txt>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Feather name="x" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 8 }}>Powod zgloszenia</Txt>
            <ScrollView style={{ maxHeight: 200 }}>
              {(Object.entries(REPORT_REASON_LABELS) as [ReportReason, string][]).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setReportReason(key)}
                  style={{
                    backgroundColor: reportReason === key ? '#FEF2F2' : '#F8FAFC',
                    borderRadius: 8, padding: 10, marginBottom: 4,
                    borderWidth: 1, borderColor: reportReason === key ? '#FECACA' : '#E2E8F0',
                  }}
                >
                  <Txt style={{ fontSize: 12, color: reportReason === key ? '#DC2626' : Colors.text }}>{label}</Txt>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginTop: 12, marginBottom: 6 }}>Dodatkowy opis (opcjonalnie)</Txt>
            <TextInput
              style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 60, textAlignVertical: 'top' }}
              value={reportNote}
              onChangeText={setReportNote}
              multiline
              placeholder="Opisz problem..."
              placeholderTextColor={Colors.textMuted}
            />

            <TouchableOpacity
              onPress={handleReport}
              style={{ backgroundColor: '#DC2626', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12 }}
            >
              <Txt w="semibold" style={{ fontSize: 13, color: '#FFFFFF' }}>Wyslij zgloszenie</Txt>
            </TouchableOpacity>

            <Txt style={{ fontSize: 9, color: Colors.textMuted, textAlign: 'center', marginTop: 8 }}>
              {CONTRACTOR_TRUST_INFO.moderationNote}
            </Txt>
          </View>
        </View>
      </Modal>
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
