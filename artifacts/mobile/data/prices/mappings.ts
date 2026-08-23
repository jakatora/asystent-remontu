import type { MaterialCategory } from '@/types/pricing';

export interface JobLaborMapping {
  readonly jobId: string;
  readonly laborPriceIds: readonly string[];
}

export interface JobMaterialMapping {
  readonly jobId: string;
  readonly materialTypeMap: Partial<Record<MaterialCategory, readonly string[]>>;
}

export const JOB_LABOR_MAPPINGS: readonly JobLaborMapping[] = [
  { jobId: 'wall-primer', laborPriceIds: ['labor-wall-primer'] },
  { jobId: 'paint-walls', laborPriceIds: ['labor-wall-painting-3-coats'] },
  { jobId: 'paint-ceiling', laborPriceIds: ['labor-wall-painting-3-coats'] },
  { jobId: 'wallpaper-install', laborPriceIds: ['labor-wallpaper-installation'] },
  { jobId: 'wallpaper-remove', laborPriceIds: ['labor-wallpaper-installation'] },
  { jobId: 'wall-repair', laborPriceIds: ['labor-repair-holes-cracks'] },
  { jobId: 'skim-coat', laborPriceIds: ['labor-skim-coat'] },
  { jobId: 'laminate-flooring', laborPriceIds: ['labor-laminate-installation'] },
  { jobId: 'skirting-boards', laborPriceIds: ['labor-skirting-installation'] },
  { jobId: 'vinyl-flooring', laborPriceIds: ['labor-vinyl-click-installation'] },
  { jobId: 'vinyl-click-flooring', laborPriceIds: ['labor-vinyl-click-installation'] },
  { jobId: 'vinyl-glued', laborPriceIds: ['labor-glued-vinyl-installation'] },
  { jobId: 'wall-tiles-bathroom', laborPriceIds: ['labor-wall-tiles-installation', 'labor-substrate-primer-tiles'] },
  { jobId: 'floor-tiles', laborPriceIds: ['labor-standard-tiles-installation'] },
  { jobId: 'grout-only', laborPriceIds: [] },
  { jobId: 'silicone-sealing', laborPriceIds: [] },
  { jobId: 'bathroom-waterproofing', laborPriceIds: [] },
  { jobId: 'sink-installation', laborPriceIds: ['labor-sink-installation'] },
  { jobId: 'toilet-installation', laborPriceIds: ['labor-toilet-installation'] },
  { jobId: 'minor-plumbing', laborPriceIds: ['labor-sink-installation'] },
  { jobId: 'gypsum-wall', laborPriceIds: ['labor-skim-coat'] },
  { jobId: 'gypsum-ceiling', laborPriceIds: ['labor-skim-coat'] },
  { jobId: 'paint-frames', laborPriceIds: ['labor-wall-painting-3-coats'] },
  { jobId: 'kitchen-cabinet-paint', laborPriceIds: ['labor-wall-painting-3-coats'] },
  { jobId: 'kitchen-backsplash', laborPriceIds: ['labor-wall-tiles-installation'] },
  { jobId: 'door-painting', laborPriceIds: ['labor-wall-painting-3-coats'] },
  { jobId: 'epoxy-floor', laborPriceIds: ['labor-glued-vinyl-installation'] },
  { jobId: 'parquet-sanding', laborPriceIds: ['labor-laminate-installation'] },
  { jobId: 'underlay-install', laborPriceIds: [] },
];

export const JOB_MATERIAL_MAPPINGS: readonly JobMaterialMapping[] = [
  {
    jobId: 'wall-primer',
    materialTypeMap: {
      standard: ['mat-universal-primer-5l'],
      // Tier premium = grunt głęboko penetrujący (chłonne/pylące podłoża). Dodane
      // jako NOWY tier 'better' (economy/standard bez zmian). Materiał z EAN.
      better: ['mat-primer-deep-ceresit-ct17-10l'],
    },
  },
  {
    jobId: 'paint-walls',
    materialTypeMap: {
      economy: ['mat-paint-economy-white-10l', 'mat-universal-primer-5l'],
      standard: ['mat-paint-standard-white-10l', 'mat-universal-primer-5l'],
      better: ['mat-paint-better-white-10l', 'mat-universal-primer-5l'],
    },
  },
  {
    jobId: 'paint-ceiling',
    materialTypeMap: {
      economy: ['mat-paint-economy-white-10l'],
      standard: ['mat-paint-standard-white-10l'],
      better: ['mat-paint-better-white-10l'],
    },
  },
  {
    jobId: 'skim-coat',
    materialTypeMap: {
      economy: ['mat-skim-coat-economy-20kg', 'mat-universal-primer-5l'],
      standard: ['mat-skim-coat-standard-18kg', 'mat-universal-primer-5l'],
    },
  },
  {
    jobId: 'wall-repair',
    materialTypeMap: {
      economy: ['mat-skim-coat-economy-20kg'],
      standard: ['mat-skim-coat-standard-18kg'],
    },
  },
  {
    jobId: 'laminate-flooring',
    materialTypeMap: {
      economy: ['mat-laminate-oakland-ac4', 'mat-underlay-volden-xps-10m2', 'mat-skirting-arbiton-2500'],
      standard: ['mat-laminate-oakland-ac4', 'mat-underlay-volden-xps-10m2', 'mat-skirting-arbiton-2500'],
    },
  },
  {
    jobId: 'skirting-boards',
    materialTypeMap: {
      standard: ['mat-skirting-arbiton-2500'],
    },
  },
  {
    jobId: 'floor-tiles',
    materialTypeMap: {
      // + fuga (mat-grout-ceresit-ce40-white-2kg) — job ma spoinowanie, a materiał
      //   z EAN daje realną ofertę zamiast pominięcia pozycji.
      standard: [
        'mat-gres-guigliano-1m2',
        'mat-tile-adhesive-buildfix-25kg',
        'mat-grout-ceresit-ce40-white-2kg',
      ],
      // Tier premium = markowy klej Ceresit CM 11 (EAN) zamiast marki własnej.
      better: [
        'mat-gres-guigliano-1m2',
        'mat-tile-adhesive-ceresit-cm11-25kg',
        'mat-grout-ceresit-ce40-white-2kg',
      ],
    },
  },
  {
    jobId: 'wall-tiles-bathroom',
    materialTypeMap: {
      // + fuga (mat-grout-ceresit-ce40-white-2kg, EAN) — job ma spoinę ścienną.
      standard: [
        'mat-gres-guigliano-1m2',
        'mat-tile-adhesive-buildfix-25kg',
        'mat-grout-ceresit-ce40-white-2kg',
        'mat-sanitary-silicone-soudal-280ml',
      ],
      // Tier premium = markowy klej Ceresit CM 11 (EAN).
      better: [
        'mat-gres-guigliano-1m2',
        'mat-tile-adhesive-ceresit-cm11-25kg',
        'mat-grout-ceresit-ce40-white-2kg',
        'mat-sanitary-silicone-soudal-280ml',
      ],
    },
  },
  {
    jobId: 'silicone-sealing',
    materialTypeMap: {
      standard: ['mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    // Fugowanie: fuga + silikon — oba materiały z EAN (≥2 oferty w katalogu).
    jobId: 'grout-only',
    materialTypeMap: {
      standard: ['mat-grout-ceresit-ce40-white-2kg', 'mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    jobId: 'bathroom-waterproofing',
    materialTypeMap: {},
  },

  // ── Etapy podłączone do katalogu cen (materiały z EAN → oferty ≥2 sklepów) ──
  // Każdy materialId istnieje w MATERIAL_PRICES; materiały markowe mają EAN w
  // MATERIAL_EAN_OVERLAY (api-server), więc feedy/seed dopinają im realne oferty.
  // Nowe wpisy NIE ruszają istniejących jobów ani measurementInputs — dokładają
  // tylko pokrycie materiałowe dla etapów dotąd bez wyceny materiałów.
  {
    // Uszczelnianie okien: piana montażowa + silikon (oba z EAN).
    jobId: 'window-sealing',
    materialTypeMap: {
      standard: ['mat-foam-tytan-pro65-750ml', 'mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    // Montaż parapetu: piana montażowa + silikon (oba z EAN).
    jobId: 'windowsill-install',
    materialTypeMap: {
      standard: ['mat-foam-tytan-pro65-750ml', 'mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    // Zabudowa GK (ściana): PEŁEN zestaw suchej zabudowy — płyta g-k + profile
    // CD60/UD27 + wkręty + kołki (nowe pozycje z EAN) obok gładzi na spoiny +
    // gruntu. Tier 'better' = wariant wodoodporny (płyta GKBI + wełna) do
    // pomieszczeń wilgotnych. Wszystkie materialId istnieją w MATERIAL_PRICES.
    jobId: 'gypsum-wall',
    materialTypeMap: {
      economy: [
        'mat-skim-coat-economy-20kg',
        'mat-universal-primer-5l',
        'mat-gypsum-board-norgips-gkb-a-1200x2600',
        'mat-profile-cd60-norgips-3m',
        'mat-profile-ud27-budmat-3m',
        'mat-drywall-screws-wkretmet-35x25-100',
        'mat-quick-dowels-wkretmet-sm-6x40-20',
      ],
      standard: [
        'mat-skim-coat-acrylputz-fs20-27kg',
        'mat-universal-primer-5l',
        'mat-gypsum-board-norgips-gkb-a-1200x2600',
        'mat-profile-cd60-norgips-3m',
        'mat-profile-ud27-budmat-3m',
        'mat-mineral-wool-isover-akuplyta-10cm',
        'mat-drywall-screws-wkretmet-35x25-100',
        'mat-quick-dowels-wkretmet-sm-6x40-20',
      ],
      better: [
        'mat-skim-coat-acrylputz-fs20-27kg',
        'mat-universal-primer-5l',
        'mat-gypsum-board-norgips-gkbi-h2-1200x2600',
        'mat-profile-cd60-norgips-3m',
        'mat-profile-ud27-budmat-3m',
        'mat-mineral-wool-isover-akuplyta-10cm',
        'mat-drywall-screws-wkretmet-35x25-100',
        'mat-quick-dowels-wkretmet-sm-6x40-20',
      ],
    },
  },
  {
    // Zabudowa GK (sufit): jak ściana — ruszt CD60/UD27 + płyta + mocowania.
    jobId: 'gypsum-ceiling',
    materialTypeMap: {
      economy: [
        'mat-skim-coat-economy-20kg',
        'mat-universal-primer-5l',
        'mat-gypsum-board-norgips-gkb-a-1200x2600',
        'mat-profile-cd60-norgips-3m',
        'mat-profile-ud27-budmat-3m',
        'mat-drywall-screws-wkretmet-35x25-100',
        'mat-quick-dowels-wkretmet-sm-6x40-20',
      ],
      standard: [
        'mat-skim-coat-acrylputz-fs20-27kg',
        'mat-universal-primer-5l',
        'mat-gypsum-board-norgips-gkb-a-1200x2600',
        'mat-profile-cd60-norgips-3m',
        'mat-profile-ud27-budmat-3m',
        'mat-mineral-wool-isover-akuplyta-10cm',
        'mat-drywall-screws-wkretmet-35x25-100',
        'mat-quick-dowels-wkretmet-sm-6x40-20',
      ],
      better: [
        'mat-skim-coat-acrylputz-fs20-27kg',
        'mat-universal-primer-5l',
        'mat-gypsum-board-norgips-gkbi-h2-1200x2600',
        'mat-profile-cd60-norgips-3m',
        'mat-profile-ud27-budmat-3m',
        'mat-mineral-wool-isover-akuplyta-10cm',
        'mat-drywall-screws-wkretmet-35x25-100',
        'mat-quick-dowels-wkretmet-sm-6x40-20',
      ],
    },
  },
  {
    // Odświeżenie silikonu: sam silikon sanitarny (z EAN).
    jobId: 'silicone-refresh',
    materialTypeMap: {
      standard: ['mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    // Wykończenie listwami/opaskami: klej montażowy + silikon (oba z EAN).
    jobId: 'trim-finishing',
    materialTypeMap: {
      standard: ['mat-mounting-adhesive-soudal-fixall-290ml', 'mat-sanitary-silicone-soudal-280ml'],
    },
  },
  {
    // Malowanie drzwi: farba + grunt + taśma malarska (taśma z EAN).
    jobId: 'door-painting',
    materialTypeMap: {
      standard: ['mat-paint-standard-white-10l', 'mat-universal-primer-5l', 'mat-masking-tape-bluedolphin-38mm'],
    },
  },

  // ── Instalacja wodna / hydraulika (etap łazienki i kuchni) ──────────────────
  // Nowe materiały z EAN (baterie, syfon, rura/kolanko PEX, wężyk, taśma teflonowa)
  // dopięte do istniejących jobów hydraulicznych, żeby pojawiły się na liście
  // zakupowej i w wycenie tych etapów. Wszystkie materialId istnieją w
  // MATERIAL_PRICES; markowe mają EAN w MATERIAL_EAN_OVERLAY (api-server).
  {
    // Wymiana kranu / uszczelek (łazienka + kuchnia). Tier rośnie zakresem prac:
    // economy = sam kran + taśma; standard = kran + nowy wężyk + taśma;
    // better = pełna przeróbka podejść (bateria natryskowa + syfon + wężyk +
    // kolanko + rura PEX + taśma). measurementInputs joba nietknięte.
    jobId: 'minor-plumbing',
    materialTypeMap: {
      economy: ['mat-basin-mixer-ferro-stillo', 'mat-teflon-tape-tycner-12mm'],
      standard: [
        'mat-basin-mixer-ferro-stillo',
        'mat-hose-braided-invena-3-8-30',
        'mat-teflon-tape-tycner-12mm',
      ],
      better: [
        'mat-shower-mixer-ferro-one',
        'mat-basin-trap-mcalpine-whb1-32',
        'mat-hose-braided-invena-3-8-30',
        'mat-pex-elbow-tycner-16x16',
        'mat-pex-pipe-tycner-16x2',
        'mat-teflon-tape-tycner-12mm',
      ],
    },
  },
  {
    // Wymiana syfonu umywalkowego: syfon + taśma teflonowa na gwinty (oba z EAN).
    jobId: 'sink-trap-replace',
    materialTypeMap: {
      standard: ['mat-basin-trap-mcalpine-whb1-32', 'mat-teflon-tape-tycner-12mm'],
    },
  },

  // ── Instalacja elektryczna (etap elektryczny) ──────────────────────────────
  // Nowe materiały z EAN (przewody YDYp, gniazdko/włącznik Simon Basic, puszka
  // fi60 Elektro-Plast, szybkozłączka WAGO) dopięte do istniejących jobów
  // elektrycznych, żeby pojawiły się na liście zakupowej i w wycenie tych etapów.
  // Wszystkie materialId istnieją w MATERIAL_PRICES; markowe mają EAN w
  // MATERIAL_EAN_OVERLAY (api-server). Tier rośnie zakresem prac (wkład →
  // pełny punkt z okablowaniem → grubszy przewód 3×2,5 do obwodów gniazd).
  // measurementInputs jobów nietknięte.
  {
    // Wymiana/montaż gniazdka lub włącznika (id joba: electrical-overview).
    jobId: 'electrical-overview',
    materialTypeMap: {
      economy: [
        'mat-socket-simon-basic-bmgz1z',
        'mat-flush-box-elektroplast-pk60-10',
        'mat-wire-connector-wago-221-413',
      ],
      standard: [
        'mat-socket-simon-basic-bmgz1z',
        'mat-switch-simon-basic-bmw1',
        'mat-flush-box-elektroplast-pk60-10',
        'mat-wire-connector-wago-221-413',
        'mat-wire-ydyp-3x15-akszielonka-100m',
      ],
      better: [
        'mat-socket-simon-basic-bmgz1z',
        'mat-switch-simon-basic-bmw1',
        'mat-flush-box-elektroplast-pk60-10',
        'mat-wire-connector-wago-221-413',
        'mat-wire-ydyp-3x25-akszielonka-100m',
      ],
    },
  },
  {
    // Wymiana oprawy oświetleniowej (id joba: light-fixture-replace):
    // szybkozłączki WAGO + przewód YDYp 3×1,5 na podłączenie oprawy.
    jobId: 'light-fixture-replace',
    materialTypeMap: {
      standard: ['mat-wire-connector-wago-221-413', 'mat-wire-ydyp-3x15-akszielonka-100m'],
    },
  },
];

const LABOR_MAP = new Map(JOB_LABOR_MAPPINGS.map((m) => [m.jobId, m.laborPriceIds]));
const MATERIAL_MAP = new Map(JOB_MATERIAL_MAPPINGS.map((m) => [m.jobId, m.materialTypeMap]));

export function getLaborIdsForJob(jobId: string): readonly string[] {
  return LABOR_MAP.get(jobId) ?? [];
}

export function getMaterialIdsForJob(jobId: string, tier: MaterialCategory): readonly string[] {
  const mapping = MATERIAL_MAP.get(jobId);
  if (!mapping) return [];
  return mapping[tier] ?? mapping.standard ?? mapping.economy ?? [];
}
