# Rakit audio.py dari skill stick-figure: primitif SFX + musik diambil dari sumbernya, aransemen dan cue dibuat otomatis dari spesifikasi shot.
# pakai (dari folder reel): python3 kt_audio.py <path audio.py template>
import json, sys
src = open(sys.argv[1]).read()
need = ["sfx = np.zeros(N)", "# ---------------- music", "# 0-12.45 sunny deck", "music = lp(music, 6000)"]
for n in need: assert n in src, 'penanda tidak ditemukan di audio.py sumber: ' + n
head = src[:src.index(need[0])]; defs = src[src.index(need[1]):src.index(need[2])]; tail = src[src.index(need[3]):]
cues = json.load(open('audio/cues.json')); D = json.load(open('audio/warp.json'))['new_end']
M = {'whoosh': "whoosh(.36), {t}, .35", 'pop': "pop(520), {t}, .3", 'sparkle': "sparkle_sfx(), {t}, .3", 'thud': "thud(65, .4), {t}, .5", 'boing': "boing(300, .4), {t}, .4"}
sfx = "sfx = np.zeros(N)\n" + ''.join("place(sfx, " + M.get(c['k'], M['pop']).format(t=c['t']) + ")\n" for c in cues)
T1, T2 = round(D * .5, 2), round(D * .72, 2)
arr = f"""
playful(0, {T1}, DM, .8, glock_on=False)
place(music, strings((50, 57, 62), {round(T2 - T1 + .2, 2)}, .35), {T1})
for k, m in enumerate([62, 65, 69, 72, 74, 77, 81, 84]): place(music, glock(m, .9, .26 + k * .02), {T1} + .5 + k * .3)
playful({T2}, {round(D, 2)}, DMAJ, .9)
place(music, strings((50, 57, 62, 66), 1.4, .5), {round(D - .1, 2)})
for m in (62, 66, 69, 74): place(music, pizz(m - 12, .8, .5), {round(D - .1, 2)}); place(music, glock(m + 12, 1.3, .25), {round(D - .1, 2)})
"""
exec(compile(head + sfx + defs + arr + tail, 'audio_kt', 'exec'))
