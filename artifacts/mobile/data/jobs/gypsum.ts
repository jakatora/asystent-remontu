import { gypsumMaterials, gypsumCommonInputs, gypsumWallInputs, gypsumCeilingInputs } from '@/features/calculator/gypsumBoard';
import type { RenovationJob } from '@/types/domain';
import { SHARED_SHOP_PRICES } from '@/data/prices/shared-shop-prices';

// ─── Gypsum board partition wall ──────────────────────────────────────────────

export const gypsumWallJob: RenovationJob = {
  id: 'gypsum-wall',
  categoryId: 'gypsum',
  name: 'Ścianka działowa z płyt GK',
  description: 'Zestaw do suchego wnętrza: Norgips CW/UW 50, jedna warstwa GKB 12,5 mm na każdej stronie i wełna 50 mm. Ilości z obmiarów i jawnych założeń; wzmocnienia otworów wymagają doboru.',
  difficulty: 'medium',
  riskLevel: 'low',
  estimatedDays: 2,
  coverIcon: 'columns',
  warningRules: [
    { condition: 'always', level: 'warning', message: 'Koszyk jest szacunkiem materiałów dla wskazanego wariantu. Rozkład konstrukcji, nośność podłoża i dobór mocowań potwierdź z projektem / fachowcem; nie wynika z niego klasa ogniowa ani akustyczna.' },
    {
      condition: 'always',
      message: 'Sprawdź, czy w ścianie lub suficie nie biegną rury ani kable przed wierceniem.',
      level: 'warning',
    },
    {
      condition: 'beginner',
      message: 'Praca wymaga dokładności przy stawianiu rusztu — błędy będą widoczne po tynkowaniu.',
      level: 'info',
    },
    {
      condition: 'large-area',
      message: 'Przy dużych powierzchniach zaplanuj dylatacje i pamiętaj o stabilności konstrukcji.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'wallArea',
      label: 'Powierzchnia ścianki',
      unit: 'm²',
      placeholder: 'np. 12',
      min: 1,
      max: 200,
      hint: 'Powierzchnia jednej strony: długość × wysokość, brutto bez odejmowania otworów. Kalkulator doliczy płyty na obie strony.',
    },
    {
      id: 'perimeter',
      label: 'Obwód ścianki — opcjonalne sprawdzenie',
      required: false,
      unit: 'm',
      placeholder: 'np. 8',
      min: 1,
      max: 100,
      hint: 'Puste = 2 × (długość + wysokość), wyliczone z powierzchni i wysokości. Obwód służy taśmie uszczelniającej; UW liczymy tylko na podłodze i suficie, CW na pionach.',
    },
    ...gypsumWallInputs,
    ...gypsumCommonInputs,
  ],
  materials: gypsumMaterials('gypsum-wall'),
  tools: [
    { id: 'screwdriver', name: 'Wkrętarka akumulatorowa', icon: 'tool', required: true },
    { id: 'level', name: 'Poziomica (120 cm)', icon: 'minus', required: true },
    { id: 'cutting-knife', name: 'Nóż stolarski do GK', icon: 'scissors', required: true },
    { id: 'drill', name: 'Wiertarka z udarem (SDS)', icon: 'tool', required: true, shopPrices: SHARED_SHOP_PRICES.sdsHammerDrill },
    { id: 'metal-shears', name: 'Nożyce do metalu', icon: 'scissors', required: true },
    { id: 'gk-rasp', name: 'Rasp / tarka do krawędzi GK', icon: 'tool', required: false },
  ],
  instructions: [
    {
      step: 1,
      title: 'Wyznacz przebieg ścianki',
      description: 'Zaznacz linię ścianki na podłodze. Przenieś ją na sufit linią pionu. Zaznacz pionowe krawędzie na ścianach.',
      tip: 'Użyj laserowego poziomicy — zaoszczędzisz godzinę czasu.',
      durationMin: 30,
    },
    {
      step: 2,
      title: 'Zamontuj profile UW',
      description: 'Przyklej taśmę uszczelniającą do profili UW i przymocuj je do podłogi i sufitu co 50–70 cm kołkami.',
      warning: 'Sprawdź czy pod podłogą lub w suficie nie biegną przewody przed wierceniem.',
      durationMin: 60,
    },
    {
      step: 3,
      title: 'Wstaw profile CW',
      // source: https://norgips.pl/rozwiazania/sciany-dzialowe/konstrukcja-pojedyncza-z-jednokrotnym-poszyciem-z-plyt-gk/sd-1x125-gkb-acw-50-w/
      description: 'Wstaw CW w UW według projektu, w tym wariancie maksymalnie co 60 cm. Nie skręcaj automatycznie wszystkich CW z UW; zachowaj połączenia przesuwne i detale producenta. Przy otworach dobierz wzmocnienia.',
      durationMin: 60,
    },
    {
      step: 4,
      title: 'Zamontuj pierwszą stronę GK',
      description: 'Przykręć płyty GK wkrętami TN co najwyżej 25 cm wzdłuż profili. Wkręty wkręcaj nieco poniżej powierzchni, nie przez papier.',
      tip: 'GK tnie się łatwo: natnij nożem, złam na krawędzi, odetnij papier od tyłu.',
      durationMin: 120,
    },
    {
      step: 5,
      title: 'Wypełnij wełną i zamontuj drugą stronę',
      description: 'Włóż wełnę mineralną między profile. Zamontuj płyty GK z drugiej strony.',
      durationMin: 90,
    },
    {
      step: 6,
      title: 'Szpachluj spoiny',
      description: 'Spoinuj gotową masą Norgips Start & Finish z taśmą według karty. Wybrany Q1/Q2 dotyczy spoin, nie gładzi na całej powierzchni. Dalsze warstwy i szlifowanie po pełnym wyschnięciu, zależnym od warunków i grubości.',
      tip: 'Cienka warstwa szpachli wysycha szybciej i łatwiej się szlifuje.',
      durationMin: 120,
    },
  ],
  commonMistakes: [
    'Profile za rzadko — ściana ugina się i rezonuje',
    'Płyty montowane do siebie — zostawiaj szczeliny 2–3 mm na dilat.',
    'Brak taśmy uszczelniającej pod profilami — skrzypią',
    'Wkręty za głęboko — niszczą rdzeń GK',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Ściana jest pionowa (sprawdź poziomicą)' },
    { id: 'q2', description: 'Spoiny są wyszpachlowane i wyrównane' },
    { id: 'q3', description: 'Brak widocznych łbów wkrętów na powierzchni' },
    { id: 'q4', description: 'Ściana nie ugina się przy nacisku' },
  ],
  hireProfessionalRecommended: false,
  tags: ['gips-karton', 'ściana', 'działowa', 'GK', 'sucha zabudowa'],

  verifiedAt: '2026-10-27',
  verifiedSources: [
    {
      title:       'Jak zbudować ściankę działową z płyt karton-gipsowych? Instrukcja krok po kroku',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/jak-zbudowac-scianke-dzialowa-z-plyt-karton-gipsowych-instrukcja-krok-po-kroku-aa-r9ti-3g81-bEkw.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-07-10',
    },
  ],
};

// ─── Gypsum board ceiling ─────────────────────────────────────────────────────

export const gypsumCeilingJob: RenovationJob = {
  id: 'gypsum-ceiling',
  categoryId: 'gypsum',
  name: 'Sufit podwieszany z GK',
  description: 'Zestaw Norgips: jedna warstwa GKB 12,5 mm, ruszt CD 60 dwupoziomowy na ES 60/75. Profile, łączniki i kotwy liczone oddzielnie. Szacunek zakupów wymaga sprawdzenia z projektem sufitu.',
  difficulty: 'hard',
  riskLevel: 'medium',
  estimatedDays: 3,
  coverIcon: 'grid',
  warningRules: [
    { condition: 'always', level: 'warning', message: 'Koszyk jest szacunkiem materiałów dla wskazanego wariantu. Rozkład konstrukcji, nośność podłoża i dobór mocowań potwierdź z projektem / fachowcem; nie wynika z niego klasa ogniowa ani akustyczna.' },
    {
      condition: 'always',
      message: 'Praca nad głową jest wyczerpująca — rób regularne przerwy co 20–30 minut.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Wyłącz instalację elektryczną w pomieszczeniu przed montażem opraw oświetleniowych.',
      level: 'warning',
    },
    {
      condition: 'beginner',
      message: 'Zalecamy pomoc drugiej osoby — montaż samemu jest bardzo trudny.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'ceilingArea',
      label: 'Powierzchnia sufitu',
      unit: 'm²',
      placeholder: 'np. 16',
      min: 2,
      max: 300,
      hint: 'Długość pomieszczenia × szerokość.',
    },
    {
      id: 'perimeter',
      label: 'Obwód pomieszczenia',
      unit: 'm',
      placeholder: 'np. 16',
      min: 4,
      max: 100,
      hint: '2 × (długość + szerokość).',
    },
    ...gypsumCeilingInputs,
    ...gypsumCommonInputs,
  ],
  materials: gypsumMaterials('gypsum-ceiling'),
  tools: [
    { id: 'screwdriver-ceil', name: 'Wkrętarka akumulatorowa', icon: 'tool', required: true },
    { id: 'laser-level', name: 'Poziomica laserowa', icon: 'minus', required: true, notes: 'Niezbędna do wyznaczenia poziomej płaszczyzny sufitu' },
    { id: 'drill-ceil', name: 'Wiertarka z udarem (SDS)', icon: 'tool', required: true, shopPrices: SHARED_SHOP_PRICES.sdsHammerDrill },
    { id: 'scaffolding', name: 'Rusztowanie lub stabilna drabina', icon: 'chevrons-up', required: true, rentable: true, shopPrices: SHARED_SHOP_PRICES.ladder4steps },
    { id: 'knife-ceil', name: 'Nóż do GK', icon: 'scissors', required: true },
    { id: 'goggles-ceil', name: 'Okulary ochronne', icon: 'eye', required: true, notes: 'Pył gipsowy jest szkodliwy dla oczu' },
    { id: 'respirator', name: 'Maska przeciwpyłowa', icon: 'shield', required: true },
  ],
  instructions: [
    {
      step: 1,
      title: 'Wyznacz poziom sufitu',
      description: 'Laserem lub wężem poziomiczym wyznacz docelowy poziom sufitu podwieszanego na wszystkich ścianach. Zaznacz linię kredą lub ołówkiem.',
      tip: 'Wysokość podwieszenia dobierz do zakresu ES 60/75, rusztu dwupoziomowego i instalacji według projektu. Nie zakładamy dowolnego obniżenia z tym samym wieszakiem.',
      durationMin: 30,
    },
    {
      step: 2,
      title: 'Zamontuj profile UD obwodowe',
      description: 'Przykręć profile UD wzdłuż zaznaczonych linii na wszystkich ścianach. Co 40–50 cm kołek.',
      durationMin: 60,
    },
    {
      step: 3,
      title: 'Zamontuj wieszaki i profile CD',
      // source: https://norgips.pl/rozwiazania/sufity-podwieszane/sufity-podwieszane-z-jednokrotnym-poszyciem-z-plyt-g-k-na-ruszcie-dwupoziomowym/sp-1x125-gkb-acd-60-es/
      description: 'Dobierz stalowe kotwy do nośnego stropu. W tym ruszcie dwupoziomowym CD: profile główne do 100 cm, nośne do 50 cm, ES do 85 cm, zgodnie z projektem i obciążeniem. Połącz poziomy łącznikami krzyżowymi; przedłużenia wykonuj łącznikami wzdłużnymi. Do połączeń metalowych użyj właściwych wkrętów 3,5 × 9,5 mm.',
      warning: 'Sprawdź czy wieszaki są dobrze zakotwione — niosą ciężar sufitu.',
      durationMin: 180,
    },
    {
      step: 4,
      title: 'Montuj płyty GK',
      description: 'Mocuj płyty do profili nośnych TN 3,5 × 25 mm, maksymalnie co 17 cm. Układ, przesunięcie i podparcie krawędzi płyt wykonaj według detalu systemu. Nie naruszaj papieru łbem wkręta.',
      tip: 'Pomocna jest "podnośnica" do płyt (lub 2 osoby) — samodzielny montaż jest niemal niemożliwy.',
      durationMin: 240,
    },
    {
      step: 5,
      title: 'Szpachluj spoiny',
      description: 'Wypełnij spoiny gotową Start & Finish z taśmą według karty produktu. Q1/Q2 dotyczy spoin. Kolejne warstwy i szlifowanie po pełnym wyschnięciu zależnym od grubości i warunków, nie automatycznie po 24 godzinach.',
      durationMin: 180,
    },
  ],
  commonMistakes: [
    'Brak lasera — sufit wychodzi krzywy',
    'Za mała ilość wieszaków — sufit ugina się pod własnym ciężarem',
    'Płyty stykają się z ścianami — pękają przy ruchach budynku',
    'Praca bez rusztowania — jest wolna i niebezpieczna',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Sufit jest poziomy (odchyłka max 2 mm na 2 m)' },
    { id: 'q2', description: 'Spoiny są niewidoczne po zeszlifowaniu' },
    { id: 'q3', description: 'Oprawy oświetleniowe mają miejsce na odprowadzenie ciepła' },
    { id: 'q4', description: 'Krawędzie przy ścianach mają wąską szczelinę dylatacyjną' },
  ],
  hireProfessionalRecommended: false,
  hireProfessionalReason: 'Sufit podwieszany wymaga precyzji i doświadczenia — błędy są kosztowne.',
  tags: ['gips-karton', 'sufit', 'podwieszany', 'GK', 'sucha zabudowa'],

  verifiedAt: '2026-10-27',
  verifiedSources: [
    {
      title:       'Sufit podwieszany z płyt gipsowo-kartonowych. Montaż sufitu powieszanego krok po kroku',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/sufit-podwieszany-z-plyt-gipsowo-kartonowych-aa-vCXe-mpMU-n7rt.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-07-10',
    },
  ],
};
