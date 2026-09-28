"""Sound design + music bed for Neura "The Fold" (spec §5), synthesised from scratch.
Reads out/events.json (knot pops, P curve, head speed) written by render.js; writes out/audio.wav (48k stereo).
One sound family: glass ticks, a tuning fork, nib-on-paper noise, escapement clicks, felt. No whoosh samples.
120 BPM: 1 beat = 15 frames = 0.5 s."""
import json, os, numpy as np

SR, DUR, FPS = 48000, 24.0, 30
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'out', 'events.json')))
rng = np.random.default_rng(7)
L = np.zeros(N); Rt = np.zeros(N)
fr = lambda f: f / FPS
db = lambda d: 10 ** (d / 20)
tt = lambda n: np.arange(n) / SR

def add(sig, t0, gain_db=0.0, pan=0.0):
    i = int(round(t0 * SR));
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[: N - i] * db(gain_db)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * l * np.sqrt(2); Rt[i:i + len(sig)] += sig * r * np.sqrt(2)

def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, len(x))

def noise(sec, lo=None, hi=None): return fft_filter(rng.standard_normal(int(sec * SR)), lo, hi)

# ── instruments ──────────────────────────────────────────────
def glass(f, dec=0.07, dur=0.35, detune=0.0):
    t = tt(int(dur * SR)); s = np.zeros_like(t)
    for k, a, d in [(1, 1, 1), (2.76, 0.45, 0.6), (5.40, 0.2, 0.35)]:
        s += a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / (dec * d))
        if detune: s += 0.6 * a * np.sin(2 * np.pi * f * k * (1 + detune) * t) * np.exp(-t / (dec * d))
    return s * np.minimum(1, t / 0.0008) * 0.5

def click(dur=0.012, lo=2500, hi=9000):
    t = tt(int(dur * SR)); return noise(dur, lo, hi) * np.exp(-t / (dur / 4))

def escapement():  # tick-tock of a watch
    a = click(0.01, 3000, 10000); b = click(0.01, 1800, 6000) * 0.6
    out = np.zeros(int(0.08 * SR)); out[:len(a)] += a; out[int(0.045 * SR):int(0.045 * SR) + len(b)] += b; return out

def fork(f=110.0, dur=2.6):
    t = tt(int(dur * SR))
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 1.1) + 0.35 * np.sin(2 * np.pi * f * 6.27 * t) * np.exp(-t / 0.06)
    s += 0.15 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.5)
    return s * np.minimum(1, t / 0.002)

def sub(f=55.0, dur=0.45, drop=0.0):
    t = tt(int(dur * SR)); ph = 2 * np.pi * np.cumsum(f + drop * np.exp(-t / 0.03)) / SR
    return np.sin(ph) * np.exp(-t / (dur / 3)) * np.minimum(1, t / 0.003)

def pluck(f, dur=0.5):
    t = tt(int(dur * SR)); s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / (0.18 / k)) for k, a in [(1, 1), (2, .35), (3, .12)])
    return s * np.minimum(1, t / 0.002)

def felt(f=55.0, dur=2.2):
    t = tt(int(dur * SR)); s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / (1.4 / k ** 0.8)) for k, a in [(1, 1), (2, .6), (3, .3), (4, .18), (5, .08), (6, .05)])
    return s * np.minimum(1, t / 0.012)

# ── music bed ───────────────────────────────────────────────
t_all = tt(N)
def gate(a, b, fade=0.05):
    return np.clip((t_all - a) / fade, 0, 1) * np.clip((b - t_all) / fade, 0, 1)
# pad: A minor add9, slow LFO, slight L/R detune
pad_l = np.zeros(N); pad_r = np.zeros(N)
for f in [110, 164.81, 220, 246.94, 261.63, 329.63]:
    for d, arr in [(-0.6, pad_l), (0.6, pad_r)]:
        arr += np.sin(2 * np.pi * (f + d) * t_all) * (1 + 0.3 * np.sin(2 * np.pi * 0.23 * t_all + f)) / (f / 110) ** 0.7
pad_env = np.zeros(N)
for a, b, lvl in [(2.0, 6.0, 0.35), (10.0, 12.0, 0.7), (12.0, 16.0, 0.6), (16.0, 20.0, 0.7), (20.0, 24.0, 0.65)]:
    pad_env = np.maximum(pad_env, lvl * gate(a, b, 0.4 if a != 12.0 else 0.05))
pad_env *= np.clip((DUR - 0.05 - t_all) / 3.2, 0, 1) ** 2      # tail reaches silence by the last frame (loop point)
pad_env[(t_all >= fr(262)) & (t_all < fr(270))] = 0              # the held breath
L += fft_filter(pad_l, 60, 1800) * pad_env * db(-30); Rt += fft_filter(pad_r, 60, 1800) * pad_env * db(-30)

beat = 0.5
for n in range(48):                               # sub pulse on beats 1 and 3
    t = n * beat
    if n % 2: continue
    if 2.0 <= t < 12.0 or 16.0 <= t < 20.0: add(sub(55, 0.45, 40 if t >= 16 else 0), t, -14 if t >= 16 else -17)
    elif 12.0 <= t < 16.0 and n % 4 == 0: add(sub(55, 0.6), t, -17)   # half tempo: one per bar
notes = [220, 261.63, 329.63, 392, 329.63, 261.63, 293.66, 329.63]
for n in range(96):                               # muted pluck on the off-beat eighths
    t = n * 0.25
    if n % 2 == 0: continue
    if 4.0 <= t < 6.0 or 10.0 <= t < 12.0 or 16.0 <= t < 20.0: add(pluck(notes[(n // 2) % 8]), t, -28, pan=0.25 * np.sin(n))
for t in np.arange(16.0, 20.0, 0.25):             # a quiet 16th-note hat in the S7 groove
    add(click(0.02, 7000, 16000), t, -40 + (6 if (t * 4) % 2 == 1 else 0), pan=0.2)

# ── sound design ────────────────────────────────────────────
add(np.sin(2 * np.pi * 880 * tt(int(0.5 * SR))) * np.minimum(1, tt(int(0.5 * SR)) / 0.04) * np.exp(-tt(int(0.5 * SR)) / 0.2), fr(6), -24)

# nib on paper, loudness follows the head's speed (S1, S2 race, S6), and the S8 line-writing
spd = np.array(ev['curves']['headSpeed']); spd[spd > 60] = 60
env_f = np.clip(spd / 25, 0, 1) ** 0.7
env_f[660:691] = 0.8
env = np.interp(t_all, np.arange(len(env_f)) / FPS, env_f)
env = np.convolve(env, np.ones(960) / 960, 'same')
nib = fft_filter(rng.standard_normal(N), 2200, 7000) * (1 + 0.5 * fft_filter(rng.standard_normal(N), None, 30))
L += nib * env * db(-36); Rt += nib * env * db(-36)

# knots: green glass tick; red a minor 6th down, detuned; grey a dry paper click
for e in ev['events']:
    t, f = e['t'], e['t'] * FPS
    race = 60 <= f < 118
    g = -18 - (13 if race else 0)
    if e['landing']:   # the resolution: red pitch, then green a major third above, 4 frames apart (the grey hold)
        add(glass(1512, detune=0.012), t, -18); add(glass(1905, dec=0.12, dur=0.8), t + fr(4), -15); continue
    if race and rng.random() > 0.5: continue
    if e['kind'] == 'g': add(glass(2400), t, g, pan=rng.uniform(-.3, .3) if race else 0)
    elif e['kind'] == 'l': add(glass(2400 / 1.587, detune=0.012 if not e['big'] else 0.02), t, g + (3 if e['big'] else 0), pan=rng.uniform(-.3, .3) if race else 0)
    else: add(click(0.008, 1500, 6000), t, g - 4)

# S2 pull-back: filtered room-air swell that opens with the camera spring
sw = noise(1.6); tw = tt(len(sw)); open_ = np.clip(tw / 0.5, 0, 1)
sw = fft_filter(sw, 150, 900) * (1 - open_) + fft_filter(sw, 150, 4000) * open_
add(sw * np.sin(np.pi * np.clip(tw / 1.6, 0, 1)) ** 2, fr(60), -30)
for f0 in (72, 86, 100): add(escapement(), fr(f0), -24)          # session labels
for k in range(8): add(noise(0.06, 1500, 5000) * np.hanning(int(0.06 * SR)), fr(137 + 3 * k), -30, pan=-0.6 + 0.17 * k)  # pencil brackets

# S4 tuning-fork drone: detuned by up to 40 cents while the period is wrong; you hear it come into tune
P = np.array(ev['curves']['period'])
Pt = np.interp(t_all, np.arange(len(P)) / FPS, P)
cents = np.where(Pt > 0, 40 * np.clip((7 - Pt) / 0.8, 0, 1), 0)
dr_env = np.clip((t_all - fr(180)) / 0.6, 0, 1) * (t_all < fr(262))
phase = 2 * np.pi * np.cumsum(110 * 2 ** (cents / 1200)) / SR
drone = (np.sin(phase) + np.sin(2 * np.pi * 110 * t_all) + 0.3 * np.sin(2 * phase)) * dr_env
L += drone * db(-26); Rt += drone * db(-26)
for f in range(210, 262):                                        # odometer detents: one per tenth rolled
    if int(P[f] * 10 + 1e-6) != int(P[f - 1] * 10 + 1e-6): add(click(0.006, 3000, 9000), fr(f), -26)

# f262–269: silence. Everything above is muted in that window below.
# f270 the snap: struck fork + 55 Hz sub + a 30 ms roll of glass ticks up the column
add(fork(110), fr(270), -17); add(sub(55, 0.4), fr(270), -15)
for k in range(7): add(glass(1512 * 2 ** (k / 12)), fr(270) + k * 0.005, -20)
# S5 gold scan: rising glass-rim tone; condition label ticks
ts = tt(int(0.62 * SR)); fsw = 800 * 2 ** (ts / 0.62)
add(np.sin(2 * np.pi * np.cumsum(fsw) / SR) * np.sin(np.pi * ts / 0.62) ** 2, fr(300), -30)
for f0 in (324, 326, 328): add(escapement()[:int(0.02 * SR)], fr(f0), -24)
# S6 foresight: a glass swell played backwards (the arc draws backwards from the future)
rv = (glass(1200, dec=0.25, dur=0.67) + glass(1800, dec=0.2, dur=0.67) * 0.5)[::-1]
add(rv, fr(405), -20)
# S7: unwind (reverse air), UI clicks on 16ths, felt thump as the card lands, drawer, odometer detents
add((sw * np.sin(np.pi * np.clip(tw / 1.6, 0, 1)) ** 2)[::-1][:int(1.1 * SR)], fr(480) - 0.6, -32)
for f0 in (484, 492, 500, 520, 534): add(click(0.012, 2000, 7000), round(fr(f0) * 8) / 8, -24)
thump = fft_filter(noise(0.25), 40, 300) * np.exp(-tt(int(0.25 * SR)) / 0.05) + 0.6 * sub(80, 0.25)
add(thump, fr(535), -12)
dw = noise(0.33, 800, 3000) * np.hanning(int(0.33 * SR)); add(dw, fr(562), -32)
for k in range(8): add(click(0.006, 3000, 9000), fr(572) + 0.035 * k * (1 + 0.25 * k), -26)
# S8: pad only; felt note under the wordmark
add(felt(55), fr(690), -19)

# the held breath: true silence f262–269; true silence f0–5
mute = ((t_all >= fr(262)) & (t_all < fr(270))) | (t_all < fr(6))
L[mute] = 0; Rt[mute] = 0
fade_out = np.clip((DUR - t_all) / 0.4, 0, 1); L *= fade_out; Rt *= fade_out

st = np.stack([L, Rt], 1)
st /= max(1e-9, np.abs(st).max()) / db(-3)
import wave
with wave.open(os.path.join(HERE, 'out', 'audio_raw.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote out/audio_raw.wav')
