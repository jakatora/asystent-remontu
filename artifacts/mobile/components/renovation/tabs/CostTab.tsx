import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { JobProductPrices } from '@/components/renovation/JobProductPrices';
import { reviewedJobProduct } from '@/features/pricing/jobProduct';
import { resolveThumbnail } from '@/components/renovation/thumbnail-resolver';
import { ProductImage } from '@/components/project/ProductImage';
import type { RenovationJob, MaterialItem } from '@/types/domain';
import type { MaterialRequirement } from '@/types/engine';

type AnyMaterial = MaterialItem | MaterialRequirement;

interface CostTabProps {
  job: RenovationJob;
}

export function CostTab({ job }: CostTabProps) {
  const { t } = useLanguage();

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
        {t('job.detail.cost.heroNote')}
      </Txt>

      <TouchableOpacity
        onPress={() => router.push({ pathname: '/wizard', params: { jobId: job.id } })}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: Colors.primary,
          borderRadius: 12,
          padding: 14,
        }}
      >
        <Feather name="zap" size={18} color="#fff" />
        <Txt w="bold" style={{ fontSize: 14, color: '#fff', flex: 1 }}>
          {t('job.detail.cost.openCalc')}
        </Txt>
        <Feather name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>

      <View style={{ marginTop: 4 }}>
        <Txt w="bold" style={{ fontSize: 15, color: Colors.text, marginBottom: 8 }}>
          {t('job.detail.cost.materialsHeader')}
        </Txt>
        {(job.materials as readonly AnyMaterial[]).map((mat) => {
          const optional = (mat as MaterialItem).optional === true;
          const brand = (mat as MaterialItem).brand;
          const notes = (mat as MaterialItem).notes;
          const shopPrices = (mat as MaterialItem).shopPrices;
          const thumbnailUrl = resolveThumbnail(mat as MaterialItem);
          return (
            <View
              key={mat.id}
              style={{
                backgroundColor: Colors.surfaceAlt,
                borderRadius: 14,
                padding: 12,
                marginBottom: 10,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ProductImage uri={thumbnailUrl} name={mat.name} size={64} />
                <View style={{ flex: 1 }}>
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{mat.name}</Txt>
                  {brand && (
                    <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 1 }}>
                      {t('job.detail.cost.referenceProduct', { brand })}
                    </Txt>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {optional && (
                    <View style={{ backgroundColor: Colors.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{t('job.detail.cost.optional')}</Txt>
                    </View>
                  )}
                </View>
              </View>

              {notes && (
                <Txt style={{ fontSize: 11, color: Colors.textSecondary, lineHeight: 16 }}>
                  {notes}
                </Txt>
              )}

              <JobProductPrices product={reviewedJobProduct(mat as MaterialItem,'material')} links={shopPrices} />
            </View>
          );
        })}
      </View>
    </View>
  );
}
