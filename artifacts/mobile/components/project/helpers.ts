import type { ShoppingItem, Difficulty } from '@/types/domain';
import type { DiyAssessmentResult } from './types';
import { CONTINGENCY_RATE } from './types';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';

export function diyAssessment(difficulty: Difficulty, hirePro: boolean): DiyAssessmentResult {
  if (hirePro || difficulty === 'hard') {
    return {
      level: 'hire',
      color: Colors.danger,
      bg: Colors.dangerBg,
      icon: 'alert-triangle',
      headline: 'Zdecydowanie zatrudnij fachowca',
      details: 'Ta praca wymaga specjalistycznej wiedzy i sprzętu. Błędy mogą być kosztowne lub niebezpieczne.',
    };
  }
  if (difficulty === 'medium') {
    return {
      level: 'moderate',
      color: Colors.warning,
      bg: Colors.warningBg,
      icon: 'alert-circle',
      headline: 'Możliwe samodzielnie, ale wymaga uwagi',
      details: 'Możesz zrobić to sam, ale postępuj zgodnie z instrukcją krok po kroku. W razie wątpliwości skonsultuj się ze sprzedawcą w sklepie budowlanym.',
    };
  }
  return {
    level: 'easy',
    color: Colors.success,
    bg: Colors.successBg,
    icon: 'check-circle',
    headline: 'Świetnie nadaje się do samodzielnego wykonania',
    details: 'Ta praca jest dostępna dla amatorów. Wystarczy dokładność i postępowanie zgodnie z naszą instrukcją.',
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
  contingency: number
): string {
  let text = `Lista zakupów: ${projectName}\n\n`;
  if (materials.length > 0) {
    text += 'MATERIAŁY:\n';
    for (const item of materials) {
      const check = item.purchased ? '[x]' : (item.owned ? '[mam]' : '[ ]');
      const qty = getEffectiveQuantity(item);
      const price = getEffectivePrice(item);
      text += `${check} ${item.name} — ${qty.toFixed(1)} ${item.unit} — ${formatCurrency(price)}\n`;
    }
    text += `Razem materiały: ${formatCurrency(totalMaterials)}\n\n`;
  }
  if (tools.length > 0) {
    text += 'NARZĘDZIA:\n';
    for (const item of tools) {
      const check = item.purchased ? '[x]' : (item.owned ? '[mam]' : '[ ]');
      text += `${check} ${item.name} — ${formatCurrency(getEffectivePrice(item))}\n`;
    }
    text += `Razem narzędzia: ${formatCurrency(totalTools)}\n\n`;
  }
  const total = totalMaterials + totalTools;
  text += `SUMA: ${formatCurrency(total)}\n`;
  text += `Rezerwa (${Math.round(CONTINGENCY_RATE * 100)}%): ${formatCurrency(contingency)}\n`;
  text += `Łącznie z rezerwą: ${formatCurrency(total + contingency)}\n`;
  return text;
}
