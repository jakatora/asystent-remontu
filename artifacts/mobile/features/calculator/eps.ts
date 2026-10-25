import type { CalculationResult, MaterialItem, MaterialLineItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import { roundMoney } from '@/shared/lib/currency';

export const EPS_JOB_ID = 'eps-insulation-bso';
export const EPS_QUANTITY_MODEL = 'eps-v1';
// source: https://betterial.pl/kleje-do-styropianu/8679-atlas-zaprawa-klejaca-do-styropianu-stopter-k-20.html
export const EPS_K20_EAN = '5905400160253';
const IDS = ['eps-board-15cm', 'glue-k20', 'glue-k50', 'mesh-145', 'anchors-eps', 'primer-ct16', 'plaster-silicone', 'profiles-start'];
const finite = (value: number | undefined, fallback: number) => value !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback;
// Keep raw demand across rooms; round to retail packs only on the server.
const precise = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

/** Planning reserve is an explicit user assumption. Fastener counts, primer,
 * render and profiles need their own design/product data, never sqrt(area).
 * source: https://www.atlas.com.pl/produkt/atlas-stopter-k-20/
 * source: https://www.atlas.com.pl/wp-content/uploads/2025/11/poradnik_11_2025_200dpi_c_pop.pdf
 */
export function epsRequirement(id: string, m: MeasurementMap): number | null {
  const area = m.wallArea;
  if (!Number.isFinite(area) || area <= 0) return null;
  if (['eps-board-15cm', 'glue-k20', 'glue-k50'].includes(id) && m.wastePercent !== undefined && (!Number.isFinite(m.wastePercent) || m.wastePercent < 0 || m.wastePercent > 50)) return null;
  if (id === 'glue-k20' && m.epsAdhesiveRate !== undefined && (!Number.isFinite(m.epsAdhesiveRate) || m.epsAdhesiveRate < 4 || m.epsAdhesiveRate > 5)) return null;
  if (id === 'glue-k50' && m.epsReinforcementRate !== undefined && (!Number.isFinite(m.epsReinforcementRate) || m.epsReinforcementRate < 3 || m.epsReinforcementRate > 3.5)) return null;
  if (id === 'mesh-145' && m.epsMeshReservePercent !== undefined && (!Number.isFinite(m.epsMeshReservePercent) || m.epsMeshReservePercent < 0 || m.epsMeshReservePercent > 100)) return null;
  const reserve = 1 + Math.min(50, finite(m.wastePercent, 10)) / 100;
  switch (id) {
    case 'eps-board-15cm': return precise(area * reserve);
    // The upper manufacturer consumption estimates are editable within its range.
    case 'glue-k20': return precise(area * finite(m.epsAdhesiveRate, 5) * reserve);
    case 'glue-k50': return precise(area * finite(m.epsReinforcementRate, 3.5) * reserve);
    // 15% is a labelled planning allowance for overlap/cutting, not a site design.
    case 'mesh-145': return precise(area * (1 + finite(m.epsMeshReservePercent, 15) / 100));
    default: {
      const key = ({ 'anchors-eps': 'epsAnchorCount', 'primer-ct16': 'epsPrimerLitres', 'plaster-silicone': 'epsRenderKg', 'profiles-start': 'epsProfilesLength' } as Record<string, string>)[id];
      if (!key || !Object.hasOwn(m, key) || !Number.isFinite(m[key]) || m[key] < 0 || id === 'anchors-eps' && !Number.isSafeInteger(m[key])) return null;
      return precise(m[key]);
    }
  }
}

export function calculateEpsItems(materials: readonly MaterialItem[], measurements: MeasurementMap): (MaterialLineItem & { rawQuantity: number })[] {
  return materials.map(material => {
    // Stored calculations can still contain old generic fixing/thickness advice.
    if (material.id === 'eps-board-15cm') material = { ...material, notes: 'Wariant modelu: 15 cm, lambda 0.040 W/(m·K). Grubość i parametry potwierdź w projekcie ocieplenia.' };
    if (material.id === 'anchors-eps') material = { ...material, notes: 'Liczbę, rodzaj i długość łączników podaj według projektu ocieplenia i podłoża.' };
    const adhesiveKnown = material.id !== 'glue-k20' || material.unit === 'kg' && /Atlas Stopter K-20 25 kg/i.test(material.brand ?? '');
    const reinforcementKnown = material.id !== 'glue-k50' || material.unit === 'kg' && /Atlas Stopter K-50 25 kg/i.test(material.brand ?? '');
    if (material.id === 'glue-k20') {
      const { ean: _previousEan, ...plain } = material;
      material = adhesiveKnown ? { ...plain, ean: EPS_K20_EAN } : plain;
    }
    const required = adhesiveKnown && reinforcementKnown ? epsRequirement(material.id, measurements) : null;
    const quantity = required ?? 0;
    return { material, rawQuantity: quantity, quantity, quantityKnown: required !== null, cost: required === null ? 0 : roundMoney(quantity * material.pricePerUnit) };
  });
}

export function upgradeEpsCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (!calc || calc.jobId !== EPS_JOB_ID) return calc;
  const materials = calculateEpsItems(calc.materials.map(line => line.material as MaterialItem), calc.measurements);
  return { ...calc, materials, totalCost: roundMoney(materials.reduce((total, line) => total + line.cost, 0)), quantityModel: EPS_QUANTITY_MODEL,
    quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) };
}
export const upgradeEpsProject = (project: Project): Project => project.jobId === EPS_JOB_ID && project.calculationResult ? { ...project, calculationResult: upgradeEpsCalculation(project.calculationResult) } : project;

/** Read-only view of old lists. Custom rows and user values remain in storage.
 * Old one-unit ownership cannot cover the newly calculated whole requirement.
 */
export function projectEpsShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (calc?.jobId !== EPS_JOB_ID) return [...items];
  const current = upgradeEpsCalculation(calc)!;
  return items.map(item => {
    if (item.itemType !== 'material' || !IDS.includes(item.materialId)) return item;
    const line = current.materials.find(line => line.material.id === item.materialId);
    if (!line) return item;
    const known = line.quantityKnown !== false;
    const matches = known && Math.abs((item.customQuantity ?? item.quantity) - line.quantity) < 1e-8 && item.unit === line.material.unit;
    return { ...item, quantity: line.quantity, estimatedPrice: line.cost, quantityKnown: known, requiredQuantity: known ? line.quantity : undefined,
      needsQuantityConfirmation: !matches, owned: matches && item.owned, purchased: matches && item.purchased };
  });
}
