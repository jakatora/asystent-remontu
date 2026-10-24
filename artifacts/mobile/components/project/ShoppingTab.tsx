import { getProductPhoto } from '@/data/products/photos';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import type { ShoppingItem, RenovationJob, CalculationResult, BudgetEstimate } from '@/types/domain';
import { ShoppingItemCard } from './ShoppingItemCard';
import { SummaryRow, Divider } from './SummaryRow';
import { CONTINGENCY_RATE } from './types';
import { getEffectivePrice } from './helpers';
import type { ShoppingEditState } from './types';
import { useLanguage } from '@/context/LanguageContext';

interface ShoppingTabProps {
  shoppingItems: ShoppingItem[];
  job: RenovationJob;
  calc: CalculationResult | undefined;
  budget: BudgetEstimate | null;
  editState: ShoppingEditState;
  onGenerateShoppingList: () => Promise<void>;
  onTogglePurchased: (item: ShoppingItem) => Promise<void>;
  onToggleOwned: (item: ShoppingItem) => Promise<void>;
  onStartEdit: (item: ShoppingItem) => void;
  onSaveEdit: (item: ShoppingItem) => Promise<void>;
  onRemoveItem: (item: ShoppingItem) => void;
  onShare: () => Promise<void>;
}

export function ShoppingTab({
  shoppingItems,
  job,
  calc,
  budget,
  editState,
  onGenerateShoppingList,
  onTogglePurchased,
  onToggleOwned,
  onStartEdit,
  onSaveEdit,
  onRemoveItem,
  onShare,
}: ShoppingTabProps) {
  const { t } = useLanguage();
  const materialItems = shoppingItems.filter((i) => i.itemType === 'material');
  const toolItems = shoppingItems.filter((i) => i.itemType === 'tool');
  const toBuyMaterials = materialItems.filter((i) => !i.owned);
  const toBuyTools = toolItems.filter((i) => !i.owned);
  const ownedItems = shoppingItems.filter((i) => i.owned);
  const nonOwnedItems = shoppingItems.filter((i) => !i.owned);
  const purchasedCount = nonOwnedItems.filter((i) => i.purchased).length;

  const totalMaterials = toBuyMaterials.reduce((s, i) => s + getEffectivePrice(i), 0);
  const totalTools = toBuyTools.reduce((s, i) => s + getEffectivePrice(i), 0);
  const totalAll = totalMaterials + totalTools;
  const contingency = totalAll * CONTINGENCY_RATE;
  const grandTotal = totalAll + contingency;

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
          {t('cmp.ShoppingTab.title')}
        </Txt>
        {shoppingItems.length > 0 && (
          <TouchableOpacity
            onPress={onShare}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: Colors.surfaceAlt,
              borderRadius: 10,
            }}
          >
            <Feather name="share" size={14} color={Colors.textSecondary} />
            <Txt w="medium" style={{ fontSize: 12, color: Colors.textSecondary }}>{t('cmp.ShoppingTab.share')}</Txt>
          </TouchableOpacity>
        )}
      </View>

      {shoppingItems.length === 0 ? (
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 32 }}>
          <Feather name="shopping-cart" size={40} color={Colors.textMuted} />
          <Txt w="semibold" style={{ fontSize: 18, color: Colors.textSecondary }}>
            {t('cmp.ShoppingTab.emptyTitle')}
          </Txt>
          <Txt style={{ fontSize: 14, color: Colors.textMuted, textAlign: 'center', maxWidth: 260 }}>
            {t('cmp.ShoppingTab.emptyBody')}
          </Txt>
          <Button
            label={t('cmp.ShoppingTab.generateList')}
            onPress={onGenerateShoppingList}
            icon={<Feather name="shopping-cart" size={16} color="#fff" />}
          />
        </View>
      ) : (
        <>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>{t('cmp.ShoppingTab.purchased')}</Txt>
              <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>
                {t('cmp.ShoppingTab.purchasedCount', { purchased: purchasedCount, total: nonOwnedItems.length })}
              </Txt>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: Colors.border, overflow: 'hidden' }}>
              <View
                style={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: Colors.success,
                  width: `${nonOwnedItems.length > 0 ? (purchasedCount / nonOwnedItems.length) * 100 : 100}%`,
                }}
              />
            </View>
          </View>

          <ShoppingSection
            job={job}
            calc={calc}
            icon="package"
            iconColor={Colors.primary}
            title={t('cmp.ShoppingTab.materials')}
            items={toBuyMaterials}
            total={totalMaterials}
            totalColor={Colors.text}
            editState={editState}
            onTogglePurchased={onTogglePurchased}
            onToggleOwned={onToggleOwned}
            onStartEdit={onStartEdit}
            onSaveEdit={onSaveEdit}
            onRemoveItem={onRemoveItem}
          />

          <ShoppingSection
            job={job}
            calc={calc}
            icon="tool"
            iconColor={Colors.info}
            title={t('cmp.ShoppingTab.tools')}
            items={toBuyTools}
            total={totalTools}
            totalColor={Colors.info}
            editState={editState}
            onTogglePurchased={onTogglePurchased}
            onToggleOwned={onToggleOwned}
            onStartEdit={onStartEdit}
            onSaveEdit={onSaveEdit}
            onRemoveItem={onRemoveItem}
          />

          {ownedItems.length > 0 && (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="home" size={16} color={Colors.success} />
                <Txt w="semibold" style={{ fontSize: 15, color: Colors.textSecondary }}>
                  {t('cmp.ShoppingTab.alreadyHave', { count: ownedItems.length })}
                </Txt>
              </View>
              {ownedItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: Colors.successBg,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#BBF7D0',
                    opacity: 0.8,
                  }}
                  onPress={() => onToggleOwned(item)}
                  activeOpacity={0.7}
                >
                  <Feather name="check-circle" size={20} color={Colors.success} />
                  <View style={{ flex: 1 }}>
                    <Txt w="medium" style={{ fontSize: 14, color: Colors.textSecondary }}>{item.name}</Txt>
                    <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{t('cmp.ShoppingTab.tapToRestore')}</Txt>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Feather name={item.itemType === 'tool' ? 'tool' : 'package'} size={12} color={Colors.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              overflow: 'hidden',
              marginTop: 4,
            }}
          >
            <View style={{ padding: 14, backgroundColor: Colors.primaryBg }}>
              <Txt w="bold" style={{ fontSize: 15, color: Colors.primaryDark }}>{t('cmp.ShoppingTab.costSummary')}</Txt>
            </View>
            <SummaryRow icon="package" label={t('cmp.ShoppingTab.materials')} value={formatCurrency(totalMaterials)} />
            <Divider />
            <SummaryRow icon="tool" label={t('cmp.ShoppingTab.tools')} value={formatCurrency(totalTools)} valueColor={Colors.info} />
            <Divider />
            <SummaryRow
              icon="shield"
              label={t('cmp.ShoppingTab.reserve', { percent: Math.round(CONTINGENCY_RATE * 100) })}
              value={`+${formatCurrency(contingency)}`}
              valueColor={Colors.warning}
            />
            <Divider />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: Colors.primaryBg }}>
              <Txt w="bold" style={{ fontSize: 16, color: Colors.primaryDark }}>{t('cmp.ShoppingTab.totalWithReserve')}</Txt>
              <Txt w="bold" style={{ fontSize: 20, color: Colors.primary }}>{formatCurrency(grandTotal)}</Txt>
            </View>
          </View>

          <View style={{ gap: 10, marginTop: 4 }}>
            <Button
              label={t('cmp.ShoppingTab.refreshList')}
              variant="outline"
              onPress={onGenerateShoppingList}
              fullWidth
            />
          </View>
        </>
      )}
    </View>
  );
}

function ShoppingSection({
  job,
  calc,
  icon,
  iconColor,
  title,
  items,
  total,
  totalColor,
  editState,
  onTogglePurchased,
  onToggleOwned,
  onStartEdit,
  onSaveEdit,
  onRemoveItem,
}: {
  job: RenovationJob;
  calc?: CalculationResult;
  icon: string;
  iconColor: string;
  title: string;
  items: ShoppingItem[];
  total: number;
  totalColor: string;
  editState: ShoppingEditState;
  onTogglePurchased: (item: ShoppingItem) => Promise<void>;
  onToggleOwned: (item: ShoppingItem) => Promise<void>;
  onStartEdit: (item: ShoppingItem) => void;
  onSaveEdit: (item: ShoppingItem) => Promise<void>;
  onRemoveItem: (item: ShoppingItem) => void;
}) {
  const { t } = useLanguage();
  if (items.length === 0) return null;

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name={icon as any} size={16} color={iconColor} />
        <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
          {title} ({items.length})
        </Txt>
      </View>
      {items.map((item) => {
        const line = calc?.materials.find(line => line.material.id === item.materialId);
        const product = line?.material ?? job.materials.find(material => material.id === item.materialId);
        const packageLabel = line?.packs !== undefined && product?.packaging
          ? t('upgrade.product.packagingLabel', { count: line.packs, label: product.packaging.label })
          : undefined;
        return <ShoppingItemCard
          key={item.id}
          item={item}
          imageUrl={getProductPhoto(product ?? { id: item.materialId })}
          packageLabel={packageLabel}
          editing={editState.editingId === item.id}
          editPrice={editState.editPrice}
          editQty={editState.editQty}
          onEditPrice={editState.setEditPrice}
          onEditQty={editState.setEditQty}
          onTogglePurchased={() => onTogglePurchased(item)}
          onToggleOwned={() => onToggleOwned(item)}
          onStartEdit={() => onStartEdit(item)}
          onSaveEdit={() => onSaveEdit(item)}
          onCancelEdit={() => editState.setEditingId(null)}
          onRemove={() => onRemoveItem(item)}
        />;
      })}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 6 }}>
        <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>{t('cmp.ShoppingTab.sectionTotal', { title })}</Txt>
        <Txt w="bold" style={{ fontSize: 15, color: totalColor }}>{formatCurrency(total)}</Txt>
      </View>
    </View>
  );
}
