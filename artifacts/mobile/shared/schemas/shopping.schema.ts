import { z } from 'zod';

// ─── Shopping item create ───────────────────────────────────────────────────

export const CreateShoppingItemSchema = z.object({
  projectId: z.string().min(1),
  materialId: z.string().min(1),
  name: z.string().min(1).max(200),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(20),
  estimatedPrice: z.number().nonnegative(),
  purchased: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export type CreateShoppingItemInput = z.infer<typeof CreateShoppingItemSchema>;

// ─── Shopping item record (full) ────────────────────────────────────────────

export const ShoppingItemSchema = CreateShoppingItemSchema.extend({
  id: z.string(),
  createdAt: z.string().datetime(),
});

export type ShoppingItemData = z.infer<typeof ShoppingItemSchema>;
