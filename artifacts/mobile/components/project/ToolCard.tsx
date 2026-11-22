import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/utils/calculator';
import type { ToolItem } from '@/types/domain';
import type { ToolRequirement } from '@/types/engine';
import { ProductImage } from './ProductImage';
import { JobProductPrices } from '@/components/renovation/JobProductPrices';
import { reviewedJobProduct } from '@/features/pricing/jobProduct';
import { resolveThumbnail } from '@/components/renovation/thumbnail-resolver';

type AnyTool = ToolItem | ToolRequirement;

export function ToolCard({ tool }: { tool: AnyTool }) {
  const { t } = useLanguage();
  const product = reviewedJobProduct(tool as ToolItem, 'tool');
  return (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 14,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 12 }}>
      <ProductImage uri={product?.imageUrl ?? resolveThumbnail(tool as ToolItem)} name={product?.name ?? tool.name} size={64} />
      <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>
            {tool.name}
          </Txt>
          {!tool.required && (
            <View style={{ paddingHorizontal: 7, paddingVertical: 2, backgroundColor: Colors.surfaceAlt, borderRadius: 6 }}>
              <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{t('cmp.ToolCard.optional')}</Txt>
            </View>
          )}
          {tool.rentable && (
            <View style={{ paddingHorizontal: 7, paddingVertical: 2, backgroundColor: Colors.infoBg, borderRadius: 6 }}>
              <Txt style={{ fontSize: 11, color: Colors.info }}>{t('cmp.ToolCard.rentable')}</Txt>
            </View>
          )}
        </View>

        {tool.notes && (
          <Txt style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 17 }}>
            {tool.notes}
          </Txt>
        )}

        {tool.estimatedRentCostPLN ? (
          <View style={{ marginTop: 2 }}>
            {tool.estimatedRentCostPLN && (
              <Txt style={{ fontSize: 12, color: Colors.info }}>
                {t('cmp.ToolCard.rent', { price: formatCurrency(tool.estimatedRentCostPLN) })}
              </Txt>
            )}
          </View>
        ) : null}

        {tool.safetyNote && (
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
              backgroundColor: Colors.warningBg,
              borderRadius: 8,
              padding: 8,
              alignItems: 'flex-start',
              marginTop: 4,
            }}
          >
            <Feather name="alert-triangle" size={12} color={Colors.warning} style={{ marginTop: 1 }} />
            <Txt style={{ flex: 1, fontSize: 11, color: '#92400e', lineHeight: 15 }}>
              {tool.safetyNote}
            </Txt>
          </View>
        )}
      </View>
      </View>
      <JobProductPrices product={product} links={(tool as ToolItem).shopPrices} />
    </View>
  );
}
