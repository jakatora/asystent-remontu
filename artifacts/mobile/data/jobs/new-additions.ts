// ─────────────────────────────────────────────────────────────────────────────
// Faza 4 — nowe remonty (5 modułów dodanych po pilocie Malowania).
// Wygenerowane na podstawie zweryfikowanych źródeł PL (muratordom, muratorplus,
// budujemydom, alnor, kratki, izolacjapianka, inżynierbudownictwa).
// ─────────────────────────────────────────────────────────────────────────────

import type { RenovationJob } from '@/types/domain';
import { SHARED_SHOP_PRICES } from '@/data/prices/shared-shop-prices';

const D = '2026-06-10';

// ── EPS Insulation BSO/ETICS ─────────────────────────────────────────────────

export const epsInsulationBsoJob: RenovationJob = {
  id: 'eps-insulation-bso',
  slug: 'ocieplenie-styropianem-bso',
  categoryId: 'insulation',

  name: 'Ocieplenie ścian zewnętrznych styropianem (BSO/ETICS)',
  shortDescription: 'Ocieplenie elewacji styropianem EPS 70-040 metodą lekką mokrą z tynkiem cienkowarstwowym.',
  description:
    'Ocieplenie ścian zewnętrznych w systemie BSO/ETICS polega na przyklejeniu płyt styropianowych EPS 70-040, ich kołkowaniu, wykonaniu warstwy zbrojonej z siatki szklanej zatopionej w kleju oraz nałożeniu tynku cienkowarstwowego (silikonowego, silikatowego lub akrylowego). Dla budynków do 12 m bez formalności; 12–25 m wymaga zgłoszenia 21 dni przed pracami; >25 m — pozwolenia na budowę.',
  beginnerFriendlyDescription:
    'BSO to "kanapka" na ścianie: styropian + klej + siatka + tynk. To tygodnie pracy na wysokości z rusztowaniem, materiały od jednego producenta i precyzyjne trzymanie się temperatur (+5 do +25°C). Większość ludzi zleca to ekipie — ale możesz nadzorować jakość, znając kluczowe kontrole.',
  coverIcon: 'shield',

  difficulty: 'hard',
  riskLevel: 'medium',
  visibilityMode: 'overview_only',
  estimatedDays: 14,

  measurementInputs: [
    { id: 'wallArea', label: 'Łączna powierzchnia elewacji', unit: 'm²',
      inputType: 'area', placeholder: '150', defaultValue: 150, min: 30, max: 600,
      hint: 'Suma wszystkich ścian zewnętrznych pomniejszona o okna i drzwi.' },
  ],

  warningRules: [
    { condition: 'always', level: 'warning',
      message: 'Dla budynków powyżej 12 m wymagane jest zgłoszenie robót budowlanych 21 dni przed rozpoczęciem; powyżej 25 m — pozwolenie na budowę z projektem termoizolacji.' },
    { condition: 'always', level: 'danger',
      message: 'Praca na rusztowaniu powyżej 2 m wymaga szelek bezpieczeństwa z atestem i kasku — co roku w Polsce ginie kilkudziesięciu pracowników budowlanych przez upadek z wysokości.' },
    { condition: 'always', level: 'danger',
      message: 'BSO/ETICS wykonujesz tylko przy temperaturze powietrza i podłoża +5 do +25°C i wilgotności poniżej 80% — inaczej tracisz gwarancję systemu i ryzykujesz odpadnięcie tynku.' },
    { condition: 'always', level: 'warning',
      message: 'Stosuj WSZYSTKIE komponenty jednego systemu (np. cały Atlas Stopter lub cały Ceresit Ceretherm) — mieszanie producentów = utrata gwarancji 10 lat.' },
    { condition: 'always', level: 'info',
      message: 'Faktura VAT, karta gwarancyjna systemu i protokół odbioru — niezbędne do dotacji "Czyste Powietrze" i roszczeń gwarancyjnych.' },
  ],

  materials: [
    { id: 'eps-board-15cm', name: 'Styropian fasadowy EPS 70-040 gr. 15 cm', brand: 'Termo Organika / Swisspor / Austrotherm', unit: 'm²', purchaseUnit: 'paczka 3 m²', formulaKey: 'constant', pricePerUnit: 42, category: 'izolacja', notes: 'Standardowa grubość 15–20 cm. Lambda 0.040 W/(m·K).' },
    { id: 'glue-k20', name: 'Klej do styropianu', brand: 'Atlas Stopter K-20 25 kg', unit: 'kg', purchaseUnit: 'worek 25 kg', formulaKey: 'constant', pricePerUnit: 4.2, category: 'klej', notes: 'Do klejenia płyt EPS metodą pasmowo-punktową.' },
    { id: 'glue-k50', name: 'Klej do zatapiania siatki', brand: 'Atlas Stopter K-50 25 kg', unit: 'kg', purchaseUnit: 'worek 25 kg', formulaKey: 'constant', pricePerUnit: 4.5, category: 'klej' },
    { id: 'mesh-145', name: 'Siatka zbrojąca szklana 145 g/m²', brand: 'Atlas / Ceresit', unit: 'm²', purchaseUnit: 'rolka 55 m²', formulaKey: 'constant', pricePerUnit: 4, category: 'zbrojenie', notes: 'Zakłady min. 10 cm, pasy diagonalne w narożnikach otworów.' },
    { id: 'anchors-eps', name: 'Kołki rozporowe do styropianu', brand: 'Koelner KI-10 lub Fischer Termoz', unit: 'szt', formulaKey: 'constant', pricePerUnit: 1.2, category: 'mocowanie', notes: 'Min. 4 szt/m², w strefie narożnej 6–8 szt/m².' },
    { id: 'primer-ct16', name: 'Grunt podkładowy pod tynk', brand: 'Ceresit CT 16 / Atlas Cerplast 5 kg', unit: 'litr', purchaseUnit: 'wiadro 5 kg', formulaKey: 'constant', pricePerUnit: 22, category: 'grunt' },
    { id: 'plaster-silicone', name: 'Tynk silikonowy cienkowarstwowy', brand: 'Ceresit CT 174 / Caparol Sylitol 25 kg', unit: 'kg', purchaseUnit: 'wiadro 25 kg', formulaKey: 'constant', pricePerUnit: 13, category: 'tynk', notes: 'Ziarno 1.5–2.0 mm. Kolor pigmentowany fabrycznie.' },
    { id: 'profiles-start', name: 'Listwy startowe i narożnikowe + obróbki', brand: 'Protektor / Catnic', unit: 'm.b.', formulaKey: 'constant', pricePerUnit: 12, category: 'akcesoria', notes: 'Cokół startowy + narożniki + listwy okapowe nad oknami.' },
  ],

  tools: [
    { id: 'scaffolding', name: 'Rusztowanie ramowe z certyfikatem UDT', icon: 'grid', required: true, rentable: true, estimatedBuyCostPLN: 8000, notes: 'Najczęściej wynajem — koszt ~50 zł/m²/miesiąc.' },
    { id: 'mixer-bso', name: 'Wiertarka udarowa z mieszadłem koszykowym', icon: 'tool', required: true, shopPrices: SHARED_SHOP_PRICES.sdsHammerDrill, notes: 'Mocna wiertarka >1100 W + mieszadło M14 do kleju.' },
    { id: 'trowel-bso', name: 'Paca zębata 10/12 mm + paca gładka stalowa', icon: 'minus', required: true, estimatedBuyCostPLN: 110, shopPrices: SHARED_SHOP_PRICES.steelTrowel50cm },
    { id: 'eps-saw', name: 'Piłka do styropianu z drobnym ostrzem', icon: 'scissors', required: true, estimatedBuyCostPLN: 25 },
    { id: 'sanding-grater', name: 'Tarka z siatką ścierną do styropianu', icon: 'square', required: true, estimatedBuyCostPLN: 35 },
    { id: 'hammer-drill-anchors', name: 'Wiertarka SDS-plus + wiertło 10 mm do kołkowania', icon: 'tool', required: true, shopPrices: SHARED_SHOP_PRICES.sdsHammerDrill, notes: 'Do osadzania kołków po klejeniu.' },
    { id: 'level-laser-bso', name: 'Poziomica laserowa krzyżowa', icon: 'crosshair', required: true, estimatedBuyCostPLN: 280, notes: 'Wyznaczenie linii startowej cokołu na całej elewacji.' },
    { id: 'paint-roller-bso', name: 'Wałek z długim włosiem 25 mm do gruntu', icon: 'edit-2', required: true, shopPrices: SHARED_SHOP_PRICES.roller18cm },
    { id: 'harness-safety', name: 'Szelki bezpieczeństwa z atestem + lina', icon: 'shield', required: true, rentable: true, estimatedBuyCostPLN: 450 },
    { id: 'thermal-camera', name: 'Kamera termowizyjna (kontrola mostków)', icon: 'eye', required: false, rentable: true, estimatedBuyCostPLN: 1800, notes: 'Pożyczyć do końcowego odbioru — wykrywa pominięte kołki i mostki.' },
  ],

  instructions: [
    { step: 1, title: 'Formalności, audyt + montaż rusztowania', description: 'Sprawdź wysokość budynku: do 12 m bez formalności, 12–25 m zgłoszenie 21 dni przed, >25 m pozwolenie na budowę. Wykonaj audyt energetyczny (potrzebny do dotacji). Zmontuj rusztowanie z atestem, zabezpiecz okna folią, podłogę listwami startowymi.', durationMin: 480 },
    { step: 2, title: 'Przygotowanie podłoża + listwa startowa', description: 'Oczyść ściany szczotką drucianą z luźnego tynku, kurzu, mchu. Grzyb/mech — usuń preparatem biobójczym, czekaj 24h. Sprawdź nośność starego tynku metodą odrywu. Zagruntuj. Zamontuj listwę cokołową aluminową na poziomie cokołu (laser).', durationMin: 720 },
    { step: 3, title: 'Klejenie płyt EPS metodą pasmowo-punktową', description: 'Wymieszaj klej Atlas Stopter K-20 wg proporcji, odczekaj 5 min, ponownie wymieszaj. Nakładaj klej na płytę EPS pacą zębatą: obwodowo pas 4–6 cm + 3–8 placków na środek. Klej od cokołu w górę, naprzemienne układanie spoin (cegiełka). Sprawdzaj pion i poziom co 3 płyty.', tip: 'Nie nakładaj kleju tylko punktowo — wciąga powietrze i daje "sińce" w tynku.', durationMin: 1440 },
    { step: 4, title: 'Szlifowanie + kołkowanie', description: 'Po 24–48 h od klejenia przeszlifuj całą elewację tarką ze ścierną siatką. Pył odessij. Kołkuj: 4 szt/m² w polu, 6–8 szt/m² w strefie narożnej. Wbij kołki na wciśniecie (talerzyk zlicowany z płaszczyzną styropianu).', warning: 'Kołkowanie przed 48 h zrywa świeży klej, kołki za głęboko — talerzyki odbijają się jako "kropki" przez tynk.', durationMin: 960 },
    { step: 5, title: 'Warstwa zbrojona — siatka szklana', description: 'Nałóż klej Atlas Stopter K-50 pacą zębatą na pas styropianu szerokości rolki siatki (~110 cm). Wciśnij siatkę w mokry klej, rozprowadź pacą gładką stalową — siatka ma być w ŚRODKU warstwy (ledwo widoczna). Zakłady min. 10 cm, pasy diagonalne w narożnikach otworów.', warning: 'Siatka na powierzchni warstwy zamiast w środku → po latach pęka tynk wzdłuż linii siatki.', durationMin: 1440 },
    { step: 6, title: 'Gruntowanie + tynk cienkowarstwowy', description: 'Po pełnym wyschnięciu warstwy zbrojonej (3–7 dni) — nanieś grunt Ceresit CT 16 (barwiony w kolorze tynku) wałkiem. Po 24h tynk silikonowy (Ceresit CT 174) pacą stalową, równo. Faktura: zacieraj pacą plastikową w jednym kierunku.', warning: 'Tynk w niewłaściwej pogodzie (<+5°C, pełne słońce, przed deszczem) → nie wiąże, kreda się, traci adhezję.', durationMin: 1440 },
    { step: 7, title: 'Detale wykończeniowe + odbiór', description: 'Zamontuj parapety zewnętrzne (aluminowe powlekane) z 4 cm wystawem i spadkiem 5°. Uszczelnij styk parapet/tynk silikonem dekarskim. Zamontuj rynny, opaski odprowadzające wodę. Demontaż rusztowania, sprzątanie. Odbiór końcowy z protokołem.', tip: 'Kamera termowizyjna podczas odbioru pokaże pominięte kołki i mostki termiczne.', durationMin: 720 },
  ],

  commonMistakes: [
    'Klejenie samymi "plackami" bez pasma obwodowego — powoduje wciąganie powietrza za płytę i widoczne sińce na tynku po roku.',
    'Kołkowanie zbyt wcześnie (przed 48 h) lub za głęboko — zrywa świeży klej lub talerzyki odbijają się przez tynk.',
    'Siatka zbrojąca położona na powierzchni warstwy zamiast w środku — po latach pęka tynk wzdłuż linii siatki.',
    'Klej cementowy zamiast pianki PU w szczelinach między płytami — sztywny mostek termiczny pęka po pierwszej zimie.',
    'Nakładanie tynku przy <+5°C, w pełnym słońcu, przed deszczem — tynk nie wiąże, kreda się, traci adhezję.',
  ],
  qualityChecklist: [
    { id: 'flatness',     description: 'Płaszczyzna elewacji sprawdzona łatą aluminową 2 m — odchyłka max. 3 mm na 2 m (norma ETICS).', critical: true },
    { id: 'mesh-embed',   description: 'Siatka zbrojeniowa zatopiona w środku warstwy kleju, zakłady min. 10 cm, pasy diagonalne w narożnikach otworów.', critical: true },
    { id: 'anchors',      description: 'Kołki rozłożone zgodnie z projektem (min. 4 szt/m², 6–8 w strefie narożnej), talerzyki zlicowane.', critical: true },
    { id: 'plaster-look', description: 'Tynk o jednolitej fakturze i kolorze — bez smug, łączeń "mokre w suche", plam wapiennych.' },
    { id: 'details',      description: 'Listwy startowe, narożne, okapowe i obróbki blacharskie wykonane z dylatacjami i spadkami.', critical: true },
  ],

  hireProfessionalRecommended: true,
  hireProfessionalReason:
    'BSO/ETICS to system — błędy w jednej warstwie (źle zatopiona siatka, za mało kołków, brak gruntowania) prowadzą do odpadania tynku, mostków termicznych i utraty gwarancji producenta systemu (10–15 lat). Wykonawca musi mieć referencje, ubezpieczenie OC, certyfikaty producenta (Atlas, Ceresit, Caparol). Praca z rusztowania na wysokości >2 m wymaga szelek bezpieczeństwa z atestem i kasku. Termoizolacja musi być zgodna z projektem energetycznym i normami WT 2021.',

  tags: ['ocieplenie', 'BSO', 'ETICS', 'styropian', 'elewacja', 'termoizolacja'],

  verifiedAt: D,
  verifiedSources: [
    { title: 'Ocieplenie ścian zewnętrznych domu krok po kroku — ile cm, koszty i najczęstsze błędy', url: 'https://muratordom.pl/budowa/elewacja-i-ocieplenie/ocieplenie-scian-zewnetrznych-domu-krok-po-kroku-aa-MAJ7-cs6X-eRJF.html', domain: 'muratordom.pl', consultedAt: D },
    { title: 'Ocieplanie domu styropianem krok po kroku', url: 'https://muratordom.pl/budowa/elewacja-i-ocieplenie/ocieplanie-domu-styropianem-krok-po-kroku-jak-przygotowac-sciany-aa-7zJ4-tvqf-7Wz3.html', domain: 'muratordom.pl', consultedAt: D },
    { title: 'Ocieplenie ścian metodą ETICS — krok po kroku', url: 'https://styropmin.pl/ocieplenie-scian-metoda-etics/', domain: 'styropmin.pl', consultedAt: D },
    { title: 'Czy ocieplenie domu wymaga zgłoszenia? Przepisy 2025', url: 'https://izolacjapianka.pl/blog/czy-ocieplenie-domu-wymaga-zgloszenia/', domain: 'izolacjapianka.pl', consultedAt: D },
  ],
};

// ── Acoustic Suspended Ceiling ───────────────────────────────────────────────

export const acousticSuspendedCeilingJob: RenovationJob = {
  id: 'acoustic-suspended-ceiling',
  slug: 'sufit-podwieszany-akustyczny',
  categoryId: 'ceiling-acoustic',

  name: 'Sufit podwieszany akustyczny (panele rastrowe)',
  shortDescription: 'Modułowy sufit rastrowy 60×60 cm na ruszcie T-15/T-24 z płytami akustycznymi.',
  description:
    'Sufit modułowy w siatce 600×600 mm: widoczny ruszt metalowy (profile T-15/T-24) zawieszany na drutach noniuszowych od stropu właściwego oraz wkładane w siatkę płyty mineralne lub gipsowe (NRC 0.55–0.95). Najczęściej w biurach, sklepach, gabinetach. Dla DIY w domu możliwy w piwnicy lub garażu.',
  beginnerFriendlyDescription:
    'To "kratka" z metalowych profili wisząca na drutach od sufitu, a w nią wkładasz białe kwadratowe płyty 60×60 cm. Bardzo proste w montażu — wszystko na zatrzaski i zaczepy. W jeden weekend zrobisz pokój 20 m².',
  coverIcon: 'grid',

  difficulty: 'medium',
  riskLevel: 'low',
  visibilityMode: 'safe_diy',
  estimatedDays: 2,

  measurementInputs: [
    { id: 'ceilingArea', label: 'Powierzchnia sufitu', unit: 'm²',
      inputType: 'area', placeholder: '20', defaultValue: 20, min: 5, max: 200 },
  ],

  warningRules: [
    { condition: 'always', level: 'warning', message: 'Pył z płyt mineralnych jest drażniący — obowiązkowo maska FFP2 i okulary ochronne.' },
    { condition: 'always', level: 'danger',  message: 'Podłączenie opraw oświetleniowych do 230 V wymaga uprawnień SEP do 1 kV lub zlecenia elektrykowi.' },
    { condition: 'always', level: 'info',    message: 'Minimalna wysokość pomieszczenia mieszkalnego po sufitem to 220 cm (Rozporządzenie MIiB, warunki techniczne).' },
    { condition: 'always', level: 'warning', message: 'Każda oprawa cięższa niż 3 kg musi być podwieszona własnym drutem do stropu — nie obciążaj samej siatki T-24.' },
    { condition: 'always', level: 'info',    message: 'Praca na drabinie powyżej 1 m — upewnij się że ma stabilne podparcie, optymalnie pracuj we dwóch.' },
  ],

  materials: [
    { id: 'profile-t24-main', name: 'Profil główny T-24 dł. 3.6 m', brand: 'Armstrong / Ecophon', unit: 'm.b.', formulaKey: 'constant', pricePerUnit: 12, category: 'ruszt', notes: 'Co 120 cm rozstaw między profilami.' },
    { id: 'profile-t24-1200', name: 'Profil poprzeczny T-24 dł. 1200 mm', unit: 'szt', formulaKey: 'constant', pricePerUnit: 8, category: 'ruszt' },
    { id: 'profile-t24-600',  name: 'Profil poprzeczny T-24 dł. 600 mm', unit: 'szt', formulaKey: 'constant', pricePerUnit: 5, category: 'ruszt' },
    { id: 'wall-angle',       name: 'Profil przyścienny L 19×24 mm 3 m', unit: 'm.b.', formulaKey: 'constant', pricePerUnit: 6, category: 'ruszt' },
    { id: 'hanger-noniusz',   name: 'Wieszak noniuszowy z drutem', unit: 'szt', formulaKey: 'constant', pricePerUnit: 4, category: 'mocowanie', notes: 'Co 90–120 cm wzdłuż profili głównych.' },
    { id: 'panel-mineral',    name: 'Płyta akustyczna mineralna 60×60 cm NRC 0.65', brand: 'Armstrong Plain / Sahara', unit: 'szt', formulaKey: 'constant', pricePerUnit: 35, category: 'panele', notes: 'NRC 0.55–0.95 zależnie od modelu.' },
    { id: 'anchor-bolts',     name: 'Kołki rozporowe + wkręty do mocowania w stropie', unit: 'szt', formulaKey: 'constant', pricePerUnit: 0.8, category: 'mocowanie' },
    { id: 'safety-clips',     name: 'Klipsy zabezpieczające panel (opcjonalnie)', unit: 'szt', formulaKey: 'constant', pricePerUnit: 1, category: 'akcesoria', optional: true },
  ],

  tools: [
    { id: 'laser-cross',  name: 'Niwelator laserowy krzyżowy', icon: 'crosshair', required: true, estimatedBuyCostPLN: 280 },
    { id: 'chalk-line',   name: 'Sznur traserski', icon: 'minus', required: true, estimatedBuyCostPLN: 25 },
    { id: 'drill-sds-ceiling', name: 'Wiertarka udarowa / młotowiertarka', icon: 'tool', required: true, shopPrices: SHARED_SHOP_PRICES.sdsHammerDrill },
    { id: 'metal-snips',  name: 'Nożyce do blachy do cięcia profili T', icon: 'scissors', required: true, estimatedBuyCostPLN: 60 },
    { id: 'pan-cutter',   name: 'Nóż ostry do docinania paneli mineralnych', icon: 'edit-3', required: true, estimatedBuyCostPLN: 20 },
    { id: 'screwdriver-ceil', name: 'Wkrętarka akumulatorowa', icon: 'tool', required: true, estimatedBuyCostPLN: 350 },
    { id: 'ladder-ceil',  name: 'Drabina 4-stopniowa', icon: 'chevrons-up', required: true, shopPrices: SHARED_SHOP_PRICES.ladder4steps },
    { id: 'mask-ffp2',    name: 'Maska FFP2 + okulary ochronne', icon: 'shield', required: true, estimatedBuyCostPLN: 25, safetyNote: 'Pył z płyt mineralnych jest drażniący.' },
    { id: 'gloves-clean', name: 'Rękawice tekstylne (do paneli — chronią przed brudem)', icon: 'shield', required: true, estimatedBuyCostPLN: 10 },
    { id: 'tape-measure-c', name: 'Miara 5 m + ołówek', icon: 'maximize-2', required: true },
  ],

  instructions: [
    { step: 1, title: 'Planowanie i wyznaczenie poziomu sufitu', description: 'Zmierz pomieszczenie i narysuj siatkę 60×60 cm tak, aby docinane panele przy ścianach były symetryczne. Minimalna przestrzeń nad sufitem 12–15 cm (więcej jeśli oprawy LED). Wyznacz docelowy poziom sufitu laserem na wszystkich ścianach.', tip: 'Sprawdź czy w stropie nie biegną instalacje, które mogą przeszkadzać w podwieszeniu.', durationMin: 60 },
    { step: 2, title: 'Montaż profilu przyściennego L', description: 'Przytnij kątowniki L na długość ścian. Mocuj wkrętami z kołkami rozporowymi co 40–50 cm dokładnie po linii poziomej. W narożnikach docinaj pod 45° lub stykuj na zakład.', durationMin: 90 },
    { step: 3, title: 'Mocowanie wieszaków noniuszowych do stropu', description: 'Wyznacz na stropie siatkę pod profile główne (co 120 cm) i punkty wieszaków na tych liniach co 90–120 cm (nie więcej niż 1 wieszak na 1.5 m² sufitu). Wywierć otwory młotowiertarką, włóż kołki + zawieś wieszak.', durationMin: 120 },
    { step: 4, title: 'Zawieszenie profili głównych T-24', description: 'Zawieś profile główne (3.6 m) w rzędach co 120 cm, opierając ich końce na profilu przyściennym L. Wpinaj profile w zaczepy noniuszy. Reguluj noniuszami precyzyjnie po poziomie.', durationMin: 90 },
    { step: 5, title: 'Wpięcie profili poprzecznych 1200 i 600 mm', description: 'W otwory profili głównych T-24 wepnij na zaczep profile poprzeczne 1200 mm co 60 cm. Następnie pomiędzy nimi (w połowie) wepnij profile poprzeczne 600 mm — powstanie siatka 600×600 mm. Sprawdź prostokątność narożników.', durationMin: 120 },
    { step: 6, title: 'Wkładanie paneli akustycznych', description: 'Załóż czyste rękawice (panele białe brudzą się od rąk). Wkładaj płyty 60×60 ukośnie od góry przez otwory siatki i opuszczaj je na profile T. Płyty pełnowymiarowe najpierw, potem docinane przy ścianach.', tip: 'Docinaj ostrym nożem z linijką — krawędź ma być prosta.', durationMin: 150 },
    { step: 7, title: 'Wstawienie opraw oświetleniowych i kratek wentylacyjnych', description: 'W miejscach planowanych opraw 60×60 LED wymień panel na oprawę. Oprawy muszą być DODATKOWO podwieszone na własnych drutach do stropu (nie obciążają samej siatki T-24). Podłączenie elektryczne do 230 V wykonuje elektryk z uprawnieniami SEP.', warning: 'Praca pod napięciem — wyłącz obwód w rozdzielnicy, potwierdź próbnikiem.', durationMin: 90 },
    { step: 8, title: 'Kontrola finalna i poprawki', description: 'Spójrz na sufit z różnych perspektyw — sprawdź czy żadna płyta nie odstaje, czy nie ma szczelin na łączeniach, czy siatka jest jednolicie wypoziomowana. Wyreguluj noniuszami pojedyncze profile.', durationMin: 45 },
  ],

  commonMistakes: [
    'Zbyt rzadko rozmieszczone wieszaki noniuszowe — sufit z czasem ugina się (min. 1 wieszak/1.5 m²).',
    'Brak symetrii docinanych paneli przy ścianach — efekt amatorski.',
    'Mocowanie opraw oświetleniowych bezpośrednio do profili T-24 bez własnego podwieszenia — ruszt ugina się.',
    'Praca bez maski i okularów — pył z mineralnych płyt drażni drogi oddechowe i oczy.',
    'Niezachowanie prostokątności siatki — profile poprzeczne nie wchodzą w zaczepy.',
  ],
  qualityChecklist: [
    { id: 'level-check',     description: 'Cała siatka wypoziomowana — odchylenie max. 2 mm na 2 m mierzone laserem.', critical: true },
    { id: 'grid-rigidity',   description: 'Po lekkim popchnięciu pojedyncza płyta nie powoduje kołysania całego rzędu.', critical: true },
    { id: 'symmetric-cuts',  description: 'Docinane panele przy przeciwległych ścianach mają porównywalne wymiary (różnica <5 cm).' },
    { id: 'no-gaps',         description: 'Brak szczelin między panelami a profilami T — panel leży równo na półce.', critical: true },
    { id: 'fixture-support', description: 'Każda oprawa 60×60 ma własne podwieszenie do stropu, nie obciąża samej siatki.', critical: true },
  ],

  hireProfessionalRecommended: false,

  tags: ['sufit podwieszany', 'akustyka', 'panele', 'biuro', 'modułowy'],

  verifiedAt: D,
  verifiedSources: [
    { title: 'Montaż sufitu podwieszanego z płyt akustycznych krok po kroku', url: 'https://muratordom.pl/wnetrza/sufity/montaz-sufitu-podwieszanego-z-plyt-akustycznych-krok-po-kroku-aa-Wm1V-mfM5-bUkx.html', domain: 'muratordom.pl', consultedAt: D },
    { title: 'Sufit podwieszany ruszt — przegląd systemów', url: 'https://muratordom.pl/wnetrza/sufity/sufit-podwieszany-ruszt-przeglad-systemow-sufitow-podwieszanych-aa-aWXm-h1Bv-6Y4N.html', domain: 'muratordom.pl', consultedAt: D },
    { title: 'Montaż sufitu podwieszanego — 5 wytycznych dla bezbłędnego montażu', url: 'https://www.muratorplus.pl/technika/sufity/montaz-sufitu-podwieszanego-5-wytycznych-aa-MTQp-N72g-CwTB.html', domain: 'muratorplus.pl', consultedAt: D },
    { title: 'Sufit podwieszany Armstrong — montaż widoczna konstrukcja nośna', url: 'https://www.grupapsb.com.pl/poradnik/sufit-podwieszany-armstrong-montaz/', domain: 'grupapsb.com.pl', consultedAt: D },
  ],
};

// ── Fireplace Installation ───────────────────────────────────────────────────

export const fireplaceInstallationJob: RenovationJob = {
  id: 'fireplace-installation',
  slug: 'montaz-kominka-z-wkladem',
  categoryId: 'fireplace',

  name: 'Montaż kominka z wkładem',
  shortDescription: 'Instalacja wkładu kominkowego 10–20 kW z izolacją, podłączeniem komina i obudową.',
  description:
    'Kompletny montaż wkładu kominkowego stalowego/żeliwnego: posadowienie, połączenie z systemem kominowym rurą kwasoodporną fi 200 mm, doprowadzenie powietrza zewnętrznego do spalania, izolacja termiczna wełną kominkową + płytami wermikulit/Skamol, obudowa z kratkami nawiewno-wywiewnymi. Wymaga odbioru kominiarskiego (waniego 12 mies.) i wpisu do CEEB.',
  beginnerFriendlyDescription:
    'Kominek z wkładem to "piec w skrzyni" — żeliwny lub stalowy wkład wpasowany w obudowę z płyt ognioodpornych, podłączony do komina. Sam montaż nie wymaga uprawnień, ale BEZ odbioru kominiarskiego ubezpieczalnia nie wypłaci po pożarze. Zatrudnij certyfikowanego instalatora — to nie miejsce na DIY.',
  coverIcon: 'thermometer',

  difficulty: 'hard',
  riskLevel: 'high',
  visibilityMode: 'overview_only',
  estimatedDays: 7,

  measurementInputs: [
    { id: 'fireplacePower', label: 'Moc wkładu', unit: 'kW',
      inputType: 'count', placeholder: '14', defaultValue: 14, min: 8, max: 25,
      hint: 'Typowo 10–20 kW. 1 kW grzeje ok. 20–30 m³.' },
  ],

  warningRules: [
    { condition: 'always', level: 'warning', message: 'Sprawdź czy w pomieszczeniu nie ma wentylacji mechanicznej z odzyskiem ciepła — może wytworzyć podciśnienie i wyciągać spaliny do mieszkania.' },
    { condition: 'always', level: 'info',    message: 'Przed pierwszym rozpaleniem zostaw wkład na 24–48 h do odparowania farby żaroodpornej. Dym i zapach są normalne podczas pierwszych 3–4 paleń.' },
    { condition: 'always', level: 'danger',  message: 'NIE wolno użytkować kominka bez protokołu odbioru kominiarskiego i wpisu do CEEB — kara do 5000 zł + brak ochrony ubezpieczeniowej.' },
    { condition: 'always', level: 'danger',  message: 'Stosuj wyłącznie suche drewno liściaste (wilg. <20%). Mokre drewno produkuje kreozot — łatwopalny osad zapalający się w kominie przy 800–1200°C.' },
    { condition: 'always', level: 'warning', message: 'Czujnik czadu (CO) w pomieszczeniu z kominkiem jest praktycznie obowiązkowy — cena 80–150 zł, ratuje życie.' },
  ],

  materials: [
    { id: 'fireplace-insert', name: 'Wkład kominkowy stalowy/żeliwny 10–20 kW', brand: 'Kratki / Romotop / Spartherm', unit: 'szt', formulaKey: 'constant', pricePerUnit: 8500, category: 'urządzenie', notes: 'Standardowo 8–20 kW. Klasa energetyczna A+/A.' },
    { id: 'flue-pipe-200',    name: 'Rura kwasoodporna fi 200 mm dł. 1 m (stal 1.4404)', unit: 'm.b.', formulaKey: 'constant', pricePerUnit: 320, category: 'komin' },
    { id: 'vermiculite-plate', name: 'Płyta wermikulitowa/krzemianowo-wapniowa Skamol 30 mm', brand: 'Skamol 1000×610 mm', unit: 'szt', formulaKey: 'constant', pricePerUnit: 280, category: 'obudowa', notes: 'Do obudowy wewnętrznej, odporność 1100°C.' },
    { id: 'chimney-wool',     name: 'Wełna kominkowa 50 mm + folia aluminowa', brand: 'Promat / Knauf', unit: 'm²', formulaKey: 'constant', pricePerUnit: 95, category: 'izolacja', notes: 'Klasa A1, odporność 700–1000°C.' },
    { id: 'air-duct-100',     name: 'Kanał powietrza zewnętrznego fi 100–125 mm', unit: 'm.b.', formulaKey: 'constant', pricePerUnit: 28, category: 'wentylacja' },
    { id: 'ventilation-grids', name: 'Kratka nawiewna + wywiewna z regulacją', unit: 'kpl', formulaKey: 'constant', pricePerUnit: 120, category: 'wentylacja', notes: 'Łącznie 40–60 cm²/kW mocy.' },
    { id: 'silicate-glue',    name: 'Klej krzemianowy do płyt Skamol', unit: 'opak', formulaKey: 'constant', pricePerUnit: 65, category: 'klej' },
    { id: 'co-detector',      name: 'Czujnik czadu (CO) z atestem', brand: 'Kidde 7CO / FireAngel CO-9D', unit: 'szt', formulaKey: 'constant', pricePerUnit: 130, category: 'bezpieczeństwo', notes: 'Bateria 10-letnia.' },
  ],

  tools: [
    { id: 'level-fireplace', name: 'Poziomica 60–100 cm', icon: 'minus', required: true, estimatedBuyCostPLN: 80 },
    { id: 'drill-sds-fire',  name: 'Wiertarka udarowa SDS-plus', icon: 'tool', required: true, shopPrices: SHARED_SHOP_PRICES.sdsHammerDrill },
    { id: 'angle-grinder',   name: 'Szlifierka kątowa 125 mm + tarcza diamentowa', icon: 'tool', required: true, estimatedBuyCostPLN: 250 },
    { id: 'fireplace-cart',  name: 'Wózek transportowy (do 250 kg wkładu)', icon: 'truck', required: true, rentable: true, estimatedBuyCostPLN: 350 },
    { id: 'silicone-gun-fire', name: 'Pistolet do silikonu wysokotemperaturowego', icon: 'tool', required: true, estimatedBuyCostPLN: 30 },
    { id: 'mask-respirator', name: 'Maska FFP3 + okulary ochronne', icon: 'shield', required: true, estimatedBuyCostPLN: 35, safetyNote: 'Pył ceramiczny i wełna kominkowa są drażniące.' },
    { id: 'gloves-fire',     name: 'Rękawice termoodporne 350°C', icon: 'shield', required: true, estimatedBuyCostPLN: 40 },
    { id: 'tape-measure-f',  name: 'Miara 5 m + ołówek', icon: 'maximize-2', required: true },
    { id: 'spirit-level-laser', name: 'Poziomica laserowa', icon: 'crosshair', required: false, estimatedBuyCostPLN: 280 },
    { id: 'manometer-flue',  name: 'Manometr ciągu kominowego', icon: 'activity', required: false, rentable: true, estimatedBuyCostPLN: 320, notes: 'Pomiar ciągu (min. 12 Pa).' },
  ],

  instructions: [
    { step: 1, title: 'Sprawdzenie komina i dokumentacji', description: 'Zleć kominiarzowi inspekcję komina: pomiar ciągu (min. 12 Pa dla 10–20 kW), kontrola drożności, klasa odporności na pożar sadzy (oznaczenie G wg PN-EN 1443) i temp. pracy min. T400. Sprawdź księgę adresową budynku.', warning: 'Bez certyfikatu G nie wolno użytkować kominka z drewnem.', durationMin: 240 },
    { step: 2, title: 'Posadowienie + doprowadzenie powietrza zewnętrznego', description: 'Wykonaj posadowienie z płyty żelbetowej lub kamiennej (nośność min. 250 kg/m²). W podłodze lub ścianie zewnętrznej wykonaj kanał nawiewu powietrza fi 100–125 mm. Podłącz bezpośrednio do wkładu — eliminuje zasysanie powietrza z pomieszczenia.', durationMin: 360 },
    { step: 3, title: 'Posadowienie wkładu i podłączenie do komina', description: 'Ustaw wkład na docelowym miejscu (100–250 kg — wózek!). Wypoziomuj. Połącz króciec wylotowy z wkładem kominowym rurą fi 200 mm stal 1.4404. Uszczelnij silikonem wysokotemperaturowym (700°C).', durationMin: 240 },
    { step: 4, title: 'Izolacja termiczna wełną kominkową', description: 'Oklej tylne i boczne ściany wokół wkładu wełną kominkową 50 mm z folią aluminową (klasa A1, odporność 700–1000°C). Zachowaj odstęp min. 4 cm między wkładem a izolacją. Wszystkie łączenia uszczelnij taśmą HT aluminową.', warning: 'Zwykła wełna mineralna budowlana ROZKRUSZA się powyżej 200°C — używaj WYŁĄCZNIE wełny kominkowej.', durationMin: 300 },
    { step: 5, title: 'Budowa obudowy z płyt Skamol', description: 'Wytnij płyty wermikulitowe na wymiar szlifierką z tarczą diamentową lub piłą ręczną. Łącz klejem krzemianowym + wkrętami w narożach. Zachowaj ok. 10 cm odstępu od wkładu z każdej strony — to przestrzeń na cyrkulację powietrza.', durationMin: 420 },
    { step: 6, title: 'Montaż kratek wentylacyjnych i regulacja przepływu', description: 'Zamontuj kratkę nawiewną w DOLNEJ części obudowy (zimne powietrze) i wywiewną w GÓRNEJ (gorące). Łączne pole otworów: 40–60 cm²/kW mocy (np. dla 14 kW = 560–840 cm²).', warning: 'Mniej niż 40 cm²/kW → obudowa przegrzewa się, płyty pękają, ryzyko pożaru.', durationMin: 90 },
    { step: 7, title: 'Pierwsze rozpalenie testowe i regulacja ciągu', description: 'Po 24–48 h od montażu pierwsze rozpalenie z małym wsadem (1–2 kg suchego drewna liściastego, wilg. <20%). Obserwuj ciąg, połączenia, dym z komina. Wkład rozgrzewaj stopniowo — pierwsze 3–4 palenia z mniejszą mocą.', durationMin: 180 },
    { step: 8, title: 'Odbiór kominiarski i wpis do CEEB', description: 'Zamów mistrza kominiarskiego z uprawnieniami — sprawdzi szczelność, ciąg, parametry spalin i zgodność z DTR. Otrzymasz protokół odbioru (ważny 12 miesięcy) — to dokument wymagany przez ubezpieczalnię. Zgłoś do Centralnej Ewidencji Emisyjności Budynków (CEEB).', durationMin: 180 },
  ],

  commonMistakes: [
    'Użycie zwykłej wełny mineralnej budowlanej zamiast kominkowej — rozkrusza się powyżej 200°C, ryzyko pożaru.',
    'Pominięcie doprowadzenia powietrza zewnętrznego — w domach szczelnych powoduje podciśnienie i cofanie spalin do pomieszczenia (czad!).',
    'Brak odstępu min. 4 cm między wkładem a izolacją — bezpośredni kontakt z wełną ceramiczną degraduje ją.',
    'Złe lub zalepione kratki nawiewno-wywiewne (<40 cm²/kW) — obudowa przegrzewa się, płyty pękają.',
    'Podłączenie do komina bez klasy odporności na pożar sadzy (G) lub bez kwasoodpornego wkładu — pożar w przewodzie kominowym 800–1200°C.',
  ],
  qualityChecklist: [
    { id: 'chimney-cert',    description: 'Komin posiada certyfikat klasy odporności na pożar sadzy (G) i temp. min. T400.', critical: true },
    { id: 'air-supply',      description: 'Podłączony kanał powietrza zewnętrznego fi 100–125 mm z przepustnicą.', critical: true },
    { id: 'insul-gap',       description: 'Zachowany odstęp min. 4 cm między wkładem a izolacją, folie alu uszczelnione taśmą HT.', critical: true },
    { id: 'vent-area',       description: 'Kratki nawiewno-wywiewne mają powierzchnię min. 40–60 cm²/kW mocy.', critical: true },
    { id: 'chimney-protocol', description: 'Protokół odbioru kominiarskiego z aktualną datą + wpis do CEEB.', critical: true },
  ],

  hireProfessionalRecommended: true,
  hireProfessionalReason:
    'Bezwzględnie zatrudnij certyfikowanego instalatora kominków oraz mistrza kominiarskiego. Wymagane: protokół odbioru kominiarskiego (bez niego ubezpieczyciel odmówi wypłaty po pożarze), wpis do księgi obiektu budowlanego, zgłoszenie do Centralnej Ewidencji Emisyjności Budynków (CEEB). Kominek bez tych dokumentów to nielegalna eksploatacja — kara do 5000 zł plus brak ochrony ubezpieczeniowej.',

  tags: ['kominek', 'wkład', 'kominiarz', 'CEEB', 'F-GAZ niepotrzebny', 'ogrzewanie'],

  verifiedAt: D,
  verifiedSources: [
    { title: 'Jak zainstalować kominek z wkładem? Instrukcja krok po kroku', url: 'https://muratordom.pl/wnetrza/kominki/jak-zainstalowac-kominek-z-wkladem-instrukcja-krok-po-kroku-aa-9Awz-jVe2-q1AB.html', domain: 'muratordom.pl', consultedAt: D },
    { title: 'Prawidłowa izolacja termiczna kominka — instrukcja montażu krok po kroku', url: 'https://muratordom.pl/wnetrza/kominki/prawidlowa-izolacja-termiczna-kominka-aa-c2qY-Z5gK-bN89.html', domain: 'muratordom.pl', consultedAt: D },
    { title: 'Zabudowa kominka — aspekt wizualny i techniczny', url: 'https://www.kratki.com/pl/poradnik/zabudowa-kominka', domain: 'kratki.com', consultedAt: D },
    { title: 'Obowiązkowy przegląd kominiarski — przepisy, terminy, koszt i kary 2026', url: 'https://www.compensa.pl/blog/obowiazkowy-przeglad-kominiarski/', domain: 'compensa.pl', consultedAt: D },
  ],
};

// ── Interior Wooden Stairs ───────────────────────────────────────────────────

export const interiorWoodenStairsJob: RenovationJob = {
  id: 'interior-wooden-stairs',
  slug: 'montaz-schodow-drewnianych-wewnetrznych',
  categoryId: 'stairs',

  name: 'Montaż schodów drewnianych wewnętrznych',
  shortDescription: 'Złożenie schodów drewnianych na policzkach zgodnie z normami PN-EN 1995-1-1.',
  description:
    'Montaż obejmuje przygotowanie podłoża, ustawienie i mocowanie policzków nośnych, osadzenie stopnic w gniazdach lub na łącznikach oraz zamocowanie balustrady z poręczą. Konstrukcja musi spełniać Rozporządzenie WT 2021 dotyczące warunków technicznych budynków mieszkalnych: wysokość stopnia 17–19 cm, szerokość stopnia 25–30 cm, prześwit pionowy nad biegiem min. 2,0 m, rozstaw tralek max. 12 cm.',
  beginnerFriendlyDescription:
    'Schody drewniane to konstrukcja, a nie dekoracja — błędy w geometrii skutkują odmową odbioru budynku. Drewno musi mieć odpowiednią wilgotność (8–12%), policzki muszą być solidnie zakotwione w ścianie i stropie, a balustrada wytrzymać 1 kN nacisku poziomego. Większość poważnych firm dostarcza schody w elementach z warsztatu — sam montaż wymaga 2 osób przez 2–3 dni.',
  coverIcon: 'corner-up-right',

  difficulty: 'hard',
  riskLevel: 'medium',
  visibilityMode: 'caution',
  estimatedDays: 5,

  measurementInputs: [
    { id: 'stairsHeight', label: 'Wysokość biegu (od podłogi parteru do piętra)', unit: 'cm',
      inputType: 'length', placeholder: '270', defaultValue: 270, min: 200, max: 350,
      hint: 'Mierzy się od gotowej powierzchni podłogi parteru do gotowej powierzchni podłogi piętra (uwzględnij grubości wykończeń).' },
  ],

  warningRules: [
    { condition: 'always', level: 'danger',  message: 'Schody są elementem konstrukcyjnym — błędy w geometrii (różne wysokości stopni, brak prześwitu 2 m, słaba balustrada) skutkują odmową odbioru budynku.' },
    { condition: 'always', level: 'warning', message: 'Pył dębowy/bukowy jest klasyfikowany jako rakotwórczy (IARC kategoria 1). Podczas pilowania, frezowania i szlifowania OBOWIĄZKOWA maska FFP3 i odciąg pyłu.' },
    { condition: 'always', level: 'warning', message: 'Mocowanie policzków w ścianach z pustaków ceramicznych wymaga kołków chemicznych lub iniekcji — zwykłe kołki rozporowe nie utrzymają obciążenia.' },
    { condition: 'always', level: 'info',    message: 'Schody dostarczane są w elementach z warsztatu — planuj transport tak, aby najdłuższy element (policzek 4–5 m) zmieścił się w klatce schodowej.' },
    { condition: 'always', level: 'info',    message: 'Po montażu i lakierowaniu nie wchodź na schody przez 24 h. Pełne obciążenie meblowe dopuszczalne po 7 dniach.' },
  ],

  materials: [
    { id: 'tread-oak',     name: 'Stopnie dębowe lite gr. 40 mm', unit: 'szt', formulaKey: 'constant', pricePerUnit: 450, category: 'drewno', notes: 'Wilgotność 8–12%. Klasa A bez sęków.' },
    { id: 'riser-oak',     name: 'Podstopnice dębowe gr. 20 mm', unit: 'szt', formulaKey: 'constant', pricePerUnit: 180, category: 'drewno' },
    { id: 'string-oak',    name: 'Policzki dębowe 50×300 mm', unit: 'm.b.', formulaKey: 'constant', pricePerUnit: 380, category: 'konstrukcja', notes: 'Długość zależna od biegu, typowo 4–5 m.' },
    { id: 'balustrade-posts', name: 'Słupki balustrady dębowe 80×80 mm', unit: 'szt', formulaKey: 'constant', pricePerUnit: 280, category: 'balustrada' },
    { id: 'balustrade-rails', name: 'Tralki dębowe 30×30 mm', unit: 'szt', formulaKey: 'constant', pricePerUnit: 45, category: 'balustrada', notes: 'Rozstaw max. 12 cm (zabezpieczenie dzieci).' },
    { id: 'handrail',      name: 'Poręcz dębowa profilowana', unit: 'm.b.', formulaKey: 'constant', pricePerUnit: 220, category: 'balustrada' },
    { id: 'pu-glue',       name: 'Klej PU do drewna', brand: 'Soudal 66A 750 g', unit: 'opak', formulaKey: 'constant', pricePerUnit: 65, category: 'klej' },
    { id: 'lacquer-pu',    name: 'Lakier poliuretanowy do drewna', brand: 'Bona Mega ONE 5 L', unit: 'litr', purchaseUnit: 'puszka 5 L', formulaKey: 'constant', pricePerUnit: 280, category: 'wykończenie', notes: '2–3 warstwy.' },
  ],

  tools: [
    { id: 'laser-cross-stairs', name: 'Niwelator laserowy krzyżowy', icon: 'crosshair', required: true, estimatedBuyCostPLN: 280 },
    { id: 'circular-saw', name: 'Pilarka tarczowa z prowadnicą', icon: 'tool', required: true, estimatedBuyCostPLN: 1200 },
    { id: 'miter-saw-stairs', name: 'Pilarka ukośna (ukośnica)', icon: 'tool', required: true, rentable: true, estimatedBuyCostPLN: 1500 },
    { id: 'router-stairs', name: 'Frezarka górnowrzecionowa', icon: 'settings', required: true, rentable: true, estimatedBuyCostPLN: 850 },
    { id: 'sander-orbital', name: 'Szlifierka mimośrodowa', icon: 'tool', required: true, estimatedBuyCostPLN: 380 },
    { id: 'drill-sds-stairs', name: 'Wiertarka udarowa SDS-plus + wiertło 10 mm', icon: 'tool', required: true, shopPrices: SHARED_SHOP_PRICES.sdsHammerDrill },
    { id: 'clamps', name: 'Ściski stolarskie (komplet 4 szt)', icon: 'grid', required: true, estimatedBuyCostPLN: 200 },
    { id: 'mask-ffp3', name: 'Maska FFP3 + okulary', icon: 'shield', required: true, estimatedBuyCostPLN: 45, safetyNote: 'Pył dębowy jest rakotwórczy (IARC 1).' },
    { id: 'dust-collector', name: 'Odciąg pyłu / odkurzacz warsztatowy', icon: 'wind', required: true, rentable: true, estimatedBuyCostPLN: 650 },
    { id: 'tape-measure-stairs', name: 'Miara 5 m + kątomierz', icon: 'maximize-2', required: true },
  ],

  instructions: [
    { step: 1, title: 'Pomiary i wytyczenie geometrii biegu', description: 'Zmierz wysokość od gotowej podłogi parteru do gotowej podłogi piętra (h_total). Podziel przez planowaną liczbę stopni (13–16) tak, aby wysokość stopnia wyniosła 17–19 cm. Sprawdź relację 2h+s = 60–65 cm (Blondela). Wyznacz prześwit pionowy 2,0 m laserem.', tip: 'Sprawdź czy w stropie i nad biegiem nie ma belek, instalacji ani przewodów.', durationMin: 90 },
    { step: 2, title: 'Przygotowanie i przycięcie policzków', description: 'Zaznacz na policzkach (belki 50×300 mm) miejsca gniazd na stopnie i podstopnice. Pilarką tarczową z prowadnicą wytnij gniazda pod kątem ok. 34°. Frezarka górnowrzecionowa — wykończenie krawędzi. Sprawdź dopasowanie na sucho.', durationMin: 240 },
    { step: 3, title: 'Montaż policzków do ściany i podłogi', description: 'Ustaw policzki w docelowej pozycji (dolna stopka wsparta na podłodze, górna oparta o belkę stropową). Wywierć otwory pod kołki Fischer FUR 10×100 w ścianie nośnej i płycie stropowej. Skręć policzki śrubami M10 + podkładki.', warning: 'W pustakach ceramicznych zwykłe kołki rozporowe NIE utrzymają — użyj kołków chemicznych lub iniekcji.', durationMin: 180 },
    { step: 4, title: 'Osadzanie stopni i podstopnic', description: 'Nałóż klej PU (Soudal 66A) na gniazda policzków. Wsuwaj kolejno podstopnice (od dołu) i stopnie, dociskaj ściskami na 30–60 min. Każdy stopień dodatkowo skręć od spodu wkrętami 6×80 mm.', tip: 'Pracuj we dwie osoby — jedna trzyma, druga skręca.', durationMin: 360 },
    { step: 5, title: 'Montaż balustrady i poręczy', description: 'Wytycz pozycję słupków (startowy, narożny, końcowy). Zamontuj słupki śrubami M10 z talerzykami. Osadź tralki w rozstawie max. 12 cm (zabezpieczenie dzieci). Na słupkach zamontuj poręcz dębową profilowaną.', durationMin: 240 },
    { step: 6, title: 'Szlifowanie i lakierowanie', description: 'Po 24 h od montażu przeszlifuj wszystkie elementy szlifierką mimośrodową: P80 (zgrubnie), P120 (średnio), P180 i P240 (wykończeniowo). Odpyl. Nanieś 2–3 warstwy lakieru PU Bona Mega ONE, każda warstwa szlifowana P240 między schnięciem.', warning: 'Pył dębowy rakotwórczy — bezwzględnie maska FFP3 + odciąg pyłu.', durationMin: 480 },
  ],

  commonMistakes: [
    'Brak uwzględnienia grubości wykończenia podłóg — po położeniu posadzki pierwszy/ostatni stopień różni się o 1–2 cm.',
    'Mocowanie policzków tylko w 2 punktach lub kołkami rozporowymi w pustakach — schody skrzypią i bujają się po roku.',
    'Zbyt suche drewno (<8%) lub zbyt mokre (>12%) — stopnie pękają wzdłuż słojów lub powodują luzy w policzkach.',
    'Brak prześwitu pionowego 2 m nad biegiem — kolizja z głową wymusza skrócenie biegu.',
    'Rozstaw tralek w balustradzie >12 cm — niezgodność z WT, ryzyko dla dzieci, odmowa odbioru.',
  ],
  qualityChecklist: [
    { id: 'uniform-rise',  description: 'Wysokość każdego stopnia identyczna (tolerancja max. 1 cm na cały bieg, optimum 17–19 cm).', critical: true },
    { id: 'tread-depth',   description: 'Szerokość stopnia 25–30 cm na całej szerokości biegu identyczna.', critical: true },
    { id: 'balustrade-str', description: 'Balustrada nie ugina się więcej niż 1 cm pod siłą poziomą 1 kN. Rozstaw tralek max. 12 cm.', critical: true },
    { id: 'headroom',      description: 'Prześwit pionowy nad biegiem min. 2,0 m, sprawdzony w każdym punkcie.', critical: true },
    { id: 'no-creaking',   description: 'Brak skrzypienia przy obciążeniu pojedynczych stopni ciałem dorosłego (~80 kg).' },
  ],

  hireProfessionalRecommended: true,
  hireProfessionalReason:
    'Schody są elementem konstrukcyjnym budynku podlegającym odbiorowi. Błędy w geometrii (różnica wysokości stopni >1 cm, kąt nachylenia, brak prześwitu 2 m) skutkują odmową odbioru. Wymagana znajomość Rozporządzenia WT 2021 i norm PN-EN 1995-1-1. Stolarz wyspecjalizowany w schodach dostarcza elementy z warsztatu na CNC + montuje sam. Próby DIY często kończą się demontażem i drugą próbą.',

  tags: ['schody', 'drewno', 'dąb', 'konstrukcja', 'balustrada', 'WT2021'],

  verifiedAt: D,
  verifiedSources: [
    { title: 'Jak powstają schody drewniane — najważniejsze etapy montażu', url: 'https://muratordom.pl/wnetrza/schody/jak-powstaja-schody-drewniane-najwazniejsze-etapy-montazu-schodow-aa-mUNd-VkXH-W2TF.html', domain: 'muratordom.pl', consultedAt: D },
    { title: 'Stopnice drewniane — łatwy montaż stopni na schody, instrukcja', url: 'https://muratordom.pl/wnetrza/schody/stopnice-drewniane-latwy-montaz-stopni-na-schody-instrukcja-aa-pE9A-HFhk-MJX5.html', domain: 'muratordom.pl', consultedAt: D },
    { title: 'Schody drewniane — jak montować?', url: 'https://budujemydom.pl/wnetrza/schody/artykuly/26142-schody-drewniane-jak-montowac', domain: 'budujemydom.pl', consultedAt: D },
    { title: 'Schody, pochylnie i balustrady — wymagania techniczne', url: 'https://inzynierbudownictwa.pl/schody-pochylnie-i-balustrady-wymagania-techniczne/', domain: 'inzynierbudownictwa.pl', consultedAt: D },
  ],
};

// ── Mechanical Ventilation MVHR (Rekuperacja) ───────────────────────────────

export const mechanicalVentilationMvhrJob: RenovationJob = {
  id: 'mechanical-ventilation-mvhr',
  slug: 'wentylacja-mechaniczna-z-rekuperacja',
  categoryId: 'hvac',
  subcategory: 'ventilation',

  name: 'Wentylacja mechaniczna z rekuperacją',
  shortDescription: 'Centrala rekuperacyjna + kanały EPP fi 75–90 mm na stanie surowym domu do 300 m².',
  description:
    'System nawiewno-wywiewny z odzyskiem 80–92% ciepła. Wymaga projektu wentylacji z bilansem powietrza wg PN-83/B-03430, doboru centrali do kubatury, rozprowadzenia kanałów EPP/PE-FLEX fi 75–90 mm + magistral fi 160–200 mm. Montaż w fazie stanu surowego — przed wylewkami i tynkami. Pierwsze uruchomienie i regulacja przepływów wymaga uprawnień instalatora.',
  beginnerFriendlyDescription:
    'Rekuperacja to dwa wentylatory + wymiennik ciepła w jednej "skrzyni" + rurki rozprowadzone po domu. Świeże powietrze z zewnątrz miesza się z ciepłem powietrza usuwanego z łazienki i kuchni — bez otwierania okien. Ekonomiczne tylko w domach pasywnych/energooszczędnych; projekt MUSI zrobić projektant sanitarny.',
  coverIcon: 'wind',

  difficulty: 'hard',
  riskLevel: 'medium',
  visibilityMode: 'overview_only',
  estimatedDays: 7,

  measurementInputs: [
    { id: 'houseArea', label: 'Powierzchnia domu', unit: 'm²',
      inputType: 'area', placeholder: '150', defaultValue: 150, min: 80, max: 300,
      hint: 'Powierzchnia ogrzewana domu. Centrala dobierana do kubatury × krotności wymian (typowo 0,5–0,8/h).' },
  ],

  warningRules: [
    { condition: 'always', level: 'danger',  message: 'Podłączenie elektryczne centrali 230 V wykonuje wyłącznie uprawniony elektryk (SEP do 1 kV) — samodzielne podłączenie unieważnia gwarancję i grozi pożarem.' },
    { condition: 'always', level: 'danger',  message: 'NIE podłączaj okapu kuchennego do instalacji rekuperacji — tłuszcz nieodwracalnie niszczy kanały EPP i wymiennik.' },
    { condition: 'always', level: 'warning', message: 'Kanały EPP w wylewce muszą być przykryte min. 5 cm betonu i zabezpieczone przed deptaniem — załamanie rury jest nienaprawialne po zalaniu posadzki.' },
    { condition: 'always', level: 'warning', message: 'Czerpnia powietrza min. 2 m od wyrzutni, 8 m od komina, 10 m od śmietnika i parkingu — niedotrzymanie skutkuje zasysaniem spalin i odorów.' },
    { condition: 'always', level: 'info',    message: 'Filtry centrali (min. F7 na nawiewie, G4 na wywiewie) wymieniaj co 3–6 miesięcy — wpis w karcie serwisowej jest warunkiem gwarancji.' },
  ],

  materials: [
    { id: 'mvhr-unit',      name: 'Centrala rekuperacyjna 300–400 m³/h', brand: 'Brink Renovent Excellent 300 / Vents Komfo 350', unit: 'szt', formulaKey: 'constant', pricePerUnit: 12500, category: 'urządzenie', notes: 'Sprawność 80–92%, EC silniki, bypass letni.' },
    { id: 'duct-flex-75',   name: 'Kanał elastyczny EPP/PE-FLEX fi 75 mm', brand: 'Brink Air Excellent / Vents PlastoVent', unit: 'm.b.', purchaseUnit: 'rolka 50 m', formulaKey: 'constant', pricePerUnit: 18, category: 'kanały', notes: '40 m³/h przepustowość. Standard dla pojedynczego nawiewu/wywiewu.' },
    { id: 'duct-main-160',  name: 'Kanał magistralny EPP fi 160–200 mm', unit: 'm.b.', purchaseUnit: 'odcinek 3 m', formulaKey: 'constant', pricePerUnit: 85, category: 'kanały' },
    { id: 'manifold-brink', name: 'Rozdzielacz nawiewu/wywiewu 8–12 przyłączy', brand: 'Brink Air Excellent', unit: 'szt', formulaKey: 'constant', pricePerUnit: 850, category: 'rozdzielacze' },
    { id: 'grille-supply',  name: 'Kratka nawiewna/wywiewna z regulacją', unit: 'szt', formulaKey: 'constant', pricePerUnit: 95, category: 'akcesoria' },
    { id: 'silencer-160',   name: 'Tłumik akustyczny fi 160 mm dł. 0.9 m', unit: 'szt', formulaKey: 'constant', pricePerUnit: 320, category: 'akustyka', notes: 'Min. 2 szt — na nawiewie i wywiewie z centrali.' },
    { id: 'insulation-pipe', name: 'Otulina wełny mineralnej 50 mm + folia paroszczelna', unit: 'm.b.', formulaKey: 'constant', pricePerUnit: 28, category: 'izolacja', notes: 'Obowiązkowa na kanałach w strefach nieogrzewanych.' },
    { id: 'condensate-syphon', name: 'Syfon kondensatu + waż odpływowy', unit: 'kpl', formulaKey: 'constant', pricePerUnit: 180, category: 'odpływ' },
  ],

  tools: [
    { id: 'drill-core',     name: 'Wiertarka udarowa + koronka diamentowa fi 160–200 mm', icon: 'tool', required: true, shopPrices: SHARED_SHOP_PRICES.sdsHammerDrill, notes: 'Przewierty zewnętrzne pod czerpnię i wyrzutnię.' },
    { id: 'laser-cross-vent', name: 'Poziomica laserowa krzyżowa', icon: 'crosshair', required: true, estimatedBuyCostPLN: 280 },
    { id: 'epp-cutter',     name: 'Nóż do EPP / piła ręczna o drobnym uzębieniu', icon: 'scissors', required: true, estimatedBuyCostPLN: 35 },
    { id: 'anemometer',     name: 'Anemometr z certyfikatem kalibracji', icon: 'activity', required: true, rentable: true, estimatedBuyCostPLN: 850, notes: 'Pomiar przepływów na każdej kratce.' },
    { id: 'manometer-vent', name: 'Manometr różnicowy (próba szczelności)', icon: 'activity', required: false, rentable: true, estimatedBuyCostPLN: 1200, notes: 'Próba pod 250 Pa, klasa B wg EN 12237.' },
    { id: 'pipe-clamps',    name: 'Komplet obejm + sznurów do podwieszania kanałów', icon: 'grid', required: true, estimatedBuyCostPLN: 150 },
    { id: 'screwdriver-vent', name: 'Wkrętarka akumulatorowa', icon: 'tool', required: true, estimatedBuyCostPLN: 350 },
    { id: 'mask-mvhr',      name: 'Maska FFP2 + okulary (pył z otuliny wełny)', icon: 'shield', required: true, estimatedBuyCostPLN: 25 },
    { id: 'tape-measure-vent', name: 'Miara 8 m + ołówek', icon: 'maximize-2', required: true },
  ],

  instructions: [
    { step: 1, title: 'Projekt wentylacji i bilans powietrza', description: 'Zleć projekt projektantowi z uprawnieniami sanitarnymi. Wg PN-83/B-03430: kuchnia 70 m³/h, łazienka 50 m³/h, WC 30 m³/h, nawiew 20 m³/h na osobę w sypialniach i salonie. Bilans nawiew = wywiew (±5%).', durationMin: 240 },
    { step: 2, title: 'Lokalizacja centrali i przewierty zewnętrzne', description: 'Centralę umieść w pomieszczeniu ogrzewanym (kotłownia, pralnia) z dostępem serwisowym 60 cm. Wywierć przewiert pod czerpnię i wyrzutnię koronką fi 160–200 mm — odległości: czerpnia 2 m od wyrzutni, 8 m od komina, 10 m od śmietnika.', durationMin: 180 },
    { step: 3, title: 'Trasowanie i montaż magistral fi 160–200 mm', description: 'Wyznacz trasy magistral laserem. Prowadź w stropie podwieszanym, kasetonie podsufitki lub w warstwie ocieplenia stropu. Magistralę w strefie nieogrzewanej (poddasze, garaż) OBOWIĄZKOWO otulij wełną 50 mm + folia paroszczelna.', durationMin: 480 },
    { step: 4, title: 'Montaż rozdzielaczy i kanały fi 75–90 mm', description: 'Rozdzielacze nawiewu/wywiewu zamontuj blisko centrali. Od rozdzielaczy poprowadź pojedyncze kanały EPP/PE-FLEX fi 75 mm (40 m³/h) lub fi 90 mm (60 m³/h) do każdej kratki — system "promienisty" (każda kratka osobny kanał).', tip: 'System promienisty pozwala na regulację każdego pomieszczenia osobno bez wpływu na inne.', durationMin: 720 },
    { step: 5, title: 'Montaż kratek nawiewu/wywiewu i puszek', description: 'Puszki przyłączeniowe pod sufitem (nawiew w sypialniach/salonie) lub na suficie (wywiew w łazience, kuchni, WC). Kratki montuj DOPIERO po tynkach i malowaniu — chroń otwory zaślepkami.', warning: 'Nigdy nie łącz okapu kuchennego z instalacją rekuperacji.', durationMin: 180 },
    { step: 6, title: 'Podłączenie centrali, syfonu kondensatu, zasilania', description: 'Zawieś centralę na stelażu antywibracyjnym. Podłącz 4 króćce: czerpnia, wyrzutnia, nawiew, wywiew — przez tłumiki akustyczne fi 160 mm długości min. 0.9 m. Syfon kondensatu z wodą + odpływ do kanalizacji. Zasilanie 230 V wykonuje elektryk SEP do 1 kV.', durationMin: 240 },
    { step: 7, title: 'Próba szczelności i regulacja anemometrem', description: 'Przed wylewkami próba szczelności magistral pod ciśnieniem 250 Pa (klasa B wg EN 12237). Po wykończeniu wnętrz uruchomienie centrali, ustaw 3 biegi (40/60/100%), zmierz przepływy anemometrem na każdej kratce — regulacja przepustnicami do wartości projektowych ±5%.', durationMin: 300 },
  ],

  commonMistakes: [
    'Brak projektu wentylacji — dobór centrali "na oko" kończy się przewymiarowaniem (hałas, kondensacja) lub niedowymiarowaniem (duszne sypialnie, wilgoć).',
    'Czerpnia obok wyrzutni, komina lub parkingu — zasysanie spalin i własnego zużytego powietrza.',
    'Prowadzenie kanałów EPP przez strefy nieogrzewane bez otuliny paroszczelnej — kondensacja wewnątrz kanałów, pleśń w izolacji stropu.',
    'Łączenie wyciągu okapu kuchennego z rekuperacją — tłuszcz osadza się w kanałach, których nie da się umyć, niszczy wymiennik.',
    'Załamanie kanału fi 75 w wylewce — promień gięcia min. 150 mm, brak ochrony rury przed deptaniem ekipy posadzkarskiej.',
  ],
  qualityChecklist: [
    { id: 'balance',    description: 'Bilans nawiew = wywiew anemometrem na każdej kratce, tolerancja ±5% projektowej wartości.', critical: true },
    { id: 'tightness',  description: 'Próba szczelności magistral pod 250 Pa zaliczona, klasa min. B wg EN 12237.', critical: true },
    { id: 'insulation', description: 'Wszystkie kanały w strefach nieogrzewanych otulone wełną 50 mm + folią paroszczelną.', critical: true },
    { id: 'noise',      description: 'Hałas w sypialniach przy biegu nominalnym <25 dB(A) — tłumiki na nawiewie i wywiewie zamontowane.' },
    { id: 'protocol',   description: 'Protokół pierwszego uruchomienia, regulacji i pomiarów przepływu wystawiony przez instalatora.', critical: true },
  ],

  hireProfessionalRecommended: true,
  hireProfessionalReason:
    'Wymagany projekt wentylacji od projektanta z uprawnieniami sanitarnymi (obliczenie bilansu powietrza, dobór centrali i przekrojów kanałów wg PN-83/B-03430). Pierwsze uruchomienie, regulacja przepływów anemometrem i próba szczelności — wykonuje instalator z certyfikatem producenta. Bez protokołu regulacji gwarancja centrali przepada. Podłączenie elektryczne wymaga uprawnień SEP do 1 kV.',

  tags: ['wentylacja', 'rekuperacja', 'MVHR', 'HVAC', 'EPP', 'odzysk ciepła'],

  verifiedAt: D,
  verifiedSources: [
    { title: 'Wentylacja mechaniczna z odzyskiem ciepła. Co to jest rekuperacja, jak działa', url: 'https://muratordom.pl/instalacje/wentylacja-i-klimatyzacja/wentylacja-mechaniczna-z-odzyskiem-ciepla-co-to-jest-rekuperacja-jak-dziala-aa-fnNk-N6ek-LJsh.html', domain: 'muratordom.pl', consultedAt: D },
    { title: 'Rekuperacja w praktyce. Montaż i użytkowanie wentylacji z odzyskiem ciepła', url: 'https://muratordom.pl/instalacje/wentylacja-i-klimatyzacja/rekuperacja-w-praktyce-montaz-i-uzytkowanie-wentylacji-z-odzyskiem-ciepla-aa-h1tn-TaaA-mWcj.html', domain: 'muratordom.pl', consultedAt: D },
    { title: 'Montaż rekuperacji: 13 najczęstszych błędów instalacji systemu', url: 'https://alnor.com.pl/blog/montaz-rekuperacji-13-najczestszych-bledow/', domain: 'alnor.com.pl', consultedAt: D },
    { title: 'Projektowanie i montaż instalacji rekuperacyjnej', url: 'https://www.rynekinstalacyjny.pl/artykul/projektowanie-i-montaz-instalacji-rekuperacyjnej', domain: 'rynekinstalacyjny.pl', consultedAt: D },
  ],
};
