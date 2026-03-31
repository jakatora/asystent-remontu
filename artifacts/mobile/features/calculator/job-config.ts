// ─── Job Calculator Config Registry ──────────────────────────────────────────
// Each renovation job can register its own calculator configuration here.
// The engine consults this registry when generating detailed calculation results.

import type { JobCalculatorConfig } from '@/types/calculation';
import type { MeasurementMap } from '@/types/calculator';

// ─── Registry ─────────────────────────────────────────────────────────────────

const _registry = new Map<string, JobCalculatorConfig>();

export function registerJobConfig(config: JobCalculatorConfig): void {
  _registry.set(config.jobId, config);
}

export function getJobConfig(jobId: string): JobCalculatorConfig | undefined {
  return _registry.get(jobId);
}

export function getAllJobConfigs(): ReadonlyMap<string, JobCalculatorConfig> {
  return _registry;
}

// ─── Default config factory ───────────────────────────────────────────────────

/** Creates a minimal config with common defaults. */
export function makeJobConfig(
  jobId: string,
  opts: Omit<JobCalculatorConfig, 'jobId'>
): JobCalculatorConfig {
  return { jobId, ...opts };
}

// ─── Validation helpers ────────────────────────────────────────────────────────

/** Returns Polish error if value is below min. */
export function minValue(value: number, min: number, label: string): string | null {
  return value < min ? `${label} musi wynosić co najmniej ${min}` : null;
}

/** Returns Polish error if area input is missing or zero. */
export function requireArea(m: MeasurementMap): string | null {
  const area = m.wallArea ?? m.floorArea ?? m.ceilingArea ?? m.area ?? 0;
  return area <= 0 ? 'Podaj powierzchnię (m²) — jest wymagana do obliczenia materiałów.' : null;
}

/** Returns Polish error if linear meter input is missing. */
export function requireLinearMeters(m: MeasurementMap): string | null {
  const lm = m.linearMeters ?? m.perimeter ?? 0;
  return lm <= 0 ? 'Podaj długość (mb) — jest wymagana do obliczenia materiałów.' : null;
}

// ─── Pre-registered configs (one per job, registered at module load time) ─────
// Each job file calls registerJobConfig() after its export.
// These are the configs for the core jobs.

// ── Painting ──────────────────────────────────────────────────────────────────

registerJobConfig({
  jobId: 'paint-walls',
  calculatorDescription: 'Oblicza farbę, grunt i akcesoria malarskie na podstawie powierzchni ścian.',
  defaultAssumptions: {
    coveragePerLiter: 'Wydajność farby: 10 m²/litr',
    coats: 'Liczba warstw: 2',
  },
  validate: (m) => {
    const errors: string[] = [];
    const err = requireArea(m);
    if (err) errors.push(err);
    return errors;
  },
});

registerJobConfig({
  jobId: 'paint-ceiling',
  calculatorDescription: 'Oblicza farbę sufitową, grunt i akcesoria.',
  defaultAssumptions: {
    coveragePerLiter: 'Wydajność farby sufitowej: 10 m²/litr',
    coats: 'Liczba warstw: 2',
  },
  validate: (m) => {
    const errors: string[] = [];
    const err = requireArea(m);
    if (err) errors.push(err);
    return errors;
  },
});

registerJobConfig({
  jobId: 'repaint-walls',
  calculatorDescription: 'Oblicza materiały do malowania ścian pokrytych starą farbą.',
  defaultAssumptions: {
    coveragePerLiter: 'Wydajność farby kryjącej: 8 m²/litr',
    coats: 'Liczba warstw: 2',
  },
});

registerJobConfig({
  jobId: 'primer-walls',
  calculatorDescription: 'Oblicza ilość gruntu głęboko penetrującego na podstawie powierzchni ścian.',
  defaultAssumptions: {
    coveragePerLiter: 'Wydajność gruntu: 10 m²/litr',
  },
  validate: (m) => {
    const errors: string[] = [];
    const err = requireArea(m);
    if (err) errors.push(err);
    return errors;
  },
});

registerJobConfig({
  jobId: 'wall-repair',
  calculatorDescription: 'Szacuje ilość masy szpachlowej na naprawę ubytków i pęknięć.',
  defaultAssumptions: {
    wallArea: 'Ilość materiału jest orientacyjna — zależy od głębokości ubytków',
  },
});

registerJobConfig({
  jobId: 'skim-coat',
  calculatorDescription: 'Oblicza masę szpachlową wykończeniową, grunt i materiały szlifierskie.',
  defaultAssumptions: {
    kgPerSqmPerCoat: 'Zużycie masy: 1,5 kg/m²/warstwę',
    coats: 'Liczba warstw: 2',
  },
  validate: (m) => {
    const errors: string[] = [];
    const err = requireArea(m);
    if (err) errors.push(err);
    return errors;
  },
});

registerJobConfig({
  jobId: 'wallpaper-install',
  calculatorDescription: 'Oblicza metry kwadratowe tapet, klej i taśmę malarską.',
  defaultAssumptions: {
    wasteFactor: 'Odpad na wzór i cięcia: 15%',
    rollCoverage: 'Rolka tapet: zazwyczaj 5 m² (sprawdź opakowanie)',
  },
  validate: (m) => {
    const errors: string[] = [];
    const err = requireArea(m);
    if (err) errors.push(err);
    return errors;
  },
});

registerJobConfig({
  jobId: 'wallpaper-remove',
  calculatorDescription: 'Szacuje środki do usuwania tapet i materiały przygotowawcze.',
  defaultAssumptions: {
    wallArea: 'Ilość środka do namaczania zależy od rodzaju tapet',
  },
});

// ── Flooring ─────────────────────────────────────────────────────────────────

registerJobConfig({
  jobId: 'laminate-flooring',
  calculatorDescription: 'Oblicza panele laminowane (paczki), podkład i akcesoria montażowe.',
  defaultAssumptions: {
    packCoverage: 'Jedna paczka paneli: ok. 2,196 m²',
    wasteFactor: 'Odpad: 10% (cięcia i układ)',
  },
  validate: (m) => {
    const errors: string[] = [];
    const err = requireArea(m);
    if (err) errors.push(err);
    return errors;
  },
});

registerJobConfig({
  jobId: 'vinyl-flooring',
  calculatorDescription: 'Oblicza panele winylowe LVT/SPC, podkład i akcesoria.',
  defaultAssumptions: {
    packCoverage: 'Jedna paczka paneli winylowych: ok. 2,0 m²',
    wasteFactor: 'Odpad: 10%',
  },
});

registerJobConfig({
  jobId: 'vinyl-glued',
  calculatorDescription: 'Oblicza wykładzinę winylową klejoną do podłoża wraz z klejem i listwami.',
  defaultAssumptions: {
    wasteFactor: 'Odpad: 5–10% na cięcia',
    adhesiveKgM2: 'Klej: ok. 0,4 kg/m²',
  },
});

registerJobConfig({
  jobId: 'floor-tiles',
  calculatorDescription: 'Oblicza płytki, klej, fugę i krzyżyki na podłogę.',
  defaultAssumptions: {
    tileSize: 'Rozmiar płytki: 30×30 cm (zmień w danych wejściowych)',
    wastePct: 'Odpad: 15% (cięcia i wzór)',
    adhesiveKgM2: 'Klej: 4 kg/m²',
  },
  validate: (m) => {
    const errors: string[] = [];
    const err = requireArea(m);
    if (err) errors.push(err);
    return errors;
  },
});

registerJobConfig({
  jobId: 'underlay-install',
  calculatorDescription: 'Oblicza podkład podłogowy, folię paroizolacyjną i taśmę.',
  defaultAssumptions: {
    wasteFactor: 'Odpad: 10% na zakłady',
  },
});

registerJobConfig({
  jobId: 'skirting-boards',
  calculatorDescription: 'Oblicza listwy przypodłogowe, klej i akcesoria narożne.',
  defaultAssumptions: {
    wasteFactor: 'Odpad: 10% na cięcia narożne',
    lmPerPack: 'Pakowanie: listwy 2,4 m szt.',
  },
  validate: (m) => {
    const errors: string[] = [];
    const err = requireLinearMeters(m);
    if (err) errors.push(err);
    return errors;
  },
});

// ── Bathroom ─────────────────────────────────────────────────────────────────

registerJobConfig({
  jobId: 'bathroom-waterproofing',
  calculatorDescription: 'Oblicza masę uszczelniającą i taśmę do hydroizolacji łazienki.',
  defaultAssumptions: {
    kgPerSqm: 'Masa uszczelniająca: ok. 1 kg/m² × 2 warstwy',
  },
  validate: (m) => {
    const errors: string[] = [];
    if ((m.wallArea ?? 0) <= 0 && (m.floorArea ?? 0) <= 0) {
      errors.push('Podaj powierzchnię ścian lub podłogi do hydroizolacji.');
    }
    return errors;
  },
});

registerJobConfig({
  jobId: 'wall-tiles-bathroom',
  calculatorDescription: 'Oblicza płytki ścienne, klej, fugę i hydroizolację pod płytki.',
  defaultAssumptions: {
    tileSize: 'Rozmiar płytki: 30×60 cm',
    wastePct: 'Odpad: 10% (mniej cięć na ścianach)',
    adhesiveKgM2: 'Klej: 4 kg/m²',
  },
  validate: (m) => {
    const errors: string[] = [];
    const err = requireArea(m);
    if (err) errors.push(err);
    return errors;
  },
});

registerJobConfig({
  jobId: 'grout-only',
  calculatorDescription: 'Oblicza ilość fugi na istniejące spoiny między płytkami.',
  defaultAssumptions: {
    groutMm: 'Szerokość spoiny: 3 mm',
    tileSize: 'Rozmiar płytki: 30×30 cm',
    kgPerSqm: 'ok. 0,5 kg/m² fugi',
  },
});

registerJobConfig({
  jobId: 'silicone-sealing',
  calculatorDescription: 'Oblicza liczbę kartusz silikonu na fug łazienki.',
  defaultAssumptions: {
    lmPerTube: '1 kartusze silikonu (300 ml) na ok. 8 mb fugi',
  },
  validate: (m) => {
    const errors: string[] = [];
    const err = requireLinearMeters(m);
    if (err) errors.push(err);
    return errors;
  },
});

// ── Windows & doors ──────────────────────────────────────────────────────────

registerJobConfig({
  jobId: 'window-sealing',
  calculatorDescription: 'Oblicza uszczelki, piankę montażową i silikon do okien.',
  defaultAssumptions: {
    lmPerFoamCan: '1 puszka pianki na ok. 8 mb szczeliny',
  },
  validate: (m) => {
    const errors: string[] = [];
    const err = requireLinearMeters(m);
    if (err) errors.push(err);
    return errors;
  },
});

registerJobConfig({
  jobId: 'paint-frames',
  calculatorDescription: 'Oblicza farbę i grunt do malowania ościeżnic drzwi i okien.',
  defaultAssumptions: {
    sqmPerFrame: 'Powierzchnia 1 ościeżnicy drzwiowej: ok. 2,5 m²',
    coveragePerLiter: 'Wydajność lakieru/farby: 8 m²/litr',
  },
});

registerJobConfig({
  jobId: 'windowsill-install',
  calculatorDescription: 'Oblicza parapet, piankę i silikon na podstawie długości.',
  defaultAssumptions: {
    wasteFactor: 'Odpad: 10% na cięcia',
  },
});

registerJobConfig({
  jobId: 'trim-finishing',
  calculatorDescription: 'Oblicza listwy maskujące, klej i silikon do wykończenia progów i ościeży.',
  defaultAssumptions: {
    wasteFactor: 'Odpad: 10% na cięcia narożne',
  },
});
