import type { MaterialPriceReference } from '@/types/pricing';

export const MATERIAL_PRICES: readonly MaterialPriceReference[] = [
  // source: https://kim24.pl/Srodek-do-usuwania-zabrudzen-cementowych-i-wapiennych-Atlas-Szop-1-Kg
  // source: https://www.atlas.com.pl/wp-content/uploads/2026/08/atlas_szop_plik_karta-techniczna.pdf
  {"id":"mat-grout-cleaner-atlas-szop-1kg","materialType":"grout-cleaner","productLabel":"Atlas SZOP — środek do pozostałości cementowych, 1 kg","brand":"Atlas","packageSize":1,"packageUnit":"kg","pricePerPackage":15,"category":"standard","storeName":"KIM24","sourceUrl":"https://kim24.pl/Srodek-do-usuwania-zabrudzen-cementowych-i-wapiennych-Atlas-Szop-1-Kg","lastUpdated":"2026-10-29","currency":"PLN","notes":"EAN 5905400990010. Butelka 1 kg, nie litr. Preparat zawiera kwas; tylko powierzchnie odporne na kwasy, po próbie w mało widocznym miejscu i z rozcieńczeniem dobranym według karty. Może wymyć lub przebarwić cementową fugę; długi kontakt z kwasem osłabia jej hydrofobowość. Nie stosować automatycznie po 24 godzinach. Zużycie zależy od zabrudzeń; liczbę butelek podaje użytkownik po ocenie. Świeżą fugę Atlas czyść wodą według jej karty."},
  // source: https://bmbtechnologie.pl/grunty-do-tynkowania/srodek-gruntujacy-knauf-grundiermittel-60-15kg.html
  // source: https://knauf.com/api/download-center/v1/assets/7639fea2-44c7-4c59-b464-b436316de77a?country=pl&download=true
  {id:'mat-plaster-primer-knauf-grundiermittel60-15kg',materialType:'plaster-primer',productLabel:'Knauf Grundiermittel 60 — koncentrat gruntujący 15 kg',brand:'Knauf',packageSize:15,packageUnit:'kg',pricePerPackage:198.99,category:'standard',storeName:'BMB Technologie',sourceUrl:'https://bmbtechnologie.pl/grunty-do-tynkowania/srodek-gruntujacy-knauf-grundiermittel-60-15kg.html',lastUpdated:'2026-10-28',currency:'PLN',notes:'EAN 5901793357799. Wiadro 15 kg koncentratu do chłonnych podłoży mineralnych wewnątrz pod tynk gipsowy Knauf. Karta 08/2026: ok. 400–450 m² z wiadra przy rozcieńczeniu 1:2 (45 l mieszanki). Kalkulator przyjmuje 400 m² jako założenie zakupowe przed zapasem; skoryguj po próbie na podłożu. Rozcieńczenie dobierz do chłonności. Minimum 12 h schnięcia przy 20°C i 50% wilgotności; chłód i wilgoć wydłużają czas. Nie stosujemy automatycznie do Baumit.'},
  // source: https://realbud.com/pl/p/Srodek-gruntujacy-KNAUF-Betokontakt-5-kg%2C-grunt-do-powierzchni-betonowych/74052350
  // source: https://knauf.com/pl-PL/p/produkt/knauf-betokontakt-10251_0120
  {"id":"mat-plaster-primer-knauf-betokontakt-5kg","materialType":"plaster-primer","productLabel":"Knauf Betokontakt — grunt sczepny 5 kg","brand":"Knauf","packageSize":5,"packageUnit":"kg","pricePerPackage":66.79,"category":"standard","storeName":"Realbud","sourceUrl":"https://realbud.com/pl/p/Srodek-gruntujacy-KNAUF-Betokontakt-5-kg%2C-grunt-do-powierzchni-betonowych/74052350","lastUpdated":"2026-10-28","currency":"PLN","notes":"Wiadro 5 kg. Do gładkiego, niechłonnego betonu pod tynki gipsowe Knauf; zużycie orientacyjne 0,225 kg/m². Schnięcie minimum 12 godzin w warunkach karty produktu. Do chłonnego muru i innych systemów dobierz przygotowanie osobno. EAN 4006379051014."},
  // source: https://realbud.com/pl/p/Siatka-tynkarska-Knauf-PROFIX-szer.-1000-mm-oczko-10x10-mm-50-mb/75057500
  // source: https://knauf.com/pl-PL/p/produkt/knauf-profix-10681_0120
  {"id":"mat-plaster-mesh-knauf-profix-50m2","materialType":"plaster-mesh","productLabel":"Siatka tynkarska Knauf Profix 100 cm × 50 m (50 m²)","brand":"Knauf","packageSize":50,"packageUnit":"m2","pricePerPackage":227,"category":"standard","storeName":"Realbud","sourceUrl":"https://realbud.com/pl/p/Siatka-tynkarska-Knauf-PROFIX-szer.-1000-mm-oczko-10x10-mm-50-mb/75057500","lastUpdated":"2026-10-28","currency":"PLN","notes":"Jedna rolka 1 × 50 m = 50 m², oczko 10 × 10 mm, gramatura 110 g/m². Aktualna karta Knauf: tynki gipsowe wewnątrz. Zakłady 10 cm i wyjście poza styk minimum 10 cm na każdą stronę; zużycie zakupowe 1,1 m²/m² zbrojenia. Przy zbrojeniu tynk Knauf musi mieć minimum 15 mm. Cena całej rolki. EAN 5902367201067."},
  // source: https://www.leroymerlin.pl/produkty/profil-sufitowy-ud30-3-m-b-super-norgips-44604343.html
  // source: https://norgips.pl/produkty/profil-ud-30-super-o-gr-blachy-06-mm-c3-26.html
  {id:'mat-profile-ud30-norgips-super-c3-3m',materialType:'drywall-accessory',productLabel:'Profil Norgips UD 30 SUPER C3, 0,6 mm, 3 m (EAN 1197)',brand:'Norgips',packageSize:3,packageUnit:'mb',pricePerPackage:11.19,category:'standard',storeName:'Leroy Merlin',sourceUrl:'https://www.leroymerlin.pl/produkty/profil-sufitowy-ud30-3-m-b-super-norgips-44604343.html',lastUpdated:'2026-10-28',currency:'PLN',notes:'EAN 5907651691197. Cena całego profilu 3 m, nie metra ani wiązki 20 szt. Odrębny SUPER C3 z katalogu Norgips; nie stary EAN 5907651698905. Wybór i zgodność z projektem wymagają potwierdzenia. Odczyt przeglądarkowy ważny 24 godziny; dostawa i cena oraz zapas placówki wymagają osobnego sprawdzenia.'},
  // source: https://sklep.ehw.com.pl/osprzet-laczeniowy/rawlplug-r-gs-06040-kotwa-do-sufitow-podwieszanych-6x40-mm
  // source: https://rawlplug.com/global/en/p/r-gs-06040
  {"id":"mat-ceiling-anchor-rawlplug-gs-100","materialType":"ceiling-anchor","productLabel":"Kotwa stalowa sufitowa Rawlplug R-GS-06040 (100 szt.)","brand":"Rawlplug","packageSize":100,"packageUnit":"szt","pricePerPackage":49.54,"category":"standard","storeName":"Elektro-Hurt","sourceUrl":"https://sklep.ehw.com.pl/osprzet-laczeniowy/rawlplug-r-gs-06040-kotwa-do-sufitow-podwieszanych-6x40-mm","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN5906675169347, producent potwierdza karton100szt. R-GS-06040, nie tuleja gwintowana R-DCA. Do betonu C20/25–C50/60 według ETA11/0268: mocowany element wraz z warstwami wykończenia maks.4,5mm, podłoże min.100mm, otwór6mm/głębokość min.40mm, osadzenie32mm, rozstaw min.200mm, krawędź min.150mm. Potwierdź nośność, rozmieszczenie i liczbę kotew z projektem. Dla innego stropu wymagany odrębny dobór."},
  // source: https://irbudsklep.pl/produkt/profil-glowny-sufitowy-cd60-3-mb-06/
  // source: https://norgips.pl/produkty/profil-cd-60-o-gr-blachy-06-mm-33.html
  {"id":"mat-profile-cd60-irbud-3m","materialType":"profile","productLabel":"Profil główny sufitowy CD60 3 MB / 0,6 (Norgips, oferta IRBUD)","brand":"Norgips","packageSize":3,"packageUnit":"mb","pricePerPackage":11.45,"category":"standard","storeName":"IRBUD","sourceUrl":"https://irbudsklep.pl/produkt/profil-glowny-sufitowy-cd60-3-mb-06/","lastUpdated":"2026-10-27","currency":"PLN","notes":"Jedna sztuka handlowa = profil3m. Sklep deklaruje Norgips CD60, blachę0,6mm i szerokość60mm. Brak opublikowanego EAN lub SKU producenta: oferta jest osobnym produktem sklepu, bez łączenia ze zbliżonym GTIN z Castoramy. Wybierz zgodnie z projektem i potwierdź konkretny wariant przed montażem."},

  // source: https://hipper.pl/lacznik-krzyzowy-60-x-145-mm-100-szt-norgips-3071669325
  // source: https://norgips.pl/produkty/lacznik-krzyzowy-72.html
  {"id":"mat-gypsum-cross-norgips-100","materialType":"drywall-accessory","productLabel":"Łącznik krzyżowy Norgips CD 60 (100 szt.)","brand":"Norgips","packageSize":100,"packageUnit":"szt","pricePerPackage":89.99,"category":"standard","storeName":"HIPPER","sourceUrl":"https://hipper.pl/lacznik-krzyzowy-60-x-145-mm-100-szt-norgips-3071669325","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN5907651696468. Jeden karton = 100 łączników, nie jedna sztuka. Łącznik krzyżowy do prostopadłego łączenia CD 60 w ruszcie dwupoziomowym według producenta. Opis sklepu zawiera sprzeczne określenie „jednopoziomowy”; dobór opieramy na dokumentacji Norgips i projekcie, bez deklarowania parametrów całego sufitu."},
  // source: https://ebardo.pl/pl/p/Lacznik-krzyzowy-GK-do-profil-CD60-100szt-BUDMAT-0%2C8mm/138
  // source: https://www.budmat.com/pl/produkt/lacznik-krzyzowy-152
  {"id":"mat-gypsum-cross-budmat-100","materialType":"drywall-accessory","productLabel":"Łącznik krzyżowy Budmat CD 60, 0,8 mm (100 szt.)","brand":"Budmat","packageSize":100,"packageUnit":"szt","pricePerPackage":49,"category":"standard","storeName":"eBardo","sourceUrl":"https://ebardo.pl/pl/p/Lacznik-krzyzowy-GK-do-profil-CD60-100szt-BUDMAT-0%2C8mm/138","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN5901323043369. Jedno opakowanie sprzedawcy = 100 łączników. Jawny wybór innej marki, nie automatyczny zamiennik Norgips. Budmat podaje zastosowanie w ruszcie sufitu; zgodność z konkretnymi profilami i wymaganiami systemu potwierdź w projekcie."},

  // source: https://ebardo.pl/pl/p/Folia-paroizolacyjna-Ecovil-0%2C2mm-2mx50m-100m2/534
  // source: https://simeplast.pl/wp-content/uploads/2024/03/katalog-produktow-02.2024.pdf
  {"id":"mat-vapor-foil-conkret-ecovil-p-100m2","materialType":"vapor-barrier","productLabel":"Folia paroizolacyjna Conkret Ecovil P 0,20 mm (100 m²)","brand":"Conkret","packageSize":100,"packageUnit":"m2","pricePerPackage":105,"pricePerM2":1.05,"category":"economy","storeName":"eBardo","sourceUrl":"https://ebardo.pl/pl/p/Folia-paroizolacyjna-Ecovil-0%2C2mm-2mx50m-100m2/534","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN5902096431131. Jedna rolka 2 × 50 m = 100 m². Grubość nominalna 0,20 mm; karta sklepu podaje tolerancję ±50%. Oddzielny produkt od Conpar (±30%), dobierz zgodnie z instrukcją podłogi/podkładu i wymaganą barierą. Nie deklarujemy uniwersalnej równoważności ani hydroizolacji pomieszczenia."},

  // source: https://www.mensura.pl/zestaw-do-ukladania-paneli-wolfcraft-6931000
  // source: https://www.wolfcraft.com/products/wolfcraft/pl/EUR/p/P_6931
  {"id":"mat-laminate-kit-wolfcraft-6931000","materialType":"laminate-installation-kit","productLabel":"Zestaw do układania paneli Wolfcraft 6931000 — 22 elementy","brand":"Wolfcraft","packageSize":1,"packageUnit":"szt","pricePerPackage":64.9,"category":"standard","storeName":"Mensura","sourceUrl":"https://www.mensura.pl/zestaw-do-ukladania-paneli-wolfcraft-6931000","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN4006885693104. Jeden zestaw:1łyżka dociągająca,1dobijak drewniany,20klinów dylatacyjnych. Wielokrotnego użytku; ilość zestawów do kupienia podaje użytkownik. 0 oznacza posiadanie wszystkich potrzebnych elementów; nie podwajamy narzędzi w zakupach."},
  // source: https://liderzycen.pl/pl/p/Tasma-aluminiowa-do-laczenia-podkladow-Arbiton-Izo-Floor-Tape-25-m/31334
  // source: https://arbiton.com/pl/podklad-pod-panele/akcesoria/tasma
  {"id":"mat-underlay-joint-tape-arbiton-izo-25m","materialType":"underlay-joint-tape","productLabel":"Taśma aluminiowa Arbiton Izo Floor Tape 50 mm × 25 m","brand":"Arbiton","packageSize":25,"packageUnit":"m","pricePerPackage":12.33,"category":"standard","storeName":"LiderzyCen","sourceUrl":"https://liderzycen.pl/pl/p/Tasma-aluminiowa-do-laczenia-podkladow-Arbiton-Izo-Floor-Tape-25-m/31334","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN5905167698778. Jedna rolka25m, szerokość50mm. Do łączenia podkładów i folii paroizolacyjnych, nie taśma malarska. Nie przyjmujemy całkowitej hydroizolacji pomieszczenia ani wydajności z samych m² podłogi."},

  // source: https://www.abud.pl/product-pol-5708-Plyn-do-usuwania-tapet-500ml-Metylan.html
  // source: https://datasheets.tdx.henkel.com/METYLAN-Remover-pl_PL.pdf
  // source: https://www.grupapsb.com.pl/produkt/plyn-do-usuwania-tapet-500-ml-metylan-9000100222969.html
  {"id":"mat-wallpaper-remover-metylan-500ml","materialType":"wallpaper-remover","productLabel":"Metylan Remover — koncentrat do usuwania tapet 500 ml","brand":"Metylan","packageSize":500,"packageUnit":"ml","pricePerPackage":35.2,"category":"standard","storeName":"ABUD","sourceUrl":"https://www.abud.pl/product-pol-5708-Plyn-do-usuwania-tapet-500ml-Metylan.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 9000100222969, IDH2357798. Kupowana jest butelka500ml koncentratu, nie0,5l gotowego roztworu. Karta Henkel:500ml na200m² papieru/farby klejowej/flizeliny/włóknin (1:40),100m² ciężkich/raufazy/szklanych (1:20) przy jednej aplikacji. Pozostałe tapety wymagają według karty2naniesień; rzeczywiste zużycie zależy od próby i warstw. Po5–10min odrywaj warstwami, resztki usuń wilgotnągąbką. Domowy użytkownik nanosi pędzlem/szczotką, nie natryskiem."},

  // source: https://buduj24.pl/produkt/14398,koelner-wkret-fs-z-drobnym-gwintem-do-mocowania-plyt-gk-do-blach-3-5x25mm-1000szt-opak
  // source: https://rawlplug.com/media/catalog/reference_object/8/6/4/5/8645bed8c1b633e727079ed69d412c22203e40c2/1954.KOELNER.PL.FS_DRYWALL_SCREWS_FOR_SHEET.pdf
  {"id":"mat-gk-screws-koelner-fs3525-1000","materialType":"drywall-accessory","productLabel":"Wkręty do płyt GK Koelner FS 3,5×25 mm, 1000 szt.","brand":"Koelner","packageSize":1000,"packageUnit":"szt","pricePerPackage":24.89,"category":"standard","storeName":"Buduj24","sourceUrl":"https://buduj24.pl/produkt/14398,koelner-wkret-fs-z-drobnym-gwintem-do-mocowania-plyt-gk-do-blach-3-5x25mm-1000szt-opak","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5906675305127. FS-3525, ostra końcówka, drobny gwint do metalu; nie samowiercący WS ani wkręt do drewna. Do jednej płyty 12,5 mm na profilu stalowym 0,6 mm w tym zestawieniu. Cena całego kartonu 1000 szt. W systemie z wymaganiami ogniowymi/akustycznymi stosuj łącznik wskazany w projekcie."},
  // source: https://www.abud.pl/product-pol-63463-Wkret-samowiercacy-3-5x9-5mm-1000-szt.html
  // source: https://rawlplug.com/media/catalog/reference_object/f/c/c/e/fcce52b5d9e9da73d84e9b9ad937ffd32232c6c8/1986.KOELNER.PL.WS_SELF_DRILLING_DRYWALL_SCREWS.pdf
  {"id":"mat-gk-profile-screws-koelner-ws3595-1000","materialType":"drywall-accessory","productLabel":"Wkręty do profili Koelner WS 3,5×9,5 mm, 1000 szt.","brand":"Koelner","packageSize":1000,"packageUnit":"szt","pricePerPackage":47.6,"category":"standard","storeName":"ABUD","sourceUrl":"https://www.abud.pl/product-pol-63463-Wkret-samowiercacy-3-5x9-5mm-1000-szt.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5906675303024. WS-3595, pchełki do połączeń stalowych profili, nie FS do przykręcania płyt. Cena całego kartonu 1000 szt.; nie 1000 kartonów ani 1 wkręt. Dobór konstrukcyjny zgodnie z projektem."},
  // source: https://www.abud.pl/product-pol-1452-Kolek-szybki-montaz-kolnierz-6x40-KOELNER-200-szt.html
  // source: https://rawlplug.com/media/catalog/reference_object/2/2/c/2/22c27a831711122ca97348d9d058ecd7054427a1/1865.KOELNER.PL.FX_K_HAMMER_IN_FIXING_WITH_MUSHROOM_HEAD.pdf
  {"id":"mat-gk-perimeter-koelner-fx06k040-200","materialType":"drywall-accessory","productLabel":"Kołki do profili Koelner FX-06K040, 6×40 mm, 200 szt.","brand":"Koelner","packageSize":200,"packageUnit":"szt","pricePerPackage":21.9,"category":"standard","storeName":"ABUD","sourceUrl":"https://www.abud.pl/product-pol-1452-Kolek-szybki-montaz-kolnierz-6x40-KOELNER-200-szt.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5906675107622. Nylonowe kołki z kołnierzem i gwoździem stalowym. Wariant tego kalkulatora wyłącznie po potwierdzeniu nośnego betonu i grubości mocowanej wraz z tynkiem/taśmą/profilami maks. 11 mm. Podłoże min. 100 mm, otwór min. 35 mm, osadzenie min. 29 mm, odległość od krawędzi/między kołkami min. 100 mm według karty. Do UW/skrajnych CW/obwodu UD. NIE do podwieszania sufitu na wieszakach: tam pozostaje oddzielny dobór stalowych kotew. Całe opakowanie 200 szt."},

  // source: https://www.leroymerlin.pl/produkty/tasma-papierowa-50mm-75-mb-norgips-43912694.html
  // source: https://norgips.pl/media/repository/0/304/793e46e823a042c6a1efcca4205e36eb/NORGIPS_PL_KT_akcesoria_tasma_papierowa.pdf
  {"id":"mat-gypsum-paper-norgips-50x75","materialType":"drywall-accessory","productLabel":"Taśma papierowa Norgips 50 mm × 75 m","brand":"Norgips","packageSize":75,"packageUnit":"m","pricePerPackage":54.99,"category":"standard","storeName":"Leroy Merlin","sourceUrl":"https://www.leroymerlin.pl/produkty/tasma-papierowa-50mm-75-mb-norgips-43912694.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651699933. Pełna rolka 75 m. Taśma do spoin zatapiana w systemowej masie; nie uszczelnienie pod profil. Odczyt operatora ważny 24 godziny; automatyczne odświeżanie i dostawa nie są podłączone. Cena/stok wybranego sklepu stacjonarnego wymaga potwierdzenia."},
  // source: https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-50-mm-30-mb-norgips-43912722.html
  // source: https://norgips.pl/media/repository/0/153/36260b03960b449691b96488c1d9b974/NORGIPS_PL_KT_akcesoria_tasma_akustyczna.pdf
  {"id":"mat-gypsum-acoustic-norgips-50x30","materialType":"drywall-accessory","productLabel":"Taśma uszczelniająca Norgips 50 mm × 30 m","brand":"Norgips","packageSize":30,"packageUnit":"m","pricePerPackage":51.99,"category":"standard","storeName":"Leroy Merlin","sourceUrl":"https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-50-mm-30-mb-norgips-43912722.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651698004. Pełna rolka 30 m, szerokość 50 mm pod UW 50 i skrajne CW. Nie jest taśmą do spoin. Odczyt operatora ważny 24 godziny; automatyczne odświeżanie i dostawa nie są podłączone. Cena/stok wybranego sklepu stacjonarnego wymaga potwierdzenia."},
  // source: https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-30-mm-30-mb-norgips-44420222.html
  // source: https://norgips.pl/media/repository/0/153/36260b03960b449691b96488c1d9b974/NORGIPS_PL_KT_akcesoria_tasma_akustyczna.pdf
  {"id":"mat-gypsum-acoustic-norgips-30x30","materialType":"drywall-accessory","productLabel":"Taśma uszczelniająca Norgips 30 mm × 30 m","brand":"Norgips","packageSize":30,"packageUnit":"m","pricePerPackage":36.49,"category":"standard","storeName":"Leroy Merlin","sourceUrl":"https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-30-mm-30-mb-norgips-44420222.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651698851. Pełna rolka 30 m pod UD 30. Inna szerokość niż uszczelnienie 50 mm pod UW. Odczyt operatora ważny 24 godziny; automatyczne odświeżanie i dostawa nie są podłączone. Cena/stok wybranego sklepu stacjonarnego wymaga potwierdzenia."},
  // source: https://www.leroymerlin.pl/produkty/profil-scienny-cw50-3-m-b-super-norgips-44604350.html
  // source: https://www.castorama.pl/profil-scienny-norgips-cw50-0-6-mm-3-mb/5907651698912_CAPL.prd
  {"id":"mat-profile-cw50-norgips-06-3m-retail","materialType":"drywall-accessory","productLabel":"Profil Norgips CW 50, 0,6 mm, 3 m (EAN 8912)","brand":"Norgips","packageSize":3,"packageUnit":"mb","pricePerPackage":29.99,"category":"standard","storeName":"Leroy Merlin","sourceUrl":"https://www.leroymerlin.pl/produkty/profil-scienny-cw50-3-m-b-super-norgips-44604350.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651698912. Cena całego profilu 3 m. Dokładny wariant detaliczny 5907651698912; osobny od C2 8165 i Super C3 9216. Do suchego wnętrza; bez obietnicy klasy ogniowej, korozyjnej lub akustycznej konstrukcji. Odczyt operatora ważny 24 godziny; automatyczne odświeżanie i dostawa nie są podłączone. Cena/stok wybranego sklepu stacjonarnego wymaga potwierdzenia."},
  // source: https://www.leroymerlin.pl/produkty/profil-scienny-uw50-3-m-b-super-norgips-45191853.html
  // source: https://norgips.pl/media/repository/0/85/12827682a3d341cbab6f8376273afe69/NORGIPS_PL_KT_profil_UW_SUPER_06_mm_50.pdf
  {"id":"mat-profile-uw50-norgips-super-06-3m","materialType":"drywall-accessory","productLabel":"Profil Norgips UW 50 Super, 0,6 mm, 3 m","brand":"Norgips","packageSize":3,"packageUnit":"mb","pricePerPackage":27.99,"category":"standard","storeName":"Leroy Merlin","sourceUrl":"https://www.leroymerlin.pl/produkty/profil-scienny-uw50-3-m-b-super-norgips-45191853.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651698547. Cena całego profilu 3 m. UW 50 podłoga/sufit, odrębny od CD, CW i UD. Odczyt operatora ważny 24 godziny; automatyczne odświeżanie i dostawa nie są podłączone. Cena/stok wybranego sklepu stacjonarnego wymaga potwierdzenia."},
  // source: https://www.leroymerlin.pl/produkty/profil-sufitowy-ud30-3-m-b-super-norgips-44604343.html
  // source: https://norgips.pl/produkty/profil-ud-30-o-gr-blachy-06-mm-34.html
  {"id":"mat-profile-ud30-norgips-06-3m","materialType":"drywall-accessory","productLabel":"Profil Norgips UD 30, 0,6 mm, 3 m (EAN 8905)","brand":"Norgips","packageSize":3,"packageUnit":"mb","pricePerPackage":11.19,"category":"standard","storeName":"Leroy Merlin","sourceUrl":"https://www.leroymerlin.pl/produkty/profil-sufitowy-ud30-3-m-b-super-norgips-44604343.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651698905. Cena całego profilu 3 m. Wariant EAN 8905; nie Super C3 1197 ani cieńszy Budmat UD 27. Odczyt operatora ważny 24 godziny; automatyczne odświeżanie i dostawa nie są podłączone. Cena/stok wybranego sklepu stacjonarnego wymaga potwierdzenia."},
  // source: https://www.leroymerlin.pl/produkty/wieszak-plaski-es-60-75-mm-norgips-43912435.html
  // source: https://norgips.pl/produkty/wieszak-plaski-es-6075-76.html
  {"id":"mat-gypsum-hanger-norgips-es6075","materialType":"drywall-accessory","productLabel":"Wieszak płaski Norgips ES 60/75, 1 szt.","brand":"Norgips","packageSize":1,"packageUnit":"szt","pricePerPackage":1.99,"category":"standard","storeName":"Leroy Merlin","sourceUrl":"https://www.leroymerlin.pl/produkty/wieszak-plaski-es-60-75-mm-norgips-43912435.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651699650. Cena jednej sztuki przy sprzedaży detalicznej; karton producenta 100 szt. nie jest opakowaniem tego sprzedawcy. Do określonego systemu ES. Odczyt operatora ważny 24 godziny; automatyczne odświeżanie i dostawa nie są podłączone. Cena/stok wybranego sklepu stacjonarnego wymaga potwierdzenia."},
  // source: https://hipper.pl/tasma-flizelinowa-z-wlokna-szklanego-50-mm-norgips-2682507570
  // source: https://norgips.pl/produkty/tasma-fizelinowa-150.html
  {"id":"mat-gypsum-fleece-norgips-50x25","materialType":"drywall-accessory","productLabel":"Taśma fizelinowa Norgips 50 mm × 25 m","brand":"Norgips","packageSize":25,"packageUnit":"m","pricePerPackage":10.99,"category":"standard","storeName":"HIPPER","sourceUrl":"https://hipper.pl/tasma-flizelinowa-z-wlokna-szklanego-50-mm-norgips-2682507570","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651699926. Pełna rolka 25 m sprzedawana jako 1 szt.; nie metr ani karton 40 rolek. Alternatywa dla papierowej w normie spoin systemów Norgips, zatapiana w masie. Stan internetowy i dostawa wymagają potwierdzenia dla całego koszyka."},
  // source: https://hipper.pl/lacznik-wzdluzny-60-x-110-mm-1-szt-norgips-2682631077
  // source: https://norgips.pl/media/repository/1/1693/c2470bcd17bd4aa7b0a8b90d01fdaf6d/NORGIPS_PL_KT_akcesoria_lacznik_wzdluzny.pdf
  {"id":"mat-gypsum-longitudinal-norgips-cd60","materialType":"drywall-accessory","productLabel":"Łącznik wzdłużny Norgips CD 60, 60×110 mm, 1 szt.","brand":"Norgips","packageSize":1,"packageUnit":"szt","pricePerPackage":3.09,"category":"standard","storeName":"HIPPER","sourceUrl":"https://hipper.pl/lacznik-wzdluzny-60-x-110-mm-1-szt-norgips-2682631077","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651699674. Cena jednej sztuki, nie kartonu 100 szt. Do przedłużania profili CD 60; nie łącznik krzyżowy. Stan internetowy i dostawa wymagają potwierdzenia dla całego koszyka."},

  // source: https://marbet24.pl/gladzie/1288-norgips-gotowa-dwufunkcyjna-masa-szpachlowa-start-finish-20-kg-5907651699056.html
  {"id":"mat-gypsum-norgips-start-finish-20kg","materialType":"drywall-joint-compound","productLabel":"Gotowa masa do spoin Norgips Start & Finish 20 kg","brand":"Norgips","packageSize":20,"packageUnit":"kg","pricePerPackage":96.28,"category":"standard","storeName":"Marbet24","sourceUrl":"https://marbet24.pl/gladzie/1288-norgips-gotowa-dwufunkcyjna-masa-szpachlowa-start-finish-20-kg-5907651699056.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651699056. Gotowa masa do spoinowania Q1 i Q2 z taśmą. Nie jest suchą masą Start 25 kg ani pełną gładzią zawartą w Q2. Cena opublikowana przez sklep; odbiór i rzeczywisty stan wymagają potwierdzenia. Brak potwierdzonej dostawy nie jest darmową dostawą."},
  // source: https://marbet24.pl/gladzie/1363-norgips-gips-szpachlowy-do-spoinowania-polaczen-plyt-gipsowo-kartonowych-start-25-kg-5907651693818.html
  {"id":"mat-gypsum-norgips-start-25kg","materialType":"drywall-joint-compound-powder","productLabel":"Gips do spoin Norgips Start 25 kg — proszek","brand":"Norgips","packageSize":25,"packageUnit":"kg","pricePerPackage":47,"category":"standard","storeName":"Marbet24","sourceUrl":"https://marbet24.pl/gladzie/1363-norgips-gips-szpachlowy-do-spoinowania-polaczen-plyt-gipsowo-kartonowych-start-25-kg-5907651693818.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651693818. Sucha masa do Q1; wymaga rozrobienia według karty i osobnego produktu do Q2. Nie zamieniamy z gotową Start & Finish. Cena opublikowana przez sklep; odbiór i rzeczywisty stan wymagają potwierdzenia. Brak potwierdzonej dostawy nie jest darmową dostawą."},
  // source: https://marbet24.pl/plyty-karton-gips/1126-norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2000-mm-5907651690879.html
  {"id":"mat-gypsum-board-norgips-gkb-a-1200x2000","materialType":"gypsum-board","productLabel":"Płyta gipsowa Norgips GKB typ A 12,5 mm 1200×2000 mm (2,4 m²)","brand":"Norgips","packageSize":2.4,"packageUnit":"m2","pricePerPackage":29.08,"category":"standard","storeName":"Marbet24","sourceUrl":"https://marbet24.pl/plyty-karton-gips/1126-norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2000-mm-5907651690879.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5907651690879. Cena CAŁEJ płyty 2,4 m², nie m². Do suchych wnętrz; odrębny EAN i format od 1200×2600 oraz impregnowanej H2. Cena opublikowana przez sklep; odbiór i rzeczywisty stan wymagają potwierdzenia. Brak potwierdzonej dostawy nie jest darmową dostawą."},
  // source: https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-5cm-welna-szklana-p11977
  {"id":"mat-mineral-wool-isover-akuplyta-50mm","materialType":"partition-wool-50mm","productLabel":"Wełna mineralna Isover Aku-Płyta 037, 50 mm (14,4 m²)","brand":"Isover","packageSize":14.4,"packageUnit":"m2","pricePerPackage":122.02,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-5cm-welna-szklana-p11977","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5901644653131. Grubość 50 mm, lambda 0,037, kod 101220010. Cena paczki 14,4 m², nie m². Nie jest Aku-Płytą 100 mm (7,2 m²). Dostępność oddziału i koszt transportu sprawdzane oddzielnie w rzeczywistym koszyku."},

  // source: https://sklep.sewera.pl/benzyna-ekstrakcyjna-0-5l-anser-p13691 (odczyt 2026-10-27T03:49:02.460Z)
  // source: https://sklep.anser.pl/pl/p/Benzyna-ekstrakcyjna-0%2C5l/502
  {"id":"mat-extraction-solvent-anser-500ml","materialType":"extraction-solvent","productLabel":"Anser benzyna ekstrakcyjna 0,5 l","brand":"Anser","packageSize":500,"packageUnit":"ml","pricePerPackage":11.89,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/benzyna-ekstrakcyjna-0-5l-anser-p13691","lastUpdated":"2026-10-27","currency":"PLN","notes":"Osobno zadeklarowana liczba butelek do przygotowania powierzchni i narzędzi przy produktach olejno-ftalowych. Nie rozcieńczaj nią emalii wodnej i nie stosuj do PVC. Produkt łatwopalny; stosuj zgodnie z etykietą."},

  // source: https://www.abud.pl/product-pol-63790-Dulux-do-drewna-i-metalu-RAPIDRY-Bialy-1L-matowa.html (odczyt 2026-10-27T03:49:09.597Z)
  // source: https://packshoty.duluxpolska.pl/wp-content/uploads/karta_techniczna_Dulux-Rapidry.pdf
  {"id":"mat-frame-dulux-rapidry-white-matt-1l","materialType":"frame-paint","productLabel":"Dulux Rapidry biały mat 1 l","brand":"Dulux","packageSize":1000,"packageUnit":"ml","pricePerPackage":68.2,"category":"standard","storeName":"ABUD","sourceUrl":"https://www.abud.pl/product-pol-63790-Dulux-do-drewna-i-metalu-RAPIDRY-Bialy-1L-matowa.html","lastUpdated":"2026-10-27","currency":"PLN","notes":"Biały wariant z określonym wykończeniem i pojemnością. Emalia wodna, a nie bezbarwny lakier. Dopuszczone podłoże i przygotowanie zgodnie z kartą danego modelu."},

  // source: https://sklep.sewera.pl/urekor-s-podklad-antykorozyjny-bialy-0-8-l-sniezka-p11955 (odczyt 2026-10-27T03:49:09.079Z)
  // source: https://www.sniezka.pl/produkt/urekor-s-podklad-antykorozyjny
  {"id":"mat-frame-urekor-s-white-800ml","materialType":"frame-primer","productLabel":"Śnieżka Urekor S podkład antykorozyjny biały 0,8 l","brand":"Śnieżka","packageSize":800,"packageUnit":"ml","pricePerPackage":34.5,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/urekor-s-podklad-antykorozyjny-bialy-0-8-l-sniezka-p11955","lastUpdated":"2026-10-27","currency":"PLN","notes":"Właściwy podkład do wybranego podłoża: Urekor D do drewna, Urekor S do stali/żeliwa. Nie jest gruntem do ścian. Przed emalią odczekaj czas z karty produktu."},

  // source: https://sklep.sewera.pl/grunt-do-drewna-urekor-d-bialy-0-8l-sniezka-p17330 (odczyt 2026-10-27T03:49:07.833Z)
  // source: https://www.sniezka.pl/produkt/urekor-d-grunt-do-drewna
  {"id":"mat-frame-urekor-d-white-800ml","materialType":"frame-primer","productLabel":"Śnieżka Urekor D grunt do drewna biały 0,8 l","brand":"Śnieżka","packageSize":800,"packageUnit":"ml","pricePerPackage":38.6,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/grunt-do-drewna-urekor-d-bialy-0-8l-sniezka-p17330","lastUpdated":"2026-10-27","currency":"PLN","notes":"Właściwy podkład do wybranego podłoża: Urekor D do drewna, Urekor S do stali/żeliwa. Nie jest gruntem do ścian. Przed emalią odczekaj czas z karty produktu."},

  // source: https://sklep.sewera.pl/supermal-emalia-akrylowa-bialy-a300-polpolysk-0-8l-p13608 (odczyt 2026-10-27T03:49:06.511Z)
  // source: https://www.karty-techniczne.sniezka.pl/pl/%C5%9ANIE%C5%BBKA_SUPERMAL%C2%AE_EMALIA_AKRYLOWA.pdf
  {"id":"mat-frame-supermal-acrylic-white-semigloss-800ml","materialType":"frame-paint","productLabel":"Śnieżka Supermal akrylowa biały półpołysk 0,8 l","brand":"Śnieżka","packageSize":800,"packageUnit":"ml","pricePerPackage":49.78,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/supermal-emalia-akrylowa-bialy-a300-polpolysk-0-8l-p13608","lastUpdated":"2026-10-27","currency":"PLN","notes":"Biały wariant z określonym wykończeniem i pojemnością. Emalia wodna, a nie bezbarwny lakier. Dopuszczone podłoże i przygotowanie zgodnie z kartą danego modelu."},

  // source: https://www.rabdom.pl/pl/p/Sniezka-Eko-Supermal-Emalia-Akrylowa-0%2C8l-Bialy-Mat-A500/13990 (odczyt 2026-10-27T03:49:03.722Z)
  // source: https://www.karty-techniczne.sniezka.pl/pl/%C5%9ANIE%C5%BBKA_SUPERMAL%C2%AE_EMALIA_AKRYLOWA.pdf
  {"id":"mat-frame-supermal-acrylic-white-matt-800ml","materialType":"frame-paint","productLabel":"Śnieżka Supermal akrylowa biały mat 0,8 l","brand":"Śnieżka","packageSize":800,"packageUnit":"ml","pricePerPackage":46.9,"category":"standard","storeName":"Rab-Dom","sourceUrl":"https://www.rabdom.pl/pl/p/Sniezka-Eko-Supermal-Emalia-Akrylowa-0%2C8l-Bialy-Mat-A500/13990","lastUpdated":"2026-10-27","currency":"PLN","notes":"Biały wariant z określonym wykończeniem i pojemnością. Emalia wodna, a nie bezbarwny lakier. Dopuszczone podłoże i przygotowanie zgodnie z kartą danego modelu."},

  // source: https://sklep.sewera.pl/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin-p22044 (odczyt 2026-10-27T03:06:00.165Z)
  // source: https://www.grupapsb.com.pl/produkt/tasma-antyrysowa-48-mm-x-20-m-blue-dolphin-5907758504369.html
  {"id":"mat-joint-tape-bluedolphin-fsh-48mm-20m","materialType":"joint-tape","productLabel":"Blue Dolphin FSH, taśma spoinowa 48 mm × 20 m","brand":"Blue Dolphin","packageSize":20,"packageUnit":"m","pricePerPackage":6.26,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin-p22044","lastUpdated":"2026-10-27","currency":"PLN","notes":"Samoprzylepna siatka do wewnętrznych, stabilnych rys i spoin. Ilość w metrach, rolka 20 m. Nie jest taśmą malarską ani rozwiązaniem pęknięć konstrukcyjnych."},

  // source: https://sklep.sewera.pl/papier-scierny-gr-240-arkusz-230x280mm-p6903 (odczyt 2026-10-27T03:05:58.657Z)
  // source: https://www.klingspor.pl/produkty/arkusze-scierne/pl-28-c
  {"id":"mat-hand-paper-klingspor-pl28c-p240","materialType":"hand-abrasive-240","productLabel":"Klingspor PL 28 C P240, arkusz 230 × 280 mm","brand":"Klingspor","packageSize":1,"packageUnit":"szt","pricePerPackage":1.49,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-240-arkusz-230x280mm-p6903","lastUpdated":"2026-10-27","currency":"PLN","notes":"Pojedynczy suchy arkusz PL 28 C, nie wodny PS8A i nie krążek. Liczba arkuszy podawana osobno; gradacje mają odrębne EAN."},

  // source: https://sklep.sewera.pl/papier-scierny-gr-150-arkusz-230x280mm-p6900 (odczyt 2026-10-27T03:05:57.067Z)
  // source: https://www.klingspor.pl/produkty/arkusze-scierne/pl-28-c
  {"id":"mat-hand-paper-klingspor-pl28c-p150","materialType":"hand-abrasive-150","productLabel":"Klingspor PL 28 C P150, arkusz 230 × 280 mm","brand":"Klingspor","packageSize":1,"packageUnit":"szt","pricePerPackage":1.67,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-150-arkusz-230x280mm-p6900","lastUpdated":"2026-10-27","currency":"PLN","notes":"Pojedynczy suchy arkusz PL 28 C, nie wodny PS8A i nie krążek. Liczba arkuszy podawana osobno; gradacje mają odrębne EAN."},

  // source: https://sklep.sewera.pl/papier-scierny-gr-120-arkusz-230x280mm-p6899 (odczyt 2026-10-27T03:05:55.534Z)
  // source: https://www.klingspor.pl/produkty/arkusze-scierne/pl-28-c
  {"id":"mat-hand-paper-klingspor-pl28c-p120","materialType":"hand-abrasive-120","productLabel":"Klingspor PL 28 C P120, arkusz 230 × 280 mm","brand":"Klingspor","packageSize":1,"packageUnit":"szt","pricePerPackage":1.67,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/papier-scierny-gr-120-arkusz-230x280mm-p6899","lastUpdated":"2026-10-27","currency":"PLN","notes":"Pojedynczy suchy arkusz PL 28 C, nie wodny PS8A i nie krążek. Liczba arkuszy podawana osobno; gradacje mają odrębne EAN."},

  // source: https://sklep.sewera.pl/acryl-putz-st10-start-gladz-szpachlowa-sypka-5kg-p13308 (odczyt 2026-10-27T03:05:54.013Z)
  // source: https://www.acrylputz.pl/produkty/gladzie-sypkie/acrylputz-st10-start
  {"id":"mat-skim-coat-acrylputz-st10-5kg","materialType":"skim-coat","productLabel":"ACRYL-PUTZ ST10 START 5 kg","brand":"ŚNIEŻKA","packageSize":5,"packageUnit":"kg","pricePerPackage":17.9,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/acryl-putz-st10-start-gladz-szpachlowa-sypka-5kg-p13308","lastUpdated":"2026-10-27","currency":"PLN","notes":"Sypka masa ST10, opakowanie 5 kg odrębne od 20 kg. Zużycie około 1 kg/m²/mm; wodę i przygotowanie sprawdź na etykiecie bieżącej partii."},

  // source: https://realbud.com/pl/p/SOUDAL-SILIKON-SANITARNY-KUCHNIA-LAZIENKA-PLESN-STOP-BIALY-280ml/75056922 (odczyt 2026-10-27T02:28:35.964Z)
  // source: https://www.soudal.pl/diy/produkty/masy-uszczelniajace/silikony/silikon-sanitarny-stop
  {"id":"mat-sanitary-silicone-soudal-stop-white-280ml","materialType":"silicone","productLabel":"Soudal Silikon Sanitarny STOP biały 280 ml","brand":"Soudal","packageSize":280,"packageUnit":"ml","pricePerPackage":23,"category":"standard","storeName":"Realbud","sourceUrl":"https://realbud.com/pl/p/SOUDAL-SILIKON-SANITARNY-KUCHNIA-LAZIENKA-PLESN-STOP-BIALY-280ml/75056922","lastUpdated":"2026-10-27","currency":"PLN","notes":"Biały STOP 280 ml, EAN 5411183200326; odrębny od zwykłego silikonu sanitarnego 5411183157064. Również do akrylu według producenta; nie do kamienia naturalnego."},

  // source: https://www.rabdom.pl/pl/p/SOUDAL-SRODEK-DO-USUWANIA-SILIKONU-100ml/12481 (odczyt 2026-10-27T02:28:35.602Z)
  // source: https://www.soudal.pl/diy/produkty/pistolety-i-materialy-pomocnicze/srodki-czyszczace/silicone-remover
  {"id":"mat-silicone-remover-soudal-100ml","materialType":"silicone-remover","productLabel":"Soudal Silicone Remover 100 ml","brand":"Soudal","packageSize":100,"packageUnit":"ml","pricePerPackage":45,"category":"standard","storeName":"Rab-Dom","sourceUrl":"https://www.rabdom.pl/pl/p/SOUDAL-SRODEK-DO-USUWANIA-SILIKONU-100ml/12481","lastUpdated":"2026-10-27","currency":"PLN","notes":"Żel 100 ml do resztek utwardzonego silikonu. Liczbę opakowań podaje użytkownik; brak wymyślonej wydajności na metr. Próba zgodności na tworzywie."},

  // source: https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282 (odczyt 2026-10-27T01:34:02.370Z)
  // source: https://tape.pl/marki/31-goldflex
  {"id":"mat-edge-tape-packcenter-tb-fb00202-50m","materialType":"expansion-tape","productLabel":"Taśma dylatacyjna 5mm x 10cm x 50m (Pack-Center TB-FB00202)","brand":"Pack-Center","packageSize":50,"packageUnit":"mb","pricePerPackage":14.06,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282","lastUpdated":"2026-10-27","currency":"PLN","notes":"PACK-CENTER TB-FB00202, pianka PE 5 mm × 10 cm, rolka 50 m. Kod sklepu 465325 nie jest EAN-em; model jest odrębny od Fola. Dobór do dylatacji cienkiej wylewki, długość krawędzi z obmiaru + jawny zapas 5%."},

  {
    id: 'mat-paint-economy-white-10l',
    materialType: 'paint',
    productLabel: 'Farba biała mat 10 l',
    packageSize: 10,
    packageUnit: 'l',
    pricePerPackage: 54.98,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/farba-biala-mat-10-l/3663602567240_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
  },
  {
    id: 'mat-paint-standard-white-10l',
    materialType: 'paint',
    productLabel: 'Farba GoodHome Ściany i Sufit biały mat 10 l',
    packageSize: 10,
    packageUnit: 'l',
    pricePerPackage: 79.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/farba-goodhome-sciany-i-sufit-bialy-mat-10-l/5059340271620_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
  },
  {
    id: 'mat-paint-better-white-10l',
    materialType: 'paint',
    productLabel: 'Farba lateksowa Śnieżka Eko Plus biała 10 l',
    brand: 'Śnieżka',
    packageSize: 10,
    packageUnit: 'l',
    pricePerPackage: 108.0,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/farba-lateksowa-sniezka-eko-plus-biala-10-l/5903973205982_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-universal-primer-5l',
    materialType: 'primer',
    productLabel: 'Grunt uniwersalny Knauf 5 l',
    brand: 'Knauf',
    packageSize: 5,
    packageUnit: 'l',
    pricePerPackage: 35.48,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/grunt-uniwersalny-knauf-5-l/5901793357737_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-skim-coat-economy-20kg',
    materialType: 'skim-coat',
    productLabel: 'Gładź pod wałek GW180 gotowa polimerowa 20 kg',
    packageSize: 20,
    packageUnit: 'kg',
    pricePerPackage: 38.48,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/gladz-pod-walek-gw180-20-kg/5907418038791_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
  },
  {
    id: 'mat-skim-coat-standard-18kg',
    materialType: 'skim-coat',
    productLabel: 'Gotowa gładź polimerowa Atlas GTA 18 kg',
    brand: 'Atlas',
    packageSize: 18,
    packageUnit: 'kg',
    pricePerPackage: 69.78,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/gotowa-gladz-polimerowa-atlas-gta-18-kg/5905400542509_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  // source: https://liderzycen.pl/pl/p/Panele-laminowane-Oakland-wodoodporne-AC4-2%2C51-m2/185472 (cena brutto, odczyt 2026-10-25T21:08:16.416Z)
  {
    id: 'mat-laminate-oakland-ac4',
    materialType: 'laminate',
    productLabel: 'Panele laminowane Oakland wodoodporne AC4 2.51 m²',
    packageSize: 2.51,
    packageUnit: 'm2',
    pricePerPackage: 65.69,
    pricePerM2: 26.17,
    category: 'economy',
    storeName: 'LiderzyCen',
    sourceUrl:
      'https://liderzycen.pl/pl/p/Panele-laminowane-Oakland-wodoodporne-AC4-2%2C51-m2/185472',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },
  // source: https://liderzycen.pl/pl/p/Podklad-podlogowy-pod-panele-laminowane-Volden-XPS-Smart-3-mm-10-m2/31327 (cena brutto, odczyt 2026-10-25T21:08:16.964Z)
  {
    id: 'mat-underlay-volden-xps-10m2',
    materialType: 'underlay',
    productLabel: 'Podkład podłogowy Volden XPS Smart 3 mm 10 m²',
    brand: 'Volden',
    packageSize: 10,
    packageUnit: 'm2',
    pricePerPackage: 71.06,
    pricePerM2: 7.11,
    category: 'economy',
    storeName: 'LiderzyCen',
    sourceUrl:
      'https://liderzycen.pl/pl/p/Podklad-podlogowy-pod-panele-laminowane-Volden-XPS-Smart-3-mm-10-m2/31327',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },
  // source: https://topboden.pl/listwy-przypodlogowe/listwa-przypodlogowa-arbiton-indo-bialy-polysk-1 (cena brutto, odczyt 2026-10-25T17:43:11.235Z)
  {
    id: 'mat-skirting-arbiton-2500',
    materialType: 'skirting',
    productLabel: 'Listwa przypodłogowa PCV Arbiton Indo biały połysk 01, 2500 mm',
    brand: 'Arbiton',
    packageSize: 2.5,
    packageUnit: 'mb',
    purchaseMultiple: 10,
    pricePerPackage: 31.98,
    pricePerMb: 12.79,
    category: 'standard',
    storeName: 'TopBoden',
    sourceUrl:
      'https://topboden.pl/listwy-przypodlogowe/listwa-przypodlogowa-arbiton-indo-bialy-polysk-1',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },
  // source: https://liderzycen.pl/pl/p/Gres-mrozoodporny-szkliwiony-Guigliano-GoodHome-18%2C5-x-59%2C8-cm-beige-1-m2/31407 (cena brutto, odczyt 2026-10-25T21:08:17.549Z)
  {
    id: 'mat-gres-guigliano-1m2',
    materialType: 'tile',
    productLabel: 'Gres Guigliano GoodHome 1 m²',
    packageSize: 1,
    packageUnit: 'm2',
    pricePerPackage: 71.02,
    pricePerM2: 71.02,
    category: 'standard',
    storeName: 'LiderzyCen',
    sourceUrl:
      'https://liderzycen.pl/pl/p/Gres-mrozoodporny-szkliwiony-Guigliano-GoodHome-18%2C5-x-59%2C8-cm-beige-1-m2/31407',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },
  {
    id: 'mat-tile-adhesive-buildfix-25kg',
    materialType: 'adhesive',
    productLabel: 'Klej wysokoelastyczny Atlas Plus odkształcalny 25 kg',
    brand: 'Atlas',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 63.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/klej-wysokoelastyczny-atlas-plus-odksztalcalny-25-kg/5905400658866_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
  },
  {
    id: 'mat-sanitary-silicone-soudal-280ml',
    materialType: 'silicone',
    productLabel: 'Silikon sanitarny Soudal 280 ml',
    brand: 'Soudal',
    packageSize: 280,
    packageUnit: 'ml',
    pricePerPackage: 19.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/silikon-sanitarny-soudal-280-ml-bialy/5411183157064_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // --- Materiały markowe w kategoriach dotąd pokrytych tylko markami własnymi ---
  // Dodane, by nakładka EAN (api-server/src/lib/ean-overlay.ts) miała realne
  // materiały do powiązania z potwierdzonymi kodami (marki własne sklepów są
  // jednosklepowe, więc nie spełniają reguły „≥2 niezależne źródła"). Każda cena
  // i EAN mają ≥2 źródła (sklep PL) w komentarzach `// source:`. Materiały NIE są
  // mapowane do żadnego joba (JOB_MATERIAL_MAPPINGS), więc nie zmieniają istniejących
  // wycen — służą jako pozycje katalogowe do dopięcia ofert z feedów po EAN.

  // Grunt głęboko penetrujący Atlas Uni-Grunt 5 kg — EAN 5905400520026.
  // source: https://www.castorama.pl/grunt-gleboko-penetrujacy-atlas-uni-grunt-5-kg/5905400520026_CAPL.prd (EAN + cena 44,98 zł)
  // source: https://www.abud.pl/product-pol-1121-Preparat-gruntujacy-Atlas-Uni-Grunt-5kg.html (Kod EAN 5905400520026)
  {
    id: 'mat-primer-deep-atlas-unigrunt-5kg',
    materialType: 'primer',
    productLabel: 'Grunt głęboko penetrujący Atlas Uni-Grunt 5 kg',
    brand: 'Atlas',
    packageSize: 5,
    packageUnit: 'kg',
    pricePerPackage: 44.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/grunt-gleboko-penetrujacy-atlas-uni-grunt-5-kg/5905400520026_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Grunt głęboko penetrujący Ceresit CT 17 10 l — EAN 5900089617081.
  // source: https://bat.pl/Grunt-gleboko-penetrujacy-CT-17-10l-Ceresit/ct17-10-x (EAN 5900089617081)
  // source: https://chemko.com.pl/ceresit-ct-17-grunt-gleboko-penetrujacy-10l,3,104317,1304 (EAN 5900089617081)
  // source: https://www.bricoman.pl/grunt-gleboko-penetrujacy-ceresit-ct17-10l-20914943.html (cena 99,95 zł)
  {
    id: 'mat-primer-deep-ceresit-ct17-10l',
    materialType: 'primer',
    productLabel: 'Grunt głęboko penetrujący Ceresit CT 17 10 l',
    brand: 'Ceresit',
    packageSize: 10,
    packageUnit: 'l',
    pricePerPackage: 99.95,
    category: 'standard',
    storeName: 'Bricoman',
    sourceUrl:
      'https://www.bricoman.pl/grunt-gleboko-penetrujacy-ceresit-ct17-10l-20914943.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Fuga elastyczna Ceresit CE 40 biała 2 kg — EAN 5900089140015.
  // source: https://www.castorama.pl/fuga-elastyczna-ceresit-ce-40-aquastatic-biala-2-kg-id-3973.html (EAN + cena 41,98 zł)
  // source: https://chemko.com.pl/chemko-fuga-ceresit-ce40-biala-white-01-2-kg,3,46935,1597 (EAN 5900089140015)
  {
    id: 'mat-grout-ceresit-ce40-white-2kg',
    materialType: 'grout',
    productLabel: 'Fuga elastyczna Ceresit CE 40 biała 2 kg',
    brand: 'Ceresit',
    packageSize: 2,
    packageUnit: 'kg',
    pricePerPackage: 41.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/fuga-elastyczna-ceresit-ce-40-aquastatic-biala-2-kg-id-3973.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Zaprawa klejowa Ceresit CM 11 25 kg — EAN 5900089111251.
  // source: https://mrowka.com.pl/produkt/zaprawa-klejowa-podstawowa-cm11-25-kg-ceresit-5900089111251.html (EAN + cena 39,99 zł)
  // source: https://www.grupapsb.com.pl/produkt/zaprawa-klejowa-podstawowa-cm11-25-kg-ceresit-5900089111251.html (EAN 5900089111251)
  {
    id: 'mat-tile-adhesive-ceresit-cm11-25kg',
    materialType: 'adhesive',
    productLabel: 'Zaprawa klejowa Ceresit CM 11 25 kg',
    brand: 'Ceresit',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 39.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/zaprawa-klejowa-podstawowa-cm11-25-kg-ceresit-5900089111251.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Fix All High Tack biały 290 ml: 5411183045620; kod 5411183175723 dotyczy tuby 125 ml.
  // source: https://media.soudal.pl/katalogi/Katalog_DIY_Soudal_2025_new.pdf
  // source: https://www.unimet.pl/uszczelniacze-58/259045-uszczelniacz-hybrydowy-fix-all-high-tack-bialy-290ml-5411183045620.html
  {
    id: 'mat-mounting-adhesive-soudal-fixall-290ml',
    materialType: 'mounting-adhesive',
    productLabel: 'Klej-uszczelniacz hybrydowy Soudal Fix All High Tack 290 ml biały',
    brand: 'Soudal',
    packageSize: 290,
    packageUnit: 'ml',
    pricePerPackage: 31.50,
    category: 'standard',
    storeName: 'Unimet',
    sourceUrl:
      'https://www.unimet.pl/uszczelniacze-58/259045-uszczelniacz-hybrydowy-fix-all-high-tack-bialy-290ml-5411183045620.html',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Gładź szpachlowa wykończeniowa Acryl-Putz FS20 Finisz 27 kg — EAN 5903973104544.
  // source: https://mrowka.com.pl/produkt/gladz-szpachlowa-finisz-fs20-27-kg-acryl-putz-5903973104544.html (EAN + cena 83,99 zł)
  // source: https://mrowkaonline.pl/bilgoraj/gisy-i-gladzie/57866-acryl-putz-fs20-finisz-27kg-5903973104544.html (EAN 5903973104544)
  {
    id: 'mat-skim-coat-acrylputz-fs20-27kg',
    materialType: 'skim-coat',
    productLabel: 'Gładź szpachlowa wykończeniowa Acryl-Putz FS20 Finisz 27 kg',
    brand: 'Śnieżka',
    packageSize: 27,
    packageUnit: 'kg',
    pricePerPackage: 83.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/gladz-szpachlowa-finisz-fs20-27-kg-acryl-putz-5903973104544.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Piana pistoletowa Tytan Professional 65 niskoprężna 750 ml — EAN 5903518052859.
  // source: https://sklep.sewera.pl/pianka-montazowa-pistoletowa-65-750ml-tytan-p12439 (22,80 zł brutto, 2026-10-28)
  // source: https://www.unimet.pl/piany-i-kleje-43/331828-pianka-pistoletowa-tytan-65-750ml-02-niskoprezna-5903518052859.html (EAN 5903518052859)
  {
    id: 'mat-foam-tytan-pro65-750ml',
    materialType: 'foam',
    productLabel: 'Piana pistoletowa Tytan Professional 65 niskoprężna 750 ml',
    brand: 'Tytan',
    packageSize: 750,
    packageUnit: 'ml',
    pricePerPackage: 22.80,
    category: 'standard',
    storeName: 'Sewera',
    sourceUrl:
      'https://sklep.sewera.pl/pianka-montazowa-pistoletowa-65-750ml-tytan-p12439',
    lastUpdated: '2026-10-28',
    currency: 'PLN',
  },

  // Folia malarska gruba Blue Dolphin 4 x 5 m — EAN 5907758504932.
  // source: https://mrowka.com.pl/produkt/folia-malarska-gruba-4-x-5-m-blue-dolphin-5907758504932.html (EAN + cena 10,99 zł)
  // source: https://buduj24.pl/folie-malarskie/folia-malarska-gruba-blue-dolphin-4m-x-5m (EAN 5907758504932)
  {
    id: 'mat-protective-film-bluedolphin-4x5m',
    materialType: 'protective-film',
    productLabel: 'Folia malarska gruba Blue Dolphin 4 x 5 m',
    brand: 'Blue Dolphin',
    packageSize: 20,
    packageUnit: 'm2',
    pricePerPackage: 10.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/folia-malarska-gruba-4-x-5-m-blue-dolphin-5907758504932.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Taśma malarska Blue Dolphin niebieska 38 mm x 50 m — EAN 5907758507285.
  // source: https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-38mm-x-50m/5907758507285_CAPL.prd (EAN + cena 27,55 zł)
  // source: https://sklep.greinplastplus.pl/narzedzia-malarskie/731-blue-dolphin-papierowa-tasma-malarska-38mm-x-50m-niebieska--5907758507285.html (EAN 5907758507285)
  {
    id: 'mat-masking-tape-bluedolphin-38mm',
    materialType: 'masking-tape',
    productLabel: 'Taśma malarska Blue Dolphin niebieska 38 mm x 50 m',
    brand: 'Blue Dolphin',
    packageSize: 50,
    packageUnit: 'mb',
    pricePerPackage: 27.55,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-38mm-x-50m/5907758507285_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // --- Malowanie ścian: markowe farby i akcesoria z realnym EAN ---------------
  // Flagowy etap „malowanie ścian" miał dotąd farby economy/standard bez EAN
  // (generic „Farba biała mat", GoodHome — zostają w katalogu, ID nie ruszamy).
  // Dodajemy markowe produkty z realnym, ≥2-źródłowym EAN dla pełnych tierów
  // economy/standard/better + gładź startową i taśmę 30 mm. Ceny brutto ze sklepu
  // PL, packageSize/packageUnit z opakowania handlowego. Każdy EAN wpisany też do
  // MATERIAL_EAN_OVERLAY (api-server) → seed:offers/feed dopina realne oferty.
  // DOKŁADNIE jedna farba na tier w mappings.ts (inaczej engine podwoi ilość).
  // UWAGA: świadomie NIE dodajemy tu Śnieżki Eko 10 l — jej EAN 5903973005797 to
  // zarezerwowany demo-EAN fixture (guard w seed-catalog.test.ts zabrania go w
  // nakładce). Grunt głęboko penetrujący i folia malarska już są w katalogu z EAN.

  // Farba lateksowa Dekoral Akrylit W śnieżnobiała 5 l — EAN 5904000810681
  // (economy, odporna na szorowanie, wyd. 14 m²/l). Cena 59,90 zł (PSB Lobo).
  // source: https://www.obi.pl/biale-farby-do-scian/dekoral-emulsja-akrylit-w-bialy-5-l/p/1237502 (OBI — dostępność wariantu 5 l)
  // source: https://eadamex.pl/farby-biale/7178-farba-dekoral-akrylit-w-5l-snieznobiala-lateksowa-do-scian-i-sufitow-5904000810681.html (EAN 5904000810681)
  {
    id: 'mat-paint-latex-dekoral-akrylit-w-white-5l',
    materialType: 'paint',
    productLabel: 'Farba lateksowa Dekoral Akrylit W śnieżnobiała 5 l',
    brand: 'Dekoral',
    packageSize: 5,
    packageUnit: 'l',
    pricePerPackage: 59.90,
    category: 'economy',
    storeName: 'OBI',
    sourceUrl:
      'https://www.obi.pl/biale-farby-do-scian/dekoral-emulsja-akrylit-w-bialy-5-l/p/1237502',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Farba lateksowa Dulux EasyCare Nieskazitelna Biel 9 l — EAN 5904078198759
  // (better, plamoodporna hydrofobowa, wyd. 14 m²/l). Największe wiadro Dulux to 9 l.
  // source: https://www.castorama.pl/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l/5904078198759_CAPL.prd (EAN + cena 228 zł)
  // source: https://mrowkaonline.pl/bilgoraj/farby-scienne-biale/65684-dulux-easy-care-nieskazitelna-biel-9l-5904078198759.html (EAN 5904078198759)
  {
    id: 'mat-paint-latex-dulux-easycare-white-9l',
    materialType: 'paint',
    productLabel: 'Farba lateksowa Dulux EasyCare Nieskazitelna Biel 9 l',
    brand: 'Dulux',
    packageSize: 9,
    packageUnit: 'l',
    pricePerPackage: 228.0,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l/5904078198759_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Farba lateksowa Śnieżka Barwy Natury biała (173) 5 l — EAN 5903973139188
  // (standard, matowa lateksowa, odporna na szorowanie).
  // source: https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd (EAN + cena 118 zł)
  // source: https://mrowka.com.pl/produkt/farba-barwy-natury-bialy-173-5l-sniezka-5903973139188.html (EAN 5903973139188)
  {
    id: 'mat-paint-latex-sniezka-barwy-natury-white-5l',
    materialType: 'paint',
    productLabel: 'Farba lateksowa Śnieżka Barwy Natury biała 5 l',
    brand: 'Śnieżka',
    packageSize: 5,
    packageUnit: 'l',
    pricePerPackage: 118.0,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Gładź gipsowa startowa Śnieżka Acryl-Putz ST10 START 20 kg — EAN 5903973104421
  // (start pod gładź finiszową/malowanie; wariant startowy, FS20 to finisz — patrz wyżej).
  // source: https://mrowka.com.pl/produkt/gladz-szpachlowa-start-st10-20-kg-acryl-putz-5903973104421.html (EAN + cena 42,99 zł)
  // source: https://www.bricoman.pl/sniezka-acryl-putz-gladz-szpachlowa-start-20kg-271943.html (EAN 5903973104421, cena 41,35 zł)
  {
    id: 'mat-skim-coat-acrylputz-st10-20kg',
    materialType: 'skim-coat',
    productLabel: 'Gładź gipsowa startowa Acryl-Putz ST10 START 20 kg',
    brand: 'Śnieżka',
    packageSize: 20,
    packageUnit: 'kg',
    pricePerPackage: 42.99,
    category: 'economy',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/gladz-szpachlowa-start-st10-20-kg-acryl-putz-5903973104421.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Taśma malarska Blue Dolphin niebieska 30 mm x 50 m — EAN 5907758515952
  // (węższy wariant obok 38 mm — do wąskich profili/krawędzi).
  // source: https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-30mm-x-50m/5907758515952_CAPL.prd (EAN + cena 25,17 zł)
  // source: https://mrowkaonline.pl/bilgoraj/tasmy-malarskie/46729-xl-tape-tasma-malarska-mt-pg-sbl-30mmx50m-928-niebieska-papierowa-5907758515952.html (EAN 5907758515952)
  {
    id: 'mat-masking-tape-bluedolphin-30mm',
    materialType: 'masking-tape',
    productLabel: 'Taśma malarska Blue Dolphin niebieska 30 mm x 50 m',
    brand: 'Blue Dolphin',
    packageSize: 50,
    packageUnit: 'mb',
    pricePerPackage: 25.17,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-30mm-x-50m/5907758515952_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Siatka ścierna (szlifierska) na rzep GRAPHITE 55H746 ⌀225 mm, K180, 10 szt. — EAN 5902062502735.
  // Do szlifowania gładzi/gipsu (na packę lub żyrafę). Węglik krzemu, warstwa otwarta
  // (mniej zapychania niż papier). Opakowanie 10 krążków. Cena orientacyjna 38,87 zł/opak.
  // source: https://mrowka.com.pl/produkt/siatka-scierna-na-rzep-225-mm-k180-do-szlifierki-59g260-10-sztuk-graphite-5902062502735.html (Mrówka — EAN 5902062502735)
  // source: https://www.grupapsb.com.pl/produkt/siatka-scierna-na-rzep-225-mm-k180-do-szlifierki-59g260-10-sztuk-graphite-5902062502735.html (Grupa PSB — EAN 5902062502735)
  // source: https://www.narzedzia.pl/siatka-scierna-na-rzep-225mm-k180-do-59g260-10szt-graphite-55h746,92884.html (EAN 5902062502735 + cena 38,87 zł)
  // source: https://fixero.com/siatka-scierna-na-rzep-225-mm-k180-do-szlifierki-59g260-59g264-59g265-10-szt-55h746.html (cena brutto, odczyt 2026-10-25T15:16:38.226Z)
  {
    id: 'mat-abrasive-mesh-graphite-225-k180-10',
    materialType: 'abrasive',
    productLabel: 'Siatka ścierna na rzep GRAPHITE 225 mm K180, 10 szt.',
    brand: 'Graphite',
    packageSize: 10,
    packageUnit: 'szt',
    pricePerPackage: 37.00,
    category: 'standard',
    storeName: 'Fixero',
    sourceUrl:
      'https://fixero.com/siatka-scierna-na-rzep-225-mm-k180-do-szlifierki-59g260-59g264-59g265-10-szt-55h746.html',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
    notes:
      'Do szlifowania gładzi na gładko (K180). Opak. 10 krążków ⌀225 mm — zwykle 1 opak. na cały pokój.',
  },

  // --- Sucha zabudowa GK: płyta, profile, wełna, wkręty, kołki -----------------
  // Duże pozycje wprost brakujące w katalogu (patrz mappings.ts: „płyta GK,
  // profile, wełna nie są jeszcze w katalogu"). Każdy materiał markowy z realnym
  // EAN (≥2 niezależne źródła w komentarzach `// source:`) → EAN wpisany też do
  // MATERIAL_EAN_OVERLAY (api-server), więc seed:offers dopina oferty z feedów.
  // Ceny brutto ze sklepu PL, packageSize/packageUnit z opakowania handlowego.

  // Płyta gipsowo-kartonowa zwykła Norgips GKB typ A 1200×2600×12,5 mm — EAN 5907651690442.
  // Karton = 1,2 m × 2,6 m = 3,12 m²/szt. Cena 34,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/plyta-gkb-12-5x1200x2600-mm-zwykla-norgips-5907651690442.html (EAN + cena 34,99 zł)
  // source: https://www.castorama.pl/plyta-gipsowo-kartonowa-zwykla-1200-x-2600-x-12-5-mm-gkb-typ-a-norgips/5907651690442_CAPL.prd (EAN 5907651690442)
  // source: https://www.grupapsb.com.pl/produkt/plyta-gkb-12-5x1200x2600-mm-zwykla-norgips-5907651690442.html (EAN 5907651690442)
  // source: https://rodimax.pl/P%C5%82yta-gipsowa-zwyk%C5%82a-Norgips-1200-x-2600-x-12%2C5-mm-3%2C12-m2.html (cena brutto, odczyt 2026-10-25T15:20:52.168Z)
  // source: https://domat24.pl/produkt/plyta-gipsowa-gkb-12-5-12002600-biala/ (cena brutto, odczyt 2026-10-25T17:15:52.753Z)
  {
    id: 'mat-gypsum-board-norgips-gkb-a-1200x2600',
    materialType: 'gypsum-board',
    productLabel: 'Płyta gipsowo-kartonowa zwykła Norgips GKB typ A 1200×2600×12,5 mm',
    brand: 'Norgips',
    packageSize: 3.12,
    packageUnit: 'm2',
    pricePerPackage: 35.90,
    pricePerM2: 11.51,
    category: 'economy',
    storeName: 'Domat',
    sourceUrl:
      'https://domat24.pl/produkt/plyta-gipsowa-gkb-12-5-12002600-biala/',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Płyta gipsowo-kartonowa impregnowana (wodoodporna) Norgips GKBI typ H2 1200×2600×12,5 mm — EAN 5907651691616.
  // Karton 3,12 m²/szt. Cena 49,99 zł/szt (Mrówka). Do pomieszczeń wilgotnych.
  // source: https://mrowka.com.pl/produkt/plyta-gkbi-12-5x1200x2600-mm-woda-norgips-5907651691616.html (EAN + cena 49,99 zł)
  // source: https://www.castorama.pl/plyta-gipsowo-kartonowa-impregnowana-1200-x-2600-x-12-5-mm-gkbi-typ-h2-norgips/5907651691616_CAPL.prd (EAN 5907651691616)
  // source: https://www.leroymerlin.pl/produkty/plyta-gipsowa-impregnowana-gkbi-typ-h2-2600-x-1200-x-12-5-mm-norgips-41703172.html (EAN 5907651691616)
  // source: https://domat24.pl/produkt/plyta-gipsowa-gkbi-12-5-12002600-zielona/ (cena brutto, odczyt 2026-10-25T17:15:50.250Z)
  {
    id: 'mat-gypsum-board-norgips-gkbi-h2-1200x2600',
    materialType: 'gypsum-board',
    productLabel: 'Płyta gipsowo-kartonowa impregnowana Norgips GKBI typ H2 1200×2600×12,5 mm',
    brand: 'Norgips',
    packageSize: 3.12,
    packageUnit: 'm2',
    pricePerPackage: 57.12,
    pricePerM2: 18.31,
    category: 'better',
    storeName: 'Domat',
    sourceUrl:
      'https://domat24.pl/produkt/plyta-gipsowa-gkbi-12-5-12002600-zielona/',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Profil sufitowy (nośny) Norgips CD60 0,6 mm 3 m — EAN 5907651698899. Cena 11,98 zł/szt (Castorama).
  // source: https://www.castorama.pl/profil-sufitowy-norgips-cd60-0-6-mm-3-mb/5907651698899_CAPL.prd (EAN + cena 11,98 zł)
  // source: https://www.leroymerlin.pl/produkty/profil-sufitowy-cd60-3-m-b-norgips-42286972.html (EAN 5907651698899)
  {
    id: 'mat-profile-cd60-norgips-3m',
    materialType: 'profile',
    productLabel: 'Profil sufitowy Norgips CD60 0,6 mm 3 m',
    brand: 'Norgips',
    packageSize: 3,
    packageUnit: 'mb',
    pricePerPackage: 20.98,
    pricePerMb: 6.99,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/profil-sufitowy-norgips-cd60-0-6-mm-3-mb/5907651698899_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
  },

  // Profil przyścienny (obwodowy) Budmat UD27 0,5 mm 3 m — EAN 5907738940163. Cena 7,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/profil-sufitowy-ud27-0-50-mm-3-m-budmat-plock-5907738940163.html (EAN + cena 7,99 zł)
  // source: https://www.castorama.pl/profil-sufitowy-budmat-ud27-3-m/5907738940163_CAPL.prd (EAN 5907738940163)
  {
    id: 'mat-profile-ud27-budmat-3m',
    materialType: 'profile',
    productLabel: 'Profil przyścienny Budmat UD27 0,5 mm 3 m',
    brand: 'Budmat',
    packageSize: 3,
    packageUnit: 'mb',
    pricePerPackage: 5.98,
    pricePerMb: 1.99,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/profil-sufitowy-budmat-ud27-3-m/5907738940163_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
  },

  // Wełna mineralna szklana Isover Aku-Płyta 10 cm λ=0,037 W/mK — EAN 5901644653155. Opakowanie 7,2 m², 172 zł (Bricoman).
  // source: https://bat.pl/Welna-Isover-Aku-plyta-10cm-7.2m2/101220014 (EAN 5901644653155)
  // source: https://eadamex.pl/sciany-dzialowe/4924-welna-mineralna-isover-aku-plyta-10cm-0037w-mk-720m2-20szt-pal-5901644653155.html (EAN 5901644653155)
  // source: https://www.bricoman.pl/isover-aku-plyta-welna-mineralna-szklana-10-cm-7-2-m2-877954.html (cena 172 zł / 7,2 m²)
  {
    id: 'mat-mineral-wool-isover-akuplyta-10cm',
    materialType: 'mineral-wool',
    productLabel: 'Wełna mineralna szklana Isover Aku-Płyta 10 cm λ=0,037 (7,2 m²)',
    brand: 'Isover',
    packageSize: 7.2,
    packageUnit: 'm2',
    pricePerPackage: 172.00,
    pricePerM2: 23.89,
    category: 'standard',
    storeName: 'Bricoman',
    sourceUrl:
      'https://www.bricoman.pl/isover-aku-plyta-welna-mineralna-szklana-10-cm-7-2-m2-877954.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Wkręty samowiercące do płyt g-k do metalu Wkręt-Met 3,5×25 mm, 100 szt. — EAN 5907704499015. Cena 12,99 zł/op (Mrówka).
  // source: https://mrowka.com.pl/produkt/wkrety-samowiercace-do-plyt-kartonowo-gipsowych-do-metalu-3-5x25-blister-wkret-met-5907704499015.html (EAN + cena 12,99 zł, 100 szt.)
  // source: https://www.grupapsb.com.pl/produkt/wkrety-samowiercace-do-plyt-kartonowo-gipsowych-do-metalu-3-5x25-blister-wkret-met-5907704499015.html (EAN 5907704499015)
  {
    id: 'mat-drywall-screws-wkretmet-35x25-100',
    materialType: 'screws',
    productLabel: 'Wkręty samowiercące do płyt g-k do metalu Wkręt-Met 3,5×25 mm (100 szt.)',
    brand: 'Wkręt-Met',
    packageSize: 100,
    packageUnit: 'szt',
    pricePerPackage: 12.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/wkrety-samowiercace-do-plyt-kartonowo-gipsowych-do-metalu-3-5x25-blister-wkret-met-5907704499015.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Kołki szybkiego montażu rozporowe Wkręt-Met SM 6×40 mm, 20 szt. — EAN 5907704466031. Cena 6,00 zł/op (Mrówka).
  // source: https://mrowka.com.pl/produkt/kolki-szybkiego-montazu-6x40-blister-wkret-met-5907704466031.html (EAN + cena 6,00 zł, 20 szt.)
  // source: https://eldor24.pl/kolki-do-szybkiego-montazu/kolki-szybkiego-montazu-rozporowe-sm-6x40-20-sztuk-blister-wkret-met (EAN 5907704466031)
  {
    id: 'mat-quick-dowels-wkretmet-sm-6x40-20',
    materialType: 'dowels',
    productLabel: 'Kołki szybkiego montażu rozporowe Wkręt-Met SM 6×40 mm (20 szt.)',
    brand: 'Wkręt-Met',
    packageSize: 20,
    packageUnit: 'szt',
    pricePerPackage: 6.00,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/kolki-szybkiego-montazu-6x40-blister-wkret-met-5907704466031.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // --- Instalacja wodna / hydraulika: armatura, rury, złączki, uszczelnienia ----
  // Materiały etapu łazienki/kuchni brakujące w katalogu (baterie, syfon, rura,
  // kolanko, wężyk, taśma teflonowa). Każdy markowy, z realnym EAN potwierdzonym
  // w ≥2 niezależnych źródłach (komentarze `// source:`) → EAN wpisany też do
  // MATERIAL_EAN_OVERLAY (api-server), więc seed:offers dopina oferty z feedów.
  // Ceny brutto ze sklepu PL, packageSize/packageUnit z opakowania handlowego.

  // Bateria umywalkowa stojąca Ferro Stillo BSL2 chrom — EAN 5902194929837. Cena 194,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/bateria-umywalkowa-stillo-stojaca-ferro-5902194929837.html (EAN + cena 194,99 zł)
  // source: https://onninen.pl/produkt/FERRO-STILLO-bateria-umywalkowa-stojaca-chrom-BSL2,113316 (EAN 5902194929837, model BSL2)
  // source: https://www.ceneo.pl/44139801 (Ferro Stillo BSL2A, EAN 5902194929837)
  // source: https://tgs.pl/pl/p/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom/44 (cena brutto, odczyt 2026-10-25T16:39:03.001Z)
  {
    id: 'mat-basin-mixer-ferro-stillo',
    materialType: 'faucet',
    productLabel: 'Bateria umywalkowa stojąca Ferro Stillo (chrom, BSL2)',
    brand: 'Ferro',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 129.98,
    category: 'standard',
    storeName: 'TGS',
    sourceUrl:
      'https://tgs.pl/pl/p/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom/44',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Bateria natryskowa (prysznicowa) ścienna Ferro One BFO7 chrom — EAN 5902194954525. Cena 193,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/bateria-natryskowa-scienna-ferro-one-ferro-5902194954525.html (EAN + cena 193,99 zł)
  // source: https://www.123lazienka.pl/produkt/23292-ferro-one-bateria-natryskowa-bez-natrysku-chrom-bfo7-5902194954525.html (EAN 5902194954525, model BFO7)
  // source: https://onninen.pl/produkt/FERRO-FERRO-ONE-bateria-natryskowa-bez-natrysku-chrom-BFO7,432032 (EAN 5902194954525)
  // source: https://northbud.pl/ferro-bateria-prysznicowa-ferro-one-bez-prysznica-chrom-bfo7-p70291 (cena brutto, odczyt 2026-10-25T18:43:42.347Z)
  {
    id: 'mat-shower-mixer-ferro-one',
    materialType: 'faucet',
    productLabel: 'Bateria natryskowa ścienna Ferro One (chrom, BFO7)',
    brand: 'Ferro',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 194.80,
    category: 'better',
    storeName: 'Northbud',
    sourceUrl:
      'https://northbud.pl/ferro-bateria-prysznicowa-ferro-one-bez-prysznica-chrom-bfo7-p70291',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Syfon umywalkowy butelkowy niski McAlpine WHB1-32 (z membraną silikonową, 5/4"×32) — EAN 5036484088390. Cena 104,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/syfon-umywalkowy-1-1-4x32-mm-z-membrana-silikonowa-i-rewizja-mcalpine-5036484088390.html (EAN + cena 104,99 zł)
  // source: https://mcalpine.pl/product/syfon-umywalkowy-niski-bialy-whb1-32/ (model WHB1-32, EAN 5036484088390)
  // source: https://www.blu.com.pl/syfony-i-polsyfony-do-umywalek/29748-mcalpine-whb1-32-5036484088390.html (EAN 5036484088390)
  // source: https://www.blu.com.pl/syfony-i-polsyfony-do-umywalek/29748-mcalpine-whb1-32-5036484088390.html (cena brutto, odczyt 2026-10-25T15:14:57.075Z)
  {
    id: 'mat-basin-trap-mcalpine-whb1-32',
    materialType: 'trap',
    productLabel: 'Syfon umywalkowy butelkowy niski McAlpine WHB1-32 (z membraną)',
    brand: 'McAlpine',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 108.86,
    category: 'better',
    storeName: 'BLU',
    sourceUrl:
      'https://www.blu.com.pl/syfony-i-polsyfony-do-umywalek/29748-mcalpine-whb1-32-5036484088390.html',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Rura wielowarstwowa PEX-AL/PEX Tycner 16×2 mm — EAN 5901095517976. Sprzedawana na metry (rolka 200 mb), cena 4,99 zł/mb (Mrówka).
  // source: https://mrowka.com.pl/produkt/rura-pex-al-pex-16-mmx2-200-mb-tycner-5901095517976.html (EAN + cena 4,99 zł/mb)
  // source: https://www.plus-market.pl/pl/p/Rura-pexalpex-16-mmx2-1mb/12990 (EAN 5901095517976, sprzedaż na mb)
  // source: https://www.plus-market.pl/pl/p/Rura-pexalpex-16-mmx2-1mb/12990 (cena brutto, odczyt 2026-10-25T15:14:56.417Z)
  {
    id: 'mat-pex-pipe-tycner-16x2',
    materialType: 'pipe',
    productLabel: 'Rura PEX-AL/PEX Tycner 16×2 mm (na metry)',
    brand: 'Tycner',
    packageSize: 1,
    packageUnit: 'mb',
    pricePerPackage: 3.99,
    pricePerMb: 4.99,
    category: 'standard',
    storeName: 'Plus-Market',
    sourceUrl:
      'https://www.plus-market.pl/pl/p/Rura-pexalpex-16-mmx2-1mb/12990',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Kolanko (kolano) zaciskowe PEX Tycner 16×16 mm — EAN 5901095521003. Cena 12,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html (EAN + cena 12,99 zł)
  // source: https://www.grupapsb.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html (EAN 5901095521003)
  // source: https://www.abud.pl/product-pol-64835-Kolanko-zaciskowe-PEX-16x16mm-Tycner.html (cena brutto, odczyt 2026-10-25T15:02:59.071Z)
  {
    id: 'mat-pex-elbow-tycner-16x16',
    materialType: 'fitting',
    productLabel: 'Kolanko zaciskowe PEX Tycner 16×16 mm',
    brand: 'Tycner',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 10.95,
    category: 'standard',
    storeName: 'ABUD',
    sourceUrl:
      'https://www.abud.pl/product-pol-64835-Kolanko-zaciskowe-PEX-16x16mm-Tycner.html',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Wężyk Invena WS-20-030-G, 3/8"×M10, długa końcówka, 30 cm — 11,14 zł brutto za sztukę; rzeczywisty koszyk 2026-10-26.
  // source: https://sklep.tokmet.pl/wezyk_do_baterii_stojacej_38_x_m101_l__30_cm_dluga_koncowka-2806i
  // source: https://invena.pl/produkt/wezyk-do-bat-w-opl-stal-3-8-dl-konc-30cm-3559
  // source: https://www.castorama.pl/departments/w-w-yk-przy-czeniowy-do-baterii-gw-gz-3-8-x-m10-30-cm-oplot-invena-1-szt-/5907798716258_CAPL.prd (EAN + cena 37,17 zł)
  // source: https://www.obi.pl/weze-elastyczne-flex/invena-wezyk-w-oplocie-z-gw-gz-3-8-w-x-m10-30-cm/p/4355574 (EAN 5907798716258)
  {
    id: 'mat-hose-braided-invena-3-8-30',
    materialType: 'hose',
    productLabel: 'Wężyk przyłączeniowy w oplocie Invena 3/8"×M10 30 cm',
    brand: 'Invena',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 11.14,
    category: 'standard',
    storeName: 'TOK-MET',
    sourceUrl:
      'https://sklep.tokmet.pl/wezyk_do_baterii_stojacej_38_x_m101_l__30_cm_dluga_koncowka-2806i',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
  },

  // Taśma teflonowa uszczelniająca Tycner 12 mm × 10 m × 0,075 mm — EAN 5900950618100. Cena 12,99 zł/szt (OBI).
  // source: https://www.obi.pl/uszczelki-miekkie/tycner-tasma-uszczelniajaca-teflonowa-12-x-0-075-mm-10-m/p/3499589 (EAN + cena 12,99 zł)
  // source: https://www.grupapsb.com.pl/produkt/tasma-teflonowa-12-mm-x-10-m-x-0-075-mm-tycner.html (EAN 5900950618100)
  // source: https://www.abud.pl/product-pol-6204-Tasma-teflonowa-12mm-x-10m-x-0-075mm-Tycner.html (cena brutto, odczyt 2026-10-25T15:02:58.995Z)
  {
    id: 'mat-teflon-tape-tycner-12mm',
    materialType: 'sealing-tape',
    productLabel: 'Taśma teflonowa uszczelniająca Tycner 12 mm × 10 m',
    brand: 'Tycner',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 2.00,
    category: 'economy',
    storeName: 'ABUD',
    sourceUrl:
      'https://www.abud.pl/product-pol-6204-Tasma-teflonowa-12mm-x-10m-x-0-075mm-Tycner.html',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // --- Biały montaż: ceramika sanitarna + armatura (WC / umywalka / zawory) ------
  // Materiały etapu „białego montażu" łazienki (montaż miski WC kompakt, umywalki
  // z baterią). Każdy markowy, z realnym EAN potwierdzonym w ≥2 niezależnych
  // źródłach (komentarze `// source:`) → EAN wpisany też do MATERIAL_EAN_OVERLAY
  // (api-server), więc seed:offers dopina oferty z feedów. Ceny brutto ze sklepu PL,
  // packageSize/packageUnit z opakowania handlowego (ceramika/armatura = 1 szt).
  // Uwaga: packageUnit 'szt' BEZ pricePerM2/pricePerMb — engine (getQuantityForMaterial)
  // liczy je po jednostce (liczba misek/umywalek), a nie po m².

  // Kompakt WC Cersanit Seno bezkołnierzowy 3/5 l z deską wolnoopadającą — EAN 5902115720833. Cena 698 zł/szt (Castorama).
  // source: https://www.castorama.pl/kompakt-wc-cersanit-seno-bezkolnierzowy-3-5-l-z-deska-wolnoopadajaca/5902115720833_CAPL.prd (EAN + cena 698 zł)
  // source: https://brendo.pl/produkt/miski-i-kompakty-wc/kompakt-wc-cersanit-seno-rimless-z-deska-wolnoopadajaca.html (EAN 5902115720833)
  {
    id: 'mat-wc-compact-cersanit-seno-3-5l',
    materialType: 'toilet',
    productLabel: 'Kompakt WC Cersanit Seno bezkołnierzowy 3/5 l z deską wolnoopadającą',
    brand: 'Cersanit',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 488,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/kompakt-wc-cersanit-seno-bezkolnierzowy-3-5-l-z-deska-wolnoopadajaca/5902115720833_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
  },

  // Umywalka ceramiczna Cersanit Facile 50 cm (z otworem na baterię, z przelewem, montaż na półpostumencie) — EAN 5907720650025 (K30-002). Cena ok. 148 zł/szt.
  // source: https://www.grupapsb.com.pl/produkt/umywalka-facile-50-cm-cersanit-5907720650025.html (EAN 5907720650025, otwór + półpostument FACILE)
  // source: https://mrowka.com.pl/produkt/umywalka-facile-50-cm-cersanit-5907720650025.html (EAN 5907720650025)
  // source: https://1lazienka.pl/cersanit-facile-umywalka-50-k30-002.html (cena 148 zł)
  {
    id: 'mat-washbasin-cersanit-facile-50',
    materialType: 'washbasin',
    productLabel: 'Umywalka ceramiczna Cersanit Facile 50 cm (z otworem, przelew)',
    brand: 'Cersanit',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 148.00,
    category: 'standard',
    storeName: 'Grupa PSB',
    sourceUrl:
      'https://www.grupapsb.com.pl/produkt/umywalka-facile-50-cm-cersanit-5907720650025.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Zawór kątowy z filtrem Ferro 1/2" × 3/8" chrom — EAN 5901095614033. Cena 34,98 zł/szt (Castorama).
  // source: https://www.castorama.pl/zawor-katowy-z-filtrem-ferro-1-2-x-3-8-/5901095614033_CAPL.prd (EAN + cena 34,98 zł)
  // source: https://www.ceneo.pl/30596820 (Ferro zawór kątowy 1/2 chrom, EAN 5901095614033)
  // source: https://liderzycen.pl/pl/p/Zawor-katowy-z-filtrem-Ferro-12-x-38/49055 (cena brutto, odczyt 2026-10-25T21:08:18.096Z)
  {
    id: 'mat-angle-valve-ferro-1-2-3-8',
    materialType: 'valve',
    productLabel: 'Zawór kątowy z filtrem Ferro 1/2" × 3/8" (chrom)',
    brand: 'Ferro',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 34.54,
    category: 'standard',
    storeName: 'LiderzyCen',
    sourceUrl:
      'https://liderzycen.pl/pl/p/Zawor-katowy-z-filtrem-Ferro-12-x-38/49055',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Zestaw przyłączeniowo-mocujący WC Tycner (śruby mocujące miskę, uszczelka, podkładki, nakrętki) — EAN 5901095514395 (HTWE1439). Cena 36,80 zł/szt.
  // source: https://mrowka.com.pl/produkt/zestaw-przylaczeniowo-mocujacy-wc-tycner.html (Tycner, EAN 5901095514395)
  // source: https://chemko.com.pl/tycner-zestaw-przylaczeniowo-mocujacy-wc-5901095514395,3,104355,120611 (EAN 5901095514395, cena 36,80 zł)
  {
    id: 'mat-wc-mounting-set-tycner',
    materialType: 'mounting-set',
    productLabel: 'Zestaw przyłączeniowo-mocujący WC Tycner (rury, uszczelki i akcesoria)',
    brand: 'Tycner',
    packageSize: 1,
    packageUnit: 'szt',
    // source: https://www.unimet.pl/pozostale-18/3744291-zestaw-przylaczeniowo-mocujacy-wc-5901095514395.html
    pricePerPackage: 49.95,
    category: 'standard',
    storeName: 'Unimet',
    sourceUrl:
      'https://www.unimet.pl/pozostale-18/3744291-zestaw-przylaczeniowo-mocujacy-wc-5901095514395.html',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // --- Instalacja elektryczna: przewody, gniazdka, włączniki, puszki, złączki ----
  // Materiały etapu elektrycznego (wymiana/montaż gniazdek, włączników, opraw)
  // brakujące w katalogu. Każdy markowy, z realnym EAN potwierdzonym w ≥2
  // niezależnych źródłach (komentarze `// source:`) → EAN wpisany też do
  // MATERIAL_EAN_OVERLAY (api-server), więc seed:offers dopina oferty z feedów.
  // Ceny brutto ze sklepu PL z listy akceptowanej, packageSize/packageUnit z
  // opakowania handlowego (przewody = krąg 100 mb; drobnica = szt/opak.).

  // Przewód instalacyjny płaski YDYp 3×1,5 mm² 450/750 V AKS Zielonka, krąg 100 mb — EAN 5904617573771. Cena 375 zł/100 mb (3,75 zł/mb, Castorama).
  // source: https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb/5904617573771_CAPL.prd (EAN + cena 375 zł)
  // source: https://www.gotronik.pl/przewod-aks-zielonka-ydyp-3-x-1-5mm2-450750-v-100mb-p-9372.html (EAN 5904617573771, model 816900)
  // source: https://www.abud.pl/product-pol-50450-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x1-5-100m.html (AKS Zielonka YDYp 3x1,5 100m)
  {
    id: 'mat-wire-ydyp-3x15-akszielonka-100m',
    materialType: 'wire',
    productLabel: 'Przewód YDYp 3×1,5 mm² 450/750 V AKS Zielonka (krąg 100 mb)',
    brand: 'AKS Zielonka',
    packageSize: 100,
    packageUnit: 'mb',
    pricePerPackage: 388,
    pricePerMb: 3.88,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb/5904617573771_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
  },

  // Przewód instalacyjny płaski YDYp 3×2,5 mm² 450/750 V AKS Zielonka, krąg 100 mb — EAN 5904617573764. Cena 572 zł/100 mb (5,72 zł/mb, Castorama).
  // source: https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb/5904617573764_CAPL.prd (EAN + cena 572 zł)
  // source: https://www.ceneo.pl/57270631 (AKS Zielonka YDYp 3x2,5 100 mb, EAN 5904617573764)
  // source: https://www.abud.pl/product-pol-50414-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x2-5-100m.html (AKS Zielonka YDYp 3x2,5 100m)
  {
    id: 'mat-wire-ydyp-3x25-akszielonka-100m',
    materialType: 'wire',
    productLabel: 'Przewód YDYp 3×2,5 mm² 450/750 V AKS Zielonka (krąg 100 mb)',
    brand: 'AKS Zielonka',
    packageSize: 100,
    packageUnit: 'mb',
    pricePerPackage: 598,
    pricePerMb: 5.98,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb/5904617573764_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
  },

  // Gniazdo pojedyncze z uziemieniem i przesłonami styków Kontakt-Simon Basic BMGZ1Z.01/11 białe — EAN 5902787568238. Cena 17,56 zł/szt (Castorama).
  // source: https://www.castorama.pl/departments/gniazdo-pojedyncze-kontakt-simon-basic-z-ochron-styk-w-bia-e-1-szt-/5902787568238_CAPL.prd (EAN + cena 17,56 zł)
  // source: https://www.eelektryka.com/simon-basic/3975-simon-basic-gniazdo-pojedyncze-zu-i-przeslonami-do-ramki-biale-bmgz1z0111-5902787568238.html (EAN 5902787568238, model BMGZ1Z.01/11)
  // source: https://www.eelektryka.com/simon-basic/3975-simon-basic-gniazdo-pojedyncze-zu-i-przes%C5%82onami-do-ramki-bia%C5%82e-bmgz1z0111-5902787568238.html (cena brutto, odczyt 2026-10-25T18:41:40.632Z)
  {
    id: 'mat-socket-simon-basic-bmgz1z',
    materialType: 'socket',
    productLabel: 'Gniazdo pojedyncze z uziemieniem Kontakt-Simon Basic (białe, BMGZ1Z.01/11)',
    brand: 'Kontakt-Simon',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 16.56,
    category: 'standard',
    storeName: 'Eelektryka',
    sourceUrl:
      'https://www.eelektryka.com/simon-basic/3975-simon-basic-gniazdo-pojedyncze-zu-i-przes%C5%82onami-do-ramki-bia%C5%82e-bmgz1z0111-5902787568238.html',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Łącznik (wyłącznik) pojedynczy jednobiegunowy Kontakt-Simon Basic BMW1.01/11 biały — EAN 5902787568177. Cena 14,98 zł/szt (Castorama).
  // source: https://www.castorama.pl/lacznik-pojedynczy-kontakt-simon-basic-bialy/5902787568177_CAPL.prd (EAN + cena 14,98 zł)
  // source: https://supergniazdka.pl/kontakt-simon/simon-basic/bmw101-11/lacznik-jednobiegunowy-modul-10ax-250v-szybkozlacza-bialy-5902787568177-5762.html (EAN 5902787568177, model BMW1.01/11)
  // source: https://www.elektryknet.pl/produkt/simon-basic-lacznik-jednobiegunowy-bialy-bmw101-11 (cena brutto, odczyt 2026-10-25T15:14:57.67Z)
  {
    id: 'mat-switch-simon-basic-bmw1',
    materialType: 'switch',
    productLabel: 'Łącznik pojedynczy jednobiegunowy Kontakt-Simon Basic (biały, BMW1.01/11)',
    brand: 'Kontakt-Simon',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 14.79,
    category: 'standard',
    storeName: 'ElektrykNet',
    sourceUrl:
      'https://www.elektryknet.pl/produkt/simon-basic-lacznik-jednobiegunowy-bialy-bmw101-11',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Puszka podtynkowa fi60 głęboka łączeniowa z wkrętem Elektro-Plast, opak. 10 szt. — EAN 5901752637337. Cena 14,78 zł/opak. (1,48 zł/szt, Castorama).
  // source: https://www.castorama.pl/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-/5901752637337_CAPL.prd (EAN + cena 14,78 zł)
  // source: https://www.leroymerlin.pl/produkty/puszka-instalacyjna-podtynkowa-60-mm-laczeniowa-gleboka-elektro-plast-43256024.html (Elektro-Plast puszka podtynkowa 60 mm głęboka łączeniowa)
  {
    id: 'mat-flush-box-elektroplast-pk60-10',
    materialType: 'flush-box',
    productLabel: 'Puszka podtynkowa fi60 głęboka łączeniowa z wkrętem Elektro-Plast (10 szt.)',
    brand: 'Elektro-Plast',
    packageSize: 10,
    packageUnit: 'szt',
    pricePerPackage: 15.24,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-/5901752637337_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
  },

  // Szybkozłączka uniwersalna WAGO 221-413 3×0,2-4 mm² (COMPACT, z dźwigniami), opak. 12 szt. — EAN 4050821808442 (GTIN producenta na złączkę). Cena 23,88 zł/opak. 12 szt (Leroy Merlin).
  // source: https://www.leroymerlin.pl/produkty/wago-221-413-szybkozlaczka-zlaczka-drut-linka-3x-0-2-4mm2-oryginalna-12szt-89975728.html (opak. 12 szt, cena 23,88 zł, Leroy Merlin)
  // source: https://supergniazdka.pl/wago/221-413/szybkozlaczka-zlaczka-wago-compact-z-dzwigniami-uniwersalna-02-4-mm-3-przewodowa-221-413-4050821808442-18406.html (EAN 4050821808442, 1,85 zł/szt)
  // source: https://www.eelektryka.com/z%C5%82%C4%85czki/1955-wago-szybkoz%C5%82%C4%85czka-uniwersalna-3x02-4mm2-transparentna-221-413-opak-50szt-4050821808442.html (EAN 4050821808442)
  {
    id: 'mat-wire-connector-wago-221-413',
    materialType: 'wire-connector',
    productLabel: 'Szybkozłączka uniwersalna WAGO 221-413 3×0,2-4 mm² (1 szt.)',
    brand: 'WAGO',
    packageSize: 1,
    packageUnit: 'szt',
    // source: https://www.prescot.com.pl/pl/p/ZLACZKA-WAGO-221-413-3X4mm-LINKADRUT-NO-WA/11528
    pricePerPackage: 2.75,
    category: 'standard',
    storeName: 'Prescot',
    sourceUrl:
      'https://www.prescot.com.pl/pl/p/ZLACZKA-WAGO-221-413-3X4mm-LINKADRUT-NO-WA/11528',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // --- Układanie paneli podłogowych: panele AC4/AC5, podkład, folia, listwy, klipsy -
  // Materiały etapu układania paneli (laminate-flooring / underlay-install) brakujące
  // w katalogu. Każdy markowy, z realnym EAN potwierdzonym w ≥2 niezależnych źródłach
  // (komentarze `// source:`) → EAN wpisany też do MATERIAL_EAN_OVERLAY (api-server),
  // więc seed:offers dopina oferty z feedów. Ceny brutto ze sklepu PL z listy
  // akceptowanej; packageSize/packageUnit z opakowania handlowego (panele = m²/paczka,
  // podkład/folia = m²/rolka, listwa = mb, klipsy = szt/opak.). Tier rośnie z klasą
  // ścieralności AC (economy AC4 budżet → standard AC4 markowy → better AC5 wodoodporny).

  // Panele laminowane AC4 8 mm Kronospan Toledo (K338), 9 szt. = 2,22 m²/paczka — EAN 5907555422774. Cena 88,76 zł/paczka (39,98 zł/m², Castorama). Markowy AC4 do pomieszczeń o średnim natężeniu ruchu.
  // source: https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd (EAN 5907555422774, cena 88,76 zł, AC4, 8 mm, 2,22 m²)
  // source: https://www.ceneo.pl/153535733 (Kronospan Toledo AC4 K338, EAN 5907555422774)
  {
    id: 'mat-laminate-kronospan-toledo-ac4-222',
    materialType: 'laminate',
    productLabel: 'Panele laminowane AC4 8 mm Kronospan Toledo (2,22 m²/paczka)',
    brand: 'Kronospan',
    packageSize: 2.22,
    packageUnit: 'm2',
    pricePerPackage: 88.76,
    pricePerM2: 39.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Panele Classen Dąb Niasa AC5 8 mm, 8 szt. = 1,973 m²/paczka — EAN 4003992571974.
  // source: https://www.castorama.pl/panele-podlogowe-laminowane-wodoodporne-classen-dab-niasa-ac5-1-973-m2/4003992571974_CAPL.prd (identyfikacja EAN i opakowania; aktualna oferta poniżej)
  // source: https://www.ceneo.pl/104295353 (Classen Dąb Niasa AC5 1,973 m2, EAN 4003992571974)
  // source: https://eadamex.pl/panele-podlogowe/11020-panel-dab-niasa-expedition-ac5-8mm-classen-op1973m2-4003992571974.html (EAN 4003992571974 w URL)
  // source: https://liderzycen.pl/pl/p/Panele-podlogowe-laminowane-wodoodporne-Classen-Dab-Niasa-AC5-1%2C973-m2/31535 (cena brutto, odczyt 2026-10-25T20:58:53.720Z)
  {
    id: 'mat-laminate-classen-niasa-ac5-1973',
    materialType: 'laminate',
    productLabel: 'Panele laminowane wodoodporne AC5 8 mm Classen Dąb Niasa (1,973 m²/paczka)',
    brand: 'Classen',
    packageSize: 1.973,
    packageUnit: 'm2',
    pricePerPackage: 112.42,
    pricePerM2: 56.98,
    category: 'better',
    storeName: 'LiderzyCen',
    sourceUrl:
      'https://liderzycen.pl/pl/p/Panele-podlogowe-laminowane-wodoodporne-Classen-Dab-Niasa-AC5-1%2C973-m2/31535',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Podkład podłogowy pod panele Arbiton XPS Smart Aquastop Thermo 1,6 mm, rolka/harmonijka 6 m² (3w1 z zintegrowaną folią paroizolacyjną) — EAN 5905167826942. Cena 70,68 zł/opak. (11,78 zł/m², Castorama). Do ogrzewania podłogowego, redukcja hałasu do 19 dB.
  // source: https://www.castorama.pl/podklad-podlogowy-pod-panele-laminowane-arbiton-xps-smart-aquastop-thermo-1-6-mm-6-m2/5905167826942_CAPL.prd (EAN 5905167826942, cena 70,68 zł, 6 m²)
  // source: https://arbiton.com/pl/podklady-pod-panele/podklady-pod-panele-laminowane/arbiton-secura-thermo-aquastop-smart-podklady-pod-panele-laminowane (Arbiton — karta serii XPS Smart Aquastop Thermo)
  // source: https://rodimax.pl/Podk%C5%82ad-pod-panele-Arbiton-XPS-Smart-Aquastop-Thermo-1%2C6-mm-6-m2.html (cena brutto, odczyt 2026-10-25T15:20:52.478Z)
  // source: https://kronodom.pl/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-16mm-1opk.6m2-czerwona-harmonijka (cena brutto, odczyt 2026-10-25T19:11:03.326Z)
  {
    id: 'mat-underlay-arbiton-xps-aquastop-6m2',
    materialType: 'underlay',
    productLabel: 'Podkład Arbiton XPS Smart Aquastop Thermo 1,6 mm (6 m²)',
    brand: 'Arbiton',
    packageSize: 6,
    packageUnit: 'm2',
    pricePerPackage: 61.98,
    pricePerM2: 10.33,
    category: 'standard',
    storeName: 'Kronodom',
    sourceUrl:
      'https://kronodom.pl/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-16mm-1opk.6m2-czerwona-harmonijka',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Folia paroizolacyjna PE Diall 0,15 mm, rolka 2 × 10 m = 20 m² — EAN 5059340141428. Cena 89,60 zł/rolka (4,48 zł/m², Castorama). Polietylen (PE), zabezpiecza panele przed wilgocią z podłoża.
  // source: https://www.castorama.pl/folia-paroizolacyjna-diall-20-m2/5059340141428_CAPL.prd (EAN 5059340141428, cena 89,60 zł, PE 0,15 mm, 20 m²)
  // source: https://www.ceneo.pl/50305654 (Diall Membrana paroizolacyjna 20 m2, EAN 5059340141428)
  {
    id: 'mat-vapor-foil-diall-pe-20m2',
    materialType: 'vapor-barrier',
    productLabel: 'Folia paroizolacyjna PE Diall 0,15 mm (20 m²)',
    brand: 'Diall',
    packageSize: 20,
    packageUnit: 'm2',
    pricePerPackage: 89.60,
    pricePerM2: 4.48,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/folia-paroizolacyjna-diall-20-m2/5059340141428_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Listwa przypodłogowa MDF biała Krono Original LK100F, wys. 100 mm, dł. 2,4 mb — EAN 5907555424969. Cena 26,98 zł/szt. (11,24 zł/mb, Castorama). Do maskowania szczeliny dylatacyjnej przy ścianie.
  // source: https://www.castorama.pl/listwa-przypodlogowa-mdf-krono-original-biala-lk100f/5907555424969_CAPL.prd (EAN 5907555424969, cena 26,98 zł/szt = 11,24 zł/mb, 2,4 m, wys. 100 mm)
  // source: https://www.castorama.pl/plytki-i-podlogi/akcesoria-do-podlog/listwyprzypodlogowe/listwy-przypodlogowe-mdf.cat (Krono Original LK100F w kategorii listew MDF Castorama)
  {
    id: 'mat-skirting-krono-lk100f-mdf-240',
    materialType: 'skirting',
    productLabel: 'Listwa przypodłogowa MDF biała Krono Original LK100F (2,4 mb)',
    brand: 'Krono Original',
    packageSize: 2.4,
    packageUnit: 'mb',
    pricePerPackage: 26.98,
    pricePerMb: 11.24,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/listwa-przypodlogowa-mdf-krono-original-biala-lk100f/5907555424969_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Klipsy montażowe do listew przypodłogowych Cezar z podkładką dystansową, opak. 25 szt. — EAN 5907684672217. Cena 49,98 zł/opak. (2,00 zł/szt, Castorama). Szybki montaż listwy bez uszkodzeń, dystans 3 mm.
  // source: https://www.castorama.pl/klipsy-montazowe-do-listew-cezar-25-szt-/5907684672217_CAPL.prd (EAN 5907684672217, cena 49,98 zł, 25 szt.)
  // source: https://decorsystem.com.pl/klipsy-montazowe-do-listew-przypodlogowych-25-szt-cezar,id19262.html (Cezar klipsy montażowe 25 szt.)
  // source: https://listwy.sklep.pl/pl/p/Klips-montazowy-z-podkladka-dystansowa-do-montazu-listew-1opak25szt-MASTER-LINE-CEZAR/687 (cena brutto, odczyt 2026-10-25T16:39:02.235Z)
  {
    id: 'mat-skirting-clips-cezar-25',
    materialType: 'skirting-clip',
    productLabel: 'Klipsy montażowe do listew Cezar (25 szt.)',
    brand: 'Cezar',
    packageSize: 25,
    packageUnit: 'szt',
    pricePerPackage: 38.00,
    category: 'standard',
    storeName: 'KELOT',
    sourceUrl:
      'https://listwy.sklep.pl/pl/p/Klips-montazowy-z-podkladka-dystansowa-do-montazu-listew-1opak25szt-MASTER-LINE-CEZAR/687',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // --- Etap glazury: płytki ceramiczne / gres + akcesoria (fuga, krzyżyki, profil) ---
  // Materiały markowe z REALNYM EAN (≥2 niezależne źródła w komentarzach `// source:`).
  // Tiery per klasa/format: standard = gres szkliwiony 60×60, better = gres rektyfikowany.
  // Płytki: cena za m² i za rzeczywistą paczkę; packageSize określa jej pokrycie.
  // Akcesoria za opakowanie. Historyczna data ceny nie potwierdza aktualnej oferty.

  // Gres szkliwiony Ceramika Paradyż Petro Grey struktura mat 60×60 cm — EAN 5904584161544.
  // source: https://neoceramik.pl/pl/p/Paradyz-PETRO-GREY-GRES-SZKL.-STRUKTURA-MAT.-60X60-G2/23079150 (EAN 5904584161544, cena 69,00 zł/m²)
  // source: https://www.leroymerlin.pl/produkty/gres-szkliwiony-petro-grey-mat-60x60-paradyz-92495587.html (Paradyż Petro Grey mat 60x60, EAN 5904584161544)
  {
    id: 'mat-gres-paradyz-petro-grey-60x60',
    materialType: 'tile',
    productLabel: 'Gres szkliwiony Paradyż Petro Grey struktura mat 60×60 cm, gatunek 2',
    brand: 'Ceramika Paradyż',
    // source: https://taniaplytka.pl/produkty/paradyz-petro-grey-struktura-mat-600x600-2 (1,44 m², 4 szt.)
    packageSize: 1.44,
    packageUnit: 'm2',
    pricePerPackage: 99.36, // historyczne 69 zł/m² × pełna paczka, nie aktualna oferta
    pricePerM2: 69.0,
    category: 'standard',
    storeName: 'neoCERAMIK',
    sourceUrl:
      'https://neoceramik.pl/pl/p/Paradyz-PETRO-GREY-GRES-SZKL.-STRUKTURA-MAT.-60X60-G2/23079150',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Płytka ścienna łazienkowa Ceramika Paradyż Nati Bianco struktura 25×40 cm — EAN 5902610507960.
  // source: https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/ (EAN 5902610507960, cena 74,88 zł/m²)
  // source: https://www.ceneo.pl/70865330 (Paradyż Nati Bianco str 25x40, EAN 5902610507960)
  {
    id: 'mat-tile-wall-paradyz-nati-bianco-25x40',
    materialType: 'tile',
    productLabel: 'Płytka ścienna Paradyż Nati Bianco struktura 25×40 cm',
    brand: 'Ceramika Paradyż',
    // source: https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/ (1,2 m², 12 szt.)
    packageSize: 1.2,
    packageUnit: 'm2',
    pricePerPackage: 89.86, // historyczne 74,88 zł/m² × pełna paczka, nie aktualna oferta
    pricePerM2: 74.88,
    category: 'standard',
    storeName: 'eLazienki',
    sourceUrl:
      'https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Gres szkliwiony REKTYFIKOWANY Ceramika Paradyż U117 (Ennis) Grey mat 59,8×59,8 cm — EAN 5904584158261.
  // source: https://www.blu.com.pl/plytki-podlogowe/34276-ceramika-paradyz-u117-grey-gres-szkl-rekt-mat-5904584158261.html (historyczna identyfikacja EAN; aktualna wycena poniżej)
  // source: https://dekordia.pl/produkt/paradyz-u117-grey-gres-mat-rektyfikowany-59-8x59-8.html (Paradyż U117 Grey rekt., EAN 5904584158261)
  // source: https://modnalazienka.pl/u117-grey-gres-szkl-rekt-mat-598x598-34158 (cena brutto, odczyt 2026-10-25T20:35:39.695Z)
  {
    id: 'mat-gres-rekt-paradyz-u117-grey-60x60',
    materialType: 'tile',
    productLabel: 'Gres szkliwiony rektyfikowany Paradyż U117 (Ennis) Grey mat 59,8×59,8 cm',
    brand: 'Ceramika Paradyż',
    packageSize: 1.43,
    packageUnit: 'm2',
    pricePerPackage: 107.29,
    pricePerM2: 75.03,
    category: 'better',
    storeName: 'Modna Łazienka',
    sourceUrl:
      'https://modnalazienka.pl/u117-grey-gres-szkl-rekt-mat-598x598-34158',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Fuga ceramiczna Atlas 001 biała 2 kg (spoina 1–20 mm, elastyczna) — EAN 5905400572254.
  // source: https://sklep.sewera.pl/atlas-fuga-ceramiczna-001-bialy-2kg-p11674
  // source: https://www.atlas.com.pl/wp-content/uploads/2026/08/atlas_fuga_ceramiczna_plik_karta-techniczna.pdf
  // source: https://www.obi.pl/p/6552095/atlas-fuga-ceramiczna-001-bialy-2-kg (OBI: Atlas Fuga ceramiczna 001 biały 2 kg, EAN 5905400572254)
  {
    id: 'mat-grout-atlas-001-white-2kg',
    materialType: 'grout',
    productLabel: 'Fuga ceramiczna Atlas 001 biała 2 kg',
    brand: 'Atlas',
    packageSize: 2,
    packageUnit: 'kg',
    pricePerPackage: 26.90,
    category: 'standard',
    storeName: 'Sewera',
    sourceUrl: 'https://sklep.sewera.pl/atlas-fuga-ceramiczna-001-bialy-2kg-p11674',
    lastUpdated: '2026-10-29',
    currency: 'PLN',
    notes: 'Atlas Fuga Ceramiczna 001 biała, worek 2 kg. Spoiny 1–20 mm. Zużycie zależy od powierzchni, formatu płytek i przekroju spoin; wzór producenta stosuje gęstość gotowej spoiny 1650 kg/m³. Rzeczywistą głębokość wypełnienia należy zmierzyć. Zmywanie wodą: wstępne ok. 10–30 min, końcowe ok. 4–8 h; pierwsze mycie detergentem po 14 dniach według karty. Kolor i partię sprawdź na próbce. Długie działanie kwasu osłabia hydrofobowość.',
  },

  // Krzyżyki dystansowe do płytek Hardy (KAEM) 2 mm, 200 szt. — EAN 5905061016845.
  // source: https://mrowka.com.pl/produkt/krzyzyki-dystansowe-2-mm-200-szt-hardy-5905061016845.html (EAN 5905061016845, cena 3,99 zł/op.)
  // source: https://www.bricomarche.pl/krzyzyki-dystansowe-do-glazury-2-mm-biale-woreczek-200-sztuk-hardy (Bricomarché: Hardy krzyżyki 2 mm, 200 szt.)
  {
    id: 'mat-tile-spacers-hardy-2mm-200',
    materialType: 'tile-spacer',
    productLabel: 'Krzyżyki dystansowe do płytek Hardy 2 mm (200 szt.)',
    brand: 'Hardy',
    packageSize: 200,
    packageUnit: 'szt',
    pricePerPackage: 3.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/krzyzyki-dystansowe-2-mm-200-szt-hardy-5905061016845.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Profil narożny (zewnętrzny) do glazury Cezar aluminiowy 8 mm, tytan szczotkowany mat, 2,5 m — EAN 5904584853500.
  // source: https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m (EAN 5904584853500, cena 27,32 zł/szt, dł. 2,5 m)
  // source: https://www.leroymerlin.pl/produkty/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m-96115864.html (Leroy Merlin: Cezar profil narożny 8 mm 2,5 m)
  {
    id: 'mat-tile-trim-cezar-corner-8mm-25m',
    materialType: 'tile-trim',
    productLabel: 'Profil narożny do glazury Cezar aluminiowy 8 mm, tytan szczotkowany mat, 2,5 m',
    brand: 'Cezar',
    packageSize: 2.5,
    packageUnit: 'mb',
    pricePerPackage: 27.32,
    pricePerMb: 10.93, // 27,32 zł / 2,5 m
    category: 'standard',
    storeName: 'Cezar',
    sourceUrl:
      'https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // --- Etap hydroizolacji łazienki: masy w płynie / taśma / narożniki / mankiet ---
  // Bazowa masa na m² = DOKŁADNIE jedna na tier (economy/standard = Woder E 1K,
  // better = Woder Duo 2K), żeby engine nie liczył podwójnie hydroizolacji.

  // Masa hydroizolacyjna 1-składnikowa (folia w płynie) Atlas Woder E 15 kg — EAN 5905400514506.
  // Zużycie ok. 2 kg/m² przy hydroizolacji (2 warstwy). source: karta techniczna Atlas.
  // source: https://mrowka.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html (EAN 5905400514506, cena 311,99 zł)
  // source: https://www.grupapsb.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html (EAN 5905400514506)
  {
    id: 'mat-waterproof-membrane-atlas-woder-e-15kg',
    materialType: 'waterproofing',
    productLabel: 'Folia w płynie (masa hydroizolacyjna 1-składnikowa) Atlas Woder E 15 kg',
    brand: 'Atlas',
    packageSize: 15,
    packageUnit: 'kg',
    pricePerPackage: 311.99,
    category: 'economy',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Gotowa do użycia, elastyczna. Ok. 2 kg/m² dla pełnej hydroizolacji (2 warstwy).',
  },

  // Hydroizolacja 2-składnikowa elastyczna Atlas Woder Duo 16 kg (komponent A 12 kg + B 4 kg) — EAN 5905400195088.
  // Wyższa klasa: mostkuje rysy podłoża, na podłoża odkształcalne/baseny. source: karta techniczna Atlas.
  // source: https://www.castorama.pl/hydroizolacja-atlas-woder-duo-16-kg/5905400195088_CAPL.prd (EAN 5905400195088, cena 268 zł)
  // source: https://mrowka.com.pl/produkt/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16-kg-atlas-5905400195088.html (EAN 5905400195088)
  {
    id: 'mat-waterproof-membrane-atlas-woder-duo-16kg',
    materialType: 'waterproofing',
    productLabel: 'Hydroizolacja 2-składnikowa elastyczna Atlas Woder Duo 16 kg',
    brand: 'Atlas',
    packageSize: 16,
    packageUnit: 'kg',
    pricePerPackage: 268,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/hydroizolacja-atlas-woder-duo-16-kg/5905400195088_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Zaprawa dwuskładnikowa (A suchy + B płynny), mostkuje rysy do 1 mm. Ok. 1,75 kg/m²/1 mm.',
  },

  // Taśma uszczelniająca do naroży i dylatacji Ceresit CL 152, 10 m — EAN 5900089115211.
  // Wzmacnia powłoki wodoszczelne CL 50/51, CR 166 w narożach ściana-podłoga.
  // source: https://www.castorama.pl/tasma-uszczelniajaca-ceresit-cl-152-10-m/5900089115211_CAPL.prd (EAN 5900089115211, cena 168 zł)
  // source: https://eadamex.pl/tasmy-hydroizolacyjne/8303-tasma-uszczelniajaca-cl152-ceresit-10m-op-5900089115211.html (EAN 5900089115211)
  {
    id: 'mat-sealing-tape-ceresit-cl152-10m',
    materialType: 'sealing-tape',
    productLabel: 'Taśma uszczelniająca Ceresit CL 152, 10 m',
    brand: 'Ceresit',
    packageSize: 10,
    packageUnit: 'm',
    pricePerPackage: 168,
    pricePerMb: 16.8, // 168 zł / 10 m
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/tasma-uszczelniajaca-ceresit-cl-152-10-m/5900089115211_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Narożnik uszczelniający WEWNĘTRZNY Mapei Mapeband W (profil 90°) — EAN 8022452113802.
  // Do naroży wklęsłych ściana-ściana / ściana-podłoga; zatapiany w masie.
  // source: https://www.castorama.pl/naroznik-uszczelniajacy-wewnetrzny-mapei/8022452113802_CAPL.prd (EAN 8022452113802, cena 20,98 zł)
  // source: https://eadamex.pl/narozniki-hydroizolacyjne/8290-naroznik-wewnetrzny-mapei-mapeband-w-profil-90-8022452113802.html (EAN 8022452113802)
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-naroznik-wewnetrzny/3089 (cena brutto, odczyt 2026-10-25T15:14:55.689Z)
  {
    id: 'mat-sealing-corner-internal-mapei',
    materialType: 'sealing-corner',
    productLabel: 'Narożnik uszczelniający wewnętrzny Mapei Mapeband W (90°)',
    brand: 'Mapei',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 12.87,
    category: 'standard',
    storeName: 'WinBud',
    sourceUrl:
      'https://winbud24.pl/pl/p/Mapei-Mapeband-W-naroznik-wewnetrzny/3089',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Narożnik uszczelniający ZEWNĘTRZNY Mapei Mapeband W (profil 270°) — EAN 8022452113789.
  // Do naroży wypukłych (np. obudowa wanny, ścianka działowa).
  // source: https://www.castorama.pl/naroznik-uszczelniajacy-zewnetrzny-mapei/8022452113789_CAPL.prd (EAN 8022452113789, cena 20,98 zł)
  // source: https://eadamex.pl/narozniki-hydroizolacyjne/8291-naroznik-zewnatrzny-mapei-mapeband-w-profil-270-8022452113789.html (EAN 8022452113789)
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-naroznik-zewnetrzny/3090 (cena brutto, odczyt 2026-10-25T15:14:55.785Z)
  {
    id: 'mat-sealing-corner-external-mapei',
    materialType: 'sealing-corner',
    productLabel: 'Narożnik uszczelniający zewnętrzny Mapei Mapeband W (270°)',
    brand: 'Mapei',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 12.87,
    category: 'better',
    storeName: 'WinBud',
    sourceUrl:
      'https://winbud24.pl/pl/p/Mapei-Mapeband-W-naroznik-zewnetrzny/3090',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
  },

  // Mankiet uszczelniający ŚCIENNY Mapei Mapeband W 12×12 cm, 2 szt. — EAN 8022452113925.
  // Do przejść rur pod baterie/zawory; zatapiany w masie hydroizolacyjnej.
  // source: https://www.castorama.pl/mankiet-uszczelniajacy-mapei-maly-2-szt-/8022452113925_CAPL.prd (EAN 8022452113925, cena 37,98 zł / 2 szt.)
  // source: https://www.obi.pl/pozostale-akcesoria-do-plytek/mapei-mankiet-uszczelniajacy-mapeband-w/p/2761617 (Mapei Mapeband W mankiet 12×12 cm)
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-mankiet-120-x120mm%2C-scienny/3092 (cena brutto, odczyt 2026-10-25T15:14:55.93Z)
  {
    id: 'mat-sealing-cuff-wall-mapei-12x12-2',
    materialType: 'sealing-cuff',
    productLabel: 'Mankiet uszczelniający ścienny Mapei Mapeband W 12×12 cm, 2 szt.',
    brand: 'Mapei',
    packageSize: 2,
    packageUnit: 'szt',
    pricePerPackage: 24.50,
    category: 'better',
    storeName: 'WinBud',
    sourceUrl:
      'https://winbud24.pl/pl/p/Mapei-Mapeband-W-mankiet-120-x120mm%2C-scienny/3092',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
    notes: 'Do uszczelnienia przejść rur pod baterie/wypływy w strefie mokrej.',
  },

  // --- Etap przygotowania podłoża pod podłogi: wylewki/podkłady + akcesoria ---
  // Materiały markowe z REALNYM EAN (≥2 niezależne źródła w komentarzach `// source:`).
  // Job: self-leveling (data/jobs/floor-prep.ts). Tiery per zakres grubości/klasa
  // wylewki (DOKŁADNIE JEDNA wylewka bazowa/tier — engine liczy każdą pozycję na
  // całą powierzchnię, więc dwie wylewki w jednym tierze podwoiłyby masę). Grunt
  // (mat-primer-deep-atlas-unigrunt-5kg) i folia PE (mat-vapor-foil-diall-pe-20m2)
  // reużyte z katalogu. NIE ruszamy istniejących materiałów. Wylewki wyceniane za kg
  // (pricePerKg), taśma za mb (pricePerMb) — spójnie z formułami joba.

  // Samopoziomujący podkład podłogowy Atlas SAM 200 25 kg (anhydrytowy, 25–60 mm) — EAN 5905400279269. Cena 36,98 zł/worek (1,48 zł/kg, Castorama). Grubszy jastrych/podkład pod ogrzewanie podłogowe. Zużycie ok. 20 kg/m²/10 mm.
  // source: https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-200-25-kg/5905400279269_CAPL.prd (EAN 5905400279269, cena 36,98 zł, 25 kg, 25–60 mm)
  // source: https://b2c.makchemia.pl/wylewki-samopoziomujace/5233-atlas-sam-200-25kg-2560mm-folia-5905400279269.html (EAN 5905400279269, Atlas SAM 200 25 kg)
  {
    id: 'mat-screed-atlas-sam200-25kg',
    materialType: 'screed',
    productLabel: 'Samopoziomujący podkład podłogowy Atlas SAM 200 25 kg (25–60 mm)',
    brand: 'Atlas',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 36.98,
    pricePerKg: 1.48,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-200-25-kg/5905400279269_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Zużycie ok. 20 kg/m² na 10 mm grubości. Grubsza warstwa 25–60 mm (jastrych), tylko wewnątrz, dobra pod ogrzewanie podłogowe.',
  },

  // Samopoziomujący podkład podłogowy Atlas SAM 100 25 kg (szybkowiążący, 5–30 mm) — EAN 5905400279245. Cena 43,98 zł/worek (1,76 zł/kg, Castorama). Zużycie ok. 20 kg/m²/10 mm.
  // source: https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-100-25-kg/5905400279245_CAPL.prd (EAN 5905400279245, cena 43,98 zł, 25 kg, 5–30 mm)
  // source: https://www.bricomarche.pl/szybkowiazacy-samopoziomujacy-podklad-podlogowy-sam-100-25-kg-atlas (EAN 5905400279245, Atlas SAM 100 25 kg)
  {
    id: 'mat-screed-atlas-sam100-25kg',
    materialType: 'screed',
    productLabel: 'Samopoziomujący podkład podłogowy Atlas SAM 100 25 kg (5–30 mm)',
    brand: 'Atlas',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 43.98,
    pricePerKg: 1.76,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-100-25-kg/5905400279245_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Zużycie ok. 20 kg/m² na 10 mm grubości. Warstwa 5–30 mm, wyrównanie pod płytki/panele/parkiet w pomieszczeniach suchych.',
  },

  // Zaprawa samopoziomująca Ceresit CN 72 25 kg (cienkowarstwowa wykończeniowa, 1–20 mm) — EAN 5900089272259. Cena 81,68 zł/worek (3,27 zł/kg, E-Kowalczyk). Zużycie ok. 1,6 kg/m²/mm. Premium finisz pod płytki/panele/parkiet.
  // source: https://www.grupapsb.com.pl/produkt/zaprawa-wyrownujaca-cn72-25-kg-ceresit-5900089272259.html (EAN 5900089272259, Ceresit CN 72 25 kg)
  // source: https://sklep-kowalczyk.pl/ceresit-cn-72-zaprawa-samopoziomujaca-25-kg-219136.html (EAN 5900089272259, cena 81,68 zł, 25 kg)
  {
    id: 'mat-screed-ceresit-cn72-25kg',
    materialType: 'screed',
    productLabel: 'Zaprawa samopoziomująca Ceresit CN 72 25 kg (1–20 mm)',
    brand: 'Ceresit',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 81.68,
    pricePerKg: 3.27,
    category: 'better',
    storeName: 'E-Kowalczyk',
    sourceUrl:
      'https://sklep-kowalczyk.pl/ceresit-cn-72-zaprawa-samopoziomujaca-25-kg-219136.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Zużycie ok. 1,6 kg/m² na 1 mm grubości. Cienka warstwa 1–20 mm, szybkoschnąca (ruch po 3 h), pod ogrzewanie podłogowe.',
  },

  // Taśma brzegowa (dylatacyjna obwodowa) Fola 5 mm × 100 mm × 50 mb — EAN 5906725207227. Cena 35,48 zł/rolka (0,71 zł/mb, Castorama). PE, przyklejana przy ścianach pod wylewkę — kompensuje pracę posadzki.
  // source: https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd (EAN 5906725207227, cena 35,48 zł, 5 mm × 10 cm × 50 mb)
  // source: https://www.nokaut.pl/akcesoria-do-drzwi/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2-5906725207227.html (EAN 5906725207227, Fola taśma brzegowa 50 mb)
  {
    id: 'mat-edge-tape-fola-100mm-50m',
    materialType: 'expansion-tape',
    productLabel: 'Taśma brzegowa dylatacyjna Fola 5 mm × 100 mm × 50 mb',
    brand: 'Fola',
    packageSize: 50,
    packageUnit: 'mb',
    pricePerPackage: 35.48,
    pricePerMb: 0.71,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
    notes: 'Obwodowa dylatacja przy ścianach — układana przed wylaniem masy, zapobiega pękaniu posadzki przy pracy budynku.',
  },

  // --- Etap montażu okien / parapetów: piana + taśma + parapet + kotwy + silikon ---
  // Etap „okna" (data/jobs/windows.ts: window-sealing, windowsill-install) miał w
  // katalogu tylko piankę Tytan i silikon sanitarny. Dokładamy markowe materiały
  // montażowe z realnym EAN (≥2 niezależne sklepy PL w // source), by pełne tiery
  // economy/standard/better joba miały pokrycie. Ceny brutto ze sklepu, packageSize
  // z opakowania handlowego. EAN 2-źródłowe wpisane też do MATERIAL_EAN_OVERLAY
  // (api-server). DOKŁADNIE jeden parapet i jedna piana na tier w mappings.ts —
  // inaczej engine (getQuantityForMaterial) policzyłby je na całą długość okien 2×.

  // Pianka montażowa Soudal Low Expansion pistoletowa zimowa 750 ml — EAN 5411183048522.
  // Niskorozprężna (bezpieczna dla ościeżnic), praca do -10°C, izolacja akust. do -58 dB.
  // source: https://www.castorama.pl/pianka-montazowa-soudal-low-expansion-pistoletowa-zimowa-750-ml/5411183048522_CAPL.prd (EAN + cena 47,48 zł)
  // source: https://mrowka.com.pl/produkt/soudafoam-low-expansion-gun-10-c-750-ml-soudal-5411183048522.html (EAN 5411183048522)
  {
    id: 'mat-foam-soudal-lowexp-750ml',
    materialType: 'foam',
    productLabel: 'Pianka montażowa Soudal Low Expansion pistoletowa zimowa 750 ml',
    brand: 'Soudal',
    packageSize: 750,
    packageUnit: 'ml',
    pricePerPackage: 47.48,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/pianka-montazowa-soudal-low-expansion-pistoletowa-zimowa-750-ml/5411183048522_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Niskorozprężna — nie rozpiera ościeżnicy. 1 puszka na ok. 8–10 mb szczeliny. Wariant premium względem Tytan Professional 65.',
  },

  // Silikon uniwersalny Soudal 280 ml bezbarwny — EAN 5411183157552.
  // Uszczelnienie styku ościeżnica/ściana, parapet, przeszklenia; odporność -60…180°C.
  // source: https://www.castorama.pl/silikon-uniwersalny-soudal-280-ml-bezbarwny/5411183157552_CAPL.prd (EAN + cena 27,48 zł)
  // source: https://eadamex.pl/silikony-uniwersalne/7305-silikon-uniwersalny-bezbarwny-280ml-soudal-5411183157552.html (EAN 5411183157552)
  {
    id: 'mat-silicone-universal-soudal-280ml',
    materialType: 'silicone',
    productLabel: 'Silikon uniwersalny Soudal 280 ml bezbarwny',
    brand: 'Soudal',
    packageSize: 280,
    packageUnit: 'ml',
    pricePerPackage: 27.48,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/silikon-uniwersalny-soudal-280-ml-bezbarwny/5411183157552_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Uniwersalny (dekarsko-budowlany) — styk ościeżnicy ze ścianą, parapet, przeszklenia. Bezbarwny.',
  },

  // Kotwa montażowa do ościeżnic (rama okienna/drzwiowa) 10 × 182 mm — EAN 5905458019787.
  // Stalowa ocynkowana, do betonu/cegły/betonu komórkowego; sprzedawana na sztuki.
  // source: https://www.castorama.pl/kotwa-montazowa-do-oscieznic-10-x-182-mm/5905458019787_CAPL.prd (EAN + cena 5,28 zł/szt)
  // source: https://www.brendo.pl/produkt/kotwy/kotwa-montazowa-do-oscieznic-10-x-182-mm-5905458019787.html (EAN 5905458019787)
  // source: https://liderzycen.pl/pl/p/Kotwa-montazowa-do-oscieznic-10-x-182-mm/21842 (cena brutto, odczyt 2026-10-25T21:29:16.926Z)
  {
    id: 'mat-window-frame-anchor-10x182',
    materialType: 'anchor',
    productLabel: 'Kotwa montażowa do ościeżnic (rama okienna) 10 × 182 mm',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 5.12,
    category: 'standard',
    storeName: 'LiderzyCen',
    sourceUrl:
      'https://liderzycen.pl/pl/p/Kotwa-montazowa-do-oscieznic-10-x-182-mm/21842',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
    notes: 'Mocowanie ramy okiennej/ościeżnicy w murze. Kilka sztuk na okno (bok co ok. 60–70 cm).',
  },

  // Taśma paroszczelna okienna Soudal SWS Basic Plus Inside 90 mm × 30 m — EAN 5411183151178.
  // Wewnętrzna warstwa „ciepłego montażu" — chroni piankę przed parą wodną od strony pomieszczenia.
  // Produkt specjalistyczny (poza asortymentem marketów) — cena ze sklepu budowlanego PL.
  // source: https://bestbudowa.pl/tasmy-uszczelniajace-/8055-soudal-tasma-okienna-sws-basic-plus-90-inside-90mmx30m-5411183151178.html (EAN + cena 171,60 zł)
  // source: https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html (EAN 5411183151178)
  {
    id: 'mat-window-tape-soudal-sws-inside-90mm',
    materialType: 'window-tape',
    productLabel: 'Taśma paroszczelna okienna Soudal SWS Basic Plus Inside 90 mm × 30 m',
    brand: 'Soudal',
    packageSize: 30,
    packageUnit: 'm',
    pricePerPackage: 145.00,
    category: 'standard',
    storeName: 'Izosystems',
    sourceUrl:
      'https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html',
    lastUpdated: '2026-10-28',
    currency: 'PLN',
    notes: 'Wewnętrzna taśma paroszczelna do ciepłego montażu okien. Jedna rolka 30 m. Długość i dopasowanie do połączenia sprawdź w obmiarze; dostawa liczona dla całego koszyka i kodu pocztowego.',
  },

  // Parapet wewnętrzny PCV Form 30 × 216 cm biały — EAN 5906725219640. Cena 178 zł/szt (82,41 zł/mb).
  // UWAGA: „Form" to marka własna Castoramy (Kingfisher) — realny EAN, ale JEDEN sklep
  // detaliczny, więc świadomie NIE trafia do MATERIAL_EAN_OVERLAY (reguła ≥2 źródeł).
  // source: https://www.castorama.pl/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy/5906725219640_CAPL.prd (EAN + cena 178 zł, 30 × 216 cm)
  // source: https://www.castorama.pl/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy-id-8547.html (Castorama — karta produktu Form 30 × 216 cm biały)
  {
    id: 'mat-windowsill-pvc-form-30x216',
    materialType: 'windowsill',
    productLabel: 'Parapet wewnętrzny PCV Form 30 × 216 cm biały',
    brand: 'Form',
    packageSize: 2.16,
    packageUnit: 'm',
    pricePerPackage: 178.0,
    pricePerMb: 82.41,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy/5906725219640_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
    notes: 'Głębokość 30 cm dopasuj do wnęki. Deska 216 cm — na szersze okna dobierz liczbę sztuk.',
  },

  // --- Etap tynkowania ścian: tynki bazowe + grunt/kontakt + narożnik ---
  // NOWY etap (job wall-plastering, data/jobs/walls.ts). Tynk BAZOWY wewnętrzny na
  // surowym murze: gips maszynowy/ręczny (pomieszczenia suche) lub cementowo-wapienny
  // (wilgotne). Materiały markowe z REALNYM EAN (≥2 niezależne źródła w // source).
  // DOKŁADNIE JEDEN tynk bazowy na tier w mappings.ts (materialType 'plaster') — engine
  // liczy każdą pozycję na całą powierzchnię, więc dwa tynki w tierze podwoiłyby masę.
  // Grunt/kontakt (Cerplast) i narożnik reużyte we wszystkich tierach. Tynki wyceniane
  // za kg (pricePerKg), narożnik za mb (pricePerMb) — spójnie z formułami joba.
  // 4 markowe EAN (tynki + grunt) wpisane do MATERIAL_EAN_OVERLAY (api-server); narożnik
  // ma pewne tylko 1 źródło z EAN (Castorama) → świadomie POZA overlay (jak parapet Form).

  // Tynk gipsowy maszynowy Knauf MP 75 25 kg — EAN 5902367206352. Cena 25,48 zł/worek (1,02 zł/kg, Castorama).
  // Jednowarstwowy tynk gipsowy, zużycie ok. 10 kg/m²/10 mm, wilgotność do 70%. Najtańszy/najczęstszy → tier economy.
  // source: https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd (EAN 5902367206352, cena 25,48 zł, 25 kg)
  // source: https://znajdzwyprzedaz.pl/wyprzedaz/tynki/tynk-maszynowy-knauf-mp-75-25-kg-5902367206352 (EAN 5902367206352, Knauf MP 75 25 kg)
  {
    id: 'mat-plaster-gypsum-machine-knauf-mp75-25kg',
    materialType: 'plaster',
    productLabel: 'Tynk gipsowy maszynowy Knauf MP 75 25 kg',
    brand: 'Knauf',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 25.48,
    pricePerKg: 1.02,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
    notes: 'Jednowarstwowy tynk gipsowy nakładany agregatem. Zużycie ok. 10 kg/m² na 10 mm. Pomieszczenia o wilgotności do 70%.',
  },

  // Tynk gipsowy ręczny Knauf Goldband 25 kg — EAN 5902367206383.
  // Cena brutto całego worka30,38zł, odczyt2026-10-28; dostawa osobno.
  // source: https://liderzycen.pl/pl/p/Tynk-gipsowy-reczny-Knauf-Goldband-25-kg/55390
  // source: https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120
  {
    id: 'mat-plaster-gypsum-manual-knauf-goldband-25kg',
    materialType: 'plaster',
    productLabel: 'Tynk gipsowy ręczny Knauf Goldband 25 kg',
    brand: 'Knauf',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 30.38,
    pricePerKg: 1.2152,
    category: 'standard',
    storeName: 'LiderzyCen',
    sourceUrl:
      'https://liderzycen.pl/pl/p/Tynk-gipsowy-reczny-Knauf-Goldband-25-kg/55390',
    lastUpdated: '2026-10-28',
    currency: 'PLN',
    // source: https://liderzycen.pl/pl/p/Tynk-gipsowy-reczny-Knauf-Goldband-25-kg/55390
    // source: https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120
    notes: 'Ręczny tynk gipsowy, cena brutto za cały worek 25 kg. Zużycie około 8,5 kg/m² przy 10 mm; grubość i przygotowanie podłoża dobierz według karty producenta. Dostawa liczona osobno dla całego koszyka.',
  },

  // Tynk cementowo-wapienny maszynowy Baumit MPI 25 30 kg — EAN 5907534261158. Cena 27,99 zł/worek (0,93 zł/kg, Mrówka).
  // Trwalszy, do pomieszczeń wilgotnych/obciążonych, klasa CS II, A1. Zużycie ok. 14 kg/m²/10 mm → tier better.
  // source: https://mrowka.com.pl/produkt/tynk-cementowo-wapienny-wewnetrzny-mpi-25-30-kg-baumit-5907534261158.html (EAN 5907534261158, cena 27,99 zł, 30 kg)
  // source: https://www.grupapsb.com.pl/produkt/tynk-cementowo-wapienny-wewnetrzny-mpi-25-30-kg-baumit-5907534261158.html (EAN 5907534261158, Baumit MPI 25 30 kg)
  {
    id: 'mat-plaster-cementlime-baumit-mpi25-30kg',
    materialType: 'plaster',
    productLabel: 'Tynk cementowo-wapienny maszynowy Baumit MPI 25 30 kg',
    brand: 'Baumit',
    packageSize: 30,
    packageUnit: 'kg',
    pricePerPackage: 27.99,
    pricePerKg: 0.93,
    category: 'better',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/tynk-cementowo-wapienny-wewnetrzny-mpi-25-30-kg-baumit-5907534261158.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Tynk cementowo-wapienny do pomieszczeń wilgotnych (łazienka, garaż, piwnica). Twardszy od gipsowego. Zużycie ok. 14 kg/m² na 10 mm.',
  },

  // Podkład/kontakt pod tynki Atlas Cerplast 15 kg — EAN 5905400530032. Cena 148 zł/wiadro (9,87 zł/kg, Castorama).
  // Masa gruntująca z piaskiem kwarcowym — chropowaci gładkie podłoża (beton) pod tynk. Zużycie ok. 0,3 kg/m².
  // source: https://www.castorama.pl/podklad-pod-tynki-atlas-cerplast-15-kg/5905400530032_CAPL.prd (EAN 5905400530032, cena 148 zł, 15 kg)
  // source: https://ekobudsklep.pl/Tynki/3323-srodek-gruntujacy-podklad-tynkarski-cerplast-15kg-atlas-5905400530032.html (EAN 5905400530032, Atlas Cerplast 15 kg)
  {
    id: 'mat-plaster-primer-atlas-cerplast-15kg',
    materialType: 'primer',
    productLabel: 'Podkład / kontakt pod tynki Atlas Cerplast 15 kg',
    brand: 'Atlas',
    packageSize: 15,
    packageUnit: 'kg',
    pricePerPackage: 148.0,
    pricePerKg: 9.87,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/podklad-pod-tynki-atlas-cerplast-15-kg/5905400530032_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Kontakt z kruszywem kwarcowym — chropowaci gładki beton pod tynk gipsowy. Zużycie ok. 0,3 kg/m². Na chłonny mur zamiast tego grunt głęboko penetrujący.',
  },

  // Narożnik tynkarski aluminiowy z siatką 2,5 mb — EAN 5900308102411. Cena 18,48 zł/szt (7,39 zł/mb, Castorama).
  // Aluminiowy narożnik perforowany z siatką na krawędzie zewnętrzne pod tynk. Producent Budmat.
  // UWAGA: pewne tylko 1 źródło z tym EAN (Castorama) → świadomie NIE w MATERIAL_EAN_OVERLAY (reguła ≥2 źródeł).
  // source: https://www.castorama.pl/naroznik-aluminiowy-z-siatka-2-5-mb/5900308102411_CAPL.prd (EAN 5900308102411, cena 18,48 zł, 2,5 mb)
  // source: https://www.bricomarche.pl/naroznik-aluminiowy-20-x-20-z-siatka-7-x-7-l-2-5-mb (narożnik aluminiowy 20×20 z siatką 7×7, 2,5 mb — ten sam typ Budmat)
  // source: https://www.unimet.pl/narozniki-6/262771-naroznik-aluminiowy-z-siatka-7070-250cm-5900308102411.html (cena brutto, odczyt 2026-10-25T16:39:03.639Z)
  {
    id: 'mat-plaster-corner-alu-mesh-25m',
    materialType: 'plaster-corner',
    productLabel: 'Narożnik tynkarski aluminiowy z siatką 2,5 mb',
    packageSize: 2.5,
    packageUnit: 'mb',
    pricePerPackage: 6.35,
    pricePerMb: 2.54,
    category: 'standard',
    storeName: 'Unimet',
    sourceUrl:
      'https://www.unimet.pl/narozniki-6/262771-naroznik-aluminiowy-z-siatka-7070-250cm-5900308102411.html',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
    notes: 'Na zewnętrzne krawędzie (ościeża, słupki). Siatka zbroi tynk przy narożniku i chroni przed wykruszeniem.',
  },

  // --- Etap ocieplenia ścian zewnętrznych metodą lekką mokrą (BSO/ETICS) ---
  // Job eps-insulation-bso (data/jobs/new-additions.ts) miał w katalogu tylko legacy
  // materials[] joba (bez EAN). Dokładamy 6 markowych materiałów systemowych z realnym
  // EAN (≥2 niezależne sklepy PL w // source): styropian fasadowy biały EPS 044 +
  // grafitowy EPS 033, klej-zaprawa 2w1 do klejenia płyt i zatapiania siatki, siatka
  // z włókna szklanego, kołki fasadowe z trzpieniem stalowym i tynk cienkowarstwowy
  // silikatowo-silikonowy. W mappings.ts DOKŁADNIE jeden styropian na tier (materialType
  // 'insulation'), bo lokalny engine liczy każdą pozycję na całą powierzchnię elewacji —
  // dwie płyty podwoiłyby ilość. Ceny brutto ze sklepu, packageSize z opakowania
  // handlowego. EAN 2-źródłowe wpisane też do MATERIAL_EAN_OVERLAY (api-server).

  // Styropian fasadowy Yetico Gamma Fasada 044 gr. 100 mm, paczka 3 m² (6 płyt 500×1000) — EAN 5902578301976.
  // Białą płyta EPS elewacyjna λ 0,044 W/(m·K), do metody lekkiej mokrej (BSO). Cena 68,94 zł/paczka (22,98 zł/m², Castorama).
  // source: https://www.castorama.pl/styropian-fasadowy-yetico-gamma-100-mm-3-m2-6-szt-/5902578301976_CAPL.prd (EAN 5902578301976, cena 68,94 zł, 3 m², 100 mm)
  // source: https://www.obi.pl/p/2677748/yetico-plyta-styropianowa-gamma-fasada-044-10-cm-3-m2 (EAN 5902578301976, Yetico Gamma Fasada 044 10 cm 3 m²)
  {
    id: 'mat-eps-facade-yetico-gamma-044-100mm',
    materialType: 'insulation',
    productLabel: 'Styropian fasadowy biały Yetico Gamma Fasada 044 100 mm (3 m²)',
    brand: 'Yetico',
    packageSize: 3,
    packageUnit: 'm2',
    pricePerPackage: 68.94,
    pricePerM2: 22.98,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/styropian-fasadowy-yetico-gamma-100-mm-3-m2-6-szt-/5902578301976_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Białą płyta EPS elewacyjna λ 0,044 W/(m·K). Standardowe grubości 5–20 cm — tu 100 mm. Klejenie pasmowo-punktowe + kołkowanie ≥4 szt/m².',
  },

  // Styropian fasadowy grafitowy Yetico Gamma Passive Fasada EPS 033 gr. 150 mm, paczka 2 m² (4 płyty) — EAN 5902578307268.
  // Płyta grafitowa λ 0,033 W/(m·K) — ok. 20% lepsza izolacyjność niż biała, cieńsza warstwa dla tej samej U. Cena 82,96 zł/paczka (41,48 zł/m², Castorama).
  // source: https://www.castorama.pl/styropian-fasadowy-passive-yetico-150-mm-2-m2-4-szt-/5902578307268_CAPL.prd (EAN 5902578307268, cena 82,96 zł, 2 m², 150 mm, grafit λ 0,033)
  // source: https://www.leroymerlin.pl/izolacja-budynkow/welna-mineralna-styropian-izolacja-akustyczna/styropian/styropian-fasada-niefrezowany-gamma-passive-eps-033-150-mm-2m2-yetico,p341384,l394.html (EAN 5902578307268, Yetico Gamma Passive EPS 033 150 mm 2 m²)
  {
    id: 'mat-eps-facade-yetico-passive-033-150mm',
    materialType: 'insulation',
    productLabel: 'Styropian fasadowy grafitowy Yetico Gamma Passive EPS 033 150 mm (2 m²)',
    brand: 'Yetico',
    packageSize: 2,
    packageUnit: 'm2',
    pricePerPackage: 82.96,
    pricePerM2: 41.48,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/styropian-fasadowy-passive-yetico-150-mm-2-m2-4-szt-/5902578307268_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Grafitowa płyta EPS λ 0,033 W/(m·K) — ok. 20% lepsza izolacyjność niż biała. Klejenie w cieniu/rusztowanie z siatką (nagrzewa się na słońcu).',
  },

  // Zaprawa klejąca do styropianu i zatapiania siatki Atlas Stopter K-20 2w1 25 kg — EAN 5905400160253.
  // Elastyczna, zbrojona włóknem — do klejenia płyt EPS/XPS i wykonania warstwy zbrojonej z siatką (praca od 0°C). Zużycie ok. 5 kg/m² (klejenie) + 3–3,5 kg/m² (siatka). Cena ok. 60,76 zł/worek brutto (Ceneo).
  // source: https://mrowka.com.pl/produkt/zaprawa-klejaca-do-styropianu-i-xps-oraz-do-zatapiania-siatki-25-kg-stopter-k-20-atlas-5905400160253.html (EAN 5905400160253, Atlas Stopter K-20 25 kg)
  // source: https://www.grupapsb.com.pl/produkt/zaprawa-klejaca-do-styropianu-i-xps-oraz-do-zatapiania-siatki-25-kg-stopter-k-20-atlas-5905400160253.html (EAN 5905400160253, Atlas Stopter K-20 25 kg)
  // source: https://www.ceneo.pl/4910673 (Atlas Stopter K-20 25 kg — cena brutto ok. 60,76 zł)
  {
    id: 'mat-adhesive-eps-atlas-stopter-k20-25kg',
    materialType: 'adhesive-eps',
    productLabel: 'Zaprawa klejąca do styropianu i siatki Atlas Stopter K-20 2w1 25 kg',
    brand: 'Atlas',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 60.76,
    pricePerKg: 2.43,
    category: 'standard',
    storeName: 'Grupa PSB',
    sourceUrl:
      'https://www.grupapsb.com.pl/produkt/zaprawa-klejaca-do-styropianu-i-xps-oraz-do-zatapiania-siatki-25-kg-stopter-k-20-atlas-5905400160253.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: '2w1 — te same worki do klejenia płyt (ok. 5 kg/m²) i zatapiania siatki (ok. 3–3,5 kg/m²). Łącznie ok. 8 kg/m². Praca +0…+25°C.',
  },

  // Siatka zbrojąca z włókna szklanego Atlas 150 g/m², rolka 50 m² (1 m × 50 m) — EAN 5905400196993.
  // Alkalioodporna, do zatapiania w warstwie zbrojonej BSO. Zakłady ≥10 cm, pasy diagonalne w narożnikach otworów. Cena 254 zł/rolka (5,08 zł/m², Castorama).
  // source: https://www.castorama.pl/siatka-z-wlokna-szklanego-atlas-150/5905400196993_CAPL.prd (EAN 5905400196993, cena 254 zł, 150 g/m², 50 m²)
  // source: https://sklep.sewera.pl/siatka-z-wlokna-szklanego-150-gm2-rolka-50m2-atlas-p9782 (EAN 5905400196993, Atlas siatka 150 g/m² 50 m²)
  {
    id: 'mat-mesh-fiberglass-atlas-150-50m2',
    materialType: 'mesh',
    productLabel: 'Siatka zbrojąca z włókna szklanego Atlas 150 g/m² (rolka 50 m²)',
    brand: 'Atlas',
    packageSize: 50,
    packageUnit: 'm2',
    pricePerPackage: 254.0,
    pricePerM2: 5.08,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/siatka-z-wlokna-szklanego-atlas-150/5905400196993_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Gramatura 150 g/m² (zakres fasadowy 145–165 g/m²), alkalioodporna. Zatapiana w środku warstwy kleju — nie na powierzchni. Zapas ok. 10% na zakłady.',
  },

  // Kołek fasadowy z wbijanym trzpieniem stalowym Koelner KI-200M metal 10 × 200 mm, opak. 250 szt. — EAN 5906675212647.
  // Łącznik do mechanicznego mocowania płyt EPS do 15 cm; talerzyk 60 mm, ETA-07/0291. Min. 4 szt/m² w polu, 6–8 szt/m² w strefie narożnej. Cena 220 zł/opak. (0,88 zł/szt, Castorama).
  // source: https://www.castorama.pl/kolek-do-mocowania-izolacji-koelner-metal-10-x-200-mm/5906675212647_CAPL.prd (EAN 5906675212647, cena 220 zł, 250 szt, trzpień stalowy)
  // source: https://www.grupapsb.com.pl/produkt/kolek-do-mocowania-izolacji-10-200-mm-metal-koelner-5906675212647.html (EAN 5906675212647, Koelner KI-200M 10×200 mm)
  {
    id: 'mat-anchor-facade-koelner-ki200m-10x200',
    materialType: 'anchor',
    productLabel: 'Kołek fasadowy z trzpieniem stalowym Koelner KI-200M 10 × 200 mm (250 szt.)',
    brand: 'Koelner',
    packageSize: 250,
    packageUnit: 'szt',
    pricePerPackage: 220.0,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/kolek-do-mocowania-izolacji-koelner-metal-10-x-200-mm/5906675212647_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Trzpień stalowy (mocne podłoża, kat. A–E), talerzyk 60 mm. Długość 200 mm pod płytę ~150 mm. Min. 4 szt/m², 6–8 szt/m² w strefie narożnej.',
  },

  // Tynk cienkowarstwowy silikatowo-silikonowy Ceresit CT 174 baranek 1,5 mm baza biała 25 kg — EAN 9000101109733.
  // Wyprawa dekoracyjna na warstwę zbrojoną BSO: paroprzepuszczalna, samoczyszcząca (Double Dry), z ochroną BioProtect. Zużycie ok. 2,5 kg/m². Cena 197 zł/wiadro (7,88 zł/kg, Sewera).
  // source: https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101 (EAN 9000101109733, cena 197 zł, 25 kg, baranek 1,5 mm baza biała)
  // source: https://allegro.pl/oferta/tynk-silikatowo-silikonowy-ceresit-ct174-25kg1-5mm-13409944075 (EAN 9000101109733, Ceresit CT174 25 kg baranek 1,5 mm baza biała)
  {
    id: 'mat-plaster-thin-ceresit-ct174-25kg',
    materialType: 'thin-coat-plaster',
    productLabel: 'Tynk cienkowarstwowy silikatowo-silikonowy Ceresit CT 174 baranek 1,5 mm baza biała 25 kg',
    brand: 'Ceresit',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 197.0,
    pricePerKg: 7.88,
    category: 'better',
    storeName: 'Sewera',
    sourceUrl:
      'https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Baza biała barwiona maszynowo. Zużycie ok. 2,5 kg/m² (baranek 1,5 mm). Nanoszony na zagruntowaną warstwę zbrojoną, praca +5…+25°C, nie w pełnym słońcu/przed deszczem.',
  },

  // --- Etap montażu drzwi wewnętrznych (job interior-doors, data/jobs/finishing.ts) ---
  // Job miał tylko legacy materials[] joba (door-set/pianka/próg, bez EAN) i BRAK wpisu
  // w JOB_MATERIAL_MAPPINGS/JOB_LABOR_MAPPINGS — etap nie pokazywał żadnej wyceny z katalogu.
  // Dokładamy komplet montażowy: 3 skrzydła po klasie (płytowe → okleinowane/przeszklone),
  // ościeżnicę regulowaną, klamkę na rozecie, zawias regulowany 3D, kliny montażowe i akryl
  // do wykończenia opaski. Pianę niskorozprężną reużywamy (mat-foam-soudal-lowexp-750ml).
  // W mappings.ts DOKŁADNIE jedno skrzydło i jedna ościeżnica na tier — lokalny engine
  // (getQuantityForMaterial) liczy każdą pozycję szt. na całą ilość drzwi, więc dwa skrzydła
  // w tierze podwoiłyby koszt. Skrzydło i ościeżnica jako 'szt' (packageUnit) — NIE m² (brak
  // pricePerM2/pricePerMb, żeby engine nie mnożył po powierzchni). Ceny brutto ze sklepu.
  // Skrzydła/ościeżnica/kliny/klamka = marki własne Castoramy (OPP/Erkado/PerfectDoor/Floorpol/
  // Schaffner) lub 1 pewne źródło → świadomie POZA MATERIAL_EAN_OVERLAY (reguła ≥2 niezależnych
  // źródeł kodu, jak parapet Form). Do overlay trafiają tylko zawias Metro i akryl Soudal (≥2 sklepy).

  // Skrzydło drzwiowe pełne Archi 80 lewe białe lakierowane (płyta/plaster miodu) — EAN 5903917782364.
  // Samo skrzydło (bez ościeżnicy), przylgowe, HDF lakierowany, wypełnienie plaster miodu. Cena 98 zł/szt (Castorama).
  // Tier economy: najtańsze skrzydło płytowe pełne. Marka własna Castoramy (Kingfisher) → 1 sklep, poza overlay.
  // source: https://www.castorama.pl/drzwi-pelne-archi-80-lewe-biale-lakierowane/5903917782364_CAPL.prd (EAN 5903917782364, cena 98 zł, 842 mm, HDF lakier)
  {
    id: 'mat-door-leaf-archi-80-white',
    materialType: 'door-leaf',
    productLabel: 'Skrzydło drzwiowe pełne Archi 80 białe lakierowane (płyta/plaster miodu)',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 98.0,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/drzwi-pelne-archi-80-lewe-biale-lakierowane/5903917782364_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Płytowe pełne, wypełnienie plaster miodu, HDF lakierowany. Samo skrzydło (bez ościeżnicy). Klasa budżetowa (economy).',
  },

  // Skrzydło drzwiowe OPP Klasyk 70 prawe białe (płyta z podcięciem wentylacyjnym) — EAN 5063022524034.
  // Samo skrzydło przylgowe (bez stelaża), wypełnienie plaster miodu pokryte HDF. Cena 208 zł/szt (Castorama).
  // Tier standard: płytowe wyższej klasy. Marka własna OPP/Kingfisher → 1 sklep, poza overlay.
  // source: https://www.castorama.pl/drzwi-z-podcieciem-opp-klasyk-70-prawe-biale/5063022524034_CAPL.prd (EAN 5063022524034, cena 208 zł, 844 mm, przylgowe)
  {
    id: 'mat-door-leaf-opp-klasyk-70-white',
    materialType: 'door-leaf',
    productLabel: 'Skrzydło drzwiowe OPP Klasyk 70 białe z podcięciem (przylgowe)',
    brand: 'OPP',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 208,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/drzwi-z-podcieciem-opp-klasyk-70-prawe-biale/5063022524034_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
    notes: 'Płytowe przylgowe z podcięciem wentylacyjnym, plaster miodu + HDF. Samo skrzydło (bez ościeżnicy). Klasa standard.',
  },

  // Skrzydło drzwiowe pokojowe Erkado Credis 80 lewe białe (przylgowe, przeszklone) — EAN 5900378219590.
  // Samo lewe skrzydło przylgowe, laminat MDF, 5 szyb mlecznych, zawiasy regulowane.
  // EAN oznacza konkretnie wariant lewy, a nie dowolną stronę otwierania.
  // source: https://www.castorama.pl/drzwi-pokojowe-credis-80-lewe-biale/5900378219590_CAPL.prd (EAN 5900378219590, cena 308 zł, przylgowe, przeszklone, Erkado)
  // source: https://liderzycen.pl/pl/p/Drzwi-pokojowe-Credis-80-lewe-biale/30489 (cena brutto, odczyt 2026-10-25T21:29:17.176Z)
  {
    id: 'mat-door-leaf-erkado-credis-80-glazed',
    materialType: 'door-leaf',
    productLabel: 'Skrzydło drzwiowe pokojowe Erkado Credis 80 lewe białe przylgowe przeszklone',
    brand: 'Erkado',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 279.36,
    category: 'better',
    storeName: 'LiderzyCen',
    sourceUrl:
      'https://liderzycen.pl/pl/p/Drzwi-pokojowe-Credis-80-lewe-biale/30489',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
    notes: 'Wariant lewy, rozmiar 80, biały, przylgowy, 5 szyb mlecznych. Samo skrzydło bez ościeżnicy i klamki. Dobierz zgodną lewą ościeżnicę; pozycje referencyjne w kosztorysie nie potwierdzają ich wzajemnej zgodności.',
  },

  // Baza ościeżnicy regulowana PerfectDoor 80-100 mm prawa (do drzwi wewnętrznych) — EAN 5902659279118.
  // Ościeżnica regulowana MDF, zakres 80-100 mm (dobierana do grubości ściany). Cena 418 zł/szt (Castorama).
  // Reużywana we wszystkich tierach (jedna ościeżnica na tier). Marka własna PerfectDoor/Kingfisher → 1 sklep, poza overlay.
  // source: https://www.castorama.pl/baza-oscieznicy-regulowana-perfectdoor-80-100-mm-prawa-dab-sonoma/5902659279118_CAPL.prd (EAN 5902659279118, cena 418 zł, zakres 80-100 mm)
  {
    id: 'mat-door-frame-perfectdoor-reg-80-100',
    materialType: 'door-frame',
    productLabel: 'Baza ościeżnicy regulowana PerfectDoor 80-100 mm prawa dąb sonoma (drzwi wewnętrzne)',
    brand: 'PerfectDoor',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 418,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/baza-oscieznicy-regulowana-perfectdoor-80-100-mm-prawa-dab-sonoma/5902659279118_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
    notes: 'Ościeżnica regulowana MDF, zakres regulacji 80-100 mm (dobierana do grubości ściany). Zakres regulacji zależny od muru — przy grubszej ścianie wybierz szerszy wariant.',
  },

  // Klamka drzwiowa Schaffner Lucy na rozecie złota (komplet dwustronny + rozeta 51 mm) — EAN 5907467760698.
  // Klamka na drzwi wewnętrzne 35-70 mm, aluminium/stal, rozeta slim przykręcana Ø51 mm, elementy montażowe w zestawie. Cena 39,98 zł/kpl (Castorama).
  // Reużywana we wszystkich tierach. Marka Schaffner, kod pewny w 1 sklepie (Castorama) → poza overlay.
  // source: https://www.castorama.pl/klamka-drzwiowa-schaffner-lucy-na-rozecie-zlota/5907467760698_CAPL.prd (EAN 5907467760698, cena 39,98 zł, rozeta Ø51 mm)
  // source: https://hipper.pl/klamka-do-drzwi-wewnetrznych-lucy-zlota-r-schaffner-3069808860 (cena brutto, odczyt 2026-10-25T19:38:21.848Z)
  {
    id: 'mat-door-handle-schaffner-lucy-rosette',
    materialType: 'door-handle',
    productLabel: 'Klamka drzwiowa Schaffner Lucy na rozecie (komplet dwustronny)',
    brand: 'Schaffner',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 57.99,
    category: 'standard',
    storeName: 'HIPPER',
    sourceUrl:
      'https://hipper.pl/klamka-do-drzwi-wewnetrznych-lucy-zlota-r-schaffner-3069808860',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
    notes: 'Komplet dwustronny na rozecie Ø51 mm, do drzwi 35-70 mm, elementy montażowe w zestawie. Szyld/rozeta pod klucz/WC do dobrania osobno wg funkcji pomieszczenia.',
  },

  // Zawias wkręcany regulowany 3D 14 mm ocynkowany Metro — EAN 5906711270471.
  // Zawias do drzwi drewnianych, regulacja w 3 płaszczyznach kluczem imbusowym bez zdejmowania skrzydła. 1 szt/opak. Cena 16,48 zł/szt (Castorama).
  // Na standardowe drzwi potrzebne 2-3 szt. EAN pewny w ≥2 sklepach (Castorama + Mrówka + Bricoman) → w MATERIAL_EAN_OVERLAY.
  // source: https://www.castorama.pl/zawias-regulowany-3d-14-mm-ocynkowany/5906711270471_CAPL.prd (EAN 5906711270471, cena 16,48 zł, 1 szt)
  // source: https://mrowka.com.pl/produkt/zawias-wkrecany-regulowany-3d-14-mm-ocynkowany-metro-5906711270471.html (EAN 5906711270471, Metro 3D 14 mm)
  // source: https://liderzycen.pl/pl/p/Zawias-regulowany-3D-14-mm-ocynkowany/22128 (cena brutto, odczyt 2026-10-25T21:29:17.131Z)
  {
    id: 'mat-door-hinge-metro-3d-14mm',
    materialType: 'door-hinge',
    productLabel: 'Zawias wkręcany regulowany 3D 14 mm ocynkowany Metro',
    brand: 'Metro',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 15.66,
    category: 'standard',
    storeName: 'LiderzyCen',
    sourceUrl:
      'https://liderzycen.pl/pl/p/Zawias-regulowany-3D-14-mm-ocynkowany/22128',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
    notes: 'Wkręcany, regulacja 3D (pion/poziom/docisk) kluczem imbusowym bez zdejmowania skrzydła. Na standardowe drzwi 2-3 szt.',
  },

  // Kliny montażowe Floorpol 30 x 150 mm 10 szt. (drewno sosnowe) — EAN 5907508719289.
  // Kliny do montażu drzwi/okien/parapetów — pozycjonowanie ościeżnicy w otworze przed pianowaniem. Wielokrotnego użytku. Cena 19,98 zł/opak. 10 szt (Castorama).
  // Marka Floorpol, kod pewny w 1 sklepie (Castorama) → poza overlay.
  // source: https://www.castorama.pl/kliny-montazowe-floorpol-30-x-150-mm-10-szt-/5907508719289_CAPL.prd (EAN 5907508719289, cena 19,98 zł, 10 szt, sosna)
  // source: https://liderzycen.pl/pl/p/Kliny-montazowe-Floorpol-30-x-150-mm-10-szt./31651 (cena brutto, odczyt 2026-10-25T16:39:02.603Z)
  {
    id: 'mat-mounting-wedges-floorpol-30x150-10',
    materialType: 'mounting-wedge',
    productLabel: 'Kliny montażowe Floorpol 30 x 150 mm, 10 szt. (drewno)',
    brand: 'Floorpol',
    packageSize: 10,
    packageUnit: 'szt',
    pricePerPackage: 18.98,
    category: 'standard',
    storeName: 'LiderzyCen',
    sourceUrl:
      'https://liderzycen.pl/pl/p/Kliny-montazowe-Floorpol-30-x-150-mm-10-szt./31651',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
    notes: 'Drewniane (sosna), wielokrotnego użytku. Ustawienie i klinowanie ościeżnicy w otworze przed pianowaniem. Do drzwi, okien, parapetów.',
  },

  // Akryl uniwersalny Soudal biały 280 ml (malowalny, do wykończenia opaski) — EAN 5411183157538.
  // Masa akrylowa do wypełnienia szczeliny opaska/ściana, malowalna po wyschnięciu (w odróżnieniu od silikonu). Cena 9,98 zł/szt (Castorama).
  // Reużywany we wszystkich tierach. EAN pewny w ≥2 sklepach (Castorama + Mrówka) → w MATERIAL_EAN_OVERLAY.
  // source: https://www.castorama.pl/akryl-soudal-280-ml-bialy/5411183157538_CAPL.prd (EAN 5411183157538, cena 9,98 zł, 280 ml, malowalny)
  // source: https://mrowka.com.pl/produkt/akryl-uniwersalny-280-ml-bialy-soudal-5411183157538.html (EAN 5411183157538, Soudal akryl uniwersalny 280 ml biały)
  {
    id: 'mat-acrylic-soudal-white-280ml',
    materialType: 'acrylic',
    productLabel: 'Akryl uniwersalny Soudal biały 280 ml (malowalny)',
    brand: 'Soudal',
    packageSize: 280,
    packageUnit: 'ml',
    pricePerPackage: 9.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/akryl-soudal-280-ml-bialy/5411183157538_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Akryl (NIE silikon) — malowalny po wyschnięciu, do wypełnienia styku opaska/ościeżnica ze ścianą. Bezrozpuszczalnikowy, do wnętrz.',
  },

  // --- Etap podłóg winylowych: panele SPC click, LVT klejony, podkład, klej, listwa ---
  // Materiały etapu układania podłóg winylowych (joby vinyl-flooring / vinyl-click-flooring /
  // vinyl-glued). Panele i podkład = m² (pricePerM2), klej = kg, listwa progowa = szt.
  // Panele GoodHome i podkład Corksystem to marki własne/wyłączne Castoramy (dostępne w 1
  // sieci) — jak istniejące panele laminowane Oakland i parapet Form, więc POZA nakładką EAN.
  // Klej Soudal 26A jest sprzedawany w ≥2 akceptowanych sieciach (Castorama, Bricoman, Mrówka)
  // z tym samym EAN → kwalifikuje się do MATERIAL_EAN_OVERLAY (dopięcie w osobnym kroku).
  // DOKŁADNIE JEDEN panel m² na tier w mappings.ts (packageUnit 'm2') — inaczej engine podwoi
  // powierzchnię. Folia PE (mat-vapor-foil-diall-pe-20m2) już jest w katalogu — reużyć, nie dublować.

  // Panele podłogowe winylowe GoodHome SPC Arilla Dark Grey 2,5 m² — EAN 5059340969756. Cena 52,98 zł/m² (132,45 zł/opak. 2,5 m², Castorama).
  // SPC click (drop-lock, montaż pływający bez kleju), grubość 4 mm, warstwa ścieralna 0,55 mm, klasa 23/31, wodoodporne. Marka własna Castoramy (1 sieć) → poza overlay.
  // source: https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-arilla-dark-grey-2-5-m2/5059340969756_CAPL.prd (EAN 5059340969756, cena 52,98 zł/m², 132,45 zł/opak., SPC click 4 mm)
  {
    id: 'mat-vinyl-spc-click-goodhome-arilla-25m2',
    materialType: 'vinyl-panel',
    productLabel: 'Panele winylowe GoodHome SPC Arilla Dark Grey click 2,5 m²',
    brand: 'GoodHome',
    packageSize: 2.5,
    packageUnit: 'm2',
    pricePerPackage: 132.45,
    pricePerM2: 52.98,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-arilla-dark-grey-2-5-m2/5059340969756_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
    notes: 'SPC click (drop-click), montaż pływający bez kleju, grubość 4 mm. Paczka 9 sztuk pokrywa 2,5 m²; bez zintegrowanego podkładu.',
  },

  // Panele podłogowe winylowe GoodHome SPC Marvo 2,235 m² — EAN 5063022676757. Cena 74,98 zł/m² (167,58 zł/opak. 2,235 m², Castorama).
  // SPC click (Angle/drop-lock 5G), grubość 4 mm, warstwa ścieralna 0,55 mm, klasa 23/33, wodoodporne. Marka własna Castoramy (1 sieć) → poza overlay.
  // source: https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-marvo-2-235-m2/5063022676757_CAPL.prd (EAN 5063022676757, cena 74,98 zł/m², 167,58 zł/opak., SPC click 4 mm klasa 33)
  // source: https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Marvo-2%2C235-m2/185474 (cena brutto, odczyt 2026-10-25T21:08:18.598Z)
  {
    id: 'mat-vinyl-spc-click-goodhome-marvo-224m2',
    materialType: 'vinyl-panel',
    productLabel: 'Panele winylowe GoodHome SPC Marvo click 2,235 m²',
    brand: 'GoodHome',
    packageSize: 2.235,
    packageUnit: 'm2',
    pricePerPackage: 150.82,
    pricePerM2: 67.48,
    category: 'better',
    storeName: 'LiderzyCen',
    sourceUrl:
      'https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Marvo-2%2C235-m2/185474',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
    notes: 'SPC click (Angle/drop-lock 5G), montaż pływający bez kleju, grubość 4 mm, warstwa ścieralna 0,55 mm, klasa 23/33 (użytkowanie komercyjne), wodoodporne, gwarancja 15 lat.',
  },

  // Panele podłogowe winylowe klejone (samoprzylepne LVT) GoodHome Ragga Ele Marble 1,3 m² — EAN 5059340802435. Cena 49,98 zł/m² (64,97 zł/opak. 1,3 m², Castorama).
  // LVT klejony do podłoża — samoprzylepny (klej fabrycznie na spodzie, zdejmuje się folię i przykleja), grubość 2,5 mm, warstwa ścieralna 0,3 mm, efekt marmuru. Marka własna Castoramy (1 sieć) → poza overlay.
  // source: https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-ragga-ele-marble-1-3-m2/5059340802435_CAPL.prd (EAN 5059340802435, cena 49,98 zł/m², 64,97 zł/opak., samoprzylepny LVT 2,5 mm)
  {
    id: 'mat-vinyl-glued-goodhome-ragga-13m2',
    materialType: 'vinyl-panel',
    productLabel: 'Panele winylowe klejone (samoprzylepne LVT) GoodHome Ragga Ele Marble 1,3 m²',
    brand: 'GoodHome',
    packageSize: 1.3,
    packageUnit: 'm2',
    pricePerPackage: 64.97,
    pricePerM2: 49.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-ragga-ele-marble-1-3-m2/5059340802435_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
    notes: 'LVT klejony do podłoża — samoprzylepny (klej na spodzie, montaż na sucho przez zdjęcie folii). Grubość 2,5 mm, warstwa ścieralna 0,3 mm, efekt marmuru, 7 szt./opak. (610 x 305 mm).',
  },

  // Podkład podłogowy pod panele winylowe Corksystem LVT 1,5 mm 6 m² — EAN 5061092900925. Cena 73,99 zł/opak. (12,33 zł/m², Castorama).
  // Cienki podkład (1,5 mm) dedykowany pod panele winylowe LVT/SPC click — cienki celowo, żeby nie przeciążać zamków click. Redukcja hałasu 21 dB, odporny na wilgoć i pleśń. Marka Corksystem (Castorama) → poza overlay.
  // source: https://www.castorama.pl/departments/podk-ad-pod-ogowy-corksystem-lvt-1-5-mm-pod-panele-winylowe-6-m2-1-op-/5061092900925_CAPL.prd (EAN 5061092900925, cena 73,99 zł/opak. 6 m², 1,5 mm, pod panele winylowe LVT)
  {
    id: 'mat-vinyl-underlay-corksystem-lvt-6m2',
    materialType: 'underlay',
    productLabel: 'Podkład pod panele winylowe Corksystem LVT 1,5 mm 6 m²',
    brand: 'Corksystem',
    packageSize: 6,
    packageUnit: 'm2',
    pricePerPackage: 73.99,
    pricePerM2: 12.33,
    category: 'standard',
    storeName: 'Corksystem (Castorama)',
    sourceUrl:
      'https://www.castorama.pl/departments/podk-ad-pod-ogowy-corksystem-lvt-1-5-mm-pod-panele-winylowe-6-m2-1-op-/5061092900925_CAPL.prd',
    lastUpdated: '2026-10-26',
    currency: 'PLN',
    notes: 'Cienki podkład 1,5 mm dedykowany pod panele winylowe LVT/SPC click (cienki, by nie przeciążać zamków). Redukcja hałasu 21 dB, odporny na wilgoć/pleśń. Bez ogrzewania podłogowego.',
  },

  // Klej do wykładzin Soudal 26A 5 kg — EAN 5411183028395. Cena 118,00 zł/opak. (23,60 zł/kg, Castorama; ta sama cena Bricoman).
  // Gotowy do użycia, bezrozpuszczalnikowy klej dyspersyjny do wykładzin winylowych/LVT (dryback), PCV, linoleum i dywanowych na chłonne posadzki. Do winyla klejonego (vinyl-glued) zamiast podkładu. EAN pewny w ≥2 akceptowanych sieciach → do MATERIAL_EAN_OVERLAY.
  // source: https://www.castorama.pl/klej-do-wykladzin-soudal-26a-5-kg/5411183028395_CAPL.prd (EAN 5411183028395, cena 118,00 zł, winyl/PCV/linoleum/dywan)
  // source: https://www.bricoman.pl/klej-do-wykladzin-soudal-26a-5kg-20484681.html (EAN 5411183028395, cena 118,00 zł brutto, Soudal 26A 5 kg)
  // source: https://mrowka.com.pl/produkt/klej-do-wykladzin-26a-5-kg-soudal-5411183028395.html (EAN 5411183028395, Soudal 26A klej do wykładzin 5 kg)
  // source: https://www.bricoman.pl/produkty/klej-do-wykladzin-soudal-26a-5kg-20484681.html (cena brutto, odczyt 2026-10-25T17:43:11.536Z)
  // source: https://chemiadoparkietu25.pl/product-pol-25914-Soudal-26A-klej-do-wykladzin-PCV-winylu-linoleum-dywanowych-5-kg.html (cena brutto, odczyt 2026-10-25T17:30:57.007Z)
  {
    id: 'mat-vinyl-adhesive-soudal-26a-5kg',
    materialType: 'adhesive',
    productLabel: 'Klej do wykładzin (winyl/LVT/PCV) Soudal 26A 5 kg',
    brand: 'Soudal',
    packageSize: 5,
    packageUnit: 'kg',
    pricePerPackage: 93.50,
    category: 'standard',
    storeName: 'ChemiaDoParkietu25',
    sourceUrl:
      'https://chemiadoparkietu25.pl/product-pol-25914-Soudal-26A-klej-do-wykladzin-PCV-winylu-linoleum-dywanowych-5-kg.html',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
    notes: 'Klej dyspersyjny gotowy do użycia, do wykładzin/paneli winylowych (LVT dryback), PCV, linoleum i dywanowych. Zużycie zależne od podłoża; czas otwarty ok. 20 min. Do winyla klejonego zamiast podkładu.',
  },

  // Profil progowy Cezar 40 mm srebrny 1 m aluminiowy 1 szt. — EAN 5904584845215. Cena 19,75 zł/szt. (Castorama).
  // Listwa progowa/łącząca aluminiowa 40 mm, długość 1 m, montaż na wkręty z kołkami, wykończenie łączenia podłóg winylowych z innymi posadzkami. Marka Cezar (potwierdzona w Castoramie) → poza overlay.
  // source: https://www.castorama.pl/departments/profil-progowy-cezar-40mm-srebrny-1m-aluminiowy-1-szt-/5904584845215_CAPL.prd (EAN 5904584845215, cena 19,75 zł/szt., alu 40 mm x 1 m)
  // source: https://cezar.eu/products/listwa-progowa-owalna-aluminiowa-szeroka-40mm-cezar-srebrny-mat-1m (cena brutto, odczyt 2026-10-25T16:39:03.306Z)
  {
    id: 'mat-vinyl-threshold-cezar-alu-40mm-1m',
    materialType: 'threshold',
    productLabel: 'Profil progowy aluminiowy Cezar 40 mm srebrny 1 m',
    brand: 'Cezar',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 19.55,
    pricePerMb: 19.55,
    category: 'standard',
    storeName: 'Cezar',
    sourceUrl:
      'https://cezar.eu/products/listwa-progowa-owalna-aluminiowa-szeroka-40mm-cezar-srebrny-mat-1m',
    lastUpdated: '2026-10-25',
    currency: 'PLN',
    notes: 'Listwa progowa/łącząca aluminiowa 40 mm x 1 m, montaż na wkręty z kołkami. Wykończenie/maskowanie styku podłogi winylowej z inną posadzką w przejściach między pomieszczeniami.',
  },
  // source: https://folnet.pl/pl/products/paroizolacje-i-hydroizolacje/folie-paroizolacyjne/folie-paroizolacyjne-z-polietylenu-pe/folia-paroizolacyjna-zolta-conpar-0-20-mm-10288.html (EAN 5902096430103, cała rolka 2 x 50 m, cena brutto 119,50 zł, odczyt 2026-10-26)
  // source: https://conkret.com.pl/conkret-products/folia-budowlana-conpar/ (zastosowanie pod podłogi drewniane i panele)
  // source: https://parotec.pl/product-pol-18078-Folia-paroizolacyjna-zolta-CONPAR-0-2-mm-T30.html (EAN, 100 m², grubość 0,2 mm z tolerancją ±30%)
  {
    id: 'mat-vapor-foil-conkret-conpar-100m2', materialType: 'vapor-barrier',
    productLabel: 'Folia paroizolacyjna Conkret Conpar 0,20 mm (100 m²)', brand: 'Conkret',
    packageSize: 100, packageUnit: 'm2', pricePerPackage: 119.50, pricePerM2: 1.195,
    category: 'standard', storeName: 'Folnet',
    sourceUrl: 'https://folnet.pl/pl/products/paroizolacje-i-hydroizolacje/folie-paroizolacyjne/folie-paroizolacyjne-z-polietylenu-pe/folia-paroizolacyjna-zolta-conpar-0-20-mm-10288.html',
    lastUpdated: '2026-10-26', currency: 'PLN',
    notes: 'Żółta folia PE 2 x 50 m, cała rolka 100 m². Grubość 0,20 mm z tolerancją ±30%. Osobny produkt o innym EAN i opakowaniu niż Diall. Dobierz do wymagań podłogi i podkładu; nie zastępuj membrany dachowej paroprzepuszczalnej.',
  },
  // source: https://www.castorama.pl/drzwi-pelne-opp-archi-80-lewe-biale/5063022524263_CAPL.prd (rzeczywisty odczyt przeglądarki 2026-10-26T18:21:43.632Z; cena całego skrzydła brutto)
  // source: https://fixly.pl/kategoria/montaz-drzwi/aleksandrow-kujawski (niezależna identyfikacja linku tego modelu; nie źródło aktualnej ceny ani zgodności)
  {
    id: 'mat-door-leaf-opp-archi-full-80-left', materialType: 'door-leaf',
    productLabel: 'Skrzydło drzwiowe pełne OPP Archi 80 lewe białe (2035 × 844 mm)', brand: 'OPP',
    packageSize: 1, packageUnit: 'szt', pricePerPackage: 358, category: 'standard',
    storeName: 'Castorama', sourceUrl: 'https://www.castorama.pl/drzwi-pelne-opp-archi-80-lewe-biale/5063022524263_CAPL.prd',
    lastUpdated: '2026-10-26', currency: 'PLN',
    notes: 'EAN 5063022524263. Osobny model względem starego Archi 5903917782364: 2035 × 844 × 39,5 mm, bez wentylacji, nie można przyciąć. Skrzydło z zawiasami; ościeżnica, klamka i mocowania osobno. Sprawdź zgodność z ościeżnicą i obmiarami; nominalny rozmiar 80 nie potwierdza dopasowania.',
  },
  // source: https://www.castorama.pl/umywalka-cersanit-atlantic-new-50-cm/5901771226987_CAPL.prd (158 zł brutto/szt, rzeczywisty odczyt 2026-10-26T19:31:10.236Z)
  // source: https://www.cersanit.com.pl/lazienka/umywalka-wiszaca-ovida-50,3252.html (ten sam EAN 5901771226987, producent nazywa model Ovida K36-031)
  {
    id: 'mat-washbasin-cersanit-atlantic-new-50', materialType: 'washbasin',
    productLabel: 'Umywalka ścienna Cersanit Atlantic New 50 (50,5 × 40 cm, z otworem i przelewem)', brand: 'Cersanit',
    packageSize: 1, packageUnit: 'szt', pricePerPackage: 158, category: 'standard',
    storeName: 'Castorama', sourceUrl: 'https://www.castorama.pl/umywalka-cersanit-atlantic-new-50-cm/5901771226987_CAPL.prd',
    lastUpdated: '2026-10-26', currency: 'PLN',
    notes: 'EAN 5901771226987. W Castoramie Atlantic New, u producenta Ovida K36-031. Osobny model względem Facile 50, nie zapewnia zgodności z jego półpostumentem ani otworami w ścianie. Cena samej ceramiki, bez baterii, syfonu i mocowań. Szerokość 505 mm, głębokość 400 mm; karty podają różne wysokości (160/170 mm), przed montażem sprawdź rysunek producenta i rzeczywisty produkt.',
  },
  // source: https://www.castorama.pl/glazura-tamara-25-x-40-cm-white-1-5-m2/5907518303911_CAPL.prd (rzeczywisty odczyt 2026-10-26T19:58:26.512Z: 59,97 zł brutto/1,5 m²)
  // source: https://media.castorama.pl/media/regulaminy/2026/Regulamin%20200%20z%C5%82%20na%20kupon%20za%201000%20z%C5%82%20wydane%20na%20p%C5%82ytki%2018-23.02.pdf (historyczna identyfikacja EAN, nie aktualna cena)
  {
    id: 'mat-tile-wall-tamara-white-25x40', materialType: 'tile',
    productLabel: 'Glazura ścienna Ceramika Color Tamara white 25×40 cm (1,5 m²)', brand: 'Ceramika Color',
    packageSize: 1.5, packageUnit: 'm2', pricePerPackage: 59.97, pricePerM2: 39.98,
    category: 'standard', storeName: 'Castorama', sourceUrl: 'https://www.castorama.pl/glazura-tamara-25-x-40-cm-white-1-5-m2/5907518303911_CAPL.prd',
    lastUpdated: '2026-10-26', currency: 'PLN',
    notes: 'EAN 5907518303911. Paczka 15 płytek, 1,5 m². Wyłącznie na ściany wewnętrzne, bez klasy antypoślizgowej i mrozoodporności. Biała błyszcząca, gładka, nierektyfikowana, 250×400×7,7 mm. Osobny model zamiast Nati Bianco struktura; nie jest płytką podłogową ani dekorem Tamara wave. Karta zawiera sprzeczne opisy wagi; nie wykorzystujemy jej do wyceny transportu.',
  },
  // source: https://sklep.sewera.pl/krzyzyki-dystansowe-3mm-150szt--p12505 (346 gr brutto/OPA, odczyt 2026-10-26T20:27:17.254Z)
  // source: https://mrowka.com.pl/produkt/krzyzyki-dystansowe-3-mm-150-szt-hardy-5905061016869.html (niezależny dokładny EAN, szerokość i opakowanie)
  { id: 'mat-tile-spacers-hardy-3mm-150', materialType: 'tile-spacer', productLabel: 'Krzyżyki dystansowe do płytek Hardy 3 mm (150 szt.)', brand: 'Hardy', packageSize: 150, packageUnit: 'szt', pricePerPackage: 3.46, category: 'standard', storeName: 'Sewera', sourceUrl: 'https://sklep.sewera.pl/krzyzyki-dystansowe-3mm-150szt--p12505', lastUpdated: '2026-10-26', currency: 'PLN', notes: 'EAN 5905061016869, model 2040-660030. Cena całego woreczka 150 sztuk do spoiny 3 mm; nie jest ceną pojedynczego krzyżyka ani wariantem 2 mm.' },
  // source: https://sklep.sewera.pl/krzyzyki-dystansowe-4mm-100szt--p12506 (346 gr brutto/OPA, odczyt 2026-10-26T20:27:18.347Z)
  // source: https://www.bricomarche.pl/krzyzyki-dystansowe-do-glazury-4-mm-biale-woreczek-100-sztuk-hardy (niezależny dokładny EAN i opakowanie)
  { id: 'mat-tile-spacers-hardy-4mm-100', materialType: 'tile-spacer', productLabel: 'Krzyżyki dystansowe do płytek Hardy 4 mm (100 szt.)', brand: 'Hardy', packageSize: 100, packageUnit: 'szt', pricePerPackage: 3.46, category: 'standard', storeName: 'Sewera', sourceUrl: 'https://sklep.sewera.pl/krzyzyki-dystansowe-4mm-100szt--p12506', lastUpdated: '2026-10-26', currency: 'PLN', notes: 'EAN 5905061016876, model 2040-660040. Cena całego woreczka 100 sztuk do spoiny 4 mm; nie jest zamiennikiem innej szerokości.' },
  // source: https://www.abud.pl/product-pol-17848-Mocowanie-umywalki-WST-10x140-Fischer-2-sztuki.html (24,50 zł brutto/op., rzeczywisty odczyt 2026-10-26T22:19:50.486Z)
  // source: https://www.fischerdanmark.dk/da/produkter/sanitetsbefaestigelse/keramiske-handvaske-urinaler-og-sanitaere-installationer/fastgorelse-af-vask-wst/45494-wst-140-k-nv
  { id: 'mat-basin-fixings-fischer-wst140k-2', materialType: 'basin-fixings', productLabel: 'Mocowanie umywalki Fischer WST 140 K NV M10×140 (2 mocowania)', brand: 'Fischer',
    packageSize: 2, packageUnit: 'szt', pricePerPackage: 24.50, category: 'standard', storeName: 'ABUD',
    sourceUrl: 'https://www.abud.pl/product-pol-17848-Mocowanie-umywalki-WST-10x140-Fischer-2-sztuki.html', lastUpdated: '2026-10-26', currency: 'PLN',
    notes: 'Fischer 45494, EAN 8590369454948: blister 2 punktów mocowania (UX 14×75, M10×140, tuleje i nakrętki). Dwa punkty na potwierdzoną zgodną umywalkę. Sprawdź gwint, długość i nośność podłoża według producenta. Płytki/tynk nie są nośne; stelaż i płyta g-k wymagają osobnego doboru. Odrębny EAN od 080660/WST i WST II. Cena dostawy i lokalna dostępność osobno.' },
  // source: https://www.rabdom.pl/pl/p/Mapei-Kerapoxy-Easy-Design-Uniwersalna-fuga-epoksydowa-3kg-Bialy-100/14527 (rzeczywisty odczyt 2026-10-26T23:28:18.597Z)
  // source: https://cdnmedia.mapei.com/docs/librariesprovider53/dokumenty-na-stiahnutie/cennik-1-4-2026-v1.pdf?sfvrsn=df39c285_3
  {"id":"mat-epoxy-grout-mapei-kerapoxy-easy-100-3kg","materialType":"epoxy-grout","productLabel":"Mapei Kerapoxy Easy Design - Uniwersalna fuga epoksydowa 3kg Biały 100","brand":"Mapei","packageSize":3,"packageUnit":"kg","pricePerPackage":209,"category":"standard","storeName":"Rab-Dom","sourceUrl":"https://www.rabdom.pl/pl/p/Mapei-Kerapoxy-Easy-Design-Uniwersalna-fuga-epoksydowa-3kg-Bialy-100/14527","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 8022452132940. Biała 100, dwuskładnikowa fuga epoksydowa, cały zestaw A+B 3 kg. Nie jest fugą cementową ATLAS ani zwykłym Kerapoxy 2 kg. Zużycie zależy od wymiarów płytki, głębokości i szerokości spoiny. Spoiny 1–15 mm, przed użyciem sprawdź zgodność okładziny, przeprowadź próbę czyszczenia i stosuj instrukcję producenta."},
  // source: https://sklep.sewera.pl/atlas-plus-klej-do-plytek-bialy-25kg-p8896 (rzeczywisty odczyt 2026-10-26T23:28:20.037Z)
  // source: https://www.atlas.com.pl/produkt/atlas-plus-bialy/
  {"id":"mat-white-adhesive-atlas-plus-25kg","materialType":"white-tile-adhesive","productLabel":"Atlas Plus klej do płytek biały 25kg","brand":"Atlas","packageSize":25,"packageUnit":"kg","pricePerPackage":96.36,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/atlas-plus-klej-do-plytek-bialy-25kg-p8896","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5905400313390, PL-B-F-25. Biały klej ATLAS PLUS BIAŁY, cały worek 25 kg; odrębny od szarego ATLAS PLUS i Adesilex. Średnie zużycie producenta dla równej ściany 25×40 cm: 2,2 kg/m². Nierówności i metoda kombinowana zwiększają ilość. Nie jest szybkowiążącą odmianą Express."},
  // source: https://sklep.sewera.pl/sniezka-grunt-5l-p6153 (rzeczywisty odczyt 2026-10-27T00:18:32.273Z)
  // source: https://www.sniezka.pl/produkt/sniezka-grunt/
  {"id":"mat-paint-undercoat-sniezka-grunt-5l","materialType":"paint-undercoat","productLabel":"Śnieżka Grunt biała farba podkładowa 5 l","brand":"Śnieżka","packageSize":5,"packageUnit":"l","pricePerPackage":56.1,"category":"standard","storeName":"Sewera","sourceUrl":"https://sklep.sewera.pl/sniezka-grunt-5l-p6153","lastUpdated":"2026-10-27","currency":"PLN","notes":"EAN 5903973000235. Kryjąca biała lateksowa farba podkładowa do wnętrz, jedna warstwa; odrębna od gruntu głęboko penetrującego. Producent podaje do 10 m²/l; karta sprzedawcy do 9 m²/l. Dla oszacowania 9 m²/l i 5% zapasu; potwierdź etykietę, chłonność i zgodność farby nawierzchniowej. Pełne wiadro 5 l."},

  // source: https://swiatsieklei.pl/pl/p/METYLAN-Direct-200g-klej-do-tapet-24119/104
  // source: https://datasheets.tdx.henkel.com/METYLAN-Direct-pl_PL.pdf
  {"id":"mat-wallpaper-adhesive-metylan-direct-200g","materialType":"wallpaper-adhesive","productLabel":"Metylan Direct — klej do tapet flizelinowych 200 g","brand":"Metylan","packageSize":200,"packageUnit":"g","pricePerPackage":24.94,"category":"standard","storeName":"Świat Się Klei","sourceUrl":"https://swiatsieklei.pl/pl/p/METYLAN-Direct-200g-klej-do-tapet-24119/104","lastUpdated":"2026-10-27","currency":"PLN","notes":"Klej w proszku do tapet flizelinowych. Opakowanie 200 g wystarcza na 22–26 m² tapety gładkiej lub 18–20 m² tłoczonej. Ilość liczymy według dolnej wydajności z wybranym zapasem. Do suchych pomieszczeń; sprawdź zalecenia producenta tapety."},
  // source: https://swiatsieklei.pl/pl/p/METYLAN-Normal-125g-klej-do-tapet-24122/101
  // source: https://datasheets.tdx.henkel.com/METYLAN-Normal-pl_PL.pdf
  {"id":"mat-wallpaper-adhesive-metylan-normal-125g","materialType":"wallpaper-adhesive","productLabel":"Metylan Normal — klej do tapet papierowych 125 g","brand":"Metylan","packageSize":125,"packageUnit":"g","pricePerPackage":16.98,"category":"standard","storeName":"Świat Się Klei","sourceUrl":"https://swiatsieklei.pl/pl/p/METYLAN-Normal-125g-klej-do-tapet-24122/101","lastUpdated":"2026-10-27","currency":"PLN","notes":"Klej w proszku do tapet papierowych. Opakowanie 125 g wystarcza na 50 m² tapety cienkiej, 40 m² zwykłej lub 30 m² grubej. Po wymieszaniu odczekaj 20 minut zgodnie z instrukcją. Do suchych pomieszczeń; wyjątkowo ciężkie tapety wymagają osobnego doboru."},
  // source: https://plejadatapet.pl/pl/p/Gladka-tapeta-flizelinowa-150gm2-25m-0%2C75m-3333-5-Erismann-RollOver/23972
  // source: https://www.erismann.de/en/collection/rollover-27
  {"id":"mat-wallpaper-erismann-rollover-3333-5","materialType":"wallpaper","productLabel":"Erismann RollOver 3333-5 — flizelina do malowania, rolka 0,75 × 25 m","brand":"Erismann","packageSize":1,"packageUnit":"szt","pricePerPackage":227.9,"category":"standard","storeName":"Plejada Tapet","sourceUrl":"https://plejadatapet.pl/pl/p/Gladka-tapeta-flizelinowa-150gm2-25m-0%2C75m-3333-5-Erismann-RollOver/23972","lastUpdated":"2026-10-27","currency":"PLN","notes":"Biała, gładka flizelina renowacyjna do dalszego malowania lub pod tapetę. Model 3333-5, 150 g/m², pełna rolka 0,75 × 25 m, bez pasowania wzoru. Zakup całych rolek według planu pasów. Farba i dalsza tapeta wymagają osobnej pracy. Sprawdź podłoże, klej i jednakową partię przed montażem."},
  // source: https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-5kg/131
  // source: https://cdnmedia.mapei.com/docs/librariesprovider24/products-documents/1_02014_mapegum-wps_pl-pl_6ff17f2c535848d99d22681a305a079c.pdf?sfvrsn=eb49cbd6_0
  {"id":"mat-mapegum-wps-5kg","materialType":"waterproofing","productLabel":"Mapei Mapegum WPS — folia w płynie 5 kg","brand":"Mapei","packageSize":5,"packageUnit":"kg","pricePerPackage":104,"category":"standard","storeName":"WinBud","sourceUrl":"https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-5kg/131","lastUpdated":"2026-10-27","currency":"PLN","notes":"Dokładny wariant opakowania. Mapegum WPS: ok. 1,2 kg/m² łącznie dla dwóch warstw na równym podłożu, plus jawny zapas. Do wnętrz pod okładzinę; nie do stałego zanurzenia i podciągania wilgoci. Sprawdź przygotowanie podłoża i szczelność detali."},
  // source: https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-10kg/419
  // source: https://cdnmedia.mapei.com/docs/librariesprovider24/products-documents/1_02014_mapegum-wps_pl-pl_6ff17f2c535848d99d22681a305a079c.pdf?sfvrsn=eb49cbd6_0
  {"id":"mat-mapegum-wps-10kg","materialType":"waterproofing","productLabel":"Mapei Mapegum WPS — folia w płynie 10 kg","brand":"Mapei","packageSize":10,"packageUnit":"kg","pricePerPackage":198.97,"category":"standard","storeName":"WinBud","sourceUrl":"https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-10kg/419","lastUpdated":"2026-10-27","currency":"PLN","notes":"Dokładny wariant opakowania. Mapegum WPS: ok. 1,2 kg/m² łącznie dla dwóch warstw na równym podłożu, plus jawny zapas. Do wnętrz pod okładzinę; nie do stałego zanurzenia i podciągania wilgoci. Sprawdź przygotowanie podłoża i szczelność detali."},
  // source: https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-20kg-folia-w-plynie/3543
  // source: https://cdnmedia.mapei.com/docs/librariesprovider24/products-documents/1_02014_mapegum-wps_pl-pl_6ff17f2c535848d99d22681a305a079c.pdf?sfvrsn=eb49cbd6_0
  {"id":"mat-mapegum-wps-20kg","materialType":"waterproofing","productLabel":"Mapei Mapegum WPS — folia w płynie 20 kg","brand":"Mapei","packageSize":20,"packageUnit":"kg","pricePerPackage":367.7,"category":"standard","storeName":"WinBud","sourceUrl":"https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-20kg-folia-w-plynie/3543","lastUpdated":"2026-10-27","currency":"PLN","notes":"Dokładny wariant opakowania. Mapegum WPS: ok. 1,2 kg/m² łącznie dla dwóch warstw na równym podłożu, plus jawny zapas. Do wnętrz pod okładzinę; nie do stałego zanurzenia i podciągania wilgoci. Sprawdź przygotowanie podłoża i szczelność detali."},
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-10mb-Tasma-uszczelniajaca%2C-rolka/3088
  // source: https://cdnmedia.mapei.com/docs/librariesprovider24/products-documents/1_07657_mapeband-w_pl-pl_bd946808daf84ab9b92e29950ceddef5.pdf?sfvrsn=51f52cb3_0
  {"id":"mat-mapeband-w-10m","materialType":"sealing-tape","productLabel":"Mapei Mapeband W — taśma uszczelniająca 120 mm × 10 m","brand":"Mapei","packageSize":10,"packageUnit":"m","pricePerPackage":102.7,"category":"standard","storeName":"WinBud","sourceUrl":"https://winbud24.pl/pl/p/Mapei-Mapeband-W-10mb-Tasma-uszczelniajaca%2C-rolka/3088","lastUpdated":"2026-10-27","currency":"PLN","notes":"Element systemu Mapeband W do Mapegum WPS. Taśma wymaga zakładów co najmniej 5 cm. Dopasowanie mankietu do przejścia rury lub kołnierza odpływu wymaga potwierdzenia przed zakupem."},
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-mankiet-uszczelniajacy-300-x-300mm%2C-podlogowy/3091
  // source: https://cdnmedia.mapei.com/docs/librariesprovider24/products-documents/1_07657_mapeband-w_pl-pl_bd946808daf84ab9b92e29950ceddef5.pdf?sfvrsn=51f52cb3_0
  {"id":"mat-mapeband-w-floor-300","materialType":"sealing-cuff","productLabel":"Mapei Mapeband W — mankiet podłogowy 300 × 300 mm (1 szt.)","brand":"Mapei","packageSize":1,"packageUnit":"szt","pricePerPackage":19.97,"category":"standard","storeName":"WinBud","sourceUrl":"https://winbud24.pl/pl/p/Mapei-Mapeband-W-mankiet-uszczelniajacy-300-x-300mm%2C-podlogowy/3091","lastUpdated":"2026-10-27","currency":"PLN","notes":"Element systemu Mapeband W do Mapegum WPS. Taśma wymaga zakładów co najmniej 5 cm. Dopasowanie mankietu do przejścia rury lub kołnierza odpływu wymaga potwierdzenia przed zakupem."},
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-1l-KONCENTRAT-GRUNTUJACY-GRUNT/10970
  // source: https://cdnmedia.mapei.com/docs/librariesprovider24/dokumenty---landing-pages/2949-primergpro-pl.pdf?sfvrsn=a9bbe175_7
  {"id":"mat-primer-g-pro-1l","materialType":"primer","productLabel":"Mapei Primer G Pro — koncentrat gruntujący 1 l","brand":"Mapei","packageSize":1,"packageUnit":"l","pricePerPackage":37.9,"category":"standard","storeName":"Rab-Dom","sourceUrl":"https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-1l-KONCENTRAT-GRUNTUJACY-GRUNT/10970","lastUpdated":"2026-10-27","currency":"PLN","notes":"Koncentrat Primer G Pro w litrach, odrębny od starszego Primer G w kg. Zakładane zużycie produktu 0,10–0,20 l/m²; wody do rozcieńczenia nie liczymy jako kupowanego gruntu. Dobierz do chłonności i karty Mapegum WPS."},
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-5l-KONCENTRAT-GRUNTUJACY-GRUNT/10969
  // source: https://cdnmedia.mapei.com/docs/librariesprovider24/dokumenty---landing-pages/2949-primergpro-pl.pdf?sfvrsn=a9bbe175_7
  {"id":"mat-primer-g-pro-5l","materialType":"primer","productLabel":"Mapei Primer G Pro — koncentrat gruntujący 5 l","brand":"Mapei","packageSize":5,"packageUnit":"l","pricePerPackage":79.9,"category":"standard","storeName":"Rab-Dom","sourceUrl":"https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-5l-KONCENTRAT-GRUNTUJACY-GRUNT/10969","lastUpdated":"2026-10-27","currency":"PLN","notes":"Koncentrat Primer G Pro w litrach, odrębny od starszego Primer G w kg. Zakładane zużycie produktu 0,10–0,20 l/m²; wody do rozcieńczenia nie liczymy jako kupowanego gruntu. Dobierz do chłonności i karty Mapegum WPS."},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-naroznik-wewnetrzny-bialy-polysk-01-opakowanie-foliowe
  // source: https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/naroznik-wew-indo-bialy-polysk-1-arbiton
  {"id":"mat-indo-inside-gloss-2","materialType":"skirting-accessory","productLabel":"Arbiton INDO biały połysk 01 — narożniki wewnętrzne (2 szt.)","brand":"Arbiton","packageSize":2,"packageUnit":"szt","pricePerPackage":8,"category":"standard","storeName":"TopBoden","sourceUrl":"https://topboden.pl/listwy-przypodlogowe/indo-naroznik-wewnetrzny-bialy-polysk-01-opakowanie-foliowe","lastUpdated":"2026-10-27","currency":"PLN","notes":"Jedno opakowanie zawiera 2 takie same elementy do INDO biały połysk 01. Nie pasuje automatycznie do innych serii lub koloru biały mat. Podaj zmierzoną liczbę elementów; pełne opakowania liczymy łącznie w koszyku."},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-naroznik-zewnetrzny-bialy-polysk-01-opakowanie-foliowe
  // source: https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/naroznik-zew-indo-bialy-polysk-1-arbiton
  {"id":"mat-indo-outside-gloss-2","materialType":"skirting-accessory","productLabel":"Arbiton INDO biały połysk 01 — narożniki zewnętrzne (2 szt.)","brand":"Arbiton","packageSize":2,"packageUnit":"szt","pricePerPackage":8,"category":"standard","storeName":"TopBoden","sourceUrl":"https://topboden.pl/listwy-przypodlogowe/indo-naroznik-zewnetrzny-bialy-polysk-01-opakowanie-foliowe","lastUpdated":"2026-10-27","currency":"PLN","notes":"Jedno opakowanie zawiera 2 takie same elementy do INDO biały połysk 01. Nie pasuje automatycznie do innych serii lub koloru biały mat. Podaj zmierzoną liczbę elementów; pełne opakowania liczymy łącznie w koszyku."},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-lacznik-bialy-polysk-01-opakowanie-foliowe
  // source: https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/lacznik-indo-bialy-polysk-1-arbiton
  {"id":"mat-indo-connector-gloss-2","materialType":"skirting-accessory","productLabel":"Arbiton INDO biały połysk 01 — łączniki (2 szt.)","brand":"Arbiton","packageSize":2,"packageUnit":"szt","pricePerPackage":10,"category":"standard","storeName":"TopBoden","sourceUrl":"https://topboden.pl/listwy-przypodlogowe/indo-lacznik-bialy-polysk-01-opakowanie-foliowe","lastUpdated":"2026-10-27","currency":"PLN","notes":"Jedno opakowanie zawiera 2 takie same elementy do INDO biały połysk 01. Nie pasuje automatycznie do innych serii lub koloru biały mat. Podaj zmierzoną liczbę elementów; pełne opakowania liczymy łącznie w koszyku."},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-zakonczenie-prawe-lewe-bialy-polysk-01-opakowanie-foliowe
  // source: https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/zakonczenie-l-p-indo-bialy-polysk-1-arbiton
  {"id":"mat-indo-endcaps-gloss-pair","materialType":"skirting-accessory","productLabel":"Arbiton INDO biały połysk 01 — zakończenia lewe + prawe (1 para)","brand":"Arbiton","packageSize":1,"packageUnit":"kpl","pricePerPackage":8,"category":"standard","storeName":"TopBoden","sourceUrl":"https://topboden.pl/listwy-przypodlogowe/indo-zakonczenie-prawe-lewe-bialy-polysk-01-opakowanie-foliowe","lastUpdated":"2026-10-27","currency":"PLN","notes":"Jeden komplet zawiera jedno zakończenie lewe i jedno prawe. Policz osobno potrzebne strony; np. 3 lewe i 1 prawe wymagają 3 kompletów, nie 2. Wyłącznie do INDO biały połysk 01."},
  // source: https://topboden.pl/listwy-przypodlogowe/klej-montazowy-strongman-300ml
  // source: https://arbiton.com/pl/klej-montazowy-strongman-300ml
  {"id":"mat-strongman-300ml","materialType":"skirting-adhesive","productLabel":"Arbiton Strongman — klej montażowy 300 ml","brand":"Arbiton","packageSize":300,"packageUnit":"ml","pricePerPackage":31.89,"category":"standard","storeName":"TopBoden","sourceUrl":"https://topboden.pl/listwy-przypodlogowe/klej-montazowy-strongman-300ml","lastUpdated":"2026-10-27","currency":"PLN","notes":"Jeden kartusz 300 ml. Klej wskazany w karcie INDO. Liczbę kartuszy określ po próbie na przygotowanym podłożu; brak pewnej uniwersalnej wydajności w aktualnej karcie. Nie przeliczamy masy z danych logistycznych na pojemność. Zachowaj wymagania powierzchni i aklimatyzacji listew."},
];
