// Współdzielone komponenty (components/*). Wypełniany przez agenta tłumaczeń.
const pl = {
  // CategoryCard
  'cmp.CategoryCard.jobWord.one': 'rodzaj',
  'cmp.CategoryCard.jobWord.few': 'rodzaje',
  'cmp.CategoryCard.jobWord.many': 'rodzajów',
  'cmp.CategoryCard.a11y': '{name}, {count} {word} prac',

  // ErrorFallback
  'cmp.ErrorFallback.detailsA11y': 'Zobacz szczegóły błędu',
  'cmp.ErrorFallback.title': 'Coś poszło nie tak',
  'cmp.ErrorFallback.message': 'Przepraszamy za problem. Uruchom aplikację ponownie aby kontynuować.',
  'cmp.ErrorFallback.restartA11y': 'Uruchom ponownie',
  'cmp.ErrorFallback.restartCta': 'Spróbuj ponownie',
  'cmp.ErrorFallback.modalTitle': 'Szczegóły błędu',
  'cmp.ErrorFallback.closeA11y': 'Zamknij szczegóły',

  // JobCard
  'cmp.JobCard.dayOne': 'dzień',
  'cmp.JobCard.dayMany': 'dni',
  'cmp.JobCard.professional': 'Fachowiec',

  // ProjectCard
  'cmp.ProjectCard.status.planning': 'Planowanie',
  'cmp.ProjectCard.status.inProgress': 'W trakcie',
  'cmp.ProjectCard.status.completed': 'Ukończony',
  'cmp.ProjectCard.a11y': 'Projekt {name}, {status}',
  'cmp.ProjectCard.progress': 'Postęp',

  // ui/LoadingState
  'cmp.LoadingState.default': 'Ładowanie...',

  // ui/ProgressBar
  'cmp.ProgressBar.default': 'Postęp',

  // commerce/BundleSuggestionCard
  'cmp.BundleSuggestionCard.more': '+{count} więcej',
  'cmp.BundleSuggestionCard.select': 'Wybierz',
  'cmp.BundleSuggestionCard.optionalUpgrades': '+ {count} opcjonalnych ulepszeń',

  // commerce/CartDraftPreview
  'cmp.CartDraftPreview.title': 'Koszyk sklepowy (wersja robocza)',
  'cmp.CartDraftPreview.mappedProducts': 'Produkty zmapowane',
  'cmp.CartDraftPreview.materials': 'Materiały',
  'cmp.CartDraftPreview.tools': 'Narzędzia',
  'cmp.CartDraftPreview.unmapped': 'Niezmapowane',
  'cmp.CartDraftPreview.estimatedAmount': 'Szacunkowa kwota',
  'cmp.CartDraftPreview.unmappedWarning': '{count} pozycji nie jest jeszcze zmapowanych do sklepu.',
  'cmp.CartDraftPreview.unmappedHint': 'Te produkty są uwzględnione w planie remontu, ale nie mają jeszcze odpowiedników w sklepie.',
  'cmp.CartDraftPreview.prepareOrder': 'Przygotuj zamówienie',

  // commerce/CommerceReadinessSummary
  'cmp.CommerceReadinessSummary.title': 'Gotowość sklepowa',
  'cmp.CommerceReadinessSummary.readyForCart': 'Gotowe do koszyka',
  'cmp.CommerceReadinessSummary.materials': 'Materiały',
  'cmp.CommerceReadinessSummary.tools': 'Narzędzia',
  'cmp.CommerceReadinessSummary.unmapped': 'Niezmapowane',

  // commerce/MappingStatusChip
  'cmp.MappingStatusChip.mapped': 'W sklepie',
  'cmp.MappingStatusChip.unmapped': 'Brak w sklepie',
  'cmp.MappingStatusChip.discontinued': 'Wycofany',
  'cmp.MappingStatusChip.outOfStock': 'Brak na stanie',

  // commerce/ToolCartToggle
  'cmp.ToolCartToggle.heading': 'Co dodać do koszyka?',
  'cmp.ToolCartToggle.materialsOnly': 'Tylko materiały',
  'cmp.ToolCartToggle.requiredTools': '+ wymagane narzędzia',
  'cmp.ToolCartToggle.allTools': '+ wszystkie narzędzia',

  // contractor/ContractorCard
  'cmp.ContractorCard.basic': 'Podstawowy',
  'cmp.ContractorCard.available': 'Dostępny',
  'cmp.ContractorCard.sendRequest': 'Wyślij zapytanie',

  // contractor/FilterBar
  'cmp.FilterBar.sort.bestMatch': 'Najlepsze dopasowanie',
  'cmp.FilterBar.sort.qualityScore': 'Wynik jakości',
  'cmp.FilterBar.sort.nearest': 'Najbliżej',
  'cmp.FilterBar.sort.verifiedFirst': 'Zweryfikowani',
  'cmp.FilterBar.sort.newest': 'Najnowsi',
  'cmp.FilterBar.sort.promoted': 'Promowani',
  'cmp.FilterBar.sort.rating': 'Najwyższa ocena',
  'cmp.FilterBar.filters': 'Filtry',
  'cmp.FilterBar.sort': 'Sortuj',
  'cmp.FilterBar.clear': 'Wyczyść',
  'cmp.FilterBar.resultOne': 'wynik',
  'cmp.FilterBar.resultMany': 'wyników',
  'cmp.FilterBar.filtersTitle': 'Filtry',
  'cmp.FilterBar.specialty': 'Specjalność',
  'cmp.FilterBar.all': 'Wszystkie',
  'cmp.FilterBar.options': 'Opcje',
  'cmp.FilterBar.verifiedOnly': 'Tylko zweryfikowani',
  'cmp.FilterBar.availableSoon': 'Dostępni wkrótce',
  'cmp.FilterBar.showResults': 'Pokaż wyniki',
  'cmp.FilterBar.sortTitle': 'Sortowanie',

  // contractor/RequestSummary
  'cmp.RequestSummary.defaultTitle': 'Zapytanie',
  'cmp.RequestSummary.contractorOne': 'wykonawca',
  'cmp.RequestSummary.contractorMany': 'wykonawców',

  // contractor/ReviewSection
  'cmp.ReviewSection.noReviewsTitle': 'Brak opinii',
  'cmp.ReviewSection.noReviewsBody': 'Ten wykonawca nie otrzymał jeszcze żadnej opinii.',
  'cmp.ReviewSection.reviewsCount': '{count} opinii',
  'cmp.ReviewSection.verifiedSuffix': ' ({count} zweryfikowanych)',
  'cmp.ReviewSection.hiddenByModeration': '{count} opinii ukrytych przez moderację',
  'cmp.ReviewSection.showAll': 'Pokaż wszystkie ({count})',
  'cmp.ReviewSection.verified': 'Zweryfikowana',
  'cmp.ReviewSection.anonymous': 'Anonimowy',

  // contractor/TrustBadge
  'cmp.TrustBadge.promoted': 'Promowany',
  'cmp.TrustBadge.premium': 'Premium',

  // house-build/utility-detail-shared
  'cmp.UtilityDetail.status.notPlanned': 'Nie zaplanowane',
  'cmp.UtilityDetail.status.planning': 'Planowanie',
  'cmp.UtilityDetail.status.applicationPrepared': 'Wniosek gotowy',
  'cmp.UtilityDetail.status.conditionsReceived': 'Warunki otrzymane',
  'cmp.UtilityDetail.status.agreementSigned': 'Umowa podpisana',
  'cmp.UtilityDetail.status.inProgress': 'W realizacji',
  'cmp.UtilityDetail.status.connected': 'Podłączone',
  'cmp.UtilityDetail.status.notApplicable': 'Nie dotyczy',
  'cmp.UtilityDetail.gas.heating': 'Ogrzewanie',
  'cmp.UtilityDetail.gas.cooking': 'Gotowanie',
  'cmp.UtilityDetail.gas.both': 'Ogrzewanie i gotowanie',
  'cmp.UtilityDetail.gas.notPlanned': 'Gaz nie jest planowany',
  'cmp.UtilityDetail.loading': 'Ładowanie...',
  'cmp.UtilityDetail.tapToChange': 'Stuknij, aby zmienić',
  'cmp.UtilityDetail.investorTips': 'Wskazówki dla inwestora',
  'cmp.UtilityDetail.provider': 'Dostawca / operator',
  'cmp.UtilityDetail.providerPlaceholder': 'Nazwa dostawcy...',
  'cmp.UtilityDetail.save': 'Zapisz',
  'cmp.UtilityDetail.cancel': 'Anuluj',
  'cmp.UtilityDetail.providerEmpty': 'Nie ustawiono — stuknij ikonę edycji',
  'cmp.UtilityDetail.connectionPower': 'Moc przyłączeniowa',
  'cmp.UtilityDetail.powerPlaceholder': 'np. 15 kW...',
  'cmp.UtilityDetail.notSet': 'Nie ustawiono',
  'cmp.UtilityDetail.gasPurpose': 'Cel przyłącza gazowego',
  'cmp.UtilityDetail.temporarySupply': 'Zasilanie tymczasowe placu budowy',
  'cmp.UtilityDetail.temporarySupplyHint': 'Osobne od docelowego zasilania domu',
  'cmp.UtilityDetail.checklist': 'Lista kontrolna',
  'cmp.UtilityDetail.notes': 'Notatki',
  'cmp.UtilityDetail.notesPlaceholder': 'Notatki...',
  'cmp.UtilityDetail.notesEmpty': 'Brak notatek',
  'cmp.UtilityDetail.disclaimer': 'Wymagania i procedury zależą od lokalnego operatora/dostawcy. Zweryfikuj szczegóły u swojego dostawcy.',

  // project/ActivityFeed
  'cmp.ActivityFeed.title': 'Ostatnia aktywność',

  // project/GuideTab
  'cmp.GuideTab.taskList': 'Lista zadań',
  'cmp.GuideTab.stepByStep': 'Instrukcja krok po kroku',
  'cmp.GuideTab.completedCount': '{completed} z {total} ukończonych',
  'cmp.GuideTab.followOrder': 'Wykonuj czynności w podanej kolejności.',
  'cmp.GuideTab.generateList': 'Generuj listę',
  'cmp.GuideTab.completedAt': 'Ukończono {time}',

  // project/LaborPriceCard
  'cmp.LaborPriceCard.labor': 'Robocizna',
  'cmp.LaborPriceCard.reset': 'Resetuj',
  'cmp.LaborPriceCard.source': 'Źródło: {name}',
  'cmp.LaborPriceCard.customPrice': 'Własna cena',

  // project/MaterialPriceCard
  'cmp.MaterialPriceCard.economy': 'Ekonom',
  'cmp.MaterialPriceCard.standard': 'Standard',
  'cmp.MaterialPriceCard.premium': 'Premium',
  'cmp.MaterialPriceCard.pricePlaceholder': 'PLN/opakowanie',
  'cmp.MaterialPriceCard.reset': 'Resetuj',
  'cmp.MaterialPriceCard.packagesShort': '× {count} op.',
  'cmp.MaterialPriceCard.storeUpdated': '{store} · akt. {date}',
  'cmp.MaterialPriceCard.customPrice': 'Własna cena',

  // project/MaterialsTab
  'cmp.MaterialsTab.title': 'Lista materiałów',
  'cmp.MaterialsTab.subtitle': 'Ilości uwzględniają 10% zapasu na straty i docięcia.',
  'cmp.MaterialsTab.totalCost': 'Łączny koszt materiałów',
  'cmp.MaterialsTab.refreshList': 'Odśwież listę zakupów',
  'cmp.MaterialsTab.generateList': 'Generuj listę zakupów',

  // project/OverviewTab
  'cmp.OverviewTab.readyTitle': 'Twój projekt jest gotowy!',
  'cmp.OverviewTab.readySubtitle': 'Obliczyliśmy materiały, koszt i czas realizacji.',
  'cmp.OverviewTab.tabsHintMaterials': 'Materiały',
  'cmp.OverviewTab.tabsHintTools': 'Narzędzia',
  'cmp.OverviewTab.tabsHintGuide': 'Instrukcja',
  'cmp.OverviewTab.dismiss': 'Zamknij',
  'cmp.OverviewTab.status.planning': 'Planowanie',
  'cmp.OverviewTab.status.inProgress': 'W trakcie',
  'cmp.OverviewTab.status.completed': 'Ukończony',
  'cmp.OverviewTab.room': 'Pomieszczenie',
  'cmp.OverviewTab.height': 'wys. {value} m',
  'cmp.OverviewTab.workProgress': 'Postęp prac',
  'cmp.OverviewTab.materialsDiy': 'Materiały (samemu)',
  'cmp.OverviewTab.withProfessional': 'Z fachowcem (szacunek)',
  'cmp.OverviewTab.duration': 'Czas realizacji',
  'cmp.OverviewTab.dayOne': 'dzień',
  'cmp.OverviewTab.dayMany': 'dni',
  'cmp.OverviewTab.shopping': 'Zakupy',
  'cmp.OverviewTab.shoppingValue': '{purchased}/{total} kupionych',
  'cmp.OverviewTab.findProfessional': 'Jak znaleźć dobrego fachowca?',
  'cmp.OverviewTab.notes': 'Notatki',
  'cmp.OverviewTab.openFullDescription': 'Otwórz pełny opis pracy',
  'cmp.OverviewTab.generateShoppingList': 'Generuj listę zakupów',
  'cmp.OverviewTab.generateTaskList': 'Generuj listę zadań',

  // project/PhotosTab
  'cmp.PhotosTab.title': 'Dokumentacja zdjęciowa',
  'cmp.PhotosTab.subtitle': 'Dodaj zdjęcia przed, w trakcie i po remoncie.',
  'cmp.PhotosTab.add': 'Dodaj',
  'cmp.PhotosTab.noPhotos': 'Brak zdjęć',
  'cmp.PhotosTab.deleteHint': 'Przytrzymaj zdjęcie, aby je usunąć.',

  // project/PriceDisclaimer
  'cmp.PriceDisclaimer.title': 'Ceny orientacyjne',
  'cmp.PriceDisclaimer.body': 'Ceny referencyjne dla regionu {region} na podstawie wybranych źródeł detalicznych. Rzeczywiste ceny mogą się różnić w zależności od sklepu, miasta, wykonawcy, ilości i poziomu jakości.',
  'cmp.PriceDisclaimer.lastUpdated': 'Aktualizacja danych: {date}',

  // project/PricingSummary
  'cmp.PricingSummary.title': 'Kosztorys referencyjny',
  'cmp.PricingSummary.laborProfessional': 'Robocizna (fachowiec)',
  'cmp.PricingSummary.referenceMaterials': 'Materiały referencyjne ({tier})',
  'cmp.PricingSummary.tier.custom': 'własne',
  'cmp.PricingSummary.tier.better': 'premium',
  'cmp.PricingSummary.tier.economy': 'ekonom',
  'cmp.PricingSummary.tier.standard': 'standard',
  'cmp.PricingSummary.labor': 'Robocizna',
  'cmp.PricingSummary.laborUnavailable': 'Dane o robociźnie dla tej pracy nie są jeszcze dostępne. Możesz wprowadzić własną cenę ręcznie.',
  'cmp.PricingSummary.referenceMaterialsShort': 'Materiały referencyjne',
  'cmp.PricingSummary.materialsUnavailable': 'Ceny referencyjne materiałów dla tej pracy nie są jeszcze zmapowane. Korzystaj z listy zakupów kalkulatora.',
  'cmp.PricingSummary.summaryTitle': 'Podsumowanie kosztorysu',
  'cmp.PricingSummary.materialsReference': 'Materiały (referencyjne)',
  'cmp.PricingSummary.tools': 'Narzędzia',
  'cmp.PricingSummary.totalEstimate': 'Łączny szacunek',
  'cmp.PricingSummary.baseRegion': 'Region bazowy: {region}',

  // project/QualityTierSelector
  'cmp.QualityTierSelector.heading': 'Poziom materiałów',
  'cmp.QualityTierSelector.economy': 'Ekonom',
  'cmp.QualityTierSelector.standard': 'Standard',
  'cmp.QualityTierSelector.better': 'Premium',
  'cmp.QualityTierSelector.custom': 'Własne',

  // project/ShoppingItemCard
  'cmp.ShoppingItemCard.quantity': 'Ilość ({unit})',
  'cmp.ShoppingItemCard.price': 'Cena (PLN)',
  'cmp.ShoppingItemCard.save': 'Zapisz',
  'cmp.ShoppingItemCard.cancel': 'Anuluj',
  'cmp.ShoppingItemCard.edited': 'edytowane',
  'cmp.ShoppingItemCard.edit': 'Edytuj',
  'cmp.ShoppingItemCard.haveIt': 'Mam to',
  'cmp.ShoppingItemCard.remove': 'Usuń',

  // project/ShoppingTab
  'cmp.ShoppingTab.title': 'Lista zakupów',
  'cmp.ShoppingTab.share': 'Udostępnij',
  'cmp.ShoppingTab.emptyTitle': 'Brak listy zakupów',
  'cmp.ShoppingTab.emptyBody': 'Wygeneruj listę zakupów na podstawie obliczonych materiałów i narzędzi.',
  'cmp.ShoppingTab.generateList': 'Generuj listę zakupów',
  'cmp.ShoppingTab.purchased': 'Kupione',
  'cmp.ShoppingTab.purchasedCount': '{purchased} z {total}',
  'cmp.ShoppingTab.materials': 'Materiały',
  'cmp.ShoppingTab.tools': 'Narzędzia',
  'cmp.ShoppingTab.alreadyHave': 'Mam już ({count})',
  'cmp.ShoppingTab.tapToRestore': 'Dotknij, aby przywrócić do listy',
  'cmp.ShoppingTab.costSummary': 'Podsumowanie kosztów',
  'cmp.ShoppingTab.reserve': 'Rezerwa ({percent}%)',
  'cmp.ShoppingTab.totalWithReserve': 'Łącznie z rezerwą',
  'cmp.ShoppingTab.refreshList': 'Odśwież listę zakupów',
  'cmp.ShoppingTab.sectionTotal': '{title} razem',
  'cmp.ShoppingTab.diyVsPro': 'DIY vs Fachowiec',
  'cmp.ShoppingTab.diy': 'Samodzielnie',
  'cmp.ShoppingTab.diyBreakdown': 'materiały + narzędzia + rezerwa',
  'cmp.ShoppingTab.withPro': 'Z fachowcem',
  'cmp.ShoppingTab.proBreakdown': 'materiały + robocizna',
  'cmp.ShoppingTab.savings': 'Oszczędzasz ok. {amount} robiąc to samodzielnie!',
  'cmp.ShoppingTab.estimatedTime': 'Szacowany czas pracy samodzielnej: {days} {word}',
  'cmp.ShoppingTab.dayOne': 'dzień',
  'cmp.ShoppingTab.dayMany': 'dni',

  // project/ToolCard
  'cmp.ToolCard.optional': 'opcjonalne',
  'cmp.ToolCard.rentable': 'do wynajęcia',
  'cmp.ToolCard.buy': 'Kup: ~{price}',
  'cmp.ToolCard.rent': 'Wynajmij: ~{price}',

  // project/ToolsTab
  'cmp.ToolsTab.title': 'Potrzebne narzędzia',
  'cmp.ToolsTab.subtitle': 'Upewnij się, że masz wszystkie obowiązkowe narzędzia przed rozpoczęciem.',
  'cmp.ToolsTab.required': 'Obowiązkowe ({count})',
  'cmp.ToolsTab.optional': 'Opcjonalne ({count})',
  'cmp.ToolsTab.emptyTitle': 'Brak specjalnych narzędzi',
  'cmp.ToolsTab.emptyBody': 'Ta praca nie wymaga specjalistycznego sprzętu.',
  'cmp.ToolsTab.rentInfo': 'Narzędzia oznaczone "do wynajęcia" możesz wypożyczyć w sklepach budowlanych (np. Leroy Merlin, Castorama). Często taniej niż kupno.',

  // Tab labels (project detail)
  'cmp.tab.overview': 'Przegląd',
  'cmp.tab.materials': 'Materiały',
  'cmp.tab.tools': 'Narzędzia',
  'cmp.tab.guide': 'Instrukcja',
  'cmp.tab.shopping': 'Zakupy',
  'cmp.tab.budget': 'Kosztorys',
  'cmp.tab.photos': 'Zdjęcia',

  // TierBadge
  'cmp.TierBadge.economy': 'Eko',
  'cmp.TierBadge.standard': 'Standard',
  'cmp.TierBadge.premium': 'Premium',

  // DiyBanner / helpers
  'cmp.diy.hire.headline': 'Zalecamy fachowca',
  'cmp.diy.hire.details': 'Ta praca wymaga specjalistycznej wiedzy i sprzętu. Błędy mogą być kosztowne lub niebezpieczne.',
  'cmp.diy.moderate.headline': 'Możliwe samodzielnie, ale wymaga uwagi',
  'cmp.diy.moderate.details': 'Możesz zrobić to sam, ale postępuj zgodnie z instrukcją krok po kroku. W razie wątpliwości skonsultuj się ze sprzedawcą w sklepie budowlanym.',
  'cmp.diy.easy.headline': 'Świetnie nadaje się do samodzielnego wykonania',
  'cmp.diy.easy.details': 'Ta praca jest dostępna dla amatorów. Wystarczy dokładność i postępowanie zgodnie z naszą instrukcją.',

  // Share text (build-shopping-text helper)
  'cmp.share.header': 'Lista zakupów: {projectName}',
  'cmp.share.materials': 'MATERIAŁY:',
  'cmp.share.tools': 'NARZĘDZIA:',
  'cmp.share.materialsTotal': 'Razem materiały: {total}',
  'cmp.share.toolsTotal': 'Razem narzędzia: {total}',
  'cmp.share.grandTotal': 'Łącznie z rezerwą: {total}',
} as const;

type K = keyof typeof pl;

const en: Record<K, string> = {
  // CategoryCard
  'cmp.CategoryCard.jobWord.one': 'type',
  'cmp.CategoryCard.jobWord.few': 'types',
  'cmp.CategoryCard.jobWord.many': 'types',
  'cmp.CategoryCard.a11y': '{name}, {count} {word} of work',

  // ErrorFallback
  'cmp.ErrorFallback.detailsA11y': 'View error details',
  'cmp.ErrorFallback.title': 'Something went wrong',
  'cmp.ErrorFallback.message': 'Sorry for the trouble. Restart the app to continue.',
  'cmp.ErrorFallback.restartA11y': 'Restart',
  'cmp.ErrorFallback.restartCta': 'Try again',
  'cmp.ErrorFallback.modalTitle': 'Error details',
  'cmp.ErrorFallback.closeA11y': 'Close details',

  // JobCard
  'cmp.JobCard.dayOne': 'day',
  'cmp.JobCard.dayMany': 'days',
  'cmp.JobCard.professional': 'Professional',

  // ProjectCard
  'cmp.ProjectCard.status.planning': 'Planning',
  'cmp.ProjectCard.status.inProgress': 'In progress',
  'cmp.ProjectCard.status.completed': 'Completed',
  'cmp.ProjectCard.a11y': 'Project {name}, {status}',
  'cmp.ProjectCard.progress': 'Progress',

  // ui/LoadingState
  'cmp.LoadingState.default': 'Loading...',

  // ui/ProgressBar
  'cmp.ProgressBar.default': 'Progress',

  // commerce/BundleSuggestionCard
  'cmp.BundleSuggestionCard.more': '+{count} more',
  'cmp.BundleSuggestionCard.select': 'Select',
  'cmp.BundleSuggestionCard.optionalUpgrades': '+ {count} optional upgrades',

  // commerce/CartDraftPreview
  'cmp.CartDraftPreview.title': 'Store cart (draft)',
  'cmp.CartDraftPreview.mappedProducts': 'Mapped products',
  'cmp.CartDraftPreview.materials': 'Materials',
  'cmp.CartDraftPreview.tools': 'Tools',
  'cmp.CartDraftPreview.unmapped': 'Unmapped',
  'cmp.CartDraftPreview.estimatedAmount': 'Estimated amount',
  'cmp.CartDraftPreview.unmappedWarning': '{count} items are not yet mapped to the store.',
  'cmp.CartDraftPreview.unmappedHint': 'These products are included in the renovation plan but do not yet have store equivalents.',
  'cmp.CartDraftPreview.prepareOrder': 'Prepare order',

  // commerce/CommerceReadinessSummary
  'cmp.CommerceReadinessSummary.title': 'Store readiness',
  'cmp.CommerceReadinessSummary.readyForCart': 'Ready for cart',
  'cmp.CommerceReadinessSummary.materials': 'Materials',
  'cmp.CommerceReadinessSummary.tools': 'Tools',
  'cmp.CommerceReadinessSummary.unmapped': 'Unmapped',

  // commerce/MappingStatusChip
  'cmp.MappingStatusChip.mapped': 'In store',
  'cmp.MappingStatusChip.unmapped': 'Not in store',
  'cmp.MappingStatusChip.discontinued': 'Discontinued',
  'cmp.MappingStatusChip.outOfStock': 'Out of stock',

  // commerce/ToolCartToggle
  'cmp.ToolCartToggle.heading': 'What to add to the cart?',
  'cmp.ToolCartToggle.materialsOnly': 'Materials only',
  'cmp.ToolCartToggle.requiredTools': '+ required tools',
  'cmp.ToolCartToggle.allTools': '+ all tools',

  // contractor/ContractorCard
  'cmp.ContractorCard.basic': 'Basic',
  'cmp.ContractorCard.available': 'Available',
  'cmp.ContractorCard.sendRequest': 'Send request',

  // contractor/FilterBar
  'cmp.FilterBar.sort.bestMatch': 'Best match',
  'cmp.FilterBar.sort.qualityScore': 'Quality score',
  'cmp.FilterBar.sort.nearest': 'Nearest',
  'cmp.FilterBar.sort.verifiedFirst': 'Verified',
  'cmp.FilterBar.sort.newest': 'Newest',
  'cmp.FilterBar.sort.promoted': 'Promoted',
  'cmp.FilterBar.sort.rating': 'Highest rating',
  'cmp.FilterBar.filters': 'Filters',
  'cmp.FilterBar.sort': 'Sort',
  'cmp.FilterBar.clear': 'Clear',
  'cmp.FilterBar.resultOne': 'result',
  'cmp.FilterBar.resultMany': 'results',
  'cmp.FilterBar.filtersTitle': 'Filters',
  'cmp.FilterBar.specialty': 'Specialty',
  'cmp.FilterBar.all': 'All',
  'cmp.FilterBar.options': 'Options',
  'cmp.FilterBar.verifiedOnly': 'Verified only',
  'cmp.FilterBar.availableSoon': 'Available soon',
  'cmp.FilterBar.showResults': 'Show results',
  'cmp.FilterBar.sortTitle': 'Sorting',

  // contractor/RequestSummary
  'cmp.RequestSummary.defaultTitle': 'Request',
  'cmp.RequestSummary.contractorOne': 'contractor',
  'cmp.RequestSummary.contractorMany': 'contractors',

  // contractor/ReviewSection
  'cmp.ReviewSection.noReviewsTitle': 'No reviews',
  'cmp.ReviewSection.noReviewsBody': 'This contractor has not received any reviews yet.',
  'cmp.ReviewSection.reviewsCount': '{count} reviews',
  'cmp.ReviewSection.verifiedSuffix': ' ({count} verified)',
  'cmp.ReviewSection.hiddenByModeration': '{count} reviews hidden by moderation',
  'cmp.ReviewSection.showAll': 'Show all ({count})',
  'cmp.ReviewSection.verified': 'Verified',
  'cmp.ReviewSection.anonymous': 'Anonymous',

  // contractor/TrustBadge
  'cmp.TrustBadge.promoted': 'Promoted',
  'cmp.TrustBadge.premium': 'Premium',

  // house-build/utility-detail-shared
  'cmp.UtilityDetail.status.notPlanned': 'Not planned',
  'cmp.UtilityDetail.status.planning': 'Planning',
  'cmp.UtilityDetail.status.applicationPrepared': 'Application ready',
  'cmp.UtilityDetail.status.conditionsReceived': 'Conditions received',
  'cmp.UtilityDetail.status.agreementSigned': 'Agreement signed',
  'cmp.UtilityDetail.status.inProgress': 'In progress',
  'cmp.UtilityDetail.status.connected': 'Connected',
  'cmp.UtilityDetail.status.notApplicable': 'Not applicable',
  'cmp.UtilityDetail.gas.heating': 'Heating',
  'cmp.UtilityDetail.gas.cooking': 'Cooking',
  'cmp.UtilityDetail.gas.both': 'Heating and cooking',
  'cmp.UtilityDetail.gas.notPlanned': 'Gas is not planned',
  'cmp.UtilityDetail.loading': 'Loading...',
  'cmp.UtilityDetail.tapToChange': 'Tap to change',
  'cmp.UtilityDetail.investorTips': 'Tips for the investor',
  'cmp.UtilityDetail.provider': 'Provider / operator',
  'cmp.UtilityDetail.providerPlaceholder': 'Provider name...',
  'cmp.UtilityDetail.save': 'Save',
  'cmp.UtilityDetail.cancel': 'Cancel',
  'cmp.UtilityDetail.providerEmpty': 'Not set — tap the edit icon',
  'cmp.UtilityDetail.connectionPower': 'Connection power',
  'cmp.UtilityDetail.powerPlaceholder': 'e.g. 15 kW...',
  'cmp.UtilityDetail.notSet': 'Not set',
  'cmp.UtilityDetail.gasPurpose': 'Gas connection purpose',
  'cmp.UtilityDetail.temporarySupply': 'Temporary site power supply',
  'cmp.UtilityDetail.temporarySupplyHint': 'Separate from the final house power supply',
  'cmp.UtilityDetail.checklist': 'Checklist',
  'cmp.UtilityDetail.notes': 'Notes',
  'cmp.UtilityDetail.notesPlaceholder': 'Notes...',
  'cmp.UtilityDetail.notesEmpty': 'No notes',
  'cmp.UtilityDetail.disclaimer': 'Requirements and procedures depend on the local operator/provider. Verify the details with your provider.',

  // project/ActivityFeed
  'cmp.ActivityFeed.title': 'Recent activity',

  // project/GuideTab
  'cmp.GuideTab.taskList': 'Task list',
  'cmp.GuideTab.stepByStep': 'Step-by-step guide',
  'cmp.GuideTab.completedCount': '{completed} of {total} completed',
  'cmp.GuideTab.followOrder': 'Follow the steps in the given order.',
  'cmp.GuideTab.generateList': 'Generate list',
  'cmp.GuideTab.completedAt': 'Completed {time}',

  // project/LaborPriceCard
  'cmp.LaborPriceCard.labor': 'Labor',
  'cmp.LaborPriceCard.reset': 'Reset',
  'cmp.LaborPriceCard.source': 'Source: {name}',
  'cmp.LaborPriceCard.customPrice': 'Custom price',

  // project/MaterialPriceCard
  'cmp.MaterialPriceCard.economy': 'Economy',
  'cmp.MaterialPriceCard.standard': 'Standard',
  'cmp.MaterialPriceCard.premium': 'Premium',
  'cmp.MaterialPriceCard.pricePlaceholder': 'PLN/package',
  'cmp.MaterialPriceCard.reset': 'Reset',
  'cmp.MaterialPriceCard.packagesShort': '× {count} pkg',
  'cmp.MaterialPriceCard.storeUpdated': '{store} · upd. {date}',
  'cmp.MaterialPriceCard.customPrice': 'Custom price',

  // project/MaterialsTab
  'cmp.MaterialsTab.title': 'Materials list',
  'cmp.MaterialsTab.subtitle': 'Quantities include a 10% buffer for waste and cuts.',
  'cmp.MaterialsTab.totalCost': 'Total materials cost',
  'cmp.MaterialsTab.refreshList': 'Refresh shopping list',
  'cmp.MaterialsTab.generateList': 'Generate shopping list',

  // project/OverviewTab
  'cmp.OverviewTab.readyTitle': 'Your project is ready!',
  'cmp.OverviewTab.readySubtitle': 'We calculated the materials, cost and timeline.',
  'cmp.OverviewTab.tabsHintMaterials': 'Materials',
  'cmp.OverviewTab.tabsHintTools': 'Tools',
  'cmp.OverviewTab.tabsHintGuide': 'Guide',
  'cmp.OverviewTab.dismiss': 'Dismiss',
  'cmp.OverviewTab.status.planning': 'Planning',
  'cmp.OverviewTab.status.inProgress': 'In progress',
  'cmp.OverviewTab.status.completed': 'Completed',
  'cmp.OverviewTab.room': 'Room',
  'cmp.OverviewTab.height': 'height {value} m',
  'cmp.OverviewTab.workProgress': 'Work progress',
  'cmp.OverviewTab.materialsDiy': 'Materials (DIY)',
  'cmp.OverviewTab.withProfessional': 'With a professional (estimate)',
  'cmp.OverviewTab.duration': 'Timeline',
  'cmp.OverviewTab.dayOne': 'day',
  'cmp.OverviewTab.dayMany': 'days',
  'cmp.OverviewTab.shopping': 'Shopping',
  'cmp.OverviewTab.shoppingValue': '{purchased}/{total} purchased',
  'cmp.OverviewTab.findProfessional': 'How to find a good professional?',
  'cmp.OverviewTab.notes': 'Notes',
  'cmp.OverviewTab.openFullDescription': 'Open full job description',
  'cmp.OverviewTab.generateShoppingList': 'Generate shopping list',
  'cmp.OverviewTab.generateTaskList': 'Generate task list',

  // project/PhotosTab
  'cmp.PhotosTab.title': 'Photo documentation',
  'cmp.PhotosTab.subtitle': 'Add photos before, during and after the renovation.',
  'cmp.PhotosTab.add': 'Add',
  'cmp.PhotosTab.noPhotos': 'No photos',
  'cmp.PhotosTab.deleteHint': 'Press and hold a photo to delete it.',

  // project/PriceDisclaimer
  'cmp.PriceDisclaimer.title': 'Indicative prices',
  'cmp.PriceDisclaimer.body': 'Reference prices for the {region} region based on selected retail sources. Actual prices may vary depending on the store, city, contractor, quantity and quality level.',
  'cmp.PriceDisclaimer.lastUpdated': 'Data updated: {date}',

  // project/PricingSummary
  'cmp.PricingSummary.title': 'Reference cost estimate',
  'cmp.PricingSummary.laborProfessional': 'Labor (professional)',
  'cmp.PricingSummary.referenceMaterials': 'Reference materials ({tier})',
  'cmp.PricingSummary.tier.custom': 'custom',
  'cmp.PricingSummary.tier.better': 'premium',
  'cmp.PricingSummary.tier.economy': 'economy',
  'cmp.PricingSummary.tier.standard': 'standard',
  'cmp.PricingSummary.labor': 'Labor',
  'cmp.PricingSummary.laborUnavailable': 'Labor data for this job is not available yet. You can enter your own price manually.',
  'cmp.PricingSummary.referenceMaterialsShort': 'Reference materials',
  'cmp.PricingSummary.materialsUnavailable': 'Reference material prices for this job are not mapped yet. Use the calculator shopping list.',
  'cmp.PricingSummary.summaryTitle': 'Cost estimate summary',
  'cmp.PricingSummary.materialsReference': 'Materials (reference)',
  'cmp.PricingSummary.tools': 'Tools',
  'cmp.PricingSummary.totalEstimate': 'Total estimate',
  'cmp.PricingSummary.baseRegion': 'Base region: {region}',

  // project/QualityTierSelector
  'cmp.QualityTierSelector.heading': 'Material level',
  'cmp.QualityTierSelector.economy': 'Economy',
  'cmp.QualityTierSelector.standard': 'Standard',
  'cmp.QualityTierSelector.better': 'Premium',
  'cmp.QualityTierSelector.custom': 'Custom',

  // project/ShoppingItemCard
  'cmp.ShoppingItemCard.quantity': 'Quantity ({unit})',
  'cmp.ShoppingItemCard.price': 'Price (PLN)',
  'cmp.ShoppingItemCard.save': 'Save',
  'cmp.ShoppingItemCard.cancel': 'Cancel',
  'cmp.ShoppingItemCard.edited': 'edited',
  'cmp.ShoppingItemCard.edit': 'Edit',
  'cmp.ShoppingItemCard.haveIt': 'I have it',
  'cmp.ShoppingItemCard.remove': 'Remove',

  // project/ShoppingTab
  'cmp.ShoppingTab.title': 'Shopping list',
  'cmp.ShoppingTab.share': 'Share',
  'cmp.ShoppingTab.emptyTitle': 'No shopping list',
  'cmp.ShoppingTab.emptyBody': 'Generate a shopping list based on the calculated materials and tools.',
  'cmp.ShoppingTab.generateList': 'Generate shopping list',
  'cmp.ShoppingTab.purchased': 'Purchased',
  'cmp.ShoppingTab.purchasedCount': '{purchased} of {total}',
  'cmp.ShoppingTab.materials': 'Materials',
  'cmp.ShoppingTab.tools': 'Tools',
  'cmp.ShoppingTab.alreadyHave': 'Already have ({count})',
  'cmp.ShoppingTab.tapToRestore': 'Tap to restore to the list',
  'cmp.ShoppingTab.costSummary': 'Cost summary',
  'cmp.ShoppingTab.reserve': 'Reserve ({percent}%)',
  'cmp.ShoppingTab.totalWithReserve': 'Total with reserve',
  'cmp.ShoppingTab.refreshList': 'Refresh shopping list',
  'cmp.ShoppingTab.sectionTotal': '{title} total',
  'cmp.ShoppingTab.diyVsPro': 'DIY vs Professional',
  'cmp.ShoppingTab.diy': 'On your own',
  'cmp.ShoppingTab.diyBreakdown': 'materials + tools + reserve',
  'cmp.ShoppingTab.withPro': 'With a professional',
  'cmp.ShoppingTab.proBreakdown': 'materials + labor',
  'cmp.ShoppingTab.savings': 'You save about {amount} by doing it yourself!',
  'cmp.ShoppingTab.estimatedTime': 'Estimated DIY work time: {days} {word}',
  'cmp.ShoppingTab.dayOne': 'day',
  'cmp.ShoppingTab.dayMany': 'days',

  // project/ToolCard
  'cmp.ToolCard.optional': 'optional',
  'cmp.ToolCard.rentable': 'rentable',
  'cmp.ToolCard.buy': 'Buy: ~{price}',
  'cmp.ToolCard.rent': 'Rent: ~{price}',

  // project/ToolsTab
  'cmp.ToolsTab.title': 'Tools needed',
  'cmp.ToolsTab.subtitle': 'Make sure you have all the required tools before you start.',
  'cmp.ToolsTab.required': 'Required ({count})',
  'cmp.ToolsTab.optional': 'Optional ({count})',
  'cmp.ToolsTab.emptyTitle': 'No special tools',
  'cmp.ToolsTab.emptyBody': 'This job does not require any specialized equipment.',
  'cmp.ToolsTab.rentInfo': 'Tools marked "rentable" can be rented at hardware stores (e.g. Leroy Merlin, Castorama). Often cheaper than buying.',

  // Tab labels (project detail)
  'cmp.tab.overview': 'Overview',
  'cmp.tab.materials': 'Materials',
  'cmp.tab.tools': 'Tools',
  'cmp.tab.guide': 'Guide',
  'cmp.tab.shopping': 'Shopping',
  'cmp.tab.budget': 'Budget',
  'cmp.tab.photos': 'Photos',

  // TierBadge
  'cmp.TierBadge.economy': 'Eco',
  'cmp.TierBadge.standard': 'Standard',
  'cmp.TierBadge.premium': 'Premium',

  // DiyBanner / helpers
  'cmp.diy.hire.headline': 'We recommend a professional',
  'cmp.diy.hire.details': 'This job requires specialist knowledge and equipment. Mistakes can be costly or dangerous.',
  'cmp.diy.moderate.headline': 'Doable yourself but requires care',
  'cmp.diy.moderate.details': 'You can do this yourself, but follow the step-by-step instructions. If in doubt, consult the salesperson at the hardware store.',
  'cmp.diy.easy.headline': 'Great for doing yourself',
  'cmp.diy.easy.details': 'This job is accessible for beginners. All you need is accuracy and following our instructions.',

  // Share text (build-shopping-text helper)
  'cmp.share.header': 'Shopping list: {projectName}',
  'cmp.share.materials': 'MATERIALS:',
  'cmp.share.tools': 'TOOLS:',
  'cmp.share.materialsTotal': 'Materials total: {total}',
  'cmp.share.toolsTotal': 'Tools total: {total}',
  'cmp.share.grandTotal': 'Total with reserve: {total}',
};

export const components = { pl, en };
