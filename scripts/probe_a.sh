#!/usr/bin/env bash
# Build reel Kalau Ternyata (pilar stick-figure): job/ -> pub/reel.mp4 + cover.jpg. Jalan di GitHub Actions; bisa juga lokal dengan UP=<folder animation-skills>.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
UPSHA="${UPSHA:-5dbea55c23aa6a5c93dc3cfb5583840513b56b94}"; WORKERS="${WORKERS:-4}"
if [ -z "${UP:-}" ]; then UP="$ROOT/.up"; rm -rf "$UP"; git clone -q https://github.com/artemnovitckii/claude-animation-skills "$UP"; git -C "$UP" checkout -q "$UPSHA"; fi
ENG="$UP/skills/stick-figure/engine"; REEL="$ROOT/reel"; rm -rf "$REEL" pub; mkdir -p "$REEL/audio" pub
cp -r "$ENG/template/web" "$REEL/web"; rm -f "$REEL/web/shots.js" "$REEL/web/words.js"
cp kt/kt.js "$REEL/web/kt.js"; cp job/shots.js "$REEL/web/shots.js"
sed -i 's#<script src="words.js"></script>#<script src="kt.js"></script><script src="words.js"></script>#' "$REEL/web/index.html"
node scripts/mkwords.js job "$REEL"
cd "$REEL"
