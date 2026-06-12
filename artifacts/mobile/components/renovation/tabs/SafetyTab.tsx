import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { WarningBanner } from '@/components/ui/WarningBanner';
import type { RenovationJob } from '@/types/domain';

interface SafetyTabProps {
  job: RenovationJob;
}

export function SafetyTab({ job }: SafetyTabProps) {
  const { t } = useLanguage();
  const equipment = job.safetyEquipment ?? [];
  const warnings = job.warningRules;

  if (equipment.length === 0 && warnings.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Txt style={{ fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' }}>
          {t('job.detail.safety.empty')}
        </Txt>
      </View>
    );
  }

  return (
    <View style={{ gap: 16, padding: 16 }}>
      {warnings.length > 0 && (
        <View>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>
            {t('job.detail.safety.warningsHeader')}
          </Txt>
          <WarningBanner warnings={warnings} />
        </View>
      )}

      {equipment.length > 0 && (
        <View>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>
            {t('job.detail.safety.equipmentHeader')}
          </Txt>
          <View style={{ gap: 8 }}>
            {equipment.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  alignItems: 'flex-start',
                  backgroundColor: Colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: item.required ? Colors.warningBg : Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={(item.icon as any) ?? 'shield'} size={16} color={item.required ? Colors.warning : Colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>
                    {item.name}
                    {item.required ? '' : ` (${t('cmp.ToolCard.optional')})`}
                  </Txt>
                  {item.notes && (
                    <Txt style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                      {item.notes}
                    </Txt>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
