import { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useContractor } from '@/context/ContractorContext';
import { contractorReportsRepo } from '@/db/repositories/contractor-reports.repo';
import { contractorReviewsRepo } from '@/db/repositories/contractor-reviews.repo';
import { contractorPromotionsRepo } from '@/db/repositories/contractor-promotions.repo';
import { contractorBlocksRepo } from '@/db/repositories/contractor-blocks.repo';
import { checkProfileHealth } from '@/features/contractor/contractor-trust';
import type { ContractorContentReport, ContractorReview, ContractorPromotion, ContractorBlock } from '@/types/contractor';
import { MODERATION_STATUS_LABELS, REPORT_REASON_LABELS, ACCOUNT_STATE_LABELS } from '@/types/contractor';
import type { ReportReason, ModerationStatus } from '@/types/contractor';

type Tab = 'reports' | 'verification' | 'promoted' | 'suspended' | 'flagged-reviews' | 'incomplete' | 'blocked' | 'queue';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'reports', label: 'Zgloszenia', icon: 'flag' },
  { key: 'verification', label: 'Weryfikacja', icon: 'check-circle' },
  { key: 'promoted', label: 'Promowane', icon: 'star' },
  { key: 'suspended', label: 'Zawieszone', icon: 'alert-circle' },
  { key: 'flagged-reviews', label: 'Opinie', icon: 'message-square' },
  { key: 'incomplete', label: 'Niekompletne', icon: 'alert-triangle' },
  { key: 'blocked', label: 'Zablokowane', icon: 'eye-off' },
  { key: 'queue', label: 'Kolejka', icon: 'list' },
];

export default function ContractorAdminBoardScreen() {
  const insets = useSafeAreaInsets();
  const { contractors } = useContractor();
  const [activeTab, setActiveTab] = useState<Tab>('reports');
  const [loading, setLoading] = useState(true);

  const [reports, setReports] = useState<ContractorContentReport[]>([]);
  const [flaggedReviews, setFlaggedReviews] = useState<ContractorReview[]>([]);
  const [promotions, setPromotions] = useState<ContractorPromotion[]>([]);
  const [blocks, setBlocks] = useState<ContractorBlock[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, fr, p, b] = await Promise.all([
        contractorReportsRepo.getAll(),
        contractorReviewsRepo.getFlagged(),
        contractorPromotionsRepo.getActive(),
        contractorBlocksRepo.getAll(),
      ]);
      setReports(r);
      setFlaggedReviews(fr);
      setPromotions(p);
      setBlocks(b);
    } catch (err) {
      console.error('Admin board load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingVerification = contractors.filter((c) => c.verificationStatus === 'unverified');
  const suspended = contractors.filter((c) => c.verificationStatus === 'suspended');
  const incomplete = contractors.filter((c) => {
    const health = checkProfileHealth(c);
    return !health.isRankable;
  });

  const openReports = reports.filter((r) => r.moderationStatus === 'open' || r.moderationStatus === 'under-review');

  const tabCounts: Record<Tab, number> = {
    reports: openReports.length,
    verification: pendingVerification.length,
    promoted: promotions.length,
    suspended: suspended.length,
    'flagged-reviews': flaggedReviews.length,
    incomplete: incomplete.length,
    blocked: blocks.length,
    queue: openReports.length + flaggedReviews.length,
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Panel administracji' }} />
      <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={{ padding: 16 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
            <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>Panel wykonawcow</Txt>
            <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>Moderacja, weryfikacja i przeglad profili</Txt>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <StatBox label="Razem" value={contractors.length} color="#2563EB" />
              <StatBox label="Zgloszenia" value={openReports.length} color="#DC2626" />
              <StatBox label="Promowane" value={promotions.length} color="#7C3AED" />
              <StatBox label="Zawieszone" value={suspended.length} color="#D97706" />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={{
                    backgroundColor: activeTab === tab.key ? '#2563EB' : '#F8FAFC',
                    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                    borderWidth: 1, borderColor: activeTab === tab.key ? '#2563EB' : '#E2E8F0',
                  }}
                >
                  <Feather name={tab.icon as any} size={12} color={activeTab === tab.key ? '#FFFFFF' : Colors.textMuted} />
                  <Txt style={{ fontSize: 11, color: activeTab === tab.key ? '#FFFFFF' : Colors.text }}>{tab.label}</Txt>
                  {tabCounts[tab.key] > 0 && (
                    <View style={{ backgroundColor: activeTab === tab.key ? '#FFFFFF30' : '#DC262620', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                      <Txt style={{ fontSize: 9, color: activeTab === tab.key ? '#FFFFFF' : '#DC2626' }}>{tabCounts[tab.key]}</Txt>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {loading && <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />}

          {!loading && activeTab === 'reports' && (
            <View>
              {openReports.length === 0 && <EmptyCard text="Brak otwartych zgloszen" icon="flag" />}
              {openReports.map((r) => (
                <View key={r.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>{REPORT_REASON_LABELS[r.reason as ReportReason] ?? r.reason}</Txt>
                    <View style={{ backgroundColor: r.moderationStatus === 'open' ? '#FEF2F2' : '#FFFBEB', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Txt style={{ fontSize: 9, color: r.moderationStatus === 'open' ? '#DC2626' : '#D97706' }}>
                        {MODERATION_STATUS_LABELS[r.moderationStatus as ModerationStatus] ?? r.moderationStatus}
                      </Txt>
                    </View>
                  </View>
                  {r.reporterNote ? <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{r.reporterNote}</Txt> : null}
                  <Txt style={{ fontSize: 9, color: Colors.textMuted, marginTop: 4 }}>{new Date(r.createdAt).toLocaleDateString('pl-PL')}</Txt>
                </View>
              ))}
            </View>
          )}

          {!loading && activeTab === 'verification' && (
            <View>
              {pendingVerification.length === 0 && <EmptyCard text="Brak profili oczekujacych na weryfikacje" icon="check-circle" />}
              {pendingVerification.map((c) => (
                <ProfileRow key={c.id} name={c.displayName} city={c.city} detail={`Typ: ${c.type === 'company' ? 'Firma' : 'Osoba'}`} />
              ))}
            </View>
          )}

          {!loading && activeTab === 'promoted' && (
            <View>
              {promotions.length === 0 && <EmptyCard text="Brak aktywnych promocji" icon="star" />}
              {promotions.map((p) => (
                <View key={p.id} style={{ backgroundColor: '#F5F3FF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#DDD6FE', marginBottom: 6 }}>
                  <Txt w="semibold" style={{ fontSize: 12, color: '#7C3AED' }}>{p.label || p.scope}</Txt>
                  <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>
                    {p.startDate}{p.endDate ? ` - ${p.endDate}` : ' (bez daty konca)'} | Priorytet: {p.priority}
                  </Txt>
                </View>
              ))}
            </View>
          )}

          {!loading && activeTab === 'suspended' && (
            <View>
              {suspended.length === 0 && <EmptyCard text="Brak zawieszonych profili" icon="alert-circle" />}
              {suspended.map((c) => (
                <ProfileRow key={c.id} name={c.displayName} city={c.city} detail="Zawieszony" color="#DC2626" />
              ))}
            </View>
          )}

          {!loading && activeTab === 'flagged-reviews' && (
            <View>
              {flaggedReviews.length === 0 && <EmptyCard text="Brak zgloszonych opinii" icon="message-square" />}
              {flaggedReviews.map((r) => (
                <View key={r.id} style={{ backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FECACA', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 2, marginBottom: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Feather key={s} name="star" size={10} color={s <= r.rating ? '#D97706' : '#E2E8F0'} />
                    ))}
                  </View>
                  {r.comment && <Txt style={{ fontSize: 11, color: Colors.text }}>{r.comment}</Txt>}
                  <Txt style={{ fontSize: 9, color: '#DC2626', marginTop: 2 }}>Powod: {r.flagReason ?? 'Nie podano'}</Txt>
                </View>
              ))}
            </View>
          )}

          {!loading && activeTab === 'incomplete' && (
            <View>
              {incomplete.length === 0 && <EmptyCard text="Wszystkie profile sa kompletne" icon="check" />}
              {incomplete.map((c) => {
                const health = checkProfileHealth(c);
                return (
                  <View key={c.id} style={{ backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 6 }}>
                    <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>{c.displayName}</Txt>
                    <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{c.city}</Txt>
                    {health.issues.slice(0, 3).map((issue, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Feather name={issue.severity === 'error' ? 'x-circle' : issue.severity === 'warning' ? 'alert-triangle' : 'info'} size={10} color={issue.severity === 'error' ? '#DC2626' : issue.severity === 'warning' ? '#D97706' : '#2563EB'} />
                        <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{issue.message}</Txt>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          )}

          {!loading && activeTab === 'blocked' && (
            <View>
              {blocks.length === 0 && <EmptyCard text="Brak zablokowanych profili" icon="eye-off" />}
              {blocks.map((b) => (
                <View key={b.id} style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 }}>
                  <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>ID: {b.contractorId}</Txt>
                  {b.reason && <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{b.reason}</Txt>}
                  <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{new Date(b.createdAt).toLocaleDateString('pl-PL')}</Txt>
                </View>
              ))}
            </View>
          )}

          {!loading && activeTab === 'queue' && (
            <View>
              {openReports.length + flaggedReviews.length === 0 && <EmptyCard text="Kolejka moderacji pusta" icon="check" />}
              {openReports.length > 0 && (
                <View style={{ marginBottom: 12 }}>
                  <Txt w="semibold" style={{ fontSize: 13, color: Colors.text, marginBottom: 6 }}>Zgloszenia profili ({openReports.length})</Txt>
                  {openReports.slice(0, 5).map((r) => (
                    <View key={r.id} style={{ backgroundColor: '#FEF2F2', borderRadius: 8, padding: 8, marginBottom: 4 }}>
                      <Txt style={{ fontSize: 11, color: '#DC2626' }}>{REPORT_REASON_LABELS[r.reason as ReportReason] ?? r.reason}</Txt>
                    </View>
                  ))}
                </View>
              )}
              {flaggedReviews.length > 0 && (
                <View>
                  <Txt w="semibold" style={{ fontSize: 13, color: Colors.text, marginBottom: 6 }}>Zgloszone opinie ({flaggedReviews.length})</Txt>
                  {flaggedReviews.slice(0, 5).map((r) => (
                    <View key={r.id} style={{ backgroundColor: '#FFFBEB', borderRadius: 8, padding: 8, marginBottom: 4 }}>
                      <Txt style={{ fontSize: 11, color: '#D97706' }}>{r.comment?.slice(0, 60) ?? 'Brak tresci'}</Txt>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: color + '10', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center' }}>
      <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{label}</Txt>
      <Txt w="bold" style={{ fontSize: 16, color }}>{value}</Txt>
    </View>
  );
}

function EmptyCard({ text, icon }: { text: string; icon: string }) {
  return (
    <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
      <Feather name={icon as any} size={20} color={Colors.textMuted} />
      <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 6 }}>{text}</Txt>
    </View>
  );
}

function ProfileRow({ name, city, detail, color }: { name: string; city: string; detail: string; color?: string }) {
  return (
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 }}>
      <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>{name}</Txt>
      <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{city}</Txt>
      <Txt style={{ fontSize: 10, color: color ?? Colors.textMuted, marginTop: 2 }}>{detail}</Txt>
    </View>
  );
}
