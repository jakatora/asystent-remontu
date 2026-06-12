import type { ShoppingItem, Difficulty } from '@/types/domain';
import type { TranslationKey } from '@/constants/translations';
import type { DiyAssessmentResult } from './types';
import { CONTINGENCY_RATE } from './types';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

export function diyAssessment(difficulty: Difficulty, hirePro: boolean, t: Translate): DiyAssessmentResult {
  if (hirePro || difficulty === 'hard') {
    return {
      level: 'hire',
      color: Colors.danger,
      bg: Colors.dangerBg,
      icon: 'alert-triangle',
      headline: t('cmp.diy.hire.headline'),
      details: t('cmp.diy.hire.details'),
    };
  }
  if (difficulty === 'medium') {
    return {
      level: 'moderate',
      color: Colors.warning,
      bg: Colors.warningBg,
      icon: 'alert-circle',
      headline: t('cmp.diy.moderate.headline'),
      details: t('cmp.diy.moderate.details'),
    };
  }
  return {
    level: 'easy',
    color: Colors.success,
    bg: Colors.successBg,
    icon: 'check-circle',
    headline: t('cmp.diy.easy.headline'),
    details: t('cmp.diy.easy.details'),
  };
}

export function getEffectivePrice(item: ShoppingItem): number {
  return item.customPrice ?? item.estimatedPrice;
}

export function getEffectiveQuantity(item: ShoppingItem): number {
  return item.customQuantity ?? item.quantity;
}

export function buildShareText(
  projectName: string,
  materials: ShoppingItem[],
  tools: ShoppingItem[],
  totalMaterials: number,
  totalTools: number,
  contingency: number,
  t: Translate,
): string {
  let text = `${t('cmp.share.header', { projectName })}\n\n`;
  if (materials.length > 0) {
    text += `${t('cmp.share.materials')}\n`;
    for (const item of materials) {
      const check = item.purchased ? '[x]' : (item.owned ? '[+]' : '[ ]');
      const qty = getEffectiveQuantity(item);
      const price = getEffectivePrice(item);
      text += `${check} ${item.name} — ${qty.toFixed(1)} ${item.unit} — ${formatCurrency(price)}\n`;
    }
    text += `${t('cmp.share.materialsTotal', { total: formatCurrency(totalMaterials) })}\n\n`;
  }
  if (tools.length > 0) {
    text += `${t('cmp.share.tools')}\n`;
    for (const item of tools) {
      const check = item.purchased ? '[x]' : (item.owned ? '[+]' : '[ ]');
      text += `${check} ${item.name} — ${formatCurrency(getEffectivePrice(item))}\n`;
    }
    text += `${t('cmp.share.toolsTotal', { total: formatCurrency(totalTools) })}\n\n`;
  }
  const total = totalMaterials + totalTools;
  text += `${t('cmp.share.grandTotal', { total: formatCurrency(total + contingency) })}\n`;
  return text;
}
