import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type { ContractorRequest } from '@/types/contractor';
import { REQUEST_STATUS_LABELS, BUDGET_RANGE_LABELS } from '@/types/contractor';
import { useLanguage } from '@/context/LanguageContext';

const STATUS_COLORS: Record<string, string> = {
  draft: Colors.textMuted,
  sent: Colors.info,
  viewed: Colors.warning,
  replied: Colors.success,
  accepted: Colors.success,
  declined: Colors.danger,
  expired: Colors.textMuted,
};

interface Props {
  request: ContractorRequest;
  onPress?: () => void;
}

export function RequestSummaryCard({ request, onPress }: Props) {
  const { t } = useLanguage();
  const statusColor = STATUS_COLORS[request.status] ?? Colors.textMuted;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Txt w="bold" style={{ fontSize: 15, color: Colors.text }} numberOfLines={1}>
            {request.categoryName ?? t('cmp.RequestSummary.defaultTitle')}
          </Txt>
          {request.jobName && (
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{request.jobName}</Txt>
          )}
        </View>
        <View style={{ backgroundColor: statusColor + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Txt w="semibold" style={{ fontSize: 11, color: statusColor }}>
            {REQUEST_STATUS_LABELS[request.status]}
          </Txt>
        </View>
      </View>

      <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 8 }} numberOfLines={2}>
        {request.workDescription}
      </Txt>

      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Feather name="map-pin" size={12} color={Colors.textMuted} />
          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>{request.city}</Txt>
        </View>
        {request.selectedContractorIds.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="users" size={12} color={Colors.textMuted} />
            <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
              {request.selectedContractorIds.length} {request.selectedContractorIds.length === 1 ? t('cmp.RequestSummary.contractorOne') : t('cmp.RequestSummary.contractorMany')}
            </Txt>
          </View>
        )}
        {request.preferredDate && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="calendar" size={12} color={Colors.textMuted} />
            <Txt style={{ fontSize: 12, color: Colors.textMuted }}>{request.preferredDate}</Txt>
          </View>
        )}
      </View>

      <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 8 }}>
        {new Date(request.updatedAt).toLocaleDateString('pl-PL')}
      </Txt>
    </TouchableOpacity>
  );
}
