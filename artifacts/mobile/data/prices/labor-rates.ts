// ─────────────────────────────────────────────────────────────────────────────
// Stawki robocizny fachowców w Polsce
// ─────────────────────────────────────────────────────────────────────────────
// Zaktualizowane: 2026-06-12 (czerwiec 2026).
//
// Źródła: muratordom.pl, forsal.pl, agamiro.pl, cennikremontow.pl, kb.pl,
// kompendiumbudowlane.pl, sanitmax.pl, oknoplast.com.pl, ilekosztuje.eu i inne
// branżowe portale (pełne URLe w polu `source` każdej pozycji).
//
// UŻYCIE:
//   import { LABOR_RATES, getLaborRate } from '@/data/prices/labor-rates';
//   const rate = getLaborRate('paint-walls'); // → { priceMin: 25, priceMax: 40, ... }
//
// Trzy regiony cenowe (różnica ~30% w obie strony od średniej):
//   - 'cheap'   = mniejsze miasta (~30% taniej)
//   - 'average' = średnia PL
//   - 'premium' = Warszawa, Kraków, Trójmiasto (~30% drożej)
// ─────────────────────────────────────────────────────────────────────────────

export type LaborRegion = 'cheap' | 'average' | 'premium';
export type LaborUnit = 'zl/m²' | 'zl/m.b.' | 'zl/szt' | 'zl/h';

export interface LaborRate {
  /** Slug pasujący do RenovationJob.id lub kategorii. */
  readonly key: string;
  /** Czytelna nazwa typu pracy. */
  readonly workType: string;
  /** Jednostka rozliczenia. */
  readonly unit: LaborUnit;
  /** Cena minimalna (brutto). */
  readonly priceMin: number;
  /** Cena maksymalna (brutto). */
  readonly priceMax: number;
  /** Region cenowy. */
  readonly region: LaborRegion;
  /** URL źródła. */
  readonly source: string;
  /** Data weryfikacji (YYYY-MM-DD). */
  readonly verifiedAt: string;
  /** Opcjonalne uwagi (np. "z VAT", "min. zlecenie X zł"). */
  readonly notes?: string;
}

const D = '2026-06-12';

export const LABOR_RATES: readonly LaborRate[] = [
  // ── Malowanie ────────────────────────────────────────────────────────────
  { key: 'paint-walls', workType: 'Malowanie ścian i sufitów (2 warstwy)', unit: 'zl/m²',
    priceMin: 17, priceMax: 25, region: 'cheap', verifiedAt: D,
    source: 'https://kb.pl/remont-i-wykonczenie/malowanie-scian/ceny-malowania-scian/' },
  { key: 'paint-walls', workType: 'Malowanie ścian i sufitów (2 warstwy)', unit: 'zl/m²',
    priceMin: 25, priceMax: 40, region: 'average', verifiedAt: D,
    source: 'https://muratordom.pl/wnetrza/prace-wykonczeniowe/cennik-fachowca-2026-aa-4DHv-WK3Z-mDiw.html' },
  { key: 'paint-walls', workType: 'Malowanie ścian i sufitów (2 warstwy)', unit: 'zl/m²',
    priceMin: 30, priceMax: 50, region: 'premium', verifiedAt: D,
    source: 'https://forsal.pl/finanse/twoje-pieniadze/artykuly/9808229,malowanie-scian-2026.html' },

  // ── Gruntowanie ──────────────────────────────────────────────────────────
  { key: 'primer-walls', workType: 'Gruntowanie ścian', unit: 'zl/m²',
    priceMin: 7, priceMax: 14, region: 'average', verifiedAt: D,
    source: 'https://tapetysztukaterie.pl/cena-gruntowania-scian' },
  { key: 'primer-walls', workType: 'Gruntowanie ścian', unit: 'zl/m²',
    priceMin: 20, priceMax: 40, region: 'premium', verifiedAt: D,
    source: 'https://agamiro.pl/ile-kosztuje-gruntowanie-scian-cennik-2026' },

  // ── Szpachlowanie / Naprawa ──────────────────────────────────────────────
  { key: 'skim-coat', workType: 'Szpachlowanie / wyrównywanie ścian (gładź 2 warstwy)', unit: 'zl/m²',
    priceMin: 25, priceMax: 40, region: 'average', verifiedAt: D,
    source: 'https://s-szpachlowanie.pl/cena-szpachlowania' },
  { key: 'skim-coat', workType: 'Szpachlowanie / wyrównywanie ścian (gładź 2 warstwy)', unit: 'zl/m²',
    priceMin: 40, priceMax: 60, region: 'premium', verifiedAt: D,
    source: 'https://wnetrza.muratorexpo.pl/szpachlowanie-cena-w-2026' },
  { key: 'wall-repair', workType: 'Naprawa pęknięć i ubytków (miejscowe szpachlowanie)', unit: 'zl/m²',
    priceMin: 15, priceMax: 30, region: 'average', verifiedAt: D,
    source: 'https://kompendiumbudowlane.pl/ile-kosztuje-szpachlowanie-scian-cennik/' },

  // ── Tapetowanie ──────────────────────────────────────────────────────────
  { key: 'wallpaper-install', workType: 'Tapeta flizelinowa', unit: 'zl/m²',
    priceMin: 25, priceMax: 40, region: 'average', verifiedAt: D,
    source: 'https://t-tapety.pl/ile-kosztuje-polozenie-tapety-flizelinowej' },
  { key: 'wallpaper-install', workType: 'Tapeta winylowa / fototapeta', unit: 'zl/m²',
    priceMin: 30, priceMax: 60, region: 'premium', verifiedAt: D,
    source: 'https://cennikremontow.pl/tapetowanie-cennik/' },

  // ── Podłogi ──────────────────────────────────────────────────────────────
  { key: 'laminate-flooring', workType: 'Panele laminowane (klik, standard)', unit: 'zl/m²',
    priceMin: 35, priceMax: 55, region: 'average', verifiedAt: D,
    source: 'https://nowoczesny.pl/ukladanie-paneli-ceny-w-2026-roku/' },
  { key: 'laminate-flooring', workType: 'Panele laminowane (klik, standard)', unit: 'zl/m²',
    priceMin: 55, priceMax: 75, region: 'premium', verifiedAt: D,
    source: 'https://muratordom.pl/wnetrza/prace-wykonczeniowe/tyle-kosztuje-ukladanie-podlogi-aa-7dHp-crnw-Swvv.html' },
  { key: 'vinyl-flooring', workType: 'Panele winylowe LVT (klik)', unit: 'zl/m²',
    priceMin: 45, priceMax: 70, region: 'average', verifiedAt: D,
    source: 'https://arcydom.pl/pl/blog/Koszt-montazu-paneli-LVT/86' },
  { key: 'vinyl-glued', workType: 'Panele winylowe LVT (klejone)', unit: 'zl/m²',
    priceMin: 70, priceMax: 100, region: 'premium', verifiedAt: D,
    source: 'https://muratordom.pl/wnetrza/prace-wykonczeniowe/tyle-kosztuje-ukladanie-podlogi-aa-7dHp-crnw-Swvv.html' },

  // ── Płytki ──────────────────────────────────────────────────────────────
  { key: 'wall-tiles-bathroom', workType: 'Płytki ścienne (glazura)', unit: 'zl/m²',
    priceMin: 70, priceMax: 100, region: 'average', verifiedAt: D,
    source: 'https://adrem.org.pl/ukladanie-plytek-cena-za-m2/' },
  { key: 'wall-tiles-bathroom', workType: 'Płytki ścienne (glazura)', unit: 'zl/m²',
    priceMin: 126, priceMax: 148, region: 'premium', verifiedAt: D,
    source: 'https://muratordom.pl/wnetrza/prace-wykonczeniowe/aktualny-cennik-ukladania-plytek-luty-2026-aa-eycH-46oG-Pov5.html' },
  { key: 'floor-tiles', workType: 'Płytki podłogowe (gres / terakota)', unit: 'zl/m²',
    priceMin: 80, priceMax: 130, region: 'average', verifiedAt: D,
    source: 'https://ilekosztuje.eu/remont/ile-kosztuje-ukladanie-plytek/' },
  { key: 'floor-tiles', workType: 'Płytki podłogowe (gres / terakota)', unit: 'zl/m²',
    priceMin: 169, priceMax: 205, region: 'premium', verifiedAt: D,
    source: 'https://muratordom.pl/wnetrza/prace-wykonczeniowe/aktualny-cennik-ukladania-plytek-aa-eycH-46oG-Pov5.html' },

  // ── Łazienka ─────────────────────────────────────────────────────────────
  { key: 'bathroom-waterproofing', workType: 'Hydroizolacja łazienki (proste nanoszenie)', unit: 'zl/m²',
    priceMin: 20, priceMax: 40, region: 'cheap', verifiedAt: D,
    source: 'https://lazienki-l.pl/hydroizolacja-lazienki-cena-robocizny' },
  { key: 'bathroom-waterproofing', workType: 'Hydroizolacja łazienki (z siatką / wzmocniona)', unit: 'zl/m²',
    priceMin: 40, priceMax: 70, region: 'premium', verifiedAt: D,
    source: 'https://sanitmax.pl/hydroizolacja-lazienki-cena-za-m2' },
  { key: 'grout-only', workType: 'Fugowanie płytek (fuga cementowa)', unit: 'zl/m²',
    priceMin: 15, priceMax: 25, region: 'average', verifiedAt: D,
    source: 'https://ilekosztuje.eu/remont/ile-kosztuje-ukladanie-plytek/' },
  { key: 'grout-only', workType: 'Fugowanie płytek (fuga epoksydowa)', unit: 'zl/m²',
    priceMin: 30, priceMax: 45, region: 'premium', verifiedAt: D,
    source: 'https://www.lazienkowy.pl/6091-36-1868-cennik-uslug-glazurniczych-2026.html' },
  { key: 'silicone-sealing', workType: 'Silikonowanie', unit: 'zl/m.b.',
    priceMin: 5, priceMax: 10, region: 'cheap', verifiedAt: D,
    source: 'https://ilekosztuje.eu/remont/ile-kosztuje-silikonowanie-akrylowanie-cena-za-mb/' },
  { key: 'silicone-sealing', workType: 'Silikonowanie', unit: 'zl/m.b.',
    priceMin: 8, priceMax: 17, region: 'premium', verifiedAt: D,
    source: 'https://ilekosztuje.eu/remont/ile-kosztuje-silikonowanie-akrylowanie-cena-za-mb/' },

  // ── Stolarka ─────────────────────────────────────────────────────────────
  { key: 'window-install', workType: 'Montaż okna PVC (ciepły montaż)', unit: 'zl/szt',
    priceMin: 180, priceMax: 290, region: 'average', verifiedAt: D,
    source: 'https://oknoplast.com.pl/blog/ile-kosztuje-montaz-okien-cennik-robocizny/' },
  { key: 'door-install', workType: 'Drzwi wewnętrzne z ościeżnicą regulowaną', unit: 'zl/szt',
    priceMin: 150, priceMax: 300, region: 'average', verifiedAt: D,
    source: 'https://thermopanel.pl/montaz-drzwi-wewnetrznych-cena' },
  { key: 'door-install', workType: 'Drzwi wewnętrzne z ościeżnicą regulowaną', unit: 'zl/szt',
    priceMin: 300, priceMax: 500, region: 'premium', verifiedAt: D,
    source: 'https://cennikremontow.pl/montaz-drzwi-cennik' },

  // ── Sucha zabudowa GK ────────────────────────────────────────────────────
  { key: 'gypsum-wall', workType: 'Sucha zabudowa GK — ścianka działowa', unit: 'zl/m²',
    priceMin: 80, priceMax: 130, region: 'average', verifiedAt: D,
    source: 'https://gipsowy-remont.pl/cenniki-suchej-zabudowy' },
  { key: 'gypsum-ceiling', workType: 'Sucha zabudowa GK — sufit podwieszany', unit: 'zl/m²',
    priceMin: 60, priceMax: 90, region: 'average', verifiedAt: D,
    source: 'https://cennikremontow.pl/karton-gipsy-cennik/' },

  // ── Wylewki ──────────────────────────────────────────────────────────────
  { key: 'self-leveling', workType: 'Wylewka samopoziomująca', unit: 'zl/m²',
    priceMin: 36, priceMax: 52, region: 'average', verifiedAt: D,
    source: 'https://kb.pl/cenniki/wylewka-samopoziomujaca/' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpery wyszukiwania.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pobiera stawki dla danego typu pracy (po job id lub kategorii).
 * Zwraca wszystkie regiony pasujące do klucza (typowo 1-3).
 */
export function getLaborRates(key: string): readonly LaborRate[] {
  return LABOR_RATES.filter((r) => r.key === key);
}

/**
 * Pobiera typową stawkę średniej PL (region='average').
 * Fallback do pierwszej dostępnej jeśli brak 'average'.
 */
export function getLaborRate(key: string, region: LaborRegion = 'average'): LaborRate | undefined {
  const rates = getLaborRates(key);
  return rates.find((r) => r.region === region) ?? rates[0];
}
