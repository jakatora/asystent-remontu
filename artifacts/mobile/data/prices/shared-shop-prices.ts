// ─────────────────────────────────────────────────────────────────────────────
// Shared shop-price registry
// ─────────────────────────────────────────────────────────────────────────────
// Wiele jobów dzieli te same materiały i narzędzia (drabina, pędzel, taśma,
// folia ochronna). Trzymamy tu pojedyncze źródło prawdy — gdy URL produktu się
// zmieni, wystarczy aktualizacja w jednym miejscu, a wszystkie joby się zaktualizują.
//
// KIEDY UŻYWAĆ:
//   import { SHARED_SHOP_PRICES } from '@/data/prices/shared-shop-prices';
//   // w definicji materiału/narzędzia:
//   shopPrices: SHARED_SHOP_PRICES.brush50mm
//
// KIEDY NIE UŻYWAĆ:
//   Dla materiałów/narzędzi specyficznych dla danego jobu (np. specyficzna farba do
//   sufitu, klej do płytek konkretnej marki) — wpisuj inline w pliku jobu.
//
// AKTUALIZACJA CEN:
//   Trzymamy tylko URL (pricePLN puste). Sklepy blokują scraping — pricePLN może
//   być uzupełniony ręcznie po kwartalnym przeglądzie z notatką w `verifiedAt`.

import type { ShopPrice } from '@/types/domain';

const D = '2026-06-09'; // data ostatniej weryfikacji URLi

export const SHARED_SHOP_PRICES = {
  // ── Farby ────────────────────────────────────────────────────────────────
  /** Magnat Ceramic C45 biały 5L — referencyjna farba do ścian/sufitu. */
  paintMagnatCeramic5L: [
    { shop: 'castorama',   pricePLN: 218, url: 'https://www.castorama.pl/farba-magnat-ceramic-c45-bialy-5-l/5903973153214_CAPL.prd',              verifiedAt: D },
    { shop: 'leroyMerlin',               url: 'https://www.leroymerlin.pl/produkty/farba-magnat-ceramic-bialy-5-l-45615171.html',                verifiedAt: D },
    { shop: 'obi',         pricePLN: 249, url: 'https://www.obi.pl/biale-farby-do-scian/farba-magnat-ceramic-biala-5-l/p/3136363',                verifiedAt: D },
    { shop: 'bricomarche',               url: 'https://www.bricomarche.pl/farba-ceramiczna-bialy-c45-5-l-magnat',                                verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  // ── Grunty ───────────────────────────────────────────────────────────────
  /** Dragon Grunt głęboko penetrujący akrylowy 5L. */
  primerDragon5L: [
    { shop: 'castorama',   pricePLN: 70, url: 'https://www.castorama.pl/departments/grunt-g-boko-penetruj-cy-akrylowy-dragon-5l/5903649007612_CAPL.prd',           verifiedAt: D },
    { shop: 'leroyMerlin',               url: 'https://www.leroymerlin.pl/produkty/grunt-do-malowania-gleboko-penetrujacy-akrylowy-dragon-5-litrow-94230442.html', verifiedAt: D },
    { shop: 'obi',                       url: 'https://www.obi.pl/srodki-do-glebokiego-gruntowania/dragon-grunt-blauer-gleboko-penetrujacy-5l/p/7000094',          verifiedAt: D },
    { shop: 'bricomarche',               url: 'https://www.bricomarche.pl/grunt-gleboko-penetrujacy-akrylowy-5-l-dragon',                                          verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  // ── Akcesoria malarskie ──────────────────────────────────────────────────
  /** Tesa Tasma malarska Standard 25mm × 50m (51023). */
  paintersTape25mm: [
    { shop: 'castorama',   url: 'https://www.castorama.pl/departments/ta-ma-papierowa-malarska-tesa-51023-25mm-50m-1-szt-/5903719436465_CAPL.prd',            verifiedAt: D },
    { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/artykuly-gospodarcze/tasmy-folie-ochronne/tasmy-malarskie/tasma-malarska-blue-25-mm-x-50-m,p573830,l2047.html', verifiedAt: D },
    { shop: 'obi',         url: 'https://www.obi.pl/tasmy-klejace/tesa-tasma-malarska-standard-50-m-x-25-mm/p/4153656',                                       verifiedAt: D },
    { shop: 'bricomarche', url: 'https://www.bricomarche.pl/tasma-malarska-maskujaca-standard-50m-25mm-bezowa-tesa',                                          verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  /** Folia malarska/ochronna 4 × 5 m LDPE — uniwersalna do podłogi i mebli. */
  protectionFoil4x5m: [
    { shop: 'castorama',   url: 'https://www.castorama.pl/folia-ochronna-opp-cienka-4-x-5-m/5059340989747_CAPL.prd',                                          verifiedAt: D },
    { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/folia-malarska-medium-4-x-3-m-dexter-82261733.html',                                     verifiedAt: D },
    { shop: 'obi',         url: 'https://www.obi.pl/zabezpieczenie-przed-malowaniem/lux-folia-malarska-przezroczysta-4-m-x-5-m/p/1397900',                    verifiedAt: D },
    { shop: 'bricomarche', url: 'https://www.bricomarche.pl/folia-malarska-standard-4-x-5-m-go-on',                                                           verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  // ── Wałki, pędzle, kuwety ────────────────────────────────────────────────
  /** Wałek malarski 18 cm wełna 10–12 mm. */
  roller18cm: [
    { shop: 'castorama',   pricePLN: 15, url: 'https://www.castorama.pl/departments/wa-ek-motive-malarski-nylon-czerwony-pasek-18cm-w-os-12mm-1-szt/5905033135338_CAPL.prd', verifiedAt: D },
    { shop: 'leroyMerlin', pricePLN: 20, url: 'https://www.leroymerlin.pl/produkty/zestaw-malarski-do-farb-emulsyjnych-walek-18-cm-zapas-kuweta-45878546.html',              verifiedAt: D },
    { shop: 'obi',                       url: 'https://www.obi.pl/walki-malarskie/lux-walek-malarski-basic-180-mm-12-mm/p/2498491',                                          verifiedAt: D },
    { shop: 'bricomarche',               url: 'https://www.bricomarche.pl/walek-malarski-gelbfaden-18-cm-rdzen-48-mm-poliakryl-12-mm-rota',                                  verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  /** Pędzel płaski 50 mm — do narożników i krawędzi. */
  brush50mm: [
    { shop: 'castorama',   url: 'https://www.castorama.pl/pedzel-plaski-diall-50-mm-id-1091492.html',                                                          verifiedAt: D },
    { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/narzedzia-reczne/pedzle-walki-kuwety/pedzle/pedzel-plaski-uniwersalny-50-mm-dexter,p587218,l754.html', verifiedAt: D },
    { shop: 'obi',         url: 'https://www.obi.pl/pedzle/lux-pedzel-plaski-do-emalii-uniwersalny-profi-50-mm/p/5693205',                                     verifiedAt: D },
    { shop: 'bricomarche', url: 'https://www.bricomarche.pl/pedzel-ninja-50-mm-angular',                                                                       verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  /** Kuweta malarska plastikowa do wałka 18-25 cm. */
  paintTray: [
    { shop: 'castorama',   pricePLN: 119, url: 'https://www.castorama.pl/departments/kuweta-malarska-feinz-32x34-cm-big-do-wa-ka-25-cm-1-szt-/5907900015552_CAPL.prd',        verifiedAt: D },
    { shop: 'leroyMerlin', pricePLN: 14,  url: 'https://www.leroymerlin.pl/produkty/kuweta-malarska-180-mm-czarna-dexter-82840998.html',                                      verifiedAt: D },
    { shop: 'obi',         pricePLN: 10,  url: 'https://www.obi.pl/wiadra-i-kratki-do-odsaczania/lux-kuweta-malarska-33-x-26-cm-szara/p/7000110',                             verifiedAt: D },
    { shop: 'bricomarche',                url: 'https://www.bricomarche.pl/kuweta-malarska-37-x-34-cm-hardy',                                                                 verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  // ── Drabiny ──────────────────────────────────────────────────────────────
  /** Drabina aluminiowa 4-stopniowa, jednostronna, 125-150 kg. */
  ladder4steps: [
    { shop: 'castorama',   url: 'https://www.castorama.pl/departments/drabina-aluminiowa-jednostronna-4-stopniowa-z-p-k-i-por-czami-drabest-150kg-1-szt/5904680990086_CAPL.prd', verifiedAt: D },
    { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/drabina-aluminiowa-4-stopnie-1-stronna-45981124.html',                                                       verifiedAt: D },
    { shop: 'obi',         url: 'https://www.obi.pl/drabiny-domowe/bayersystem-drabina-aluminiowa-4-stopniowa-125-kg/p/6640700',                                                  verifiedAt: D },
    { shop: 'bricomarche', url: 'https://www.bricomarche.pl/drabina-aluminiowa-4-stopniowa-125-kg-eco-drabest',                                                                   verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  // ── Gładzie / szpachle / GKB ─────────────────────────────────────────────
  /** Knauf MP Finish gładź gipsowa 20 kg — sucha mieszanka wykończeniowa. */
  fillerKnaufMpFinish20kg: [
    { shop: 'castorama',   url: 'https://www.castorama.pl/gladz-gipsowa-knauf-mp-finish-20-kg/5903240904181_CAPL.prd',                                            verifiedAt: D },
    { shop: 'leroyMerlin', url: 'https://leroymerlin.pl/materialy-budowlane/zaprawy-i-tynki/gipsy-i-gladzie/gladz-gipsowa-mp-finish-20-kg-knauf,p439433,l1556.html', verifiedAt: D },
    { shop: 'obi',         url: 'https://www.obi.pl/masy-wyrownujace/knauf-gladz-gipsowa-mp-fini-finish-20-kg/p/7190150',                                          verifiedAt: D },
    { shop: 'bricomarche', url: 'https://www.bricomarche.pl/gladz-gipsowa-mp-finish-20-kg-knauf',                                                                  verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  /** Płyta gipsowo-kartonowa zwykła GKB 12.5 mm, format 1200×2600 mm (~3,12 m²). */
  gypsumBoardGKB125: [
    { shop: 'castorama',   pricePLN: 31, url: 'https://www.castorama.pl/plyta-gipsowo-kartonowa-zwykla-1200-x-2600-x-12-5-mm-gkb-typ-a-norgips/5907651690442_CAPL.prd', verifiedAt: D },
    { shop: 'leroyMerlin',               url: 'https://www.leroymerlin.pl/produkty/plyta-gipsowa-gkb-typ-a-2600-x-1200-x-12-5-mm-norgips-41661683.html',               verifiedAt: D },
    { shop: 'obi',                       url: 'https://www.obi.pl/plyty-karton-gips/knauf-plyta-gipsowo-kartonowa-12-5-x-1200-x-2600-mm-gkb/p/4002267',                verifiedAt: D },
    { shop: 'bricomarche',               url: 'https://www.bricomarche.pl/plyta-zwykla-gkb-a13-hrak-1200-x-2600-mm-knauf',                                              verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  // ── Kleje, fugi do płytek ────────────────────────────────────────────────
  /** Atlas Plus klej wysokoelastyczny C2TE S1, worek 25 kg (OBI: 20 kg). */
  tileAdhesiveAtlasPlus25kg: [
    { shop: 'castorama',   pricePLN: 64, url: 'https://www.castorama.pl/klej-wysokoelastyczny-atlas-plus-odksztalcalny-25-kg/5905400658866_CAPL.prd',                          verifiedAt: D },
    { shop: 'leroyMerlin', pricePLN: 70, url: 'https://www.leroymerlin.pl/produkty/zaprawa-klejowa-plus-25-kg-atlas-45634631.html',                                             verifiedAt: D },
    { shop: 'obi',                       url: 'https://www.obi.pl/kleje-do-plytek/atlas-wysokoelastyczny-klej-odksztalcalny-20-kg/p/3004314',                                   verifiedAt: D },
    { shop: 'bricomarche', pricePLN: 72, url: 'https://www.bricomarche.pl/klej-wysokoelastyczny-odksztalcalny-plus-bialy-c2te-25-kg-atlas',                                     verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  /** Atlas Fuga ceramiczna, spoiny 2-7 mm, opakowanie 2 kg (Bricomarche: kolor zbliżony). */
  tileGroutAtlas2kg: [
    { shop: 'castorama',   pricePLN: 40, url: 'https://www.castorama.pl/fuga-ceramiczna-atlas-202-popielaty-2-kg/5905400572674_CAPL.prd',                                      verifiedAt: D },
    { shop: 'leroyMerlin', pricePLN: 40, url: 'https://www.leroymerlin.pl/produkty/fuga-ceramiczna-202-popielaty-2-kg-atlas-82616769.html',                                    verifiedAt: D },
    { shop: 'obi',         pricePLN: 40, url: 'https://www.obi.pl/fugi-do-plytek/atlas-fuga-ceramiczna-202-popielaty-2-kg/p/6552293',                                          verifiedAt: D },
    { shop: 'bricomarche', pricePLN: 29, url: 'https://www.bricomarche.pl/fuga-elastyczna-212-szarobrazowy-2-kg-atlas-2',                                                       verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  // ── Podłogi (panele) ─────────────────────────────────────────────────────
  /** Panele winylowe SPC 5 mm AC4, system klik (cena za m²). */
  vinylFloorSPCAc4: [
    { shop: 'castorama',   pricePLN: 93,  url: 'https://www.castorama.pl/panele-podlogowe-winylowe-kronostep-spc-dab-orchid-1-97-m2/5907501812895_CAPL.prd',                    verifiedAt: D },
    { shop: 'leroyMerlin', pricePLN: 109, url: 'https://www.leroymerlin.pl/produkty/panele-winylowe-spc-casdare-intenso-artens-89973264.html',                                   verifiedAt: D },
    { shop: 'obi',         pricePLN: 80,  url: 'https://www.obi.pl/panele-winylowe/kronostep-panel-winylowy-spc-flamenco-oak-4-mm/p/6761878',                                    verifiedAt: D },
    { shop: 'bricomarche', pricePLN: 90,  url: 'https://www.bricomarche.pl/panel-podlogowy-vinyl-kronostep-spc-5-mm-klasa-32-salt-mine',                                         verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  /** Panele laminowane AC4 8 mm (Kronospan / Swiss Krono / Kronoplus) — cena za paczkę. */
  laminateFloorAc4_8mm: [
    { shop: 'castorama',   pricePLN: 68,  url: 'https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-26-m2/5907555428158_CAPL.prd',                      verifiedAt: D },
    { shop: 'leroyMerlin', pricePLN: 69,  url: 'https://www.leroymerlin.pl/produkty/panele-podlogowe-laminowane-ac4-8-mm-kronospan-dab-harris-82665066.html',                    verifiedAt: D },
    { shop: 'obi',         pricePLN: 67,  url: 'https://www.obi.pl/panele-podlogowe/swiss-krono-panel-podlogowy-dab-arniston-8-mm-ac4/p/7100456',                                verifiedAt: D },
    { shop: 'bricomarche', pricePLN: 112, url: 'https://www.bricomarche.pl/panel-podlogowy-dab-szary-8-mm-ac4-kronoplus',                                                        verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  // ── Wykończenia ──────────────────────────────────────────────────────────
  /** Listwa przypodłogowa MDF biała 60 mm × 2.4 m. */
  baseboardMDF60mm: [
    { shop: 'castorama',   url: 'https://www.castorama.pl/listwa-mdf-goodhome-60-mm-biala-lakierowana-decor-4/5059340804392_CAPL.prd',                            verifiedAt: D },
    { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/listwa-przypodlogowa-mdf-biala-laque-60-mm-arbiton-82568047.html',                          verifiedAt: D },
    { shop: 'obi',         url: 'https://www.obi.pl/listwy-przypodlogowe/classen-listwa-przypodlogowa-mdf-pure-naxos-biala-wym-16-mm-x-60-mm-x-2400-mm/p/6373898', verifiedAt: D },
    { shop: 'bricomarche', url: 'https://www.bricomarche.pl/listwa-przypodlogowa-paint-it-mp0602-biala-arbiton',                                                  verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  /** Silikon sanitarny biały 280 ml — Soudal lub odpowiednik. */
  siliconeSanitary280ml: [
    { shop: 'castorama',   pricePLN: 20, url: 'https://www.castorama.pl/silikon-sanitarny-soudal-280-ml-bialy/5411183157064_CAPL.prd',                                          verifiedAt: D },
    { shop: 'leroyMerlin', pricePLN: 20, url: 'https://www.leroymerlin.pl/produkty/silikon-sanitarny-280-ml-bialy-soudal-45987865.html',                                        verifiedAt: D },
    { shop: 'obi',         pricePLN: 20, url: 'https://www.obi.pl/silikony-i-akryle/soudal-silikon-sanitarny-280-ml-bezbarwny/p/3246980',                                       verifiedAt: D },
    { shop: 'bricomarche', pricePLN: 13, url: 'https://www.bricomarche.pl/silikon-sanitarny-idealna-lazienka-280-ml-bialy-tytan-professional',                                  verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  // ── Narzędzia ────────────────────────────────────────────────────────────
  /** Paca stalowa nierdzewna ok. 50-68 cm — do szpachlowania ścian. */
  steelTrowel50cm: [
    { shop: 'castorama',   pricePLN: 69, url: 'https://www.castorama.pl/paca-comensal-nierdzewna-13-x-68-cm-gladka/5902060000448_CAPL.prd',                                     verifiedAt: D },
    { shop: 'leroyMerlin', pricePLN: 68, url: 'https://www.leroymerlin.pl/produkty/paca-gladka-do-wygladzania-szwajcarska-13-x-58-cm-z-uchwytem-comensal-83304115.html',        verifiedAt: D },
    { shop: 'obi',         pricePLN: 67, url: 'https://www.obi.pl/narzedzia-murarskie-i-glazurnicze/lux-paca-do-posadzek-ostra-50-cm/p/5997499',                                verifiedAt: D },
    { shop: 'bricomarche', pricePLN: 35, url: 'https://www.bricomarche.pl/paca-metalowa-nierdzewna-130-x-580-mm-drel',                                                          verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],

  /** Młotowiertarka SDS-plus 700-800 W — Makita HR2470 / Bosch GBH 2-26 / odpowiednik. */
  sdsHammerDrill: [
    { shop: 'castorama',   pricePLN: 730, url: 'https://www.castorama.pl/departments/m-otowiertarka-bosch-gbh-2-26-dfr-sds-plus-800w-2-7j-walizka-1-szt/3165140353366_CAPL.prd', verifiedAt: D },
    { shop: 'leroyMerlin', pricePLN: 549, url: 'https://www.leroymerlin.pl/elektronarzedzia/wiertarki-wkretarki-mloty-udarowe/mlotowiertarki-mloty-udarowe/mlotowiertarka-hr2470-780-w-makita,p71179,l166.html', verifiedAt: D },
    { shop: 'obi',         pricePLN: 549, url: 'https://www.obi.pl/mloty-udarowe/makita-mlotowiertarka-hr2470-780-w/p/5061957',                                                  verifiedAt: D },
    { shop: 'bricomarche', pricePLN: 249, url: 'https://www.bricomarche.pl/mlotowiertarka-sds-plus-800-w-walizka-graphite',                                                      verifiedAt: D },
  ] as const satisfies readonly ShopPrice[],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Shared product thumbnail URLs (Wikimedia Commons preferred — stabilne, hotlinkable, wolne).
// Mapowane 1:1 do kluczy SHARED_SHOP_PRICES. Materials/tools używające danego produktu mogą
// odwoływać się przez SHARED_THUMBNAILS[<id>].
// ─────────────────────────────────────────────────────────────────────────────
export const SHARED_THUMBNAILS: Partial<Record<keyof typeof SHARED_SHOP_PRICES, string>> = {
  paintMagnatCeramic5L:        'https://upload.wikimedia.org/wikipedia/commons/0/03/White_primer_bucket.jpg',
  primerDragon5L:              'https://upload.wikimedia.org/wikipedia/commons/a/ab/Behr_paint_bucket.jpg',
  paintersTape25mm:            'https://upload.wikimedia.org/wikipedia/commons/b/b0/PaintersTape.jpg',
  protectionFoil4x5m:          'https://images.pexels.com/photos/3615710/pexels-photo-3615710.jpeg',
  roller18cm:                  'https://upload.wikimedia.org/wikipedia/commons/e/e3/Paint_roller_0080.jpg',
  brush50mm:                   'https://upload.wikimedia.org/wikipedia/commons/8/88/Paintbrush.JPG',
  paintTray:                   'https://upload.wikimedia.org/wikipedia/commons/b/b9/Paint_tray_%284600214997%29.jpg',
  ladder4steps:                'https://upload.wikimedia.org/wikipedia/commons/3/3d/Escabeau_alu.JPG',
  fillerKnaufMpFinish20kg:     'https://upload.wikimedia.org/wikipedia/commons/7/75/Spachtelmasse_auf_einer_Wand.JPG',
  gypsumBoardGKB125:           'https://upload.wikimedia.org/wikipedia/commons/3/3e/Drywall.jpg',
  tileAdhesiveAtlasPlus25kg:   'https://upload.wikimedia.org/wikipedia/commons/d/df/Sopro_auf_Baustelle.jpg',
  tileGroutAtlas2kg:           'https://upload.wikimedia.org/wikipedia/commons/d/de/Applying_grout.jpg',
  vinylFloorSPCAc4:            'https://upload.wikimedia.org/wikipedia/commons/a/a2/Vinyl_flooring%2C_tiles.jpg',
  laminateFloorAc4_8mm:        'https://upload.wikimedia.org/wikipedia/commons/9/95/Laminaat.jpg',
  baseboardMDF60mm:            'https://upload.wikimedia.org/wikipedia/commons/f/f2/Fu%C3%9Fbodenleiste.JPG',
  siliconeSanitary280ml:       'https://upload.wikimedia.org/wikipedia/commons/3/3a/Siliconchik.JPG',
  steelTrowel50cm:             'https://upload.wikimedia.org/wikipedia/commons/5/5f/Finishing_trowel.webp',
  sdsHammerDrill:              'https://upload.wikimedia.org/wikipedia/commons/6/69/Dowen_Pagio_SDS_Plus_1100W_rotomartillo.jpg',
};
