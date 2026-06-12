import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/utils/calculator';
import { ShopPriceList } from '@/components/renovation/ShopPriceList';
import { resolveThumbnail } from '@/components/renovation/thumbnail-resolver';
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
          const purchaseUnit = (mat as MaterialItem).purchaseUnit;
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
                {thumbnailUrl ? (
                  <Image
                    source={{ uri: thumbnailUrl }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 10,
                      backgroundColor: Colors.surface,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="package" size={22} color={Colors.textMuted} />
                  </View>
                )}
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
                  {mat.pricePerUnit > 0 && (
                    <Txt w="semibold" style={{ fontSize: 12, color: Colors.textMuted }}>
                      {t('job.detail.cost.estPrice', { price: formatCurrency(mat.pricePerUnit) })}
                    </Txt>
                  )}
                </View>
              </View>

              {notes && (
                <Txt style={{ fontSize: 11, color: Colors.textSecondary, lineHeight: 16 }}>
                  {notes}
                </Txt>
              )}

              <ShopPriceList prices={shopPrices ?? []} unitLabel={purchaseUnit} />
            </View>
          );
        })}
      </View>
    </View>
  );
}
