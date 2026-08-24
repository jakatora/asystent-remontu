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
    // Flagowy etap malowania ścian: pełne tiery na MARKOWYCH farbach z realnym EAN
    // (dotąd economy/standard były farbami bez EAN — generic/GoodHome; better =
    // Śnieżka Eko Plus). DOKŁADNIE jedna farba/tier (materialType 'paint'), reszta
    // to inne typy: grunt (primer) + gładź startowa (skim-coat) + taśma malarska
    // (masking-tape) — nie podwajają farby. Stare ID farb zostają w katalogu
    // (mat-paint-economy/standard/better-white-10l) — nie usuwamy legacy.
    jobId: 'paint-walls',
    materialTypeMap: {
      economy: [
        'mat-paint-latex-dekoral-akrylit-w-white-5l',
        'mat-universal-primer-5l',
        'mat-skim-coat-acrylputz-st10-20kg',
        'mat-masking-tape-bluedolphin-30mm',
      ],
      standard: [
        'mat-paint-latex-sniezka-barwy-natury-white-5l',
        'mat-universal-primer-5l',
        'mat-skim-coat-acrylputz-st10-20kg',
        'mat-masking-tape-bluedolphin-30mm',
      ],
      better: [
        'mat-paint-latex-dulux-easycare-white-9l',
        'mat-universal-primer-5l',
        'mat-skim-coat-acrylputz-st10-20kg',
        'mat-masking-tape-bluedolphin-30mm',
      ],
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
    // Tiery wg klasy ścieralności AC. economy = NIETKNIĘTE (budżetowy AC4 Oakland —
    // domyślny/legacy koszyk istniejących projektów). standard = markowy AC4
    // Kronospan Toledo + podkład XPS Aquastop + listwa MDF Krono + folia + klipsy.
    // better = wodoodporny AC5 Classen Niasa + te same akcesoria premium. Wszystkie
    // nowe materialId istnieją w MATERIAL_PRICES i mają EAN w MATERIAL_EAN_OVERLAY.
    materialTypeMap: {
      economy: ['mat-laminate-oakland-ac4', 'mat-underlay-volden-xps-10m2', 'mat-skirting-arbiton-2500'],
      standard: [
        'mat-laminate-kronospan-toledo-ac4-222',
        'mat-underlay-arbiton-xps-aquastop-6m2',
        'mat-skirting-krono-lk100f-mdf-240',
        'mat-vapor-foil-diall-pe-20m2',
        'mat-skirting-clips-cezar-25',
      ],
      better: [
        'mat-laminate-classen-niasa-ac5-1973',
        'mat-underlay-arbiton-xps-aquastop-6m2',
        'mat-skirting-krono-lk100f-mdf-240',
        'mat-vapor-foil-diall-pe-20m2',
        'mat-skirting-clips-cezar-25',
      ],
    },
  },
  {
    jobId: 'skirting-boards',
    materialTypeMap: {
      standard: ['mat-skirting-arbiton-2500'],
    },
  },
  {
    // Płytki podłogowe: pełne tiery po klasie/formacie płytki (DOKŁADNIE JEDNA
    // płytka m²/tier — engine liczy każdą pozycję m² na całą powierzchnię, więc
    // dwie płytki w jednym tierze podwoiłyby koszt gresu). Akcesoria (krzyżyki)
    // skalują się z powierzchnią, koszt pomijalny. Money-path bez zmian — mappings
    // zasilają lokalny computePricedBudget, NIE ekran „Wycena" (API po calc.materials).
    jobId: 'floor-tiles',
    materialTypeMap: {
      // Economy = tańszy gres marki własnej (istniejący) + klej marki własnej + fuga Ceresit.
      economy: [
        'mat-gres-guigliano-1m2',
        'mat-tile-adhesive-buildfix-25kg',
        'mat-grout-ceresit-ce40-white-2kg',
        'mat-tile-spacers-hardy-2mm-200',
      ],
      // Standard = markowy gres szkliwiony 60×60 (Paradyż Petro Grey) + klej Ceresit CM 11 + fuga Atlas.
      standard: [
        'mat-gres-paradyz-petro-grey-60x60',
        'mat-tile-adhesive-ceresit-cm11-25kg',
        'mat-grout-atlas-001-white-2kg',
        'mat-tile-spacers-hardy-2mm-200',
      ],
      // Better = gres REKTYFIKOWANY (Paradyż U117) — wyższa klasa/format.
      better: [
        'mat-gres-rekt-paradyz-u117-grey-60x60',
        'mat-tile-adhesive-ceresit-cm11-25kg',
        'mat-grout-atlas-001-white-2kg',
        'mat-tile-spacers-hardy-2mm-200',
      ],
    },
  },
  {
    // Płytki ścienne (łazienka): standard/better na markowej płytce ściennej Paradyż
    // Nati Bianco + narożnik do glazury (profil) na zewnętrzne krawędzie. Jedna płytka m²/tier.
    jobId: 'wall-tiles-bathroom',
    materialTypeMap: {
      // Economy = gres marki własnej (istniejący) + klej marki własnej + fuga Ceresit + silikon.
      economy: [
        'mat-gres-guigliano-1m2',
        'mat-tile-adhesive-buildfix-25kg',
        'mat-grout-ceresit-ce40-white-2kg',
        'mat-sanitary-silicone-soudal-280ml',
        'mat-tile-spacers-hardy-2mm-200',
      ],
      // Standard = markowa płytka ścienna Paradyż Nati Bianco + fuga Atlas + narożnik Cezar.
      standard: [
        'mat-tile-wall-paradyz-nati-bianco-25x40',
        'mat-tile-adhesive-buildfix-25kg',
        'mat-grout-atlas-001-white-2kg',
        'mat-sanitary-silicone-soudal-280ml',
        'mat-tile-spacers-hardy-2mm-200',
        'mat-tile-trim-cezar-corner-8mm-25m',
      ],
      // Better = ta sama płytka + markowy klej Ceresit CM 11 (EAN).
      better: [
        'mat-tile-wall-paradyz-nati-bianco-25x40',
        'mat-tile-adhesive-ceresit-cm11-25kg',
        'mat-grout-atlas-001-white-2kg',
        'mat-sanitary-silicone-soudal-280ml',
        'mat-tile-spacers-hardy-2mm-200',
        'mat-tile-trim-cezar-corner-8mm-25m',
      ],
    },
  },
  {
    // Backsplash kuchenny: dotąd BEZ mapowania materiałów (tylko robocizna) —
    // dokładamy pokrycie płytkami ściennymi + akcesoriami (addytywne, nowy job).
    jobId: 'kitchen-backsplash',
    materialTypeMap: {
      standard: [
        'mat-tile-wall-paradyz-nati-bianco-25x40',
        'mat-tile-adhesive-ceresit-cm11-25kg',
        'mat-grout-atlas-001-white-2kg',
        'mat-sanitary-silicone-soudal-280ml',
        'mat-tile-spacers-hardy-2mm-200',
        'mat-tile-trim-cezar-corner-8mm-25m',
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
    // Hydroizolacja łazienki: DOKŁADNIE jedna masa bazowa na tier (economy/standard =
    // Atlas Woder E 1-składnikowa, better = Atlas Woder Duo 2-składnikowa), żeby engine
    // nie liczył hydroizolacji podwójnie (analogicznie do „jedna płytka m²/tier").
    // Reszta to akcesoria: taśma naroży + narożniki + mankiet + grunt (istniejący Uni-Grunt).
    jobId: 'bathroom-waterproofing',
    materialTypeMap: {
      // Economy = 1-składnikowa folia w płynie + taśma naroży.
      economy: [
        'mat-waterproof-membrane-atlas-woder-e-15kg',
        'mat-sealing-tape-ceresit-cl152-10m',
      ],
      // Standard = ta sama masa 1K + taśma + narożnik wewnętrzny + grunt pod hydroizolację.
      standard: [
        'mat-waterproof-membrane-atlas-woder-e-15kg',
        'mat-sealing-tape-ceresit-cl152-10m',
        'mat-sealing-corner-internal-mapei',
        'mat-primer-deep-atlas-unigrunt-5kg',
      ],
      // Better = masa 2-składnikowa elastyczna + pełen komplet akcesoriów.
      better: [
        'mat-waterproof-membrane-atlas-woder-duo-16kg',
        'mat-sealing-tape-ceresit-cl152-10m',
        'mat-sealing-corner-internal-mapei',
        'mat-sealing-corner-external-mapei',
        'mat-sealing-cuff-wall-mapei-12x12-2',
        'mat-primer-deep-atlas-unigrunt-5kg',
      ],
    },
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

  // ── Układanie podkładu pod panele (etap przygotowawczy) ────────────────────
  // Dedykowany job underlay-install (przygotowanie podłoża pod panele) miał tylko
  // mapowanie robocizny (JOB_LABOR_MAPPINGS), bez materiałów. Dopinamy podkład +
  // folię paroizolacyjną PE, żeby etap pojawił się w liście zakupowej i wycenie.
  // economy = tańszy podkład Volden XPS (istniejący) + folia; standard = markowy
  // podkład Arbiton XPS Aquastop 3w1 + folia. Wszystkie materialId istnieją.
  {
    jobId: 'underlay-install',
    materialTypeMap: {
      economy: ['mat-underlay-volden-xps-10m2', 'mat-vapor-foil-diall-pe-20m2'],
      standard: ['mat-underlay-arbiton-xps-aquastop-6m2', 'mat-vapor-foil-diall-pe-20m2'],
    },
  },

  // ── Przygotowanie podłoża pod podłogi: wylewka samopoziomująca ──────────────
  // Job self-leveling (data/jobs/floor-prep.ts) dotąd BEZ mapowania materiałów
  // (wyceniał się tylko z legacy materials[] joba). Dopinamy realne wylewki z EAN +
  // akcesoria. DOKŁADNIE JEDNA wylewka bazowa/tier (materialType 'screed'), bo engine
  // liczy każdą pozycję na całą powierzchnię — dwie wylewki podwoiłyby masę. Grunt
  // (Uni-Grunt) i folia PE (Diall) reużyte z katalogu; taśma brzegowa skaluje się
  // obwodem (formuła skirting). Tier rośnie klasą/ceną: economy = grubszy jastrych
  // Atlas SAM 200, standard = Atlas SAM 100 (5–30 mm), better = cienki finisz Ceresit
  // CN 72. Wszystkie materialId istnieją w MATERIAL_PRICES; wylewki + taśma mają EAN
  // w MATERIAL_EAN_OVERLAY (api-server). Addytywne — measurementInputs joba nietknięte.
  {
    jobId: 'self-leveling',
    materialTypeMap: {
      economy: [
        'mat-screed-atlas-sam200-25kg',
        'mat-primer-deep-atlas-unigrunt-5kg',
        'mat-edge-tape-fola-100mm-50m',
      ],
      standard: [
        'mat-screed-atlas-sam100-25kg',
        'mat-primer-deep-atlas-unigrunt-5kg',
        'mat-edge-tape-fola-100mm-50m',
        'mat-vapor-foil-diall-pe-20m2',
      ],
      better: [
        'mat-screed-ceresit-cn72-25kg',
        'mat-primer-deep-atlas-unigrunt-5kg',
        'mat-edge-tape-fola-100mm-50m',
        'mat-vapor-foil-diall-pe-20m2',
      ],
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
