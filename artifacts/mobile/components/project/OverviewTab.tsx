import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { WarningBanner } from '@/components/ui/WarningBanner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import { SummaryRow, Divider } from './SummaryRow';
import { DiyBanner } from './DiyBanner';
import { ActivityFeed } from './ActivityFeed';
import { STATUS_COLORS } from './types';
import type { ProjectDetailData, ProjectDetailActions, Tab } from './types';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/constants/i18n';

const OVERVIEW_STATUS_LABEL_KEYS: Record<'planning' | 'in-progress' | 'completed', TranslationKey> = {
  planning: 'cmp.OverviewTab.status.planning',
  'in-progress': 'cmp.OverviewTab.status.inProgress',
  completed: 'cmp.OverviewTab.status.completed',
};

interface OverviewTabProps {
  data: ProjectDetailData;
  actions: ProjectDetailActions;
  isFirstTime: boolean;
  onDismissWelcome: () => void;
  purchasedCount: number;
  nonOwnedCount: number;
}

export function OverviewTab({ data, actions, isFirstTime, onDismissWelcome, purchasedCount, nonOwnedCount }: OverviewTabProps) {
  const { t } = useLanguage();
  const { project, job, calc, shoppingItems, checklist, checklistProgress, activities, diy } = data;

  const proLaborMultiplier = 1.8;
  const proEstimate = calc ? calc.totalCost * (1 + proLaborMultiplier) : null;

  const roomArea = project.roomWidth && project.roomLength
    ? (project.roomWidth * project.roomLength).toFixed(1)
    : null;

  return (
    <View style={{ gap: 16 }}>
      {isFirstTime && (
        <View
          style={{
            backgroundColor: Colors.primaryBg,
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: Colors.primary + '50',
            padding: 16,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="zap" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Txt w="bold" style={{ fontSize: 16, color: Colors.primary }}>
                {t('cmp.OverviewTab.readyTitle')}
              </Txt>
              <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
                {t('cmp.OverviewTab.readySubtitle')}
              </Txt>
            </View>
          </View>
          <Txt style={{ fontSize: 13, color: Colors.text, lineHeight: 19 }}>
            <Txt w="semibold">{t('cmp.OverviewTab.tabsHintMaterials')}</Txt>
            {' · '}
            <Txt w="semibold">{t('cmp.OverviewTab.tabsHintTools')}</Txt>
            {' · '}
            <Txt w="semibold">{t('cmp.OverviewTab.tabsHintGuide')}</Txt>
          </Txt>
          <TouchableOpacity
            onPress={onDismissWelcome}
            style={{ alignSelf: 'flex-end' }}
          >
            <Txt style={{ fontSize: 13, color: Colors.primary }}>{t('cmp.OverviewTab.dismiss')}</Txt>
          </TouchableOpacity>
        </View>
      )}

      <View>
        <Txt w="bold" style={{ fontSize: 22, color: Colors.text }}>{project.name}</Txt>
        <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
          {job.name}
        </Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['planning', 'in-progress', 'completed'] as const).map((s) => {
          const cfg = STATUS_COLORS[s];
          const isActive = project.status === s;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => actions.handleStatusChange(s)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: isActive ? cfg.active : Colors.border,
                backgroundColor: isActive ? cfg.bg : Colors.surface,
              }}
            >
              <Txt
                w="semibold"
                style={{ fontSize: 12, color: isActive ? cfg.active : Colors.textSecondary }}
              >
                {t(OVERVIEW_STATUS_LABEL_KEYS[s])}
              </Txt>
            </TouchableOpacity>
          );
        })}
      </View>

      {(project.roomName || roomArea) && (
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 14,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="home" size={16} color={Colors.info} />
            <Txt w="bold" style={{ fontSize: 15, color: Colors.text }}>
              {project.roomName || t('cmp.OverviewTab.room')}
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {roomArea && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="grid" size={13} color={Colors.textMuted} />
                <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{roomArea} m²</Txt>
              </View>
            )}
            {project.roomWidth && project.roomLength && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="maximize-2" size={13} color={Colors.textMuted} />
                <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>
                  {project.roomWidth} × {project.roomLength} m
                </Txt>
              </View>
            )}
            {project.roomHeight && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="arrow-up" size={13} color={Colors.textMuted} />
                <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>
                  {t('cmp.OverviewTab.height', { value: project.roomHeight })}
                </Txt>
              </View>
            )}
          </View>
        </View>
      )}

      {checklistProgress.total > 0 && (
        <TouchableOpacity
          onPress={() => actions.setTab('guide')}
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 14,
            gap: 8,
          }}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name="check-square" size={16} color={Colors.success} />
              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{t('cmp.OverviewTab.workProgress')}</Txt>
            </View>
            <Txt w="bold" style={{ fontSize: 14, color: Colors.success }}>
              {checklistProgress.completed}/{checklistProgress.total}
            </Txt>
          </View>
          <ProgressBar completed={checklistProgress.completed} total={checklistProgress.total} color={Colors.success} />
        </TouchableOpacity>
      )}

      {calc && (
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            overflow: 'hidden',
          }}
        >
          <SummaryRow icon="tool" label={t('cmp.OverviewTab.materialsDiy')} value={formatCurrency(calc.totalCost)} bold />
          {proEstimate && (
            <>
              <Divider />
              <SummaryRow icon="users" label={t('cmp.OverviewTab.withProfessional')} value={`~${formatCurrency(proEstimate)}`} valueColor={Colors.textSecondary} />
            </>
          )}
          <Divider />
          <SummaryRow
            icon="clock"
            label={t('cmp.OverviewTab.duration')}
            value={`${calc.totalDays} ${calc.totalDays === 1 ? t('cmp.OverviewTab.dayOne') : t('cmp.OverviewTab.dayMany')}`}
            bold
          />
          {shoppingItems.length > 0 && (
            <>
              <Divider />
              <SummaryRow
                icon="shopping-cart"
                label={t('cmp.OverviewTab.shopping')}
                value={t('cmp.OverviewTab.shoppingValue', { purchased: purchasedCount, total: nonOwnedCount })}
                bold
              />
            </>
          )}
        </View>
      )}

      {calc?.warnings && calc.warnings.length > 0 && (
        <WarningBanner warnings={calc.warnings} />
      )}

      <DiyBanner diy={diy} />

      {job.hireProfessionalRecommended && (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: Colors.dangerBg,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: '#FECACA',
          }}
          onPress={() => router.push({ pathname: '/hire-pro', params: { jobId: job.id } })}
          activeOpacity={0.8}
        >
          <Feather name="phone" size={18} color={Colors.danger} />
          <Txt w="medium" style={{ flex: 1, fontSize: 14, color: Colors.danger }}>
            {t('cmp.OverviewTab.findProfessional')}
          </Txt>
          <Feather name="chevron-right" size={16} color={Colors.danger} />
        </TouchableOpacity>
      )}

      {project.notes && (
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 14,
            gap: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="message-square" size={14} color={Colors.textSecondary} />
            <Txt w="semibold" style={{ fontSize: 13, color: Colors.textSecondary }}>{t('cmp.OverviewTab.notes')}</Txt>
          </View>
          <Txt style={{ fontSize: 14, color: Colors.text, lineHeight: 20 }}>{project.notes}</Txt>
        </View>
      )}

      <ActivityFeed activities={activities} />

      <View style={{ gap: 10 }}>
        <Button
          label={t('cmp.OverviewTab.openFullDescription')}
          variant="outline"
          onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}
          fullWidth
        />
        {shoppingItems.length === 0 && calc && (
          <Button
            label={t('cmp.OverviewTab.generateShoppingList')}
            onPress={actions.handleGenerateShoppingList}
            fullWidth
            icon={<Feather name="shopping-cart" size={16} color="#fff" />}
          />
        )}
        {checklist.length === 0 && (
          <Button
            label={t('cmp.OverviewTab.generateTaskList')}
            variant="outline"
            onPress={actions.handleGenerateChecklist}
            fullWidth
            icon={<Feather name="check-square" size={16} color={Colors.primary} />}
          />
        )}
      </View>
    </View>
  );
}
