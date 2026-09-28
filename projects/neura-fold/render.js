// Render film.html to out/video.mp4 (silent) and out/events.json (for audio.py).
// Motion blur: K sub-frames across a 180° shutter, averaged in the page, piped as raw RGB to ffmpeg.
// Usage: FFMPEG=/path/to/ffmpeg node render.js [K=8] [fromFrame] [toFrame]
const { chromium } = require('playwright'); const { spawn } = require('child_process');
const path = require('path'); const fs = require('fs');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
(async () => {
  const K = +(process.argv[2] || 8), f0 = +(process.argv[3] || 0);
  const out = path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, 'film.html') + '?render'); await p.evaluate(() => window.READY);
  const info = await p.evaluate(() => buildEvents());
  fs.writeFileSync(path.join(out, 'events.json'), JSON.stringify(info));
  const N = +(process.argv[4] || info.duration * info.fps), fps = info.fps;
  await p.evaluate(() => {
    const c = document.getElementById('c'), x = c.getContext('2d', { willReadFrequently: true }), NP = 1080 * 1920;
    window.grab = async (t, K, dt) => {
      const acc = new Uint16Array(NP * 3);
      for (let k = 0; k < K; k++) {
        seek(Math.max(0, t + (k - (K - 1) / 2) * dt));
        const d = x.getImageData(0, 0, 1080, 1920).data;
        for (let i = 0, j = 0; i < NP * 3; i += 3, j += 4) { acc[i] += d[j]; acc[i + 1] += d[j + 1]; acc[i + 2] += d[j + 2]; }
      }
      const o = new Uint8Array(NP * 3), h = K >> 1; for (let i = 0; i < NP * 3; i++) o[i] = (acc[i] + h) / K;
      return await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result.slice(fr.result.indexOf(',') + 1)); fr.readAsDataURL(new Blob([o])); });
    };
  });
  const ff = spawn(FFMPEG, ['-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1080x1920', '-r', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-tune', 'grain', '-pix_fmt', 'yuv420p',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', path.join(out, 'video.mp4')]);
  ff.stderr.on('data', d => process.stderr.write(d));
  const shutter = 1 / (fps * 2), t0 = Date.now();
  for (let f = f0; f < N; f++) {
    const s = await p.evaluate(([t, K, dt]) => grab(t, K, dt), [f / fps, K, shutter / K]);
    if (!ff.stdin.write(Buffer.from(s, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log(`frame ${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  console.log('done', errs.length ? 'PAGE ERRORS: ' + errs.join(' | ') : '');
})();
