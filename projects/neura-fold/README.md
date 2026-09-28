# Neura: "The Fold" (24s, 9:16)

The produced film for [`specs/neura-explainer/SPEC.md`](../../specs/neura-explainer/SPEC.md).

**Output:** `out/neura-the-fold.mp4` is 1080×1920, 30fps, H.264 with AAC stereo at −14 LUFS and −1 dBTP.

Everything is procedural. `film.js` draws each frame as a pure function of time on a single canvas. The helix fold is real epoch folding: every knot's position comes from the §6.3 formula, and nothing is keyframed. `audio.py` synthesizes the sound design and a placeholder music bed from the same event timings the picture uses, so the audio and picture are synced to the frame.

## Build

```
pip install numpy imageio-ffmpeg          # ffmpeg with libx264, if you don't have one
./make.sh                                 # ~12 min render on a laptop-class CPU, then audio + mux
SKIP_VIDEO=1 ./make.sh                    # re-do audio only
SUBFRAMES=4 ./make.sh                     # faster render, lighter motion blur
```

To preview in a browser, open `film.html`, which loops the film. To grab stills, run `node stills.js 270 450 545`, which writes `out/stills/f270.png` and so on.

| File | What it does |
|---|---|
| `film.js` | Data seed, flat layout, helix fold, timeline, text mechanics (thread-write, scaffold print, odometer), all 8 shots |
| `render.js` | Headless Chromium. 8 sub-frames over a 180° shutter are averaged in the page and piped as raw RGB to ffmpeg. It also writes `out/events.json`. |
| `audio.py` | Knot ticks, nib texture following head speed, tuning-fork drone detuned by the live period value, the snap, reverse swell, UI clicks, felt note, and a 120 BPM bed |
| `make.sh` | Render → audio → loudness → mux |

## Where the film departs from the spec (and why)

- **S2:** The head *races* through 12 weeks during the pull-back, rather than revealing a thread that already exists. The thread is always drawn by the present moment, which keeps "memory" active rather than static.
- **S3:** The camera pushes 8%, not to 0.35×. At 0.35× the nine large losses (spread over 12 weeks) can't all be in frame, and the brackets need all nine visible to prove the spacing is irregular. The brackets follow the path, turns included.
- **Knot sizes are 1.4× the spec** (7/10/14px) so they read on a phone. The landing knot is 7px, not 5px.
- **Aurex card copy is the spec's placeholder**, with one change: the footer reads `LAST REPEAT · MON 05·11` / `MON 05·25 · HELD AT PLAN` to match the seeded data. Swap in a real insight in `film.js` (search `AUREX`), then re-seed `BIG_MONDAYS` so the fold reveals the same condition.
- **Music:** the 120 BPM bed (sub pulse, muted pluck, A-minor pad) is synthesized as a placeholder for the licensed library track. Every cut sits on the 120 BPM grid, so a real track at that tempo drops in by replacing the bed section in `audio.py`.
- **Not rendered yet:** the 15s cutdown (§8), and the 1:1 and 16:9 reframes (§6.4).
