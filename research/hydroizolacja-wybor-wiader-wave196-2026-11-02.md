# Pełny zestaw Mapei — wybór wiader w kreatorze, 2026-11-02

Audyt istniejącej hydroizolacji: kalkulator potrafił wybrać 5 i 10 kg ze wcześniejszymi GTIN oraz 20 kg. Katalog i backend obsługują też 3 kg (8022452249266), 5 kg 124805PL (8022452242489) i 10 kg 124810PL (8022452242496); brakowało bezpośredniego wyboru w kreatorze i edycji.

Dodano jawne wartości hydroSystem 4/5/6 dla tych trzech opakowań. Wcześniejsze 1/2/3 oraz model ilości waterproofing-mapei-v1 pozostają zachowane. Nowy formularz pokazuje potwierdzone opakowania 3/5/10/20 kg, a edycja zapisanego starszego wariantu pozwala go zachować lub przywrócić przed zapisem. Przypisanie nowszego GTIN wymaga wyboru użytkownika. Potrzebne kg, grunt, taśma, narożniki i mankiety są liczone tak samo; wszystkie siedem produktów pozostaje w systemie Mapei. Zmiana tożsamości folii wymaga ponownego potwierdzenia posiadanego zapasu.

## Źródła i sprawdzenie

Rzeczywisty odczyt 2026-11-02 potwierdził Rab-Dom: 3 kg 79,90 zł, 5 kg 112,90 zł, 10 kg 199,90 zł oraz 20 kg 385,00 zł. WinBud: wcześniejsze 5 kg 104,00 zł, 10 kg 198,97 zł i 20 kg 367,70 zł. Starsze warianty nadal mają oferty; nie nazywać ich nieaktualnymi lub automatycznie nie zamieniać na droższy nowszy kod. Dowody current-mapegum-products.json poza repo.

- https://www.rabdom.pl/pl/p/Folia-w-plynie-hydroizolacyjna-MAPEI-Mapegum-WPS-3kg/16590
- https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-5kg-HYDROIZOLACJA-PLYNNA-FOLIA/1906
- https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-10kg-HYDROIZOLACJA-PLYNNA-FOLIA/9873
- https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-5kg/131
- https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-10kg/419

Wcześniejszy przegląd dwóch źródeł, fotografii, kart technicznych oraz pełnych koszyków: research/mapegum-opakowania-dostawy-wave165-2026-11-01.md, research/mapegum-dobor-opakowan-wave166-2026-11-01.md i research/hydroizolacja-system-mapei-2026-10-27.md. Nie dodano nowych produktów, sklepów lub cen do seeda.

8 testów kalkulatora i dopasowania wariantów PASS, bez skip, typy mobile PASS. Pięć nowych testów sprawdza pełne siedem produktów, dokładne GTIN i opakowania, surowe kg, zachowanie starych danych, formularze i reset posiadanego zapasu po zmianie produktu. Pełny odbiór czystej kopii, rzeczywiste HTTP całych zestawów, UI i publikacja pozostają do wykonania.

## Osobny audyt ATLAS — nie publikowano niepełnego systemu

Przejrzano bieżące karty producenta ATLAS Woder E (2026-09) i Hydroband 3G (2026-08):

- https://www.atlas.com.pl/wp-content/uploads/2026/09/atlas_szybkoschnaca_folia_w_plynie_woder_e_plik_karta-techniczna.pdf
- https://www.atlas.com.pl/wp-content/uploads/2026/08/plik_karta-techniczna-1.pdf
- https://www.atlas.com.pl/produkt/atlas-szybkoschnaca-folia-w-plynie-woder-e/
- https://www.atlas.com.pl/produkt/atlas-hydroband-3g/

Woder E ma odrębne wymagania zużycia/grubości według rodzaju zabezpieczenia, nie wolno przenosić na niego jednej formuły 1,2 kg/m² z Mapei ani dobierać przypadkowych mankietów. Przygotowanie podłoża, rodzaj zabezpieczenia ścian/podłogi, zapas i właściwe akcesoria wymagają osobnego modelu oraz dalszego przeglądu.

Natywne API e-adams.pl potwierdziło pierścień ścienny Hydroband 3G 120×120 mm SKU20003, id13565, brak na stanie (0); podłogowy 425×425 mm SKU20002, id13564, 31,90 zł i tylko 1 sztukę. Sam is_purchasable=true nie wystarcza przy is_in_stock=false. Budom ma ofertę pierścienia podłogowego id1264; to jeszcze nie potwierdzona tożsamość i pełny koszyk. Nie dodano fikcyjnego GTIN, dostawy, dostępności pierścienia ściennego lub kompletnego zestawu ATLAS. Źródła kandydackie zachowano w G:/Projekty/asystent-remontu-work/wave196-20261102.

Katalog pozostaje 249 referencji / 217 potwierdzonych / 325 ofert; 32 stare luki nadal otwarte. Backend i jego seed pozostają bez zmian. Cel rozwoju pozostaje aktywny.
