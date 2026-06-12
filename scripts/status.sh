#!/bin/bash
cd "$(dirname "$0")/.."
command -v jq >/dev/null || { echo "Brak jq"; exit 1; }

echo "═══════════════════════════════════════"
echo "  REMONT ASSISTANCE v3 - STATUS"
echo "═══════════════════════════════════════"
echo ""

echo "🔧 FAZY GLOBALNE:"
jq -r '.global | to_entries[] | "  \(.key): \(if .value then "✅" else "⏳" end)"' state.json
echo ""

echo "📊 STATYSTYKI:"
jq -r '.stats | to_entries[] | "  \(.key): \(.value)"' state.json
echo ""

TOTAL=$(jq -r '.modules | length' state.json)
DONE=$(jq -r '[.modules[] | select(.phase == "done")] | length' state.json)
echo "📋 MODUŁY: $DONE / $TOTAL ukończonych"
echo ""

echo "🔢 PODSUMOWANIE FAZ:"
jq -r '.modules | to_entries | group_by(.value.phase) | .[] | "  \(.[0].value.phase): \(length)"' state.json
echo ""

ERRORS=$(jq -r '[.modules[] | .errors // [] | length] | add // 0' state.json)
echo "❌ Błędy w modułach: $ERRORS"

DISCOVERED=$(jq -r '.discovered_to_add | length' state.json)
echo "🔎 Odkryte nowe: $DISCOVERED"
echo ""

[ -f .daily_counter ] && echo "📅 Wywołań dziś: $(tail -1 .daily_counter)"

echo ""
echo "🌿 Ostatnie branche claude/auto/*:"
git branch --list 'claude/auto/*' 2>/dev/null | tail -10 || echo "  (brak)"
