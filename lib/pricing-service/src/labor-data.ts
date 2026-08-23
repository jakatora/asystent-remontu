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
// Region: bazowe stawki (LABOR_RATES) pochodzą z regionu 'lodzkie'. Różnice
// międzyregionalne modelujemy MNOŻNIKIEM regionalnym (REGION_LABOR_PROFILES) do
// stawki bazowej — zamiast duplikować 17 stawek × N regionów. 'lodzkie' to baza
// (mnożnik 1.00, region środkowy). Region bez profilu => fallback na 'lodzkie'
// (patrz labor.ts). Mnożniki wyprowadzone z raportów stawek robocizny PL — patrz
// `// source:` przy każdym profilu.

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

/**
 * Profil regionalny robocizny: mnożnik do bazowych stawek 'lodzkie'. Pełny koszt
 * robocizny pozycji = round(priceBaselineGrosze × multiplier) × ilość. Mnożnik
 * jest bezwymiarowy; kwoty pozostają w GROSZACH (integer) po zaokrągleniu.
 */
export interface RegionLaborProfile {
  readonly regionCode: string;
  readonly regionLabel: string;
  /** Mnożnik do stawki bazowej ('lodzkie' = 1.00). Musi być > 0. */
  readonly multiplier: number;
  // --- atrybucja źródła mnożnika (każdy profil MUSI mieć source) ---
  readonly sourceName: string;
  readonly sourceUrl?: string;
  readonly lastUpdated: string;
  readonly notes?: string;
}

/**
 * Profile regionalne robocizny. Mnożniki wyprowadzone z raportów stawek
 * robocizny wykończeniowej PL (stawki godzinowe i za m²), względem bazy
 * 'lodzkie' = 1.00 (region środkowy). Największa rozpiętość międzyregionalna to
 * ~30–40% (Warszawa najdroższa, regiony wschodnie najtańsze).
 * Dane robocizny wykończeniowej per województwo (godzinowe / m² dachu):
 * // source: https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony
 * Płytki 130–170 zł/m² w mazowieckiem/małopolskiem vs 80–110 zł/m² na wschodzie,
 * duże miasta +20–30%:
 * // source: https://ceny-remontu.pl/ceny-prac-remontowych
 */
export const REGION_LABOR_PROFILES: readonly RegionLaborProfile[] = [
  {
    regionCode: "lodzkie",
    regionLabel: REGION_LABEL,
    multiplier: 1.0, // baza — stawki z ankiety wykonawców KB Łódź
    // source: https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony
    sourceName: "KB Łódź (baza) / planetainwestora 2026",
    sourceUrl: "https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony",
    lastUpdated: "2026-08-23",
    notes: "Region bazowy (środkowy) — mnożnik referencyjny 1.00",
  },
  {
    regionCode: "mazowieckie",
    regionLabel: "Warszawa / mazowieckie",
    // Wykończeniówka 55–80 zł/h (najwyżej w PL) vs baza łódzka ~52 zł/h → +~25%.
    multiplier: 1.25,
    // source: https://maka-polska.pl/cennik-uslug-wykonczeniowych (55–80 zł/h)
    // source: https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony
    sourceName: "maka-polska / planetainwestora 2026 (mazowieckie)",
    sourceUrl: "https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony",
    lastUpdated: "2026-08-23",
    notes: "Najdroższy region (Warszawa) — +20–30% wg raportów",
  },
  {
    regionCode: "malopolskie",
    regionLabel: "Kraków / małopolskie",
    // Wykończeniówka 45–65 zł/h; płytki 130–170 zł/m² (grupa najdroższa) → +~10%.
    multiplier: 1.1,
    // source: https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony
    // source: https://ceny-remontu.pl/ceny-prac-remontowych
    sourceName: "planetainwestora / ceny-remontu 2026 (małopolskie)",
    sourceUrl: "https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony",
    lastUpdated: "2026-08-23",
  },
  {
    regionCode: "wielkopolskie",
    regionLabel: "Poznań / wielkopolskie",
    // Wykończeniówka 48–68 zł/h (nieco powyżej bazy) → +~8%.
    multiplier: 1.08,
    // source: https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony
    sourceName: "planetainwestora 2026 (wielkopolskie)",
    sourceUrl: "https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony",
    lastUpdated: "2026-08-23",
  },
  {
    regionCode: "slaskie",
    regionLabel: "Katowice / śląskie",
    // Wykończeniówka 45–65 zł/h; roboty 160–210 zł/m² (grupa średnia) → +~7%.
    multiplier: 1.07,
    // source: https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony
    sourceName: "planetainwestora 2026 (śląskie)",
    sourceUrl: "https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony",
    lastUpdated: "2026-08-23",
  },
];

const REGION_PROFILE_BY_CODE = new Map(
  REGION_LABOR_PROFILES.map((p) => [p.regionCode, p]),
);

const RATE_BY_ID = new Map(LABOR_RATES.map((r) => [r.id, r]));
const LABOR_IDS_BY_JOB = new Map(
  JOB_LABOR_MAPPINGS.map((m) => [m.jobId, m.laborRateIds]),
);

/** Domyślny region wyceny robocizny (jedyny zaseedowany). */
export const DEFAULT_LABOR_REGION = REGION_CODE;

/**
 * Profil regionalny robocizny po kodzie regionu (albo undefined, gdy region nie
 * ma zaseedowanego profilu — wtedy konsument robi fallback na 'lodzkie').
 */
export function getRegionLaborProfile(
  code: string,
): RegionLaborProfile | undefined {
  return REGION_PROFILE_BY_CODE.get(code);
}

/** Stawka po id (albo undefined, gdy brak). */
export function getLaborRateById(id: string): LaborRate | undefined {
  return RATE_BY_ID.get(id);
}

/** Id stawek robocizny dla joba (pusta lista gdy brak mapowania). */
export function getLaborRateIdsForJob(jobId: string): readonly string[] {
  return LABOR_IDS_BY_JOB.get(jobId) ?? [];
}
