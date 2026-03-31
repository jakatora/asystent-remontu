import type { FormulaFn, FormulaRegistry, MeasurementMap } from '@/types/calculator';

// ─── Helper: resolve common measurement aliases ─────────────────────────────

function area(m: MeasurementMap): number {
  return (
    m.wallArea ?? m.floorArea ?? m.ceilingArea ?? m.area ?? 0
  );
}

function coats(m: MeasurementMap): number {
  return m.coats ?? m.layers ?? 2;
}

function perimeter(m: MeasurementMap): number {
  return m.perimeter ?? Math.sqrt(area(m)) * 4;
}

// ─── Formula implementations ────────────────────────────────────────────────

const paintFormula: FormulaFn = (m, waste) => {
  // 1 L covers ~10 m² per coat; coverage adjusted by waste factor
  const litres = (area(m) * coats(m)) / 10;
  return round1(litres * waste);
};

const primerFormula: FormulaFn = (m, waste) => {
  // 1 L covers ~10 m² (single coat)
  return round1((area(m) / 10) * waste);
};

const tapeFormula: FormulaFn = (m, _waste) => {
  // One 25m roll per ~6 lm of perimeter
  const lm = perimeter(m);
  return Math.ceil(lm / 6);
};

const fillerFormula: FormulaFn = (m, waste) => {
  // ~0.5 kg/m² for fine filler
  return round1((area(m) * 0.5) * waste);
};

const meshFormula: FormulaFn = (m, waste) => {
  return round1(area(m) * waste);
};

const skimCoatFormula: FormulaFn = (m, waste) => {
  // ~1.5 kg/m² per coat
  return round1(area(m) * coats(m) * 1.5 * waste);
};

const sandpaperFormula: FormulaFn = (m, _waste) => {
  // 1 sheet per 5 m²
  return Math.ceil(area(m) / 5);
};

const floorPanelsFormula: FormulaFn = (m, waste) => {
  return round1(area(m) * waste);
};

const underlayFormula: FormulaFn = (m, waste) => {
  return round1(area(m) * waste);
};

const thresholdFormula: FormulaFn = (_m, _waste) => 1;

const tilesFormula: FormulaFn = (m, _waste) => {
  // Standard 15% tile waste (cutting losses)
  return round1(area(m) * 1.15);
};

const tileAdhesiveFormula: FormulaFn = (m, waste) => {
  // ~4 kg/m² for adhesive
  return Math.ceil(area(m) * 4 * waste);
};

const groutFormula: FormulaFn = (m, waste) => {
  // ~0.5 kg/m² for grout
  return round1(area(m) * 0.5 * waste);
};

const crossesFormula: FormulaFn = (m, _waste) => {
  // ~10 tile crosses per m² for 10x10cm tiles, adjusted
  return Math.ceil(area(m) * 10 / 100);
};

const membraneFormula: FormulaFn = (m, waste) => {
  // Membrane covers walls + floor
  const total = area(m) + (m.floorArea ?? 0);
  return round1(total * waste);
};

const sealingTapeFormula: FormulaFn = (m, _waste) => {
  return Math.ceil(perimeter(m));
};

const siliconeFormula: FormulaFn = (m, _waste) => {
  // 1 cartridge seals ~8 lm of joint
  const lm = m.linearMeters ?? perimeter(m);
  return Math.ceil(lm / 8);
};

const wallpaperFormula: FormulaFn = (m, waste) => {
  // Wallpaper in m²
  return round1(area(m) * waste);
};

const wallpaperGlueFormula: FormulaFn = (m, _waste) => {
  // 1 kg covers ~40 m²
  return Math.ceil(area(m) / 40);
};

const skirtingFormula: FormulaFn = (m, waste) => {
  const lm = m.perimeter ?? m.linearMeters ?? 0;
  return round1(lm * waste);
};

const skirtingGlueFormula: FormulaFn = (m, _waste) => {
  const lm = m.perimeter ?? m.linearMeters ?? 0;
  return Math.ceil(lm / 8);
};

const cornersFormula: FormulaFn = (_m, _waste) => 4;

const faucetsFormula: FormulaFn = (m, _waste) => {
  return Math.max(1, m.faucetCount ?? 1);
};

const socketsFormula: FormulaFn = (m, _waste) => {
  return Math.max(1, m.socketCount ?? 1);
};

const constantFormula: FormulaFn = (_m, _waste) => 1;

const linearMetersFormula: FormulaFn = (m, waste) => {
  return round1((m.linearMeters ?? 0) * waste);
};

// ─── Helper ─────────────────────────────────────────────────────────────────

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ─── Registry ────────────────────────────────────────────────────────────────
// To add a new formula: add a key + implementation here.
// No other file needs to change.

export const FORMULA_REGISTRY: FormulaRegistry = {
  paint: paintFormula,
  primer: primerFormula,
  tape: tapeFormula,
  filler: fillerFormula,
  mesh: meshFormula,
  skimCoat: skimCoatFormula,
  sandpaper: sandpaperFormula,
  floorPanels: floorPanelsFormula,
  underlay: underlayFormula,
  threshold: thresholdFormula,
  tiles: tilesFormula,
  tileAdhesive: tileAdhesiveFormula,
  grout: groutFormula,
  crosses: crossesFormula,
  membrane: membraneFormula,
  sealingTape: sealingTapeFormula,
  silicone: siliconeFormula,
  wallpaper: wallpaperFormula,
  wallpaperGlue: wallpaperGlueFormula,
  skirting: skirtingFormula,
  skirtingGlue: skirtingGlueFormula,
  corners: cornersFormula,
  faucets: faucetsFormula,
  sockets: socketsFormula,
  constant: constantFormula,
  linearMeters: linearMetersFormula,
} as const;

export function resolveFormula(key: string): FormulaFn {
  return FORMULA_REGISTRY[key] ?? constantFormula;
}
