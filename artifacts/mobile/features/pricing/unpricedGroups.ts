import { normalizeUnit } from './quantity';
import { unpricedReference } from './unpricedReference';
import type { SerializedLine, SerializedStage } from './pricingApi';

export interface UnpricedGroup { key: string; line: SerializedLine; sourceCount: number }
/** Presentation only: combine exact identities and compatible quantities, never
 * create a price/offer or change the server's basket completeness or amounts. */
export function groupUnpricedLines(stages: readonly Pick<SerializedStage, 'lines'>[]): UnpricedGroup[] {
  const groups = new Map<string, { line: SerializedLine; stages: Set<number> }>();
  stages.forEach((stage, stageIndex) => stage.lines.forEach((line, lineIndex) => {
    if (line.resolved) return;
    const codes = [...new Set([line.query.ean, line.query.gtin, line.product?.ean, line.product?.gtin].filter((code): code is string => Boolean(code)))];
    const code = codes.length === 1 && [8,12,13,14].includes(codes[0].length) && /^\d+$/.test(codes[0]) ? codes[0] : null;
    const unit = normalizeUnit(line.unit ?? ''), ref = codes.length < 2 ? unpricedReference(line) : null;
    const knownQuantity = Number.isFinite(line.quantity) && line.quantity > 0 && ['l','kg','ml','m','m2','szt'].includes(unit);
    const missing = ['no-offer','no_offer','no_price','no-product','not_found'].includes(line.reason ?? '');
    const identity = ref ? ['reference',ref.id] : code ? ['code',code,line.query.category ?? line.product?.category ?? ''] : null;
    const key = identity && knownQuantity && missing ? JSON.stringify([identity,unit,line.reason]) : `single:${stageIndex}:${lineIndex}`;
    const found = groups.get(key), sum = found ? found.line.quantity + line.quantity : line.quantity;
    if (found && Number.isFinite(sum)) {
      found.line = { ...found.line, quantity: Number(sum.toFixed(8)) };
      found.stages.add(stageIndex);
    } else groups.set(found ? key+':overflow:'+stageIndex+':'+lineIndex : key, { line: { ...line, query: { ...line.query } }, stages: new Set([stageIndex]) });
  }));
  return [...groups.entries()].map(([key,group]) => ({ key, line:group.line, sourceCount:group.stages.size }));
}
