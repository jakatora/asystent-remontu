/**
 * Backward-compatibility barrel.
 * Calculator logic now lives in features/calculator/ and features/warnings/.
 * Screens continue to import from '@/utils/calculator'.
 */
export { calculateMaterials } from '@/features/calculator/engine';
export { generateShoppingItems } from '@/features/calculator/shopping';
export { estimateBudget } from '@/features/calculator/budget';
export { getDifficultyLabel, getRiskLabel, getDifficultyColor, getRiskColor } from '@/features/warnings/difficulty';
export { formatCurrency, formatCurrencyShort, roundMoney } from '@/shared/lib/currency';
