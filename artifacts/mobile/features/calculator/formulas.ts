import type { FormulaFn, FormulaRegistry, MeasurementMap } from '@/types/calculator';

// ─── Shared measurement helpers ────────────────────────────────────────────────
// These are also exported from formula-builder.ts for inline use in job files.
// Kept here as local helpers to avoid circular imports.

function area(m: MeasurementMap): number {
  return m.wallArea ?? m.floorArea ?? m.ceilingArea ?? m.area ?? 0;
}

function coats(m: MeasurementMap): number {
  return m.coats ?? m.layers ?? 2;
}

function perimeter(m: MeasurementMap): number {
  return m.perimeter ?? m.linearMeters ?? Math.sqrt(area(m)) * 4;
}

function tileAreaM2(m: MeasurementMap): number {
  const w = m.tileWidthCm ?? 30;
  const h = m.tileHeightCm ?? 30;
  return (w / 100) * (h / 100);
}

function wastePctMultiplier(m: MeasurementMap, fallbackPct: number): number {
  return m.wastePercent != null ? 1 + m.wastePercent / 100 : 1 + fallbackPct / 100;
}

function coveragePerLiter(m: MeasurementMap, def: number): number {
  return m.coveragePerLiter ?? def;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ─── Formula implementations ───────────────────────────────────────────────────

const paintFormula: FormulaFn = (m, waste) => {
  // Default 10 m²/L; overridden by m.coveragePerLiter
  const cov = coveragePerLiter(m, 10);
  return round1((area(m) * coats(m)) / cov * waste);
};

const primerFormula: FormulaFn = (m, waste) => {
  // Primer: single coat, 10 m²/L default
  const cov = coveragePerLiter(m, 10);
  return round1((area(m) / cov) * waste);
};

const tapeFormula: FormulaFn = (m, _waste) => {
  // One 25m roll per ~6 lm of perimeter
  return Math.ceil(perimeter(m) / 6);
};

const fillerFormula: FormulaFn = (m, waste) => {
  // ~0.5 kg/m² for fine filler
  return round1(area(m) * 0.5 * waste);
};

const meshFormula: FormulaFn = (m, waste) => {
  return round1(area(m) * waste);
};

const skimCoatFormula: FormulaFn = (m, waste) => {
  // ~1.5 kg/m² per coat
  return round1(area(m) * coats(m) * 1.5 * waste);
};

const sandpaperFormula: FormulaFn = (m, _waste) => {
  return Math.ceil(area(m) / 5);
};

const floorPanelsFormula: FormulaFn = (m, waste) => {
  // Floor panels in m² — caller handles pack conversion if needed
  return round1(area(m) * waste);
};

const panelPacksFormula: FormulaFn = (m, waste) => {
  // Pack count using m.panelPackCoverageM2 (default 2.196 m²/pack = common laminate)
  const packCoverage = m.panelPackCoverageM2 ?? 2.196;
  return Math.ceil((area(m) * waste) / packCoverage);
};

const underlayFormula: FormulaFn = (m, waste) => {
  return round1(area(m) * waste);
};

const thresholdFormula: FormulaFn = () => 1;

const tilesFormula: FormulaFn = (m, _waste) => {
  // m² of tiles with 15% waste default (or m.wastePercent)
  const w = wastePctMultiplier(m, 15);
  return round1(area(m) * w);
};

const tilePiecesFormula: FormulaFn = (m, _waste) => {
  // Number of tile pieces, accounts for tile size and waste
  const w = wastePctMultiplier(m, 15);
  return Math.ceil((area(m) * w) / tileAreaM2(m));
};

const tileAdhesiveFormula: FormulaFn = (m, waste) => {
  // ~4 kg/m² for adhesive
  return Math.ceil(area(m) * 4 * waste);
};

const groutFormula: FormulaFn = (m, waste) => {
  // ~0.5 kg/m² default; precise if groutWidthMm + tileWidthCm + tileHeightCm provided
  const tileW = m.tileWidthCm ?? 30;
  const tileH = m.tileHeightCm ?? 30;
  const groutMm = m.groutWidthMm ?? 3;
  const depth = 9;
  const density = 1.7;
  const computed = ((tileW + tileH) / (tileW * tileH)) * groutMm * depth * density * 0.001;
  const kgPerM2 = computed > 0.05 ? computed : 0.5;
  return round1(area(m) * kgPerM2 * waste);
};

const crossesFormula: FormulaFn = (m, _waste) => {
  // Tile crosses: estimate based on tile size (smaller tile → more crosses)
  const tileM2 = tileAreaM2(m);
  const tilesPerM2 = 1 / tileM2;
  // 4 crosses per tile (corners shared, practical count)
  return Math.ceil(area(m) * tilesPerM2 * 2);
};

const membraneFormula: FormulaFn = (m, waste) => {
  const total = area(m) + (m.floorArea ?? 0);
  return round1(total * waste);
};

const sealingTapeFormula: FormulaFn = (m, _waste) => {
  return Math.ceil(perimeter(m));
};

const siliconeFormula: FormulaFn = (m, _waste) => {
  // 1 cartridge seals ~8 lm
  const lm = m.linearMeters ?? perimeter(m);
  return Math.ceil(lm / 8);
};

const wallpaperFormula: FormulaFn = (m, waste) => {
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

const cornersFormula: FormulaFn = () => 4;

const faucetsFormula: FormulaFn = (m) => {
  return Math.max(1, m.faucetCount ?? 1);
};

const socketsFormula: FormulaFn = (m) => {
  return Math.max(1, m.socketCount ?? 1);
};

const constantFormula: FormulaFn = () => 1;

const linearMetersFormula: FormulaFn = (m, waste) => {
  return round1((m.linearMeters ?? 0) * waste);
};

// ─── Helpers (aliases for clean readability in job files) ─────────────────────

const byAreaFormula: FormulaFn = meshFormula;
const byPerimeterFormula: FormulaFn = skirtingFormula;

// ─── Registry ─────────────────────────────────────────────────────────────────
// To add a new formula: implement it above and add one line here.
// No other file needs to change.

export const FORMULA_REGISTRY: FormulaRegistry = {
  // ── Paint / primer ──────────────────────────────────────────────────────
  paint:           paintFormula,
  primer:          primerFormula,
  // ── Masking / prep ──────────────────────────────────────────────────────
  tape:            tapeFormula,
  filler:          fillerFormula,
  skimCoat:        skimCoatFormula,
  mesh:            meshFormula,
  sandpaper:       sandpaperFormula,
  // ── Flooring ────────────────────────────────────────────────────────────
  floorPanels:     floorPanelsFormula,
  panelPacks:      panelPacksFormula,
  underlay:        underlayFormula,
  threshold:       thresholdFormula,
  // ── Tiles ───────────────────────────────────────────────────────────────
  tiles:           tilesFormula,
  tilePieces:      tilePiecesFormula,
  tileAdhesive:    tileAdhesiveFormula,
  grout:           groutFormula,
  crosses:         crossesFormula,
  // ── Waterproofing / sealing ─────────────────────────────────────────────
  membrane:        membraneFormula,
  sealingTape:     sealingTapeFormula,
  silicone:        siliconeFormula,
  // ── Wallpaper & finishing ───────────────────────────────────────────────
  wallpaper:       wallpaperFormula,
  wallpaperGlue:   wallpaperGlueFormula,
  skirting:        skirtingFormula,
  skirtingGlue:    skirtingGlueFormula,
  corners:         cornersFormula,
  // ── Plumbing / electrical ───────────────────────────────────────────────
  faucets:         faucetsFormula,
  sockets:         socketsFormula,
  // ── Utility ─────────────────────────────────────────────────────────────
  constant:        constantFormula,
  linearMeters:    linearMetersFormula,
  // ── Aliases (preferred for new job files) ───────────────────────────────
  byArea:          byAreaFormula,
  byPerimeter:     byPerimeterFormula,
} as const;

export function resolveFormula(key: string): FormulaFn {
  return FORMULA_REGISTRY[key] ?? constantFormula;
}
