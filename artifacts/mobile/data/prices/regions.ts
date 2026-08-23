import type { RegionProfile } from '@/types/pricing';

// Regiony wyceny. 'lodzkie' to baza (mnożnik robocizny 1.00). Kody muszą być
// SPÓJNE z profilami robocizny w backendzie (lib/pricing-service labor-data.ts
// REGION_LABOR_PROFILES) — to one dobierają regionalny mnożnik stawki.
// Mnożniki wyprowadzone z raportów stawek robocizny wykończeniowej PL:
// source: https://planetainwestora.pl/blog/kosztorys-budowy-domu-2026-regiony
export const REGIONS: readonly RegionProfile[] = [
  {
    code: 'lodzkie',
    label: 'Łódź / łódzkie',
    isBaseline: true,
  },
  {
    code: 'mazowieckie',
    label: 'Warszawa / mazowieckie',
    isBaseline: false,
  },
  {
    code: 'malopolskie',
    label: 'Kraków / małopolskie',
    isBaseline: false,
  },
  {
    code: 'wielkopolskie',
    label: 'Poznań / wielkopolskie',
    isBaseline: false,
  },
  {
    code: 'slaskie',
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
