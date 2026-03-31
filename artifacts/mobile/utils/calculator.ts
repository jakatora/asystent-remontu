import { RenovationJob, CalculationResult, WarningRule } from '@/types/renovation';

const WASTE_FACTOR = 1.1;

export function calculateMaterials(
  job: RenovationJob,
  measurements: Record<string, number>
): CalculationResult {
  const area = measurements.wallArea || measurements.floorArea || measurements.ceilingArea || 0;
  const coats = measurements.coats || measurements.layers || 2;
  const perimeter = measurements.perimeter || 0;
  const linearMeters = measurements.linearMeters || 0;
  const faucetCount = measurements.faucetCount || 1;
  const socketCount = measurements.socketCount || 1;

  const calculatedMaterials = job.materials.map((material) => {
    let quantity = 0;

    switch (material.formulaKey) {
      case 'paint':
        quantity = Math.ceil((area * coats) / 10 * WASTE_FACTOR * 10) / 10;
        break;
      case 'primer':
        quantity = Math.ceil((area / 10) * WASTE_FACTOR * 10) / 10;
        break;
      case 'tape':
        quantity = Math.ceil(Math.sqrt(area) * 4 / 25);
        break;
      case 'filler':
        quantity = Math.ceil((area / 20) * WASTE_FACTOR * 10) / 10;
        break;
      case 'mesh':
        quantity = Math.ceil(Math.sqrt(area) * 2);
        break;
      case 'skimCoat':
        quantity = Math.ceil((area * coats * 1.5) * WASTE_FACTOR * 10) / 10;
        break;
      case 'sandpaper':
        quantity = Math.ceil(area / 5);
        break;
      case 'floorPanels':
        quantity = Math.ceil(area * WASTE_FACTOR * 10) / 10;
        break;
      case 'underlay':
        quantity = Math.ceil(area * WASTE_FACTOR * 10) / 10;
        break;
      case 'threshold':
        quantity = 1;
        break;
      case 'tiles':
        quantity = Math.ceil(area * 1.15 * 10) / 10;
        break;
      case 'tileAdhesive':
        quantity = Math.ceil(area * 4 * WASTE_FACTOR);
        break;
      case 'grout':
        quantity = Math.ceil(area * 0.5 * WASTE_FACTOR * 10) / 10;
        break;
      case 'crosses':
        quantity = Math.ceil(area * 10 / 100);
        break;
      case 'membrane':
        quantity = Math.ceil((area + measurements.floorArea || 0) * 2 * WASTE_FACTOR * 10) / 10;
        break;
      case 'sealingTape':
        quantity = Math.ceil(perimeter || Math.sqrt(area) * 4);
        break;
      case 'silicone':
        quantity = Math.ceil(linearMeters / 8);
        break;
      case 'wallpaper':
        quantity = Math.ceil(area * WASTE_FACTOR * 10) / 10;
        break;
      case 'wallpaperGlue':
        quantity = Math.ceil(area / 40);
        break;
      case 'skirting':
        quantity = Math.ceil(perimeter * WASTE_FACTOR * 10) / 10;
        break;
      case 'skirtingGlue':
        quantity = Math.ceil(perimeter / 8);
        break;
      case 'corners':
        quantity = 4;
        break;
      case 'faucets':
        quantity = faucetCount;
        break;
      case 'sockets':
        quantity = socketCount;
        break;
      case 'constant':
        quantity = 1;
        break;
      default:
        quantity = 1;
    }

    const cost = Math.round(quantity * material.pricePerUnit * 100) / 100;
    return { material, quantity: Math.max(0, quantity), cost };
  });

  const totalCost = calculatedMaterials.reduce((sum, m) => sum + m.cost, 0);

  const warnings: WarningRule[] = job.warningRules.filter(
    (rule) => rule.condition === 'always' || rule.condition === 'beginner'
  );

  return {
    jobId: job.id,
    measurements,
    materials: calculatedMaterials,
    totalCost: Math.round(totalCost * 100) / 100,
    totalDays: job.estimatedDays,
    warnings,
  };
}

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} zł`;
}

export function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'Łatwy';
    case 'medium': return 'Średni';
    case 'hard': return 'Trudny';
    default: return difficulty;
  }
}

export function getRiskLabel(risk: string): string {
  switch (risk) {
    case 'low': return 'Niskie ryzyko';
    case 'medium': return 'Średnie ryzyko';
    case 'high': return 'Wysokie ryzyko';
    default: return risk;
  }
}
