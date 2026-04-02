import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import type { VerificationStatus } from '@/types/contractor';
import { VERIFICATION_BADGES } from '@/types/contractor';

interface TrustBadgeProps {
  readonly status: VerificationStatus;
  readonly size?: 'small' | 'medium' | 'large';
  readonly showLabel?: boolean;
  readonly onPress?: () => void;
}

export function TrustBadge({ status, size = 'small', showLabel = true, onPress }: TrustBadgeProps) {
  const badge = VERIFICATION_BADGES[status];
  if (status === 'suspended') return null;

  const iconSize = size === 'large' ? 16 : size === 'medium' ? 14 : 10;
  const fontSize = size === 'large' ? 12 : size === 'medium' ? 10 : 8;
  const px = size === 'large' ? 10 : size === 'medium' ? 8 : 5;
  const py = size === 'large' ? 5 : size === 'medium' ? 3 : 2;

  const content = (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 3,
      backgroundColor: badge.color + '15', borderRadius: 6,
      paddingHorizontal: px, paddingVertical: py,
    }}>
      <Feather name={badge.icon as any} size={iconSize} color={badge.color} />
      {showLabel && <Txt style={{ fontSize, color: badge.color }}>{badge.label}</Txt>}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }
  return content;
}

interface PromotedLabelProps {
  readonly isPromoted: boolean;
  readonly listingTier?: string;
  readonly size?: 'small' | 'medium';
}

export function PromotedLabel({ isPromoted, listingTier, size = 'small' }: PromotedLabelProps) {
  if (!isPromoted && listingTier !== 'premium') return null;

  const fontSize = size === 'medium' ? 10 : 8;
  const px = size === 'medium' ? 8 : 5;
  const py = size === 'medium' ? 3 : 2;

  if (isPromoted) {
    return (
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: '#F3E8FF', borderRadius: 6, paddingHorizontal: px, paddingVertical: py,
        borderWidth: 1, borderColor: '#DDD6FE',
      }}>
        <Feather name="star" size={fontSize + 2} color="#7C3AED" />
        <Txt w="semibold" style={{ fontSize, color: '#7C3AED' }}>Promowany</Txt>
      </View>
    );
  }

  if (listingTier === 'premium') {
    return (
      <View style={{
        backgroundColor: '#F3E8FF', borderRadius: 6, paddingHorizontal: px, paddingVertical: py,
      }}>
        <Txt w="semibold" style={{ fontSize, color: '#7C3AED' }}>Premium</Txt>
      </View>
    );
  }

  return null;
}

interface CompletenessHintProps {
  readonly hint: string | null;
}

export function CompletenessHint({ hint }: CompletenessHintProps) {
  if (!hint) return null;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4,
      backgroundColor: '#FFFBEB', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
    }}>
      <Feather name="info" size={9} color="#D97706" />
      <Txt style={{ fontSize: 9, color: '#D97706' }}>{hint}</Txt>
    </View>
  );
}
