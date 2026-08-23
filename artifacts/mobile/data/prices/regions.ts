import type { RegionProfile } from '@/types/pricing';

// Regiony wyceny. 'lodzkie' to baza (mnoznik robocizny 1.00).
//
// MNOZNIKI (2026-08-23): rozjezdza sie WYLACZNIE robocizna - plyta gipsowa w Castoramie
// kosztuje tyle samo w Warszawie co w Lodzi. Wartosci wyprowadzone z dwoch niezaleznych
// zrodel, ktore sie zgadzaja, gdy odliczyc materialy:
//   - roznice regionalne wzgledem sredniej krajowej: Warszawa +25%, Krakow +15%,
//     Poznan +5%, Katowice -2%, Lodz -5%  (oferteo.pl / cennikibudowlane.com.pl)
//   - koszt wykonczenia 50 m2: Warszawa ~130 tys., Krakow ~124, Poznan ~118,
//     Katowice ~114, Lodz ~113 zl  (proplo.pl)
// Przeliczone na "ile razy drozej niz w Lodzi" daje ponizsze wartosci.
// source: https://www.oferteo.pl/artykuly/ile-kosztuje-remont-mieszkania
// source: https://proplo.pl/koszt-remontu
export const REGIONS: readonly RegionProfile[] = [
  {
    code: 'lodzkie',
    laborMultiplier: 1.00,
    label: 'Łódź / łódzkie',
    isBaseline: true,
  },
  {
    code: 'mazowieckie',
    laborMultiplier: 1.30,
    label: 'Warszawa / mazowieckie',
    isBaseline: false,
  },
  {
    code: 'malopolskie',
    laborMultiplier: 1.20,
    label: 'Kraków / małopolskie',
    isBaseline: false,
  },
  {
    code: 'wielkopolskie',
    laborMultiplier: 1.10,
    label: 'Poznań / wielkopolskie',
    isBaseline: false,
  },
  {
    code: 'slaskie',
    laborMultiplier: 1.03,
    label: 'Katowice / śląskie',
    isBaseline: false,
  },
];

export const BASELINE_REGION = REGIONS.find((r) => r.isBaseline)!;

export function getRegion(code: string): RegionProfile | undefined {
  return REGIONS.find((r) => r.code === code);
}

export function getRegionOrBaseline(code: string): RegionProfile {
  return getRegion(code) ?? BASELINE_REGION;
}
