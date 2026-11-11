echo "== audio"; node "$ROOT/scripts/dl.js" "$(cat "$ROOT/job/audio.url")" audio/narasi.wav; cp audio/narasi.wav audio/vo.wav
node "$ROOT/scripts/cues.js"; python3 "$ROOT/scripts/kt_audio.py" "$ENG/template/audio.py"
N=$(node -e "console.log(require('./audio/shots.json').shots)"); IDS=$(seq 0 $((N-1)))
[ -n "${ONLY:-}" ] && IDS=$(echo "$ONLY" | tr ',' ' ')
echo "== render $N shot, $WORKERS worker"; mkdir -p seg; rm -f seg/*; pids=()
for ((w=0; w<WORKERS; w++)); do ids=""; k=0; for i in $IDS; do [ $((k % WORKERS)) -eq $w ] && ids="${ids:+$ids,}$i"; k=$((k+1)); done
  [ -n "$ids" ] && { node "$ENG/tools/render.js" segments "$ids" > "seg/log$w.txt" 2>&1 & pids+=($!); }; done
for p in "${pids[@]}"; do wait "$p"; done
