import type { QuestionTemplate } from './question-templates';

export const UTILITY_QUESTION_TEMPLATES: readonly QuestionTemplate[] = [
  {
    questionText: 'Jaka moc przylaczeniowa jest odpowiednia dla domu i planowanych urzadzen?',
    stageKey: 'installations',
    targetRole: 'electrician',
    priority: 'high',
  },
  {
    questionText: 'Jaki jest prawdopodobny harmonogram procesu przylaczenia do sieci elektrycznej?',
    stageKey: 'site-preparation',
    targetRole: 'electrician',
    priority: 'normal',
  },
  {
    questionText: 'Czy zasilanie tymczasowe placu budowy wymaga osobnego wniosku?',
    stageKey: 'site-preparation',
    targetRole: 'electrician',
    priority: 'normal',
  },
  {
    questionText: 'Czy siec wodociagowa jest dostepna bezposrednio przy dzialce, czy bedzie potrzebne przedluzenie trasy?',
    stageKey: 'site-preparation',
    targetRole: 'plumber',
    priority: 'high',
  },
  {
    questionText: 'Jaki rysunek/plan jest wymagany do wniosku o przylacze wodociagowe?',
    stageKey: 'site-preparation',
    targetRole: 'plumber',
    priority: 'normal',
  },
  {
    questionText: 'Czy siec kanalizacyjna jest dostepna przy dzialce? Jesli nie, jakie alternatywy sa dostepne?',
    stageKey: 'site-preparation',
    targetRole: 'plumber',
    priority: 'high',
  },
  {
    questionText: 'Czy przylacze gazowe jest technicznie i ekonomicznie dostepne w tej lokalizacji?',
    stageKey: 'installations',
    targetRole: 'gas-installer',
    priority: 'high',
  },
  {
    questionText: 'Jaki harmonogram powinien zakladac inwestor dla procesu przylaczenia gazowego?',
    stageKey: 'installations',
    targetRole: 'gas-installer',
    priority: 'normal',
  },
  {
    questionText: 'Którzy dostawcy internetu obsluguja tę lokalizacje?',
    stageKey: 'installations',
    targetRole: 'electrician',
    priority: 'normal',
  },
  {
    questionText: 'Czy warto przygotowac trase telekomunikacyjna (mikrorure) podczas budowy?',
    stageKey: 'installations',
    targetRole: 'electrician',
    priority: 'normal',
  },
];
