# SynthForge · 合成锻造炉

<p align="center">
  <a href="https://github.com/CJX0712/synth-forge/actions/workflows/ci.yml"><img src="https://github.com/CJX0712/synth-forge/actions/workflows/ci.yml/badge.svg" alt="ci"></a>
  <a href="https://github.com/CJX0712/synth-forge/releases"><img src="https://img.shields.io/github/v/release/CJX0712/synth-forge?sort=semver" alt="release"></a>
  <a href="https://github.com/CJX0712/synth-forge/blob/main/LICENSE"><img src="https://img.shields.io/github/license/CJX0712/synth-forge" alt="license"></a>
  <img src="https://img.shields.io/badge/author-%E6%99%A8%E6%98%9F-1f6feb" alt="author">
</p>

单文件离线合成器。4 种基础波形（正弦/方波/锯齿/三角）+ ADSR 包络 + 确定性旋律种子，浏览器内用 WebAudio 真实播放，canvas 实时绘制波形。

> 波形采样是纯数学——不靠耳朵判断，无头就能验证每个采样点的相位、符号、频率与包络。

## 功能

- **4 种波形**：正弦 / 方波 / 锯齿 / 三角
- **ADSR 包络**：Attack / Decay / Sustain / Release 可调
- **确定性旋律**：种子 → 可复现的 MIDI 音符序列（A4=440Hz，MIDI 36–84）
- **WebAudio 播放**：整段旋律顺序合成，或试听单音
- **波形可视化**：canvas 绘制整段旋律采样
- **内置自检**：浏览器内一键验证波形与包络正确性

## 引擎验证（无头）

引擎逻辑抽离为纯函数，`_smoke.js` 在 Node 下做不变量校验，**17/17 全绿**：

- **正弦关键点**：osc(0)=0、osc(0.25)=1、osc(0.5)=0、osc(0.75)=-1
- **方波符号**：正相位=1、负相位=-1
- **锯齿/三角值域**：均在 [-1,1]
- **renderNote 长度** = `round(dur·sr)`
- **峰值 ≤ 1**、**包络起点/终点 ≈ 0**（attack/release）
- **频率映射**：无包络渲染时样本 == 纯波形（相位 `(i·freq/sr) mod 1`）
- **音高公式**：A4=440、A5=880
- **种子确定性 / 区分**
- **旋律频率**在 50–3000 Hz 合理范围

```bash
node _smoke.js      # 引擎不变量测试
node _probe.js      # 生成 ASCII 波形图到 _probe.txt
```

## 使用

直接用浏览器打开 `index.html` 即可（播放需浏览器支持 WebAudio，波形与自检无需音频）。

## 许可

MIT — 见 [LICENSE](LICENSE)。
