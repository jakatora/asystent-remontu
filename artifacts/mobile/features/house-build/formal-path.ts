import type {
  FormalPathId,
  FormalPathAssessment,
  FormalCautionNote,
  SourceMetadata,
} from '@/types/house-build';

const PRAWO_BUDOWLANE_SOURCE: SourceMetadata = {
  sourceLabel: 'Prawo budowlane (Dz.U. 2024 poz. 725 t.j.)',
  sourceType: 'official',
  lastReviewedDate: '2025-01-15',
  classification: 'official',
  notes: 'Art. 29, 30, 36a — sciezki formalne budowy domu jednorodzinnego',
};

export interface FormalPathInput {
  readonly hasMpzp: boolean | null;
  readonly hasWz: boolean | null;
  readonly isSingleFamily: boolean;
  readonly isFreeStanding: boolean;
  readonly footprintArea: number | null;
  readonly floorsAboveGround: number;
  readonly forOwnHousing: boolean;
  readonly isFirstTimeInvestor: boolean;
  readonly prefersConservativePath: boolean;
}

export interface FormalPathDescription {
  readonly id: FormalPathId;
  readonly name: string;
  readonly shortDescription: string;
  readonly longDescription: string;
  readonly pros: readonly string[];
  readonly cons: readonly string[];
  readonly source: SourceMetadata;
}

export const FORMAL_PATHS: Record<FormalPathId, FormalPathDescription> = {
  'building-permit': {
    id: 'building-permit',
    name: 'Pozwolenie na budowe',
    shortDescription: 'Klasyczna sciezka z pelna procedura administracyjna',
    longDescription:
      'Inwestor sklada wniosek o pozwolenie na budowe do starostwa powiatowego (lub urzedu miasta na prawach powiatu). Organ wydaje decyzje administracyjna. Budowe mozna rozpoczac po uprawomocnieniu sie decyzji. To najbardziej uniwersalna sciezka, odpowiednia dla kazdego typu domu.',
    pros: [
      'Uniwersalna — pasuje do kazdego domu jednorodzinnego',
      'Decyzja administracyjna chroni inwestora',
      'Dobrze znana urzednikom i projektantom',
      'Mozliwosc odwolania sie od decyzji',
    ],
    cons: [
      'Dluzszy czas oczekiwania (ok. 65 dni ustawowo)',
      'Wymaga pelnego projektu budowlanego',
      'Wiecej formalnosci niz zgloszenie',
    ],
    source: PRAWO_BUDOWLANE_SOURCE,
  },
  'notification-with-design': {
    id: 'notification-with-design',
    name: 'Zgloszenie budowy z projektem',
    shortDescription: 'Uproszczona sciezka zgloszeniowa z projektem budowlanym',
    longDescription:
      'Inwestor sklada zgloszenie budowy wraz z projektem budowlanym. Organ ma 21 dni na ewentualny sprzeciw. Jesli nie wniesie sprzeciwu, mozna rozpoczac budowe. Sciezka dostepna dla wolnostojacych domów jednorodzinnych.',
    pros: [
      'Szybszy start — 21 dni zamiast 65',
      'Prostsza procedura',
      'Brak decyzji administracyjnej do oczekiwania',
    ],
    cons: [
      'Tylko dla wolnostojacych domów jednorodzinnych',
      'Brak formalnej decyzji (mniejsza ochrona prawna)',
      'Wymaga projektu budowlanego jak przy pozwoleniu',
    ],
    source: PRAWO_BUDOWLANE_SOURCE,
  },
  'simplified-70m2': {
    id: 'simplified-70m2',
    name: 'Uproszczona sciezka do 70 m2',
    shortDescription: 'Sciezka dla malych domów jednorodzinnych do 70 m2 zabudowy',
    longDescription:
      'Od 2022 r. mozliwa jest budowa domu do 70 m2 zabudowy na uproszczonych zasadach. Wymaga zgloszenia, oswiadczen i spelnienia dodatkowych warunków. Dostepne sa darmowe projekty rzadowe. UWAGA: ta sciezka nie jest automatycznie najlepsza — szczególnie dla poczatkujacych inwestorów moze byc bezpieczniej skorzystac z bardziej klasycznej sciezki z pelnym nadzorem.',
    pros: [
      'Najprostsza procedura formalna',
      'Mozliwosc skorzystania z darmowych projektów rzadowych',
      'Szybki start budowy',
    ],
    cons: [
      'Ograniczenie do 70 m2 zabudowy',
      'Maks. 2 kondygnacje nadziemne',
      'Ograniczone mozliwosci projektowe',
      'Mniejszy nadzor — ryzyko dla poczatkujacych inwestorów',
      'Nie dla wszystkich dzialek i warunków',
    ],
    source: {
      ...PRAWO_BUDOWLANE_SOURCE,
      notes: 'Art. 29 ust. 1 pkt 1a — budowa budynków mieszkalnych jednorodzinnych do 70 m2',
    },
  },
};

export function assessFormalPath(input: FormalPathInput): FormalPathAssessment {
  const cautionNotes: FormalCautionNote[] = [];
  let recommendedPath: FormalPathId = 'building-permit';
  const alternativePaths: FormalPathId[] = [];

  const could70m2 =
    input.isSingleFamily &&
    input.isFreeStanding &&
    input.footprintArea !== null &&
    input.footprintArea <= 70 &&
    input.floorsAboveGround <= 2 &&
    input.forOwnHousing;

  const couldNotification =
    input.isSingleFamily &&
    input.isFreeStanding;

  if (input.hasMpzp === null && input.hasWz === null) {
    cautionNotes.push({
      id: 'cn-no-planning-info',
      text: 'Nie znasz statusu planistycznego dzialki. Przed wyborem sciezki formalnej sprawdz MPZP lub uzyskaj WZ w urzedzie gminy.',
      level: 'important',
      source: PRAWO_BUDOWLANE_SOURCE,
    });
  }

  if (!input.hasMpzp && !input.hasWz) {
    cautionNotes.push({
      id: 'cn-need-wz',
      text: 'Jesli dzialka nie ma MPZP, prawdopodobnie bedzie potrzebna decyzja o Warunkach Zabudowy (WZ). Wniosek skladasz w urzedzie gminy.',
      level: 'caution',
      source: PRAWO_BUDOWLANE_SOURCE,
    });
  }

  if (input.prefersConservativePath) {
    recommendedPath = 'building-permit';
    cautionNotes.push({
      id: 'cn-conservative',
      text: 'Wybrales bezpieczniejsza sciezke. Pozwolenie na budowe to najbardziej uniwersalna i dobrze udokumentowana sciezka.',
      level: 'info',
    });
    if (couldNotification) alternativePaths.push('notification-with-design');
    if (could70m2) alternativePaths.push('simplified-70m2');
  } else if (could70m2 && !input.isFirstTimeInvestor) {
    recommendedPath = 'simplified-70m2';
    alternativePaths.push('notification-with-design', 'building-permit');
    cautionNotes.push({
      id: 'cn-70m2-conditions',
      text: 'Sciezka do 70 m2 wymaga spelnienia wszystkich warunków jednoczesnie: dom wolnostojacy, do 70 m2 zabudowy, maks. 2 kondygnacje, na wlasne cele mieszkaniowe. Zweryfikuj z urzedem i projektantem.',
      level: 'caution',
      source: PRAWO_BUDOWLANE_SOURCE,
    });
  } else if (could70m2 && input.isFirstTimeInvestor) {
    recommendedPath = 'building-permit';
    alternativePaths.push('simplified-70m2', 'notification-with-design');
    cautionNotes.push({
      id: 'cn-70m2-beginner-warning',
      text: 'Twój dom moze kwalifikowac sie na uproszczona sciezke do 70 m2, ale jako poczatkujacy inwestor rozwaz klasyczne pozwolenie na budowe — daje wiekszy nadzor i bezpieczenstwo formalne.',
      level: 'important',
    });
    cautionNotes.push({
      id: 'cn-free-projects',
      text: 'Dla sciezki do 70 m2 dostepne sa darmowe projekty domów opracowane na zlecenie rzadu. Moga byc punktem wyjscia, ale wymagaja adaptacji do dzialki.',
      level: 'info',
      source: {
        sourceLabel: 'Program budowy domów do 70 m2 — gov.pl',
        sourceType: 'official',
        lastReviewedDate: '2025-01-15',
        classification: 'official',
      },
    });
  } else if (couldNotification) {
    recommendedPath = 'notification-with-design';
    alternativePaths.push('building-permit');
    cautionNotes.push({
      id: 'cn-notification-info',
      text: 'Zgloszenie budowy z projektem to szybsza sciezka niz pozwolenie. Organ ma 21 dni na sprzeciw. Wymaga pelnego projektu budowlanego.',
      level: 'info',
      source: PRAWO_BUDOWLANE_SOURCE,
    });
  } else {
    recommendedPath = 'building-permit';
    cautionNotes.push({
      id: 'cn-permit-default',
      text: 'Dla Twojego typu budowy klasyczne pozwolenie na budowe jest najbardziej odpowiednia sciezka.',
      level: 'info',
    });
  }

  cautionNotes.push({
    id: 'cn-verify-locally',
    text: 'To orientacyjna ocena. Ostateczna sciezke formalna potwierdz z urzedem, architektem i na podstawie dokumentacji projektowej.',
    level: 'important',
  });

  return {
    ...input,
    recommendedPath,
    alternativePaths,
    cautionNotes,
  };
}
