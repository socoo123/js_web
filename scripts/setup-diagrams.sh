#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"
d2_version="$(tr -d '\r\n' < .d2-version)"
if [[ "$d2_version" != "0.9.0" ]]; then
  printf '请先为新的 D2 版本核查下载地址与 SHA-256。\n' >&2
  exit 1
fi

case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) platform="macos-arm64"; archive_sha="eaf6c0c143e56dd9fa97bfb6df25ea9c1ebce40245f056a0768cf1a6c15d3064" ;;
  Darwin-x86_64) platform="macos-amd64"; archive_sha="cad39576a480d6bb02ea142fef1726647914b0d2da51ccc9b30b660a2b1babf0" ;;
  Linux-x86_64) platform="linux-amd64"; archive_sha="5669ddc46b99e942cc96078f4a4e36d5e62103348f4c05179ede27802fdd87a9" ;;
  Linux-aarch64|Linux-arm64) platform="linux-arm64"; archive_sha="ac2c028697199479acb321db1e3d68caee9f2ba492ed73caa3cd13f3829bf913" ;;
  *) printf '当前系统请按 diagrams/README.md 手动准备 D2 和字体。\n' >&2; exit 1 ;;
esac

verify_sha() {
  python3 - "$1" "$2" <<'PY'
import hashlib
import sys
from pathlib import Path

path = Path(sys.argv[1])
if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != sys.argv[2]:
    sys.exit(1)
PY
}

download_verified() {
  local url="$1" destination="$2" expected_sha="$3"
  if verify_sha "$destination" "$expected_sha"; then return; fi
  curl -fsSL --retry 3 --max-time 120 "$url" -o "$destination.download"
  if ! verify_sha "$destination.download" "$expected_sha"; then
    rm -f "$destination.download"
    printf '下载文件 SHA-256 不匹配：%s\n' "$destination" >&2
    exit 1
  fi
  mv "$destination.download" "$destination"
}

mkdir -p .cache/tools
archive=".cache/tools/d2-v$d2_version-$platform.tar.gz"
download_verified "https://github.com/d2lang/d2/releases/download/v$d2_version/d2-v$d2_version-$platform.tar.gz" "$archive" "$archive_sha"
tar -xzf "$archive" -C .cache/tools
download_verified \
  'https://raw.githubusercontent.com/google/fonts/a85815a42757630ce188fdad368c2dfc444d4773/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf' \
  '.cache/tools/NotoSansSC.ttf' \
  'a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da'
printf 'D2 %s 与固定中文字体已准备并校验。\n' "$d2_version"
