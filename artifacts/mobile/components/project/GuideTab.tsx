import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';
import { formatDuration, timeAgo } from '@/utils/format';
import type { ChecklistItem, RenovationJob } from '@/types/domain';
import { useLanguage } from '@/context/LanguageContext';

interface GuideTabProps {
  job: RenovationJob;
  checklist: ChecklistItem[];
  checklistProgress: { completed: number; total: number };
  onGenerateChecklist: () => Promise<void>;
  onToggleChecklist: (item: ChecklistItem) => Promise<void>;
}

export function GuideTab({ job, checklist, checklistProgress, onGenerateChecklist, onToggleChecklist }: GuideTabProps) {
  const { t } = useLanguage();
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
            {checklist.length > 0 ? t('cmp.GuideTab.taskList') : t('cmp.GuideTab.stepByStep')}
          </Txt>
          <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
            {checklist.length > 0
              ? t('cmp.GuideTab.completedCount', { completed: checklistProgress.completed, total: checklistProgress.total })
              : t('cmp.GuideTab.followOrder')}
          </Txt>
        </View>
        {checklist.length === 0 && (
          <TouchableOpacity
            onPress={onGenerateChecklist}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: Colors.primaryBg,
              borderRadius: 10,
            }}
          >
            <Txt w="medium" style={{ fontSize: 12, color: Colors.primary }}>
              {t('cmp.GuideTab.generateList')}
            </Txt>
          </TouchableOpacity>
        )}
      </View>

      {checklist.length > 0 && (
        <ProgressBar completed={checklistProgress.completed} total={checklistProgress.total} color={Colors.success} />
      )}

      {checklist.length > 0
        ? checklist.map((item) => {
            const step = job.instructions.find((s) => s.step === item.stepIndex);
            const dur = step ? formatDuration(step.durationMin) : null;
            return (
              <ChecklistRow
                key={item.id}
                item={item}
                dur={dur}
                tip={step?.tip}
                warning={step?.warning}
                onToggle={() => onToggleChecklist(item)}
              />
            );
          })
        : job.instructions.map((step) => (
            <InstructionRow key={step.step} step={step} />
          ))}
    </View>
  );
}

function ChecklistRow({
  item,
  dur,
  tip,
  warning,
  onToggle,
}: {
  item: ChecklistItem;
  dur: string | null;
  tip?: string;
  warning?: string;
  onToggle: () => void;
}) {
  const { t } = useLanguage();
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        gap: 12,
        backgroundColor: item.completed ? Colors.successBg : Colors.surface,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: item.completed ? '#BBF7D0' : Colors.border,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: item.completed ? Colors.success : Colors.border,
          backgroundColor: item.completed ? Colors.success : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {item.completed ? (
          <Feather name="check" size={14} color="#fff" />
        ) : (
          <Txt w="bold" style={{ fontSize: 12, color: Colors.textMuted }}>{item.stepIndex}</Txt>
        )}
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <Txt
            w="bold"
            style={{
              flex: 1,
              fontSize: 15,
              color: item.completed ? Colors.textSecondary : Colors.text,
              textDecorationLine: item.completed ? 'line-through' : 'none',
            }}
          >
            {item.title}
          </Txt>
          {dur && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: Colors.surfaceAlt,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Feather name="clock" size={11} color={Colors.textMuted} />
              <Txt w="medium" style={{ fontSize: 11, color: Colors.textMuted }}>~{dur}</Txt>
            </View>
          )}
        </View>

        {item.description && !item.completed && (
          <Txt style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 20 }}>
            {item.description}
          </Txt>
        )}

        {tip && !item.completed && (
          <AlertBox icon="zap" color={Colors.warning} bg={Colors.warningBg} textColor="#92400e">
            {tip}
          </AlertBox>
        )}

        {warning && !item.completed && (
          <AlertBox icon="alert-triangle" color={Colors.danger} bg={Colors.dangerBg} textColor="#991b1b">
            {warning}
          </AlertBox>
        )}

        {item.completed && item.completedAt && (
          <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
            {t('cmp.GuideTab.completedAt', { time: timeAgo(item.completedAt) })}
          </Txt>
        )}
      </View>
    </TouchableOpacity>
  );
}

function InstructionRow({ step }: { step: { step: number; title: string; description: string; tip?: string; warning?: string; durationMin: number } }) {
  const dur = formatDuration(step.durationMin);
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 14,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Txt w="bold" style={{ fontSize: 14, color: '#fff' }}>{step.step}</Txt>
      </View>

      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <Txt w="bold" style={{ flex: 1, fontSize: 15, color: Colors.text }}>
            {step.title}
          </Txt>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: Colors.surfaceAlt,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Feather name="clock" size={11} color={Colors.textMuted} />
            <Txt w="medium" style={{ fontSize: 11, color: Colors.textMuted }}>~{dur}</Txt>
          </View>
        </View>

        <Txt style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 20 }}>
          {step.description}
        </Txt>

        {step.tip && (
          <AlertBox icon="zap" color={Colors.warning} bg={Colors.warningBg} textColor="#92400e">
            {step.tip}
          </AlertBox>
        )}

        {step.warning && (
          <AlertBox icon="alert-triangle" color={Colors.danger} bg={Colors.dangerBg} textColor="#991b1b">
            {step.warning}
          </AlertBox>
        )}
      </View>
    </View>
  );
}

function AlertBox({ icon, color, bg, textColor, children }: { icon: string; color: string; bg: string; textColor: string; children: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        backgroundColor: bg,
        borderRadius: 10,
        padding: 10,
        alignItems: 'flex-start',
      }}
    >
      <Feather name={icon as any} size={13} color={color} style={{ marginTop: 1 }} />
      <Txt style={{ flex: 1, fontSize: 13, lineHeight: 18, color: textColor }}>
        {children}
      </Txt>
    </View>
  );
}
