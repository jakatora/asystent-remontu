# W209 — zgłoszenia z rzeczywistego używania aplikacji

2 listopada2026 użytkownik zgłosił, że na powitaniu przyciskDalej nie zmienia ekranu oraz że wKoszt brakuje zdjęć materiałów. Trzecie zlecenie: aktualne ceny narzędzi widoczne w aplikacji bez otwierania sklepów. Ta fala dotyczy pierwszych dwóch poprawek; ceny narzędzi pozostają następną częścią aktywnego celu. Nie twierdzimy, że aplikacja jest kompletna.

Błąd powitania potwierdzono wIAB na rzeczywistym WWW7362f72: klikDalej, ekran i scrollLeft nadal0, bez błędów konsoli. Kod opierał zmianę widocznego kroku na imperatywnym scrollToIndex i zdarzeniu końca przewijania. Nowy ekran renderuje jeden aktywny slajd według stanu, maDalej/Wstecz, krok1z4, Pomiń i ochronę przed podwójnym zapisem. Po błędzie zapisu można ponowić. Zachowano istniejący zapis ukończenia i cztery treściPL/EN; brak zależności od szerokości okna.

Przyczyną brakujących fotografii był starszy resolver, który szukał tylko thumbnailUrl i pierwszego starego linku sklepu. Zignorował istniejące dokładneEAN/sourceUrl z5pozycji wall-repair. Resolver najpierw korzysta teraz z zatwierdzonego katalogu zdjęć poEAN/ID/URL. CostTab iToolsTab używają wspólnegoProductImage, który pokazuje całe opakowanie, opis dostępności i ikonę przy błędzie zdjęcia. Nie dopasowujemy po podobnej nazwie i nie zmieniamy jednego opakowania w inne. Nie dodano fikcyjnych zdjęć ani binarnych grafik.

3testy dopasowania zdjęćPASS:5rzeczywistych materiałów wall-repair, odrębne workiST105/20kg, brak przypadkowych dopasowań i zachowanie ilustracji starszych narzędzi. Typy powitania wstępniePASS. Pełne czyste testy i nowy build oraz rzeczywiste przejście powitania/zdjęcia na320px/dużym ekranie jeszcze przed wdrożeniem.

Pędzelek z dotychczasowej listy ma cztery różne modele(Diall,Dexter,LUX,Ninja), bez potwierdzonych cen. Nie należy wstawiać kwot bez aktualnych źródeł ani uznawać ich za identyczny produkt. Potrzebne jest powiązanie widoku z dokładnie opisanym produktem i bieżącymi ofertami, bez obowiązkowego wychodzenia do sklepu.

BackendW208 działa ze źródła5acdb65/APIeb539416, potwierdzono naturalne wygaśnięcie, nowe aktualne wyceny50209gr i4publiczneHTTP; pełna akceptacja GUI była wstrzymana po zgłoszeniach użytkownika. Binarne sklepy pozostają1.2.0(10):AndroidPUBLISHED,AppleWAITING_FOR_REVIEW. Nie ponawiać wydania natywnego przed sprawdzeniem zgłoszeń.


## Wdrożenie i sprawdzenie 2026-11-02T18:01:07.200Z

Źródło ca7cc6030d414e3dfee29771a8f20f2fc24365d5, WWW deployment cabd8b16-c42a-4c51-8acf-1d1ac0accd14 SUCCESS. Pełne czyste599testów mobile PASS/0fail/0skip, typy PASS,66legacy prac zachowane. Lokalna CUA13sprawdzeń obejmujeDalej/Wstecz/zakończenie/Pomiń, zapis po reloadzie,320×568 i1280px,5wczytanych właściwych zdjęć oraz brak ostrzeżeń/błędów konsoli. Publiczna CUA7sprawdzeń potwierdza całą sekwencję powitania, powrót i zakończenie oraz5prawidłowo wczytanych zdjęć wKoszt. Odczyt wszystkich63publicznych plików ma identyczneSHA jak paczka. Podpisana usługa sklepów jest gotowa,3rzeczywiste lokalne wyceny kuriera i1aktualny odczyt produktu PASS. Pliki hostingu identyczne z poprzednim WWW, backend5acdb65 bez zmian.

Korekty asercji narzędzi weryfikacyjnych: oczekiwana różnica delivery-relay.cjs była błędnym założeniem — wszystkie9plików hostingu są identyczne. Bezpośrednie quoteThroughRelay pobiera nowe potwierdzenie, więc2świeże krajowe wyceny mogą mieć inne daty; zachowane3oryginalne odpowiedzi mają poprawny zakres, zgodną kwotę i dowód dla identycznego koszyka. Reuse jest w koordynatorzeAPI, którego ta fala nie zmienia. Nie ponawiano koszyków, żeby dobierać wynik.

Dowody: G:/Projekty/asystent-remontu-work/wave209-20261102/release-proof.json, local-cua-qa.json, production-cua-qa.json i production-web-verification.json; rzeczywiste zrzuty production-material-photos.jpg i production-onboarding-last-step.jpg. Ceny narzędzi pozostają osobnym zadaniem. Nie zbudowano nowej binarki sklepowej.
