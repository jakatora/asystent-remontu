// Referencyjne stawki ROBOCIZNY + mapowanie job -> pozycje robocizny.
//
// KONWENCJA PIENIĘDZY: wszystkie stawki w GROSZACH za jednostkę (integer),
// spójnie z resztą serwisu wyceny. Wartości PLN przeliczone na grosze RĘCZNIE na
// etapie definicji (bez mnożenia floatów w runtime), np. 23,60 zł/m² = 2360 gr/m².
//
// ŹRÓDŁO DANYCH: port 1:1 z aplikacji mobilnej `artifacts/mobile/data/prices/
// labor.ts` (LABOR_PRICES) i `.../mappings.ts` (JOB_LABOR_MAPPINGS). Backend jest
// osobnym deployem i nie importuje kodu mobile (inny workspace / alias), więc
// trzyma własną kopię danych — analogicznie do nakładki EAN w api-server. Każda
// stawka zachowuje atrybucję źródła (sourceName + sourceType + lastUpdated) z
// oryginalnego zestawu (ankieta wykonawców „KB Łódź" / referencje rynkowe).
//
// Region: zaseedowany jest WYŁĄCZNIE 'lodzkie' (spójnie z mobile
// data/prices/regions.ts). To domyślny region wyceny; brak stawki dla żądanego
// regionu => fallback na 'lodzkie' (patrz labor.ts).

/** Jednostka rozliczenia robocizny (podzbiór faktycznie używany w danych). */
export type LaborUnit = "m2" | "mb" | "szt";

/** Typ źródła stawki (atrybucja pochodzenia, spójna z mobile types/pricing.ts). */
export type LaborSourceType =
  | "contractor_survey"
  | "retail_store"
  | "market_reference"
  | "user_override";

/**
 * Pojedyncza referencyjna stawka robocizny. `id` jest unikalny (klucz mapowania
 * job -> robocizna). Kwoty w GROSZACH za jednostkę `laborUnit`.
 */
export interface LaborRate {
  readonly id: string;
  /** Id joba remontowego, którego dotyczy stawka (informacyjnie). */
  readonly renovationJobId: string;
  readonly regionCode: string;
  readonly regionLabel: string;
  readonly laborUnit: LaborUnit;
  /** Stawka minimalna w GROSZACH za jednostkę. */
  readonly priceMinGrosze: number;
  /** Stawka maksymalna w GROSZACH za jednostkę. */
  readonly priceMaxGrosze: number;
  /** Stawka bazowa (używana do wyceny) w GROSZACH za jednostkę. */
  readonly priceBaselineGrosze: number;
  // --- atrybucja źródła (wymagana: każda stawka MUSI mieć source) ---
  readonly sourceName: string;
  readonly sourceType: LaborSourceType;
  readonly sourceUrl?: string;
  readonly lastUpdated: string;
  readonly notes?: string;
}

/** Mapowanie job -> lista id stawek robocizny (kolejność zachowana). */
export interface JobLaborMapping {
  readonly jobId: string;
  readonly laborRateIds: readonly string[];
}

const REGION_CODE = "lodzkie";
const REGION_LABEL = "Łódź / łódzkie";

/**
 * Referencyjne stawki robocizny (region 'lodzkie'). Kwoty w GROSZACH/jednostkę,
 * przeliczone ręcznie z PLN (źródło: mobile data/prices/labor.ts).
 */
export const LABOR_RATES: readonly LaborRate[] = [
  {
    id: "labor-wall-primer",
    renovationJobId: "wall-primer",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 732, // 7,32 zł/m²
    priceMaxGrosze: 791, // 7,91 zł/m²
    priceBaselineGrosze: 791,
    sourceName: "KB Łódź",
    sourceType: "contractor_survey",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-wall-painting-3-coats",
    renovationJobId: "wall-painting",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 2180, // 21,80 zł/m²
    priceMaxGrosze: 2360, // 23,60 zł/m²
    priceBaselineGrosze: 2360,
    sourceName: "KB Łódź",
    sourceType: "contractor_survey",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-wallpaper-installation",
    renovationJobId: "wallpaper-installation",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 3410, // 34,10 zł/m²
    priceMaxGrosze: 3690, // 36,90 zł/m²
    priceBaselineGrosze: 3690,
    sourceName: "KB Łódź",
    sourceType: "contractor_survey",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-wallpaper-pattern-match",
    renovationJobId: "wallpaper-installation",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 4880, // 48,80 zł/m²
    priceMaxGrosze: 5270, // 52,70 zł/m²
    priceBaselineGrosze: 5270,
    sourceName: "KB Łódź",
    sourceType: "contractor_survey",
    lastUpdated: "2026-04-01",
    notes: "Tapeta z dopasowaniem wzoru",
  },
  {
    id: "labor-skim-coat",
    renovationJobId: "skim-coat",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 4320, // 43,20 zł/m²
    priceMaxGrosze: 4670, // 46,70 zł/m²
    priceBaselineGrosze: 4670,
    sourceName: "KB łódzkie",
    sourceType: "contractor_survey",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-repair-holes-cracks",
    renovationJobId: "repair-holes-cracks",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 1640, // 16,40 zł/m²
    priceMaxGrosze: 1770, // 17,70 zł/m²
    priceBaselineGrosze: 1770,
    sourceName: "KB łódzkie",
    sourceType: "contractor_survey",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-laminate-installation",
    renovationJobId: "laminate-flooring",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 4310, // 43,10 zł/m²
    priceMaxGrosze: 4750, // 47,50 zł/m²
    priceBaselineGrosze: 4310,
    sourceName: "KB łódzkie / Łódź reference",
    sourceType: "contractor_survey",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-skirting-installation",
    renovationJobId: "skirting-boards",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "mb",
    priceMinGrosze: 1500, // 15,00 zł/mb
    priceMaxGrosze: 2500, // 25,00 zł/mb
    priceBaselineGrosze: 2000,
    sourceName: "open market reference",
    sourceType: "market_reference",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-vinyl-click-installation",
    renovationJobId: "vinyl-click-flooring",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 3500, // 35,00 zł/m²
    priceMaxGrosze: 5000, // 50,00 zł/m²
    priceBaselineGrosze: 4250,
    sourceName: "open market reference",
    sourceType: "market_reference",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-glued-vinyl-installation",
    renovationJobId: "glued-vinyl-flooring",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 5000, // 50,00 zł/m²
    priceMaxGrosze: 7000, // 70,00 zł/m²
    priceBaselineGrosze: 6000,
    sourceName: "open market reference",
    sourceType: "market_reference",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-wall-tiles-installation",
    renovationJobId: "wall-tiles-bathroom",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 12300, // 123,00 zł/m²
    priceMaxGrosze: 13300, // 133,00 zł/m²
    priceBaselineGrosze: 13300,
    sourceName: "KB Łódź",
    sourceType: "contractor_survey",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-standard-tiles-installation",
    renovationJobId: "floor-tiles",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 10400, // 104,00 zł/m²
    priceMaxGrosze: 11300, // 113,00 zł/m²
    priceBaselineGrosze: 11300,
    sourceName: "KB Łódź",
    sourceType: "contractor_survey",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-gres-installation",
    renovationJobId: "floor-tiles",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 16800, // 168,00 zł/m²
    priceMaxGrosze: 18200, // 182,00 zł/m²
    priceBaselineGrosze: 18200,
    sourceName: "KB Łódź",
    sourceType: "contractor_survey",
    lastUpdated: "2026-04-01",
    notes: "Gres porcelanowy — stawka wyższa",
  },
  {
    id: "labor-substrate-primer-tiles",
    renovationJobId: "wall-tiles-bathroom",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "m2",
    priceMinGrosze: 900, // 9,00 zł/m²
    priceMaxGrosze: 976, // 9,76 zł/m²
    priceBaselineGrosze: 976,
    sourceName: "KB Łódź aggregate reference",
    sourceType: "contractor_survey",
    lastUpdated: "2026-04-01",
    notes: "Gruntowanie podłoża przed płytkami",
  },
  {
    id: "labor-sink-installation",
    renovationJobId: "sink-installation",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "szt",
    priceMinGrosze: 30000, // 300,00 zł/szt
    priceMaxGrosze: 45000, // 450,00 zł/szt
    priceBaselineGrosze: 42000,
    sourceName: "KB / market reference",
    sourceType: "market_reference",
    lastUpdated: "2026-04-01",
  },
  {
    id: "labor-toilet-installation",
    renovationJobId: "toilet-installation",
    regionCode: REGION_CODE,
    regionLabel: REGION_LABEL,
    laborUnit: "szt",
    priceMinGrosze: 45000, // 450,00 zł/szt
    priceMaxGrosze: 65000, // 650,00 zł/szt
    priceBaselineGrosze: 55000,
    sourceName: "KB / market reference",
    sourceType: "market_reference",
    lastUpdated: "2026-04-01",
  },
];

/**
 * Mapowanie job -> pozycje robocizny (port z mobile data/prices/mappings.ts
 * JOB_LABOR_MAPPINGS). Puste listy oznaczają brak robocizny dla etapu (np. sam
 * materiał). Kolejność id zachowana.
 */
export const JOB_LABOR_MAPPINGS: readonly JobLaborMapping[] = [
  { jobId: "wall-primer", laborRateIds: ["labor-wall-primer"] },
  { jobId: "paint-walls", laborRateIds: ["labor-wall-painting-3-coats"] },
  { jobId: "paint-ceiling", laborRateIds: ["labor-wall-painting-3-coats"] },
  { jobId: "wallpaper-install", laborRateIds: ["labor-wallpaper-installation"] },
  { jobId: "wallpaper-remove", laborRateIds: ["labor-wallpaper-installation"] },
  { jobId: "wall-repair", laborRateIds: ["labor-repair-holes-cracks"] },
  { jobId: "skim-coat", laborRateIds: ["labor-skim-coat"] },
  { jobId: "laminate-flooring", laborRateIds: ["labor-laminate-installation"] },
  { jobId: "skirting-boards", laborRateIds: ["labor-skirting-installation"] },
  { jobId: "vinyl-flooring", laborRateIds: ["labor-vinyl-click-installation"] },
  { jobId: "vinyl-click-flooring", laborRateIds: ["labor-vinyl-click-installation"] },
  { jobId: "vinyl-glued", laborRateIds: ["labor-glued-vinyl-installation"] },
  {
    jobId: "wall-tiles-bathroom",
    laborRateIds: ["labor-wall-tiles-installation", "labor-substrate-primer-tiles"],
  },
  { jobId: "floor-tiles", laborRateIds: ["labor-standard-tiles-installation"] },
  { jobId: "grout-only", laborRateIds: [] },
  { jobId: "silicone-sealing", laborRateIds: [] },
  { jobId: "bathroom-waterproofing", laborRateIds: [] },
  { jobId: "sink-installation", laborRateIds: ["labor-sink-installation"] },
  { jobId: "toilet-installation", laborRateIds: ["labor-toilet-installation"] },
  { jobId: "minor-plumbing", laborRateIds: ["labor-sink-installation"] },
  { jobId: "gypsum-wall", laborRateIds: ["labor-skim-coat"] },
  { jobId: "gypsum-ceiling", laborRateIds: ["labor-skim-coat"] },
  { jobId: "paint-frames", laborRateIds: ["labor-wall-painting-3-coats"] },
  { jobId: "kitchen-cabinet-paint", laborRateIds: ["labor-wall-painting-3-coats"] },
  { jobId: "kitchen-backsplash", laborRateIds: ["labor-wall-tiles-installation"] },
  { jobId: "door-painting", laborRateIds: ["labor-wall-painting-3-coats"] },
  { jobId: "epoxy-floor", laborRateIds: ["labor-glued-vinyl-installation"] },
  { jobId: "parquet-sanding", laborRateIds: ["labor-laminate-installation"] },
  { jobId: "underlay-install", laborRateIds: [] },
];

const RATE_BY_ID = new Map(LABOR_RATES.map((r) => [r.id, r]));
const LABOR_IDS_BY_JOB = new Map(
  JOB_LABOR_MAPPINGS.map((m) => [m.jobId, m.laborRateIds]),
);

/** Domyślny region wyceny robocizny (jedyny zaseedowany). */
export const DEFAULT_LABOR_REGION = REGION_CODE;

/** Stawka po id (albo undefined, gdy brak). */
export function getLaborRateById(id: string): LaborRate | undefined {
  return RATE_BY_ID.get(id);
}

/** Id stawek robocizny dla joba (pusta lista gdy brak mapowania). */
export function getLaborRateIdsForJob(jobId: string): readonly string[] {
  return LABOR_IDS_BY_JOB.get(jobId) ?? [];
}
