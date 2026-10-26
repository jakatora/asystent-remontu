/** Product photographs observed on the linked retail pages on 2026-10-24–25.
 * Match by stable catalogue ID, EAN or exact source URL, never by fuzzy name.
 */
interface ProductPhoto {
  readonly ids: readonly string[];
  readonly ean: string;
  readonly sourceUrl: string;
  readonly imageUrl: string;
}

export const PRODUCT_PHOTOS: readonly ProductPhoto[] = [
  // source: https://www.castorama.pl/farba-biala-mat-10-l/3663602567240_CAPL.prd
  {"ids":["mat-paint-economy-white-10l"],"ean":"3663602567240","sourceUrl":"https://www.castorama.pl/farba-biala-mat-10-l/3663602567240_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/farba-biala-mat-10-l~3663602567240_02c_PL_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/gres-mrozoodporny-szkliwiony-guigliano-goodhome-18-5-x-59-8-cm-beige-1-m2/3663602870821_CAPL.prd
  {"ids":["mat-gres-guigliano-1m2"],"ean":"3663602870821","sourceUrl":"https://liderzycen.pl/pl/p/Gres-mrozoodporny-szkliwiony-Guigliano-GoodHome-18%2C5-x-59%2C8-cm-beige-1-m2/31407","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_52024_500_500/d715e779aa0887d53ec108d0e9616438.jpg"},
  // source: https://www.castorama.pl/panele-podlogowe-laminowane-wodoodporne-classen-dab-niasa-ac5-1-973-m2/4003992571974_CAPL.prd
  {"ids":["mat-laminate-classen-niasa-ac5-1973"],"ean":"4003992571974","sourceUrl":"https://liderzycen.pl/pl/p/Panele-podlogowe-laminowane-wodoodporne-Classen-Dab-Niasa-AC5-1%2C973-m2/31535","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_52181_500_500/54fce513642c640c65a2c6dfb09f14a0.jpg"},
  // source: https://www.castorama.pl/folia-paroizolacyjna-diall-20-m2/5059340141428_CAPL.prd
  {"ids":["mat-vapor-foil-diall-pe-20m2"],"ean":"5059340141428","sourceUrl":"https://www.castorama.pl/folia-paroizolacyjna-diall-20-m2/5059340141428_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/folia-paroizolacyjna-diall-20-m2~5059340141428_03c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/farba-goodhome-sciany-i-sufit-bialy-mat-10-l/5059340271620_CAPL.prd
  {"ids":["mat-paint-standard-white-10l"],"ean":"5059340271620","sourceUrl":"https://www.castorama.pl/farba-goodhome-sciany-i-sufit-bialy-mat-10-l/5059340271620_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/farba-goodhome-sciany-i-sufit-bialy-mat-10-l~5059340271620_02c_PL_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-ragga-ele-marble-1-3-m2/5059340802435_CAPL.prd
  {"ids":["mat-vinyl-glued-goodhome-ragga-13m2"],"ean":"5059340802435","sourceUrl":"https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-ragga-ele-marble-1-3-m2/5059340802435_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/panele-podlogowe-winylowe-goodhome-ragga-ele-marble-1-3-m2~5059340802435_02c?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-arilla-dark-grey-2-5-m2/5059340969756_CAPL.prd
  {"ids":["mat-vinyl-spc-click-goodhome-arilla-25m2"],"ean":"5059340969756","sourceUrl":"https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-arilla-dark-grey-2-5-m2/5059340969756_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/panele-podlogowe-winylowe-goodhome-spc-arilla-dark-grey-2-5-m2~5059340969756_02c_PL_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/departments/podk-ad-pod-ogowy-corksystem-lvt-1-5-mm-pod-panele-winylowe-6-m2-1-op-/5061092900925_CAPL.prd
  {"ids":["mat-vinyl-underlay-corksystem-lvt-6m2"],"ean":"5061092900925","sourceUrl":"https://www.castorama.pl/departments/podk-ad-pod-ogowy-corksystem-lvt-1-5-mm-pod-panele-winylowe-6-m2-1-op-/5061092900925_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/podk-ad-pod-ogowy-corksystem-lvt-1-5-mm-pod-panele-winylowe-6-m2-1-op-~5061092900925_01c_MP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/podklad-podlogowy-pod-panele-laminowane-volden-xps-smart-3-mm-10-m2/5063022038289_CAPL.prd
  {"ids":["mat-underlay-volden-xps-10m2"],"ean":"5063022038289","sourceUrl":"https://liderzycen.pl/pl/p/Podklad-podlogowy-pod-panele-laminowane-Volden-XPS-Smart-3-mm-10-m2/31327","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_51942_500_500/e236d745fb2303be7b2fb68575842e4a.jpg"},
  // source: https://www.castorama.pl/drzwi-z-podcieciem-opp-klasyk-70-prawe-biale/5063022524034_CAPL.prd
  {"ids":["mat-door-leaf-opp-klasyk-70-white"],"ean":"5063022524034","sourceUrl":"https://www.castorama.pl/drzwi-z-podcieciem-opp-klasyk-70-prawe-biale/5063022524034_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/drzwi-z-podcieciem-opp-klasyk-70-prawe-biale~5063022524034_02c?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-marvo-2-235-m2/5063022676757_CAPL.prd
  {"ids":["mat-vinyl-spc-click-goodhome-marvo-224m2"],"ean":"5063022676757","sourceUrl":"https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Marvo-2%2C235-m2/185474","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_385938_500_500/fc6886e524d877060a0d12ba4742f75e.jpg"},
  // source: https://www.castorama.pl/panele-laminowane-oakland-wodoodporne-ac4-2-51-m2/5063022887917_CAPL.prd
  {"ids":["mat-laminate-oakland-ac4"],"ean":"5063022887917","sourceUrl":"https://liderzycen.pl/pl/p/Panele-laminowane-Oakland-wodoodporne-AC4-2%2C51-m2/185472","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_385924_500_500/0fc09fb9f3eda5be184e7dac0f2f6e76.jpg"},
  // source: https://www.castorama.pl/klej-do-wykladzin-soudal-26a-5-kg/5411183028395_CAPL.prd
  {"ids":["mat-vinyl-adhesive-soudal-26a-5kg"],"ean":"5411183028395","sourceUrl":"https://chemiadoparkietu25.pl/product-pol-25914-Soudal-26A-klej-do-wykladzin-PCV-winylu-linoleum-dywanowych-5-kg.html","imageUrl":"https://media.adeo.com/media/5600934/media.jpg"},
  // source: https://www.castorama.pl/pianka-montazowa-soudal-low-expansion-pistoletowa-zimowa-750-ml/5411183048522_CAPL.prd
  {"ids":["mat-foam-soudal-lowexp-750ml"],"ean":"5411183048522","sourceUrl":"https://www.castorama.pl/pianka-montazowa-soudal-low-expansion-pistoletowa-zimowa-750-ml/5411183048522_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/pianka-montazowa-soudal-low-expansion-pistoletowa-zimowa-750-ml~5411183048522_02c_PL_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.unimet.pl/narozniki-6/262771-naroznik-aluminiowy-z-siatka-7070-250cm-5900308102411.html
  {"ids":["mat-plaster-corner-alu-mesh-25m"],"ean":"5900308102411","sourceUrl":"https://www.unimet.pl/narozniki-6/262771-naroznik-aluminiowy-z-siatka-7070-250cm-5900308102411.html","imageUrl":"https://www.unimet.pl/2006367-large_default/naroznik-aluminiowy-z-siatka-7070-250cm.webp"},
  // source: https://www.castorama.pl/drzwi-pokojowe-credis-80-lewe-biale/5900378219590_CAPL.prd
  {"ids":["mat-door-leaf-erkado-credis-80-glazed"],"ean":"5900378219590","sourceUrl":"https://liderzycen.pl/pl/p/Drzwi-pokojowe-Credis-80-lewe-biale/30489","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_50898_500_500/a79eaa09c570422baee6412157b93d28.jpg"},
  // source: https://www.castorama.pl/zawor-katowy-z-filtrem-ferro-1-2-x-3-8-/5901095614033_CAPL.prd
  {"ids":["mat-angle-valve-ferro-1-2-3-8"],"ean":"5901095614033","sourceUrl":"https://liderzycen.pl/pl/p/Zawor-katowy-z-filtrem-Ferro-12-x-38/49055","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_70333_500_500/1831d737608977a2a1b38c23f5417c16.jpg"},
  // source: https://www.castorama.pl/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-/5901752637337_CAPL.prd
  {"ids":["mat-flush-box-elektroplast-pk60-10"],"ean":"5901752637337","sourceUrl":"https://www.castorama.pl/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-/5901752637337_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-~5901752637337_01c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/kompakt-wc-cersanit-seno-bezkolnierzowy-3-5-l-z-deska-wolnoopadajaca/5902115720833_CAPL.prd
  {"ids":["mat-wc-compact-cersanit-seno-3-5l"],"ean":"5902115720833","sourceUrl":"https://www.castorama.pl/kompakt-wc-cersanit-seno-bezkolnierzowy-3-5-l-z-deska-wolnoopadajaca/5902115720833_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/kompakt-wc-cersanit-seno-bezkolnierzowy-3-5-l-z-deska-wolnoopadajaca~5902115720833_01c?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd
  {"ids":["mat-plaster-gypsum-machine-knauf-mp75-25kg"],"ean":"5902367206352","sourceUrl":"https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/tynk-maszynowy-knauf-mp-75-25-kg~5902367206352_03c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://krasny.pl/gips-goldband-25-gips-tynkarski-goldband-25kg-id-5902367206383
  {"ids":["mat-plaster-gypsum-manual-knauf-goldband-25kg"],"ean":"5902367206383","sourceUrl":"https://krasny.pl/gips-goldband-25-gips-tynkarski-goldband-25kg-id-5902367206383","imageUrl":"https://static.krasny.pl/59/02/36/72/06/38/3/0/SMALL_100.webp?hash=d61d71b4ff1c4592683b9ceecda29fca"},
  // source: https://www.castorama.pl/styropian-fasadowy-yetico-gamma-100-mm-3-m2-6-szt-/5902578301976_CAPL.prd
  {"ids":["mat-eps-facade-yetico-gamma-044-100mm"],"ean":"5902578301976","sourceUrl":"https://www.castorama.pl/styropian-fasadowy-yetico-gamma-100-mm-3-m2-6-szt-/5902578301976_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/styropian-fasadowy-yetico-gamma-100-mm-3-m2-6-szt-~5902578301976_01c_PL_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/styropian-fasadowy-passive-yetico-150-mm-2-m2-4-szt-/5902578307268_CAPL.prd
  {"ids":["mat-eps-facade-yetico-passive-033-150mm"],"ean":"5902578307268","sourceUrl":"https://www.castorama.pl/styropian-fasadowy-passive-yetico-150-mm-2-m2-4-szt-/5902578307268_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/styropian-fasadowy-passive-yetico-150-mm-2-m2-4-szt-~5902578307268_01c_PL_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/baza-oscieznicy-regulowana-perfectdoor-80-100-mm-prawa-dab-sonoma/5902659279118_CAPL.prd
  {"ids":["mat-door-frame-perfectdoor-reg-80-100"],"ean":"5902659279118","sourceUrl":"https://www.castorama.pl/baza-oscieznicy-regulowana-perfectdoor-80-100-mm-prawa-dab-sonoma/5902659279118_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/baza-oscieznicy-regulowana-perfectdoor-80-100-mm-prawa-dab-sonoma~5902659279118_03c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/lacznik-pojedynczy-kontakt-simon-basic-bialy/5902787568177_CAPL.prd
  {"ids":["mat-switch-simon-basic-bmw1"],"ean":"5902787568177","sourceUrl":"https://www.castorama.pl/lacznik-pojedynczy-kontakt-simon-basic-bialy/5902787568177_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/lacznik-pojedynczy-kontakt-simon-basic-bialy~5902787568177_02c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.eelektryka.com/simon-basic/3975-simon-basic-gniazdo-pojedyncze-zu-i-przes%C5%82onami-do-ramki-bia%C5%82e-bmgz1z0111-5902787568238.html
  {"ids":["mat-socket-simon-basic-bmgz1z"],"ean":"5902787568238","sourceUrl":"https://www.eelektryka.com/simon-basic/3975-simon-basic-gniazdo-pojedyncze-zu-i-przes%C5%82onami-do-ramki-bia%C5%82e-bmgz1z0111-5902787568238.html","imageUrl":"https://www.eelektryka.com/11095-large_default/simon-basic-gniazdo-pojedyncze-zu-i-przes%C5%82onami-do-ramki-bia%C5%82e-bmgz1z0111.jpg"},
  // source: https://www.castorama.pl/drzwi-pelne-archi-80-lewe-biale-lakierowane/5903917782364_CAPL.prd
  {"ids":["mat-door-leaf-archi-80-white"],"ean":"5903917782364","sourceUrl":"https://www.castorama.pl/drzwi-pelne-archi-80-lewe-biale-lakierowane/5903917782364_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/drzwi-pelne-archi-80-lewe-biale-lakierowane~5903917782364_02c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://cezar.eu/products/listwa-progowa-owalna-aluminiowa-szeroka-40mm-cezar-srebrny-mat-1m
  {"ids":["mat-vinyl-threshold-cezar-alu-40mm-1m"],"ean":"5904584845215","sourceUrl":"https://cezar.eu/products/listwa-progowa-owalna-aluminiowa-szeroka-40mm-cezar-srebrny-mat-1m","imageUrl":"https://cezar.eu/cdn/shop/files/c505b58a71683c0e135cf53f166408a7.webp?v=1769675117"},
  // source: https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb/5904617573764_CAPL.prd
  {"ids":["mat-wire-ydyp-3x25-akszielonka-100m"],"ean":"5904617573764","sourceUrl":"https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb/5904617573764_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb~5904617573764_02c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb/5904617573771_CAPL.prd
  {"ids":["mat-wire-ydyp-3x15-akszielonka-100m"],"ean":"5904617573771","sourceUrl":"https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb/5904617573771_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb~5904617573771_02c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/listwa-przypodlogowa-pcv-arbiton-indo-26-x-70-x-2500-mm-bialy-polysk/5905167725719_CAPL.prd
  {"ids":["mat-skirting-arbiton-2500"],"ean":"5905167725719","sourceUrl":"https://topboden.pl/listwy-przypodlogowe/listwa-przypodlogowa-arbiton-indo-bialy-polysk-1","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167725719_P_02.webp"},
  // source: https://kronodom.pl/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-16mm-1opk.6m2-czerwona-harmonijka
  {"ids":["mat-underlay-arbiton-xps-aquastop-6m2"],"ean":"5905167826942","sourceUrl":"https://kronodom.pl/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-16mm-1opk.6m2-czerwona-harmonijka","imageUrl":"https://a.assecobs.com/_img/sklepkronodom/3097bab5-5609-4e24-aa08-b8440b55b4fa/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-1-6mm-1opk-6m2-czerwona-harmonijka.jpg"},
  // source: https://www.castorama.pl/klej-wysokoelastyczny-atlas-plus-odksztalcalny-25-kg/5905400658866_CAPL.prd
  {"ids":["mat-tile-adhesive-buildfix-25kg"],"ean":"5905400658866","sourceUrl":"https://www.castorama.pl/klej-wysokoelastyczny-atlas-plus-odksztalcalny-25-kg/5905400658866_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/klej-wysokoelastyczny-atlas-plus-odksztalcalny-25-kg~5905400658866_22c_PL_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/kotwa-montazowa-do-oscieznic-10-x-182-mm/5905458019787_CAPL.prd
  {"ids":["mat-window-frame-anchor-10x182"],"ean":"5905458019787","sourceUrl":"https://liderzycen.pl/pl/p/Kotwa-montazowa-do-oscieznic-10-x-182-mm/21842","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_42043_500_500/141eb368955c6aeb6e1e7b6e42ac9af7.jpg"},
  // source: https://www.castorama.pl/zawias-regulowany-3d-14-mm-ocynkowany/5906711270471_CAPL.prd
  {"ids":["mat-door-hinge-metro-3d-14mm"],"ean":"5906711270471","sourceUrl":"https://liderzycen.pl/pl/p/Zawias-regulowany-3D-14-mm-ocynkowany/22128","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_42329_500_500/19ba2fb309a7adcf2859ffa72b746764.jpg"},
  // source: https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd
  {"ids":["mat-edge-tape-fola-100mm-50m"],"ean":"5906725207227","sourceUrl":"https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2~5906725207227_03c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy/5906725219640_CAPL.prd
  {"ids":["mat-windowsill-pvc-form-30x216"],"ean":"5906725219640","sourceUrl":"https://www.castorama.pl/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy/5906725219640_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy~5906725219640_01c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/gladz-pod-walek-gw180-20-kg/5907418038791_CAPL.prd
  {"ids":["mat-skim-coat-economy-20kg"],"ean":"5907418038791","sourceUrl":"https://www.castorama.pl/gladz-pod-walek-gw180-20-kg/5907418038791_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/gladz-pod-walek-kreisel-gw180-gotowa-polimerowa-20-kg~5907418038791_21c_PL_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://hipper.pl/klamka-do-drzwi-wewnetrznych-lucy-zlota-r-schaffner-3069808860
  {"ids":["mat-door-handle-schaffner-lucy-rosette"],"ean":"5907467760698","sourceUrl":"https://hipper.pl/klamka-do-drzwi-wewnetrznych-lucy-zlota-r-schaffner-3069808860","imageUrl":"https://hipper.pl/api/attachment/get/C3095A86-0FCB-46FF-A52A-63855FB53DDB/ImageIdent/csPhotos|PhotoMed|CAE8B284-A426-4F37-9916-7AC893514364|1/Klamka%20do%20drzwi%20wewn%C4%99trznych%20Lucy%20z%C5%82ota%20R%20Schaffner.webp"},
  // source: https://liderzycen.pl/pl/p/Kliny-montazowe-Floorpol-30-x-150-mm-10-szt./31651
  {"ids":["mat-mounting-wedges-floorpol-30x150-10"],"ean":"5907508719289","sourceUrl":"https://liderzycen.pl/pl/p/Kliny-montazowe-Floorpol-30-x-150-mm-10-szt./31651","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_52309_500_500/8fc1fd3c8fa7d0b098f9b17c9b091da3.jpg"},
  // source: https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd
  {"ids":["mat-laminate-kronospan-toledo-ac4-222"],"ean":"5907555422774","sourceUrl":"https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2~5907555422774_02c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/listwa-przypodlogowa-mdf-krono-original-biala-lk100f/5907555424969_CAPL.prd
  {"ids":["mat-skirting-krono-lk100f-mdf-240"],"ean":"5907555424969","sourceUrl":"https://www.castorama.pl/listwa-przypodlogowa-mdf-krono-original-biala-lk100f/5907555424969_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/listwa-przypodlogowa-mdf-krono-original-biala-lk100f~5907555424969_01i_PL_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/profil-sufitowy-norgips-cd60-0-6-mm-3-mb/5907651698899_CAPL.prd
  {"ids":["mat-profile-cd60-norgips-3m"],"ean":"5907651698899","sourceUrl":"https://www.castorama.pl/profil-sufitowy-norgips-cd60-0-6-mm-3-mb/5907651698899_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/profil-sufitowy-norgips-cd60-0-6-mm-3-mb~5907651698899_01c_PL_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://listwy.sklep.pl/pl/p/Klips-montazowy-z-podkladka-dystansowa-do-montazu-listew-1opak25szt-MASTER-LINE-CEZAR/687
  {"ids":["mat-skirting-clips-cezar-25"],"ean":"5907684672217","sourceUrl":"https://listwy.sklep.pl/pl/p/Klips-montazowy-z-podkladka-dystansowa-do-montazu-listew-1opak25szt-MASTER-LINE-CEZAR/687","imageUrl":"https://listwy.sklep.pl/environment/cache/images/productGfx_3487_500_500/klips-do-montowania-listew-przypodlogowych.jpg"},
  // source: https://www.castorama.pl/departments/w-w-yk-przy-czeniowy-do-baterii-gw-gz-3-8-x-m10-30-cm-oplot-invena-1-szt-/5907798716258_CAPL.prd
  // source: https://sklep.tokmet.pl/wezyk_do_baterii_stojacej_38_x_m101_l__30_cm_dluga_koncowka-2806i
  {"ids":["mat-hose-braided-invena-3-8-30"],"ean":"5907798716258","sourceUrl":"https://sklep.tokmet.pl/wezyk_do_baterii_stojacej_38_x_m101_l__30_cm_dluga_koncowka-2806i","imageUrl":"https://sklep.tokmet.pl/picturesbig/xpic81087437639.jpg.pagespeed.ic.mhMX9l5zcR.jpg"},
  // source: https://www.castorama.pl/naroznik-uszczelniajacy-zewnetrzny-mapei/8022452113789_CAPL.prd
  {"ids":["mat-sealing-corner-external-mapei"],"ean":"8022452113789","sourceUrl":"https://www.castorama.pl/naroznik-uszczelniajacy-zewnetrzny-mapei/8022452113789_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/naroznik-uszczelniajacy-zewnetrzny-mapei~8022452113789_02c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/naroznik-uszczelniajacy-wewnetrzny-mapei/8022452113802_CAPL.prd
  {"ids":["mat-sealing-corner-internal-mapei"],"ean":"8022452113802","sourceUrl":"https://www.castorama.pl/naroznik-uszczelniajacy-wewnetrzny-mapei/8022452113802_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/naroznik-uszczelniajacy-wewnetrzny-mapei~8022452113802_02c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://www.castorama.pl/mankiet-uszczelniajacy-mapei-maly-2-szt-/8022452113925_CAPL.prd
  {"ids":["mat-sealing-cuff-wall-mapei-12x12-2"],"ean":"8022452113925","sourceUrl":"https://www.castorama.pl/mankiet-uszczelniajacy-mapei-maly-2-szt-/8022452113925_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/mankiet-uszczelniajacy-mapei-maly-2-szt-~8022452113925_08c_CP?$MOB_PREV$&$width=284&$height=284"},
  // source: https://mrowka.com.pl/produkt/siatka-scierna-na-rzep-225-mm-k180-do-szlifierki-59g260-10-sztuk-graphite-5902062502735.html
  {"ids":["mat-abrasive-mesh-graphite-225-k180-10"],"ean":"5902062502735","sourceUrl":"https://mrowka.com.pl/produkt/siatka-scierna-na-rzep-225-mm-k180-do-szlifierki-59g260-10-sztuk-graphite-5902062502735.html","imageUrl":"https://mrowka.com.pl/files/InfoverProduct/6f/smngr0j78hjr/Photos/3fmkicl0lt0c47/siatka-scierna-na-rzep-225-mm-k180-do-szlifierki-59g260-10-sztuk-graphite_1.png"},
  // source: https://mrowka.com.pl/produkt/plyta-gkb-12-5x1200x2600-mm-zwykla-norgips-5907651690442.html
  {"ids":["mat-gypsum-board-norgips-gkb-a-1200x2600"],"ean":"5907651690442","sourceUrl":"https://domat24.pl/produkt/plyta-gipsowa-gkb-12-5-12002600-biala/","imageUrl":"https://domat24.pl/wp-content/uploads/2021/09/Plyta-gipsowa-GKB-12.5-12002600-BIALA.jpg"},
  // source: https://mrowka.com.pl/produkt/plyta-gkbi-12-5x1200x2600-mm-woda-norgips-5907651691616.html
  {"ids":["mat-gypsum-board-norgips-gkbi-h2-1200x2600"],"ean":"5907651691616","sourceUrl":"https://domat24.pl/produkt/plyta-gipsowa-gkbi-12-5-12002600-zielona/","imageUrl":"https://domat24.pl/wp-content/uploads/2021/09/Plyta-gipsowa-GKBI-12.5-12002600-ZIELONA.jpg"},
  // source: https://mrowka.com.pl/produkt/profil-sufitowy-ud27-0-50-mm-3-m-budmat-plock-5907738940163.html
  {"ids":["mat-profile-ud27-budmat-3m"],"ean":"5907738940163","sourceUrl":"https://mrowka.com.pl/produkt/profil-sufitowy-ud27-0-50-mm-3-m-budmat-plock-5907738940163.html","imageUrl":"https://mrowka.com.pl/files/InfoverProduct/d9/hue3u0i8mdfv/Photos/i2a1l0s0lkjpcc/ShowWebp_profil-sufitowy-ud27---050-mm---3-m-budmat-plock_1.webp"},
  // source: https://tgs.pl/pl/p/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom/44
  {"ids":["mat-basin-mixer-ferro-stillo"],"ean":"5902194929837","sourceUrl":"https://tgs.pl/pl/p/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom/44","imageUrl":"https://tgs.pl/environment/cache/images/productGfx_56358_500_500/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom.jpg"},
  // source: https://northbud.pl/ferro-bateria-prysznicowa-ferro-one-bez-prysznica-chrom-bfo7-p70291
  {"ids":["mat-shower-mixer-ferro-one"],"ean":"5902194954525","sourceUrl":"https://northbud.pl/ferro-bateria-prysznicowa-ferro-one-bez-prysznica-chrom-bfo7-p70291","imageUrl":"https://northbud.pl/images/full/1e9b01b770f801be0857841c1ae715fa.jpg"},
  // source: https://mrowka.com.pl/produkt/rura-pex-al-pex-16-mmx2-200-mb-tycner-5901095517976.html
  {"ids":["mat-pex-pipe-tycner-16x2"],"ean":"5901095517976","sourceUrl":"https://mrowka.com.pl/produkt/rura-pex-al-pex-16-mmx2-200-mb-tycner-5901095517976.html","imageUrl":"https://mrowka.com.pl/files/InfoverProduct/na/v421g0idki5e/Photos/ug7jg8k0mn1o12/ShowWebp_rura-pex-al-pex-16-mmx2---200-mb-tycner_1.webp"},
  // source: https://mrowka.com.pl/produkt/syfon-umywalkowy-1-1-4x32-mm-z-membrana-silikonowa-i-rewizja-mcalpine-5036484088390.html
  {"ids":["mat-basin-trap-mcalpine-whb1-32"],"ean":"5036484088390","sourceUrl":"https://mrowka.com.pl/produkt/syfon-umywalkowy-1-1-4x32-mm-z-membrana-silikonowa-i-rewizja-mcalpine-5036484088390.html","imageUrl":"https://mrowka.com.pl/files/InfoverProduct/7v/fkpse0mm7t7f/Photos/odqus2n0mm7t7f/ShowWebp_syfon-umywalkowy-1-14x32-mm-z-membrana-silikonowa-i-rewizja-mcalpine_1.webp"},
  // source: https://mrowka.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html
  {"ids":["mat-pex-elbow-tycner-16x16"],"ean":"5901095521003","sourceUrl":"https://mrowka.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html","imageUrl":"https://mrowka.com.pl/files/InfoverProduct/vu/t7atm0ht029g/Photos/cumrci10no4fac/ShowWebp_kolanko-zaciskowe-pex-16x16-mm-tycner_1.webp"},
  // source: https://www.grupapsb.com.pl/produkt/umywalka-facile-50-cm-cersanit-5907720650025.html
  {"ids":["mat-washbasin-cersanit-facile-50"],"ean":"5907720650025","sourceUrl":"https://www.grupapsb.com.pl/produkt/umywalka-facile-50-cm-cersanit-5907720650025.html","imageUrl":"https://pliki.grupapsb.com.pl/files/InfoverProduct/h1/ej7ro0igtlm8/Photos/lm63o5p0lldq4u/Body_umywalka-facile-50-cm-cersanit_1.jpg"},
  // source: https://www.unimet.pl/pozostale-18/3744291-zestaw-przylaczeniowo-mocujacy-wc-5901095514395.html
  {"ids":["mat-wc-mounting-set-tycner"],"ean":"5901095514395","sourceUrl":"https://www.unimet.pl/pozostale-18/3744291-zestaw-przylaczeniowo-mocujacy-wc-5901095514395.html","imageUrl":"https://www.unimet.pl/2023449-large_default/zestaw-przylaczeniowo-mocujacy-wc.webp"},
  // source: https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/
  {"ids":["mat-tile-wall-paradyz-nati-bianco-25x40"],"ean":"5902610507960","sourceUrl":"https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/","imageUrl":"https://elazienki.pl/wp-content/uploads/2025/02/SS-250X400-1-NATI.BI_.jpg"},
  // source: https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m
  {"ids":["mat-tile-trim-cezar-corner-8mm-25m"],"ean":"5904584853500","sourceUrl":"https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m","imageUrl":"https://cezar.eu/cdn/shop/files/f3af291d90963eeb125a6e5cb54a3887_9d9ddc5e-8cc3-42ba-b7e6-bd37c74886eb.png?v=1791543548&width=1200"},
  // source: https://www.blu.com.pl/plytki-uniwersalne/34276-ceramika-paradyz-u117-grey-gres-szkl-rekt-mat-5904584158261.html?url=plytki-podlogowe%2F34276-ceramika-paradyz-u117-grey-gres-szkl-rekt-mat-5904584158261
  {"ids":["mat-gres-rekt-paradyz-u117-grey-60x60"],"ean":"5904584158261","sourceUrl":"https://modnalazienka.pl/u117-grey-gres-szkl-rekt-mat-598x598-34158","imageUrl":"https://modnalazienka.pl/images/thumbnails/paradyz//u117-grey-gres-szkl-rekt-mat-598x598.jpg"},
  // source: https://bestbudowa.pl/tasmy-uszczelniajace-/8055-soudal-tasma-okienna-sws-basic-plus-90-inside-90mmx30m-5411183151178.html
  {"ids":["mat-window-tape-soudal-sws-inside-90mm"],"ean":"5411183151178","sourceUrl":"https://bestbudowa.pl/tasmy-uszczelniajace-/8055-soudal-tasma-okienna-sws-basic-plus-90-inside-90mmx30m-5411183151178.html","imageUrl":"https://bestbudowa.pl/5742-home_default/soudal-tasma-okienna-sws-basic-plus-90-inside-90mmx30m.jpg"},
  // source: https://betterial.pl/kleje-do-styropianu/8679-atlas-zaprawa-klejaca-do-styropianu-stopter-k-20.html
  {"ids":["mat-adhesive-eps-atlas-stopter-k20-25kg"],"ean":"5905400160253","sourceUrl":"https://betterial.pl/kleje-do-styropianu/8679-atlas-zaprawa-klejaca-do-styropianu-stopter-k-20.html","imageUrl":"https://betterial.pl/52078-product_main_2x/atlas-zaprawa-klejaca-do-styropianu-stopter-k-20.jpg"},
  // source: https://www.unimet.pl/uszczelniacze-58/259045-uszczelniacz-hybrydowy-fix-all-high-tack-bialy-290ml-5411183045620.html
  {"ids":["mat-mounting-adhesive-soudal-fixall-290ml"],"ean":"5411183045620","sourceUrl":"https://www.unimet.pl/uszczelniacze-58/259045-uszczelniacz-hybrydowy-fix-all-high-tack-bialy-290ml-5411183045620.html","imageUrl":"https://www.unimet.pl/2244944-large_default/uszczelniacz-hybrydowy-fix-all-high-tack-bialy-290ml.webp"},
  // source: https://mrowka.com.pl/produkt/tasma-teflonowa-do-wody-12x10x0-075-tycner-5900950618100.html
  {"ids":["mat-teflon-tape-tycner-12mm"],"ean":"5900950618100","sourceUrl":"https://mrowka.com.pl/produkt/tasma-teflonowa-do-wody-12x10x0-075-tycner-5900950618100.html","imageUrl":"https://mrowka.com.pl/files/InfoverProduct/mu/q7rvc0igoa6f/Photos/q96euhr0ml7hr0/ShowWebp_tasma-teflonowa-12-mm-x-10-m-x-0-075-mm-tycner_1.webp"},
  // source: https://www.prescot.com.pl/pl/p/ZLACZKA-WAGO-221-413-3X4mm-LINKADRUT-NO-WA/11528
  {"ids":["mat-wire-connector-wago-221-413"],"ean":"4050821808442","sourceUrl":"https://www.prescot.com.pl/pl/p/ZLACZKA-WAGO-221-413-3X4mm-LINKADRUT-NO-WA/11528","imageUrl":"https://www.prescot.com.pl/environment/cache/images/productGfx_45208_500_500/221-413.jpg"},
  // source: https://taniaplytka.pl/produkty/paradyz-petro-grey-struktura-mat-600x600-2
  {"ids":["mat-gres-paradyz-petro-grey-60x60"],"ean":"5904584161544","sourceUrl":"https://taniaplytka.pl/produkty/paradyz-petro-grey-struktura-mat-600x600-2","imageUrl":"https://s3-eu-west-1.amazonaws.com/taniaplytka.production/uploads/product/image/39706/39706.jpg"},
  // source: https://sklep.sewera.pl/tasma-malarska-niebieska-30mmx50m-p6966
  {"ids":["mat-masking-tape-bluedolphin-30mm"],"ean":"5907758515952","sourceUrl":"https://sklep.sewera.pl/tasma-malarska-niebieska-30mmx50m-p6966","imageUrl":"https://sklep.sewera.pl/photo/23077/tasma-malarska-niebieska-30mmx50m.webp"},
  // source: https://sklep.sewera.pl/acryl-putz-st10-start-20kg-p6107
  {"ids":["mat-skim-coat-acrylputz-st10-20kg"],"ean":"5903973104421","sourceUrl":"https://sklep.sewera.pl/acryl-putz-st10-start-20kg-p6107","imageUrl":"https://sklep.sewera.pl/photo/34282/acryl-putz-st10-start-20kg.webp"},
  // source: https://sklep.sewera.pl/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin-p21034
  {"ids":["mat-protective-film-bluedolphin-4x5m"],"ean":"5907758504932","sourceUrl":"https://sklep.sewera.pl/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin-p21034","imageUrl":"https://sklep.sewera.pl/photo/23165/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin.webp"},
  // source: https://sklep.sewera.pl/siatka-z-wlokna-szklanego-150-gm2-rolka-50m2-atlas-p9782
  {"ids":["mat-mesh-fiberglass-atlas-150-50m2"],"ean":"5905400196993","sourceUrl":"https://sklep.sewera.pl/siatka-z-wlokna-szklanego-150-gm2-rolka-50m2-atlas-p9782","imageUrl":"https://sklep.sewera.pl/photo/38995/siatka-z-wlokna-szklanego-150-gm2-rolka-50m2-atlas.webp"},
  // source: https://sklep.sewera.pl/soudal-akryl-bialy-280ml-p10680
  {"ids":["mat-acrylic-soudal-white-280ml"],"ean":"5411183157538","sourceUrl":"https://sklep.sewera.pl/soudal-akryl-bialy-280ml-p10680","imageUrl":"https://sklep.sewera.pl/photo/65126/soudal-akryl-bialy-280ml.webp"},
  // source: https://sklep.sewera.pl/tynk-wewnetrzny-cementowo-wapienny-baumit-mpi-25-30kg-p9081
  {"ids":["mat-plaster-cementlime-baumit-mpi25-30kg"],"ean":"5907534261158","sourceUrl":"https://sklep.sewera.pl/tynk-wewnetrzny-cementowo-wapienny-baumit-mpi-25-30kg-p9081","imageUrl":"https://sklep.sewera.pl/photo/250127/tynk-wewnetrzny-cementowo-wapienny-baumit-mpi-25-30kg.webp"},
  // source: https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101
  {"ids":["mat-plaster-thin-ceresit-ct174-25kg"],"ean":"9000101109733","sourceUrl":"https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101","imageUrl":"https://sklep.sewera.pl/photo/244805/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit.webp"},
  // source: https://realbud.com/Kolek-do-mcowania-izolacji-10-200-mtal-trzpien-50-op
  {"ids":["mat-anchor-facade-koelner-ki200m-10x200"],"ean":"5906675212647","sourceUrl":"https://realbud.com/Kolek-do-mcowania-izolacji-10-200-mtal-trzpien-50-op","imageUrl":"https://realbud.com/environment/cache/images/productGfx_25596_500_500/5393.png"},
  // source: https://sklep.sewera.pl/silikon-uniwersalny-bezbarwny-280ml-soudal-p21290
  {"ids":["mat-silicone-universal-soudal-280ml"],"ean":"5411183157552","sourceUrl":"https://sklep.sewera.pl/silikon-uniwersalny-bezbarwny-280ml-soudal-p21290","imageUrl":"https://sklep.sewera.pl/photo/343695/silikon-uniwersalny-bezbarwny-280ml-soudal.webp"},
  // source: https://sklep.sewera.pl/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16kg-atlas-p9897
  {"ids":["mat-waterproof-membrane-atlas-woder-duo-16kg"],"ean":"5905400195088","sourceUrl":"https://sklep.sewera.pl/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16kg-atlas-p9897","imageUrl":"https://sklep.sewera.pl/photo/193135/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16kg-atlas.webp"},
  // source: https://realbud.com/pl/p/Ceresit-CN-72-NIVEL-FAST%2C-25-kg%2C-zaprawa-samopoziomujaca/75057225
  {"ids":["mat-screed-ceresit-cn72-25kg"],"ean":"5900089272259","sourceUrl":"https://realbud.com/pl/p/Ceresit-CN-72-NIVEL-FAST%2C-25-kg%2C-zaprawa-samopoziomujaca/75057225","imageUrl":"https://realbud.com/environment/cache/images/productGfx_23328_500_500/8cf842d859fb9fe114e5ad53d45a64a2.jpg"},
  // source: https://sklep.sewera.pl/folia-w-plynie-szybkoschnaca-woder-e-15kg-atlas-p6346
  {"ids":["mat-waterproof-membrane-atlas-woder-e-15kg"],"ean":"5905400514506","sourceUrl":"https://sklep.sewera.pl/folia-w-plynie-szybkoschnaca-woder-e-15kg-atlas-p6346","imageUrl":"https://sklep.sewera.pl/photo/186395/folia-w-plynie-szybkoschnaca-woder-e-15kg-atlas.webp"},
  // source: https://sklep.sewera.pl/atlas-fuga-ceramiczna-001-bialy-2kg-p11674
  {"ids":["mat-grout-atlas-001-white-2kg"],"ean":"5905400572254","sourceUrl":"https://sklep.sewera.pl/atlas-fuga-ceramiczna-001-bialy-2kg-p11674","imageUrl":"https://sklep.sewera.pl/photo/257132/atlas-fuga-ceramiczna-001-bialy-2kg.webp"},
  // source: https://sklep.sewera.pl/tasma-uszczelniajaca-cl152-120mm-x-10m-ceresit-p7692
  {"ids":["mat-sealing-tape-ceresit-cl152-10m"],"ean":"5900089115211","sourceUrl":"https://sklep.sewera.pl/tasma-uszczelniajaca-cl152-120mm-x-10m-ceresit-p7692","imageUrl":"https://sklep.sewera.pl/photo/19057/tasma-uszczelniajaca-cl152-120mm-x-10m-ceresit.webp"},
  // source: https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-10cm-welna-szklana-p11975
  {"ids":["mat-mineral-wool-isover-akuplyta-10cm"],"ean":"5901644653155","sourceUrl":"https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-10cm-welna-szklana-p11975","imageUrl":"https://sklep.sewera.pl/photo/190057/isover-welna-mineralna-aku-plyta-037-10cm-welna-szklana.webp"},
  // source: https://sklep.sewera.pl/kolek-szybkiego-montazu-6x40mm-20szt-p10030
  {"ids":["mat-quick-dowels-wkretmet-sm-6x40-20"],"ean":"5907704466031","sourceUrl":"https://sklep.sewera.pl/kolek-szybkiego-montazu-6x40mm-20szt-p10030","imageUrl":"https://sklep.sewera.pl/photo/332585/kolek-szybkiego-montazu-6x40mm-20szt-klimas.webp"},
  // source: https://sklep.sewera.pl/krzyzyki-dystansowe-2mm-200szt--p12504
  {"ids":["mat-tile-spacers-hardy-2mm-200"],"ean":"5905061016845","sourceUrl":"https://sklep.sewera.pl/krzyzyki-dystansowe-2mm-200szt--p12504","imageUrl":"https://sklep.sewera.pl/photo/310570/krzyzyki-dystansowe-2mm-200szt-.webp"},
  // source: https://sklep.sewera.pl/wkret-tb-3-5x25mm-samowiercacyfosfatowany-100szt-p9993
  {"ids":["mat-drywall-screws-wkretmet-35x25-100"],"ean":"5907704499015","sourceUrl":"https://sklep.sewera.pl/wkret-tb-3-5x25mm-samowiercacyfosfatowany-100szt-p9993","imageUrl":"https://sklep.sewera.pl/photo/80066/wkret-samowiercacy-do-metalu-tb-3-5x25mm-fosfatowany-100szt-klimas.webp"},
  // source: https://sklep.sewera.pl/pianka-montazowa-pistoletowa-65-750ml-tytan-p12439
  {"ids":["mat-foam-tytan-pro65-750ml"],"ean":"5903518052859","sourceUrl":"https://sklep.sewera.pl/pianka-montazowa-pistoletowa-65-750ml-tytan-p12439","imageUrl":"https://sklep.sewera.pl/photo/257574/pianka-montazowa-pistoletowa-65-750ml-tytan.webp"},
  // source: https://sklep.sewera.pl/dekoral-farba-lateksowa-odporna-na-szorowanie-akrylit-w-plus-5l-p7969
  {"ids":["mat-paint-latex-dekoral-akrylit-w-white-5l"],"ean":"5904000810681","sourceUrl":"https://sklep.sewera.pl/dekoral-farba-lateksowa-odporna-na-szorowanie-akrylit-w-plus-5l-p7969","imageUrl":"https://sklep.sewera.pl/photo/260243/dekoral-farba-lateksowa-odporna-na-szorowanie-akrylit-w-plus-5l.webp"},
  // source: https://sklep.sewera.pl/ceresit-fuga-ce40-01-wodoodporna-elastyczna-2kg-p9147
  {"ids":["mat-grout-ceresit-ce40-white-2kg"],"ean":"5900089140015","sourceUrl":"https://sklep.sewera.pl/ceresit-fuga-ce40-01-wodoodporna-elastyczna-2kg-p9147","imageUrl":"https://sklep.sewera.pl/photo/331996/ceresit-fuga-ce40-01-wodoodporna-elastyczna-2kg.webp"},
  // source: https://sklep.sewera.pl/tasma-malarska-niebieska-38mmx50m-p6967
  {"ids":["mat-masking-tape-bluedolphin-38mm"],"ean":"5907758507285","sourceUrl":"https://sklep.sewera.pl/tasma-malarska-niebieska-38mmx50m-p6967","imageUrl":"https://sklep.sewera.pl/photo/23327/tasma-malarska-niebieska-38mmx50m.webp"},
  // source: https://realbud.com/pl/p/Ceresit-CM-11%2C-25-kg%2C-uniwersalny-klej-do-plytek/75057156
  {"ids":["mat-tile-adhesive-ceresit-cm11-25kg"],"ean":"5900089111251","sourceUrl":"https://realbud.com/pl/p/Ceresit-CM-11%2C-25-kg%2C-uniwersalny-klej-do-plytek/75057156","imageUrl":"https://realbud.com/environment/cache/images/productGfx_23258_500_500/46e2bb71554f4ee22711a9cccee46e6b.jpg"},
  // source: https://realbud.com/pl/p/Ceresit-CT-17%2C-10-l%2C-gleboko-penetrujacy-grunt-bezrozpuszczalnikowy/75057217
  {"ids":["mat-primer-deep-ceresit-ct17-10l"],"ean":"5900089617081","sourceUrl":"https://realbud.com/pl/p/Ceresit-CT-17%2C-10-l%2C-gleboko-penetrujacy-grunt-bezrozpuszczalnikowy/75057217","imageUrl":"https://realbud.com/environment/cache/images/productGfx_23320_500_500/4f6162f89165674a20b43a12f287acd2.png"},
  // source: https://sklep.sewera.pl/silikon-sanitarny-bialy-280ml-soudal-p21286
  {"ids":["mat-sanitary-silicone-soudal-280ml"],"ean":"5411183157064","sourceUrl":"https://sklep.sewera.pl/silikon-sanitarny-bialy-280ml-soudal-p21286","imageUrl":"https://sklep.sewera.pl/photo/343671/silikon-sanitarny-bialy-280ml-soudal.webp"},
  // source: https://sklep.sewera.pl/sniezka-eko-plus-odporna-na-szorowanie-10l-p6089
  {"ids":["mat-paint-better-white-10l"],"ean":"5903973205982","sourceUrl":"https://sklep.sewera.pl/sniezka-eko-plus-odporna-na-szorowanie-10l-p6089","imageUrl":"https://sklep.sewera.pl/photo/65072/sniezka-eko-plus-odporna-na-szorowanie-10l.webp"},
  // source: https://sklep.sewera.pl/podkladowa-masa-tynkarska-cerplast-15kg-atlas-p9884
  {"ids":["mat-plaster-primer-atlas-cerplast-15kg"],"ean":"5905400530032","sourceUrl":"https://sklep.sewera.pl/podkladowa-masa-tynkarska-cerplast-15kg-atlas-p9884","imageUrl":"https://sklep.sewera.pl/photo/92128/podkladowa-masa-tynkarska-cerplast-15kg-atlas.webp"},
  // source: https://sklep.sewera.pl/atlas-sam-200-25kg-samopoziomujacy-podklad-podlogowy-p9795
  {"ids":["mat-screed-atlas-sam200-25kg"],"ean":"5905400279269","sourceUrl":"https://sklep.sewera.pl/atlas-sam-200-25kg-samopoziomujacy-podklad-podlogowy-p9795","imageUrl":"https://sklep.sewera.pl/photo/92590/atlas-sam-200-25kg-samopoziomujacy-podklad-podlogowy.webp"},
  // source: https://sklep.sewera.pl/atlas-sam-100-25kg-szybkowiazacy-samopoziomujacy-podklad-podlogowy-p9811
  {"ids":["mat-screed-atlas-sam100-25kg"],"ean":"5905400279245","sourceUrl":"https://sklep.sewera.pl/atlas-sam-100-25kg-szybkowiazacy-samopoziomujacy-podklad-podlogowy-p9811","imageUrl":"https://sklep.sewera.pl/photo/92586/atlas-sam-100-25kg-szybkowiazacy-samopoziomujacy-podklad-podlogowy.webp"},
  // source: https://sklep.sewera.pl/acryl-putz-fs20-finisz-27kg-p6114
  {"ids":["mat-skim-coat-acrylputz-fs20-27kg"],"ean":"5903973104544","sourceUrl":"https://sklep.sewera.pl/acryl-putz-fs20-finisz-27kg-p6114","imageUrl":"https://sklep.sewera.pl/photo/259046/acryl-putz-fs20-finisz-27kg.webp"},
  // source: https://sklep.sewera.pl/atlas-uni-grunt-5kg-emulsja-gruntujaca-p9772
  {"ids":["mat-primer-deep-atlas-unigrunt-5kg"],"ean":"5905400520026","sourceUrl":"https://sklep.sewera.pl/atlas-uni-grunt-5kg-emulsja-gruntujaca-p9772","imageUrl":"https://sklep.sewera.pl/photo/313998/atlas-uni-grunt-5kg-emulsja-gruntujaca.webp"},
  {
    ids: [], ean: '5903973153214',
    // source: https://www.leroymerlin.pl/produkty/farba-magnat-ceramic-bialy-5-l-45615171.html
    sourceUrl: 'https://www.leroymerlin.pl/produkty/farba-magnat-ceramic-bialy-5-l-45615171.html',
    imageUrl: 'https://media.adeo.com/media/5071689/media.png?fit=bounds&format=jpg&height=125&quality=60&width=125',
  },
  {
    ids: ['mat-universal-primer-5l'], ean: '5901793357737',
    // source: https://www.castorama.pl/grunt-uniwersalny-knauf-5-l/5901793357737_CAPL.prd
    sourceUrl: 'https://www.castorama.pl/grunt-uniwersalny-knauf-5-l/5901793357737_CAPL.prd',
    imageUrl: 'https://media2.castorama.pl/is/image/CastoramaPL/grunt-uniwersalny-knauf-5-l~5901793357737_03c_CP?%24MOB_PREV%24=&%24height=600&%24width=600',
  },
  {
    ids: ['mat-paint-latex-sniezka-barwy-natury-white-5l'], ean: '5903973139188',
    // source: https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd
    sourceUrl: 'https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd',
    imageUrl: 'https://media2.castorama.pl/is/image/CastoramaPL/farba-sniezka-barwy-natury-biala-5-l~5903973139188_01h_PL_CP?%24MOB_PREV%24=&%24height=600&%24width=600',
  },
  {
    ids: ['mat-paint-latex-dulux-easycare-white-9l'], ean: '5904078198759',
    // source: https://www.castorama.pl/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l/5904078198759_CAPL.prd
    sourceUrl: 'https://www.castorama.pl/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l/5904078198759_CAPL.prd',
    imageUrl: 'https://media2.castorama.pl/is/image/CastoramaPL/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l~5904078198759_01c_PL_CP?%24MOB_PREV%24=&%24height=600&%24width=600',
  },
  {
    ids: ['mat-skim-coat-standard-18kg'], ean: '5905400542509',
    // source: https://www.castorama.pl/gotowa-gladz-polimerowa-atlas-gta-18-kg/5905400542509_CAPL.prd
    sourceUrl: 'https://www.castorama.pl/gotowa-gladz-polimerowa-atlas-gta-18-kg/5905400542509_CAPL.prd',
    imageUrl: 'https://media2.castorama.pl/is/image/CastoramaPL/gotowa-gladz-polimerowa-atlas-gta-18-kg~5905400542509_02c_PL_CP?%24MOB_PREV%24=&%24height=600&%24width=600',
  },
];

export function getProductPhoto(product: {
  id?: string; ean?: string | null; imageUrl?: string | null; sourceUrl?: string;
  shopPrices?: readonly { url: string }[];
}): string | undefined {
  const urls = [product.sourceUrl, ...product.shopPrices?.map(price => price.url) ?? []];
  // Prefer the reviewed catalogue image for an exact identity. Some shop
  // domains serve prices correctly on the backend but time out on the device.
  const reviewed = PRODUCT_PHOTOS.find(photo =>
    (product.id && (photo.ids.includes(product.id) || product.id === `remont-${photo.ean}`)) ||
    (product.ean && photo.ean === product.ean) || urls.includes(photo.sourceUrl),
  )?.imageUrl;
  return reviewed ?? (product.imageUrl?.startsWith('https://') ? product.imageUrl : undefined);
}
