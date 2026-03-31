import type { WarningRule } from '@/types/domain';
import type { WarningContext, WarningResolver } from '@/types/calculator';

// ─── Condition evaluators ────────────────────────────────────────────────────
// To add a new condition: add an entry to CONDITION_EVALUATORS.
// No other file needs to change.

type ConditionEvaluator = (ctx: WarningContext) => boolean;

const CONDITION_EVALUATORS: Record<string, ConditionEvaluator> = {
  always:        () => true,
  beginner:      (ctx) => ctx.isBeginner !== false,
  'large-area':  (ctx) => (ctx.measurements?.wallArea ?? ctx.measurements?.floorArea ?? 0) > 30,
  'high-humidity': (ctx) => ctx.isHighHumidity === true,
};

class WarningResolverImpl implements WarningResolver {
  resolve(rules: readonly WarningRule[], context: WarningContext): WarningRule[] {
    return rules.filter((rule) => {
      const evaluator = CONDITION_EVALUATORS[rule.condition];
      // Unknown conditions default to shown (conservative — safety first)
      return evaluator ? evaluator(context) : true;
    });
  }
}

export const warningResolver: WarningResolver = new WarningResolverImpl();

export function resolveWarnings(
  rules: readonly WarningRule[],
  context: WarningContext = {}
): WarningRule[] {
  return warningResolver.resolve(rules, context);
}
