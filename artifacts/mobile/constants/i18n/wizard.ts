// Kreator projektu (app/wizard.tsx).
const pl = {
  // Step header titles (Stack.Screen title)
  'wizard.step.category': 'Co remontujesz?',
  'wizard.step.room': 'Które pomieszczenie?',
  'wizard.step.job': 'Jaki rodzaj pracy?',
  'wizard.step.condition': 'Aktualny stan',
  'wizard.step.desired': 'Oczekiwany efekt',
  'wizard.step.budget': 'Budżet',
  'wizard.step.diy': 'Kto wykona pracę?',
  'wizard.step.measure': 'Wymiary',
  'wizard.step.summary': 'Podsumowanie',

  'wizard.stepCounter': 'Krok {n} z {total}',
  'wizard.next': 'Dalej',
  'wizard.edit': 'Edytuj',

  // Condition options
  'wizard.condition.poor.label': 'Zły stan',
  'wizard.condition.poor.subtitle': 'Widoczne ubytki, pęknięcia, odpryski, wilgoć lub grzyb.',
  'wizard.condition.fair.label': 'Średni stan',
  'wizard.condition.fair.subtitle': 'Drobne usterki, stara farba, lekkie zarysowania. Ogólnie w porządku.',
  'wizard.condition.good.label': 'Dobry stan',
  'wizard.condition.good.subtitle': 'Tylko kosmetyczne zmiany — chcę zmienić kolor lub styl.',

  // Desired result options
  'wizard.desired.refresh.label': 'Szybkie odświeżenie',
  'wizard.desired.refresh.subtitle': 'Minimum prac, jeden weekend. Chcę poprawić wygląd bez dużego remontu.',
  'wizard.desired.standard.label': 'Standardowy remont',
  'wizard.desired.standard.subtitle': 'Solidna robota, dobre materiały, efekt na kilka lat.',
  'wizard.desired.complete.label': 'Gruntowny remont',
  'wizard.desired.complete.subtitle': 'Chcę zrobić to porządnie, raz a dobrze. Najlepsza jakość i trwałość.',

  // Budget options
  'wizard.budget.economy.label': 'Ekonomiczny',
  'wizard.budget.economy.subtitle': 'Najtańsze materiały, które wystarczą na kilka lat. Oszczędność ponad wszystko.',
  'wizard.budget.standard.label': 'Standardowy',
  'wizard.budget.standard.subtitle': 'Dobry balans ceny i jakości. Materiały sprawdzonej marki.',
  'wizard.budget.premium.label': 'Premium',
  'wizard.budget.premium.subtitle': 'Najlepsza jakość, długa gwarancja. Nie oszczędzam na materiałach.',

  // DIY mode options
  'wizard.diy.diy.label': 'Zrobię sam',
  'wizard.diy.diy.subtitle': 'Chcę to zrobić samodzielnie. Potrzebuję listy materiałów i instrukcji.',
  'wizard.diy.compare.label': 'Porównaj koszty',
  'wizard.diy.compare.subtitle': 'Chcę zobaczyć co taniej — zrobić samemu czy zatrudnić fachowca.',
  'wizard.diy.hire.label': 'Zatrudnię fachowca',
  'wizard.diy.hire.subtitle': 'Wolę zlecić pracę profesjonaliście. Chcę wiedzieć czego wymagać.',

  // Difficulty labels
  'wizard.difficulty.easy': 'Łatwe',
  'wizard.difficulty.medium': 'Średnie',
  'wizard.difficulty.hard': 'Trudne',

  // Validation errors
  'wizard.error.category': 'Wybierz kategorię, by kontynuować.',
  'wizard.error.room': 'Wybierz pomieszczenie.',
  'wizard.error.job': 'Wybierz rodzaj pracy.',
  'wizard.error.condition': 'Powiedz nam w jakim stanie jest pomieszczenie.',
  'wizard.error.desired': 'Powiedz nam co chcesz osiągnąć.',
  'wizard.error.budget': 'Wybierz poziom budżetu.',
  'wizard.error.diy': 'Wybierz kto wykona pracę.',
  'wizard.error.measureValue': 'Podaj wartość dla "{label}".',

  // Save error alert
  'wizard.saveError.title': 'Błąd',
  'wizard.saveError.body': 'Nie udało się zapisać projektu. Spróbuj ponownie.',

  // Step 1 — category
  'wizard.category.title': 'Co chcesz wyremontować?',
  'wizard.category.subtitle': 'Wybierz rodzaj pracy, który chcesz wykonać.',
  'wizard.category.jobsOne': 'praca',
  'wizard.category.jobsMany': 'prace',

  // Step 2 — room
  'wizard.room.title': 'W którym pomieszczeniu?',
  'wizard.room.subtitle': 'To pomoże nam dopasować wskazówki do Twojej sytuacji.',

  // Step 3 — job
  'wizard.job.title': 'Jaki rodzaj pracy?',
  'wizard.job.subtitle': 'Wybierz konkretną czynność, którą chcesz wykonać.',
  'wizard.job.dayOne': 'dzień',
  'wizard.job.dayMany': 'dni',
  'wizard.job.emptyCategory': 'Brak prac w tej kategorii. Wróć i wybierz inną kategorię.',

  // Step 4 — condition
  'wizard.conditionStep.title': 'Jaki jest aktualny stan?',
  'wizard.conditionStep.subtitle': 'Oceń pomieszczenie, które chcesz remontować.',
  'wizard.conditionStep.poorWarning':
    'Zły stan może wymagać dodatkowych prac przygotowawczych (np. naprawy pęknięć, gruntowania wzmacniającego). Uwzględnimy to w wskazówkach.',

  // Step 5 — desired
  'wizard.desiredStep.title': 'Czego oczekujesz?',
  'wizard.desiredStep.subtitle': 'Powiedz nam jaki efekt chcesz osiągnąć.',

  // Step 6 — budget
  'wizard.budgetStep.title': 'Jaki masz budżet?',
  'wizard.budgetStep.subtitle': 'Pomożemy dobrać materiały w Twoim przedziale cenowym.',
  'wizard.budgetStep.hint': 'Podasz dokładne wymiary w następnym kroku — wtedy obliczymy szacunkowy koszt.',

  // Step 7 — diy
  'wizard.diyStep.title': 'Kto wykona tę pracę?',
  'wizard.diyStep.subtitle': 'Możemy przygotować kalkulację dla Ciebie lub dla fachowca.',
  'wizard.diyStep.proWarning':
    'Ta praca ({jobName}) jest technicznie wymagająca. Rozważ zatrudnienie fachowca.',
  'wizard.diyStep.hireHint':
    'Naciśnij "Dalej" — przeniesiemy Cię do wskazówek jak znaleźć dobrego fachowca i czego od niego wymagać.',
  'wizard.diyStep.hireCta': 'Szukaj fachowca →',

  // Step 8 — measurements
  'wizard.measure.title': 'Podaj wymiary',
  'wizard.measure.subtitle':
    'Na ich podstawie obliczymy ile materiałów potrzebujesz i ile to kosztuje.',
  'wizard.measure.tapeHint':
    'Nie masz taśmy mierniczej? Krok dorosłego człowieka to ok. 75 cm. Możesz też podać przybliżone wartości — dokładność wystarczy na zakupy.',
  'wizard.measure.optional': 'opcjonalne',
  'wizard.measure.positiveValue': 'Podaj wartość większą od zera.',
  'wizard.measure.defaultValue': 'Domyślna wartość: {value} {unit}',
  'wizard.measure.noInputs':
    'Ta praca nie wymaga podawania wymiarów — materiały zostaną oszacowane inaczej.',
  'wizard.measure.next': 'Dalej — sprawdź podsumowanie',
  'wizard.measure.skip': 'Pomiń — oblicz z przybliżonymi wartościami',

  // Step 9 — summary
  'wizard.summary.title': 'Sprawdź swoje odpowiedzi',
  'wizard.summary.subtitle': 'Możesz edytować każdą odpowiedź przed obliczeniem.',
  'wizard.summary.rowCategory': 'Co remontujesz',
  'wizard.summary.rowRoom': 'Pomieszczenie',
  'wizard.summary.rowJob': 'Rodzaj pracy',
  'wizard.summary.rowCondition': 'Aktualny stan',
  'wizard.summary.rowDesired': 'Oczekiwany efekt',
  'wizard.summary.rowBudget': 'Budżet',
  'wizard.summary.rowDiy': 'Sposób realizacji',
  'wizard.summary.dash': '—',
  'wizard.summary.defaultSuffix': '{value} {unit} (domyślna)',
  'wizard.summary.dashUnit': '— ({unit})',
  'wizard.summary.nameLabel': 'Nazwa projektu',
  'wizard.summary.nameHint': 'Możesz zostawić automatyczną lub wpisać własną.',
  'wizard.summary.namePlaceholder': '{job} — {room}',
  'wizard.summary.fallbackProjectName': 'Mój projekt',
  'wizard.summary.fallbackRoom': 'pomieszczenie',
  'wizard.summary.proWarning':
    'Uwaga: "{jobName}" to praca wymagająca doświadczenia. Zdecydowanie rozważ zatrudnienie fachowca.',
  'wizard.summary.compareHint':
    'W wynikach zobaczysz szacunkowy koszt materiałów (samemu) oraz orientacyjną wycenę fachowca.',
  'wizard.summary.calculating': 'Obliczam…',
  'wizard.summary.calculate': 'Oblicz i pokaż wynik',
  'wizard.summary.savedNote': 'Projekt zostanie zapisany — możesz do niego wrócić w każdej chwili.',
} as const;

type K = keyof typeof pl;

const en: Record<K, string> = {
  'wizard.step.category': 'What are you renovating?',
  'wizard.step.room': 'Which room?',
  'wizard.step.job': 'What type of work?',
  'wizard.step.condition': 'Current condition',
  'wizard.step.desired': 'Desired result',
  'wizard.step.budget': 'Budget',
  'wizard.step.diy': 'Who will do the work?',
  'wizard.step.measure': 'Dimensions',
  'wizard.step.summary': 'Summary',

  'wizard.stepCounter': 'Step {n} of {total}',
  'wizard.next': 'Next',
  'wizard.edit': 'Edit',

  'wizard.condition.poor.label': 'Poor condition',
  'wizard.condition.poor.subtitle': 'Visible damage, cracks, chipping, damp or mould.',
  'wizard.condition.fair.label': 'Fair condition',
  'wizard.condition.fair.subtitle': 'Minor faults, old paint, light scratches. Generally OK.',
  'wizard.condition.good.label': 'Good condition',
  'wizard.condition.good.subtitle': 'Just cosmetic changes — I want to change the colour or style.',

  'wizard.desired.refresh.label': 'Quick refresh',
  'wizard.desired.refresh.subtitle': 'Minimal work, one weekend. I want to improve the look without a big renovation.',
  'wizard.desired.standard.label': 'Standard renovation',
  'wizard.desired.standard.subtitle': 'Solid work, good materials, a result that lasts a few years.',
  'wizard.desired.complete.label': 'Full renovation',
  'wizard.desired.complete.subtitle': 'I want to do it properly, once and for all. Best quality and durability.',

  'wizard.budget.economy.label': 'Economy',
  'wizard.budget.economy.subtitle': 'The cheapest materials that will last a few years. Savings above all.',
  'wizard.budget.standard.label': 'Standard',
  'wizard.budget.standard.subtitle': 'A good balance of price and quality. Materials from a trusted brand.',
  'wizard.budget.premium.label': 'Premium',
  'wizard.budget.premium.subtitle': "Best quality, long warranty. I don't cut corners on materials.",

  'wizard.diy.diy.label': "I'll do it myself",
  'wizard.diy.diy.subtitle': 'I want to do it myself. I need a materials list and instructions.',
  'wizard.diy.compare.label': 'Compare costs',
  'wizard.diy.compare.subtitle': "I want to see what's cheaper — doing it myself or hiring a professional.",
  'wizard.diy.hire.label': "I'll hire a professional",
  'wizard.diy.hire.subtitle': "I'd rather hire a professional. I want to know what to ask for.",

  'wizard.difficulty.easy': 'Easy',
  'wizard.difficulty.medium': 'Medium',
  'wizard.difficulty.hard': 'Hard',

  'wizard.error.category': 'Choose a category to continue.',
  'wizard.error.room': 'Choose a room.',
  'wizard.error.job': 'Choose a type of work.',
  'wizard.error.condition': 'Tell us what condition the room is in.',
  'wizard.error.desired': 'Tell us what you want to achieve.',
  'wizard.error.budget': 'Choose a budget level.',
  'wizard.error.diy': 'Choose who will do the work.',
  'wizard.error.measureValue': 'Enter a value for "{label}".',

  'wizard.saveError.title': 'Error',
  'wizard.saveError.body': 'Could not save the project. Please try again.',

  'wizard.category.title': 'What do you want to renovate?',
  'wizard.category.subtitle': 'Choose the type of work you want to do.',
  'wizard.category.jobsOne': 'job',
  'wizard.category.jobsMany': 'jobs',

  'wizard.room.title': 'Which room?',
  'wizard.room.subtitle': 'This helps us tailor the tips to your situation.',

  'wizard.job.title': 'What type of work?',
  'wizard.job.subtitle': 'Choose the specific task you want to do.',
  'wizard.job.dayOne': 'day',
  'wizard.job.dayMany': 'days',
  'wizard.job.emptyCategory': 'No jobs in this category. Go back and choose another category.',

  'wizard.conditionStep.title': 'What is the current condition?',
  'wizard.conditionStep.subtitle': 'Rate the room you want to renovate.',
  'wizard.conditionStep.poorWarning':
    "Poor condition may require extra preparation work (e.g. repairing cracks, reinforcing primer). We'll factor that into the tips.",

  'wizard.desiredStep.title': 'What do you expect?',
  'wizard.desiredStep.subtitle': 'Tell us what result you want to achieve.',

  'wizard.budgetStep.title': 'What is your budget?',
  'wizard.budgetStep.subtitle': "We'll help you pick materials in your price range.",
  'wizard.budgetStep.hint': "You'll enter exact dimensions in the next step — then we'll estimate the cost.",

  'wizard.diyStep.title': 'Who will do this work?',
  'wizard.diyStep.subtitle': 'We can prepare an estimate for you or for a professional.',
  'wizard.diyStep.proWarning':
    'This job ({jobName}) is technically demanding. Consider hiring a professional.',
  'wizard.diyStep.hireHint':
    'Tap "Next" — we\'ll take you to tips on how to find a good professional and what to require from them.',
  'wizard.diyStep.hireCta': 'Find a professional →',

  'wizard.measure.title': 'Enter the dimensions',
  'wizard.measure.subtitle':
    "We'll use them to calculate how much material you need and how much it costs.",
  'wizard.measure.tapeHint':
    "No tape measure? An adult's step is about 75 cm. You can also enter approximate values — accuracy good enough for shopping.",
  'wizard.measure.optional': 'optional',
  'wizard.measure.positiveValue': 'Enter a value greater than zero.',
  'wizard.measure.defaultValue': 'Default value: {value} {unit}',
  'wizard.measure.noInputs':
    "This job doesn't require dimensions — materials will be estimated differently.",
  'wizard.measure.next': 'Next — review the summary',
  'wizard.measure.skip': 'Skip — calculate with approximate values',

  'wizard.summary.title': 'Check your answers',
  'wizard.summary.subtitle': 'You can edit any answer before calculating.',
  'wizard.summary.rowCategory': "What you're renovating",
  'wizard.summary.rowRoom': 'Room',
  'wizard.summary.rowJob': 'Type of work',
  'wizard.summary.rowCondition': 'Current condition',
  'wizard.summary.rowDesired': 'Desired result',
  'wizard.summary.rowBudget': 'Budget',
  'wizard.summary.rowDiy': 'How it will be done',
  'wizard.summary.dash': '—',
  'wizard.summary.defaultSuffix': '{value} {unit} (default)',
  'wizard.summary.dashUnit': '— ({unit})',
  'wizard.summary.nameLabel': 'Project name',
  'wizard.summary.nameHint': 'You can keep the automatic one or enter your own.',
  'wizard.summary.namePlaceholder': '{job} — {room}',
  'wizard.summary.fallbackProjectName': 'My project',
  'wizard.summary.fallbackRoom': 'room',
  'wizard.summary.proWarning':
    'Note: "{jobName}" is a job that requires experience. Strongly consider hiring a professional.',
  'wizard.summary.compareHint':
    "In the results you'll see the estimated material cost (DIY) and a rough professional quote.",
  'wizard.summary.calculating': 'Calculating…',
  'wizard.summary.calculate': 'Calculate and show result',
  'wizard.summary.savedNote': 'The project will be saved — you can come back to it any time.',
};

export const wizard = { pl, en };
