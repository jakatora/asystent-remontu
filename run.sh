#!/bin/bash
# ============================================================
# Remont Assistance - Orchestrator v3 (post-audit)
# Pętla z fazami pre-flight: setup_tests, map_codebase, extend_types
# Iteruje po 57 jobach z JOB_REGISTRY
# ============================================================

set -e
cd "$(dirname "$0")"

# --- KONFIGURACJA ---
MAX_TURNS_PER_PHASE=40
SLEEP_BETWEEN_PHASES=15
DAILY_LIMIT=20                # ZACZNIJ NISKO - 57 jobów × 7 faz = ~400 wywołań
WORK_HOURS_START=8
WORK_HOURS_END=23
BRANCH_PREFIX="claude/auto"
MOBILE_FILTER="./artifacts/mobile"
SKIP_SETUP_TESTS=${SKIP_SETUP_TESTS:-false}    # ustaw na true żeby pominąć setup testów

# --- KOLORY ---
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARN:${NC} $1"; }
err()  { echo -e "${RED}[$(date +%H:%M:%S)] ERR:${NC} $1"; }
info() { echo -e "${BLUE}[$(date +%H:%M:%S)] INFO:${NC} $1"; }

# --- LICZNIK DZIENNY ---
COUNTER_FILE=".daily_counter"
TODAY=$(date +%Y-%m-%d)
if [ -f "$COUNTER_FILE" ]; then
  STORED_DATE=$(head -1 "$COUNTER_FILE")
  STORED_COUNT=$(tail -1 "$COUNTER_FILE")
  [ "$STORED_DATE" != "$TODAY" ] && { echo -e "$TODAY\n0" > "$COUNTER_FILE"; STORED_COUNT=0; }
else
  echo -e "$TODAY\n0" > "$COUNTER_FILE"; STORED_COUNT=0
fi
inc() { STORED_COUNT=$((STORED_COUNT + 1)); echo -e "$TODAY\n$STORED_COUNT" > "$COUNTER_FILE"; }

# --- WYMAGANIA ---
for cmd in claude jq git pnpm; do
  command -v "$cmd" >/dev/null || { err "Brak $cmd"; exit 1; }
done

# --- KONTEKST ---
[ -f "pnpm-workspace.yaml" ] || { err "Uruchom z katalogu głównego repo (gdzie jest pnpm-workspace.yaml)"; exit 1; }
[ -d "artifacts/mobile" ] || { err "Brak artifacts/mobile - to nie jest repo Remont Assistance?"; exit 1; }
[ -f "CLAUDE.md" ] || { err "Brak CLAUDE.md - skopiuj z paczki"; exit 1; }
[ -f "state.json" ] || { err "Brak state.json - skopiuj z paczki"; exit 1; }

# --- INIT GIT ---
[ -d .git ] || { warn "Brak .git - inicjuję"; git init -q; git add -A; git commit -q -m "init" || true; }

# --- TYPECHECK NA STARCIE ---
log "🔍 Sprawdzam typecheck przed startem..."
if ! pnpm --filter "$MOBILE_FILTER" typecheck > /tmp/initial_tc.log 2>&1; then
  err "Aplikacja NIE typechekuje. Napraw zanim odpalisz pętlę. Log: /tmp/initial_tc.log"
  tail -20 /tmp/initial_tc.log
  exit 1
fi
log "✅ Typecheck OK"

# --- ZMIENNE DLA FAZ GLOBALNYCH ---
SETUP_TESTS_DONE=$(jq -r '.global.setup_tests_done' state.json)
MAP_DONE=$(jq -r '.global.map_codebase_done' state.json)
TYPES_DONE=$(jq -r '.global.extend_types_done' state.json)
STATE_SYNCED=$(jq -r '.global.state_synced_with_registry' state.json)

# --- FUNKCJA: wywołaj Claude'a dla fazy ---
run_phase() {
  local module="$1" phase="$2" prompt="$3"
  local branch="$BRANCH_PREFIX/$module-$phase-$(date +%s)"
  local logfile="logs/${module}_${phase}_$(date +%Y%m%d_%H%M%S).log"

  git checkout -q -b "$branch" 2>/dev/null || git checkout -q "$branch"
  git add -A && git commit -q -m "auto: backup przed $module/$phase" --allow-empty || true

  log "🤖 Claude Code: $module/$phase (max-turns: $MAX_TURNS_PER_PHASE)"

  if claude -p "$prompt" \
       --allowedTools "Read,Write,Edit,Bash,WebSearch,WebFetch,Glob,Grep" \
       --max-turns "$MAX_TURNS_PER_PHASE" \
       > "$logfile" 2>&1; then
    log "✅ Faza zakończona. Log: $logfile"
    git add -A && git commit -q -m "auto: $module/$phase OK" || true
    inc
  else
    err "❌ Błąd. Log: $logfile"
    git checkout -q -- . 2>/dev/null || true
    inc
    return 1
  fi

  # Bezpiecznik: typecheck po fazie
  if ! pnpm --filter "$MOBILE_FILTER" typecheck > /tmp/post_tc.log 2>&1; then
    err "⚠️  Typecheck po fazie NIE przechodzi! Branch $branch zostawiony."
    git checkout -q main 2>/dev/null || git checkout -q master 2>/dev/null || true
    return 1
  fi

  git checkout -q main 2>/dev/null || git checkout -q master 2>/dev/null || true
  return 0
}

log "🚀 Start orkiestratora Remont Assistance v3"
log "📂 Repo: $(pwd) | Mobile: $MOBILE_FILTER"
log "📊 Dzienny limit: $DAILY_LIMIT (użyte: $STORED_COUNT)"

# ════════════════════════════════════════════════════════════
# FAZA 0a: setup_tests (zalecana)
# ════════════════════════════════════════════════════════════
if [ "$SETUP_TESTS_DONE" != "true" ] && [ "$SKIP_SETUP_TESTS" != "true" ]; then
  log "🧪 Faza 0a: setup_tests (dorzuca Vitest + 5 snapshot testów)"

  PROMPT='Zadanie: dorzuć minimalny framework testowy do artifacts/mobile/.

KROKI:
1. Dodaj do artifacts/mobile/package.json devDependencies: vitest, @vitest/ui (jako catalog: jeśli używają, w przeciwnym razie wersje stabilne ~1.6)
2. Utwórz artifacts/mobile/vitest.config.ts (środowisko node, alias do tsconfig paths jeśli są)
3. Dodaj skrypt "test" w package.json
4. Utwórz artifacts/mobile/features/calculator/__tests__/engine.snapshot.test.ts
   - Importuj engine i pierwsze 5 jobów z JOB_REGISTRY (paint, flooring, bathroom, kitchen, walls - lub pierwsze 5 dostępne)
   - Dla każdego: wywołaj engine.calculate z deterministycznym inputem (np. wallArea: 30, ceilingHeight: 2.5, coats: 2)
   - Snapshot wynikowego objektu (toMatchSnapshot)
5. URUCHOM: pnpm install, potem pnpm --filter ./artifacts/mobile test
6. Snapshoty zapiszą się przy pierwszym uruchomieniu - zacommituj je
7. URUCHOM: pnpm --filter ./artifacts/mobile typecheck (nie może wybuchnąć)
8. Po sukcesie zaktualizuj state.json: global.setup_tests_done = true

Jeśli coś nie działa (np. konflikt zależności, jest expo wymaga jest a nie vitest):
- Zamiast vitest użyj jest-expo (sprawdź zalecenie Expo SDK 54 dla testów)
- Dostosuj importy
- Cel: 5 snapshot testów które przechodzą i mogą służyć jako siatka bezpieczeństwa'

  if run_phase "_global_" "setup_tests" "$PROMPT"; then
    log "✅ Testy zainstalowane"
  else
    warn "⚠️  setup_tests nie udało się. Możesz to pominąć:"
    warn "    SKIP_SETUP_TESTS=true bash run.sh"
    warn "    (ale stracisz siatkę bezpieczeństwa - tylko typecheck będzie gate)"
    exit 1
  fi
  sleep "$SLEEP_BETWEEN_PHASES"
  SETUP_TESTS_DONE=$(jq -r '.global.setup_tests_done' state.json)
fi

# ════════════════════════════════════════════════════════════
# FAZA 0b: map_codebase
# ════════════════════════════════════════════════════════════
if [ "$MAP_DONE" != "true" ]; then
  log "🗺️  Faza 0b: map_codebase"

  PROMPT='Zadanie: zmapuj kompletnie strukturę kodu i zapisz do research/_codebase.md.

KROKI:
1. Wczytaj artifacts/mobile/features/content/registry.ts - wypisz WSZYSTKIE jobId z JOB_REGISTRY (linia ~36-105)
2. Wczytaj artifacts/mobile/data/jobs/index.ts - jak są re-eksportowane joby
3. Dla każdego pliku data/jobs/*.ts wypisz: nazwa pliku, eksportowane const-y (np. paintJob, ceilingPaintJob, ...), ich job.id
4. Wczytaj artifacts/mobile/types/domain.ts - skopiuj interfejsy: RenovationJob, MaterialItem, ToolItem, MaterialRequirement (ten ostatni może być w types/engine.ts)
5. Wczytaj artifacts/mobile/types/pricing.ts - skopiuj interfejsy: MaterialPriceReference, LaborPriceReference, PriceSourceMetadata (potwierdź obecność sourceUrl?)
6. Wczytaj artifacts/mobile/features/calculator/engine.ts - sygnatura calculate(), jak wykrywany rich vs legacy
7. Wczytaj artifacts/mobile/features/calculator/formulas.ts - lista kluczy w FORMULA_REGISTRY (~linia 187), jak wyglądają funkcje formuł (np. m.wallArea, m.coats)
8. Wczytaj artifacts/mobile/data/prices/materials.ts (pierwsze 50 linii) - wzorzec MaterialPriceReference z konkretną wartością
9. Wczytaj artifacts/mobile/data/prices/labor.ts (pierwsze 30 linii) - wzorzec LaborPriceReference
10. Wczytaj artifacts/mobile/data/prices/mappings.ts - struktura JOB_LABOR_MAPPINGS i JOB_MATERIAL_MAPPINGS
11. Wczytaj artifacts/mobile/data/prices/regions.ts - lista regionów (powinien być tylko `lodzkie`)

ZAPIS DO research/_codebase.md:
- Sekcja "Lista wszystkich jobId" - jako tablica JSON, np. ["paint","ceiling-paint","wallpaper-install",...]
- Sekcja "TS interfejsy" - skopiowane fragmenty kodu
- Sekcja "Wzorzec nowego pliku data/jobs/<slug>.ts" - skopiowany paint.ts jako kompletny przykład (max 200 linii)
- Sekcja "Formuły" - lista kluczy + 2 przykładowe ciała funkcji
- Sekcja "Mapowania cen" - przykładowy wpis JOB_MATERIAL_MAPPINGS

Po zakończeniu zaktualizuj state.json: global.map_codebase_done = true'

  if run_phase "_global_" "map_codebase" "$PROMPT"; then
    log "✅ Mapowanie zrobione. Sprawdź research/_codebase.md"
  else
    err "❌ map_codebase nie udało się"
    exit 1
  fi
  sleep "$SLEEP_BETWEEN_PHASES"
  MAP_DONE=true
fi

# ════════════════════════════════════════════════════════════
# Sync state.json z aktualną listą jobów
# ════════════════════════════════════════════════════════════
if [ "$STATE_SYNCED" != "true" ]; then
  log "🔄 Synchronizuję state.json z listą 57 jobów z research/_codebase.md"
  bash scripts/sync-state.sh || { err "sync-state.sh nie udało się"; exit 1; }
  STATE_SYNCED=true
fi

# ════════════════════════════════════════════════════════════
# FAZA 0c: extend_types
# ════════════════════════════════════════════════════════════
if [ "$TYPES_DONE" != "true" ]; then
  log "🔧 Faza 0c: extend_types (dodaje sourceUrl?, imageUrl? do MaterialItem/ToolItem)"

  PROMPT='Zadanie: dorzuć opcjonalne pola sourceUrl? i imageUrl? do MaterialItem i ToolItem.

KROKI:
1. Wczytaj artifacts/mobile/types/domain.ts
2. Znajdź interface MaterialItem (linia ~61) - dodaj na końcu interfejsu:
   readonly sourceUrl?: string;
   readonly imageUrl?: string;
3. Znajdź interface ToolItem (linia ~81) - dodaj te same dwa pola
4. Sprawdź czy MaterialRequirement (w types/engine.ts) też powinien dostać te pola - jeśli ma własną definicję (a nie extends MaterialItem), dorzuć
5. URUCHOM: pnpm --filter ./artifacts/mobile typecheck
6. Jeśli OK, zaktualizuj state.json: global.extend_types_done = true

WAŻNE: pola muszą być readonly i opcjonalne (?), żeby nie złamać istniejących wpisów które ich nie mają.'

  if run_phase "_global_" "extend_types" "$PROMPT"; then
    log "✅ Typy rozszerzone"
  else
    warn "⚠️  extend_types nie udało się - kontynuuję bez tych pól (sourceUrl pójdzie do komentarza)"
  fi
  sleep "$SLEEP_BETWEEN_PHASES"
fi

# ════════════════════════════════════════════════════════════
# WŁAŚCIWA PĘTLA - per jobId
# ════════════════════════════════════════════════════════════
log "🎯 Wchodzę w pętlę modułową (57 jobów × 7 faz)"

while true; do
  HOUR=$(date +%H | sed 's/^0//')
  if [ "$HOUR" -lt "$WORK_HOURS_START" ] || [ "$HOUR" -ge "$WORK_HOURS_END" ]; then
    warn "Poza godzinami pracy. Czekam 30 min."
    sleep 1800
    continue
  fi

  if [ "$STORED_COUNT" -ge "$DAILY_LIMIT" ]; then
    warn "Limit dzienny ($DAILY_LIMIT) osiągnięty. Czekam godzinę."
    sleep 3600
    TODAY_NEW=$(date +%Y-%m-%d)
    [ "$TODAY_NEW" != "$TODAY" ] && { TODAY="$TODAY_NEW"; STORED_COUNT=0; echo -e "$TODAY\n0" > "$COUNTER_FILE"; }
    continue
  fi

  TASK=$(jq -r '.modules | to_entries[] | select(.value.phase != "done") | "\(.key)|\(.value.phase)"' state.json | head -1)

  if [ -z "$TASK" ]; then
    log "✨ Wszystkie joby done! Faza: discover"
    JOB_ID="_discover_"; PHASE="discover"
  else
    JOB_ID="${TASK%|*}"; PHASE="${TASK#*|}"
  fi

  log "📋 Job: $JOB_ID | Faza: $PHASE"

  case "$PHASE" in
    research)
      PROMPT="Faza: RESEARCH dla joba '$JOB_ID'.

1. Wczytaj research/_codebase.md - znajdź w którym pliku jest job '$JOB_ID' (pole 'plik' przy job.id)
2. Wczytaj ten plik i wyciągnij obiekt $JOB_ID
3. Wyszukaj w internecie jak poprawnie wykonać ten remont - 3 polskie wiarygodne źródła
4. Zapisz research/$JOB_ID.md z cytatami + URL + datą pobrania
5. NIE modyfikuj kodu
6. Zaktualizuj state.json: modules[\"$JOB_ID\"].phase = 'compare'"
      ;;
    compare)
      PROMPT="Faza: COMPARE dla '$JOB_ID'.

1. Wczytaj research/$JOB_ID.md i obiekt joba w odpowiednim pliku data/jobs/*.ts
2. Wypisz różnice do diff/$JOB_ID.md - dla każdej oznacz: krytyczna/średnia/kosmetyczna
3. NIE modyfikuj kodu
4. state.json: phase = 'fix'"
      ;;
    fix)
      PROMPT="Faza: FIX dla '$JOB_ID'.

REGUŁY KRYTYCZNE z CLAUDE.md:
- NIE zmieniaj job.id
- NIE zmieniaj measurementInputs[].id
- NIE konwertuj między MaterialItem (legacy) i MaterialRequirement (rich)
- Każde zmienione pole z komentarzem // source: <URL>

1. Wczytaj diff/$JOB_ID.md
2. Zastosuj poprawki KRYTYCZNE i ŚREDNIE w odpowiednim pliku data/jobs/*.ts
3. URUCHOM: pnpm --filter ./artifacts/mobile typecheck
4. Jeśli setup_tests było zrobione: pnpm --filter ./artifacts/mobile test
5. URUCHOM: bash scripts/check-legacy-ids.sh
6. Wszystko OK → state.json phase = 'tools_materials'
7. Cokolwiek wybucha → git checkout -- <plik>, errors[], BEZ zmiany fazy"
      ;;
    tools_materials)
      PROMPT="Faza: TOOLS_MATERIALS dla '$JOB_ID'.

1. Wczytaj job '$JOB_ID' i sprawdź jakie ma materials/tools
2. Sprawdź data/prices/materials.ts czy te materiały tam są (po id)
3. Dla brakujących - dodaj wpisy do materials.ts (format MaterialPriceReference, sourceUrl pożądane)
4. Sprawdź data/prices/mappings.ts - JOB_MATERIAL_MAPPINGS[\"$JOB_ID\"] istnieje? jeśli nie - dodaj
5. Analogicznie data/prices/labor.ts i JOB_LABOR_MAPPINGS
6. Każdy nowy wpis: minimum 2 źródła w komentarzu lub w polu sourceUrl
7. typecheck + test + check-legacy-ids
8. OK → phase = 'photos_prices'"
      ;;
    photos_prices)
      PROMPT="Faza: PHOTOS_PRICES dla '$JOB_ID'.

1. Dla materiałów i narzędzi tego joba znajdź w polskich sklepach (Castorama, Leroy Merlin, OBI, Bricoman, Mrówka)
2. W data/prices/materials.ts dorzuć/zaktualizuj price wraz z sourceUrl (URL do strony produktu w sklepie)
3. Jeśli typ MaterialItem ma już imageUrl? (po extend_types) - dodaj URL strony produktu jako imageUrl (NIE plik graficzny)
4. Każda cena: { value, currency: 'PLN', store, fetchedAt: ISO }
5. typecheck + test
6. OK → phase = 'verify_calcs'"
      ;;
    verify_calcs)
      PROMPT="Faza: VERIFY_CALCS dla '$JOB_ID'.

1. Wczytaj features/calculator/formulas.ts i engine.ts
2. Znajdź formułę używaną przez '$JOB_ID' (formulaKey w jobie)
3. Sprawdź w internecie 3 przykłady obliczenia zapotrzebowania dla tego typu remontu (różne metraże)
4. Jeśli setup_tests było zrobione: dodaj test parametryczny w features/calculator/__tests__/$JOB_ID.test.ts (3 przypadki, każdy z source_url w komentarzu)
5. Jeśli nie było - zapisz przykłady do research/$JOB_ID-tests.md
6. Jeśli formuła daje błędne wyniki - popraw, każda zmiana z // source: URL
7. typecheck + test
8. OK → phase = 'done', stats.total_modules_done += 1"
      ;;
    discover)
      PROMPT="Faza: DISCOVER.

1. Wczytaj listę istniejących jobId z research/_codebase.md
2. Wyszukaj 3 popularne typy remontów których brakuje
3. Dla każdego (kanoniczny przepis z CLAUDE.md):
   a. Utwórz wpis w odpowiednim data/jobs/*.ts (lub nowym pliku) - wzorem paintJob
   b. Dopisz do data/jobs/index.ts
   c. Zarejestruj w JOB_REGISTRY (registry.ts)
   d. Mapowania cen w data/prices/mappings.ts
4. typecheck + test + check-legacy-ids
5. Jeśli OK - dopisz do state.json.modules nowe wpisy z phase='research'
6. Dopisz do state.json.discovered_to_add[] z URL źródła pomysłu"
      ;;
    *)
      err "Nieznana faza: $PHASE"
      sleep "$SLEEP_BETWEEN_PHASES"
      continue
      ;;
  esac

  run_phase "$JOB_ID" "$PHASE" "$PROMPT" || warn "Faza $JOB_ID/$PHASE wybuchła - kontynuuję"

  log "📊 Wywołań dziś: $STORED_COUNT/$DAILY_LIMIT"
  log "💤 Pauza $SLEEP_BETWEEN_PHASES s..."
  sleep "$SLEEP_BETWEEN_PHASES"
done
