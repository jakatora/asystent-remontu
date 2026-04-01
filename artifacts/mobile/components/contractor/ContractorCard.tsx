import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Badge } from '@/components/ui/Badge';
import { Colors } from '@/constants/colors';
import type { ContractorProfile } from '@/types/contractor';

interface Props {
  contractor: ContractorProfile;
  onPress: () => void;
  onSendRequest?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function ContractorCard({ contractor, onPress, onSendRequest, isSaved, onToggleSave }: Props) {
  const c = contractor;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: c.isPromoted ? Colors.primaryLight : Colors.border,
        marginBottom: 12,
      }}
    >
      {(c.isPromoted || c.listingTier !== 'free') && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          {c.isPromoted && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Feather name="star" size={10} color={Colors.primary} />
              <Txt w="semibold" style={{ fontSize: 10, color: Colors.primary, marginLeft: 3 }}>Promowany</Txt>
            </View>
          )}
          {c.listingTier === 'premium' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E8FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Txt w="semibold" style={{ fontSize: 10, color: '#7C3AED' }}>Premium</Txt>
            </View>
          )}
          {c.listingTier === 'basic' && (
            <View style={{ backgroundColor: Colors.infoBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Txt w="semibold" style={{ fontSize: 10, color: Colors.info }}>Podstawowy</Txt>
            </View>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: Colors.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
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
            {c.verificationStatus === 'verified' && (
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
                style={{
                  backgroundColor: Colors.surfaceAlt,
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
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
                <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>
                  {c.rating.toFixed(1)}
                </Txt>
                <Txt style={{ fontSize: 11, color: Colors.textMuted }}>({c.reviewCount})</Txt>
              </View>
            )}
            {c.availableSoon && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Feather name="clock" size={12} color={Colors.success} />
                <Txt style={{ fontSize: 12, color: Colors.success }}>Dostępny</Txt>
              </View>
            )}
          </View>
        </View>

        {onToggleSave && (
          <TouchableOpacity
            onPress={onToggleSave}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ padding: 4 }}
          >
            <Feather
              name={isSaved ? 'heart' : 'heart'}
              size={20}
              color={isSaved ? Colors.danger : Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {onSendRequest && (
        <TouchableOpacity
          onPress={onSendRequest}
          style={{
            marginTop: 12,
            backgroundColor: Colors.primaryBg,
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: 'center',
          }}
          activeOpacity={0.8}
        >
          <Txt w="semibold" style={{ fontSize: 13, color: Colors.primary }}>Wyślij zapytanie</Txt>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
