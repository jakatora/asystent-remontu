import type { RenovationJob } from '@/types/domain';

// ─── Window frame sealing / re-sealing ───────────────────────────────────────

export const windowSealingJob: RenovationJob = {
  id: 'window-sealing',
  categoryId: 'windows',
  name: 'Uszczelnienie okien',
  description: 'Usuń stare uszczelki i piankę, załóż nowe — okna przestaną przeciągać.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'wind',
  warningRules: [
    {
      condition: 'always',
      message: 'Pianka montażowa ekspanduje — nie nakładaj za dużo. Nadmiar rozepchnie ościeżnicę.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Stara pianka może zawierać formaldehyd — wietrz pomieszczenie przy usuwaniu.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'perimeter',
      label: 'Łączny obwód okien',
      unit: 'm',
      placeholder: 'np. 12',
      min: 1,
      max: 200,
      hint: 'Dodaj obwody wszystkich okien do uszczelnienia. Jedno okno 100×120 cm = ok. 4,4 m.',
    },
  ],
  materials: [
    {
      id: 'window-gasket',
      name: 'Uszczelka silikonowa EPDM (do skrzydła)',
      unit: 'm',
      formulaKey: 'skirting',
      pricePerUnit: 2.5,
      wasteFactor: 1.1,
      notes: 'Pasuje do rowka skrzydła okna. Mierz i kupuj z zapasem.',
    },
    {
      id: 'mounting-foam',
      name: 'Pianka montażowa zimowa (do ościeżnicy)',
      unit: 'szt',
      formulaKey: 'byPerimeter',
      wasteFactor: 0.125,
      pricePerUnit: 25,
      notes: '1 puszka na ok. 8 mb szczeliny.',
    },
    {
      id: 'silicone-window',
      name: 'Silikon akrylowy biały (do wewnątrz)',
      unit: 'kartusze',
      formulaKey: 'silicone',
      pricePerUnit: 18,
      notes: 'Do uszczelnienia styku ościeżnicy ze ścianą od wewnątrz.',
    },
    {
      id: 'window-tape',
      name: 'Taśma rozprężna (Pro Clima lub podobna)',
      unit: 'm',
      formulaKey: 'linearMeters',
      pricePerUnit: 8,
      notes: 'Paroprzepuszczalna — uszczelnia ościeżnicę lepiej niż pianka. Opcja premium.',
    },
  ],
  tools: [
    { id: 'knife-window', name: 'Nóż do cięcia uszczelek', icon: 'scissors', required: true },
    { id: 'foam-gun', name: 'Pistolet do pianki', icon: 'tool', required: false, notes: 'Daje lepszą kontrolę dozowania' },
    { id: 'caulk-gun', name: 'Pistolet do silikonu', icon: 'tool', required: true },
    { id: 'scraper', name: 'Skrobak (usuwanie starej pianki)', icon: 'tool', required: true },
  ],
  instructions: [
    {
      step: 1,
      title: 'Usuń stare uszczelki',
      description: 'Wyciągnij ze rowków skrzydła stare uszczelki. Jeśli są przyklejone — potnij nożem i zerwij.',
      durationMin: 30,
    },
    {
      step: 2,
      title: 'Wyczyść rowki',
      description: 'Dokładnie oczyść rowki z brudu i resztek kleju. Suche rowki lepiej trzymają uszczelkę.',
      durationMin: 20,
    },
    {
      step: 3,
      title: 'Wciśnij nowe uszczelki',
      description: 'Wciśnij uszczelkę EPDM w rowek skrzydła. Zacznij od narożnika, idź dookoła. Tnie się nożem w narożnikach pod 45°.',
      tip: 'Uszczelka powinna być lekko dłuższa niż obwód — skrócisz ją po oklejeniu.',
      durationMin: 60,
    },
    {
      step: 4,
      title: 'Uszczelnij ościeżnicę pianką lub taśmą',
      description: 'Jeśli ościeżnica jest luźna lub widać szczeliny — napełnij je pianką montażową. Taśma rozprężna jest trwalsza.',
      tip: 'Pianki jest zawsze za mało na początku — nadmiar po wyschnięciu łatwo zetrzeć.',
      durationMin: 45,
    },
    {
      step: 5,
      title: 'Uszczelnij krawędzie od wewnątrz silikonem',
      description: 'Wypełnij styk ościeżnicy ze ścianą akrylowym silikonem od środka pomieszczenia.',
      durationMin: 30,
    },
  ],
  commonMistakes: [
    'Zła grubość uszczelki — za cienka nie uszczelnia, za gruba nie da się zamknąć okna',
    'Za dużo pianki — rozepchnie ościeżnicę i okno będzie się źle otwierać',
    'Brak silikonowania wewnątrz — mostki termiczne pozostają',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Okno zamyka się bez oporu i nie przeciąga' },
    { id: 'q2', description: 'Brak widocznych szczelin między ościeżnicą a ścianą' },
    { id: 'q3', description: 'Uszczelki leżą równomiernie w rowkach' },
  ],
  hireProfessionalRecommended: false,
  tags: ['okna', 'uszczelnienie', 'pianka', 'izolacja', 'przeciągi'],
};

// ─── Windowsill installation ──────────────────────────────────────────────────

export const windowsillJob: RenovationJob = {
  id: 'windowsill-install',
  categoryId: 'windows',
  name: 'Montaż parapetu wewnętrznego',
  description: 'Zamontuj nowy parapet wewnętrzny z PVC, konglomeratu lub drewna.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'minus',
  warningRules: [
    {
      condition: 'always',
      message: 'Parapet musi wystawać min. 3–4 cm poza lico ściany, żeby odprowadzać wodę.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'linearMeters',
      label: 'Łączna długość parapetów',
      unit: 'm',
      placeholder: 'np. 3.2',
      min: 0.3,
      max: 50,
      hint: 'Zmierz szerokość każdego okna (luz ościeżnicy + 6–8 cm wystawania boków).',
    },
  ],
  materials: [
    {
      id: 'windowsill',
      name: 'Parapet PVC biały (20 cm głębokości)',
      unit: 'm.b.',
      formulaKey: 'linearMeters',
      pricePerUnit: 45,
      wasteFactor: 1.1,
      notes: 'Dostępne szerokości: 15, 20, 25, 30 cm. Dopasuj do głębokości wnęki.',
    },
    {
      id: 'windowsill-foam',
      name: 'Pianka montażowa (pod parapet)',
      unit: 'szt',
      formulaKey: 'constant',
      pricePerUnit: 25,
    },
    {
      id: 'windowsill-silicone',
      name: 'Silikon akrylowy (uszczelnienie krawędzi)',
      unit: 'kartusze',
      formulaKey: 'constant',
      pricePerUnit: 18,
    },
    {
      id: 'windowsill-endcap',
      name: 'Zatyczki boczne do parapetu PVC',
      unit: 'szt',
      formulaKey: 'sockets',
      pricePerUnit: 4,
      notes: '2 zatyczki na każde okno.',
    },
  ],
  tools: [
    { id: 'saw-window', name: 'Piła ręczna lub wyrzynarka', icon: 'scissors', required: true },
    { id: 'level-window', name: 'Poziomica', icon: 'minus', required: true },
    { id: 'caulk-gun-win', name: 'Pistolet do silikonu', icon: 'tool', required: true },
    { id: 'heat-gun', name: 'Opalaraka (do wygięcia parapetu PVC)', icon: 'tool', required: false },
  ],
  instructions: [
    {
      step: 1,
      title: 'Usuń stary parapet',
      description: 'Wytnij silikon wokół starego parapetu i go wyjmij. Oczyść podłoże z resztek pianki i kleju.',
      durationMin: 20,
    },
    {
      step: 2,
      title: 'Przytnij parapet',
      description: 'Zmierz długość wnęki i przytnij parapet. Boki podcina się pod kątem 45° lub przykleja gotowe zatyczki.',
      tip: 'Parapet powinien wchodzić pod ościeżnicę ok. 1 cm — tak będzie stabilnie.',
      durationMin: 30,
    },
    {
      step: 3,
      title: 'Montuj parapet',
      description: 'Wypełnij przestrzeń pod parapetem pianką. Wsuń parapet, wypoziomuj, docisk do ościeżnicy. Poczekaj 30 min.',
      warning: 'Nie nakładaj za dużo pianki — uniesie parapet.',
      durationMin: 40,
    },
    {
      step: 4,
      title: 'Uszczelnij krawędzie',
      description: 'Silikonem uszczelnij styk parapetu ze ścianą i ościeżnicą z obu stron.',
      durationMin: 20,
    },
  ],
  commonMistakes: [
    'Parapet za krótki — boki nie są zasłonięte',
    'Za dużo pianki — parapet się unosi',
    'Brak poziomowania — woda staje na parapecie',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Parapet jest poziomy' },
    { id: 'q2', description: 'Krawędzie są uszczelnione silikonem' },
    { id: 'q3', description: 'Zatyczki boczne są dobrze dopasowane' },
  ],
  hireProfessionalRecommended: false,
  tags: ['okna', 'parapet', 'PVC', 'montaż'],
};
