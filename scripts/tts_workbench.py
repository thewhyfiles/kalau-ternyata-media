
import base64, json, re, wave, os
import numpy as np
from concurrent.futures import ThreadPoolExecutor

SR = 24000
STYLE = "Bacakan dalam bahasa Indonesia dengan nada penasaran, santai, jelas, dan bersemangat seperti pencerita video edukasi pendek: "

def _syl(w):
    w = re.sub(r"[^a-z0-9]", "", w.lower())
    n = len(re.findall(r"[aeiou]", w))
    if re.search(r"\d", w): n = max(n, 2) + (1 if len(w) > 3 else 0)
    return max(n, 1)

def _one(i, text, voice, run):
    last = None
    for _ in range(3):
        r, e = run("GEMINI_GENERATE_CONTENT", {"model": "gemini-2.5-flash-preview-tts", "voice_name": voice, "prompt": STYLE + text})
        if not e and r and r.get("data", {}).get("audio_data"):
            raw = base64.b64decode(r["data"]["audio_data"])
            return i, np.frombuffer(raw[: len(raw) // 2 * 2], dtype="<i2").astype(np.float32) / 32768
        last = e
    raise RuntimeError("TTS gagal beat %d: %s" % (i, str(last)[:200]))

def _trim(x):
    a = np.abs(x)
    idx = np.where(a > 0.012)[0]
    if len(idx) == 0: return x
    s = max(idx[0] - int(0.04 * SR), 0)
    e = min(idx[-1] + int(0.10 * SR), len(x))
    return x[s:e]

def make_tts(beats, voice="Puck", outdir="/mnt/files/job", run=None):
    os.makedirs(outdir, exist_ok=True)
    with ThreadPoolExecutor(4) as ex:
        res = dict(ex.map(lambda t: _one(t[0], t[1], voice, run), list(enumerate(beats))))
    parts, timing, t = [], [], 0.0
    for i, text in enumerate(beats):
        x = _trim(res[i])
        dur = len(x) / SR
        words = text.split()
        wt = [_syl(w) + (1.5 if re.search(r"[,.?!:;]$", w) else 0) for w in words]
        tot = float(sum(wt))
        cs, ws = 0.0, []
        for w, k in zip(words, wt):
            s = t + dur * cs / tot
            cs += k
            e = t + dur * cs / tot
            ws.append([re.sub(r"[.,?!:;\"]", "", w), round(s, 3), round(e - 0.02, 3)])
        timing.append({"beat": i, "start": round(t, 3), "dur": round(dur, 3), "words": ws})
        parts.append(x)
        t += dur
    y = np.concatenate(parts)
    pcm = (np.clip(y, -1, 1) * 32767).astype("<i2").tobytes()
    with wave.open(outdir + "/narasi.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm)
    json.dump(timing, open(outdir + "/timing.json", "w"), ensure_ascii=False)
    return timing, t
