import type { LaborPriceReference } from '@/types/pricing';

// ─────────────────────────────────────────────────────────────────────────────
// STAWKI ROBOCIZNY — dane z realnych cenników, nie wyliczone z głowy
// ─────────────────────────────────────────────────────────────────────────────
// Zaktualizowane: 2026-08-23. Poprzedni zestaw (2026-04-01) podawał źródło
// „KB Łódź / contractor_survey" BEZ ani jednego odnośnika, a widełki min→max miały
// w prawie każdej pozycji dokładnie ten sam mnożnik ×1,081 (7,32→7,91; 21,80→23,60;
// 123→133; 168→182). Taki wzór nie bierze się z pytania wykonawców o cenę — to były
// liczby wygenerowane, nie zebrane. Stąd pełna wymiana.
//
// ŹRÓDŁA (każda pozycja niesie `sourceUrl` do konkretnego cennika):
//   • kb.pl            — https://kb.pl/cenniki/uslugi/cennik-uslug-remontowych-aktualne-ceny/
//   • ceny-uslug.pl    — https://ceny-uslug.pl/cenniki-prac-remontowych-i-wykonczeniowych
//   • ogarnijremont.pl — https://ogarnijremont.pl/cennik-uslug-remontowych-2026/
//
// METODA: cenniki różnią się MOCNO (panele: 22–38 zł/m² u jednego, 70–85 u drugiego — bo
// jeden liczy sam montaż, drugi „pod klucz" z podkładem i listwami). Dlatego widełki rozpinamy
// między najniższą a najwyższą wiarygodną stawką z trzech źródeł, a `baseline` stawiamy tam,
// gdzie zgadzają się co najmniej dwa. Lepiej pokazać laikowi uczciwy przedział niż jedną ładną
// liczbę, która rozjedzie się z pierwszą ofertą wykonawcy.
//
// ⚠️ WSZYSTKIE STAWKI SĄ NETTO (tak podają wszystkie trzy cenniki). Remont mieszkania to
// zwykle 8% VAT — apka musi go doliczyć albo napisać wprost, że liczy netto. Bez tego
// użytkownik zobaczy kwotę niższą niż ta, którą realnie zapłaci.
//
// REGION: to zestaw BAZOWY (łódzkie, mnożnik 1,00). Inne województwa dostają ten sam zestaw
// przemnożony przez `laborMultiplier` z `regions.ts` — patrz `registry.ts`, które przy braku
// stawek dla regionu schodzi do bazy. Wcześniej wybór Warszawy dawał ZERO pozycji robocizny
// i wycena po cichu pokazywała same materiały.
// ─────────────────────────────────────────────────────────────────────────────

const KB = 'https://kb.pl/cenniki/uslugi/cennik-uslug-remontowych-aktualne-ceny/';
const CENY_USLUG = 'https://ceny-uslug.pl/cenniki-prac-remontowych-i-wykonczeniowych';
const OGARNIJ = 'https://ogarnijremont.pl/cennik-uslug-remontowych-2026/';

const NETTO = 'Stawka NETTO, sama robocizna bez materiału.';

export const LABOR_PRICES: readonly LaborPriceReference[] = [
  {
    id: 'labor-wall-primer',
    renovationJobId: 'wall-primer',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 8,
    laborPriceMax: 16,
    laborPriceBaseline: 12,
    currency: 'PLN',
    sourceName: 'kb.pl + ogarnijremont.pl (cenniki 2026)',
    sourceType: 'market_reference',
    sourceUrl: KB,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} kb.pl: 10–14 zł/m², ogarnijremont.pl: 7–18 zł/m².`,
  },
  {
    id: 'labor-wall-painting-3-coats',
    renovationJobId: 'wall-painting',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 25,
    laborPriceMax: 42,
    laborPriceBaseline: 32,
    currency: 'PLN',
    sourceName: 'kb.pl + ceny-uslug.pl + ogarnijremont.pl',
    sourceType: 'market_reference',
    sourceUrl: KB,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} Malowanie TRZYKROTNE: kb.pl 22–38 zł/m². Dwukrotne jest tańsze `
      + '(ceny-uslug.pl 22–35, ogarnijremont.pl 28–39) — trzecia warstwa to ok. +20%.',
  },
  {
    id: 'labor-wallpaper-installation',
    renovationJobId: 'wallpaper-installation',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 30,
    laborPriceMax: 55,
    laborPriceBaseline: 42,
    currency: 'PLN',
    sourceName: 'ceny-uslug.pl + kb.pl + ogarnijremont.pl',
    sourceType: 'market_reference',
    sourceUrl: OGARNIJ,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} ceny-uslug.pl 25–45 zł/m², kb.pl 40–60 (winylowa), ogarnijremont.pl 40–60.`,
  },
  {
    id: 'labor-wallpaper-pattern-match',
    renovationJobId: 'wallpaper-installation',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 40,
    laborPriceMax: 72,
    laborPriceBaseline: 55,
    currency: 'PLN',
    sourceName: 'ogarnijremont.pl (tapetowanie) + narzut za dopasowanie wzoru',
    sourceType: 'market_reference',
    sourceUrl: OGARNIJ,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} Tapeta ze wzorem do dopasowania: ok. +30% do zwykłego tapetowania `
      + '(większy odpad, wolniejsza praca). ⚠️ Narzut szacunkowy — cenniki nie podają go osobno.',
  },
  {
    id: 'labor-skim-coat',
    renovationJobId: 'skim-coat',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 30,
    laborPriceMax: 65,
    laborPriceBaseline: 45,
    currency: 'PLN',
    sourceName: 'ceny-uslug.pl + kb.pl + ogarnijremont.pl',
    sourceType: 'market_reference',
    sourceUrl: OGARNIJ,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} ceny-uslug.pl (szpachlowanie) 18–32 zł/m², kb.pl (gipsowanie) 45–65, `
      + 'ogarnijremont.pl (gładź) 35–75 — ze szlifowaniem od 50 zł/m².',
  },
  {
    id: 'labor-repair-holes-cracks',
    renovationJobId: 'repair-holes-cracks',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 15,
    laborPriceMax: 35,
    laborPriceBaseline: 22,
    currency: 'PLN',
    sourceName: 'pochodna stawki gładzi (ceny-uslug.pl, ogarnijremont.pl)',
    sourceType: 'market_reference',
    sourceUrl: CENY_USLUG,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} ⚠️ SZACUNEK: cenniki nie wyceniają łatania dziur osobno. Przyjęte jako `
      + 'ok. połowa stawki pełnej gładzi — to praca punktowa, nie na całej ścianie.',
  },
  {
    id: 'labor-laminate-installation',
    renovationJobId: 'laminate-flooring',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 30,
    laborPriceMax: 60,
    laborPriceBaseline: 40,
    currency: 'PLN',
    sourceName: 'ceny-uslug.pl + ogarnijremont.pl + kb.pl',
    sourceType: 'market_reference',
    sourceUrl: CENY_USLUG,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} ceny-uslug.pl 22–38 zł/m² (sam montaż), ogarnijremont.pl 30–85, `
      + 'kb.pl 70–85 (z podkładem i listwami — wariant „pod klucz").',
  },
  {
    id: 'labor-skirting-installation',
    renovationJobId: 'skirting-boards',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'mb',
    laborPriceMin: 12,
    laborPriceMax: 35,
    laborPriceBaseline: 20,
    currency: 'PLN',
    sourceName: 'ogarnijremont.pl (cennik 2026)',
    sourceType: 'market_reference',
    sourceUrl: OGARNIJ,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} ogarnijremont.pl: 10–40 zł/mb za sam montaż listew.`,
  },
  {
    id: 'labor-vinyl-click-installation',
    renovationJobId: 'vinyl-click-flooring',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 40,
    laborPriceMax: 70,
    laborPriceBaseline: 52,
    currency: 'PLN',
    sourceName: 'ogarnijremont.pl (panele winylowe)',
    sourceType: 'market_reference',
    sourceUrl: OGARNIJ,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} ogarnijremont.pl: 45–70 zł/m². Klik montuje się szybciej niż winyl klejony.`,
  },
  {
    id: 'labor-glued-vinyl-installation',
    renovationJobId: 'glued-vinyl-flooring',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 55,
    laborPriceMax: 90,
    laborPriceBaseline: 70,
    currency: 'PLN',
    sourceName: 'ogarnijremont.pl (winyl) + narzut za klejenie',
    sourceType: 'market_reference',
    sourceUrl: OGARNIJ,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} Winyl KLEJONY wymaga równego, zagruntowanego podłoża i schnięcia — stąd `
      + 'wyżej niż klik (ogarnijremont.pl podaje 45–70 zł/m² dla winylu ogółem).',
  },
  {
    id: 'labor-wall-tiles-installation',
    renovationJobId: 'wall-tiles-bathroom',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 70,
    laborPriceMax: 160,
    laborPriceBaseline: 110,
    currency: 'PLN',
    sourceName: 'ceny-uslug.pl + kb.pl + ogarnijremont.pl',
    sourceType: 'market_reference',
    sourceUrl: KB,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} Rozrzut jest duży: ceny-uslug.pl (glazura) 55–85 zł/m², kb.pl 110–160, `
      + 'ogarnijremont.pl 110–180. Mozaika i wielki format idą jeszcze wyżej.',
  },
  {
    id: 'labor-standard-tiles-installation',
    renovationJobId: 'floor-tiles',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 70,
    laborPriceMax: 150,
    laborPriceBaseline: 105,
    currency: 'PLN',
    sourceName: 'kb.pl + ogarnijremont.pl + ceny-uslug.pl',
    sourceType: 'market_reference',
    sourceUrl: KB,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} kb.pl (płytki podłogowe, format standardowy) 110–150 zł/m², `
      + 'ogarnijremont.pl 110–180, ceny-uslug.pl od 55 zł/m² przy prostych układach.',
  },
  {
    id: 'labor-gres-installation',
    renovationJobId: 'floor-tiles',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 90,
    laborPriceMax: 180,
    laborPriceBaseline: 125,
    currency: 'PLN',
    sourceName: 'kb.pl + ogarnijremont.pl',
    sourceType: 'market_reference',
    sourceUrl: OGARNIJ,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} kb.pl 110–150 zł/m², ogarnijremont.pl 110–180 (wielki format drożej). `
      + 'Gres tnie się trudniej niż zwykła terakota, stąd wyższa dolna granica.',
  },
  {
    id: 'labor-substrate-primer-tiles',
    renovationJobId: 'wall-tiles-bathroom',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'm2',
    laborPriceMin: 8,
    laborPriceMax: 16,
    laborPriceBaseline: 12,
    currency: 'PLN',
    sourceName: 'kb.pl + ogarnijremont.pl (gruntowanie)',
    sourceType: 'market_reference',
    sourceUrl: KB,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} Gruntowanie podłoża pod płytki wyceniane jak gruntowanie ścian: `
      + 'kb.pl 10–14 zł/m², ogarnijremont.pl 7–18 zł/m².',
  },
  {
    id: 'labor-sink-installation',
    renovationJobId: 'sink-installation',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'szt',
    laborPriceMin: 150,
    laborPriceMax: 400,
    laborPriceBaseline: 250,
    currency: 'PLN',
    sourceName: 'ogarnijremont.pl + kb.pl',
    sourceType: 'market_reference',
    sourceUrl: OGARNIJ,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} ogarnijremont.pl (punkt hydrauliczny) 100–250 zł, kb.pl 300–450 zł. `
      + 'Różnica bierze się z tego, czy trzeba przerabiać podejście wod-kan.',
  },
  {
    id: 'labor-toilet-installation',
    renovationJobId: 'toilet-installation',
    regionCode: 'lodzkie',
    regionLabel: 'Łódź / łódzkie',
    laborUnit: 'szt',
    laborPriceMin: 150,
    laborPriceMax: 300,
    laborPriceBaseline: 220,
    currency: 'PLN',
    sourceName: 'kb.pl + ogarnijremont.pl',
    sourceType: 'market_reference',
    sourceUrl: KB,
    lastUpdated: '2026-08-23',
    notes: `${NETTO} kb.pl 200–300 zł (kompakt ze zbiornikiem zewnętrznym), ogarnijremont.pl `
      + '100–250 zł. Stelaż podtynkowy z zabudową kosztuje wyraźnie więcej.',
  },
];
