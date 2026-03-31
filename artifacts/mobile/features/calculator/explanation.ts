// ─── Material Explanation Generator ──────────────────────────────────────────
// Generates Polish-language explanations for how each material quantity was derived.
// Called by the engine for every material in a calculation.

import type { MaterialItem } from '@/types/domain';
import type { MaterialRequirement, PackagingInfo } from '@/types/engine';
import type { MeasurementMap } from '@/types/calculator';
import type { MaterialExplanation, MaterialExplanationContext } from '@/types/calculation';

// ─── Number formatting ────────────────────────────────────────────────────────

function fmt(n: number, decimals = 1): string {
  return n.toLocaleString('pl-PL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(waste: number): string {
  // waste is a multiplier like 1.10 → 10%
  const pct = Math.round((waste - 1) * 100);
  return `${pct}%`;
}

// ─── Purchase string ──────────────────────────────────────────────────────────

function purchaseStr(
  purchaseQuantity: number,
  purchaseUnit: string,
  packaging: PackagingInfo | undefined,
  packs: number | undefined
): string {
  if (packaging && packs !== undefined) {
    return `${fmt(packs, 0)} ${packaging.purchaseUnit} (${packaging.label})`;
  }
  return `${fmt(purchaseQuantity)} ${purchaseUnit}`;
}

// ─── Waste note ───────────────────────────────────────────────────────────────

function wasteNote(wasteFactor: number): string {
  if (wasteFactor <= 1.0) return '';
  return ` × ${fmt(wasteFactor)} (odpad ${fmtPct(wasteFactor)})`;
}

// ─── Measurement helpers ──────────────────────────────────────────────────────

function getArea(m: MeasurementMap): number {
  return m.wallArea ?? m.floorArea ?? m.ceilingArea ?? m.area ?? 0;
}
function getCoats(m: MeasurementMap): number {
  return m.coats ?? m.layers ?? 2;
}
function getCoverage(m: MeasurementMap, def: number): number {
  return m.coveragePerLiter ?? def;
}
function getPerimeter(m: MeasurementMap): number {
  return m.perimeter ?? m.linearMeters ?? 0;
}

// ─── Formula-key explanation templates ───────────────────────────────────────

type ExplainFn = (ctx: MaterialExplanationContext) => MaterialExplanation;

const FORMULA_EXPLANATIONS: Record<string, ExplainFn> = {

  // ── Paint ──────────────────────────────────────────────────────────────────

  paint(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const coats = getCoats(m);
    const cov = getCoverage(m, 10);
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² × ${fmt(coats, 0)} warstwy ÷ ${fmt(cov)} m²/L${waste} = ${fmt(rawQuantity)} L → zakup: ${buy}`,
      assumptions: [
        `Powierzchnia: ${fmt(area)} m²`,
        `Liczba warstw: ${fmt(coats, 0)}`,
        `Wydajność farby: ${fmt(cov)} m²/litr`,
        ...(wasteFactor > 1 ? [`Odpad: ${fmtPct(wasteFactor)}`] : []),
      ],
    };
  },

  primer(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const cov = getCoverage(m, 10);
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² ÷ ${fmt(cov)} m²/L${waste} = ${fmt(rawQuantity)} L → zakup: ${buy}`,
      assumptions: [
        `Powierzchnia: ${fmt(area)} m²`,
        `Wydajność gruntu: ${fmt(cov)} m²/litr`,
        `1 warstwa gruntu`,
      ],
    };
  },

  // ── Wall prep ─────────────────────────────────────────────────────────────

  filler(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² × 0,5 kg/m²${waste} = ${fmt(rawQuantity)} kg → zakup: ${buy}`,
      assumptions: [
        `Powierzchnia: ${fmt(area)} m²`,
        `Zużycie masy: 0,5 kg/m² (orientacyjnie)`,
        `Ilość zależy od głębokości ubytków`,
      ],
    };
  },

  skimCoat(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const coats = getCoats(m);
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² × ${fmt(coats, 0)} warstwy × 1,5 kg/m²${waste} = ${fmt(rawQuantity)} kg → zakup: ${buy}`,
      assumptions: [
        `Powierzchnia: ${fmt(area)} m²`,
        `Liczba warstw: ${fmt(coats, 0)}`,
        `Zużycie: 1,5 kg/m² na warstwę (masa gipsowa)`,
      ],
    };
  },

  mesh(ctx) {
    const { measurements: m, rawQuantity, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² powierzchni → ${fmt(rawQuantity)} m siatki → zakup: ${buy}`,
      assumptions: [
        `Siatka wzmacniająca nakładana na naprawiane pęknięcia`,
        `Ilość orientacyjna — zależy od zakresu napraw`,
      ],
    };
  },

  sandpaper(ctx) {
    const { measurements: m, purchaseQuantity, purchaseUnit } = ctx;
    const area = getArea(m);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, ctx.material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² ÷ 5 m²/arkusz = ${fmt(purchaseQuantity)} arkuszy → zakup: ${buy}`,
      assumptions: [
        `1 arkusz na ok. 5 m² (grubszy papier — mniej)`,
        `Kup różne gradacje: 120 i 240`,
      ],
    };
  },

  // ── Tape ─────────────────────────────────────────────────────────────────

  tape(ctx) {
    const { measurements: m, purchaseQuantity, purchaseUnit, material } = ctx;
    const p = getPerimeter(m);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(p)} mb obwodu ÷ 25 mb/rolka = ${fmt(ctx.rawQuantity, 0)} rolek → zakup: ${buy}`,
      assumptions: [
        `Obwód pomieszczenia: ${fmt(p)} mb`,
        `1 rolka taśmy (25 mb) na ok. 6 mb krawędzi`,
      ],
    };
  },

  // ── Wallpaper ────────────────────────────────────────────────────────────

  wallpaper(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m²${waste} = ${fmt(rawQuantity)} m² tapet → zakup: ${buy}`,
      assumptions: [
        `Powierzchnia ścian: ${fmt(area)} m²`,
        `Odpad na wzór i cięcia: ${fmtPct(wasteFactor)}`,
        `Rolki tapety zazwyczaj zawierają 5 m² (10 m × 0,5 m)`,
      ],
    };
  },

  wallpaperGlue(ctx) {
    const { measurements: m, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² ÷ 40 m²/kg = ${fmt(ctx.rawQuantity)} kg kleju → zakup: ${buy}`,
      assumptions: [
        `1 kg kleju na ok. 40 m² tapet (sprawdź na opakowaniu)`,
        `Klej mieszany z wodą wg proporcji producenta`,
      ],
    };
  },

  // ── Flooring ─────────────────────────────────────────────────────────────

  floorPanels(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m²${waste} = ${fmt(rawQuantity)} m² paneli → zakup: ${buy}`,
      assumptions: [
        `Powierzchnia podłogi: ${fmt(area)} m²`,
        `Odpad na cięcia i układ: ${fmtPct(wasteFactor)}`,
      ],
    };
  },

  panelPacks(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const packCov = m.panelPackCoverageM2 ?? 2.196;
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m²${waste} ÷ ${fmt(packCov)} m²/paczka = ${fmt(ctx.packs ?? rawQuantity, 0)} paczek → zakup: ${buy}`,
      assumptions: [
        `Powierzchnia podłogi: ${fmt(area)} m²`,
        `Pokrycie paczki: ${fmt(packCov)} m²/paczka`,
        `Odpad na cięcia: ${fmtPct(wasteFactor)}`,
      ],
    };
  },

  underlay(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m²${waste} = ${fmt(rawQuantity)} m² podkładu → zakup: ${buy}`,
      assumptions: [
        `Podkład kładziony na całej powierzchni podłogi`,
        `Zakłady 10 cm między pasami`,
      ],
    };
  },

  threshold(ctx) {
    const { purchaseQuantity, purchaseUnit, material } = ctx;
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `1 listwa progowa na przejście między pomieszczeniami → zakup: ${buy}`,
      assumptions: [`Listwa do każdego progu osobno`],
    };
  },

  skirting(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const lm = getPerimeter(m);
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(lm)} mb obwodu${waste} = ${fmt(rawQuantity)} mb listew → zakup: ${buy}`,
      assumptions: [
        `Obwód pomieszczenia: ${fmt(lm)} mb`,
        `Odpad na narożniki i cięcia: ${fmtPct(wasteFactor)}`,
        `Listwy dostępne w długościach 2,4 m lub 2,7 m`,
      ],
    };
  },

  skirtingGlue(ctx) {
    const { measurements: m, purchaseQuantity, purchaseUnit, material } = ctx;
    const lm = getPerimeter(m);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(lm)} mb ÷ 8 mb/kartusze = ${fmt(ctx.rawQuantity)} → zakup: ${buy}`,
      assumptions: [
        `1 kartusze kleju na ok. 8 mb listew`,
        `Alternatywnie: gwoździe ukryte lub taśma montażowa`,
      ],
    };
  },

  corners(ctx) {
    const { purchaseQuantity, purchaseUnit, material } = ctx;
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `4 narożniki w pomieszczeniu → zakup: ${buy}`,
      assumptions: [`Standardowe pomieszczenie — 4 narożniki`],
    };
  },

  // ── Tiles ────────────────────────────────────────────────────────────────

  tiles(ctx) {
    const { measurements: m, rawQuantity, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const wasteMultiplier = m.wastePercent != null ? 1 + m.wastePercent / 100 : 1.15;
    const wastePct = Math.round((wasteMultiplier - 1) * 100);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² × ${wasteMultiplier.toFixed(2)} (odpad ${wastePct}%) = ${fmt(rawQuantity)} m² → zakup: ${buy}`,
      assumptions: [
        `Powierzchnia: ${fmt(area)} m²`,
        `Odpad na cięcia i wzór: ${wastePct}%`,
        `Kup z zapasem — uzupełnienie może się różnić kolorem`,
      ],
    };
  },

  tilePieces(ctx) {
    const { measurements: m, rawQuantity, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const tw = m.tileWidthCm ?? 30;
    const th = m.tileHeightCm ?? 30;
    const wasteMultiplier = m.wastePercent != null ? 1 + m.wastePercent / 100 : 1.15;
    const wastePct = Math.round((wasteMultiplier - 1) * 100);
    const tileM2 = (tw / 100) * (th / 100);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² × ${wasteMultiplier.toFixed(2)} (odpad ${wastePct}%) ÷ ${fmt(tileM2, 4)} m²/szt = ${fmt(rawQuantity, 0)} szt → zakup: ${buy}`,
      assumptions: [
        `Powierzchnia: ${fmt(area)} m²`,
        `Rozmiar płytki: ${tw}×${th} cm`,
        `Odpad: ${wastePct}% (cięcia, wzór, uszkodzenia)`,
      ],
    };
  },

  tileAdhesive(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² × 4 kg/m²${waste} = ${fmt(rawQuantity)} kg → zakup: ${buy}`,
      assumptions: [
        `Powierzchnia: ${fmt(area)} m²`,
        `Zużycie kleju: 4 kg/m² (paca 8 mm)`,
        `Na duże płytki (>60 cm) stosuj metodę pełnego krycia`,
      ],
    };
  },

  grout(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const tw = m.tileWidthCm ?? 30;
    const th = m.tileHeightCm ?? 30;
    const groutMm = m.groutWidthMm ?? 3;
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² × wzór fugi (${tw}×${th} cm, spoina ${groutMm} mm)${waste} = ${fmt(rawQuantity)} kg → zakup: ${buy}`,
      assumptions: [
        `Powierzchnia: ${fmt(area)} m²`,
        `Płytka: ${tw}×${th} cm`,
        `Szerokość spoiny: ${groutMm} mm`,
        `Gęstość fugi: ok. 1,7 g/cm³`,
      ],
    };
  },

  crosses(ctx) {
    const { measurements: m, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const tw = m.tileWidthCm ?? 30;
    const th = m.tileHeightCm ?? 30;
    const tileM2 = (tw / 100) * (th / 100);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m² ÷ ${fmt(tileM2, 4)} m²/szt × 2 krzyżyki = ${fmt(ctx.rawQuantity, 0)} → zakup: ${buy}`,
      assumptions: [
        `Ok. 2 krzyżyki na płytkę`,
        `Pakowanie zazwyczaj 100–250 szt.`,
      ],
    };
  },

  // ── Waterproofing / sealing ───────────────────────────────────────────────

  membrane(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const wallArea = m.wallArea ?? 0;
    const floorArea = m.floorArea ?? 0;
    const total = wallArea + floorArea;
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `(${fmt(wallArea)} m² ściany + ${fmt(floorArea)} m² podłogi)${waste} = ${fmt(rawQuantity)} kg → zakup: ${buy}`,
      assumptions: [
        `Ściany: ${fmt(wallArea)} m²`,
        `Podłoga: ${fmt(floorArea)} m²`,
        `Zużycie: ok. 1 kg/m² × 2 warstwy`,
        `Narożniki: dodatkowe zarobienie taśmą`,
      ],
    };
  },

  sealingTape(ctx) {
    const { measurements: m, purchaseQuantity, purchaseUnit, material } = ctx;
    const p = getPerimeter(m) || (m.wallArea ? Math.sqrt(m.wallArea) * 4 : 0);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(p)} mb obwodu (narożniki podłoga-ściana) → zakup: ${buy}`,
      assumptions: [
        `Taśma na styk podłogi ze ścianą dookoła pomieszczenia`,
        `Dodaj też narożniki ściana-ściana w brodziku/wannie`,
      ],
    };
  },

  silicone(ctx) {
    const { measurements: m, rawQuantity, purchaseQuantity, purchaseUnit, material } = ctx;
    const lm = m.linearMeters ?? getPerimeter(m);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(lm)} mb ÷ 8 mb/kartusze = ${fmt(rawQuantity, 0)} kartusz → zakup: ${buy}`,
      assumptions: [
        `Długość fug: ${fmt(lm)} mb`,
        `1 kartusze (300 ml) na ok. 8 mb fugi`,
        `Silikon sanitarny z fungicydem`,
      ],
    };
  },

  // ── Linear / skirting / frames ────────────────────────────────────────────

  linearMeters(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const lm = m.linearMeters ?? 0;
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(lm)} mb${waste} = ${fmt(rawQuantity)} mb → zakup: ${buy}`,
      assumptions: [`Długość: ${fmt(lm)} mb`],
    };
  },

  byArea(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const area = getArea(m);
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(area)} m²${waste} = ${fmt(rawQuantity)} → zakup: ${buy}`,
      assumptions: [`Powierzchnia: ${fmt(area)} m²`],
    };
  },

  byPerimeter(ctx) {
    const { measurements: m, rawQuantity, wasteFactor, purchaseQuantity, purchaseUnit, material } = ctx;
    const p = getPerimeter(m);
    const waste = wasteNote(wasteFactor);
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(p)} mb${waste} = ${fmt(rawQuantity)} → zakup: ${buy}`,
      assumptions: [`Obwód: ${fmt(p)} mb`],
    };
  },

  // ── Plumbing / electrical ────────────────────────────────────────────────

  faucets(ctx) {
    const { measurements: m, purchaseQuantity, purchaseUnit, material } = ctx;
    const count = m.faucetCount ?? 1;
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(count, 0)} punkt(y) wody → zakup: ${buy}`,
      assumptions: [`Liczba punktów: ${fmt(count, 0)}`],
    };
  },

  sockets(ctx) {
    const { measurements: m, purchaseQuantity, purchaseUnit, material } = ctx;
    const count = m.socketCount ?? 1;
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `${fmt(count, 0)} punkt(y) elektryczne → zakup: ${buy}`,
      assumptions: [`Liczba gniazdek/przełączników: ${fmt(count, 0)}`],
    };
  },

  constant(ctx) {
    const { purchaseQuantity, purchaseUnit, material } = ctx;
    const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
    return {
      text: `1 sztuka (stała ilość) → zakup: ${buy}`,
      assumptions: [],
    };
  },
};

// Aliases
FORMULA_EXPLANATIONS['mesh'] = FORMULA_EXPLANATIONS['byArea'];

// ─── Fallback explanation ──────────────────────────────────────────────────────

function genericExplanation(ctx: MaterialExplanationContext): MaterialExplanation {
  const { rawQuantity, quantity, purchaseQuantity, purchaseUnit, material } = ctx;
  const buy = purchaseStr(purchaseQuantity, purchaseUnit, material.packaging, ctx.packs);
  return {
    text: `Obliczona ilość: ${fmt(rawQuantity)} ${material.unit} → po zaokrągleniu: ${fmt(quantity)} → zakup: ${buy}`,
    assumptions: [],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a Polish-language explanation for a material calculation.
 * Uses formula key if available; falls back to generic text for inline formulas.
 */
export function generateExplanation(
  material: MaterialItem | MaterialRequirement,
  measurements: MeasurementMap,
  rawQuantity: number,
  quantity: number,
  packs: number | undefined
): MaterialExplanation {
  const packaging = material.packaging;
  const purchaseQuantity = packs !== undefined && packaging
    ? packs                 // packs are the purchase unit count
    : quantity;
  const purchaseUnit = (packs !== undefined && packaging)
    ? packaging.purchaseUnit
    : (material.purchaseUnit ?? material.unit);

  const ctx: MaterialExplanationContext = {
    material,
    rawQuantity,
    quantity,
    packs,
    purchaseQuantity,
    purchaseUnit,
    wasteFactor: material.wasteFactor ?? 1.0,
    measurements,
  };

  const formulaKey = (material as MaterialItem).formulaKey ?? '';
  const explainer = FORMULA_EXPLANATIONS[formulaKey];
  return explainer ? explainer(ctx) : genericExplanation(ctx);
}
