// Probe: render one sine note and dump a vertical ASCII waveform to verify shape
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
const ctx = { console, Math, Object, Array, JSON, String, Float32Array, globalThis: {} }; ctx.globalThis = ctx;
vm.createContext(ctx);
const Synth = vm.runInContext(m[1] + '\nSynth;', ctx, { filename: 'engine.js' });

const sr = 8000, dur = 0.02;
const data = Synth.renderNote('sine', 440, dur, sr, { a: 0, d: 0, s: 1, r: 0 });
const ramp = ' .:-=+*#%@';
const lines = [];
lines.push('sine 440Hz, ' + data.length + ' samples (one period ~' + Math.round(sr / 440) + ' samples)');
// draw as columns: each sample a vertical position
const H = 21, mid = (H - 1) / 2;
for (let y = 0; y < H; y++){
  let row = '';
  for (let i = 0; i < data.length; i++){
    const v = data[i];
    const pos = Math.round(mid - v * mid);
    row += (y === pos) ? '*' : ' ';
  }
  lines.push(row);
}
lines.push('-'.repeat(data.length));
fs.writeFileSync(path.join(__dirname, '_probe.txt'), lines.join('\n') + '\n', 'utf8');
console.log('probe written: ' + lines.join('\n').length + ' chars');
