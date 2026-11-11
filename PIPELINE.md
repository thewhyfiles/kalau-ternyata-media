# PIPELINE Kalau Ternyata (runbook otomatis)

Repo ini = mesin render. Branch `build` = tempat pekerjaan. Hasil video muncul di branch `reel-kt` (reel.mp4, cover.jpg, timing.json, caption.txt) setelah GitHub Actions `render-reel` selesai (sekitar 3 menit). Semua commit lewat Composio (`COMPOSIO_REMOTE_WORKBENCH` + `GITHUB_COMMIT_MULTIPLE_FILES`, owner `thewhyfiles`, repo `kalau-ternyata-media`, branch `build`). Token lokal `gh` tidak valid, jangan dipakai. Jangan menulis kata yang diblokir gateway (misalnya nama perintah unduh bawaan shell) di isi file.

Pilar: Kalau Ternyata (stick-figure, mayoritas), Kata Siapa? (mitos, stick-figure, hook "Kata siapa ...?"), Bongkar Isinya (breakdown; status 'tunda' sampai ada integrasi).

## 1. Pilih topik
- Baca `topik.json` di branch `build` (`GITHUB_GET_REPOSITORY_CONTENT`, ref `build`, isi base64) dan daftar `selesai/`.
- Ambil topik pertama berstatus `siap` yang belum punya `selesai/<id>.txt`. Kalau habis, buat 6 topik baru bergaya sama (riset dulu) lalu lanjut.

## 2. Riset (WebSearch)
- Minimal 2 sumber independen. Tulis klaim dengan hedge ("para sejarawan menyebut", "menurut catatan ...") bila belum mutlak. Jangan memakai angka yang tidak ada di sumber.

## 3. Naskah (Bahasa Indonesia)
- 12 sampai 16 kalimat pendek, sekitar 110-135 kata, total suara 40-50 detik. Satu kalimat = satu shot.
- Kalimat 1 = hook yang diawali "Kalau ternyata, ...?" (pilar kata: "Kata siapa ...?").
- Angka ditulis dengan huruf di naskah ("dua puluh ribu kilometer"). Di `job/caps.json` petakan ke tampilan caption, contoh {"dua puluh ribu":"20 ribu"} (frasa multi-kata, huruf kecil).
- Dua kalimat terakhir: penegas merek ("Yang kamu kira, belum tentu begitu.") lalu pertanyaan ajakan komentar.
- Tanpa emoji, tanpa klaim yang tidak diverifikasi.

## 4. Spec adegan `job/shots.js`
Contoh lengkap: file `job/shots.js` pada commit `2bba287b1df88dc1c95f0ead3817a55d07e428e0` (baca dengan `GITHUB_GET_REPOSITORY_CONTENT`, ref = SHA itu). Wajib diawali `const SHOTS = [];` lalu `KT.build([...]);`. Layout: `const Y = 1230, S = 470;` (kaki tokoh di atas pita caption y 1250-1420; jangan menaruh objek penting di y > 1200).
Field shot: `l` = indeks kalimat pembuka (shot berakhir saat shot berikut mulai); `bg` = day|sea|night|room|space|flat (+`col` untuk flat, `sun`, `z:[1,1.1]` zoom); `ch` tokoh {c: kamu|teman|sunny|hijau|ungu|kapten|pelaut, x, y, s, m (mood), m2 (ganti mood [[waktu,mood]]), p (pose), p2, f:-1 (balik), a (waktu muncul), nopop}; `pr` properti {n, x, y, s, a, back, float, wobble, rot, nopop}; `tx` label {t, x, y, s, a, until, card:false, bg, rot}; `fx` {k: burst|flash|shake|puff|spark, at, x, y, r}.
Waktu: angka = detik dari awal shot; 'wN' = kata ke-N yang diucapkan dalam shot itu (kata asli, bukan caption gabungan).
Mood: senang kaget mikir puas sedih pusing nyengir bingung datar takut teriak. Pose: diam angkat pinggang tunjuk tunjukatas garuk lari lambai loncat bingung takut.
Properti: globe scroll bulb clock qmark excl book house tree gunung volcano rocket coin crown phone fire bolt heart matahari bulan bintang awan gear kaca chip baterai bendera kapal papan pulau rumah.
Aturan visual: variasikan latar antar shot, jangan dua shot berturut-turut identik; label angka muncul tepat saat angkanya diucapkan; burst/shake hanya untuk momen kejutan; hindari burst menutupi tokoh.

## 5. Suara + commit (satu sel workbench per tahap, batas 180 detik per sel)
- Muat `scripts/tts_workbench.py` dari repo (base64), `exec(...)`, lalu `timing, total = make_tts(BEATS, voice="Puck", run=run_composio_tool)`; BEATS = daftar kalimat naskah. Hasil: `/mnt/files/job/narasi.wav` dan `timing.json` (kata-kata dihitung dari estimasi suku kata, akurasi sekitar 0,1 detik).
- `url, err = get_mount_file_url('/mnt/files/job/narasi.wav')` -> isi `job/audio.url`.
- Commit dalam SATU `GITHUB_COMMIT_MULTIPLE_FILES` ke branch `build` (`upserts`): `job/shots.js`, `job/meta.json` ({"title":"...","cover":{"t":1.5,"lines":["baris1","baris2"]}}, cover maksimal 2 baris pendek), `job/caps.json`, `job/caption.txt`, `job/timing.json`, `job/audio.url`, `selesai/<id>.txt`. Kirim isi file sebagai raw string Python. Catat SHA `reel-kt` sebelum commit (`git ls-remote https://github.com/thewhyfiles/kalau-ternyata-media refs/heads/reel-kt`).

## 6. Tunggu render
- Polling `git ls-remote` tiap 20 detik sampai SHA `reel-kt` berubah (normalnya 3-4 menit; batas tunggu 10 menit).
- Kalau tidak berubah: `GITHUB_LIST_WORKFLOW_RUNS_FOR_A_REPOSITORY` -> `GITHUB_LIST_JOBS_FOR_A_WORKFLOW_RUN` -> `GITHUB_DOWNLOAD_WORKFLOW_RUN_LOGS` (unduh zip di workbench, cetak ekor log langkah yang gagal saja). Perbaiki penyebabnya di spec lalu commit ulang sekali (ubah `job/rerun.txt` agar workflow terpicu). Kesalahan umum: `SHOTS is not defined` (lupa baris pertama), `wN` melewati jumlah kata, nama properti/pose tidak dikenal.

## 7. QC
- Unduh `https://raw.githubusercontent.com/thewhyfiles/kalau-ternyata-media/<sha-reel-kt>/reel.mp4` dan `cover.jpg` (HTTP 200).
- ffprobe: h264 1080x1920 30fps + aac 48 kHz, durasi sekitar suara + 0,6 detik. volumedetect: max sekitar -1 dB.
- Contact sheet (`ffmpeg -vf fps=1/3.1,scale=270:-1,tile=5x3`) dan lihat: tidak ada teks bertabrakan, caption terbaca, label muncul sesuai ucapan, tokoh tidak tertutup. Lihat juga cover.jpg. Bila ada cacat jelas, perbaiki spec lalu render ulang satu kali.

## 8. Kirim ke user
- `SendUserFile` mp4 (dan cover.jpg), lalu pesan singkat berbahasa Indonesia berisi judul, durasi, dan caption dalam code block (format: hook, 1-2 kalimat fakta dengan hedge, pertanyaan komentar, "Ikuti @kalauternyata untuk mitos dan fakta lainnya.", 5 hashtag; tanpa emoji; maksimal 400 karakter total).
- Kalau gagal total: kirim pesan singkat berisi penyebab, topik yang dikerjakan, dan apa yang sudah jadi.
