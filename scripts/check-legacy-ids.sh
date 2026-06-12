#!/bin/bash
# ============================================================
# Sprawdza że legacy jobId i kluczowe ID nie zostały usunięte
# z kodu. Lista chroniona z audytu APP_AUDIT.md sekcja 9-10.
# ============================================================

set -e
cd "$(dirname "$0")/.."

JOBS_DIR="artifacts/mobile/data/jobs"
REGISTRY="artifacts/mobile/features/content/registry.ts"

[ -d "$JOBS_DIR" ] || { echo "❌ Brak $JOBS_DIR"; exit 1; }

# --- LEGACY IDs które MUSZĄ pozostać w kodzie ---
PROTECTED_IDS=(
  "wallpaper"           # legacy w finishing.ts (id "wallpaper" - stare projekty użytkowników)
  "skirting-boards"     # legacy w finishing.ts
  "high-risk"           # parasol bezpieczeństwa w risky.ts
  "paint"               # rdzeń aplikacji
)

# --- LEGACY exports które MUSZĄ istnieć ---
PROTECTED_EXPORTS=(
  "wallpaperJob"        # finishing.ts
  "skirtingJob"         # finishing.ts
  "highRiskJob"         # risky.ts
  "paintJob"            # paint.ts
)

ERRORS=0

echo "🔒 Sprawdzam legacy IDs..."

for id in "${PROTECTED_IDS[@]}"; do
  if grep -rq "id: ['\"]${id}['\"]" "$JOBS_DIR" || \
     grep -rq "id:\"${id}\"" "$JOBS_DIR" || \
     grep -rq "id: \`${id}\`" "$JOBS_DIR"; then
    echo "  ✓ id '$id' istnieje"
  else
    echo "  ✗ id '$id' USUNIĘTE z $JOBS_DIR"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "🔒 Sprawdzam legacy exports..."

for exp in "${PROTECTED_EXPORTS[@]}"; do
  if grep -rq "export const ${exp}" "$JOBS_DIR" || \
     grep -rq "${exp}:" "$JOBS_DIR/index.ts" 2>/dev/null; then
    echo "  ✓ export '$exp' istnieje"
  else
    echo "  ✗ export '$exp' USUNIĘTY"
    ERRORS=$((ERRORS + 1))
  fi
done

# --- Sprawdzenie że JOB_REGISTRY w registry.ts nie został wyczyszczony ---
if [ -f "$REGISTRY" ]; then
  REGISTRY_ENTRIES=$(grep -cE "^\s+'[a-z-]+': " "$REGISTRY" 2>/dev/null || \
                     grep -cE '^\s+"[a-z-]+": ' "$REGISTRY" 2>/dev/null || \
                     echo 0)
  if [ "$REGISTRY_ENTRIES" -lt 30 ]; then
    echo ""
    echo "⚠️  JOB_REGISTRY ma tylko $REGISTRY_ENTRIES wpisów (audyt mówił o ~57)"
    ERRORS=$((ERRORS + 1))
  else
    echo ""
    echo "✓ JOB_REGISTRY ma $REGISTRY_ENTRIES wpisów"
  fi
fi

echo ""
echo "════════════════════════════════"
if [ "$ERRORS" -eq 0 ]; then
  echo "✅ Wszystkie legacy IDs nietknięte"
  exit 0
else
  echo "❌ $ERRORS naruszeń legacy - ROLLBACK!"
  exit 1
fi
