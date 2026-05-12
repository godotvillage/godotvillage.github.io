<template>
  <div class="gamejam-page">
    <div class="section-container">
      <router-link to="/gamejam/list" class="back-link">
        <el-icon><ArrowLeft /></el-icon>
        往届记录
      </router-link>
    </div>

    <!-- Hero -->
    <section class="jam-hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <el-icon><Trophy /></el-icon>
          第二届
        </div>
        <h1 class="hero-title">编程比赛</h1>
        <p class="hero-desc">第二届编程比赛已经圆满结束。感谢群友积极响应和支持。</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-num">13</span>
            <span class="stat-label">参赛作品</span>
          </div>
          <div class="hero-stat">
            <span class="stat-num">1</span>
            <span class="stat-label">获奖作品</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 参赛作品 -->
    <section class="entries-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><List /></el-icon>
          参赛作品
        </h2>
        <div class="entries-table">
          <div class="entries-header">
            <span class="col-code">代号</span>
            <span class="col-work">作品名称</span>
            <span class="col-author">参赛人员</span>
          </div>
          <div
            v-for="entry in entries"
            :key="entry.code"
            class="entries-row"
            :class="{ winner: entry.code === winnerCode }"
          >
            <span class="col-code">{{ entry.code }}</span>
            <span class="col-work">
              {{ entry.work }}
              <el-icon v-if="entry.code === winnerCode" class="trophy-icon"><Trophy /></el-icon>
            </span>
            <span class="col-author">{{ entry.author }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 获奖者 -->
    <section class="winner-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><Trophy /></el-icon>
          最终获奖者
        </h2>
        <div class="winner-highlight">
          <div class="winner-card">
            <div class="winner-badge">获奖作品</div>
            <h3>{{ winner.work }}</h3>
            <p class="winner-author">
              <el-icon><User /></el-icon>
              {{ winner.author }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Trophy, ArrowLeft, List, User } from '@element-plus/icons-vue'

interface Entry {
  code: string
  work: string
  author: string
}

const winnerCode = 'D'

const entries: Entry[] = [
  { code: 'A', work: '夜坠.zip', author: '阿发' },
  { code: 'C', work: '啪！起飞！_修正版.zip', author: '无业游民 思游容' },
  { code: 'D', work: '生或跳普通版.exe', author: '老爹叫你发工程' },
  { code: 'E', work: '榨汁之城01.zip', author: '大白' },
  { code: 'G', work: '无窗之笼.zip', author: '上杉炎' },
  { code: 'I', work: 'Outlast.zip', author: '花开富贵' },
  { code: 'J', work: 'Deus Ex the Siege', author: '三川' },
  { code: 'L', work: 'deepunderground.zip', author: '老白' },
  { code: 'M', work: '抵达钻石.zip', author: '陌上竹' },
  { code: 'N', work: '啪啪小飞机.exe', author: '戈多戈' },
  { code: 'O', work: '重力跑酷.zip', author: 'wait' },
  { code: 'Q', work: '走迷宫.zip', author: '拔刀谦逊' },
  { code: 'R', work: 'projectr.7z', author: '王大狗' }
]

const winner = { work: '生或跳普通版.exe', author: '老爹叫你发工程' }
</script>

<style scoped lang="scss">
.gamejam-page {
  width: 100%;
  padding-bottom: 64px;
  color: var(--text-primary);
}

.section-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
  width: 90%;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-regular);
  text-decoration: none;
  font-size: 14px;
  padding: 16px 0;
  transition: color 0.2s;

  &:hover { color: var(--text-primary); }
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-heading);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

/* Hero */
.jam-hero {
  position: relative;
  padding: 64px 24px 64px;
  text-align: center;
  overflow: hidden;

  .hero-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50vw;
    height: 50vw;
    background: radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, rgba(15, 23, 42, 0) 70%);
    z-index: 0;
    pointer-events: none;
  }

  .hero-content { position: relative; z-index: 1; }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
    border: 1px solid rgba(251, 191, 36, 0.3);
    padding: 6px 20px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    color: #FBBF24;
    margin-bottom: 24px;
  }

  .hero-title {
    font-family: var(--font-heading);
    font-size: 48px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    line-height: 1.2;
  }

  .hero-desc {
    font-size: 16px;
    color: var(--text-regular);
    max-width: 600px;
    margin: 0 auto 40px;
    line-height: 1.6;
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 48px;

    .hero-stat {
      text-align: center;
      .stat-num {
        display: block;
        font-size: 36px;
        font-weight: 700;
        color: #FBBF24;
        font-family: var(--font-heading);
      }
      .stat-label { font-size: 14px; color: var(--text-secondary); }
    }
  }
}

/* 参赛作品表格 */
.entries-section {
  margin-bottom: 56px;

  .entries-table {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  .entries-header {
    display: flex;
    padding: 14px 20px;
    background: var(--color-secondary);
    font-size: 13px;
    font-weight: 600;
    color: var(--text-regular);
    border-bottom: 1px solid var(--border-color);
  }

  .entries-row {
    display: flex;
    padding: 14px 20px;
    font-size: 14px;
    color: var(--text-regular);
    border-bottom: 1px solid var(--border-color);
    transition: background 0.2s;

    &:last-child { border-bottom: none; }
    &:hover { background: var(--color-secondary); }

    &.winner {
      background: rgba(251, 191, 36, 0.06);

      .col-work {
        color: #FBBF24;
        font-weight: 600;
      }
    }
  }

  .col-code { width: 80px; text-align: center; color: var(--text-secondary); flex-shrink: 0; }
  .col-work { flex: 1; display: flex; align-items: center; gap: 8px; }
  .col-author { width: 180px; color: var(--text-regular); flex-shrink: 0; }

  .trophy-icon {
    color: #FBBF24;
    font-size: 16px;
  }
}

/* 获奖者 */
.winner-section {
  .winner-highlight {
    display: flex;
    justify-content: center;
  }

  .winner-card {
    background: var(--card-bg);
    border: 1px solid rgba(251, 191, 36, 0.4);
    border-radius: 14px;
    padding: 36px 48px;
    text-align: center;
    min-width: 320px;

    .winner-badge {
      display: inline-block;
      padding: 4px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, #FBBF24, #F59E0B);
      margin-bottom: 16px;
    }

    h3 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .winner-author {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 15px;
      color: var(--text-regular);
    }
  }
}

@media (max-width: 768px) {
  .jam-hero .hero-title { font-size: 32px; }
  .jam-hero .hero-stats { gap: 24px; }

  .entries-table {
    .col-code { width: 60px; }
    .col-author { width: 140px; }
    .entries-row, .entries-header { padding: 12px 14px; font-size: 13px; }
  }

  .winner-card { min-width: auto; padding: 24px; }
}
</style>
