#!/usr/bin/env zsh
set -euo pipefail

# Usage:
#   ./extract_talks_with_authors.zsh [input_json] [output_csv]
# Defaults:
#   input_json = program.json
#   output_csv = talks_with_authors.csv

INPUT_JSON="${1:-src/program.json}"
OUTPUT_CSV="${2:-talks_with_authors.csv}"

if [[ ! -f "$INPUT_JSON" ]]; then
  echo "Error: input file not found: $INPUT_JSON" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is not installed or not in PATH." >&2
  exit 1
fi

jq -r '
["day","timeWindow","duration","title","authors"],
(
  .days[]
  | .date as $day
  | .events[]?
  | if (.talks? | type) == "array" then .talks[]? else . end
  | select((.authors? | type) == "array" and (.authors | length > 0))
  | [
      $day,
      (.timeWindow // ""),
      (.duration // ""),
      (.title // ""),
      (
        .authors
        | map(.name // empty)
        | map(select(. != ""))
        | join(" | ")
      )
    ]
)
| @csv
' "$INPUT_JSON" > "$OUTPUT_CSV"

echo "Created: $OUTPUT_CSV"