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
echo "== audio"; node "$ROOT/scripts/dl.js" "$(cat "$ROOT/job/audio.url")" audio/narasi.wav; cp audio/narasi.wav audio/vo.wav
node "$ROOT/scripts/cues.js"; python3 "$ROOT/scripts/kt_audio.py" "$ENG/template/audio.py"
N=$(node -e "console.log(require('./audio/shots.json').shots)"); IDS=$(seq 0 $((N-1)))
[ -n "${ONLY:-}" ] && IDS=$(echo "$ONLY" | tr ',' ' ')
echo "== render $N shot, $WORKERS worker"; mkdir -p seg; rm -f seg/*; pids=()
for ((w=0; w<WORKERS; w++)); do ids=""; k=0; for i in $IDS; do [ $((k % WORKERS)) -eq $w ] && ids="${ids:+$ids,}$i"; k=$((k+1)); done
  [ -n "$ids" ] && { node "$ENG/tools/render.js" segments "$ids" > "seg/log$w.txt" 2>&1 & pids+=($!); }; done
for p in "${pids[@]}"; do wait "$p"; done
EXP=$(echo $IDS | wc -w); [ "$(ls seg/shot_??.mp4 2>/dev/null | wc -l)" -eq "$EXP" ] || { cat seg/log*.txt | tail -20; echo "ada shot gagal"; exit 1; }
for f in seg/shot_??.mp4; do echo "file '$PWD/$f'"; done > seg/list.txt
ffmpeg -v error -y -f concat -safe 0 -i seg/list.txt -c copy silent.mp4
echo "== mux"
ffmpeg -v error -y -i silent.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v libx264 -preset medium -crf 20 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -r 30 -af "alimiter=limit=0.8:attack=2:release=60,loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$ROOT/pub/reel.mp4"
echo "== cover"
CT=$(node -e "const m=require('$ROOT/job/meta.json');console.log((m.cover&&m.cover.t)||1.2)"); node "$ENG/tools/render.js" stills "$CT" >/dev/null
node -e "
const m=require('$ROOT/job/meta.json'),fs=require('fs');const L=(m.cover&&m.cover.lines)||[];const F='web/fonts/Poppins-Bold.ttf';
let f=[];L.forEach((t,i)=>{fs.writeFileSync('cv'+i+'.txt',t);const last=i===L.length-1;f.push('drawtext=fontfile='+F+':textfile=cv'+i+'.txt:fontsize=112:fontcolor=#221c22:box=1:boxcolor='+(last?'#ffc93c':'#fff6e5')+':boxborderw=30:x=(w-text_w)/2:y='+(1130+i*185));});
fs.writeFileSync('cover.vf',f.join(','));"
ffmpeg -v error -y -i "stills/s_$(printf '%.2f' "$CT").jpg" -vf "$(cat cover.vf)" -q:v 2 "$ROOT/pub/cover.jpg"
cp "$ROOT/job/timing.json" "$ROOT/pub/timing.json"; cp "$ROOT/job/caption.txt" "$ROOT/pub/caption.txt" 2>/dev/null || true
ls -la "$ROOT/pub"; ffprobe -v error -show_entries format=duration -of csv=p=0 "$ROOT/pub/reel.mp4"
