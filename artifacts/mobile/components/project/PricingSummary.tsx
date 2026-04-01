import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import { SummaryRow, Divider } from './SummaryRow';
import { PriceDisclaimer } from './PriceDisclaimer';
import { LaborPriceCard } from './LaborPriceCard';
import { MaterialPriceCard } from './MaterialPriceCard';
import { QualityTierSelector } from './QualityTierSelector';
import type { PricedBudgetEstimate, QualityTier } from '@/types/pricing';
import { hasLaborData, hasMaterialData } from '@/features/pricing';

interface PricingSummaryProps {
  estimate: PricedBudgetEstimate;
  jobId: string;
  qualityTier: QualityTier;
  onSelectTier: (tier: QualityTier) => void;
  onOverrideLabor: (laborId: string, pricePerUnit: number) => void;
  onResetLabor: (laborId: string) => void;
  onOverrideMaterial: (materialId: string, pricePerPackage: number) => void;
  onResetMaterial: (materialId: string) => void;
}

export function PricingSummary({
  estimate,
  jobId,
  qualityTier,
  onSelectTier,
  onOverrideLabor,
  onResetLabor,
  onOverrideMaterial,
  onResetMaterial,
}: PricingSummaryProps) {
  const hasLabor = hasLaborData(jobId);
  const hasMaterial = hasMaterialData(jobId);

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name="dollar-sign" size={18} color={Colors.primary} />
        <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>Kosztorys referencyjny</Txt>
      </View>

      <QualityTierSelector selected={qualityTier} onSelect={onSelectTier} />

      {hasLabor && estimate.laborDetails.length > 0 && (
        <View style={{ gap: 8 }}>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>Robocizna (fachowiec)</Txt>
          {estimate.laborDetails.map((l) => (
            <LaborPriceCard
              key={l.laborRef.id}
              item={l}
              onOverride={onOverrideLabor}
              onReset={onResetLabor}
            />
          ))}
        </View>
      )}

      {hasMaterial && estimate.materialDetails.length > 0 && (
        <View style={{ gap: 8 }}>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>
            Materiały referencyjne ({qualityTier === 'custom' ? 'własne' : qualityTier === 'better' ? 'premium' : qualityTier === 'economy' ? 'ekonom' : 'standard'})
          </Txt>
          {estimate.materialDetails.map((m) => (
            <MaterialPriceCard
              key={m.materialRef.id}
              item={m}
              onOverride={onOverrideMaterial}
              onReset={onResetMaterial}
            />
          ))}
        </View>
      )}

      {!hasLabor && (
        <View style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="users" size={14} color={Colors.textMuted} />
            <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>Robocizna</Txt>
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
            Dane o robociźnie dla tej pracy nie są jeszcze dostępne. Możesz wprowadzić własną cenę ręcznie.
          </Txt>
        </View>
      )}

      {!hasMaterial && (
        <View style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="package" size={14} color={Colors.textMuted} />
            <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>Materiały referencyjne</Txt>
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
            Ceny referencyjne materiałów dla tej pracy nie są jeszcze zmapowane. Korzystaj z listy zakupów kalkulatora.
          </Txt>
        </View>
      )}

      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.border,
          overflow: 'hidden',
        }}
      >
        <View style={{ padding: 14, backgroundColor: Colors.primaryBg }}>
          <Txt w="bold" style={{ fontSize: 15, color: Colors.primaryDark }}>Podsumowanie kosztorysu</Txt>
        </View>
        <SummaryRow
          icon="package"
          label="Materiały (referencyjne)"
          value={formatCurrency(estimate.materialsSubtotal)}
        />
        <Divider />
        <SummaryRow
          icon="users"
          label="Robocizna"
          value={estimate.laborSubtotalMin === estimate.laborSubtotalMax
            ? formatCurrency(estimate.laborSubtotalMin)
            : `${formatCurrency(estimate.laborSubtotalMin)}–${formatCurrency(estimate.laborSubtotalMax)}`
          }
          valueColor={Colors.warning}
        />
        {estimate.toolsSubtotal > 0 && (
          <>
            <Divider />
            <SummaryRow
              icon="tool"
              label="Narzędzia"
              value={formatCurrency(estimate.toolsSubtotal)}
              valueColor={Colors.info}
            />
          </>
        )}
        <Divider />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: Colors.primaryBg }}>
          <Txt w="bold" style={{ fontSize: 15, color: Colors.primaryDark }}>Łączny szacunek</Txt>
          <Txt w="bold" style={{ fontSize: 18, color: Colors.primary }}>
            {estimate.totalEstimateMin === estimate.totalEstimateMax
              ? formatCurrency(estimate.totalEstimateMin)
              : `${formatCurrency(estimate.totalEstimateMin)}–${formatCurrency(estimate.totalEstimateMax)}`
            }
          </Txt>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <Feather name="map-pin" size={12} color={Colors.textMuted} />
        <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
          Region bazowy: {estimate.regionLabel}
        </Txt>
      </View>

      <PriceDisclaimer regionLabel={estimate.regionLabel} lastUpdated={estimate.lastUpdated} />
    </View>
  );
}
