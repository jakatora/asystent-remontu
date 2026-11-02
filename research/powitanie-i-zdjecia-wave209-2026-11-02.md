# W209 — zgłoszenia z rzeczywistego używania aplikacji

2 listopada2026 użytkownik zgłosił, że na powitaniu przyciskDalej nie zmienia ekranu oraz że wKoszt brakuje zdjęć materiałów. Trzecie zlecenie: aktualne ceny narzędzi widoczne w aplikacji bez otwierania sklepów. Ta fala dotyczy pierwszych dwóch poprawek; ceny narzędzi pozostają następną częścią aktywnego celu. Nie twierdzimy, że aplikacja jest kompletna.

Błąd powitania potwierdzono wIAB na rzeczywistym WWW7362f72: klikDalej, ekran i scrollLeft nadal0, bez błędów konsoli. Kod opierał zmianę widocznego kroku na imperatywnym scrollToIndex i zdarzeniu końca przewijania. Nowy ekran renderuje jeden aktywny slajd według stanu, maDalej/Wstecz, krok1z4, Pomiń i ochronę przed podwójnym zapisem. Po błędzie zapisu można ponowić. Zachowano istniejący zapis ukończenia i cztery treściPL/EN; brak zależności od szerokości okna.

Przyczyną brakujących fotografii był starszy resolver, który szukał tylko thumbnailUrl i pierwszego starego linku sklepu. Zignorował istniejące dokładneEAN/sourceUrl z5pozycji wall-repair. Resolver najpierw korzysta teraz z zatwierdzonego katalogu zdjęć poEAN/ID/URL. CostTab iToolsTab używają wspólnegoProductImage, który pokazuje całe opakowanie, opis dostępności i ikonę przy błędzie zdjęcia. Nie dopasowujemy po podobnej nazwie i nie zmieniamy jednego opakowania w inne. Nie dodano fikcyjnych zdjęć ani binarnych grafik.

3testy dopasowania zdjęćPASS:5rzeczywistych materiałów wall-repair, odrębne workiST105/20kg, brak przypadkowych dopasowań i zachowanie ilustracji starszych narzędzi. Typy powitania wstępniePASS. Pełne czyste testy i nowy build oraz rzeczywiste przejście powitania/zdjęcia na320px/dużym ekranie jeszcze przed wdrożeniem.

Pędzelek z dotychczasowej listy ma cztery różne modele(Diall,Dexter,LUX,Ninja), bez potwierdzonych cen. Nie należy wstawiać kwot bez aktualnych źródeł ani uznawać ich za identyczny produkt. Potrzebne jest powiązanie widoku z dokładnie opisanym produktem i bieżącymi ofertami, bez obowiązkowego wychodzenia do sklepu.

BackendW208 działa ze źródła5acdb65/APIeb539416, potwierdzono naturalne wygaśnięcie, nowe aktualne wyceny50209gr i4publiczneHTTP; pełna akceptacja GUI była wstrzymana po zgłoszeniach użytkownika. Binarne sklepy pozostają1.2.0(10):AndroidPUBLISHED,AppleWAITING_FOR_REVIEW. Nie ponawiać wydania natywnego przed sprawdzeniem zgłoszeń.
