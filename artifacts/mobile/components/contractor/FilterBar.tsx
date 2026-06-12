import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { CATEGORIES } from '@/data/categories';
import type { ContractorSearchFilters, ContractorSortOption } from '@/types/contractor';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/constants/i18n';

const SORT_OPTIONS: { value: ContractorSortOption; labelKey: TranslationKey }[] = [
  { value: 'best-match', labelKey: 'cmp.FilterBar.sort.bestMatch' },
  { value: 'quality-score', labelKey: 'cmp.FilterBar.sort.qualityScore' },
  { value: 'nearest', labelKey: 'cmp.FilterBar.sort.nearest' },
  { value: 'verified-first', labelKey: 'cmp.FilterBar.sort.verifiedFirst' },
  { value: 'newest', labelKey: 'cmp.FilterBar.sort.newest' },
  { value: 'promoted', labelKey: 'cmp.FilterBar.sort.promoted' },
  { value: 'rating', labelKey: 'cmp.FilterBar.sort.rating' },
];

interface Props {
  filters: ContractorSearchFilters;
  sortOption: ContractorSortOption;
  onFiltersChange: (f: ContractorSearchFilters) => void;
  onSortChange: (s: ContractorSortOption) => void;
  onReset: () => void;
  resultCount: number;
}

export function FilterBar({ filters, sortOption, onFiltersChange, onSortChange, onReset, resultCount }: Props) {
  const { t } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const hasFilters = !!(filters.categoryId || filters.city || filters.verifiedOnly || filters.availableSoon);

  return (
    <>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 8 }}>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: hasFilters ? Colors.primaryBg : Colors.surface,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: hasFilters ? Colors.primaryLight : Colors.border,
          }}
        >
          <Feather name="sliders" size={14} color={hasFilters ? Colors.primary : Colors.textSecondary} />
          <Txt w="medium" style={{ fontSize: 13, color: hasFilters ? Colors.primary : Colors.textSecondary }}>
            {t('cmp.FilterBar.filters')}{hasFilters ? ' ●' : ''}
          </Txt>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowSort(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: Colors.surface,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Feather name="bar-chart-2" size={14} color={Colors.textSecondary} />
          <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>{t('cmp.FilterBar.sort')}</Txt>
        </TouchableOpacity>

        {hasFilters && (
          <TouchableOpacity
            onPress={onReset}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 8,
            }}
          >
            <Feather name="x" size={14} color={Colors.danger} />
            <Txt style={{ fontSize: 12, color: Colors.danger }}>{t('cmp.FilterBar.clear')}</Txt>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />
        <Txt style={{ fontSize: 12, color: Colors.textMuted, alignSelf: 'center' }}>
          {resultCount} {resultCount === 1 ? t('cmp.FilterBar.resultOne') : t('cmp.FilterBar.resultMany')}
        </Txt>
      </View>

      <Modal visible={showFilters} animationType="slide" transparent>
        <FilterModal
          filters={filters}
          onChange={onFiltersChange}
          onClose={() => setShowFilters(false)}
        />
      </Modal>

      <Modal visible={showSort} animationType="slide" transparent>
        <SortModal
          current={sortOption}
          onChange={(s) => { onSortChange(s); setShowSort(false); }}
          onClose={() => setShowSort(false)}
        />
      </Modal>
    </>
  );
}

function FilterModal({
  filters,
  onChange,
  onClose,
}: {
  filters: ContractorSearchFilters;
  onChange: (f: ContractorSearchFilters) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [local, setLocal] = useState(filters);
  const topPad = Platform.OS === 'web' ? 80 : 100;

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
      <View
        style={{
          backgroundColor: Colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 20,
          paddingBottom: 40,
          paddingHorizontal: 20,
          maxHeight: '80%',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>{t('cmp.FilterBar.filtersTitle')}</Txt>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Feather name="x" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>{t('cmp.FilterBar.specialty')}</Txt>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <ChipButton
                label={t('cmp.FilterBar.all')}
                selected={!local.categoryId}
                onPress={() => setLocal({ ...local, categoryId: undefined })}
              />
              {CATEGORIES.slice(0, 10).map((cat) => (
                <ChipButton
                  key={cat.id}
                  label={cat.name}
                  selected={local.categoryId === cat.id}
                  onPress={() => setLocal({ ...local, categoryId: cat.id === local.categoryId ? undefined : cat.id })}
                />
              ))}
            </View>
          </ScrollView>

          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>{t('cmp.FilterBar.options')}</Txt>
          <ToggleRow
            label={t('cmp.FilterBar.verifiedOnly')}
            value={!!local.verifiedOnly}
            onToggle={() => setLocal({ ...local, verifiedOnly: !local.verifiedOnly })}
          />
          <ToggleRow
            label={t('cmp.FilterBar.availableSoon')}
            value={!!local.availableSoon}
            onToggle={() => setLocal({ ...local, availableSoon: !local.availableSoon })}
          />
        </ScrollView>

        <View style={{ marginTop: 16 }}>
          <Button
            label={t('cmp.FilterBar.showResults')}
            variant="primary"
            onPress={() => { onChange(local); onClose(); }}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

function SortModal({
  current,
  onChange,
  onClose,
}: {
  current: ContractorSortOption;
  onChange: (s: ContractorSortOption) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
      <View
        style={{
          backgroundColor: Colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 20,
          paddingBottom: 40,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>{t('cmp.FilterBar.sortTitle')}</Txt>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Feather name="x" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: Colors.borderLight,
            }}
            activeOpacity={0.7}
          >
            <Txt
              w={current === opt.value ? 'bold' : 'regular'}
              style={{ fontSize: 15, color: current === opt.value ? Colors.primary : Colors.text }}
            >
              {t(opt.labelKey)}
            </Txt>
            {current === opt.value && <Feather name="check" size={18} color={Colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ChipButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: selected ? Colors.primary : Colors.surface,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: selected ? Colors.primary : Colors.border,
      }}
      activeOpacity={0.7}
    >
      <Txt w={selected ? 'semibold' : 'regular'} style={{ fontSize: 13, color: selected ? '#fff' : Colors.textSecondary }}>
        {label}
      </Txt>
    </TouchableOpacity>
  );
}

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
      }}
      activeOpacity={0.7}
    >
      <Txt style={{ fontSize: 14, color: Colors.text }}>{label}</Txt>
      <View
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          backgroundColor: value ? Colors.primary : Colors.surfaceAlt,
          justifyContent: 'center',
          paddingHorizontal: 2,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#fff',
            alignSelf: value ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
