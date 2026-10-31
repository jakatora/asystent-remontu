/** Product photographs observed on the linked retail/manufacturer pages on 2026-10-24–29.
 * Match by stable catalogue ID, EAN or exact source URL, never by fuzzy name.
 */
interface ProductPhoto {
  readonly ids: readonly string[];
  /** Reviewed merchant SKUs may have no manufacturer EAN. */
  readonly ean?: string;
  readonly sourceUrl: string;
  /** Exact retail identity when the image itself comes from the manufacturer. */
  readonly identitySourceUrl?: string;
  readonly imageUrl: string;
}

export const PRODUCT_PHOTOS: readonly ProductPhoto[] = [
  // source: https://sklep.sewera.pl/klej-do-wykladzin-osakryl-uniwersalny-4kg-tytan-p21233
  {"ids":["mat-vinyl-adhesive-tytan-osakryl-4kg"],"ean":"5903518039515","sourceUrl":"https://sklep.sewera.pl/klej-do-wykladzin-osakryl-uniwersalny-4kg-tytan-p21233","imageUrl":"https://sklep.sewera.pl/photo/150507/klej-do-wykladzin-osakryl-uniwersalny-4kg-tytan.webp"},
  // source: https://ewinyl.pl/produkt/orion-514-05-wykladzina-winylowy-3m-4m/
  // The same photographed decor is available in two explicitly selected widths.
  {"ids":["mat-roll-orion514-ewinyl-2m","mat-roll-orion514-ewinyl-4m","remont-sku-ewinyl-5329-2m","remont-sku-ewinyl-5329-4m"],"sourceUrl":"https://ewinyl.pl/produkt/orion-514-05-wykladzina-winylowy-3m-4m/","imageUrl":"https://ewinyl.pl/wp-content/uploads/2019/01/514-05-copy-950x950-600x600.jpg"},
  // source: https://liderzycen.pl/pl/p/Podklad-podlogowy-pod-panele-winylowe-Volden-XPS-LVT-pod-panele-winylowe-1-mm-6%2C25-m2/32891
  {"ids":["mat-vinyl-underlay-volden-lvt-625m2"],"ean":"5063022038326","sourceUrl":"https://liderzycen.pl/pl/p/Podklad-podlogowy-pod-panele-winylowe-Volden-XPS-LVT-pod-panele-winylowe-1-mm-6%2C25-m2/32891","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_53817_500_500/9772c302db12f1d82525f11644d6fe42.jpg"},
  // source: https://zpradem.pl/asfora-ramka-pojedyncza-biala-eph5800121/788683
  {"ids":["mat-frame-asfora-white-1"],"ean":"3606480527166","sourceUrl":"https://zpradem.pl/asfora-ramka-pojedyncza-biala-eph5800121/788683","imageUrl":"https://zpradem.pl/environment/cache/images/productGfx_440022_500_500/ASFORA-Ramka-pojedyncza-biala-EPH5800121.jpg"},
  // source: https://zpradem.pl/asfora-ramka-podwojna-pozioma-biala-eph5800221/799939
  {"ids":["mat-frame-asfora-white-2"],"ean":"3606480527180","sourceUrl":"https://zpradem.pl/asfora-ramka-podwojna-pozioma-biala-eph5800221/799939","imageUrl":"https://zpradem.pl/environment/cache/images/productGfx_440276_500_500/ASFORA-Ramka-podwojna-pozioma-biala-EPH5800221.jpg"},
  // source: https://zpradem.pl/asfora-ramka-potrojna-pozioma-biala-eph5800321/815336
  {"ids":["mat-frame-asfora-white-3"],"ean":"3606480527203","sourceUrl":"https://zpradem.pl/asfora-ramka-potrojna-pozioma-biala-eph5800321/815336","imageUrl":"https://zpradem.pl/environment/cache/images/productGfx_440028_500_500/ASFORA-Ramka-potrojna-pozioma-biala-EPH5800321.jpg"},
  // source: https://integra-bielinscy.pl/uchwyty/1614-uchwyt-meblowy-nyxa-c-128-l-138-czarny-mat-5902801422652.html
  {"ids":["mat-handle-gtv-nyxa-128-black"],"ean":"5902801422652","sourceUrl":"https://integra-bielinscy.pl/uchwyty/1614-uchwyt-meblowy-nyxa-c-128-l-138-czarny-mat-5902801422652.html","imageUrl":"https://integra-bielinscy.pl/2693-home_default/uchwyt-meblowy-nyxa-c-128-l-138-czarny-mat.jpg"},
  // source: https://integra-bielinscy.pl/uchwyty/1613-uchwyt-meblowy-nyxa-c-128-l-138-zloto-szczotkowane-5902801422737.html
  {"ids":["mat-handle-gtv-nyxa-128-gold"],"ean":"5902801422737","sourceUrl":"https://integra-bielinscy.pl/uchwyty/1613-uchwyt-meblowy-nyxa-c-128-l-138-zloto-szczotkowane-5902801422737.html","imageUrl":"https://integra-bielinscy.pl/2695-home_default/uchwyt-meblowy-nyxa-c-128-l-138-zloto-szczotkowane.jpg"},
  // source: https://www.rabdom.pl/pl/p/Chem-Rozlew-Benzyna-ekstrakcyjna-rozcienczalnik-0%2C5L/316
  {"ids":["mat-extraction-solvent-chem-rozlew-500ml"],"ean":"5906681230253","sourceUrl":"https://www.rabdom.pl/pl/p/Chem-Rozlew-Benzyna-ekstrakcyjna-rozcienczalnik-0%2C5L/316","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_38785_500_500/Benzyna-Ekstrakcyjna-Niskoaromatyczna-0%2C5L-2.webp"},
  // source: https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-0%2C75L/7607
  {"ids":["mat-cabinet-v33-easy-white-750ml"],"ean":"3153895149044","sourceUrl":"https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-0%2C75L/7607","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_56652_500_500/Opakowanie-farby-do-renowacji-mebli-kuchennych%2C-blatow-i-plytek-marki-V33-Renowacja-Kuchnia..webp"},
  // source: https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-2L/7613
  {"ids":["mat-cabinet-v33-easy-white-2000ml"],"ean":"3153895149228","sourceUrl":"https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-2L/7613","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_13354_500_500/Opakowanie-farby-do-renowacji-mebli-kuchennych%2C-blatow-i-plytek-marki-V33-Renowacja-Kuchnia..webp"},
  // source: https://www.prescot.com.pl/pl/p/BATERYJNY-CZUJNIK-TLENKU-WEGLA-CZADU-10-LAT-3V-ORNO/18444
  {"ids":["mat-co-detector-virone-dc11"],"ean":"5908254851223","sourceUrl":"https://www.prescot.com.pl/pl/p/BATERYJNY-CZUJNIK-TLENKU-WEGLA-CZADU-10-LAT-3V-ORNO/18444","imageUrl":"https://www.prescot.com.pl/environment/cache/images/productGfx_62267_500_500/1.jpg"},
  // source: https://sklep.sewera.pl/atlas-plus-podwojna-moc-klej-do-plytek-25kg-p8893
  {"ids":["mat-tile-adhesive-atlas-plus-standard-25kg"],"ean":"5905400488579","sourceUrl":"https://sklep.sewera.pl/atlas-plus-podwojna-moc-klej-do-plytek-25kg-p8893","imageUrl":"https://sklep.sewera.pl/photo/38894/atlas-plus-podwojna-moc-klej-do-plytek-25kg.webp"},
  // source: https://modnalazienka.pl/u117-light-grey-gres-szkl-rekt-mat-598x598-34155
  {"ids":["mat-gres-rekt-paradyz-u117-light-grey-60x60"],"ean":"5904584158285","sourceUrl":"https://modnalazienka.pl/u117-light-grey-gres-szkl-rekt-mat-598x598-34155","imageUrl":"https://modnalazienka.pl/images/thumbnails/paradyz//u117-light-grey-gres-szkl-rekt-mat-598x598.jpg"},
  // source: https://modnalazienka.pl/u117-light-beige-gres-szkl-rekt-mat-598x598-34162
  {"ids":["mat-gres-rekt-paradyz-u117-light-beige-60x60"],"ean":"5904584158247","sourceUrl":"https://modnalazienka.pl/u117-light-beige-gres-szkl-rekt-mat-598x598-34162","imageUrl":"https://modnalazienka.pl/images/thumbnails/paradyz//u117-light-beige-gres-szkl-rekt-mat-598x598.jpg"},

  // source: https://topboden.pl/podklad-pod-panele/aquaprotec-vapour-barrier-energy-saving-flooring-system-folia-paroizolacyjna
  {"ids":["mat-vapor-foil-arbiton-aquaprotec-10m2"],"ean":"5905167875223","sourceUrl":"https://topboden.pl/podklad-pod-panele/aquaprotec-vapour-barrier-energy-saving-flooring-system-folia-paroizolacyjna","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167875223_P_01.webp"},
  // source: https://sklep.sewera.pl/atlas-szop-srodek-do-usuwania-zabrudzen-cementowych-i-wapiennych-1kg-p9798
  {"ids":["mat-grout-cleaner-atlas-szop-1kg"],"ean":"5905400990010","sourceUrl":"https://sklep.sewera.pl/atlas-szop-srodek-do-usuwania-zabrudzen-cementowych-i-wapiennych-1kg-p9798","imageUrl":"https://sklep.sewera.pl/photo/92647/atlas-szop-srodek-do-usuwania-zabrudzen-cementowych-i-wapiennych-1kg.webp"},
  // source: https://bmbtechnologie.pl/grunty-do-tynkowania/srodek-gruntujacy-knauf-grundiermittel-60-15kg.html
  {ids:['mat-plaster-primer-knauf-grundiermittel60-15kg'],ean:'5901793357799',sourceUrl:'https://bmbtechnologie.pl/grunty-do-tynkowania/srodek-gruntujacy-knauf-grundiermittel-60-15kg.html',imageUrl:'https://bmbtechnologie.pl/files/fotom/product-5454.png?ts=1649861303'},
  // source: https://realbud.com/pl/p/Srodek-gruntujacy-KNAUF-Betokontakt-5-kg%2C-grunt-do-powierzchni-betonowych/74052350
  {"ids":["mat-plaster-primer-knauf-betokontakt-5kg"],"ean":"4006379051014","sourceUrl":"https://realbud.com/pl/p/Srodek-gruntujacy-KNAUF-Betokontakt-5-kg%2C-grunt-do-powierzchni-betonowych/74052350","imageUrl":"https://realbud.com/environment/cache/images/productGfx_25859_500_500/9341.png?overlay=1"},
  // source: https://knauf.com/pl-PL/p/produkt/knauf-profix-10681_0120
  // Manufacturer's Profix range photograph. Exact 1000 mm / 50 m variant is
  // identified by EAN below; the merchant image is a coming-soon placeholder.
  {"ids":["mat-plaster-mesh-knauf-profix-50m2"],"ean":"5902367201067","sourceUrl":"https://knauf.com/pl-PL/p/produkt/knauf-profix-10681_0120","identitySourceUrl":"https://realbud.com/pl/p/Siatka-tynkarska-Knauf-PROFIX-szer.-1000-mm-oczko-10x10-mm-50-mb/75057500","imageUrl":"https://media.knauf.com/a/TFdoGC4qvRKYeSJCpxp78W?fit=wrap&fmt=webp&hei=400&wid=632"},
  // source: https://sklep.ehw.com.pl/osprzet-laczeniowy/rawlplug-r-gs-06040-kotwa-do-sufitow-podwieszanych-6x40-mm
  {"ids":["mat-ceiling-anchor-rawlplug-gs-100"],"ean":"5906675169347","sourceUrl":"https://sklep.ehw.com.pl/osprzet-laczeniowy/rawlplug-r-gs-06040-kotwa-do-sufitow-podwieszanych-6x40-mm","imageUrl":"https://sklep.ehw.com.pl/environment/cache/images/productGfx_21763_500_500/858bd3358fa32304143b7a47e27c63b67c2f8593_0904f920e7ad3435db4d6ef5dd9e21e4a1468024_2a57cf4d4f4f771f6aaa3b51711fe54a3e05a012_GS_product__p.webp"},
  // source: https://irbudsklep.pl/produkt/profil-glowny-sufitowy-cd60-3-mb-06/
  {"ids":["mat-profile-cd60-irbud-3m"],"sourceUrl":"https://irbudsklep.pl/produkt/profil-glowny-sufitowy-cd60-3-mb-06/","imageUrl":"https://irbudsklep.pl/wp-content/uploads/2023/11/Zrzut-ekranu-2025-09-05-114945.png"},

  // source: https://hipper.pl/lacznik-krzyzowy-60-x-145-mm-100-szt-norgips-3071669325
  {"ids":["mat-gypsum-cross-norgips-100"],"ean":"5907651696468","sourceUrl":"https://hipper.pl/lacznik-krzyzowy-60-x-145-mm-100-szt-norgips-3071669325","imageUrl":"https://hipper.pl/api/attachment/get/C3095A86-0FCB-46FF-A52A-63855FB53DDB/ImageIdent/csPhotos%7CPhotoMed%7C9794D2D8-F401-4DEA-BF8D-D0FF361306EE%7C1/%C5%81%C4%85cznik%20krzy%C5%BCowy%2060%20x%20145%20mm%20100%20szt.%20Norgips.webp"},
  // source: https://ebardo.pl/pl/p/Lacznik-krzyzowy-GK-do-profil-CD60-100szt-BUDMAT-0%2C8mm/138
  {"ids":["mat-gypsum-cross-budmat-100"],"ean":"5901323043369","sourceUrl":"https://ebardo.pl/pl/p/Lacznik-krzyzowy-GK-do-profil-CD60-100szt-BUDMAT-0%2C8mm/138","imageUrl":"https://ebardo.pl/environment/cache/images/productGfx_2897_500_500/Lacznik-krzyzowy-GK-do-profil-CD60-100szt-BUDMAT-0%2C8mm.jpg"},

  // source: https://ebardo.pl/pl/p/Folia-paroizolacyjna-Ecovil-0%2C2mm-2mx50m-100m2/534
  {"ids":["mat-vapor-foil-conkret-ecovil-p-100m2"],"ean":"5902096431131","sourceUrl":"https://ebardo.pl/pl/p/Folia-paroizolacyjna-Ecovil-0%2C2mm-2mx50m-100m2/534","imageUrl":"https://ebardo.pl/environment/cache/images/productGfx_2142_500_500/Folia-paroizolacyjna-Ecovil-0%2C2mm-2mx50m-100m2.jpg"},

  // source: https://www.mensura.pl/zestaw-do-ukladania-paneli-wolfcraft-6931000
  {"ids":["mat-laminate-kit-wolfcraft-6931000"],"ean":"4006885693104","sourceUrl":"https://www.mensura.pl/zestaw-do-ukladania-paneli-wolfcraft-6931000","imageUrl":"https://www.mensura.pl/environment/cache/images/productGfx_102546_0_0/Zestaw-do-ukladania-paneli-22el.-Wolfcraft-6931000.jpg"},
  // source: https://liderzycen.pl/pl/p/Tasma-aluminiowa-do-laczenia-podkladow-Arbiton-Izo-Floor-Tape-25-m/31334
  {"ids":["mat-underlay-joint-tape-arbiton-izo-25m"],"ean":"5905167698778","sourceUrl":"https://liderzycen.pl/pl/p/Tasma-aluminiowa-do-laczenia-podkladow-Arbiton-Izo-Floor-Tape-25-m/31334","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_51949_500_500/7eb856643e33613605516b295006cacd.jpg"},

  // source: https://hipper.pl/metylan-plyn-do-usuwania-tapet-0-5-l-956213124
  {"ids":["mat-wallpaper-remover-metylan-500ml"],"ean":"9000100222969","sourceUrl":"https://hipper.pl/metylan-plyn-do-usuwania-tapet-0-5-l-956213124","imageUrl":"https://hipper.pl/api/attachment/get/C3095A86-0FCB-46FF-A52A-63855FB53DDB/ImageIdent/csPhotos|PhotoMed|2948D411-51EF-432E-69FC-B6D536F816EC|2/Metylan%20P%C5%82yn%20do%20usuwania%20tapet%200,5%20l.webp"},

  // source: https://buduj24.pl/produkt/14398,koelner-wkret-fs-z-drobnym-gwintem-do-mocowania-plyt-gk-do-blach-3-5x25mm-1000szt-opak
  {"ids":["mat-gk-screws-koelner-fs3525-1000"],"ean":"5906675305127","sourceUrl":"https://buduj24.pl/produkt/14398,koelner-wkret-fs-z-drobnym-gwintem-do-mocowania-plyt-gk-do-blach-3-5x25mm-1000szt-opak","imageUrl":"https://buduj24.pl/files/_product/14398/5906675305127_1.webp"},
  // source: https://sklep-kowalczyk.pl/koelner-wkret-samowiercacy-fosfatowy-tex-3-5x9-5mm-1000-szt-ws-3595.html
  {"ids":["mat-gk-profile-screws-koelner-ws3595-1000"],"ean":"5906675303024","sourceUrl":"https://sklep-kowalczyk.pl/koelner-wkret-samowiercacy-fosfatowy-tex-3-5x9-5mm-1000-szt-ws-3595.html","imageUrl":"https://sklep-kowalczyk.pl/media/catalog/product/cache/d24a34bded6d2df740ef66d66d2112c9/5/9/5906675303024.png"},
  // source: https://sklep-kowalczyk.pl/rawlplug-koelner-kolek-szybkiego-montazu-6x40-z-kolnierzem-200szt-op-fx-06k040.html
  {"ids":["mat-gk-perimeter-koelner-fx06k040-200"],"ean":"5906675107622","sourceUrl":"https://sklep-kowalczyk.pl/rawlplug-koelner-kolek-szybkiego-montazu-6x40-z-kolnierzem-200szt-op-fx-06k040.html","imageUrl":"https://sklep-kowalczyk.pl/media/catalog/product/cache/d24a34bded6d2df740ef66d66d2112c9/5/9/5906675107622.jpg"},

  // source: https://www.leroymerlin.pl/produkty/tasma-papierowa-50mm-75-mb-norgips-43912694.html
  {"ids":["mat-gypsum-paper-norgips-50x75"],"ean":"5907651699933","sourceUrl":"https://www.leroymerlin.pl/produkty/tasma-papierowa-50mm-75-mb-norgips-43912694.html","imageUrl":"https://media.adeo.com/media/2629682/media.jpg"},
  // source: https://sklep.sewera.pl/wieszak-es-6075-prosty-rigips-p13734
  {"ids":["mat-gypsum-hanger-rigips-es6075"],"ean":"5905637101074","sourceUrl":"https://sklep.sewera.pl/wieszak-es-6075-prosty-rigips-p13734","imageUrl":"https://sklep.sewera.pl/photo/25090/wieszak-es-6075-prosty-rigips.webp"},
  // source: https://sklep.sewera.pl/wieszak-es-60125-prosty-rigips-p7413
  {"ids":["mat-gypsum-hanger-rigips-es60125"],"ean":"5905637101081","sourceUrl":"https://sklep.sewera.pl/wieszak-es-60125-prosty-rigips-p7413","imageUrl":"https://sklep.sewera.pl/photo/25075/wieszak-es-60125-prosty-rigips.webp"},
  // source: https://sklep.sewera.pl/tasma-spoinowa-papierowa-50mm-x-75m-rigips-p7448
  {"ids":["mat-gypsum-paper-rigips-50x75"],"ean":"5905637118010","sourceUrl":"https://sklep.sewera.pl/tasma-spoinowa-papierowa-50mm-x-75m-rigips-p7448","imageUrl":"https://sklep.sewera.pl/photo/25025/tasma-spoinowa-papierowa-50mm-x-75m-rigips.webp"},
  // source: https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-50-mm-30-mb-norgips-43912722.html
  {"ids":["mat-gypsum-acoustic-norgips-50x30"],"ean":"5907651698004","sourceUrl":"https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-50-mm-30-mb-norgips-43912722.html","imageUrl":"https://media.adeo.com/media/2631597/media.jpg"},
  // source: https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-50mm-x-30m-rigips-p7445
  {"ids":["mat-gypsum-acoustic-rigips-50x30"],"ean":"5905637113503","sourceUrl":"https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-50mm-x-30m-rigips-p7445","imageUrl":"https://sklep.sewera.pl/photo/191957/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-50mm-x-30m-rigips.webp"},
  // source: https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-30-mm-30-mb-norgips-44420222.html
  {"ids":["mat-gypsum-acoustic-norgips-30x30"],"ean":"5907651698851","sourceUrl":"https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-30-mm-30-mb-norgips-44420222.html","imageUrl":"https://media.adeo.com/media/2629693/media.jpg"},
  // source: https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-30mm-x-30m-rigips-p7444
  {"ids":["mat-gypsum-acoustic-rigips-30x30"],"ean":"5905637148819","sourceUrl":"https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-30mm-x-30m-rigips-p7444","imageUrl":"https://sklep.sewera.pl/photo/191959/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-30mm-x-30m-rigips.webp"},
  // source: https://www.leroymerlin.pl/produkty/profil-scienny-cw50-3-m-b-super-norgips-44604350.html
  {"ids":["mat-profile-cw50-norgips-06-3m-retail"],"ean":"5907651698912","sourceUrl":"https://www.leroymerlin.pl/produkty/profil-scienny-cw50-3-m-b-super-norgips-44604350.html","imageUrl":"https://media.adeo.com/media/3186925/media.png?width=650&height=650&format=jpg&quality=80&fit=bounds"},
  // source: https://www.leroymerlin.pl/produkty/profil-scienny-uw50-3-m-b-super-norgips-45191853.html
  {"ids":["mat-profile-uw50-norgips-super-06-3m"],"ean":"5907651698547","sourceUrl":"https://www.leroymerlin.pl/produkty/profil-scienny-uw50-3-m-b-super-norgips-45191853.html","imageUrl":"https://media.adeo.com/media/3191881/media.png?width=650&height=650&format=jpg&quality=80&fit=bounds"},
  // source: https://www.leroymerlin.pl/produkty/profil-sufitowy-ud30-3-m-b-super-norgips-44604343.html
  {ids:['mat-profile-ud30-norgips-super-c3-3m'],ean:'5907651691197',sourceUrl:'https://www.leroymerlin.pl/produkty/profil-sufitowy-ud30-3-m-b-super-norgips-44604343.html',imageUrl:'https://media.adeo.com/media/3196086/media.png'},
  // source: https://www.castorama.pl/profil-sufitowy-norgips-ud30-0-6-mm-3-mb/5907651698905_CAPL.prd
  {"ids":["mat-profile-ud30-norgips-06-3m"],"ean":"5907651698905","sourceUrl":"https://www.castorama.pl/profil-sufitowy-norgips-ud30-0-6-mm-3-mb/5907651698905_CAPL.prd","imageUrl":"https://media2.castorama.pl/is/image/CastoramaPL/profil-sufitowy-norgips-ud30-0-6-mm-3-mb~5907651698905_03c_CP?$MOB_PREV$&$width=650&$height=650"},
  // source: https://www.leroymerlin.pl/produkty/wieszak-plaski-es-60-75-mm-norgips-43912435.html
  {"ids":["mat-gypsum-hanger-norgips-es6075"],"ean":"5907651699650","sourceUrl":"https://www.leroymerlin.pl/produkty/wieszak-plaski-es-60-75-mm-norgips-43912435.html","imageUrl":"https://media.adeo.com/media/2629673/media.jpg"},
  // source: https://hipper.pl/tasma-flizelinowa-z-wlokna-szklanego-50-mm-norgips-2682507570
  {"ids":["mat-gypsum-fleece-norgips-50x25"],"ean":"5907651699926","sourceUrl":"https://hipper.pl/tasma-flizelinowa-z-wlokna-szklanego-50-mm-norgips-2682507570","imageUrl":"https://hipper.pl/api/attachment/get/C3095A86-0FCB-46FF-A52A-63855FB53DDB/ImageIdent/csPhotos|PhotoMed|1403C532-C046-4095-BC51-32C96B8A2610|1/Ta%C5%9Bma%20flizelinowa%20z%20w%C5%82%C3%B3kna%20szklanego%2050%20mm%20Norgips.webp"},
  // source: https://hipper.pl/lacznik-wzdluzny-60-x-110-mm-1-szt-norgips-2682631077
  {"ids":["mat-gypsum-longitudinal-norgips-cd60"],"ean":"5907651699674","sourceUrl":"https://hipper.pl/lacznik-wzdluzny-60-x-110-mm-1-szt-norgips-2682631077","imageUrl":"https://hipper.pl/api/attachment/get/C3095A86-0FCB-46FF-A52A-63855FB53DDB/ImageIdent/csPhotos|PhotoMed|D09C4503-BAF4-43AE-A75D-C7A89B98C9B0|1/%C5%81%C4%85cznik%20wzd%C5%82u%C5%BCny%20%2060%20x%20110%20mm%201%20szt.%20Norgips.webp"},

  // source: https://marbet24.pl/gladzie/1288-norgips-gotowa-dwufunkcyjna-masa-szpachlowa-start-finish-20-kg-5907651699056.html
  {"ids":["mat-gypsum-norgips-start-finish-20kg"],"ean":"5907651699056","sourceUrl":"https://marbet24.pl/gladzie/1288-norgips-gotowa-dwufunkcyjna-masa-szpachlowa-start-finish-20-kg-5907651699056.html","imageUrl":"https://marbet24.pl/6085-home_default/norgips-gotowa-dwufunkcyjna-masa-szpachlowa-start-finish-20-kg.jpg"},
  // source: https://marbet24.pl/gladzie/1363-norgips-gips-szpachlowy-do-spoinowania-polaczen-plyt-gipsowo-kartonowych-start-25-kg-5907651693818.html
  {"ids":["mat-gypsum-norgips-start-25kg"],"ean":"5907651693818","sourceUrl":"https://marbet24.pl/gladzie/1363-norgips-gips-szpachlowy-do-spoinowania-polaczen-plyt-gipsowo-kartonowych-start-25-kg-5907651693818.html","imageUrl":"https://marbet24.pl/1363-home_default/norgips-gips-szpachlowy-do-spoinowania-polaczen-plyt-gipsowo-kartonowych-start-25-kg.jpg"},
  // source: https://marbet24.pl/plyty-karton-gips/1126-norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2000-mm-5907651690879.html
  {"ids":["mat-gypsum-board-norgips-gkb-a-1200x2000"],"ean":"5907651690879","sourceUrl":"https://marbet24.pl/plyty-karton-gips/1126-norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2000-mm-5907651690879.html","imageUrl":"https://marbet24.pl/1126-home_default/norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2000-mm.jpg"},
  // source: https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-5cm-welna-szklana-p11977
  {"ids":["mat-mineral-wool-isover-akuplyta-50mm"],"ean":"5901644653131","sourceUrl":"https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-5cm-welna-szklana-p11977","imageUrl":"https://sklep.sewera.pl/photo/190047/isover-welna-mineralna-aku-plyta-037-5cm-welna-szklana.webp"},

  // source: https://sklep.sewera.pl/benzyna-ekstrakcyjna-0-5l-anser-p13691 (odczyt 2026-10-27T03:49:02.460Z)
  // source: https://sklep.anser.pl/pl/p/Benzyna-ekstrakcyjna-0%2C5l/502
  {"ids":["mat-extraction-solvent-anser-500ml"],"ean":"5903231606117","sourceUrl":"https://sklep.sewera.pl/benzyna-ekstrakcyjna-0-5l-anser-p13691","imageUrl":"https://sklep.sewera.pl/photo/233476/benzyna-ekstrakcyjna-0-5l-anser.webp"},

  // source: https://lobo.pl/dulux-rapidry-farba-do-drewna-metalu-pcv-mat-bialy-1l (odczyt 2026-10-29T15:34:42.675Z)
  // source: https://packshoty.duluxpolska.pl/wp-content/uploads/karta_techniczna_Dulux-Rapidry.pdf
  {"ids":["mat-frame-dulux-rapidry-white-matt-1l"],"ean":"5904078222379","sourceUrl":"https://lobo.pl/dulux-rapidry-farba-do-drewna-metalu-pcv-mat-bialy-1l","imageUrl":"https://lobo.pl/environment/cache/images/productGfx_130210_500_500/DULUX-RAPIDRY-Farba-do-drewna-metalu-PCV-Mat-Bialy-1-L.webp"},

  // source: https://sklep.sewera.pl/urekor-s-podklad-antykorozyjny-bialy-0-8-l-sniezka-p11955 (odczyt 2026-10-27T03:49:09.079Z)
  // source: https://www.sniezka.pl/produkt/urekor-s-podklad-antykorozyjny
  {"ids":["mat-frame-urekor-s-white-800ml"],"ean":"5903973228790","sourceUrl":"https://sklep.sewera.pl/urekor-s-podklad-antykorozyjny-bialy-0-8-l-sniezka-p11955","imageUrl":"https://sklep.sewera.pl/photo/191092/urekor-s-podklad-antykorozyjny-bialy-0-8-l-sniezka.webp"},

  // source: https://sklep.sewera.pl/grunt-do-drewna-urekor-d-bialy-0-8l-sniezka-p17330 (odczyt 2026-10-27T03:49:07.833Z)
  // source: https://www.sniezka.pl/produkt/urekor-d-grunt-do-drewna
  {"ids":["mat-frame-urekor-d-white-800ml"],"ean":"5903973231684","sourceUrl":"https://sklep.sewera.pl/grunt-do-drewna-urekor-d-bialy-0-8l-sniezka-p17330","imageUrl":"https://sklep.sewera.pl/photo/46745/grunt-do-drewna-urekor-d-bialy-0-8l-sniezka.webp"},

  // source: https://sklep.sewera.pl/supermal-emalia-akrylowa-bialy-a300-polpolysk-0-8l-p13608 (odczyt 2026-10-27T03:49:06.511Z)
  // source: https://www.karty-techniczne.sniezka.pl/pl/%C5%9ANIE%C5%BBKA_SUPERMAL%C2%AE_EMALIA_AKRYLOWA.pdf
  {"ids":["mat-frame-supermal-acrylic-white-semigloss-800ml"],"ean":"5903973232131","sourceUrl":"https://sklep.sewera.pl/supermal-emalia-akrylowa-bialy-a300-polpolysk-0-8l-p13608","imageUrl":"https://sklep.sewera.pl/photo/186834/supermal-emalia-akrylowa-bialy-a300-polpolysk-0-8l.webp"},

  // source: https://www.rabdom.pl/pl/p/Sniezka-Eko-Supermal-Emalia-Akrylowa-0%2C8l-Bialy-Mat-A500/13990 (odczyt 2026-10-27T03:49:03.722Z)
  // source: https://www.karty-techniczne.sniezka.pl/pl/%C5%9ANIE%C5%BBKA_SUPERMAL%C2%AE_EMALIA_AKRYLOWA.pdf
  {"ids":["mat-frame-supermal-acrylic-white-matt-800ml"],"ean":"5903973147756","sourceUrl":"https://www.rabdom.pl/pl/p/Sniezka-Eko-Supermal-Emalia-Akrylowa-0%2C8l-Bialy-Mat-A500/13990","imageUrl":"https://sklep.sewera.pl/photo/186957/sniezka-supermal-emalia-akrylowa-bialy-mat-0-8l.webp"},

  // source: https://sklep.sewera.pl/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin-p22044 (odczyt 2026-10-27T03:06:00.165Z)
  // source: https://www.grupapsb.com.pl/produkt/tasma-antyrysowa-48-mm-x-20-m-blue-dolphin-5907758504369.html
  {"ids":["mat-joint-tape-bluedolphin-fsh-48mm-20m"],"ean":"5907758504369","sourceUrl":"https://sklep.sewera.pl/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin-p22044","imageUrl":"https://sklep.sewera.pl/photo/355803/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin.webp"},

  // source: https://sklep.sewera.pl/papier-scierny-gr-40-arkusz-230x280mm-p6904 (odczyt 2026-10-29)
  {"ids":["mat-hand-paper-klingspor-pl28c-p40"],"ean":"5907560018009","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-40-arkusz-230x280mm-p6904","imageUrl":"https://sklep.sewera.pl/photo/56983/papier-scierny-gr-40-arkusz-230x280mm.webp"},

  // source: https://sklep.sewera.pl/papier-scierny-gr-60-arkusz-230x280mm-p6905 (odczyt 2026-10-29)
  {"ids":["mat-hand-paper-klingspor-pl28c-p60"],"ean":"4014855194896","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-60-arkusz-230x280mm-p6905","imageUrl":"https://sklep.sewera.pl/photo/56985/papier-scierny-gr-60-arkusz-230x280mm.webp"},

  // source: https://sklep.sewera.pl/papier-scierny-gr-80-arkusz-230x280mm-p6906 (odczyt 2026-10-29)
  {"ids":["mat-hand-paper-klingspor-pl28c-p80"],"ean":"5907560017637","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-80-arkusz-230x280mm-p6906","imageUrl":"https://sklep.sewera.pl/photo/56987/papier-scierny-gr-80-arkusz-230x280mm.webp"},

  // source: https://sklep.sewera.pl/papier-scierny-gr-100-arkusz-230x280mm-p6898 (odczyt 2026-10-29)
  {"ids":["mat-hand-paper-klingspor-pl28c-p100"],"ean":"5907560023546","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-100-arkusz-230x280mm-p6898","imageUrl":"https://sklep.sewera.pl/photo/56969/papier-scierny-gr-100-arkusz-230x280mm.webp"},

  // source: https://sklep.sewera.pl/papier-scierny-gr-240-arkusz-230x280mm-p6903 (odczyt 2026-10-27T03:05:58.657Z)
  // source: https://www.klingspor.pl/produkty/arkusze-scierne/pl-28-c
  {"ids":["mat-hand-paper-klingspor-pl28c-p240"],"ean":"5907560039820","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-240-arkusz-230x280mm-p6903","imageUrl":"https://sklep.sewera.pl/photo/56979/papier-scierny-gr-240-arkusz-230x280mm.webp"},

  // source: https://sklep.sewera.pl/papier-scierny-gr-150-arkusz-230x280mm-p6900 (odczyt 2026-10-27T03:05:57.067Z)
  // source: https://www.klingspor.pl/produkty/arkusze-scierne/pl-28-c
  {"ids":["mat-hand-paper-klingspor-pl28c-p150"],"ean":"5907560023553","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-150-arkusz-230x280mm-p6900","imageUrl":"https://sklep.sewera.pl/photo/56973/papier-scierny-gr-150-arkusz-230x280mm.webp"},

  // source: https://sklep.sewera.pl/papier-scierny-gr-180-arkusz-230x280mm-p6901
  {"ids":["mat-hand-paper-klingspor-pl28c-p180"],"ean":"5907560023560","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-180-arkusz-230x280mm-p6901","imageUrl":"https://sklep.sewera.pl/photo/56975/papier-scierny-gr-180-arkusz-230x280mm.webp"},

  // source: https://sklep.sewera.pl/papier-scierny-gr-220-arkusz-230x280mm-p6902
  {"ids":["mat-hand-paper-klingspor-pl28c-p220"],"ean":"5907560027483","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-220-arkusz-230x280mm-p6902","imageUrl":"https://sklep.sewera.pl/photo/56977/papier-scierny-gr-220-arkusz-230x280mm.webp"},

  // source: https://sklep.sewera.pl/papier-scierny-gr-120-arkusz-230x280mm-p6899 (odczyt 2026-10-27T03:05:55.534Z)
  // source: https://www.klingspor.pl/produkty/arkusze-scierne/pl-28-c
  {"ids":["mat-hand-paper-klingspor-pl28c-p120"],"ean":"5907560017644","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-120-arkusz-230x280mm-p6899","imageUrl":"https://sklep.sewera.pl/photo/56971/papier-scierny-gr-120-arkusz-230x280mm.webp"},

  // source: https://sklep.sewera.pl/acryl-putz-st10-start-gladz-szpachlowa-sypka-5kg-p13308 (odczyt 2026-10-27T03:05:54.013Z)
  // source: https://www.acrylputz.pl/produkty/gladzie-sypkie/acrylputz-st10-start
  {"ids":["mat-skim-coat-acrylputz-st10-5kg"],"ean":"5903973104414","sourceUrl":"https://sklep.sewera.pl/acryl-putz-st10-start-gladz-szpachlowa-sypka-5kg-p13308","imageUrl":"https://sklep.sewera.pl/photo/34284/acryl-putz-st10-start-gladz-szpachlowa-sypka-5kg.webp"},

  // source: https://realbud.com/pl/p/SOUDAL-SILIKON-SANITARNY-KUCHNIA-LAZIENKA-PLESN-STOP-BIALY-280ml/75056922 (odczyt 2026-10-27T02:28:35.964Z)
  // source: https://www.soudal.pl/diy/produkty/masy-uszczelniajace/silikony/silikon-sanitarny-stop
  {"ids":["mat-sanitary-silicone-soudal-stop-white-280ml"],"ean":"5411183200326","sourceUrl":"https://realbud.com/pl/p/SOUDAL-SILIKON-SANITARNY-KUCHNIA-LAZIENKA-PLESN-STOP-BIALY-280ml/75056922","imageUrl":"https://realbud.com/environment/cache/images/productGfx_23109_500_500/5daa6a798ad6adc9e8224e3b5a646bb7.jpg"},

  // source: https://www.rabdom.pl/pl/p/SOUDAL-SRODEK-DO-USUWANIA-SILIKONU-100ml/12481 (odczyt 2026-10-27T02:28:35.602Z)
  // source: https://www.soudal.pl/diy/produkty/pistolety-i-materialy-pomocnicze/srodki-czyszczace/silicone-remover
  {"ids":["mat-silicone-remover-soudal-100ml"],"ean":"5411183041899","sourceUrl":"https://www.rabdom.pl/pl/p/SOUDAL-SRODEK-DO-USUWANIA-SILIKONU-100ml/12481","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_24083_500_500/full_srodek-do-usuwania-silikonu-1366719941.webp"},

  // source: https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282 (odczyt 2026-10-27T01:34:02.370Z)
  // source: https://tape.pl/marki/31-goldflex
  {"ids":["mat-edge-tape-packcenter-tb-fb00202-50m"],"sourceUrl":"https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282","imageUrl":"https://sklep.sewera.pl/photo/364366/tasma-dylatacyjna-5mm-x-10cm-x-50m.webp"},

  // source: https://www.rabdom.pl/pl/p/Mapei-Kerapoxy-Easy-Design-Uniwersalna-fuga-epoksydowa-3kg-Bialy-100/14527
  {ids:['mat-epoxy-grout-mapei-kerapoxy-easy-100-3kg'],ean:'8022452132940',sourceUrl:'https://www.rabdom.pl/pl/p/Mapei-Kerapoxy-Easy-Design-Uniwersalna-fuga-epoksydowa-3kg-Bialy-100/14527',imageUrl:'https://www.rabdom.pl/environment/cache/images/productGfx_35202_500_500/Opakowanie-fugi-Mapei-o-gramaturze-3-kg..webp'},
  // source: https://sklep.sewera.pl/atlas-plus-klej-do-plytek-bialy-25kg-p8896
  {ids:['mat-white-adhesive-atlas-plus-25kg'],ean:'5905400313390',sourceUrl:'https://sklep.sewera.pl/atlas-plus-klej-do-plytek-bialy-25kg-p8896',imageUrl:'https://sklep.sewera.pl/photo/38873/atlas-plus-klej-do-plytek-bialy-25kg.webp'},
  // source: https://sklep.sewera.pl/krzyzyki-dystansowe-3mm-150szt--p12505
  // source: https://mrowka.com.pl/produkt/krzyzyki-dystansowe-3-mm-150-szt-hardy-5905061016869.html (dokładny EAN; zdjęcie woreczka zamiast poglądowego wiaderka Sewery)
  { ids: ['mat-tile-spacers-hardy-3mm-150'], ean: '5905061016869', sourceUrl: 'https://mrowka.com.pl/produkt/krzyzyki-dystansowe-3-mm-150-szt-hardy-5905061016869.html', identitySourceUrl: 'https://sklep.sewera.pl/krzyzyki-dystansowe-3mm-150szt--p12505', imageUrl: 'https://mrowka.com.pl/files/InfoverProduct/81/p5gn80h9kaf0/Photos/gscr9mv0mn1if4/ShowWebp_krzyzyki-dystansowe-3-mm---150-szt--hardy_1.webp' },
  // source: https://sklep.sewera.pl/krzyzyki-dystansowe-4mm-100szt--p12506
  // source: https://www.plus-market.pl/pl/p/Krzyzyki-4mm-op.-100szt/15198 (dokładny EAN; etykieta Hardy 4 mm / 100 sztuk)
  { ids: ['mat-tile-spacers-hardy-4mm-100'], ean: '5905061016876', sourceUrl: 'https://www.plus-market.pl/pl/p/Krzyzyki-4mm-op.-100szt/15198', identitySourceUrl: 'https://sklep.sewera.pl/krzyzyki-dystansowe-4mm-100szt--p12506', imageUrl: 'https://www.plus-market.pl/environment/cache/images/productGfx_34005_500_500/2026-01-08_14h41_57.webp' },
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
  // source: https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Arilla-Light-Grey-2%2C5-m2/33716
  {ids:['mat-vinyl-spc-click-goodhome-arilla-light-grey-25m2'],ean:'5059340969732',sourceUrl:'https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Arilla-Light-Grey-2%2C5-m2/33716',imageUrl:'https://liderzycen.pl/environment/cache/images/productGfx_54664_500_500/fa1b6a4d34e9c8cf4c71603939ea436e.jpg'},
  // source: https://www.castorama.pl/panele-laminowane-oakland-wodoodporne-ac4-2-51-m2/5063022887917_CAPL.prd
  {"ids":["mat-laminate-oakland-ac4"],"ean":"5063022887917","sourceUrl":"https://liderzycen.pl/pl/p/Panele-laminowane-Oakland-wodoodporne-AC4-2%2C51-m2/185472","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_385924_500_500/0fc09fb9f3eda5be184e7dac0f2f6e76.jpg"},
  // source: https://www.castorama.pl/klej-do-wykladzin-soudal-26a-5-kg/5411183028395_CAPL.prd
  {"ids":["mat-vinyl-adhesive-soudal-26a-5kg"],"ean":"5411183028395","sourceUrl":"https://chemiadoparkietu25.pl/product-pol-25914-Soudal-26A-klej-do-wykladzin-PCV-winylu-linoleum-dywanowych-5-kg.html","imageUrl":"https://static4.chemiadoparkietu25.pl/hpeciai/a7dc9f49d405f407703b43555fa6c8c2/pol_pl_Soudal-26A-klej-do-wykladzin-PCV-winylu-linoleum-dywanowych-5-kg-25914_2.png"},
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
  // source: https://liderzycen.pl/pl/p/Tynk-gipsowy-reczny-Knauf-Goldband-25-kg/55390
  {"ids":["mat-plaster-gypsum-manual-knauf-goldband-25kg"],"ean":"5902367206383","sourceUrl":"https://liderzycen.pl/pl/p/Tynk-gipsowy-reczny-Knauf-Goldband-25-kg/55390","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_77582_0_0/32464cdd129db9bfb699808dae441565.webp"},
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
  // source: https://arbiton.com/sv/laminatunderlag/arbiton-secura-thermo-aquastop-smart-laminatunderlag
  {"ids":["mat-underlay-arbiton-xps-aquastop-6m2"],"ean":"5905167826942","sourceUrl":"https://arbiton.com/sv/laminatunderlag/arbiton-secura-thermo-aquastop-smart-laminatunderlag","identitySourceUrl":"https://dekoratormarket.pl/arbiton-secura-thermo-aquastop-smart-podklad-pod-panele-6m2-p-1367.html","imageUrl":"https://photos.arbiton.com/media/cache/gallery2/photos/5905167826942_I_02.png"},
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
  // source: https://sklep.instato.pl/pl/p/SYFON-UMYWALKOWY-BARDZO-NISKI-MALY-MEMBRANOWY-oszczedzajacy-miejsce-WHB1-32/23062689
  {"ids":["mat-basin-trap-mcalpine-whb1-32"],"ean":"5036484088390","sourceUrl":"https://sklep.instato.pl/pl/p/SYFON-UMYWALKOWY-BARDZO-NISKI-MALY-MEMBRANOWY-oszczedzajacy-miejsce-WHB1-32/23062689","imageUrl":"https://sklep.instato.pl/environment/cache/images/productGfx_5082_500_500/5036484088390_syfon_umywalkowy_niski_bialy_WHB1-322.jpg"},
  // source: https://mrowka.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html
  {"ids":["mat-pex-elbow-tycner-16x16"],"ean":"5901095521003","sourceUrl":"https://mrowka.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html","imageUrl":"https://mrowka.com.pl/files/InfoverProduct/vu/t7atm0ht029g/Photos/cumrci10no4fac/ShowWebp_kolanko-zaciskowe-pex-16x16-mm-tycner_1.webp"},
  // source: https://www.grupapsb.com.pl/produkt/umywalka-facile-50-cm-cersanit-5907720650025.html
  {"ids":["mat-washbasin-cersanit-facile-50"],"ean":"5907720650025","sourceUrl":"https://www.grupapsb.com.pl/produkt/umywalka-facile-50-cm-cersanit-5907720650025.html","imageUrl":"https://pliki.grupapsb.com.pl/files/InfoverProduct/h1/ej7ro0igtlm8/Photos/lm63o5p0lldq4u/Body_umywalka-facile-50-cm-cersanit_1.jpg"},
  // source: https://www.unimet.pl/pozostale-18/3744291-zestaw-przylaczeniowo-mocujacy-wc-5901095514395.html
  {"ids":["mat-wc-mounting-set-tycner"],"ean":"5901095514395","sourceUrl":"https://www.unimet.pl/pozostale-18/3744291-zestaw-przylaczeniowo-mocujacy-wc-5901095514395.html","imageUrl":"https://www.unimet.pl/2023449-large_default/zestaw-przylaczeniowo-mocujacy-wc.webp"},
  // exact EAN: https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/
  // current product photograph: https://patiartstudio.pl/produkt/paradyz-nati-bianco-sciana-struktura-25x40-ss-250x400-1-nati-bi/
  {"ids":["mat-tile-wall-paradyz-nati-bianco-25x40"],"ean":"5902610507960","sourceUrl":"https://patiartstudio.pl/produkt/paradyz-nati-bianco-sciana-struktura-25x40-ss-250x400-1-nati-bi/","imageUrl":"https://patiartstudio.pl/wp-content/uploads/2022/09/NATI_-Bianco_sciana_struktura_250x400.jpg"},
  // source: https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m
  {"ids":["mat-tile-trim-cezar-corner-8mm-25m"],"ean":"5904584853500","sourceUrl":"https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m","imageUrl":"https://cezar.eu/cdn/shop/files/f3af291d90963eeb125a6e5cb54a3887_9d9ddc5e-8cc3-42ba-b7e6-bd37c74886eb.png?v=1791543548&width=1200"},
  // source: https://www.blu.com.pl/plytki-uniwersalne/34276-ceramika-paradyz-u117-grey-gres-szkl-rekt-mat-5904584158261.html?url=plytki-podlogowe%2F34276-ceramika-paradyz-u117-grey-gres-szkl-rekt-mat-5904584158261
  {"ids":["mat-gres-rekt-paradyz-u117-grey-60x60"],"ean":"5904584158261","sourceUrl":"https://modnalazienka.pl/u117-grey-gres-szkl-rekt-mat-598x598-34158","imageUrl":"https://modnalazienka.pl/images/thumbnails/paradyz//u117-grey-gres-szkl-rekt-mat-598x598.jpg"},
  // source: https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html
  {"ids":["mat-window-tape-soudal-sws-inside-90mm"],"ean":"5411183151178","sourceUrl":"https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html","imageUrl":"https://izosystems.pl/10544-large_default/Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.jpg"},
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
  // source: https://lobo.pl/sniezka-grunt-ekspresowy-gleboko-penetrujacy-5l
  {"ids":["mat-primer-deep-sniezka-express-5l"],"ean":"5903973228905","sourceUrl":"https://lobo.pl/sniezka-grunt-ekspresowy-gleboko-penetrujacy-5l","imageUrl":"https://lobo.pl/environment/cache/images/productGfx_138567_500_500/SNIEZKA-Grunt-Ekspresowy-gleboko-penetrujacy-5L.webp"},
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
  // source: https://parotec.pl/product-pol-18078-Folia-paroizolacyjna-zolta-CONPAR-0-2-mm-T30.html (dokładny EAN 5902096430103, niezależne źródło zdjęcia)
  { ids: ['mat-vapor-foil-conkret-conpar-100m2'], ean: '5902096430103',
    // Manufacturer's yellow Conpar roll illustration; exact dimensions/tolerance come from the SKU record.
    sourceUrl: 'https://conkret.com.pl/conkret-products/folia-budowlana-conpar/',
    identitySourceUrl: 'https://folnet.pl/pl/products/paroizolacje-i-hydroizolacje/folie-paroizolacyjne/folie-paroizolacyjne-z-polietylenu-pe/folia-paroizolacyjna-zolta-conpar-0-20-mm-10288.html',
    imageUrl: 'https://conkret.com.pl/wp-content/uploads/2022/05/Conpar-148mm-nowy.png' },
  // source: https://lobo.pl/soudal-akryl-do-plyt-g-k-280ml-bialy
  { ids: ['mat-acrylic-soudal-gk-white-280ml'], ean: '5411183157248',
    sourceUrl: 'https://lobo.pl/soudal-akryl-do-plyt-g-k-280ml-bialy',
    imageUrl: 'https://lobo.pl/environment/cache/images/productGfx_71158_500_500/SOUDAL-Akryl-do-plyt-G-K-280ml-bialy.webp' },
  { ids: ['mat-door-leaf-opp-archi-full-80-left'], ean: '5063022524263',
    sourceUrl: 'https://www.castorama.pl/drzwi-pelne-opp-archi-80-lewe-biale/5063022524263_CAPL.prd',
    imageUrl: 'https://media2.castorama.pl/is/image/CastoramaPL/drzwi-pelne-opp-archi-80-lewe-biale~5063022524263_02c?$MOB_PREV$&$width=600&$height=600' },
  // source: https://www.mlazienka.pl/umywalka-505x40-cm-polokragla-scienna-bialy-polysk-k36031-cersanit-ovida-785642.html
  { ids: ['mat-washbasin-cersanit-atlantic-new-50'], ean: '5901771226987',
    sourceUrl: 'https://www.mlazienka.pl/umywalka-505x40-cm-polokragla-scienna-bialy-polysk-k36031-cersanit-ovida-785642.html',
    imageUrl: 'https://static.mlazienka.pl/files/produkty/cache/400x400/producers/crs/zle/k36031_6f13aa54.jpg' },
  // source: https://www.castorama.pl/glazura-tamara-25-x-40-cm-white-1-5-m2/5907518303911_CAPL.prd
  { ids: ['mat-tile-wall-tamara-white-25x40'], ean: '5907518303911',
    sourceUrl: 'https://www.castorama.pl/glazura-tamara-25-x-40-cm-white-1-5-m2/5907518303911_CAPL.prd',
    imageUrl: 'https://media2.castorama.pl/is/image/CastoramaPL/glazura-tamara-25-x-40-cm-white-1-5-m2~5907518303911_02c_PL_CP?$MOB_PREV$&$width=600&$height=600' },
  // source: https://www.fischer-si.si/sl-si/products/sanitary-fixings/ceramic-wash-basins-urinals-and-sanitary-installations/wash-basin-fixing-wst/45494-wst-10-x-140-k-nv
  { ids: ['mat-basin-fixings-fischer-wst140k-2'], ean: '8590369454948',
    sourceUrl: 'https://www.fischer-si.si/sl-si/products/sanitary-fixings/ceramic-wash-basins-urinals-and-sanitary-installations/wash-basin-fixing-wst/45494-wst-10-x-140-k-nv',
    imageUrl: 'https://media.fischer.group/v7/_pim-media-prod_/Product%20Pictures/Product%20Pictures%20fischer/W1_P_P_WST001_F_SALL_AQQ_V4.jpg?w=1000&h=1000&func=fit&bg_colour=white' },
  // source: https://sklep.sewera.pl/sniezka-grunt-5l-p6153
  {"ids":["mat-paint-undercoat-sniezka-grunt-5l"],"ean":"5903973000235","sourceUrl":"https://sklep.sewera.pl/sniezka-grunt-5l-p6153","imageUrl":"https://sklep.sewera.pl/photo/72152/sniezka-grunt-5l.webp"},

  // source: https://swiatsieklei.pl/pl/p/METYLAN-Direct-200g-klej-do-tapet-24119/104
  {"ids":["mat-wallpaper-adhesive-metylan-direct-200g"],"ean":"4015000402019","sourceUrl":"https://swiatsieklei.pl/pl/p/METYLAN-Direct-200g-klej-do-tapet-24119/104","imageUrl":"https://swiatsieklei.pl/environment/cache/images/productGfx_8cf3f0b127670f2cfdd5620ec59b3e3e_500_500.webp"},
  // source: https://swiatsieklei.pl/pl/p/METYLAN-Normal-125g-klej-do-tapet-24122/101
  {"ids":["mat-wallpaper-adhesive-metylan-normal-125g"],"ean":"4015000095266","sourceUrl":"https://swiatsieklei.pl/pl/p/METYLAN-Normal-125g-klej-do-tapet-24122/101","imageUrl":"https://swiatsieklei.pl/environment/cache/images/productGfx_a44f7b5fc0ca152dba8e53e1ccae43fa_500_500.webp"},
  // source: https://plejadatapet.pl/pl/p/Gladka-tapeta-flizelinowa-150gm2-25m-0%2C75m-3333-5-Erismann-RollOver/23972
  // source: https://www.erismann.de/en/collection/rollover-27
  {"ids":["mat-wallpaper-erismann-rollover-3333-5"],"ean":"4002790333357","sourceUrl":"https://plejadatapet.pl/pl/p/Gladka-tapeta-flizelinowa-150gm2-25m-0%2C75m-3333-5-Erismann-RollOver/23972","imageUrl":"https://plejadatapet.pl/environment/cache/images/productGfx_92091_500_500/Gladka-tapeta-flizelinowa-150gm2-25m--0%2C75m-3333-5-Erismann-RollOver.jpg"},
  // source: https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-5kg/131
  {"ids":["mat-mapegum-wps-5kg"],"ean":"8022452002113","sourceUrl":"https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-5kg/131","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_10363_500_500/Mapei-Mapegum-WPS-folia-w-plynie-5kg.png"},
  // source: https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-10kg/419
  {"ids":["mat-mapegum-wps-10kg"],"ean":"8022452002120","sourceUrl":"https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-10kg/419","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_10364_500_500/Mapei-Mapegum-WPS-folia-w-plynie-10kg.png"},
  // source: https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-20kg-folia-w-plynie/3543
  {"ids":["mat-mapegum-wps-20kg"],"ean":"8022452242502","sourceUrl":"https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-20kg-folia-w-plynie/3543","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_10095_500_500/Mapei-Mapegum-WPS-folia-w-plynie-20kg.jpg"},
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-10mb-Tasma-uszczelniajaca%2C-rolka/3088
  {"ids":["mat-mapeband-w-10m"],"ean":"8022452113932","sourceUrl":"https://winbud24.pl/pl/p/Mapei-Mapeband-W-10mb-Tasma-uszczelniajaca%2C-rolka/3088","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_445089b9b7c9b68ab49588317e73e9ce_500_500.jpg"},
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-mankiet-uszczelniajacy-300-x-300mm%2C-podlogowy/3091
  {"ids":["mat-mapeband-w-floor-300"],"ean":"8022452113895","sourceUrl":"https://winbud24.pl/pl/p/Mapei-Mapeband-W-mankiet-uszczelniajacy-300-x-300mm%2C-podlogowy/3091","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_19e0623a7a479d85b5c509f0f7dd6f7e_500_500.jpg"},
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-1l-KONCENTRAT-GRUNTUJACY-GRUNT/10970
  {"ids":["mat-primer-g-pro-1l"],"ean":"8022452241123","sourceUrl":"https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-1l-KONCENTRAT-GRUNTUJACY-GRUNT/10970","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_19574_500_500/4_primer-g-pro_1l_pl_2c7d4435f6894c59b7f19830a10992cc.webp"},
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-5l-KONCENTRAT-GRUNTUJACY-GRUNT/10969
  {"ids":["mat-primer-g-pro-5l"],"ean":"8022452241130","sourceUrl":"https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-5l-KONCENTRAT-GRUNTUJACY-GRUNT/10969","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_19572_500_500/4_primer-g-pro_5l_pl_ea1ad0866a074cc2a5352b1844b10324.webp"},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-naroznik-wewnetrzny-bialy-polysk-01-opakowanie-foliowe
  {"ids":["mat-indo-inside-gloss-2"],"ean":"5905167726037","sourceUrl":"https://topboden.pl/listwy-przypodlogowe/indo-naroznik-wewnetrzny-bialy-polysk-01-opakowanie-foliowe","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167726037_P_01.webp"},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-naroznik-zewnetrzny-bialy-polysk-01-opakowanie-foliowe
  {"ids":["mat-indo-outside-gloss-2"],"ean":"5905167726198","sourceUrl":"https://topboden.pl/listwy-przypodlogowe/indo-naroznik-zewnetrzny-bialy-polysk-01-opakowanie-foliowe","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167726198_P_02.webp"},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-lacznik-bialy-polysk-01-opakowanie-foliowe
  {"ids":["mat-indo-connector-gloss-2"],"ean":"5905167725870","sourceUrl":"https://topboden.pl/listwy-przypodlogowe/indo-lacznik-bialy-polysk-01-opakowanie-foliowe","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167725870_P_01.webp"},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-zakonczenie-prawe-lewe-bialy-polysk-01-opakowanie-foliowe
  {"ids":["mat-indo-endcaps-gloss-pair"],"ean":"5905167726358","sourceUrl":"https://topboden.pl/listwy-przypodlogowe/indo-zakonczenie-prawe-lewe-bialy-polysk-01-opakowanie-foliowe","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167726358_P_03.webp"},
  // source: https://topboden.pl/listwy-przypodlogowe/klej-montazowy-strongman-300ml
  // source: https://arbiton.com/pl/klej-montazowy-strongman-300ml
  {"ids":["mat-strongman-300ml"],"ean":"5905167788264","sourceUrl":"https://topboden.pl/listwy-przypodlogowe/klej-montazowy-strongman-300ml","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167788264_I_01.webp"},
  // source: https://tgs.pl/pl/p/Cersanit-Carina-deska-wc-duroplastowa/12739
  {"ids":["mat-seat-cersanit-carina-standard"],"ean":"5907720651077","sourceUrl":"https://tgs.pl/pl/p/Cersanit-Carina-deska-wc-duroplastowa/12739","imageUrl":"https://tgs.pl/environment/cache/images/productGfx_112917_500_500/Cersanit-Carina-deska-wc-duroplastowa.jpg"},
  // source: https://tgs.pl/pl/p/Cersanit-Carina-deska-wolnoopadajaca-z-latwym-wypinaniem/4896
  {"ids":["mat-seat-cersanit-carina-softclose"],"ean":"5907720651084","sourceUrl":"https://tgs.pl/pl/p/Cersanit-Carina-deska-wolnoopadajaca-z-latwym-wypinaniem/4896","imageUrl":"https://tgs.pl/environment/cache/images/productGfx_112712_500_500/Cersanit-Carina-deska-wolnoopadajaca-z-latwym-wypinaniem..jpg"},
  // source: https://tgs.pl/pl/p/Cersanit-Carina-deska-wc-slim-antybakteryjna%2Cwolnoopadajaca%2Clatwe-wypinanie%2Cduroplastowa/12740
  {"ids":["mat-seat-cersanit-carina-slim"],"ean":"5902115712524","sourceUrl":"https://tgs.pl/pl/p/Cersanit-Carina-deska-wc-slim-antybakteryjna%2Cwolnoopadajaca%2Clatwe-wypinanie%2Cduroplastowa/12740","imageUrl":"https://tgs.pl/environment/cache/images/productGfx_112916_500_500/a%2Cwolnoopadajaca%2Clatwe-wypinanie%2Cduroplastowa.jpg"},
];

export function getProductPhoto(product: {
  id?: string; ean?: string | null; imageUrl?: string | null; sourceUrl?: string;
  shopPrices?: readonly { url: string }[];
}): string | undefined {
  const urls = [product.sourceUrl, ...product.shopPrices?.map(price => price.url) ?? []];
  // Prefer the reviewed catalogue image for an exact identity. Some shop
  // domains serve prices correctly on the backend but time out on the device.
  const reviewed = PRODUCT_PHOTOS.find(photo =>
    (product.id && (photo.ids.includes(product.id) || photo.ean && product.id === `remont-${photo.ean}`)) ||
    (product.ean && photo.ean === product.ean) || urls.includes(photo.sourceUrl),
  )?.imageUrl;
  return reviewed ?? (product.imageUrl?.startsWith('https://') ? product.imageUrl : undefined);
}
