#!/usr/bin/env bash
# Build Neura "The Fold": render frames -> synthesize audio -> loudness-normalise -> mux.
# Needs: node + playwright (Chromium), python3 + numpy, ffmpeg with libx264 (pip install imageio-ffmpeg works).
set -euo pipefail
cd "$(dirname "$0")"
FF="${FFMPEG:-$(command -v ffmpeg || python3 -c 'import imageio_ffmpeg as i;print(i.get_ffmpeg_exe())')}"
[ "${SKIP_VIDEO:-0}" = 1 ] || FFMPEG="$FF" node render.js "${SUBFRAMES:-8}"
python3 audio.py
# spec §5: -14 LUFS integrated, -1 dBTP ceiling
I=$("$FF" -hide_banner -i out/audio_raw.wav -af ebur128 -f null - 2>&1 | awk '/^ +I:/{v=$2} END{print v}')
GAIN=$(python3 -c "print(round(-14.0-($I),2))")
"$FF" -hide_banner -loglevel error -y -i out/audio_raw.wav -af "volume=${GAIN}dB,alimiter=limit=0.89:attack=1:release=60:level=disabled" -ar 48000 out/audio.wav
"$FF" -hide_banner -loglevel error -y -i out/video.mp4 -i out/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart out/neura-the-fold.mp4
"$FF" -hide_banner -i out/audio.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^ +(I|Peak):"
echo "-> out/neura-the-fold.mp4"
