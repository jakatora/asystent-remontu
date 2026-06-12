#!/bin/bash
# Walidator URL-i ze źródeł - wyciąga URL-e i sprawdza HTTP 200
# Użycie: bash scripts/validate-sources.sh <plik>

set -e
FILE="${1:-}"
[ -z "$FILE" ] || [ ! -f "$FILE" ] && { echo "❌ Użycie: $0 <plik>"; exit 1; }
command -v curl >/dev/null || { echo "❌ Brak curl"; exit 1; }

ERRORS=0; WARNINGS=0
echo "🔍 Walidacja: $FILE"

URLS=$(grep -oE 'https?://[^"'\''[:space:],()<>]+' "$FILE" 2>/dev/null \
       | sed 's/[.,;:]$//' | sort -u)

[ -z "$URLS" ] && { echo "ℹ️  Brak URL-i"; exit 0; }

URL_COUNT=$(echo "$URLS" | wc -l | tr -d ' ')
echo "🌐 $URL_COUNT URL-i"

while IFS= read -r url; do
  [ -z "$url" ] && continue
  STATUS=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 15 \
           -A "Mozilla/5.0" -H "Accept-Language: pl-PL" "$url" 2>/dev/null || echo "000")
  case "$STATUS" in
    200|301|302|303|307|308) echo "  ✓ $STATUS  $url" ;;
    403|429) echo "  ⚠️  $STATUS (anty-bot)  $url"; WARNINGS=$((WARNINGS+1)) ;;
    *) echo "  ✗ $STATUS  $url"; ERRORS=$((ERRORS+1)) ;;
  esac
done <<< "$URLS"

echo ""
echo "════════════════════════════════"
[ "$ERRORS" -eq 0 ] && { echo "✅ OK (warn: $WARNINGS)"; exit 0; } || { echo "❌ Błędów: $ERRORS"; exit 1; }
