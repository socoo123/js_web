#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"
d2_version="$(tr -d '\r\n' < .d2-version)"
local_d2="$project_dir/.cache/tools/d2-v$d2_version/bin/d2"

if [[ -n "${D2_BIN:-}" ]]; then
  d2_bin="$D2_BIN"
elif [[ -x "$local_d2" ]]; then
  d2_bin="$local_d2"
else
  d2_bin="$(command -v d2 || true)"
fi

if [[ -z "$d2_bin" ]]; then
  printf '需要 D2 %s；安装说明见 diagrams/README.md。\n' "$d2_version" >&2
  exit 1
fi

actual_version="$("$d2_bin" --version)"
if [[ "$actual_version" != "$d2_version" && "$actual_version" != "v$d2_version" ]]; then
  printf '需要 D2 %s，实际为 %s。\n' "$d2_version" "$actual_version" >&2
  exit 1
fi

mkdir -p src/assets/diagrams
font_file="$project_dir/.cache/tools/NotoSansSC.ttf"
font_sha256="a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da"
if [[ ! -f "$font_file" ]]; then
  printf '缺少固定的中文字体；准备步骤见 diagrams/README.md。\n' >&2
  exit 1
fi
if command -v sha256sum >/dev/null 2>&1; then
  actual_font_sha256="$(sha256sum "$font_file" | cut -d ' ' -f 1)"
else
  actual_font_sha256="$(shasum -a 256 "$font_file" | cut -d ' ' -f 1)"
fi
if [[ "$actual_font_sha256" != "$font_sha256" ]]; then
  printf '中文字体 SHA-256 与固定版本不符。\n' >&2
  exit 1
fi

for source in diagrams/*.d2; do
  name="$(basename "$source" .d2)"
  "$d2_bin" --layout=dagre --theme=0 --pad=24 \
    --font-regular="$font_file" --font-italic="$font_file" \
    --font-bold="$font_file" --font-semibold="$font_file" \
    "$source" "src/assets/diagrams/$name.svg"
  # SVG 内嵌了字体子集；随产物保留该字体的完整许可与来源。
  python3 - "src/assets/diagrams/$name.svg" <<'PY'
from pathlib import Path
import html
import sys

path = Path(sys.argv[1])
svg = path.read_text()
notice = Path('diagrams/NotoSansSC-OFL.txt').read_text()
metadata = '<metadata>' + html.escape(
    'Noto Sans SC font source: google/fonts @ '
    'a85815a42757630ce188fdad368c2dfc444d4773\n' + notice
) + '</metadata>'
start = svg.index('<svg')
end = svg.index('>', start) + 1
path.write_text(svg[:end] + metadata + svg[end:])
PY
done
