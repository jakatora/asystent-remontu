import type { Project } from '@/types/domain';
import { getJobById } from '@/features/content/registry';
import { normalizeProductName } from '../../../../lib/db/src/repositories/helpers';
import { jobProductKey, reviewedJobProduct } from './jobProduct';
import type { PricingMaterialLineInput } from './pricingApi';

export type BasketToolChoice = 'owned' | 'buy' | 'rent';
export const BASKET_TOOL_PREFIX = 'remont.basket-tool.v1:';

export interface BasketTool {
  key: string;
  name: string;
  projectNames: string[];
  required: boolean;
  rentable: boolean;
  product: ReturnType<typeof reviewedJobProduct>;
}

export function collectBasketTools(projects: readonly Pick<Project, 'name' | 'jobId'>[]): BasketTool[] {
  const tools = new Map<string, BasketTool>();
  for (const project of projects) {
    for (const tool of getJobById(project.jobId)?.tools ?? []) {
      const product = reviewedJobProduct(tool, 'tool');
      const key = product ? jobProductKey(product.identity) : JSON.stringify([tool.id, normalizeProductName(tool.name)]);
      const previous = tools.get(key);
      if (previous) {
        previous.required ||= tool.required;
        previous.rentable ||= Boolean(tool.rentable);
        if (!previous.projectNames.includes(project.name)) previous.projectNames.push(project.name);
      } else {
        tools.set(key, { key, name: product?.name ?? tool.name, product, projectNames: [project.name], required: tool.required, rentable: Boolean(tool.rentable) });
      }
    }
  }
  return [...tools.values()];
}

export function parseBasketToolChoice(value: string | null): BasketToolChoice | undefined {
  if (value === null) return undefined;
  if (value === 'owned' || value === 'buy' || value === 'rent') return value;
  throw Error('invalid_basket_tool_choice');
}

export function basketToolPurchases(tools: readonly BasketTool[], choices: Readonly<Partial<Record<string, BasketToolChoice>>>): PricingMaterialLineInput[] {
  return tools.flatMap(tool => {
    const identity = tool.product?.identity;
    if (choices[tool.key] !== 'buy' || !identity?.ean) return [];
    return [{
      material: { id: `tool:${identity.ean}`, name: tool.name, ean: identity.ean, category: identity.category, unit: identity.unit },
      quantity: identity.packageSize,
    }];
  });
}
