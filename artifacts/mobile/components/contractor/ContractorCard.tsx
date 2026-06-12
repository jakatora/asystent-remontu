import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type { ContractorProfile } from '@/types/contractor';
import { TrustBadge, PromotedLabel } from './TrustBadge';
import { isContractorVerified, getCompletionHint } from '@/features/contractor/contractor-trust';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  contractor: ContractorProfile;
  onPress: () => void;
  onSendRequest?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function ContractorCard({ contractor, onPress, onSendRequest, isSaved, onToggleSave }: Props) {
  const { t } = useLanguage();
  const c = contractor;
  const verified = isContractorVerified(c.verificationStatus);
  const completionHint = getCompletionHint(c);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: c.isPromoted ? '#DDD6FE' : Colors.border,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <TrustBadge status={c.verificationStatus} size="small" />
        <PromotedLabel isPromoted={c.isPromoted} listingTier={c.listingTier} size="small" />
        {c.listingTier === 'basic' && (
          <View style={{ backgroundColor: Colors.infoBg, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 }}>
            <Txt style={{ fontSize: 8, color: Colors.info }}>{t('cmp.ContractorCard.basic')}</Txt>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: Colors.primaryBg, alignItems: 'center',
            justifyContent: 'center', marginRight: 12,
          }}
        >
          <Txt w="bold" style={{ fontSize: 18, color: Colors.primary }}>
            {c.displayName.charAt(0)}
          </Txt>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Txt w="bold" style={{ fontSize: 15, color: Colors.text }} numberOfLines={1}>
              {c.displayName}
            </Txt>
            {verified && (
              <Feather name="check-circle" size={14} color={Colors.success} />
            )}
          </View>

          <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 6 }} numberOfLines={2}>
            {c.shortDescription}
          </Txt>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {c.specialties.slice(0, 3).map((s) => (
              <View
                key={s.categoryId}
                style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}
              >
                <Txt style={{ fontSize: 11, color: Colors.textSecondary }}>{s.categoryName}</Txt>
              </View>
            ))}
            {c.specialties.length > 3 && (
              <View style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Txt style={{ fontSize: 11, color: Colors.textMuted }}>+{c.specialties.length - 3}</Txt>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Feather name="map-pin" size={12} color={Colors.textMuted} />
              <Txt style={{ fontSize: 12, color: Colors.textMuted }}>{c.city}</Txt>
            </View>
            {c.rating !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Feather name="star" size={12} color={Colors.warning} />
                <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>{c.rating.toFixed(1)}</Txt>
                <Txt style={{ fontSize: 11, color: Colors.textMuted }}>({c.reviewCount})</Txt>
              </View>
            )}
            {c.availableSoon && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Feather name="clock" size={12} color={Colors.success} />
                <Txt style={{ fontSize: 12, color: Colors.success }}>{t('cmp.ContractorCard.available')}</Txt>
              </View>
            )}
          </View>

          {completionHint && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4, backgroundColor: '#FFFBEB', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
              <Feather name="info" size={9} color="#D97706" />
              <Txt style={{ fontSize: 8, color: '#D97706' }}>{completionHint}</Txt>
            </View>
          )}
        </View>

        {onToggleSave && (
          <TouchableOpacity onPress={onToggleSave} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ padding: 4 }}>
            <Feather name="heart" size={20} color={isSaved ? Colors.danger : Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {onSendRequest && (
        <TouchableOpacity
          onPress={onSendRequest}
          style={{ marginTop: 12, backgroundColor: Colors.primaryBg, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
          activeOpacity={0.8}
        >
          <Txt w="semibold" style={{ fontSize: 13, color: Colors.primary }}>{t('cmp.ContractorCard.sendRequest')}</Txt>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
