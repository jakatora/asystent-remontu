import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { ACTIVITY_ICONS, timeAgo, timeAgoShort } from '@/utils/format';
import type { ProjectActivity, ActivityAction } from '@/types/domain';

interface ActivityFeedProps {
  activities: ProjectActivity[];
  limit?: number;
  compact?: boolean;
}

export function ActivityFeed({ activities, limit = 5, compact = false }: ActivityFeedProps) {
  const items = activities.slice(0, limit);
  if (items.length === 0) return null;

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Feather name="activity" size={14} color={Colors.textSecondary} />
        <Txt w="semibold" style={{ fontSize: 14, color: Colors.textSecondary }}>
          Ostatnia aktywność
        </Txt>
      </View>
      {items.map((a) => (
        <View
          key={a.id}
          style={{
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
            paddingVertical: 4,
          }}
          accessibilityLabel={a.description}
        >
          <Feather
            name={(ACTIVITY_ICONS[a.actionType as ActivityAction] ?? 'circle') as any}
            size={14}
            color={Colors.textMuted}
          />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontSize: 13, color: Colors.text }}>{a.description}</Txt>
          </View>
          <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
            {compact ? timeAgoShort(a.createdAt) : timeAgo(a.createdAt)}
          </Txt>
        </View>
      ))}
    </View>
  );
}
