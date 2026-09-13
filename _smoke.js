// Headless invariant test for SynthForge engine (extracted from index.html)
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
if (!m) { console.error('engine script not found'); process.exit(1); }

const ctx = { console, Math, Object, Array, JSON, String, Float32Array, globalThis: {} };
ctx.globalThis = ctx;
vm.createContext(ctx);
const Synth = vm.runInContext(m[1] + '\nSynth;', ctx, { filename: 'engine.js' });

let pass = 0, fail = 0;
function ok(name, cond){
  if (cond){ pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name); }
}

console.log('SynthForge engine smoke test');

// 1) sine key points
ok("sine: osc(0)=0", Math.abs(Synth.osc('sine', 0)) < 1e-12);
ok("sine: osc(0.25)=1", Math.abs(Synth.osc('sine', 0.25) - 1) < 1e-12);
ok("sine: osc(0.5)=0", Math.abs(Synth.osc('sine', 0.5)) < 1e-12);
ok("sine: osc(0.75)=-1", Math.abs(Synth.osc('sine', 0.75) + 1) < 1e-12);

// 2) square sign
ok("square: positive phase = 1", Synth.osc('square', 0.1) === 1);
ok("square: negative phase = -1", Synth.osc('square', 0.6) === -1);

// 3) saw / triangle range
let sawOk = true, triOk = true;
for (let p = 0; p < 1; p += 0.01){
  if (Math.abs(Synth.osc('saw', p)) > 1.0001) sawOk = false;
  if (Math.abs(Synth.osc('triangle', p)) > 1.0001) triOk = false;
}
ok("saw/triangle: range [-1,1]", sawOk && triOk);

// 4) renderNote length
const rn = Synth.renderNote('sine', 440, 0.1, 8000, { a: 0.01, d: 0.05, s: 0.7, r: 0.08 });
ok("renderNote: length = round(dur*sr)", rn.length === Math.round(0.1 * 8000));

// 5) peak <= 1
let peak = 0; for (const v of rn) peak = Math.max(peak, Math.abs(v));
ok("renderNote: peak <= 1", peak <= 1.0001);

// 6) envelope start/end near 0
ok("renderNote: start ~0 (attack)", Math.abs(rn[0]) < 0.05);
ok("renderNote: end ~0 (release)", Math.abs(rn[rn.length - 1]) < 0.05);

// 7) frequency mapping: with no envelope, sample == pure osc at that phase
const rnFlat = Synth.renderNote('sine', 440, 0.1, 8000, { a: 0, d: 0, s: 1, r: 0 });
const idx = 100;
const expect = Synth.osc('sine', (idx * 440 / 8000) % 1);
ok("renderNote(no env): sample == pure waveform (freq maps correctly)", Math.abs(rnFlat[idx] - expect) < 1e-9);

// 8) note frequency formula
ok("noteFreq: A4 = 440", Math.abs(Synth.noteFreq(69) - 440) < 1e-9);
ok("noteFreq: A5 = 880", Math.abs(Synth.noteFreq(81) - 880) < 1e-9);

// 9) determinism
const m1 = Synth.melodyFromSeed('晨星', 12), m2 = Synth.melodyFromSeed('晨星', 12);
ok("seed determinism: same seed -> same melody", JSON.stringify(m1) === JSON.stringify(m2));

// 10) distinction
const m3 = Synth.melodyFromSeed('别的', 12);
ok("seed distinction: diff seed -> diff melody", JSON.stringify(m1) !== JSON.stringify(m3));

// 11) frequencies in audible range
let freqOk = true;
for (const nt of m1){ const f = Synth.noteFreq(nt.midi); if (f < 50 || f > 3000) freqOk = false; }
ok("melody freq in 50-3000 Hz", freqOk);

console.log('\nRESULT: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail === 0 ? 0 : 1);
