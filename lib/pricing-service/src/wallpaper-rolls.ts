/** A plain wallpaper is cut into full-height strips; unused narrow widths are
 * not silently reused as full strips. Lengths remain integer millimetres. */
export interface WallpaperRollSpecification { widthMm: number; lengthMm: number }
export interface WallpaperPanel { id: string; widthMm: number; heightMm: number; allowanceMm: number }
export interface PlainWallpaperRequirement { version: 1; panels: WallpaperPanel[] }
// source: https://www.erismann.de/en/collection/rollover-27
// source: https://plejadatapet.pl/pl/p/Gladka-tapeta-flizelinowa-150gm2-25m-0%2C75m-3333-5-Erismann-RollOver/23972
export const ERISMANN_3333_5_EAN = '4002790333357';
export const ERISMANN_3333_5_ROLL: WallpaperRollSpecification = { widthMm: 750, lengthMm: 25000 };
export interface WallpaperCutGroup { id: string; lengthMm: number; count: number }
export interface WallpaperCutRoll { strips: { panelId: string; lengthMm: number }[]; usedMm: number; remainingMm: number }
export interface WallpaperCutPlan {
  rollsNeeded: number;
  rolls: WallpaperCutRoll[];
  stripCount: number;
  totalCutLengthMm: number;
  totalUnusedLengthMm: number;
  optimal: boolean;
  /** An exact proof may reach a bounded search limit; the returned cuts always fit. */
  searchLimited: boolean;
  stripsByPanel: Record<string, number>;
}
const MAX_STRIPS = 2000;
const MAX_SEARCH_NODES = 50000;
const integer = (value: number, min: number, max: number) => Number.isSafeInteger(value) && value >= min && value <= max;

export function planPlainWallpaperPanels(panels: readonly WallpaperPanel[], spec: WallpaperRollSpecification): WallpaperCutPlan | null {
  if (!integer(spec.widthMm, 100, 3000) || panels.length === 0 || panels.length > 100) return null;
  const groups: WallpaperCutGroup[] = [];
  for (const panel of panels) {
    if (!integer(panel.widthMm, 1, 100000) || !integer(panel.heightMm, 100, 30000) || !integer(panel.allowanceMm, 0, 1000)) return null;
    groups.push({ id: panel.id, lengthMm: panel.heightMm + panel.allowanceMm, count: Math.ceil(panel.widthMm / spec.widthMm) });
  }
  return planPlainWallpaperCuts(groups, spec.lengthMm);
}

/** Feasible cuts first, with an exact minimum when proved. This never prices
 * fractional rolls or combines offcuts by area alone. It intentionally excludes
 * patterned wallpapers, whose repeat and phase require a different cut model. */
export function planPlainWallpaperCuts(groups: readonly WallpaperCutGroup[], rollLengthMm: number): WallpaperCutPlan | null {
  if (!integer(rollLengthMm, 1000, 100000) || groups.length === 0 || groups.length > 100) return null;
  const pieces: { panelId: string; lengthMm: number }[] = [], stripsByPanel: Record<string, number> = Object.create(null);
  for (const group of groups) {
    if (typeof group.id !== 'string' || !group.id || group.id.length > 200 || !integer(group.count, 1, MAX_STRIPS) || !integer(group.lengthMm, 1, rollLengthMm) || pieces.length + group.count > MAX_STRIPS) return null;
    stripsByPanel[group.id] = (stripsByPanel[group.id] ?? 0) + group.count;
    for (let i = 0; i < group.count; i++) pieces.push({ panelId: group.id, lengthMm: group.lengthMm });
  }
  pieces.sort((a, b) => b.lengthMm - a.lengthMm || a.panelId.localeCompare(b.panelId));
  const totalCutLengthMm = pieces.reduce((sum, piece) => sum + piece.lengthMm, 0);
  const pack = (assignments: number[][]): WallpaperCutRoll[] => assignments.map(indices => {
    const strips = indices.map(index => ({ ...pieces[index] })), usedMm = strips.reduce((sum, strip) => sum + strip.lengthMm, 0);
    return { strips, usedMm, remainingMm: rollLengthMm - usedMm };
  });
  // First fit decreasing gives an actual, inspectable cutting plan immediately.
  let assignments: number[][] = [], used: number[] = [];
  for (const [index, piece] of pieces.entries()) {
    let bin = used.findIndex(value => value + piece.lengthMm <= rollLengthMm);
    if (bin < 0) { bin = used.length; used.push(0); assignments.push([]); }
    used[bin] += piece.lengthMm; assignments[bin].push(index);
  }
  const lowerBound = Math.max(Math.ceil(totalCutLengthMm / rollLengthMm), pieces.filter(piece => piece.lengthMm > rollLengthMm / 2).length);
  const singleLength = pieces.every(piece => piece.lengthMm === pieces[0].lengthMm);
  let optimal = assignments.length === lowerBound || singleLength, searchLimited = false, nodes = 0;
  // Typical rooms have few distinct heights. Bound difficult general instances
  // without pretending that a feasible plan is necessarily globally minimal.
  if (!optimal && pieces.length <= 80 && new Set(pieces.map(piece => piece.lengthMm)).size <= 10) {
    for (let target = lowerBound; target < assignments.length; target++) {
      const candidate: number[][] = Array.from({ length: target }, () => []), capacities = Array(target).fill(0) as number[], failed = new Set<string>();
      const search = (position: number): boolean => {
        if (position === pieces.length) return true;
        if (++nodes > MAX_SEARCH_NODES) { searchLimited = true; return false; }
        const key = position + ':' + capacities.slice().sort((a, b) => a - b).join(',');
        if (failed.has(key)) return false;
        const seen = new Set<number>(), length = pieces[position].lengthMm;
        for (let bin = 0; bin < target; bin++) {
          const before = capacities[bin];
          if (seen.has(before) || before + length > rollLengthMm) continue;
          seen.add(before); capacities[bin] += length; candidate[bin].push(position);
          if (search(position + 1)) return true;
          capacities[bin] = before; candidate[bin].pop();
          if (searchLimited || before === 0) break;
        }
        failed.add(key); return false;
      };
      if (search(0)) { assignments = candidate.filter(bin => bin.length); optimal = true; break; }
      if (searchLimited) break;
      if (target === assignments.length - 1) optimal = true;
    }
  } else if (!optimal) searchLimited = true;
  const rolls = pack(assignments);
  return { rollsNeeded: rolls.length, rolls, stripCount: pieces.length, totalCutLengthMm, totalUnusedLengthMm: rolls.length * rollLengthMm - totalCutLengthMm, optimal, searchLimited, stripsByPanel };
}
