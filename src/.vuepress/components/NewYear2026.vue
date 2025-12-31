<template>
  <div
    ref="rootRef"
    class="newyear-2026-page"
    @pointerdown="handlePointerDown"
  >
    <canvas ref="canvasRef" class="fx-canvas" aria-hidden="true"></canvas>

    <section class="hero-section">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="hero-badge">2026</div>
        <h1>新年愿望墙</h1>
        <p class="hero-subtitle">在这里写下你的愿望、祝福和目标，让这一年的努力都有起点。</p>
        <div class="hero-tags">
          <span class="tag">愿望</span>
          <span class="tag">祝福</span>
          <span class="tag">目标</span>
        </div>
      </div>
    </section>

    <section class="wish-sections">
      <div class="column">
        <div class="scroll-mask">
          <div class="scroll-track">
            <article
              v-for="(item, index) in displayCol1"
              :key="'c1-' + index"
              class="wish-card"
            >
              <div class="card-sender">{{ item.sender }}</div>
              <div class="card-content">{{ item.content }}</div>
            </article>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="scroll-mask">
          <div class="scroll-track" style="animation-duration: 50s;">
            <article
              v-for="(item, index) in displayCol2"
              :key="'c2-' + index"
              class="wish-card"
            >
              <div class="card-sender">{{ item.sender }}</div>
              <div class="card-content">{{ item.content }}</div>
            </article>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="scroll-mask">
          <div class="scroll-track" style="animation-duration: 55s;">
            <article
              v-for="(item, index) in displayCol3"
              :key="'c3-' + index"
              class="wish-card"
            >
              <div class="card-sender">{{ item.sender }}</div>
              <div class="card-content">{{ item.content }}</div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";

const rawData = [
  { content: "2026年我要做完我的钓鱼游戏!", sender: "Freeman" },
  { content: "2026年我要暴富，走向人生巅峰", sender: "王铁柱" },
  { content: "做完一个完整的游戏", sender: "李李" },
  { content: "上线再转一次 做完至少2个demo 其中含3D 参加4个jam 制作至少5个游戏开发视频 打造自己的作品集", sender: "饿了" },
  { content: "找个好工作，完成一款游戏上架steam并回本", sender: "Valar" },
  { content: "更自律一点", sender: "祺奕祺可" },
  { content: "尝试更加深入的学习游戏开发相关的知识，学习画画和音乐。希望能获得关于游戏行业的出路。", sender: "陌上竹" },
  { content: "能够做出两个自己满意的玩法游戏上架itch", sender: "斓" },
  { content: "赚赚赚，发发发", sender: "阿发" },
  { content: "做一款游戏", sender: "i++" },
  { content: "做出一款3D解谜游戏，祝大家开发顺利！", sender: "暀倳洳煙#②②③③" },
  { content: "做出第一个上线steam的游戏", sender: "传梦" },
  { content: "联机幸存者上架steam！成为小提琴大师！买的股票都涨停！", sender: "Icarus" },
  { content: "活着、各位的愿望、目标全能实现", sender: "-Monky、" },
  { content: "新年不失业,努力还清贷款,天天能上班摸鱼做游戏!", sender: "老白" },
  { content: "年底出demo", sender: "tttyut" },
  { content: "横版2d闯关！", sender: "雪碧雪碧" },
  { content: "我是天帝", sender: "雪碧雪碧" },
  { content: "诛杀老登", sender: "3KTerror" },
  { content: "要做rts", sender: "蝶蝶子" },
  { content: "做10个游戏", sender: "热爱生活" }
];

const rootRef = ref(null);
// Combine all items and distribute them into 3 columns for a mixed display
const allItems = rawData;

const col1Items = allItems.filter((_, i) => i % 3 === 0);
const col2Items = allItems.filter((_, i) => i % 3 === 1);
const col3Items = allItems.filter((_, i) => i % 3 === 2);

// Duplicate data to create a seamless loop
const displayCol1 = computed(() => [...col1Items, ...col1Items, ...col1Items, ...col1Items]);
const displayCol2 = computed(() => [...col2Items, ...col2Items, ...col2Items, ...col2Items]);
const displayCol3 = computed(() => [...col3Items, ...col3Items, ...col3Items, ...col3Items]);

const canvasRef = ref(null);
const reducedMotion = ref(false);

let raf = 0;
let resizeObserver = null;
let lastBurstAt = 0;
let particles = [];

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resizeCanvas() {
  const root = rootRef.value;
  const canvas = canvasRef.value;
  if (!root || !canvas) return;
  const rect = root.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function burst(x, y, intensity = 1) {
  const palette = ["#38bdf8", "#f472b6", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];
  const count = Math.floor(42 * intensity);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (1.2 + Math.random() * 2.4) * intensity;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (0.2 + Math.random() * 0.9),
      life: 0,
      ttl: 60 + Math.random() * 40,
      size: 1 + Math.random() * 2.2,
      color: palette[Math.floor(Math.random() * palette.length)]
    });
  }
}

function stepFx(ts) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.clearRect(0, 0, w, h);


  if (ts - lastBurstAt > 300) {
    lastBurstAt = ts;
    // Random position across the entire canvas with some padding to avoid edges
    const x = w * (0.05 + Math.random() * 0.9);
    const y = h * (0.05 + Math.random() * 0.9);
    burst(x, y, 0.7 + Math.random() * 0.5);
  }

  particles = particles.filter((p) => p.life < p.ttl);
  for (const p of particles) {
    p.life += 1;
    p.vx *= 0.985;
    p.vy = p.vy * 0.985 + 0.03;
    p.x += p.vx;
    p.y += p.vy;
    const t = 1 - p.life / p.ttl;
    ctx.globalAlpha = Math.max(0, t);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  raf = window.requestAnimationFrame(stepFx);
}

function handlePointerDown(event) {
  if (reducedMotion.value) return;
  const canvas = canvasRef.value;
  const root = rootRef.value;
  if (!canvas || !root) return;
  
  const rect = root.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  burst(x, y, 1.1);
}

onMounted(() => {
  reducedMotion.value = prefersReducedMotion();
  if (reducedMotion.value) return;

  resizeCanvas();
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => resizeCanvas());
    if (rootRef.value) resizeObserver.observe(rootRef.value);
  }

  raf = window.requestAnimationFrame(stepFx);
});

onUnmounted(() => {
  if (raf) window.cancelAnimationFrame(raf);
  raf = 0;
  particles = [];
  if (resizeObserver && rootRef.value) resizeObserver.unobserve(rootRef.value);
  resizeObserver = null;
});
</script>

<style scoped>
.newyear-2026-page {
  position: relative;
  padding: 3rem 1.5rem 4rem;
  overflow: hidden;
  border-radius: 24px;
  background: radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.35), transparent 60%),
    radial-gradient(circle at 100% 100%, rgba(66, 184, 131, 0.3), transparent 55%),
    linear-gradient(135deg, #0f172a, #020617);
  color: #f9fafb;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.45);
  animation: pageFadeIn 0.9s ease-out;
}

.fx-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.85;
  mix-blend-mode: screen;
  z-index: 0;
}

.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2.2rem;
  z-index: 1;
}

.hero-glow {
  position: absolute;
  inset: -40%;
  background:
    radial-gradient(circle at 10% 20%, rgba(96, 165, 250, 0.35), transparent 55%),
    radial-gradient(circle at 80% 60%, rgba(45, 212, 191, 0.4), transparent 55%),
    radial-gradient(circle at 50% 100%, rgba(244, 114, 182, 0.25), transparent 60%);
  opacity: 0.7;
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
  animation: glowFloat 16s ease-in-out infinite alternate;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 520px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #fbbf24;
  margin-bottom: 0.9rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.2);
}

.hero-content h1 {
  font-size: 2.8rem;
  line-height: 1.15;
  margin: 0 0 0.8rem;
  background: linear-gradient(135deg, #fbbf24 0%, #ef4444 50%, #fbbf24 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine 5s linear infinite;
  text-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

.hero-subtitle {
  margin: 0 0 1.2rem;
  font-size: 1rem;
  color: rgba(226, 232, 240, 0.9);
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tag {
  padding: 0.25rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.6);
  color: #e0f2fe;
  backdrop-filter: blur(8px);
}


.scroll-mask {
  position: relative;
  height: 600px;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
}

.scroll-track {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  animation: scrollUp 45s linear infinite;
}

.scroll-track:hover {
  animation-play-state: paused;
}

@keyframes scrollUp {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-33.33%);
  }
}

.wish-sections {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}

.column h2 {
  font-size: 1.2rem;
  margin-bottom: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e5e7eb;
}


.wish-card {
  position: relative;
  padding: 1.2rem 1.2rem 1.3rem;
  border-radius: 16px;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transform-origin: center;
  transform: translateY(16px);
  opacity: 0;
  animation: cardFadeIn 0.6s ease-out forwards;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}


.wish-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.5), rgba(234, 179, 8, 0.5));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.wish-card:hover::before {
  opacity: 1;
}

.wish-card:hover {
  transform: translateY(6px) scale(1.02);
  background: rgba(30, 41, 59, 0.6);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
}


.card-sender {
  font-weight: 700;
  font-size: 0.9rem;
  color: #fbbf24;
  margin-bottom: 0.6rem;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.card-sender::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

.card-content {
  color: #e2e8f0;
  font-size: 0.95rem;
  line-height: 1.7;
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes glowFloat {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(-20px, -16px, 0) scale(1.03);
  }
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


@media (max-width: 1024px) {
  .wish-sections {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-section {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .newyear-2026-page {
    padding: 2rem 1.1rem 2.8rem;
    border-radius: 18px;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .wish-sections {
    grid-template-columns: minmax(0, 1fr);
  }
}

[data-theme="dark"] .newyear-2026-page {
  background: radial-gradient(circle at 0% 0%, rgba(15, 23, 42, 0.9), transparent 60%),
    radial-gradient(circle at 100% 100%, rgba(30, 64, 175, 0.5), transparent 60%),
    linear-gradient(145deg, #020617, #0f172a);
  color: var(--vp-c-text);
}

[data-theme="dark"] .wish-card {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .wish-card:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(251, 191, 36, 0.3);
}

[data-theme="dark"] .wish-card p {
  color: var(--vp-c-text-mute);
}
</style>
