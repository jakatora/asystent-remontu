import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { CATEGORIES } from '@/data/categories';
import { getJobsByCategory, getJobById } from '@/data/jobs';
import type { RenovationJob } from '@/data/jobs';
import { calculateMaterials } from '@/utils/calculator';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';
import { useWizardDraft } from '@/hooks/useWizardDraft';
import type { WizardCondition, WizardDesired, WizardBudget, WizardDiyMode } from '@/hooks/useWizardDraft';
import { ROOM_OPTIONS } from '@/shared/schemas/wizard.schema';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/constants/translations';

// ─── Step types ───────────────────────────────────────────────────────────────

type WizardStep =
  | 'category'
  | 'room'
  | 'job'
  | 'condition'
  | 'desired'
  | 'budget'
  | 'diy'
  | 'measure'
  | 'summary';

const STEPS: WizardStep[] = [
  'category', 'room', 'job', 'condition', 'desired', 'budget', 'diy', 'measure', 'summary',
];

const STEP_LABEL_KEYS: Record<WizardStep, TranslationKey> = {
  category:  'wizard.step.category',
  room:      'wizard.step.room',
  job:       'wizard.step.job',
  condition: 'wizard.step.condition',
  desired:   'wizard.step.desired',
  budget:    'wizard.step.budget',
  diy:       'wizard.step.diy',
  measure:   'wizard.step.measure',
  summary:   'wizard.step.summary',
};

// ─── Pick option type ──────────────────────────────────────────────────────────

interface PickOption<T> {
  id: T;
  label: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

// ─── Screen width for responsive layout ───────────────────────────────────────

const W = Dimensions.get('window').width;
const CARD_W = (W - 48 - 12) / 2; // 2-col grid (px-5 * 2 + gap)

// ─── Generic pick-one card list ───────────────────────────────────────────────

function OptionCard<T extends string>({
  option,
  selected,
  onPress,
}: {
  option: PickOption<T>;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        borderWidth: 2,
        borderColor: selected ? Colors.primary : Colors.border,
        backgroundColor: selected ? Colors.primaryBg : Colors.surface,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        minHeight: 72,
      }}
    >
      {/* Icon badge */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: option.iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Feather name={option.icon as any} size={22} color={option.iconColor} />
      </View>

      {/* Text */}
      <View style={{ flex: 1, gap: 3 }}>
        <Txt w="semibold" style={{ fontSize: 15, color: selected ? Colors.primary : Colors.text }}>
          {option.label}
        </Txt>
        <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 18 }}>
          {option.subtitle}
        </Txt>
      </View>

      {/* Check */}
      {selected && (
        <Feather name="check-circle" size={20} color={Colors.primary} style={{ flexShrink: 0, marginTop: 2 }} />
      )}
    </TouchableOpacity>
  );
}

// ─── Info hint box ────────────────────────────────────────────────────────────

function HintBox({ icon, text }: { icon?: string; text: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        backgroundColor: Colors.infoBg,
        borderRadius: 12,
        padding: 12,
        alignItems: 'flex-start',
      }}
    >
      <Feather name={(icon ?? 'info') as any} size={16} color={Colors.info} style={{ marginTop: 1 }} />
      <Txt style={{ flex: 1, fontSize: 13, color: '#1e40af', lineHeight: 18 }}>{text}</Txt>
    </View>
  );
}

// ─── Warning hint box ─────────────────────────────────────────────────────────

function WarnBox({ text }: { text: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        backgroundColor: Colors.warningBg,
        borderRadius: 12,
        padding: 12,
        alignItems: 'flex-start',
      }}
    >
      <Feather name="alert-triangle" size={16} color={Colors.warning} style={{ marginTop: 1 }} />
      <Txt style={{ flex: 1, fontSize: 13, color: '#92400e', lineHeight: 18 }}>{text}</Txt>
    </View>
  );
}

// ─── Summary row ──────────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  icon,
  onEdit,
  editLabel,
}: {
  label: string;
  value: string;
  icon: string;
  onEdit: () => void;
  editLabel: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: Colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name={icon as any} size={16} color={Colors.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt style={{ fontSize: 11, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Txt>
        <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginTop: 1 }}>
          {value}
        </Txt>
      </View>
      <TouchableOpacity
        onPress={onEdit}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: Colors.primary,
        }}
      >
        <Txt w="semibold" style={{ fontSize: 13, color: Colors.primary }}>
          {editLabel}
        </Txt>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main wizard screen ────────────────────────────────────────────────────────

export default function WizardScreen() {
  const { jobId: initialJobId } = useLocalSearchParams<{ jobId?: string }>();
  const insets = useSafeAreaInsets();
  const { createProject, generateAndAddShoppingItems } = useApp();
  const { t } = useLanguage();

  // ── Option lists (built inside component for translation) ───────────────────
  const CONDITION_OPTIONS: PickOption<WizardCondition>[] = [
    {
      id: 'poor',
      label: t('wizard.condition.poor.label'),
      subtitle: t('wizard.condition.poor.subtitle'),
      icon: 'alert-triangle',
      iconColor: Colors.danger,
      iconBg: Colors.dangerBg,
    },
    {
      id: 'fair',
      label: t('wizard.condition.fair.label'),
      subtitle: t('wizard.condition.fair.subtitle'),
      icon: 'minus-circle',
      iconColor: Colors.warning,
      iconBg: Colors.warningBg,
    },
    {
      id: 'good',
      label: t('wizard.condition.good.label'),
      subtitle: t('wizard.condition.good.subtitle'),
      icon: 'check-circle',
      iconColor: Colors.success,
      iconBg: Colors.successBg,
    },
  ];

  const DESIRED_OPTIONS: PickOption<WizardDesired>[] = [
    {
      id: 'refresh',
      label: t('wizard.desired.refresh.label'),
      subtitle: t('wizard.desired.refresh.subtitle'),
      icon: 'wind',
      iconColor: Colors.info,
      iconBg: Colors.infoBg,
    },
    {
      id: 'standard',
      label: t('wizard.desired.standard.label'),
      subtitle: t('wizard.desired.standard.subtitle'),
      icon: 'star',
      iconColor: Colors.warning,
      iconBg: Colors.warningBg,
    },
    {
      id: 'complete',
      label: t('wizard.desired.complete.label'),
      subtitle: t('wizard.desired.complete.subtitle'),
      icon: 'award',
      iconColor: Colors.primary,
      iconBg: Colors.primaryBg,
    },
  ];

  const BUDGET_OPTIONS: PickOption<WizardBudget>[] = [
    {
      id: 'economy',
      label: t('wizard.budget.economy.label'),
      subtitle: t('wizard.budget.economy.subtitle'),
      icon: 'tag',
      iconColor: Colors.success,
      iconBg: Colors.successBg,
    },
    {
      id: 'standard',
      label: t('wizard.budget.standard.label'),
      subtitle: t('wizard.budget.standard.subtitle'),
      icon: 'bar-chart-2',
      iconColor: Colors.info,
      iconBg: Colors.infoBg,
    },
    {
      id: 'premium',
      label: t('wizard.budget.premium.label'),
      subtitle: t('wizard.budget.premium.subtitle'),
      icon: 'award',
      iconColor: Colors.primary,
      iconBg: Colors.primaryBg,
    },
  ];

  const DIY_OPTIONS: PickOption<WizardDiyMode>[] = [
    {
      id: 'diy',
      label: t('wizard.diy.diy.label'),
      subtitle: t('wizard.diy.diy.subtitle'),
      icon: 'tool',
      iconColor: Colors.primary,
      iconBg: Colors.primaryBg,
    },
    {
      id: 'compare',
      label: t('wizard.diy.compare.label'),
      subtitle: t('wizard.diy.compare.subtitle'),
      icon: 'bar-chart',
      iconColor: Colors.info,
      iconBg: Colors.infoBg,
    },
    {
      id: 'hire',
      label: t('wizard.diy.hire.label'),
      subtitle: t('wizard.diy.hire.subtitle'),
      icon: 'phone',
      iconColor: Colors.success,
      iconBg: Colors.successBg,
    },
  ];

  // ── Draft state ──────────────────────────────────────────────────────────────
  const { draft, patchDraft, clearDraft } = useWizardDraft();

  // ── Local wizard step state ───────────────────────────────────────────────────
  const [step, setStep] = useState<WizardStep>(() => {
    if (initialJobId) return 'room'; // skip category+job if pre-selected
    return 'category';
  });
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Pre-select job if passed as param
  React.useEffect(() => {
    if (initialJobId && !draft.jobId) {
      const job = getJobById(initialJobId);
      if (job) {
        patchDraft({ jobId: job.id, categoryId: job.categoryId });
      }
    }
  }, [initialJobId]);

  const scrollRef = useRef<ScrollView>(null);

  // Derived data
  const stepIdx    = STEPS.indexOf(step);
  const progress   = (stepIdx + 1) / STEPS.length;
  const categories = CATEGORIES.filter((c) => c.jobCount > 0);
  const availJobs  = draft.categoryId ? getJobsByCategory(draft.categoryId) : [];
  const selectedJob: RenovationJob | undefined = draft.jobId ? getJobById(draft.jobId) : undefined;

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goTo = useCallback((s: WizardStep) => {
    setValidationError(null);
    setStep(s);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 50);
  }, []);

  const goBack = useCallback(() => {
    if (stepIdx === 0) { router.back(); return; }
    goTo(STEPS[stepIdx - 1]);
  }, [stepIdx, goTo]);

  const validateStep = useCallback((): string | null => {
    switch (step) {
      case 'category':  return draft.categoryId    ? null : t('wizard.error.category');
      case 'room':      return draft.room           ? null : t('wizard.error.room');
      case 'job':       return draft.jobId          ? null : t('wizard.error.job');
      case 'condition': return draft.condition      ? null : t('wizard.error.condition');
      case 'desired':   return draft.desiredResult  ? null : t('wizard.error.desired');
      case 'budget':    return draft.budgetLevel    ? null : t('wizard.error.budget');
      case 'diy':       return draft.diyMode        ? null : t('wizard.error.diy');
      case 'measure': {
        if (!selectedJob) return null;
        const required = selectedJob.measurementInputs.filter((i) => i.required !== false && !i.defaultValue);
        for (const inp of required) {
          const val = parseFloat(draft.measurements[inp.id] ?? '');
          if (isNaN(val) || val <= 0) {
            return t('wizard.error.measureValue', { label: inp.label });
          }
        }
        return null;
      }
      default: return null;
    }
  }, [step, draft, selectedJob, t]);

  const handleNext = useCallback(() => {
    // Special: if hire → redirect to hire-pro immediately
    if (step === 'diy' && draft.diyMode === 'hire') {
      router.push({ pathname: '/hire-pro', params: { jobId: draft.jobId ?? '' } });
      return;
    }

    const err = validateStep();
    if (err) { setValidationError(err); return; }
    setValidationError(null);

    if (stepIdx < STEPS.length - 1) {
      goTo(STEPS[stepIdx + 1]);
    }
  }, [step, stepIdx, draft.diyMode, draft.jobId, validateStep, goTo]);

  // ── Save & calculate ─────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!selectedJob) return;
    setSaving(true);
    try {
      const meas: Record<string, number> = {};
      for (const inp of selectedJob.measurementInputs) {
        const raw  = draft.measurements[inp.id];
        const def  = inp.defaultValue;
        const val  = raw !== undefined ? parseFloat(raw) : def ?? 0;
        meas[inp.id] = isNaN(val) ? (def ?? 0) : val;
      }

      const calcResult = calculateMaterials(selectedJob, meas);

      const autoName = draft.projectName.trim() ||
        `${selectedJob.name} — ${draft.room ?? t('wizard.summary.fallbackRoom')}`;

      const projectId = await createProject({
        name: autoName,
        jobId: selectedJob.id,
        jobName: selectedJob.name,
        categoryId: selectedJob.categoryId,
        measurements: meas,
        calculationResult: calcResult,
        status: 'planning',
      });

      // Auto-generate shopping list immediately
      await generateAndAddShoppingItems(projectId, calcResult);

      clearDraft();
      router.replace({ pathname: '/project/[id]', params: { id: projectId, fromWizard: '1' } });
    } catch (err) {
      console.error('[Wizard] save error:', err);
      Alert.alert(t('wizard.saveError.title'), t('wizard.saveError.body'));
    } finally {
      setSaving(false);
    }
  }, [selectedJob, draft, createProject, generateAndAddShoppingItems, clearDraft, t]);

  // ── Helper labels ────────────────────────────────────────────────────────────

  const conditionLabel: Record<WizardCondition, string> = {
    poor: t('wizard.condition.poor.label'),
    fair: t('wizard.condition.fair.label'),
    good: t('wizard.condition.good.label'),
  };
  const desiredLabel: Record<WizardDesired, string> = {
    refresh: t('wizard.desired.refresh.label'),
    standard: t('wizard.desired.standard.label'),
    complete: t('wizard.desired.complete.label'),
  };
  const budgetLabel: Record<WizardBudget, string> = {
    economy: t('wizard.budget.economy.label'),
    standard: t('wizard.budget.standard.label'),
    premium: t('wizard.budget.premium.label'),
  };
  const diyLabel: Record<WizardDiyMode, string> = {
    diy: t('wizard.diy.diy.label'),
    compare: t('wizard.diy.compare.label'),
    hire: t('wizard.diy.hire.label'),
  };

  const roomLabel = ROOM_OPTIONS.find((r) => r.id === draft.room)?.label ?? draft.room ?? '';

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  // ── Difficulty badge ─────────────────────────────────────────────────────────

  const difficultyColor: Record<string, string> = {
    easy: Colors.success, medium: Colors.warning, hard: Colors.danger,
  };
  const difficultyLabel: Record<string, string> = {
    easy: t('wizard.difficulty.easy'),
    medium: t('wizard.difficulty.medium'),
    hard: t('wizard.difficulty.hard'),
  };

  // ── Pro cost estimate (rough: 2× material cost) ────────────────────────────

  const proCostMultiplier = 2.5;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Stack.Screen
        options={{
          title: t(STEP_LABEL_KEYS[step]),
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={goBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ padding: 4, marginLeft: -4 }}
            >
              <Feather name="arrow-left" size={22} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Progress bar ─────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 10, gap: 6 }}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {STEPS.map((s, i) => (
              <View
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor:
                    i < stepIdx ? Colors.primary
                    : i === stepIdx ? Colors.primaryLight
                    : Colors.border,
                }}
              />
            ))}
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
            Krok {stepIdx + 1} z {STEPS.length}
          </Txt>
        </View>

        {/* ── Scrollable content ──────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ padding: 20, gap: 20 }}>

            {/* ════════════════════════════════════════════════════════════════
                STEP 1 — CATEGORY
            ════════════════════════════════════════════════════════════════ */}
            {step === 'category' && (
              <>
                <View style={{ gap: 4 }}>
                  <Txt w="bold" style={{ fontSize: 24, color: Colors.text, lineHeight: 32 }}>
                    {t('wizard.category.title')}
                  </Txt>
                  <Txt style={{ fontSize: 15, color: Colors.textSecondary }}>
                    {t('wizard.category.subtitle')}
                  </Txt>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {categories.map((cat) => {
                    const selected = draft.categoryId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => {
                          patchDraft({ categoryId: cat.id, jobId: null });
                          setValidationError(null);
                        }}
                        activeOpacity={0.8}
                        style={{
                          width: CARD_W,
                          borderWidth: 2,
                          borderColor: selected ? Colors.primary : Colors.border,
                          backgroundColor: selected ? Colors.primaryBg : Colors.surface,
                          borderRadius: 16,
                          padding: 14,
                          gap: 10,
                          alignItems: 'flex-start',
                        }}
                      >
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            backgroundColor: cat.color + '20',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Feather name={cat.icon as any} size={24} color={cat.color} />
                        </View>
                        <View style={{ gap: 2 }}>
                          <Txt
                            w="semibold"
                            style={{ fontSize: 14, color: selected ? Colors.primary : Colors.text }}
                            numberOfLines={2}
                          >
                            {cat.name}
                          </Txt>
                          <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
                            {cat.jobCount} {cat.jobCount === 1 ? t('wizard.category.jobsOne') : t('wizard.category.jobsMany')}
                          </Txt>
                        </View>
                        {selected && (
                          <View style={{ position: 'absolute', top: 10, right: 10 }}>
                            <Feather name="check-circle" size={18} color={Colors.primary} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {validationError && (
                  <Txt style={{ fontSize: 13, color: Colors.danger, textAlign: 'center' }}>
                    {validationError}
                  </Txt>
                )}

                <Button
                  label={t('wizard.next')}
                  onPress={handleNext}
                  size="lg"
                  fullWidth
                  disabled={!draft.categoryId}
                  iconRight={<Feather name="arrow-right" size={18} color="#fff" />}
                />
              </>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 2 — ROOM
            ════════════════════════════════════════════════════════════════ */}
            {step === 'room' && (
              <>
                <View style={{ gap: 4 }}>
                  <Txt w="bold" style={{ fontSize: 24, color: Colors.text, lineHeight: 32 }}>
                    {t('wizard.room.title')}
                  </Txt>
                  <Txt style={{ fontSize: 15, color: Colors.textSecondary }}>
                    {t('wizard.room.subtitle')}
                  </Txt>
                </View>

                <View style={{ gap: 8 }}>
                  {ROOM_OPTIONS.map((room) => {
                    const selected = draft.room === room.id;
                    return (
                      <TouchableOpacity
                        key={room.id}
                        onPress={() => { patchDraft({ room: room.id }); setValidationError(null); }}
                        activeOpacity={0.8}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 14,
                          padding: 14,
                          borderRadius: 14,
                          borderWidth: 2,
                          borderColor: selected ? Colors.primary : Colors.border,
                          backgroundColor: selected ? Colors.primaryBg : Colors.surface,
                          minHeight: 64,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: selected ? Colors.primary + '20' : Colors.surfaceAlt,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Feather
                            name={room.icon as any}
                            size={20}
                            color={selected ? Colors.primary : Colors.textSecondary}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Txt
                            w="semibold"
                            style={{ fontSize: 15, color: selected ? Colors.primary : Colors.text }}
                          >
                            {room.label}
                          </Txt>
                          {room.examples && (
                            <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 1 }}>
                              {room.examples}
                            </Txt>
                          )}
                        </View>
                        {selected && <Feather name="check-circle" size={20} color={Colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {validationError && (
                  <Txt style={{ fontSize: 13, color: Colors.danger }}>{validationError}</Txt>
                )}

                <Button
                  label={t('wizard.next')}
                  onPress={handleNext}
                  size="lg"
                  fullWidth
                  disabled={!draft.room}
                  iconRight={<Feather name="arrow-right" size={18} color="#fff" />}
                />
              </>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 3 — JOB
            ════════════════════════════════════════════════════════════════ */}
            {step === 'job' && (
              <>
                <View style={{ gap: 4 }}>
                  <Txt w="bold" style={{ fontSize: 24, color: Colors.text, lineHeight: 32 }}>
                    {t('wizard.job.title')}
                  </Txt>
                  <Txt style={{ fontSize: 15, color: Colors.textSecondary }}>
                    {t('wizard.job.subtitle')}
                  </Txt>
                </View>

                <View style={{ gap: 8 }}>
                  {availJobs.map((job) => {
                    const selected = draft.jobId === job.id;
                    const diff = job.difficulty;
                    return (
                      <TouchableOpacity
                        key={job.id}
                        onPress={() => { patchDraft({ jobId: job.id }); setValidationError(null); }}
                        activeOpacity={0.8}
                        style={{
                          padding: 16,
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: selected ? Colors.primary : Colors.border,
                          backgroundColor: selected ? Colors.primaryBg : Colors.surface,
                          gap: 8,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <View
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              backgroundColor: selected ? Colors.primary + '20' : Colors.surfaceAlt,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Feather
                              name={job.coverIcon as any}
                              size={22}
                              color={selected ? Colors.primary : Colors.textSecondary}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Txt
                              w="bold"
                              style={{ fontSize: 15, color: selected ? Colors.primary : Colors.text }}
                            >
                              {job.name}
                            </Txt>
                            {diff && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                <View
                                  style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 6,
                                    backgroundColor: difficultyColor[diff] + '20',
                                  }}
                                >
                                  <Txt
                                    w="semibold"
                                    style={{ fontSize: 11, color: difficultyColor[diff] }}
                                  >
                                    {difficultyLabel[diff] ?? diff}
                                  </Txt>
                                </View>
                                {job.estimatedDays && (
                                  <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
                                    · ~{job.estimatedDays} {job.estimatedDays === 1 ? t('wizard.job.dayOne') : t('wizard.job.dayMany')}
                                  </Txt>
                                )}
                              </View>
                            )}
                          </View>
                          {selected && <Feather name="check-circle" size={20} color={Colors.primary} />}
                        </View>

                        {/* Short description */}
                        <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 18 }}>
                          {job.shortDescription ?? job.description}
                        </Txt>

                        {/* Beginner-friendly note */}
                        {job.beginnerFriendlyDescription && selected && (
                          <HintBox
                            icon="info"
                            text={job.beginnerFriendlyDescription}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {availJobs.length === 0 && (
                  <HintBox
                    text={t('wizard.job.emptyCategory')}
                  />
                )}

                {validationError && (
                  <Txt style={{ fontSize: 13, color: Colors.danger }}>{validationError}</Txt>
                )}

                {draft.jobId && (
                  <Button
                    label={t('wizard.next')}
                    onPress={handleNext}
                    size="lg"
                    fullWidth
                    iconRight={<Feather name="arrow-right" size={18} color="#fff" />}
                  />
                )}
              </>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 4 — CONDITION
            ════════════════════════════════════════════════════════════════ */}
            {step === 'condition' && (
              <>
                <View style={{ gap: 4 }}>
                  <Txt w="bold" style={{ fontSize: 24, color: Colors.text, lineHeight: 32 }}>
                    {t('wizard.conditionStep.title')}
                  </Txt>
                  <Txt style={{ fontSize: 15, color: Colors.textSecondary }}>
                    {t('wizard.conditionStep.subtitle')}
                  </Txt>
                </View>

                <View style={{ gap: 10 }}>
                  {CONDITION_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      selected={draft.condition === opt.id}
                      onPress={() => { patchDraft({ condition: opt.id }); setValidationError(null); }}
                    />
                  ))}
                </View>

                {draft.condition === 'poor' && (
                  <WarnBox text={t('wizard.conditionStep.poorWarning')} />
                )}

                {validationError && (
                  <Txt style={{ fontSize: 13, color: Colors.danger }}>{validationError}</Txt>
                )}

                <Button
                  label={t('wizard.next')}
                  onPress={handleNext}
                  size="lg"
                  fullWidth
                  disabled={!draft.condition}
                  iconRight={<Feather name="arrow-right" size={18} color="#fff" />}
                />
              </>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 5 — DESIRED RESULT
            ════════════════════════════════════════════════════════════════ */}
            {step === 'desired' && (
              <>
                <View style={{ gap: 4 }}>
                  <Txt w="bold" style={{ fontSize: 24, color: Colors.text, lineHeight: 32 }}>
                    {t('wizard.desiredStep.title')}
                  </Txt>
                  <Txt style={{ fontSize: 15, color: Colors.textSecondary }}>
                    {t('wizard.desiredStep.subtitle')}
                  </Txt>
                </View>

                <View style={{ gap: 10 }}>
                  {DESIRED_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      selected={draft.desiredResult === opt.id}
                      onPress={() => { patchDraft({ desiredResult: opt.id }); setValidationError(null); }}
                    />
                  ))}
                </View>

                {validationError && (
                  <Txt style={{ fontSize: 13, color: Colors.danger }}>{validationError}</Txt>
                )}

                <Button
                  label={t('wizard.next')}
                  onPress={handleNext}
                  size="lg"
                  fullWidth
                  disabled={!draft.desiredResult}
                  iconRight={<Feather name="arrow-right" size={18} color="#fff" />}
                />
              </>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 6 — BUDGET
            ════════════════════════════════════════════════════════════════ */}
            {step === 'budget' && (
              <>
                <View style={{ gap: 4 }}>
                  <Txt w="bold" style={{ fontSize: 24, color: Colors.text, lineHeight: 32 }}>
                    {t('wizard.budgetStep.title')}
                  </Txt>
                  <Txt style={{ fontSize: 15, color: Colors.textSecondary }}>
                    {t('wizard.budgetStep.subtitle')}
                  </Txt>
                </View>

                <View style={{ gap: 10 }}>
                  {BUDGET_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      selected={draft.budgetLevel === opt.id}
                      onPress={() => { patchDraft({ budgetLevel: opt.id }); setValidationError(null); }}
                    />
                  ))}
                </View>

                <HintBox text={t('wizard.budgetStep.hint')} />

                {validationError && (
                  <Txt style={{ fontSize: 13, color: Colors.danger }}>{validationError}</Txt>
                )}

                <Button
                  label={t('wizard.next')}
                  onPress={handleNext}
                  size="lg"
                  fullWidth
                  disabled={!draft.budgetLevel}
                  iconRight={<Feather name="arrow-right" size={18} color="#fff" />}
                />
              </>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 7 — DIY MODE
            ════════════════════════════════════════════════════════════════ */}
            {step === 'diy' && (
              <>
                <View style={{ gap: 4 }}>
                  <Txt w="bold" style={{ fontSize: 24, color: Colors.text, lineHeight: 32 }}>
                    {t('wizard.diyStep.title')}
                  </Txt>
                  <Txt style={{ fontSize: 15, color: Colors.textSecondary }}>
                    {t('wizard.diyStep.subtitle')}
                  </Txt>
                </View>

                <View style={{ gap: 10 }}>
                  {DIY_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      selected={draft.diyMode === opt.id}
                      onPress={() => { patchDraft({ diyMode: opt.id }); setValidationError(null); }}
                    />
                  ))}
                </View>

                {selectedJob?.hireProfessionalRecommended && (
                  <WarnBox
                    text={t('wizard.diyStep.proWarning', { jobName: selectedJob.name })}
                  />
                )}

                {draft.diyMode === 'hire' && (
                  <HintBox
                    icon="phone"
                    text={t('wizard.diyStep.hireHint')}
                  />
                )}

                {validationError && (
                  <Txt style={{ fontSize: 13, color: Colors.danger }}>{validationError}</Txt>
                )}

                <Button
                  label={draft.diyMode === 'hire' ? t('wizard.diyStep.hireCta') : t('wizard.next')}
                  onPress={handleNext}
                  size="lg"
                  fullWidth
                  disabled={!draft.diyMode}
                  variant={draft.diyMode === 'hire' ? 'secondary' : 'primary'}
                  iconRight={<Feather name="arrow-right" size={18} color="#fff" />}
                />
              </>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 8 — MEASUREMENTS
            ════════════════════════════════════════════════════════════════ */}
            {step === 'measure' && selectedJob && (
              <>
                <View style={{ gap: 4 }}>
                  <Txt w="bold" style={{ fontSize: 24, color: Colors.text, lineHeight: 32 }}>
                    {t('wizard.measure.title')}
                  </Txt>
                  <Txt style={{ fontSize: 15, color: Colors.textSecondary }}>
                    {t('wizard.measure.subtitle')}
                  </Txt>
                </View>

                <HintBox
                  icon="ruler"
                  text={t('wizard.measure.tapeHint')}
                />

                <View style={{ gap: 16 }}>
                  {selectedJob.measurementInputs.map((inp) => {
                    const isOptional = inp.required === false || inp.defaultValue !== undefined;
                    const val = draft.measurements[inp.id] ?? '';
                    const hasError =
                      validationError &&
                      !isOptional &&
                      (val === '' || isNaN(parseFloat(val)));

                    return (
                      <View key={inp.id} style={{ gap: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, flex: 1 }}>
                            {inp.label}
                          </Txt>
                          {isOptional && (
                            <View
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 6,
                                backgroundColor: Colors.surfaceAlt,
                              }}
                            >
                              <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
                                opcjonalne
                              </Txt>
                            </View>
                          )}
                        </View>

                        {inp.hint && (
                          <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>
                            💡 {inp.hint}
                          </Txt>
                        )}

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TextInput
                            style={{
                              flex: 1,
                              backgroundColor: Colors.surface,
                              borderRadius: 14,
                              paddingHorizontal: 16,
                              paddingVertical: 16,
                              fontSize: 18,
                              fontFamily: 'Inter_600SemiBold',
                              color: Colors.text,
                              borderWidth: 2,
                              borderColor: hasError
                                ? Colors.danger
                                : val
                                ? Colors.primary
                                : Colors.border,
                            }}
                            placeholder={inp.placeholder ?? (inp.defaultValue?.toString() ?? '0')}
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="decimal-pad"
                            value={val}
                            onChangeText={(v) => {
                              patchDraft({ measurements: { ...draft.measurements, [inp.id]: v } });
                              setValidationError(null);
                            }}
                            returnKeyType="done"
                          />
                          <View
                            style={{
                              backgroundColor: Colors.surfaceAlt,
                              borderRadius: 14,
                              paddingHorizontal: 14,
                              justifyContent: 'center',
                              borderWidth: 1,
                              borderColor: Colors.border,
                              minWidth: 56,
                            }}
                          >
                            <Txt
                              w="semibold"
                              style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center' }}
                            >
                              {inp.unit}
                            </Txt>
                          </View>
                        </View>

                        {hasError && (
                          <Txt style={{ fontSize: 12, color: Colors.danger }}>
                            {t('wizard.measure.positiveValue')}
                          </Txt>
                        )}

                        {inp.defaultValue !== undefined && !val && (
                          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
                            {t('wizard.measure.defaultValue', { value: inp.defaultValue, unit: inp.unit })}
                          </Txt>
                        )}
                      </View>
                    );
                  })}

                  {selectedJob.measurementInputs.length === 0 && (
                    <HintBox
                      icon="info"
                      text={t('wizard.measure.noInputs')}
                    />
                  )}
                </View>

                {validationError && !selectedJob.measurementInputs.some((i) =>
                  !draft.measurements[i.id]
                ) && (
                  <Txt style={{ fontSize: 13, color: Colors.danger }}>{validationError}</Txt>
                )}

                <Button
                  label={t('wizard.measure.next')}
                  onPress={handleNext}
                  size="lg"
                  fullWidth
                  iconRight={<Feather name="arrow-right" size={18} color="#fff" />}
                />

                <TouchableOpacity
                  onPress={handleNext}
                  style={{ alignItems: 'center', paddingVertical: 8 }}
                >
                  <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>
                    {t('wizard.measure.skip')}
                  </Txt>
                </TouchableOpacity>
              </>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 9 — SUMMARY
            ════════════════════════════════════════════════════════════════ */}
            {step === 'summary' && (
              <>
                <View style={{ gap: 4 }}>
                  <Txt w="bold" style={{ fontSize: 24, color: Colors.text, lineHeight: 32 }}>
                    {t('wizard.summary.title')}
                  </Txt>
                  <Txt style={{ fontSize: 15, color: Colors.textSecondary }}>
                    {t('wizard.summary.subtitle')}
                  </Txt>
                </View>

                {/* Summary card */}
                <View
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    paddingHorizontal: 16,
                    paddingTop: 4,
                    paddingBottom: 8,
                  }}
                >
                  <SummaryRow
                    label={t('wizard.summary.rowCategory')}
                    value={CATEGORIES.find((c) => c.id === draft.categoryId)?.name ?? t('wizard.summary.dash')}
                    icon="layers"
                    onEdit={() => goTo('category')}
                    editLabel={t('wizard.edit')}
                  />
                  <SummaryRow
                    label={t('wizard.summary.rowRoom')}
                    value={roomLabel}
                    icon="home"
                    onEdit={() => goTo('room')}
                    editLabel={t('wizard.edit')}
                  />
                  <SummaryRow
                    label={t('wizard.summary.rowJob')}
                    value={selectedJob?.name ?? t('wizard.summary.dash')}
                    icon={selectedJob?.coverIcon ?? 'tool'}
                    onEdit={() => goTo('job')}
                    editLabel={t('wizard.edit')}
                  />
                  <SummaryRow
                    label={t('wizard.summary.rowCondition')}
                    value={draft.condition ? conditionLabel[draft.condition] : t('wizard.summary.dash')}
                    icon="activity"
                    onEdit={() => goTo('condition')}
                    editLabel={t('wizard.edit')}
                  />
                  <SummaryRow
                    label={t('wizard.summary.rowDesired')}
                    value={draft.desiredResult ? desiredLabel[draft.desiredResult] : t('wizard.summary.dash')}
                    icon="star"
                    onEdit={() => goTo('desired')}
                    editLabel={t('wizard.edit')}
                  />
                  <SummaryRow
                    label={t('wizard.summary.rowBudget')}
                    value={draft.budgetLevel ? budgetLabel[draft.budgetLevel] : t('wizard.summary.dash')}
                    icon="tag"
                    onEdit={() => goTo('budget')}
                    editLabel={t('wizard.edit')}
                  />
                  <SummaryRow
                    label={t('wizard.summary.rowDiy')}
                    value={draft.diyMode ? diyLabel[draft.diyMode] : t('wizard.summary.dash')}
                    icon="tool"
                    onEdit={() => goTo('diy')}
                    editLabel={t('wizard.edit')}
                  />

                  {/* Measurements */}
                  {selectedJob && selectedJob.measurementInputs.length > 0 && (
                    <View>
                      {selectedJob.measurementInputs.map((inp) => {
                        const val = draft.measurements[inp.id];
                        const displayVal = val
                          ? `${val} ${inp.unit}`
                          : inp.defaultValue
                          ? t('wizard.summary.defaultSuffix', { value: inp.defaultValue, unit: inp.unit })
                          : t('wizard.summary.dashUnit', { unit: inp.unit });
                        return (
                          <SummaryRow
                            key={inp.id}
                            label={inp.label}
                            value={displayVal}
                            icon="maximize-2"
                            onEdit={() => goTo('measure')}
                            editLabel={t('wizard.edit')}
                          />
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Project name input (optional customization) */}
                <View style={{ gap: 8 }}>
                  <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
                    {t('wizard.summary.nameLabel')}
                  </Txt>
                  <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>
                    {t('wizard.summary.nameHint')}
                  </Txt>
                  <TextInput
                    style={{
                      backgroundColor: Colors.surface,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      fontFamily: 'Inter_500Medium',
                      color: Colors.text,
                      borderWidth: 1.5,
                      borderColor: Colors.border,
                    }}
                    placeholder={t('wizard.summary.namePlaceholder', {
                      job: selectedJob?.name ?? t('wizard.summary.fallbackProjectName'),
                      room: roomLabel || t('wizard.summary.fallbackRoom'),
                    })}
                    placeholderTextColor={Colors.textMuted}
                    value={draft.projectName}
                    onChangeText={(v) => patchDraft({ projectName: v })}
                    returnKeyType="done"
                    maxLength={100}
                  />
                </View>

                {/* Professional recommendation warning */}
                {selectedJob?.hireProfessionalRecommended && (
                  <WarnBox
                    text={t('wizard.summary.proWarning', { jobName: selectedJob.name })}
                  />
                )}

                {/* DIY compare hint */}
                {draft.diyMode === 'compare' && (
                  <HintBox
                    icon="bar-chart"
                    text={t('wizard.summary.compareHint')}
                  />
                )}

                <Button
                  label={saving ? t('wizard.summary.calculating') : t('wizard.summary.calculate')}
                  onPress={handleSave}
                  size="lg"
                  fullWidth
                  loading={saving}
                  icon={<Feather name="zap" size={18} color="#fff" />}
                />

                <Txt style={{ fontSize: 12, color: Colors.textMuted, textAlign: 'center' }}>
                  {t('wizard.summary.savedNote')}
                </Txt>
              </>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
