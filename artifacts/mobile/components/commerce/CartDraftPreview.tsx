import React from 'react';
import { View, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import { MappingStatusChip } from './MappingStatusChip';
import type { CartDraft, CartDraftLine } from '@/types/commerce';
import { useLanguage } from '@/context/LanguageContext';

interface CartDraftPreviewProps {
  draft: CartDraft;
  onToggleLine: (lineId: string, included: boolean) => void;
  onPrepareCheckout: () => void;
  checkoutReady: boolean;
  checkoutReasons: string[];
}

export function CartDraftPreview({
  draft,
  onToggleLine,
  onPrepareCheckout,
  checkoutReady,
  checkoutReasons,
}: CartDraftPreviewProps) {
  const { t } = useLanguage();
  const { summary } = draft;

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name="shopping-cart" size={18} color={Colors.primary} />
        <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>{t('cmp.CartDraftPreview.title')}</Txt>
      </View>

      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 12,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{t('cmp.CartDraftPreview.mappedProducts')}</Txt>
          <Txt w="semibold" style={{ fontSize: 12, color: '#059669' }}>
            {summary.mappedLines} / {summary.totalLines}
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{t('cmp.CartDraftPreview.materials')}</Txt>
          <Txt style={{ fontSize: 12, color: Colors.text }}>{summary.materialLines}</Txt>
        </View>
        {summary.toolsIncluded && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{t('cmp.CartDraftPreview.tools')}</Txt>
            <Txt style={{ fontSize: 12, color: Colors.text }}>{summary.toolLines}</Txt>
          </View>
        )}
        {summary.unmappedLines > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{t('cmp.CartDraftPreview.unmapped')}</Txt>
            <Txt style={{ fontSize: 12, color: '#92400E' }}>{summary.unmappedLines}</Txt>
          </View>
        )}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            paddingTop: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Txt w="bold" style={{ fontSize: 14, color: Colors.text }}>{t('cmp.CartDraftPreview.estimatedAmount')}</Txt>
          <Txt w="bold" style={{ fontSize: 14, color: Colors.primary }}>
            {formatCurrency(summary.estimatedSubtotal)}
          </Txt>
        </View>
      </View>

      <View style={{ gap: 6 }}>
        {draft.lines.map((line) => (
          <CartDraftLineRow
            key={line.lineId}
            line={line}
            onToggle={(included) => onToggleLine(line.lineId, included)}
          />
        ))}
      </View>

      {summary.unmappedLines > 0 && (
        <View
          style={{
            backgroundColor: '#FEF9C3',
            borderRadius: 10,
            padding: 10,
            gap: 4,
            borderWidth: 1,
            borderColor: '#FDE68A',
          }}
        >
          <Txt w="medium" style={{ fontSize: 11, color: '#92400E' }}>
            {t('cmp.CartDraftPreview.unmappedWarning', { count: summary.unmappedLines })}
          </Txt>
          <Txt style={{ fontSize: 10, color: '#78350F' }}>
            {t('cmp.CartDraftPreview.unmappedHint')}
          </Txt>
        </View>
      )}

      <TouchableOpacity
        onPress={onPrepareCheckout}
        disabled={!checkoutReady}
        style={{
          backgroundColor: checkoutReady ? Colors.primary : Colors.textMuted,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: 'center',
          gap: 4,
        }}
        activeOpacity={0.8}
      >
        <Txt w="bold" style={{ fontSize: 15, color: Colors.textOnPrimary }}>
          {t('cmp.CartDraftPreview.prepareOrder')}
        </Txt>
        {!checkoutReady && checkoutReasons.length > 0 && (
          <Txt style={{ fontSize: 10, color: Colors.textOnPrimary + 'AA' }}>
            {checkoutReasons[0]}
          </Txt>
        )}
      </TouchableOpacity>
    </View>
  );
}

function CartDraftLineRow({
  line,
  onToggle,
}: {
  line: CartDraftLine;
  onToggle: (included: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: line.included ? Colors.border : Colors.textMuted + '30',
        padding: 10,
        gap: 8,
        opacity: line.included ? 1 : 0.5,
      }}
    >
      <Switch
        value={line.included}
        onValueChange={onToggle}
        trackColor={{ false: Colors.textMuted + '40', true: Colors.primary + '60' }}
        thumbColor={line.included ? Colors.primary : Colors.textMuted}
        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
      />
      <View style={{ flex: 1, gap: 2 }}>
        <Txt w="medium" style={{ fontSize: 12, color: Colors.text }} numberOfLines={1}>
          {line.internalName}
        </Txt>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
            × {line.effectiveQuantity} {line.packageUnit ?? ''}
          </Txt>
          <MappingStatusChip status={line.mappingStatus} compact />
        </View>
      </View>
      <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>
        {formatCurrency(line.lineTotal)}
      </Txt>
    </View>
  );
}
