import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { houseBuildPricingRepo } from '@/db/repositories/house-build-pricing.repo';
import { PRICE_CATEGORY_LABELS, PRICE_CATEGORY_ORDER, PRICE_DISCLAIMER } from '@/features/house-build/house-build-prices';
import type { HouseBuildPriceReference, HouseBuildPriceOverride, PriceCategory, PriceSourceType } from '@/types/house-build';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/constants/i18n';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const SOURCE_TYPE_LABEL_KEYS: Record<PriceSourceType, TranslationKey> = {
  'market-planning': 'hb.pricingReferences.sourceType.marketPlanning',
  'regional-estimate': 'hb.pricingReferences.sourceType.regionalEstimate',
  'operator-tariff-reference': 'hb.pricingReferences.sourceType.operatorTariff',
};

export default function PricingReferencesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [references, setReferences] = useState<HouseBuildPriceReference[]>([]);
  const [overrides, setOverrides] = useState<HouseBuildPriceOverride[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<PriceCategory | null>(null);
  const [editingRef, setEditingRef] = useState<string | null>(null);
  const [editMin, setEditMin] = useState('');
  const [editMax, setEditMax] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const loadData = useCallback(async () => {
    await houseBuildPricingRepo.seedReferences();
    const refs = await houseBuildPricingRepo.getReferences();
    setReferences(refs);
    if (projectId) {
      const ov = await houseBuildPricingRepo.getOverrides(projectId);
      setOverrides(ov);
    }
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const overrideMap = useMemo(() => {
    const m = new Map<string, HouseBuildPriceOverride>();
    overrides.forEach((o) => m.set(o.referenceId, o));
    return m;
  }, [overrides]);

  const groupedRefs = useMemo(() => {
    const groups: Record<string, HouseBuildPriceReference[]> = {};
    for (const ref of references) {
      if (!groups[ref.category]) groups[ref.category] = [];
      groups[ref.category].push(ref);
    }
    return groups;
  }, [references]);

  const formatPrice = (n: number) => n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatAmount = (n: number) => n.toLocaleString('pl-PL', { maximumFractionDigits: 0 });

  const handleSaveOverride = useCallback(async (ref: HouseBuildPriceReference) => {
    if (!projectId) return;
    await houseBuildPricingRepo.upsertOverride(projectId, ref.id, ref.itemKey, {
      overrideMin: editMin ? parseFloat(editMin) : null,
      overrideMax: editMax ? parseFloat(editMax) : null,
      overrideBaseline: editMin && editMax ? (parseFloat(editMin) + parseFloat(editMax)) / 2 : null,
      notes: editNotes || '',
    });
    setEditingRef(null);
    setEditMin('');
    setEditMax('');
    setEditNotes('');
    await loadData();
  }, [projectId, editMin, editMax, editNotes, loadData]);

  const handleDeleteOverride = useCallback(async (overrideId: string) => {
    Alert.alert(t('hb.pricingReferences.restoreTitle'), t('hb.pricingReferences.restoreBody'), [
      { text: t('hb.pricingReferences.cancelCta'), style: 'cancel' },
      { text: t('hb.pricingReferences.restoreConfirm'), style: 'destructive', onPress: async () => {
        await houseBuildPricingRepo.deleteOverride(overrideId);
        await loadData();
      }},
    ]);
  }, [loadData, t]);

  const handleResetAll = useCallback(() => {
    if (!projectId) return;
    Alert.alert(t('hb.pricingReferences.resetTitle'), t('hb.pricingReferences.resetBody'), [
      { text: t('hb.pricingReferences.cancelCta'), style: 'cancel' },
      { text: t('hb.pricingReferences.resetConfirm'), style: 'destructive', onPress: async () => {
        await houseBuildPricingRepo.resetOverrides(projectId);
        await loadData();
      }},
    ]);
  }, [projectId, loadData, t]);

  const startEdit = (ref: HouseBuildPriceReference) => {
    const ov = overrideMap.get(ref.id);
    setEditingRef(ref.id);
    setEditMin(ov?.overrideMin?.toString() ?? ref.priceMin.toString());
    setEditMax(ov?.overrideMax?.toString() ?? ref.priceMax.toString());
    setEditNotes(ov?.notes ?? '');
  };

  return (
    <>
      <Stack.Screen options={{ title: t('hb.pricingReferences.title') }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: HB_ACCENT_BG, borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 16,
          }}>
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>{t('hb.pricingReferences.heroTitle')}</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              {t('hb.pricingReferences.heroSubtitle')}
            </Txt>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{t('hb.pricingReferences.refCount', { count: references.length })}</Txt>
              <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{t('hb.pricingReferences.overrideCount', { count: overrides.length })}</Txt>
            </View>
          </View>

          <View style={{
            backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 16,
            borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', gap: 8,
          }}>
            <Feather name="info" size={14} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 11, color: '#92400E', flex: 1 }}>{PRICE_DISCLAIMER}</Txt>
          </View>

          <View style={{
            backgroundColor: '#EFF6FF', borderRadius: 10, padding: 10, marginBottom: 12,
            borderWidth: 1, borderColor: '#BFDBFE', flexDirection: 'row', gap: 8,
          }}>
            <Feather name="map-pin" size={12} color={HB_ACCENT} style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 10, color: '#1E40AF', flex: 1 }}>
              {t('hb.pricingReferences.regionNote')}
            </Txt>
          </View>

          {overrides.length > 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, marginBottom: 12,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                borderWidth: 1, borderColor: '#FECACA',
              }}
              onPress={handleResetAll}
            >
              <Feather name="refresh-cw" size={12} color="#DC2626" />
              <Txt style={{ fontSize: 11, color: '#DC2626' }}>{t('hb.pricingReferences.resetAll', { count: overrides.length })}</Txt>
            </TouchableOpacity>
          )}

          {PRICE_CATEGORY_ORDER.map((cat) => {
            const items = groupedRefs[cat];
            if (!items || items.length === 0) return null;
            const isExpanded = expandedCategory === cat;

            return (
              <View key={cat} style={{ marginBottom: 8 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
                    borderWidth: 1, borderColor: isExpanded ? '#BFDBFE' : Colors.border,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  }}
                  onPress={() => setExpandedCategory(isExpanded ? null : cat)}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1 }}>
                    <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>
                      {PRICE_CATEGORY_LABELS[cat]}
                    </Txt>
                    <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{t('hb.pricingReferences.itemCount', { count: items.length })}</Txt>
                  </View>
                  <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
                </TouchableOpacity>

                {isExpanded && items.map((ref) => {
                  const ov = overrideMap.get(ref.id);
                  const hasOverride = !!ov;
                  const displayMin = ov?.overrideMin ?? ref.priceMin;
                  const displayMax = ov?.overrideMax ?? ref.priceMax;
                  const isEditing = editingRef === ref.id;

                  return (
                    <View key={ref.id} style={{
                      backgroundColor: hasOverride ? '#F0FDF4' : '#F8FAFC',
                      borderRadius: 10, padding: 12, marginTop: 4,
                      borderWidth: 1, borderColor: hasOverride ? '#BBF7D0' : '#E2E8F0',
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>{ref.label}</Txt>
                          <View style={{ flexDirection: 'row', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{ref.unit}</Txt>
                            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>|</Txt>
                            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{ref.regionLabel}</Txt>
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          {displayMin === displayMax ? (
                            <Txt w="bold" style={{ fontSize: 13, color: hasOverride ? '#16A34A' : HB_ACCENT }}>
                              {formatPrice(displayMin)} zl
                            </Txt>
                          ) : (
                            <Txt w="bold" style={{ fontSize: 13, color: hasOverride ? '#16A34A' : HB_ACCENT }}>
                              {formatAmount(displayMin)} - {formatAmount(displayMax)} zl
                            </Txt>
                          )}
                          {hasOverride && (
                            <Txt style={{ fontSize: 9, color: '#16A34A' }}>{t('hb.pricingReferences.overriddenBadge')}</Txt>
                          )}
                        </View>
                      </View>

                      {ref.notes ? (
                        <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 4 }}>{ref.notes}</Txt>
                      ) : null}

                      <View style={{ flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                        <View style={{ backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                          <Txt style={{ fontSize: 8, color: Colors.textMuted }}>
                            {t(SOURCE_TYPE_LABEL_KEYS[ref.sourceType])}
                          </Txt>
                        </View>
                        <View style={{ backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                          <Txt style={{ fontSize: 8, color: Colors.textMuted }}>{t('hb.pricingReferences.updatedShort', { date: ref.lastUpdated })}</Txt>
                        </View>
                      </View>
                      {ref.sourceName ? (
                        <Txt style={{ fontSize: 8, color: Colors.textMuted, marginTop: 2 }}>{t('hb.pricingReferences.sourceName', { name: ref.sourceName })}</Txt>
                      ) : null}
                      {ref.confidenceNote ? (
                        <Txt style={{ fontSize: 8, color: '#92400E', marginTop: 1 }}>{ref.confidenceNote}</Txt>
                      ) : null}

                      {isEditing ? (
                        <View style={{ marginTop: 8, gap: 6 }}>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={{ flex: 1 }}>
                              <Txt style={{ fontSize: 10, color: Colors.textMuted, marginBottom: 2 }}>{t('hb.pricingReferences.minLabel')}</Txt>
                              <TextInput
                                style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: Colors.border }}
                                value={editMin} onChangeText={setEditMin}
                                keyboardType="numeric" placeholder={ref.priceMin.toString()}
                                placeholderTextColor={Colors.textMuted}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Txt style={{ fontSize: 10, color: Colors.textMuted, marginBottom: 2 }}>{t('hb.pricingReferences.maxLabel')}</Txt>
                              <TextInput
                                style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: Colors.border }}
                                value={editMax} onChangeText={setEditMax}
                                keyboardType="numeric" placeholder={ref.priceMax.toString()}
                                placeholderTextColor={Colors.textMuted}
                              />
                            </View>
                          </View>
                          <TextInput
                            style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, fontSize: 12, color: Colors.text, borderWidth: 1, borderColor: Colors.border }}
                            value={editNotes} onChangeText={setEditNotes}
                            placeholder={t('hb.pricingReferences.notesPlaceholder')}
                            placeholderTextColor={Colors.textMuted}
                          />
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                              style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 8, alignItems: 'center' }}
                              onPress={() => handleSaveOverride(ref)}
                            >
                              <Txt w="semibold" style={{ fontSize: 12, color: '#fff' }}>{t('hb.pricingReferences.saveCta')}</Txt>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }}
                              onPress={() => setEditingRef(null)}
                            >
                              <Txt style={{ fontSize: 12, color: Colors.text }}>{t('hb.pricingReferences.cancelCta')}</Txt>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                          <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
                            onPress={() => startEdit(ref)}
                          >
                            <Feather name="edit-2" size={10} color={HB_ACCENT} />
                            <Txt style={{ fontSize: 10, color: HB_ACCENT }}>{t('hb.pricingReferences.editCta')}</Txt>
                          </TouchableOpacity>
                          {hasOverride && ov && (
                            <TouchableOpacity
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
                              onPress={() => handleDeleteOverride(ov.id)}
                            >
                              <Feather name="rotate-ccw" size={10} color="#DC2626" />
                              <Txt style={{ fontSize: 10, color: '#DC2626' }}>{t('hb.pricingReferences.restoreCta')}</Txt>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}

          <View style={{ marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
              {t('hb.pricingReferences.dbFootnote', { count: references.length })}
            </Txt>
            <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>
              {t('hb.pricingReferences.regionsFootnote')}
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
