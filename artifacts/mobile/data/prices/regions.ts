import type { RegionProfile } from '@/types/pricing';

export const REGIONS: readonly RegionProfile[] = [
  {
    code: 'lodzkie',
    label: 'Łódź / łódzkie',
    isBaseline: true,
  },
];

export const BASELINE_REGION = REGIONS.find((r) => r.isBaseline)!;

export function getRegion(code: string): RegionProfile | undefined {
  return REGIONS.find((r) => r.code === code);
}

export function getRegionOrBaseline(code: string): RegionProfile {
  return getRegion(code) ?? BASELINE_REGION;
}
