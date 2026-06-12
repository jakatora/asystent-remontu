# Remont Assistance - Pętla v3 (po pełnym audycie)

Wersja 3 jest dostosowana do realiów ujawnionych przez audyt: **57 jobów** (nie 12), brak testów, ryzyko regresji w formułach, legacy IDs które nie mogą zniknąć.

## 🆕 Co nowego w v3

- **3 fazy pre-flight** zamiast 1: `setup_tests` → `map_codebase` → `extend_types`
- **`scripts/sync-state.sh`** - automatycznie wciąga 57 jobów z `JOB_REGISTRY` do `state.json` po `map_codebase`
- **`scripts/check-legacy-ids.sh`** - bezpiecznik który blokuje przypadkowe usunięcie legacy jobów (`wallpaper`, `skirting-boards`, `high-risk`)
- **CLAUDE.md** zawiera teraz krytyczne zakazy z audytu (sekcja 10)
- **`DAILY_LIMIT=20`** domyślnie - pętla zajmie ~3 tygodnie żeby przejść raz przez 57 jobów × 7 faz, więc nie ma sensu palić budżetu w jednym dniu

## ⚠️ Realna skala pracy

- **57 jobów × 7 faz = ~400 wywołań Claude'a**
- Z `DAILY_LIMIT=20` to ~20 dni roboczych
- Z `DAILY_LIMIT=50` to ~8 dni
- **Najpierw zobacz koszt pierwszych 20 wywołań**, potem decyduj o zwiększeniu

## 📦 Instalacja

### 1. Skopiuj paczkę do katalogu głównego repo

```bash
cd /sciezka/do/remont_assistance
unzip /sciezka/do/remont-assistant-v3.zip
mv remont-assistant-v3/* remont-assistant-v3/.gitignore-loop ./ 2>/dev/null || \
  cp -r remont-assistant-v3/. ./
rm -rf remont-assistant-v3
```

### 2. Sprawdź wymagania

```bash
node --version       # >= 18 (lepiej 24)
pnpm --version
jq --version
git --version
claude --version
```

### 3. Nadaj uprawnienia

```bash
chmod +x run.sh scripts/*.sh
```

### 4. Sprawdź że apka typecheckuje PRZED pętlą

```bash
pnpm install
pnpm --filter ./artifacts/mobile typecheck
```

Jeśli błędy - napraw zanim odpalisz pętlę. **Pętla startuje od typecheck i przerwie jeśli nie przejdzie.**

### 5. Zaloguj się do Claude

```bash
claude
# zaloguj w przeglądarce, /exit
```

## 🚀 Uruchomienie

### Jedno polecenie

```bash
bash run.sh
```

### Co się stanie po kolei

1. **Faza 0a: `setup_tests`** (~5-10 min)
   Claude doda Vitest + 5 snapshot testów dla `engine.calculate`. Snapshoty zostaną zacommitowane jako siatka bezpieczeństwa.
   *Możesz pominąć:* `SKIP_SETUP_TESTS=true bash run.sh` (ale zostajesz tylko z typecheck jako gate)

2. **Faza 0b: `map_codebase`** (~5-10 min)
   Claude wczyta `JOB_REGISTRY` i zapisze pełną listę 57 jobów + interfejsy + formuły do `research/_codebase.md`

3. **Auto: `sync-state.sh`**
   Skrypt wczyta listę jobów z `_codebase.md` i wstawi do `state.json` (57 wpisów z `phase: research`)

4. **Faza 0c: `extend_types`** (~3-5 min)
   Claude doda `sourceUrl?` i `imageUrl?` do `MaterialItem` i `ToolItem` w `types/domain.ts`

5. **Pętla modułowa** (właściwa praca)
   Iteracja po 57 jobach × 7 faz. Każda faza:
   - branch `claude/auto/<jobId>-<faza>-<timestamp>`
   - Claude wykonuje zadanie
   - typecheck + (jeśli są) testy + check-legacy-ids
   - jeśli OK - commit + powrót na main
   - jeśli nie - branch zostaje do inspekcji, pętla idzie dalej

### Zatrzymanie

`Ctrl+C`. Stan w `state.json`, można wznowić tym samym `bash run.sh`.

### **Zalecenie:** zatrzymaj po `map_codebase`

Po wykonaniu pierwszych dwóch faz globalnych (~10-15 min) **przerwij Ctrl+C** i przeczytaj:
- `research/_codebase.md` - czy Claude poprawnie zrozumiał Twoje typy
- `state.json` - czy faktycznie ma 57 modułów

Jeśli coś jest nie tak, popraw ręcznie i wznów. Lepiej teraz spalić 5 minut na review niż później dziwić się co Claude napisał w 50 plikach.

## 📊 Monitorowanie

```bash
# Status pętli
bash scripts/status.sh

# Live log ostatniej fazy
tail -f logs/$(ls -t logs/ | head -1)

# Branche do review
git branch --list 'claude/auto/*'

# Diff branchu
git diff main..claude/auto/paint-fix-1234567890
```

## ⚙️ Konfiguracja w `run.sh`

| Zmienna | v3 default | Co kontroluje |
|---------|------------|---------------|
| `DAILY_LIMIT` | **20** | Wywołań Claude'a / dobę. Zacznij niżej, obserwuj koszty. |
| `MAX_TURNS_PER_PHASE` | 40 | Max kroków agenta na fazę |
| `SLEEP_BETWEEN_PHASES` | 15 | Sekundy między fazami |
| `WORK_HOURS_START/END` | 8 / 23 | Godziny aktywności |
| `SKIP_SETUP_TESTS` | false | env var: `SKIP_SETUP_TESTS=true bash run.sh` |

## 🩹 Najczęstsze problemy

**`map_codebase` skończyła ale `state.json` ma 0 modułów:**
- `sync-state.sh` nie znalazł sekcji `## Lista wszystkich jobId` w `_codebase.md`
- Otwórz `research/_codebase.md` i upewnij się że jest taka sekcja z tablicą JSON. Dodaj ręcznie jeśli trzeba, potem `bash scripts/sync-state.sh`

**`setup_tests` wybucha bo Expo wymaga jest-expo:**
- Edytuj `run.sh`, zmień prompt fazy `setup_tests` żeby używał `jest-expo` zamiast `vitest`
- Albo pomiń: `SKIP_SETUP_TESTS=true bash run.sh`

**`check-legacy-ids.sh` blokuje merge:**
- To znaczy że Claude w fazie usunął coś co nie powinno zniknąć
- Branch zostaje do inspekcji - `git diff` pokaże co znikło
- Zwykle wystarczy `git checkout main -- <plik>` na konkretnym pliku z legacy

**Walidator pokazuje 403 dla sklepów:**
- Cloudflare blokuje curl - sprawdź ręcznie w przeglądarce, dane mogą być OK

**Koszty rosną szybko:**
- `DAILY_LIMIT=10` w `run.sh`
- `MAX_TURNS_PER_PHASE=25`
- Skróć `WORK_HOURS_END`

## 🔐 Zalecany workflow review

Każda faza → osobny branch. Najlepiej GitHub PR-y:

```bash
# Zsetupuj remote raz
git remote add origin <twój-github-url>

# Po każdej fazie pętla commitnie. Wystarczy push:
git push origin --all

# Twórz PR-y dla branchy claude/auto/*, review w UI GitHuba
```

Możesz też skonfigurować GitHub Actions żeby automatycznie odpalał `pnpm typecheck` na każdym PR-ze.

## 📝 Czego v3 nadal nie zrobi

- **Nie wygeneruje zdjęć** - tylko URL-e ze sklepów
- **Nie obejdzie cloudflare/captcha**
- **Nie zmieni UI** - kreator i ekrany są poza zakresem
- **Nie wypełni Postgres schema** - to robota osobno (audyt mówi że schema jest pusta)
- **Nie wypełni billing/commerce providerów** - są w stanie `Placeholder*`, do podmiany ręcznie

---

**Plan na pierwszy dzień:**
1. `bash run.sh`
2. Po 5-10 min Claude skończy `setup_tests` - przejrzyj nowe testy w `__tests__/`
3. Po kolejnych 5-10 min skończy `map_codebase` - **PRZERWIJ Ctrl+C**, przeczytaj `research/_codebase.md`
4. Jeśli OK - `bash scripts/sync-state.sh` (lub po prostu wznów `bash run.sh` - sam to zrobi)
5. `bash scripts/status.sh` - sprawdź czy masz 57 modułów
6. Wznów `bash run.sh` i pozwól zrobić 1-2 moduły do `done` (każdy ~7 wywołań)
7. **Zrób review** pierwszego modułu który doszedł do `done` - przejrzyj wszystkie 7 branchy
8. Jeśli sensowne - pozwól ciągnąć dalej. Jeśli nie - dostosuj prompty w `run.sh`

Po pierwszym module przez wszystkie 7 faz będziesz wiedział czy v3 robi to czego oczekujesz.
