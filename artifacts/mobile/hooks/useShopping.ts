import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { ShoppingItem, CalculationResult } from '@/types/domain';
import { shoppingRepo } from '@/db/repositories/shopping.repo';
import { generateShoppingItems } from '@/features/calculator/shopping';
import { queryKeys } from '@/lib/query-client';
import { captureError } from '@/lib/sentry';

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useShoppingItems(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shopping(projectId ?? ''),
    queryFn: () => shoppingRepo.findByProject(projectId!),
    enabled: Boolean(projectId),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useToggleShoppingItem(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, purchased }: { id: string; purchased: boolean }) =>
      shoppingRepo.toggle(id, purchased),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shopping(projectId) });
    },
    onError: (err) => captureError(err, { context: 'useToggleShoppingItem' }),
  });
}

export function useDeleteShoppingItem(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shoppingRepo.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shopping(projectId) });
    },
  });
}

export function useGenerateShoppingList(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (result: CalculationResult) => {
      await shoppingRepo.deleteByProject(projectId);
      const items = generateShoppingItems(projectId, result);
      return shoppingRepo.insertMany(items);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shopping(projectId) });
    },
    onError: (err) => captureError(err, { context: 'useGenerateShoppingList' }),
  });
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

export function useShoppingProgress(items: ShoppingItem[] | undefined) {
  if (!items || items.length === 0) return { purchased: 0, total: 0, pct: 0, totalCost: 0 };
  const purchased = items.filter((i) => i.purchased).length;
  const totalCost = items.reduce((s, i) => s + i.estimatedPrice, 0);
  return {
    purchased,
    total:     items.length,
    pct:       Math.round((purchased / items.length) * 100),
    totalCost,
  };
}
