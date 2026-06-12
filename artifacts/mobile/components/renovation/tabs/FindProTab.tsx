import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { useContractor } from '@/context/ContractorContext';
import { CATEGORIES } from '@/data/categories';
import type { RenovationJob } from '@/types/domain';
import type { ContractorProfile } from '@/types/contractor';

interface FindProTabProps {
  job: RenovationJob;
}

/**
 * Match logic (Faza 5):
 *   1. Per-job: `specializedJobIds` zawiera job.id → najwyższe dopasowanie.
 *   2. Fallback: `specialties[*].categoryId === job.categoryId`.
 *
 * Sortujemy: per-job match → promowani → reszta. Limit do 5 kart na zakładce.
 */
function matchesJob(c: ContractorProfile, job: RenovationJob): { match: boolean; isPerJob: boolean } {
  const perJob = c.specializedJobIds?.includes(job.id) ?? false;
  if (perJob) return { match: true, isPerJob: true };
  const catMatch = c.specialties.some((s) => s.categoryId === job.categoryId);
  return { match: catMatch, isPerJob: false };
}

export function FindProTab({ job }: FindProTabProps) {
  const { t } = useLanguage();
  const { contractors } = useContractor();
  const category = CATEGORIES.find((c) => c.id === job.categoryId);
  const proCost = job.costRules?.find((r) => r.isMaterialCost === false && r.unit?.includes('/m²'));

  const matches = contractors
    .map((c) => ({ contractor: c, ...matchesJob(c, job) }))
    .filter((m) => m.match)
    .sort((a, b) => {
      if (a.isPerJob !== b.isPerJob) return a.isPerJob ? -1 : 1;
      if (a.contractor.isPromoted !== b.contractor.isPromoted) return a.contractor.isPromoted ? -1 : 1;
      return (b.contractor.rating ?? 0) - (a.contractor.rating ?? 0);
    })
    .slice(0, 5);

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
        {t('job.detail.findPro.title')}
      </Txt>
      <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>
        {t('job.detail.findPro.subtitle', { category: category?.name ?? job.name })}
      </Txt>

      {proCost && (
        <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BFDBFE' }}>
          <Txt style={{ fontSize: 11, color: Colors.info }}>{t('job.detail.findPro.estCostTitle')}</Txt>
          <Txt w="bold" style={{ fontSize: 16, color: '#1e40af', marginTop: 2 }}>
            {t('job.detail.findPro.estCostRange', {
              min: proCost.amountMin,
              max: proCost.amountMax,
              unit: proCost.unit ?? '',
            })}
          </Txt>
          {proCost.notes && (
            <Txt style={{ fontSize: 11, color: '#1e3a8a', marginTop: 4 }}>{proCost.notes}</Txt>
          )}
        </View>
      )}

      {matches.length > 0 ? (
        <View style={{ gap: 8 }}>
          {matches.map(({ contractor, isPerJob }) => (
            <TouchableOpacity
              key={contractor.id}
              onPress={() => router.push({ pathname: '/contractor/[id]', params: { id: contractor.id } })}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                backgroundColor: Colors.surface,
                borderRadius: 14,
                padding: 12,
                borderWidth: 1,
                borderColor: isPerJob ? Colors.primary : Colors.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isPerJob ? Colors.primaryBg : Colors.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="user" size={18} color={isPerJob ? Colors.primary : Colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }} numberOfLines={1}>
                    {contractor.displayName}
                  </Txt>
                  {isPerJob && (
                    <View style={{ backgroundColor: Colors.primary, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                      <Txt style={{ fontSize: 9, color: '#fff' }} w="semibold">★ DOPASOWANY</Txt>
                    </View>
                  )}
                  {contractor.isPromoted && !isPerJob && (
                    <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                      <Txt style={{ fontSize: 9, color: '#92400E' }} w="semibold">Promowany</Txt>
                    </View>
                  )}
                </View>
                <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 1 }} numberOfLines={1}>
                  {contractor.city}
                  {contractor.rating ? ` · ⭐ ${contractor.rating.toFixed(1)} (${contractor.reviewCount})` : ''}
                </Txt>
                {contractor.shortDescription && (
                  <Txt style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                    {contractor.shortDescription}
                  </Txt>
                )}
              </View>
              <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Feather name="users" size={32} color={Colors.textMuted} />
          <Txt style={{ fontSize: 13, color: Colors.textMuted, marginTop: 8, textAlign: 'center' }}>
            {t('job.detail.findPro.empty')}
          </Txt>
        </View>
      )}

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/contractor',
            params: { categoryId: job.categoryId, jobId: job.id },
          })
        }
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: Colors.primary,
          borderRadius: 12,
          padding: 14,
        }}
      >
        <Feather name="send" size={16} color="#fff" />
        <Txt w="bold" style={{ fontSize: 14, color: '#fff' }}>
          {t('job.detail.findPro.searchCta')}
        </Txt>
      </TouchableOpacity>
    </View>
  );
}
