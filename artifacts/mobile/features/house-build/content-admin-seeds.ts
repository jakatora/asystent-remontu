import type { AdminContentType, AdminSourceType, AdminReliabilityLevel } from '@/types/house-build';

export interface ContentSeedItem {
  readonly contentType: AdminContentType;
  readonly contentKey: string;
  readonly title: string;
  readonly summary: string;
  readonly body: string;
  readonly stageId: string;
  readonly category: string;
  readonly targetRole: string;
  readonly severity: string;
  readonly sourceText: string;
}

export interface SourceSeedItem {
  readonly id: string;
  readonly sourceName: string;
  readonly sourceType: AdminSourceType;
  readonly sourceUrl: string;
  readonly regionRelevance: string;
  readonly reliabilityLevel: AdminReliabilityLevel;
  readonly notes: string;
}

export interface DisclaimerSeedItem {
  readonly disclaimerKey: string;
  readonly text: string;
  readonly category: string;
}

export const CONTENT_TYPE_LABELS: Record<AdminContentType, string> = {
  'stage-description': 'Opisy etapow',
  'formal-guidance': 'Wytyczne formalne',
  'utility-guidance': 'Przylacza i media',
  'decision-template': 'Szablony decyzji',
  'question-template': 'Szablony pytan',
  'warning-note': 'Ostrzezenia',
  'checklist-group': 'Grupy checklisty',
  'completion-criteria': 'Kryteria ukonczenia',
  'milestone': 'Kamienie milowe',
  'role-guidance': 'Wytyczne specjalistow',
};

export const SOURCE_TYPE_LABELS: Record<AdminSourceType, string> = {
  'official': 'Oficjalne',
  'technical': 'Techniczne',
  'operator': 'Operator',
  'market': 'Rynkowe',
  'internal-guidance': 'Wewnetrzne',
  'other': 'Inne',
};

export const RELIABILITY_LABELS: Record<AdminReliabilityLevel, string> = {
  'high': 'Wysoka',
  'medium': 'Srednia',
  'low': 'Niska',
};

export const SOURCE_SEEDS: readonly SourceSeedItem[] = [
  {
    id: 'src-prawo-budowlane',
    sourceName: 'Prawo budowlane (Dz.U. 2024 poz. 725 t.j.)',
    sourceType: 'official',
    sourceUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240000725',
    regionRelevance: 'PL',
    reliabilityLevel: 'high',
    notes: 'Glowne zrodlo prawa budowlanego w Polsce.',
  },
  {
    id: 'src-upzp',
    sourceName: 'Ustawa o planowaniu i zagospodarowaniu przestrzennym',
    sourceType: 'official',
    sourceUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20030800717',
    regionRelevance: 'PL',
    reliabilityLevel: 'high',
    notes: 'Reguluje planowanie przestrzenne, MPZP, WZ.',
  },
  {
    id: 'src-warunki-tech',
    sourceName: 'Warunki techniczne budynkow (WT 2024)',
    sourceType: 'technical',
    sourceUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20190001065',
    regionRelevance: 'PL',
    reliabilityLevel: 'high',
    notes: 'Warunki techniczne jakim powinny odpowiadac budynki i ich usytuowanie.',
  },
  {
    id: 'src-edb-gunb',
    sourceName: 'Elektroniczny Dziennik Budowy (GUNB)',
    sourceType: 'official',
    sourceUrl: 'https://e-budownictwo.gunb.gov.pl/',
    regionRelevance: 'PL',
    reliabilityLevel: 'high',
    notes: 'System elektronicznego dziennika budowy.',
  },
  {
    id: 'src-praktyka-budowlana',
    sourceName: 'Wytyczne techniczne i praktyka budowlana',
    sourceType: 'technical',
    sourceUrl: '',
    regionRelevance: 'PL',
    reliabilityLevel: 'medium',
    notes: 'Praktyka budowlana i wytyczne branzy.',
  },
  {
    id: 'src-asystent-remontu',
    sourceName: 'Asystent Remontu - podsumowanie dla inwestora',
    sourceType: 'internal-guidance',
    sourceUrl: '',
    regionRelevance: 'PL',
    reliabilityLevel: 'medium',
    notes: 'Informacje orientacyjne. Szczegoly potwierdz z projektem, systemem i urzedem.',
  },
];

export const DISCLAIMER_SEEDS: readonly DisclaimerSeedItem[] = [
  {
    disclaimerKey: 'project-documentation-priority',
    text: 'Dokumentacja projektowa ma priorytet nad wszelkimi informacjami orientacyjnymi.',
    category: 'technical',
  },
  {
    disclaimerKey: 'system-product-priority',
    text: 'Dokumentacja wybranego systemu/produktu ma priorytet.',
    category: 'technical',
  },
  {
    disclaimerKey: 'verify-local-authority',
    text: 'Zweryfikuj wymagania z wlasciwym urzedem.',
    category: 'formal',
  },
  {
    disclaimerKey: 'verify-local-operator',
    text: 'Zweryfikuj szczegoly z lokalnym operatorem/dostawca.',
    category: 'operator',
  },
  {
    disclaimerKey: 'planning-estimate-only',
    text: 'Dane orientacyjne wylacznie do celow planistycznych.',
    category: 'pricing',
  },
  {
    disclaimerKey: 'not-legal-advice',
    text: 'Informacje nie stanowia porady prawnej.',
    category: 'legal',
  },
  {
    disclaimerKey: 'not-structural-engineering',
    text: 'Informacje nie zastepuja opinii konstruktora.',
    category: 'technical',
  },
];

export const STAGE_CONTENT_SEEDS: readonly ContentSeedItem[] = [
  { contentType: 'stage-description', contentKey: 'stage-land-purchase', title: 'Zakup dzialki', summary: 'Wybor i zakup dzialki budowlanej, weryfikacja MPZP, badanie gruntu.', body: 'Dzialka to fundament calej inwestycji. Jej parametry, stan prawny i warunki gruntowe wplywaja na koszty, mozliwosci projektowe i czas budowy.', stageId: 'land-purchase', category: '', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'stage-description', contentKey: 'stage-design-and-permits', title: 'Projekt i pozwolenia', summary: 'Wybor projektu domu, adaptacja, uzyskanie pozwolenia na budowe.', body: 'Projekt budowlany jest podstawa calej budowy. Okresla wymiary, konstrukcje, instalacje i wyglad domu. Bez pozwolenia nie mozna legalnie rozpoczac budowy.', stageId: 'design-and-permits', category: '', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'stage-description', contentKey: 'stage-site-preparation', title: 'Przygotowanie placu', summary: 'Przygotowanie terenu pod budowe, ogrodzenie, zagospodarowanie.', body: 'Prawidlowe przygotowanie placu budowy zapobiega opoznieniom i problemom logistycznym.', stageId: 'site-preparation', category: '', targetRole: '', severity: '', sourceText: 'Praktyka budowlana' },
  { contentType: 'stage-description', contentKey: 'stage-foundation', title: 'Fundamenty', summary: 'Wykonanie fundamentow zgodnie z projektem budowlanym.', body: 'Fundamenty przenosa obciazenia z calego budynku na grunt. Bledy na tym etapie sa kosztowne i trudne do naprawienia.', stageId: 'foundation', category: '', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'stage-description', contentKey: 'stage-structural-walls', title: 'Sciany konstrukcyjne', summary: 'Murowanie scian nosnych i dzialowych.', body: 'Sciany nosne to kluczowy element konstrukcji budynku. Musza byc wykonane zgodnie z projektem.', stageId: 'structural-walls', category: '', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'stage-description', contentKey: 'stage-roof', title: 'Dach', summary: 'Wykonanie konstrukcji dachowej i pokrycia.', body: 'Dach chroni budynek przed warunkami atmosferycznymi. Konstrukcja musi byc zgodna z projektem.', stageId: 'roof', category: '', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'stage-description', contentKey: 'stage-windows-doors', title: 'Okna i drzwi', summary: 'Montaz okien i drzwi zewnetrznych.', body: 'Okna i drzwi zamykaja bryle budynku. Wplywaja na energooszczednosc i komfort.', stageId: 'windows-doors', category: '', targetRole: '', severity: '', sourceText: 'WT 2024' },
  { contentType: 'stage-description', contentKey: 'stage-installations', title: 'Instalacje', summary: 'Wykonanie instalacji wewnetrznych.', body: 'Instalacje elektryczne, wodne, kanalizacyjne, grzewcze i wentylacyjne wymagaja specjalistow z uprawnieniami.', stageId: 'installations', category: '', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'stage-description', contentKey: 'stage-insulation-energy', title: 'Izolacja i energia', summary: 'Izolacja termiczna i planowanie energetyczne.', body: 'Odpowiednia izolacja decyduje o kosztach eksploatacji domu i komforcie cieplnym.', stageId: 'insulation-energy', category: '', targetRole: '', severity: '', sourceText: 'WT 2024' },
  { contentType: 'stage-description', contentKey: 'stage-exterior-finishing', title: 'Wykonczenie zewnetrzne', summary: 'Elewacja, tarasy, elementy zewnetrzne.', body: 'Wykonczenie zewnetrzne chroni izolacje i nadaje budynkowi ostateczny wyglad.', stageId: 'exterior-finishing', category: '', targetRole: '', severity: '', sourceText: 'Praktyka budowlana' },
  { contentType: 'stage-description', contentKey: 'stage-interior-finishing', title: 'Wykonczenie wewnetrzne', summary: 'Tynki, podlogi, malowanie, wyposazenie.', body: 'Etap wykonczeniowy nadaje domowi funkcjonalnosc i estetyczny charakter.', stageId: 'interior-finishing', category: '', targetRole: '', severity: '', sourceText: 'Praktyka budowlana' },
  { contentType: 'stage-description', contentKey: 'stage-landscaping', title: 'Zagospodarowanie terenu', summary: 'Ogrodzenie, podjazd, ogrod, mala architektura.', body: 'Zagospodarowanie terenu konczy inwestycje i nadaje dzialce funkcjonalnosc.', stageId: 'landscaping', category: '', targetRole: '', severity: '', sourceText: 'Praktyka budowlana' },
  { contentType: 'stage-description', contentKey: 'stage-final-inspections', title: 'Odbiory koncowe', summary: 'Odbiory techniczne i zawiadomienie o zakonczeniu budowy.', body: 'Formalne zakonczenie budowy wymaga odbioru przez odpowiednie organy.', stageId: 'final-inspections', category: '', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
];

export const WARNING_SEEDS: readonly ContentSeedItem[] = [
  { contentType: 'warning-note', contentKey: 'bw-formal-permits', title: 'Wymaga pozwolenia na budowe', summary: 'Budowa domu jednorodzinnego wymaga uzyskania prawomocnego pozwolenia na budowe lub zgloszenia budowy z projektem.', body: '', stageId: 'design-and-permits,site-preparation', category: 'formal-legal', targetRole: '', severity: 'danger', sourceText: 'Prawo budowlane' },
  { contentType: 'warning-note', contentKey: 'bw-kierownik', title: 'Kierownik budowy jest obowiazkowy', summary: 'Zgodnie z Prawem budowlanym, budowa domu wymaga wyznaczenia kierownika budowy z uprawnieniami.', body: '', stageId: 'design-and-permits,foundation,structural-walls,roof', category: 'formal-legal', targetRole: '', severity: 'danger', sourceText: 'Prawo budowlane' },
  { contentType: 'warning-note', contentKey: 'bw-structural-not-diy', title: 'Prace konstrukcyjne - nie wykonuj samodzielnie', summary: 'Fundamenty, sciany nosne, stropy i dach to elementy konstrukcyjne. Ich wykonanie musi byc zgodne z projektem i nadzorowane przez kierownika budowy.', body: '', stageId: 'foundation,structural-walls,roof', category: 'not-diy', targetRole: '', severity: 'danger', sourceText: 'Prawo budowlane' },
  { contentType: 'warning-note', contentKey: 'bw-installations-licensed', title: 'Instalacje wymagaja uprawnien', summary: 'Instalacje elektryczne, gazowe i wodno-kanalizacyjne musza byc wykonane przez osoby z odpowiednimi uprawnieniami.', body: '', stageId: 'installations', category: 'professional-required', targetRole: '', severity: 'danger', sourceText: 'Prawo budowlane' },
  { contentType: 'warning-note', contentKey: 'bw-gas-legal', title: 'Gaz - surowy wymog prawny', summary: 'Instalacja gazowa moze byc wykonywana wylacznie przez osoby z uprawnieniami gazowymi (UDT).', body: '', stageId: 'installations', category: 'not-diy', targetRole: '', severity: 'danger', sourceText: 'Prawo budowlane' },
  { contentType: 'warning-note', contentKey: 'bw-project-priority', title: 'Projekt i dokumentacja techniczna maja priorytet', summary: 'Wszelkie prace budowlane musza byc wykonywane zgodnie z zatwierdzonym projektem budowlanym.', body: '', stageId: 'foundation,structural-walls,roof,installations,insulation-energy', category: 'technical-documentation', targetRole: '', severity: 'warning', sourceText: 'Prawo budowlane' },
  { contentType: 'warning-note', contentKey: 'bw-height-safety', title: 'Bezpieczenstwo pracy na wysokosci', summary: 'Prace na dachu i rusztowaniach wymagaja srodkow ochrony indywidualnej i doswiadczenia.', body: '', stageId: 'roof,exterior-finishing', category: 'safety-critical', targetRole: '', severity: 'danger', sourceText: 'BHP' },
  { contentType: 'warning-note', contentKey: 'bw-insulation-details', title: 'Detale izolacji sa krytyczne', summary: 'Bledy w detalu izolacji powoduja mostki termiczne i problemy z wilgocia.', body: '', stageId: 'insulation-energy', category: 'quality-standard', targetRole: '', severity: 'warning', sourceText: 'WT 2024' },
];

export const DECISION_SEEDS: readonly ContentSeedItem[] = [
  { contentType: 'decision-template', contentKey: 'dec-technology', title: 'Technologia / system budowy domu', summary: '', body: '', stageId: 'structural-walls', category: 'technology', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'decision-template', contentKey: 'dec-wall-system', title: 'System scian konstrukcyjnych', summary: '', body: '', stageId: 'structural-walls', category: 'structure', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'decision-template', contentKey: 'dec-roof-system', title: 'System dachowy', summary: '', body: '', stageId: 'roof', category: 'structure', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'decision-template', contentKey: 'dec-windows', title: 'Standard okien (Uw, pakiet szybowy)', summary: '', body: '', stageId: 'windows-doors', category: 'energy', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'decision-template', contentKey: 'dec-heating', title: 'Koncepcja ogrzewania', summary: '', body: '', stageId: 'installations', category: 'energy', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'decision-template', contentKey: 'dec-ventilation', title: 'Koncepcja wentylacji', summary: '', body: '', stageId: 'installations', category: 'energy', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'decision-template', contentKey: 'dec-insulation', title: 'Strategia izolacji', summary: '', body: '', stageId: 'insulation-energy', category: 'energy', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'decision-template', contentKey: 'dec-facade', title: 'System elewacji', summary: '', body: '', stageId: 'exterior-finishing', category: 'finishing', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'decision-template', contentKey: 'dec-contractors', title: 'Podejscie do wyboru wykonawcow', summary: '', body: '', stageId: '', category: 'organization', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'decision-template', contentKey: 'dec-interior', title: 'Standard wykonczenia wnetrz', summary: '', body: '', stageId: 'interior-finishing', category: 'finishing', targetRole: '', severity: '', sourceText: '' },
];

export const QUESTION_SEEDS: readonly ContentSeedItem[] = [
  { contentType: 'question-template', contentKey: 'q-hydro-system', title: 'Jaki system hydroizolacji jest zaplanowany i dlaczego?', summary: '', body: '', stageId: 'foundation', category: '', targetRole: 'structural-engineer', severity: '', sourceText: '' },
  { contentType: 'question-template', contentKey: 'q-ground-conditions', title: 'Jakie warunki gruntowe najbardziej wplywaja na ten etap?', summary: '', body: '', stageId: 'foundation', category: '', targetRole: 'structural-engineer', severity: '', sourceText: '' },
  { contentType: 'question-template', contentKey: 'q-water-level', title: 'Czy poziom wod gruntowych wymaga dodatkowych zabezpieczen?', summary: '', body: '', stageId: 'foundation', category: '', targetRole: 'structural-engineer', severity: '', sourceText: '' },
  { contentType: 'question-template', contentKey: 'q-wall-system', title: 'Jaki system scian zostal wybrany i jakie sa kluczowe tolerancje wykonania?', summary: '', body: '', stageId: 'structural-walls', category: '', targetRole: 'general-contractor', severity: '', sourceText: '' },
  { contentType: 'question-template', contentKey: 'q-reinforcements', title: 'Czy sa wymagane dodatkowe wzmocnienia konstrukcyjne (nadproza, wience)?', summary: '', body: '', stageId: 'structural-walls', category: '', targetRole: 'structural-engineer', severity: '', sourceText: '' },
  { contentType: 'question-template', contentKey: 'q-roof-layers', title: 'Jaki system warstw dachowych jest zaplanowany i jakie detale sa krytyczne?', summary: '', body: '', stageId: 'roof', category: '', targetRole: 'roofer', severity: '', sourceText: '' },
  { contentType: 'question-template', contentKey: 'q-rain-protection', title: 'Jak zabezpieczony jest budynek przed opadami w trakcie prac dachowych?', summary: '', body: '', stageId: 'roof', category: '', targetRole: 'roofer', severity: '', sourceText: '' },
  { contentType: 'question-template', contentKey: 'q-install-conflicts', title: 'Czy sa konflikty miedzy trasami instalacji elektrycznych, wodnych, grzewczych i wentylacyjnych?', summary: '', body: '', stageId: 'installations', category: '', targetRole: 'electrician', severity: '', sourceText: '' },
  { contentType: 'question-template', contentKey: 'q-distribution', title: 'Gdzie zaplanowane sa rozdzielnice i punkty przylaczy?', summary: '', body: '', stageId: 'installations', category: '', targetRole: 'electrician', severity: '', sourceText: '' },
  { contentType: 'question-template', contentKey: 'q-window-mount', title: 'Czy montaz okien bedzie w warstwie izolacji czy w murze?', summary: '', body: '', stageId: 'windows-doors', category: '', targetRole: 'general-contractor', severity: '', sourceText: '' },
];

export const MILESTONE_SEEDS: readonly ContentSeedItem[] = [
  { contentType: 'milestone', contentKey: 'ms-formal-path-ready', title: 'Sciezka formalna gotowa', summary: 'Pozwolenie na budowe prawomocne lub zgloszenie zlozone.', body: '', stageId: 'design-and-permits', category: '', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'milestone', contentKey: 'ms-before-start-ready', title: 'Gotowosc do rozpoczecia budowy', summary: 'Zawiadomienie zlozone, kierownik wyznaczony, plac gotowy.', body: '', stageId: 'site-preparation', category: '', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'milestone', contentKey: 'ms-foundations-accepted', title: 'Fundamenty odebrane', summary: 'Fundamenty wykonane i odebrane przez kierownika budowy.', body: '', stageId: 'foundation', category: '', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'milestone', contentKey: 'ms-shell-closed', title: 'Stan surowy zamkniety', summary: 'Sciany, strop i dach wykonane - bryla budynku zamknieta.', body: '', stageId: 'structural-walls,roof', category: '', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'milestone', contentKey: 'ms-building-enclosed', title: 'Budynek zamkniety', summary: 'Okna i drzwi zamontowane - budynek zabezpieczony przed pogoda.', body: '', stageId: 'windows-doors', category: '', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'milestone', contentKey: 'ms-installations-complete', title: 'Instalacje wykonane', summary: 'Wszystkie instalacje wewnetrzne wykonane i odebrane.', body: '', stageId: 'installations', category: '', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'milestone', contentKey: 'ms-energy-confirmed', title: 'Planowanie energetyczne potwierdzone', summary: 'Strategia izolacji, ogrzewania i wentylacji zatwierdzona.', body: '', stageId: 'insulation-energy', category: '', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'milestone', contentKey: 'ms-interior-ready', title: 'Wnetrze gotowe do uzytkowania', summary: 'Wykonczenie wewnetrzne zakonczone.', body: '', stageId: 'interior-finishing', category: '', targetRole: '', severity: '', sourceText: '' },
  { contentType: 'milestone', contentKey: 'ms-final-acceptance', title: 'Odbiory koncowe', summary: 'Budowa formalnie zakonczona.', body: '', stageId: 'final-inspections', category: '', targetRole: '', severity: '', sourceText: '' },
];

export const FORMAL_GUIDANCE_SEEDS: readonly ContentSeedItem[] = [
  { contentType: 'formal-guidance', contentKey: 'fg-mpzp-wz', title: 'Weryfikacja MPZP / WZ', summary: 'Sprawdzenie statusu planistycznego dzialki.', body: 'Ustal, czy dzialka jest objeta MPZP. Jesli nie, konieczna moze byc decyzja WZ.', stageId: 'land-purchase', category: 'planning', targetRole: '', severity: '', sourceText: 'Ustawa o planowaniu przestrzennym' },
  { contentType: 'formal-guidance', contentKey: 'fg-permit-vs-notification', title: 'Pozwolenie vs zgloszenie', summary: 'Roznice miedzy pozwoleniem na budowe a zgloszeniem.', body: 'Pozwolenie wymagane dla wiekszosci budynkow. Zgloszenie mozliwe w uproszczonych przypadkach.', stageId: 'design-and-permits', category: 'permits', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'formal-guidance', contentKey: 'fg-70m2-caution', title: 'Uproszczona budowa <=70 m2 - przestrogi', summary: 'Ograniczenia i ryzyka uproszczonej procedury.', body: 'Uproszczona procedura (do 70 m2) nie zwalnia z wymagan technicznych. Ograniczona pomoc nadzoru.', stageId: 'design-and-permits', category: 'permits', targetRole: '', severity: 'warning', sourceText: 'Prawo budowlane' },
  { contentType: 'formal-guidance', contentKey: 'fg-before-start', title: 'Przed rozpoczeciem budowy', summary: 'Obowiazki przed rozpoczeciem robot budowlanych.', body: 'Zawiadomienie PINB, wpis kierownika, EDB, tablica informacyjna.', stageId: 'site-preparation', category: 'start', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'formal-guidance', contentKey: 'fg-pb12', title: 'Formularz PB-12', summary: 'Zawiadomienie o zamierzonym terminie rozpoczecia robot budowlanych.', body: 'Formularz PB-12 sklada sie w PINB min. 7 dni przed rozpoczeciem robot.', stageId: 'site-preparation', category: 'forms', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'formal-guidance', contentKey: 'fg-edb', title: 'Elektroniczny Dziennik Budowy', summary: 'Obowiazek prowadzenia EDB.', body: 'Od 2023 r. obowiazkowy elektroniczny dziennik budowy (system GUNB).', stageId: 'site-preparation', category: 'documentation', targetRole: '', severity: '', sourceText: 'Prawo budowlane, GUNB' },
  { contentType: 'formal-guidance', contentKey: 'fg-completion-notice', title: 'Zawiadomienie o zakonczeniu budowy', summary: 'Procedura zakonczenia budowy.', body: 'Po zakonczeniu robot skladamy zawiadomienie do PINB. Czekamy 14 dni na ewentualny sprzeciw.', stageId: 'final-inspections', category: 'completion', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'formal-guidance', contentKey: 'fg-occupancy', title: 'Pozwolenie na uzytkowanie', summary: 'Kiedy wymagane pozwolenie na uzytkowanie.', body: 'Pozwolenie na uzytkowanie wymagane dla niektorych kategorii obiektow lub przy zmianach sposobu uzytkowania.', stageId: 'final-inspections', category: 'completion', targetRole: '', severity: '', sourceText: 'Prawo budowlane' },
];

export const UTILITY_GUIDANCE_SEEDS: readonly ContentSeedItem[] = [
  { contentType: 'utility-guidance', contentKey: 'ug-electricity', title: 'Przylacze elektryczne', summary: 'Procedura uzyskania przylacza elektrycznego.', body: 'Wniosek o warunki przylaczeniowe do operatora OSD. Umowa przylaczeniowa. Realizacja.', stageId: 'installations', category: 'electricity', targetRole: '', severity: '', sourceText: 'Operatorzy OSD' },
  { contentType: 'utility-guidance', contentKey: 'ug-water', title: 'Przylacze wodociagowe', summary: 'Procedura przylaczenia do sieci wodociagowej.', body: 'Wniosek do przedsiebiorstwa wodociagowego. Warunki techniczne. Wykonanie przylacza.', stageId: 'installations', category: 'water', targetRole: '', severity: '', sourceText: 'Ustawa o zbiorowym zaopatrzeniu w wode' },
  { contentType: 'utility-guidance', contentKey: 'ug-sewer', title: 'Przylacze kanalizacyjne', summary: 'Przylaczenie do kanalizacji lub alternatywy.', body: 'Przylacze kanalizacyjne lub przydomowa oczyszczalnia sciekow / zbiornik bezodplywowy.', stageId: 'installations', category: 'sewer', targetRole: '', severity: '', sourceText: 'Ustawa o zbiorowym zaopatrzeniu w wode' },
  { contentType: 'utility-guidance', contentKey: 'ug-gas', title: 'Przylacze gazowe', summary: 'Procedura uzyskania przylacza gazowego.', body: 'Wniosek do operatora gazowego. Warunki przylaczeniowe. Projekt i wykonanie.', stageId: 'installations', category: 'gas', targetRole: '', severity: '', sourceText: 'Operator gazowy' },
  { contentType: 'utility-guidance', contentKey: 'ug-internet', title: 'Internet / telekomunikacja', summary: 'Planowanie przylacza telekomunikacyjnego.', body: 'Sprawdz dostepnosc na internet.gov.pl. Swiatowod preferowany. Umowa z operatorem.', stageId: 'installations', category: 'internet', targetRole: '', severity: '', sourceText: 'Operatorzy telekomunikacyjni' },
];

export const ROLE_GUIDANCE_SEEDS: readonly ContentSeedItem[] = [
  { contentType: 'role-guidance', contentKey: 'rg-architect', title: 'Architekt', summary: 'Projektant z uprawnieniami budowlanymi.', body: 'Odpowiada za projekt budowlany, adaptacje, nadzor autorski.', stageId: 'design-and-permits', category: 'design', targetRole: 'architect', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'role-guidance', contentKey: 'rg-structural-engineer', title: 'Konstruktor', summary: 'Inzynier z uprawnieniami konstrukcyjnymi.', body: 'Odpowiada za projekt konstrukcji, obliczenia statyczne.', stageId: 'foundation,structural-walls,roof', category: 'structural', targetRole: 'structural-engineer', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'role-guidance', contentKey: 'rg-general-contractor', title: 'Kierownik budowy', summary: 'Obowiazkowy uczestnik procesu budowlanego.', body: 'Nadzoruje wykonanie robot, prowadzi dziennik budowy, odpowiada za BHP.', stageId: 'site-preparation,foundation,structural-walls,roof,installations', category: 'management', targetRole: 'general-contractor', severity: '', sourceText: 'Prawo budowlane' },
  { contentType: 'role-guidance', contentKey: 'rg-geodesist', title: 'Geodeta', summary: 'Wykonuje pomiary geodezyjne.', body: 'Mapa do celow projektowych, tyczenie budynku, inwentaryzacja powykonawcza.', stageId: 'land-purchase,final-inspections', category: 'surveying', targetRole: 'geodesist', severity: '', sourceText: 'Prawo geodezyjne' },
  { contentType: 'role-guidance', contentKey: 'rg-electrician', title: 'Elektryk', summary: 'Instalator z uprawnieniami SEP.', body: 'Wykonuje instalacje elektryczne, podlaczenia, pomiary ochronne.', stageId: 'installations', category: 'installations', targetRole: 'electrician', severity: '', sourceText: 'Prawo energetyczne' },
];

export function getAllContentSeeds(): readonly ContentSeedItem[] {
  return [
    ...STAGE_CONTENT_SEEDS,
    ...WARNING_SEEDS,
    ...DECISION_SEEDS,
    ...QUESTION_SEEDS,
    ...MILESTONE_SEEDS,
    ...FORMAL_GUIDANCE_SEEDS,
    ...UTILITY_GUIDANCE_SEEDS,
    ...ROLE_GUIDANCE_SEEDS,
  ];
}

export const OUTDATED_RULES = {
  reviewSoonDays: 60,
  outdatedDays: 120,
};
