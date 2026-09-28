# Neura — "The Fold" · 24s Motion Graphic Explainer Spec

**Product:** Neura (tradeneura.com), adaptive trader intelligence
**Runtime:** 24.00s master (720 frames @ 30fps), plus a 15s cutdown (§8)
**Format:** 1080×1920, 9:16 master. 1:1 and 16:9 reframes are in §6.4
**Audio:** on-screen text and sound design only. No VO.

---

## 0. Working assumptions (answers to the brief's four questions)

The spec is locked to these defaults so it can go to production today. Each one has a single swap point.

| # | Question | Default used | Swap point |
|---|---|---|---|
| 1 | Real Aurex insight or placeholder? | **Representative placeholder** (the "Monday, after the first loss" pattern), written to Aurex card grammar. It is marked `PLACEHOLDER` wherever it appears. | Replace the copy in §2 S7 and §3.4. The fold math in §6.3 must be re-seeded so the column the film reveals is the same condition the card names. |
| 2 | 9:16 only, or other ratios too? | **9:16 master.** Every shot is also composed so 1:1 and 16:9 can be reframed from the same 3D/AE scene without re-animating (§6.4). | None needed. The reframes are a render setting. |
| 3 | VO budget? | **None.** Faceless and text-led, matching Neura's TikTok content. All meaning is carried by on-screen type plus sound. | If VO is added later, the text beats become lower-thirds and the pacing holds, because every beat already sits on a bar line. |
| 4 | Music? | **Licensed library track at 120 BPM**, 4/4, sparse (a sub pulse, a muted pluck, a glass pad). 1 beat = 15 frames, 1 bar = 60 frames = 2.00s. All cut points sit on beats. | For a specific track, re-time the eight shot boundaries to its bar lines. Shot internals are spring-driven and stretch cleanly within ±8%. |

---

## 1. Creative concept (one sentence)

**A trader's whole history is one unbroken thread of light; Neura winds that thread at the trader's own rhythm until losses that looked random stack up into a single column, and on the next turn the thread sees the column coming.**

Why this metaphor and not another:

- **Memory = continuity.** The thread never breaks between sessions. That is the literal visual opposite of "starts blank every session".
- **Pattern = epoch folding.** Wrapping a time series around a cylinder at its true period is how astronomers find a pulsar's rhythm in noise. It is a real analytical technique, not decoration. It shows *why* a trader can't see the pattern from inside, because a straight line hides periodicity, and it never shows price. Neura folds the *trader*, not the ticker.
- **Transformation = foresight, not a wall.** The next turn of the helix approaches the column, and the path ahead lights up. Nothing blocks the thread. It changes its own behavior because it can see where it is going.
- There is no brain, no neuron, no particle cloud and no candlestick anywhere in the film.

---

## 2. Shot list

Timecode format is `SS:FF` at 30fps. `f` = absolute frame number. There are eight shots in one continuous camera move with **no hard cuts**. Every "shot" boundary is a change of state within the same scene, which is what makes it read as one idea.

**Global rules for every shot**
- Camera: one virtual camera in a single 3D scene (C4D or equivalent). It moves from orthographic to 35mm-equivalent perspective at S4 and back to orthographic at S7.
- Every animated value is a **spring** (closed-form damped step response), never a bezier ease. Default is stiffness 170, damping 26, mass 1 (critically damped, <2% overshoot). Named exceptions are listed per shot.
- **The thread**: a single spline, 1.5px core width at 1080w, `#F2F1EC` at 90% opacity, plus a 6px additive glow at 12% opacity. The **head** (the present moment) is a 5px disc of `#F2F1EC` with a 24px falloff halo at 20%.
- **Knots** are trades: a 7px disc sitting on the thread with a 1px ring 4px outside it. The fill encodes the outcome: `#3DDC97` gain, `#FF6B5E` loss, `#6E6C67` scratch/breakeven. Knot diameter scales with |P&L| in 3 sizes (5/7/10px) and never goes above 10px.

---

### S1 · Memory, the first stroke · `00:00–02:00` (f0–59)

**On screen:** Pure `#0A0908`. At f6 the thread head fades up at x=180, y=960 (frame-left third) over 4 frames. At f10 it starts travelling right and draws the thread behind it. It lays down 6 knots before f59: grey, green, green, red, green, grey.
**Text (enters f12, exits f64, 1.7s):** `Every trade you've ever taken.` Centered at y=1260.
**Camera:** Locked orthographic, with a 2% scale push over the full shot (spring, stiffness 40, damping 20, which is a slow settle, not a zoom).
**Technique (what makes it non-generic):** The head's speed is driven by the data, not by a linear trim path. It **decelerates into each knot and re-accelerates out**: speed drops to 15% for 3 frames at each knot, springing back at stiffness 300. The line moves like a pen pausing on each trade, closer to handwriting than to a loading bar. Knots scale from 0 → 100% with 8% overshoot (stiffness 400, damping 18) the frame the head passes. The ring then expands from 4px → 9px while fading to 0 over 10 frames, like a single ripple. There is no ambient particle motion of any kind.

### S2 · Memory, the thread doesn't break · `02:00–04:00` (f60–119)

**On screen:** At f60 the camera pulls back hard. The orthographic scale goes 1.0 → 0.06 with a 10% overshoot spring (stiffness 120, damping 14). The thread turns out to be enormous: **60 sessions and ~380 knots** laid out across the frame in a gentle left-to-right S-curve (so it fits 9:16). The spline forms 3 horizontal passes, joined by 180° turns at the frame edges. Between sessions the thread **dims to 35% opacity for a 24px stretch but never breaks**. At three of these gaps a mono label flicks on for 8 frames: `SESSION 18 → 19`, `SESSION 41 → 42`, `SESSION 59 → 60`.
**Text (enters f70, exits f130, 2.0s):** `Neura keeps every session.` Line 2, muted: `Nothing resets.`
**Camera:** Orthographic, pulled back. At the end of the shot it drifts 40px upward so it sits over the lowest pass.
**Technique:** The session gaps are the whole argument. A generic animator would draw 60 separate segments. Here the dimmed-but-continuous gap reads as "overnight, still remembered", which is the visual translation of "doesn't start blank". The session labels are the only UI-like element in the first third, and they are type, not a dashboard.

### S3 · Pattern, from inside it looks random · `04:00–06:00` (f120–179)

**On screen:** The camera pushes back in (scale 0.06 → 0.35, stiffness 90, damping 22) onto the lowest pass and tracks the head left → right. All non-red knots dim to 25% opacity over 8 frames. The **9 large red knots** in view stay at 100%. Between consecutive red knots, thin `#8A8880` measurement brackets draw in, each with a Geist Mono gap label: `3d`, `11d`, `6d`, `7d`, `14d`, `7d`, `2d`, `7d`. The spacing looks irregular, and the brackets prove it.
**Text (enters f132, exits f184, 1.7s):** `From inside,` / `losses look random.`
**Camera:** Orthographic truck (lateral track) at a constant 0.6 knots per beat.
**Technique:** Bloomberg-style instrumentation. The brackets draw as a precise hairline: the left tick, then the span, then the right tick, each 3 frames, using a stroke draw rather than an opacity fade. The honesty of the brackets is what sets up the payoff. The viewer is shown hard evidence that the spacing is irregular, so the fold in S4 feels like a discovery, not a trick.

### S4 · Pattern, the fold · `06:00–10:00` (f180–299) · THE HERO SHOT

**On screen:**
1. **f180–209: lift.** The thread peels off the 2D plane. The camera cross-blends from orthographic to a 35mm-equivalent perspective lens (FOV spring over 30 frames) and orbits 28° around the Y axis. The flat thread starts wrapping around an **invisible vertical cylinder** (radius 300px, axis at frame center) into a helix. It winds from the oldest end, so the helix builds bottom-up like thread spooling onto a bobbin.
2. **f210–261: tuning.** The helix first winds at the **wrong period, P = 6.2 days per turn**. The red knots land on a diagonal smear around the cylinder. A Geist Mono readout at upper-right (y=380) shows `PERIOD  6.2d`. Then P springs toward 7.0 (stiffness 60, damping 12, slightly underdamped). As P changes, **every knot slides along the helix at the same time**, because each knot's angle is recomputed from its timestamp (§6.3). The diagonal twists and tightens. The readout odometers 6.2 → 6.6 → 6.9 → 7.0.
3. **f262–269: held breath.** Everything freezes for 8 frames. Audio drops to silence (§5).
4. **f270 (09:00): the snap.** P locks to 7.000. The red knots from Mondays **stack into one perfectly vertical column** on the cylinder's front face. The column's knots scale to 115% and settle to 100% (stiffness 500, damping 20). A single-frame `#FF6B5E` 2px vertical hairline flashes through the column at 100%, then decays to 30% over 12 frames.
5. **f271–299:** The camera settles its orbit to 12°, so the column sits at frame center.

**Text:** None during the fold. The image carries it. At f276: `They aren't.` in Geist 600, 88px, centered at y=1500. It exits at f318.
**Critical honesty detail:** **2 of the 9 red knots do *not* join the column.** They stay scattered on other faces of the helix. A perfect 9/9 would read as fake. A 7/9 column with 2 strays reads as real data, and it's the same ratio the insight card will cite.
**Technique:** This is epoch folding, a real period-search method, rendered procedurally. It cannot be faked with a morph: the knots must be positioned by the formula in §6.3, or the slide during tuning will look wrong (knots will cross each other). The tuning overshoot (6.9 → 7.0 settling) is the "dial finding the signal" moment. The readout, not a lens flare, is what tells the viewer something was found.

### S5 · Pattern, naming the condition · `10:00–12:00` (f300–359)

**On screen:** The camera eases to a near-frontal view (orbit 12° → 4°). A `#F0B958` horizontal hairline **scans upward along the red column** (f300–318, spring). As it passes each knot, the knot's session date prints beside it in `#8A8880` mono: `MON 03·03`, `MON 03·10`, `MON 03·24` … The field scaffold (the ` · ` separators) prints first and the values drop in afterwards (§3.3). At f320 the condition label resolves beside the top of the column in a 2px `#F0B958` bracket:
```
MON · 09:30–10:15 ET · AFTER FIRST LOSS
```
**Text (enters f324, exits f394, 2.3s, running into S6):** `Same day. Same hour.` / `Same first loss.`
**Camera:** Near-frontal, with a slow 3% push.
**Technique:** The gold scan is the only use of amber as *light* in the film so far. It means "Neura attention", and it recurs in S6 with the same meaning. The condition is about **the trader's state** (after first loss), not the market's, which keeps the film on the right side of "understands the trader, not the ticker".

### S6 · Transformation, the next turn · `12:00–16:00` (f360–479)

**On screen:** The camera rises 20° and looks slightly down the helix, so the newest turn of thread is in the foreground. The head is **live again**. It resumes drawing the next turn (the next week) from the back of the cylinder and travels toward the front face where the red column sits.
- **f360–404:** The head travels at normal speed, laying 3 ordinary knots.
- **f405 (13:15):** When the head is 40° of arc away from the column, the helix path *ahead of the head* lights up in `#F0B958`: a 40° arc segment at 60% opacity, drawn from the column back toward the head (it draws **backwards**, from the future to the present). This is "seeing it coming". No wall, gate, lock, shield or barrier appears.
- **f405–449:** The head **slows down on its own** (speed spring to 30%, stiffness 80). The thread's stroke also thins from 1.5px to 1.1px and steadies, meaning less size and less haste. Over 20 frames the amber arc cools from `#F0B958` to `#F2F1EC`.
- **f450 (15:00): the landing.** The head crosses the column's angle and drops a knot **in the column's position**. The knot appears grey (`#6E6C67`), holds 4 frames, and then fills `#3DDC97` from the center outward (radial wipe, 6 frames). It is a *small* gain, 5px, because a small win reads as true and a huge one would read as a promise. The red column above it stays: history is not erased. The column is simply broken for the first time.
**Text (enters f412, exits f474, 2.1s):** `Next Monday,` / `you see it coming.`
**Technique:** The backwards-drawn amber arc is the core idea of the film, "operates in the moment a trader is about to repeat themselves", turned into one mechanic. The change in the thread's own properties (speed, stroke width) shows behavior changing from the inside instead of a rule being enforced from outside.

### S7 · Proof, abstraction resolves into product · `16:00–20:00` (f480–599)

**On screen:** The helix **unwinds**: the fold runs in reverse, P → ∞, so the helix straightens. The camera spring-blends back to orthographic. The thread lays flat as a **horizontal trade timeline** across the upper third, y=520. The knots become timeline ticks: each disc morphs into a 2×14px vertical tick, keeping its color. The thread becomes the timeline's axis rule (`#2A2926`, 1px) with sparse date labels in `#6E6C67` mono.
- **f480–519:** Unwind, flatten, tick morph. The UI chrome builds in: a 1px `#1C1B19` panel border, 16px corner radius, and the header row `TRADE TIMELINE · NQ · LAST 12 WEEKS` in mono `#8A8880`.
- **f520–559: column → card.** The red column's bounding rectangle, still on screen as a faint 1px `#FF6B5E` outline from S6, **is the card**. As one continuous shape, it springs from 14×600px (vertical) to 920×460px, centered at y=1060. The width, height, corner radius (0 → 20px) and fill (transparent → `#141312`) are each separate springs, staggered by 3 frames. Nothing fades in.
  **Aurex insight card, `PLACEHOLDER` copy:**
  ```
  ◆ AUREX · PATTERN                                  7 of 9
  Your largest losses start after a losing first trade on Monday.
  In the 45 minutes that follow, your next entry averages 1.8× planned size.
  ─────────────────────────────────────────────
  Last seen: Mon 06·09   ·   Next session: Mon 06·16
  ```
  `◆` and `AUREX · PATTERN` in `#FF7A5C`. `7 of 9` in `#F0B958` mono, set large at 40px. Body in `#F2F1EC`. The footer is in `#6E6C67`.
- **f560–599: Control Room proof (discipline appears late, as proof only).** Below the card a single row slides out of the card's bottom edge (a clip-path reveal from the card's own edge, as if it were a drawer within the same object):
  ```
  CONTROL ROOM   Size after first loss (Mon)     1.0×   [set by you]
  ```
  `1.0×` odometers down from `1.8×` over 12 frames. `[set by you]` is `#8A8880`. The trader owns the parameter; Neura only surfaced why it matters.
**Text:** None added. The UI is the text.
**Technique:** **No crossfade into UI.** Every UI element is the continuation of an abstract element: thread → axis, knots → ticks, column → card. This is the hardest shot to art-direct and the one that makes "abstraction becomes proof" literal.

### S8 · Close · `20:00–24:00` (f600–719)

**On screen:**
- **f600–629:** The UI dims to 0% as a *collapse, not a fade*. The panels' heights spring to 0 around their center lines, which leaves one horizontal hairline at y=1060, and that line **is the thread again**. The head sits at its right end, pulsing (halo 20% ↔ 35%, 1 cycle per beat, i.e. 15 frames).
- **f630–689:** The master line, in two parts:
  `The market already has intelligence.` enters f630, set in `#8A8880`.
  `Now the trader does too.` enters f660, set in `#F2F1EC`. It is written *by the thread*: the head travels left → right along the baseline and the glyphs rise out of the line behind it (§3.2).
- **f690–719:** The master line holds. The wordmark `NEURA` (Geist 600, 44px, tracking +0.24em, `#F2F1EC`) prints under the hairline at y=1320, with `tradeneura.com` below in `#6E6C67` mono 24px. The head keeps pulsing on the last frame, in the present tense.
**Technique:** The film opens and closes on the same object, a single point of light on a thread. The loop point (f719 → f0) is seamless for autoplay feeds, because both ends are the head on near-black.

---

## 3. Typography and motion-type spec

### 3.1 Typefaces
| Role | Face | Weight | Size @1080w | Tracking | Color |
|---|---|---|---|---|---|
| Statements | **Geist** (Vercel, OFL; already in `skills/motion-broll/engine/fonts/`) | 500 | 64px, line-height 1.12 | −0.02em | `#F2F1EC` |
| Punch line (`They aren't.`) | Geist | 600 | 88px | −0.035em | `#F2F1EC` |
| Secondary line | Geist | 500 | 64px | −0.02em | `#8A8880` |
| Data / labels / readouts | **Geist Mono** | 500 | 26–28px, uppercase | +0.04em | `#8A8880` (values `#F2F1EC`, key numbers `#F0B958`) |
| Wordmark | Geist | 600 | 44px | +0.24em | `#F2F1EC` |

Licensed alternative, if the brand already owns it: **Söhne / Söhne Mono** with the same weights. Do not substitute Inter, SF Pro or Montserrat.

**Layout:** The max line length is 880px (a 100px margin each side). Statements sit on a fixed baseline grid, first baseline at y=1260 in S1–S3 and y=1500 in S4–S6. Everything sits inside the 9:16 safe area (§6.2). Text is always center-aligned; the product UI is left-aligned inside its panels.

### 3.2 Entry mechanic: "thread-write" (all statements)
1. A 1.5px `#F2F1EC` baseline rule draws left → right under the line's full width in 8 frames. It is a spring on stroke end, not linear.
2. Glyphs **rise out of the baseline**. Each glyph has a bottom-anchored clip mask that opens upward over 8 frames, and the glyph translates y from +0.18em to 0 (stiffness 170, damping 26). The stagger is 1.2 frames per glyph, left → right, synced to the moving tip of the baseline rule. A glyph never appears ahead of the line.
3. When the last glyph lands, the baseline rule retracts to 0% opacity over 6 frames, *leaving the type standing on nothing*.

There is never an opacity fade on glyphs, and no slide-in, blur-in or scale-pop.

### 3.3 Entry mechanic: "scaffold print" (mono labels and data)
1. The separators (` · `, `→`, bracket ticks) cut on first in `#6E6C67`, all on the same frame.
2. The field values then cut on **left to right, one field per 2 frames**. Each field arrives whole, with no per-character typing and no scramble/decode effect.
3. **Numbers never cut. They odometer.** Each digit column rolls independently on a spring (stiffness 220, damping 24). Columns are staggered by 1 frame, right to left, so the least significant digit settles last.

### 3.4 Exit mechanic: "reabsorb"
Over 6 frames: tracking tightens by −0.04em relative to its resting value, while each glyph's clip mask closes **top-down** into the baseline. The baseline rule reappears at 100% for the last 3 frames and then retracts to a point at the line's center. **Exception:** the S8 master line and wordmark never exit.

### 3.5 Text timing rule
On-screen hold ≥ 0.28s per word, plus a 0.3s floor (short, large, high-contrast type on a silent-autoplay feed). Every statement in §2 meets this. Text may run past a shot boundary, because there are no cuts. Do not shorten holds in the edit without re-checking.

---

## 4. Color and lighting per shot

Global palette, exact values only: BG `#0A0908` → `#101010`, primary `#FF7A5C`, amber `#F0B958`, gain `#3DDC97` / `#4FE3A8`, loss `#FF6B5E`, text `#F2F1EC`, muted `#8A8880` / `#6E6C67`. Two derived neutrals for UI structure only: `#141312` (card fill) and `#1C1B19` / `#2A2926` (borders and rules). **No blue, purple or teal**, including in glows, grade or grain.

**Lighting model:** There are no scene lights. The thread, head and knots are self-emissive, and "lighting" is additive glow only. Background: a radial gradient from `#101010` at frame center to `#0A0908` at the corners, locked for the whole film. Grain: monochrome, 3% intensity, 1.2px size, re-seeded every 2 frames. It exists so the gradients don't band on phone screens. There are no lens flares, no chromatic aberration and no light leaks.

| Shot | Dominant color | Accent | Lighting / glow notes |
|---|---|---|---|
| S1 | `#F2F1EC` thread on `#0A0908` | knot fills | The head's halo is the brightest thing on screen (20%). Knot rings glow at 8%. |
| S2 | `#F2F1EC` at 90% (35% in gaps) | mono labels `#8A8880` | The glow scales with the camera so the pulled-back thread doesn't turn to mush. Glow radius is fixed in screen space at 4px. |
| S3 | `#FF6B5E` (red knots) against a 25% grey field | brackets `#8A8880` | The red knots get a 10px glow at 18%. They are the only glowing objects in the shot. |
| S4 | `#F2F1EC` helix | `#FF6B5E` column | Depth cue: the back half of the helix is at 30% opacity and the front half at 100% (no fog color). The snap flash at f270 is the single brightest red frame in the film. |
| S5 | `#FF6B5E` column at 30% | `#F0B958` scan and bracket | This is the first amber light. The scan line is 2px with a 16px glow at 25%. |
| S6 | `#F2F1EC` present thread | `#F0B958` foresight arc → `#3DDC97` landing | The amber arc is the brightest non-white element. The green knot gets a 12px glow at 25% for 10 frames, then settles at 12%. |
| S7 | UI neutrals `#141312` / `#1C1B19` | `#FF7A5C` Aurex label, `#F0B958` `7 of 9`, red/green ticks | Glow is off for all UI. Flat, precise, Linear-grade. The only glow left is on the timeline's newest green tick (8%). |
| S8 | `#0A0908` | `#F2F1EC` head, then text | The head's pulse is the only motion. The film ends on its warmest-white frame. |

`#FF7A5C` (primary orange) is **reserved for the brand**: the Aurex label in S7 and nothing else before it. Held back that long, its first appearance feels like the product arriving.

---

## 5. Sound design beat sheet

The music bed is a library track at 120 BPM (1 beat = 15f). SFX are designed, not stock: every sound comes from **one family of close-miked, dry, real-object recordings** (fine pen on paper, a tuning fork, a watch escapement, a glass rim) layered with sine sub. There are **no whoosh samples, riser packs or glitch hits.**

| Frame (TC) | Event | Sound |
|---|---|---|
| f0–5 | Black | **True silence** (−∞ dB), so the first sound is heard on its own. |
| f6 (00:06) | Head appears | Soft sine tone at 880Hz, 40ms attack, −24 dB, which is barely there. |
| f10–59 | Thread draws | Continuous nib-on-paper texture, very quiet (−30 dB), pitched to the head's speed so it slows audibly at each knot. |
| each knot | Knot lands | Green: glass tick, high (~2.4kHz body). Red: the same tick pitched down a minor 6th and slightly detuned. Grey: a dry paper click. Each −18 dB. |
| f60 (02:00) | Pull-back | Music enters on the downbeat: sub pulse on beats 1 and 3. An air-pressure swell (filtered room tone opening from 200Hz to 4kHz) tracks the scale spring, including its overshoot. |
| f72–119 | Session labels | A watch-escapement tick on each label flick (3×). |
| f120 (04:00) | Push-in to losses | The muted pluck enters on offbeats. All green/grey knot sounds duck −12 dB, so the red ticks are louder: the mix *is* the dimming. |
| f120–179 | Brackets draw | A pencil-scratch micro-sound (60ms) per bracket, panned to its screen x position. |
| f180 (06:00) | Lift / fold begins | Music drops to sub only. A low sustained tone enters (tuning-fork hum, 110Hz) and slowly shifts in pitch **with the period value**: it is detuned by up to 40 cents at P = 6.2 and converges to pure pitch at 7.0. The audience literally hears the signal come into tune. |
| f210–261 | Tuning | The odometer digits each make a tiny mechanical detent click. |
| **f262–269** | **Held breath** | **Full silence, 8 frames.** Every element cuts, music included. |
| **f270 (09:00)** | **Snap** | **The hit of the film:** a struck tuning fork (A2, pure) + a sine sub at 55Hz (−6 dB, 400ms decay) + one glass tick per column knot in a 30ms roll, bottom to top. |
| f276 | `They aren't.` | No sound. It lands in the tail of the snap. |
| f300 (10:00) | Gold scan | Music returns fuller: pluck, pad, sub. The scan has a rising glass-rim tone that follows the scan line's y position. |
| f320 | Condition label | A three-part escapement tick, one per field group. |
| f360 (12:00) | Next turn | Music thins to pad plus a sub pulse at **half tempo** (every bar), a slower heartbeat. The nib texture returns. |
| f405 (13:15) | Amber arc (foresight) | A soft **reverse** glass swell, 20 frames long, played backwards because the arc draws backwards from the future. Mixed at −20 dB. It should feel like realization, not alarm. |
| f405–449 | Head slows | The nib texture slows and drops in pitch with the head's speed. The sub pulse holds. |
| **f450 (15:00)** | **Green knot lands** | The glass tick sequence for red, green, **resolving**: the red tick's detuned pitch followed by the green tick a major 3rd above, 4 frames apart (matching the 4-frame grey hold). Then 1 beat of near-silence, pad only. |
| f480 (16:00) | Unwind to UI | Music: full groove for the first time (kick on 1 and 3, pluck, pad). The unwind is an air-pressure swell in reverse. |
| f480–519 | Ticks and chrome | A soft keyboard-switch click per UI element group (5 total), quantized to 16th notes. |
| f520–559 | Column → card | One low **felt thump** (−10 dB) when the card reaches full size. No whoosh. |
| f560–599 | Control Room row | A drawer-slide texture (10 frames). The `1.8× → 1.0×` odometer uses the same detent clicks as S4, which ties the proof back to the discovery. |
| f600 (20:00) | Collapse to thread | Music cuts to pad only on the downbeat. |
| f630 | Master line, part 1 | Nothing added. Pad only. |
| f660 | `Now the trader does too.` | The nib texture writes the line (thread-write). |
| f690 (23:00) | Wordmark | A single low piano-felt note (A1) with a long 1.5s tail. |
| f719 | Last frame | The pad tail reaches −40 dB. The head's pulse has no sound. For feed looping, the tail must reach silence so f0's silence is seamless. |

**Mix targets:** −14 LUFS integrated (TikTok/Reels/X normalization), −1 dBTP ceiling. SFX sit 3–6 dB above the music at hits. The mix is mono-compatible because a lot of phones play in mono.

---

## 6. Technical production notes

### 6.1 Delivery
- **Frame rate:** 30fps (native to TikTok, Reels and X; 120 BPM divides into whole frames: 15 per beat).
- **Master:** 1080×1920, ProRes 4444 intermediate, then H.264 High, 16–20 Mbps VBR, BT.709, AAC 320kbps. A 2160×3840 render is recommended if the pipeline allows, then downscaled, because the 1.5px thread aliases at 1× without supersampling.
- **Motion blur:** 180° shutter, ≥8 sub-samples. The thread head and knot overshoots must blur; the UI in S7 is rendered with blur, but springs are tuned so it barely shows.
- **Color:** Author in sRGB/Rec.709, with no grade LUT. Hex values are final display values, so verify them with a picker on the exported file.

### 6.2 Safe areas (9:16)
Keep all text and the key action inside **x 100–940, y 260–1560**. This avoids the TikTok/Reels top UI (≈0–220), the right-rail buttons (≈940–1080) and the caption/CTA zone (≈1560–1920). The S4 column and S7 card are centered at x=540.

### 6.3 The fold math (required for S4, S6, S7)
Seed a deterministic trade history. **Every knot's position must come from this formula**, never be keyframed by hand:

```
t_i      = trade timestamp in days since first trade (float)
P(f)     = period in days per turn (animated: 6.2 → 7.0 spring; ∞ during S7 unwind)
θ_i      = 2π · ((t_i − t_anchor) mod P) / P       # t_anchor = a Monday 09:30 ET, so Monday aligns to θ = 0 (front face)
y_i      = −k · t_i / P                             # helix rises one pitch per turn; k = 90px at 1080w
x_i, z_i = R·sin θ_i, R·cos θ_i                     # R = 300px
Unwind (S7): blend (x,y,z) → (timeline_x(t_i), 520, 0) on one spring as P → ∞
```

**Dataset seed:** 60 sessions over 12 weeks (5 per week, Mon–Fri), about 380 trades. There are 9 "large losses". **7** fall on Mondays within 45 min of a losing first trade (θ within ±2° of 0 at P = 7), and **2** fall on a Wednesday and a Friday afternoon. Add ±1.5° of jitter to column knots so the column reads as data, not a ruler. The "next Monday" trade in S6 lands at θ = 0 as a small gain. The card in S7 (`7 of 9`) and the S5 label must match this seed exactly.

### 6.4 Reframes
- **1:1 (1080×1080):** Same scene, same camera, with a crop window centered on y=960. The S2 layout switches from 3 passes to 2 (re-seed the spline turns). The card in S7 scales to 86%.
- **16:9 (1920×1080):** Camera distance ×0.72. The S2 thread becomes a single long horizontal pass. The S7 timeline widens to the full frame and the card sits to its right instead of below it. Statements move to lower-third baseline y=900.

### 6.5 Per-shot pipeline

The honest recommendation: **this film is ~90% procedural.** Current AI video models (Runway, Kling, Veo) cannot hold exact knot positions, exact hex values, legible mono type, or a data-driven fold across 720 frames. Using them for hero shots would break the "precision" the concept depends on. AI video's role here is previs and texture only.

| Shot | Best pipeline | One-line reason |
|---|---|---|
| S1 | **Procedural:** AE (shape layers + expressions) or the repo's HTML spring engine (`skills/motion-broll/engine/motion.js`) | Data-driven head speed and knot timing need expressions, not keyframes. |
| S2 | **Procedural:** C4D (spline + MoGraph Cloner on spline) → AE comp | 380 knots on one continuous spline, with a camera move that has to stay pixel-crisp. |
| S3 | **Procedural:** AE | Hairline brackets and mono labels must be vector-sharp and exact. |
| S4 | **Procedural 3D:** C4D + Python/XPresso effector, or Houdini (VEX) | Knots must be placed by the fold formula every frame. No model or morph can fake the tuning slide. |
| S5 | **Hybrid:** C4D render + AE type/scan overlay | 3D column from S4, 2D precision type layered on top. |
| S6 | **Procedural 3D:** C4D (same scene), AE for type | The backwards-drawing arc and speed-linked stroke width are driven by parameters. |
| S7 | **Procedural:** AE (UI built from Figma vectors), with a C4D pass for the unwind | UI must be pixel-true to the product. Shape-continuity morphs need matched layer geometry. |
| S8 | **Procedural:** AE, or the HTML engine | Pure type and a single line. Deterministic, and the loop point must match f0. |
| Previs only | **AI video (Veo / Kling)** | Use for a 1-day mood test of the helix and light quality before committing C4D time (prompts in Appendix A). Never in the final. |
| Texture only | **Optional AI or plate** | Film-grain plate. Procedural grain is preferred for determinism. |

---

## 7. Why a $10k freelancer wouldn't produce this

A capable generalist given "fintech AI explainer, dark mode, orange" will build data particles converging into a glowing brain, a candlestick chart for the background, a dashboard for the reveal and a lockout screen for the payoff. Every one of those violates Neura's positioning: they imply market prediction, lean on the on-the-nose neural metaphor, or open on discipline. This spec depends on things that need both motion craft and the positioning doctrine at once. **The central metaphor is a real analytical method** (epoch folding), so the pattern reveal is a truthful picture of how the insight is found, and it only works if the knots are positioned by a formula, which a keyframe-and-morph workflow can't do. **The honesty details were chosen, not defaulted to**: 2 stray knots that refuse to join the column, a small green win instead of a big one, the red history left visible after the transformation, and a card that says `7 of 9`. Each keeps the film on the right side of "surfaces what you can't see" and away from "guarantees profitability". **Transformation happens without a wall**: behavior change is shown as the thread changing its own speed and stroke width while a foresight arc draws backwards from the future. That mechanic has to be invented from the phrase "the moment a trader is about to repeat themselves"; it can't be found in a template. **There are no crossfades into UI**: thread becomes axis, knots become ticks, column becomes card, which requires planning shot 1's geometry around shot 7's layout. **The sound is designed from the same idea as the image**: a tuning-fork drone that literally comes into tune as the period converges, 8 frames of true silence before the snap, and a reversed swell for a backward-drawn arc. Finally, the spec holds back restraint as a resource: primary orange is reserved for the brand's first appearance at 16 seconds, which is the kind of decision that only comes from knowing why the brand looks the way it does.

---

## 8. 15s cutdown (450 frames)

Same scene and same music, re-edited on bar lines:
S1 (f0–44, 1.5s, text `Every trade you've ever taken.` f8–f58) → S2 compressed (f45–89, no session labels, text `Neura keeps every session.` held to f95) → S4 from the lift, tuning shortened to 1.5 bars, snap at f165 (`They aren't.`) → S6 compressed so the amber arc starts at f210 and the green knot lands f255 (`Next Monday, you see it coming.`) → S7 card only, no Control Room row (f270–374) → S8 with the master line only, `Now the trader does too.` written by the thread, wordmark at f420. S3 and S5 are cut; the S4 readout and the card's `7 of 9` carry the evidence instead.

---

## 9. Positioning guardrails (QA checklist before delivery)

- [ ] No on-screen use of: *AI operating system, coach, partner, copilot, second brain, all-in-one, discipline tool, lockout, AI journal.*
- [ ] No price chart, candlestick, ticker tape or market data anywhere. The only data is **the trader's own trades**.
- [ ] Nothing implies prediction of the market or guaranteed profit. The S6 win is small, and the red history stays.
- [ ] Discipline (Control Room) appears only in S7's second half, as a parameter **the trader set**.
- [ ] The master line appears once, at the close.
- [ ] No brain, neuron, synapse, particle cloud, lens flare or glitch transition.
- [ ] Every hex on screen is from §4. There are no blues, purples or teals, including in the grain and in compression artifacts. Check the exported H.264, not just the comp.
- [ ] The placeholder Aurex copy is either approved as representative or replaced, and the §6.3 seed is re-matched to it.

---

## Appendix A · AI video previs prompts (mood tests only)

Use these to test light quality and the helix silhouette before building S4 in C4D. They are **not** for final frames.

**A1: Thread (S1/S2 mood)**
> Vertical 9:16, 5 seconds. Pure near-black background (#0A0908). A single hair-thin line of warm white light (#F2F1EC) draws itself slowly left to right across the frame, pausing briefly at small colored dots it leaves behind: soft green, coral red, warm grey. The camera then pulls back smoothly to reveal the line is very long, snaking across the frame in three horizontal passes, never breaking. Minimal, precise, Apple product-film restraint. No particles, no lens flares, no blue tones, no text.

**A2: The fold (S4 mood)**
> Vertical 9:16, 5 seconds. Near-black background. A thin continuous thread of warm white light lifts off a flat surface and spools into a clean vertical helix around an invisible cylinder, like thread winding onto a bobbin, seen from a slow 3/4 orbit. Small coral-red dots on the thread drift around the helix, then suddenly align into one perfectly vertical column on the front face. Crisp, mathematical, calm. Self-illuminated only, soft additive glow, no fog, no particles, no blue or purple.

**A3: Foresight (S6 mood)**
> Vertical 9:16, 4 seconds. Close on the top turn of a glowing white helix on near-black. A bright point of light travels along the thread toward a vertical column of coral-red dots. Ahead of the point, a short arc of the thread lights up warm amber (#F0B958), as if illuminated from the future. The point slows, passes the column, and leaves a small soft-green dot where a red one would have been. Quiet, deliberate, restrained.
