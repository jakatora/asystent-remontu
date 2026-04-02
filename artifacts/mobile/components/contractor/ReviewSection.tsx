import { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type { ContractorReviewSummary, ContractorReview } from '@/types/contractor';
import { REVIEWER_TYPE_LABELS } from '@/types/contractor';

interface ReviewSectionProps {
  readonly summary: ContractorReviewSummary | null;
  readonly onFlagReview?: (reviewId: string) => void;
}

export function ReviewSection({ summary, onFlagReview }: ReviewSectionProps) {
  const [showAll, setShowAll] = useState(false);

  if (!summary || summary.totalCount === 0) {
    return (
      <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
        <Feather name="message-square" size={20} color={Colors.textMuted} />
        <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 6 }}>Brak opinii</Txt>
        <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>Ten wykonawca nie otrzymal jeszcze zadnej opinii.</Txt>
      </View>
    );
  }

  const displayedReviews = showAll ? summary.recentReviews : summary.recentReviews.slice(0, 3);

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Txt w="bold" style={{ fontSize: 28, color: Colors.text }}>{summary.averageRating.toFixed(1)}</Txt>
        <View>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Feather key={s} name="star" size={14} color={s <= Math.round(summary.averageRating) ? '#D97706' : '#E2E8F0'} />
            ))}
          </View>
          <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 1 }}>
            {summary.totalCount} opinii{summary.verifiedCount > 0 ? ` (${summary.verifiedCount} zweryfikowanych)` : ''}
          </Txt>
        </View>
      </View>

      <View style={{ marginBottom: 10 }}>
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = summary.distribution[star];
          const pct = summary.totalCount > 0 ? (count / summary.totalCount) * 100 : 0;
          return (
            <View key={star} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Txt style={{ fontSize: 10, color: Colors.textMuted, width: 12, textAlign: 'right' }}>{star}</Txt>
              <Feather name="star" size={9} color="#D97706" />
              <View style={{ flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3 }}>
                <View style={{ width: `${pct}%`, height: 6, backgroundColor: '#D97706', borderRadius: 3 }} />
              </View>
              <Txt style={{ fontSize: 9, color: Colors.textMuted, width: 16, textAlign: 'right' }}>{count}</Txt>
            </View>
          );
        })}
      </View>

      {summary.hiddenCount > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <Feather name="eye-off" size={10} color={Colors.textMuted} />
          <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{summary.hiddenCount} opinii ukrytych przez moderacje</Txt>
        </View>
      )}

      {displayedReviews.map((review) => (
        <ReviewCard key={review.id} review={review} onFlag={onFlagReview} />
      ))}

      {summary.recentReviews.length > 3 && !showAll && (
        <TouchableOpacity onPress={() => setShowAll(true)} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Txt style={{ fontSize: 11, color: '#2563EB' }}>Pokaz wszystkie ({summary.recentReviews.length})</Txt>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ReviewCard({ review, onFlag }: { review: ContractorReview; onFlag?: (id: string) => void }) {
  return (
    <View style={{
      backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginBottom: 6,
      borderWidth: 1, borderColor: '#E2E8F0',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ flexDirection: 'row', gap: 1 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Feather key={s} name="star" size={10} color={s <= review.rating ? '#D97706' : '#E2E8F0'} />
              ))}
            </View>
            {(review.reviewerType === 'verified-request' || review.reviewerType === 'verified-job') && (
              <View style={{ backgroundColor: '#ECFDF5', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                <Txt style={{ fontSize: 7, color: '#059669' }}>Zweryfikowana</Txt>
              </View>
            )}
          </View>
          {review.title && <Txt w="semibold" style={{ fontSize: 11, color: Colors.text, marginTop: 3 }}>{review.title}</Txt>}
          {review.comment && <Txt style={{ fontSize: 11, color: Colors.text, marginTop: 2 }}>{review.comment}</Txt>}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{review.authorName ?? 'Anonimowy'}</Txt>
            <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{new Date(review.createdAt).toLocaleDateString('pl-PL')}</Txt>
          </View>
        </View>
        {onFlag && (
          <TouchableOpacity onPress={() => onFlag(review.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="flag" size={12} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
