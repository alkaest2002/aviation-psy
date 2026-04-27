#!/usr/bin/env zsh
set -euo pipefail

INPUT_JSON="src/program.json"
TARGET_DOC="tDoc.txt"
MAX_WIDTH="${1:-60}"

if ! [[ "$MAX_WIDTH" =~ ^[0-9]+$ ]] || (( MAX_WIDTH < 20 )); then
  echo "Error: MAX_WIDTH must be a positive integer >= 20, got: $MAX_WIDTH" >&2
  exit 1
fi

if [[ ! -f "$INPUT_JSON" ]]; then
  echo "Error: input file not found: $INPUT_JSON" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is not installed or not in PATH." >&2
  exit 1
fi

csv_data=$(jq -r '
["giorno","slot","durata","titolo","autori"],
(
  .days[]
  | .date as $day
  | .events[]?
  | if (.talks? | type) == "array" then .talks[]? else . end
  | . as $e
  | [
      $day,
      ($e.timeWindow // ""),
      (($e.duration // 0) | tostring),
      ($e.title // ""),
      ([ ($e.authors? // [])[] | .name // "" ] | join(", "))
    ]
)
| @csv
' "$INPUT_JSON")

if [[ -z "$csv_data" ]]; then
  echo "Error: jq produced no output" >&2
  exit 1
fi

MAX_WIDTH="$MAX_WIDTH" CSV_DATA="$csv_data" TARGET_DOC="$TARGET_DOC" python3 <<'EOF'
import csv, io, sys, textwrap, os

csv_data   = os.environ["CSV_DATA"]
target_doc = os.environ["TARGET_DOC"]
TOTAL      = int(os.environ["MAX_WIDTH"])
DIVIDER    = "-" * TOTAL
LABEL_W    = 10
VALUE_W    = TOTAL - LABEL_W

def fmt_field(label, value):
    prefix  = f"{label}: ".ljust(LABEL_W)
    pad     = " " * LABEL_W
    wrapped = textwrap.wrap(value, VALUE_W) if value else [""]
    lines   = [prefix + wrapped[0]]
    for part in wrapped[1:]:
        lines.append(pad + part)
    return "\n".join(lines)

def fmt_orario(raw_slot):
    if " - " in raw_slot:
        start, end = raw_slot.split(" - ", 1)
        value = f"Dalle {start.strip()} alle {end.strip()}"
    else:
        value = raw_slot
    return fmt_field("Orario", value)

rows = list(csv.reader(io.StringIO(csv_data)))
if not rows:
    print("Error: empty input", file=sys.stderr)
    sys.exit(1)

# drop header
rows = rows[1:]

blocks = []
for row in rows:
    row    = (row + [""] * 5)[:5]
    giorno = row[0]
    slot   = row[1]
    durata = row[2]
    titolo = row[3]
    autori = row[4]

    lines = [
        fmt_field("Giorno",   giorno),
        fmt_orario(slot),
        fmt_field("Durata",   durata + " min"),
        fmt_field("Attività", titolo),
    ]
    if autori:
        lines.append(fmt_field("Autori", autori))

    blocks.append("\n".join(lines))

table = ("\n" + DIVIDER + "\n").join(blocks)
table = DIVIDER + "\n" + table + "\n" + DIVIDER + "\n"

with open(target_doc, "r", encoding="utf-8") as f:
    content = f.read()

marker = "                         PROGRAMMA"
if marker not in content:
    print(f"Error: marker not found in {target_doc}", file=sys.stderr)
    sys.exit(1)

before = content[:content.index(marker) + len(marker)]
before = before.rstrip() + "\n" + "=" * TOTAL + "\n\n"

with open(target_doc, "w", encoding="utf-8") as f:
    f.write(before + table)

print(f"Updated: {target_doc} (width={TOTAL})")
EOF