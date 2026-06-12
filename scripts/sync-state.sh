#!/bin/bash
# ============================================================
# Synchronizuje state.json z listą jobId wyciągniętą
# z research/_codebase.md (po fazie map_codebase).
# ============================================================

set -e
cd "$(dirname "$0")/.."

CODEBASE_FILE="research/_codebase.md"
STATE_FILE="state.json"

[ -f "$CODEBASE_FILE" ] || { echo "❌ Brak $CODEBASE_FILE - najpierw uruchom map_codebase"; exit 1; }

echo "🔍 Wyciągam listę jobId z $CODEBASE_FILE..."

# Próba 1: znajdź sekcję "Lista wszystkich jobId" jako tablicę JSON
JOB_IDS=$(awk '/Lista wszystkich jobId/,/^##/' "$CODEBASE_FILE" \
          | grep -oE '"[a-z][a-z0-9-]+"' \
          | tr -d '"' \
          | sort -u)

# Próba 2 (fallback): szukaj wszystkich kebab-case w bloku JSON
if [ -z "$JOB_IDS" ]; then
  echo "⚠️  Nie znalazłem sekcji 'Lista wszystkich jobId' - próbuję fallback"
  JOB_IDS=$(grep -oE '"[a-z][a-z0-9]+(-[a-z0-9]+)+"' "$CODEBASE_FILE" \
            | tr -d '"' \
            | sort -u \
            | head -100)
fi

if [ -z "$JOB_IDS" ]; then
  echo "❌ Nie udało się wyciągnąć jobId. Edytuj research/_codebase.md i upewnij się że jest sekcja:"
  echo ""
  echo "## Lista wszystkich jobId"
  echo '```json'
  echo '["paint", "ceiling-paint", "wallpaper-install", ...]'
  echo '```'
  exit 1
fi

JOB_COUNT=$(echo "$JOB_IDS" | wc -l | tr -d ' ')
echo "📋 Znaleziono $JOB_COUNT jobId"

# Backup state.json
cp "$STATE_FILE" "${STATE_FILE}.bak"

# Buduj nowy state.json
TMP=$(mktemp)
jq '.modules = {}' "$STATE_FILE" > "$TMP"

while IFS= read -r jobid; do
  [ -z "$jobid" ] && continue
  jq --arg id "$jobid" '.modules[$id] = {phase: "research", updated_at: null, errors: []}' "$TMP" > "${TMP}.new"
  mv "${TMP}.new" "$TMP"
done <<< "$JOB_IDS"

# Zaznacz że sync był zrobiony
jq '.global.state_synced_with_registry = true' "$TMP" > "${TMP}.new"
mv "${TMP}.new" "$STATE_FILE"
rm -f "$TMP"

echo "✅ state.json zaktualizowany. Backup w ${STATE_FILE}.bak"
echo "📊 Modułów do zrobienia: $JOB_COUNT"
echo ""
echo "Pierwsze 10:"
echo "$JOB_IDS" | head -10 | sed 's/^/  - /'
