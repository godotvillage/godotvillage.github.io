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
          第一届
        </div>
        <h1 class="hero-title">编程比赛 · 连连看</h1>
        <p class="hero-desc">本群成立已久，第一期编程比赛以"连连看"为主题，不限玩法融入，鼓励群友相互学习。</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-num">12</span>
            <span class="stat-label">参赛作品</span>
          </div>
          <div class="hero-stat">
            <span class="stat-num">1</span>
            <span class="stat-label">获奖作品</span>
          </div>
          <div class="hero-stat">
            <span class="stat-num">2</span>
            <span class="stat-label">赞助者</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 比赛说明 -->
    <section class="desc-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><Document /></el-icon>
          比赛说明
        </h2>
        <div class="desc-card">
          <div class="desc-block">
            <h3>创作要求</h3>
            <ul>
              <li>引擎：Godot，不限语言</li>
              <li>题材：连连看玩法，主题不限，可融入任何喜欢的元素</li>
              <li>也可自行换成别的玩法</li>
              <li>请注意法律法规，不得带有黄色、暴力等元素</li>
            </ul>
          </div>
          <div class="desc-block">
            <h3>参与方法</h3>
            <ul>
              <li>本群成员均可参与，可任意组队或 solo，无需报名</li>
              <li>使用 Godot 引擎开发游戏，导出并打成压缩包</li>
              <li>上传至群文件/编程挑战/第一期-连连看文件夹</li>
              <li>截止时间前可随意替换重传</li>
            </ul>
          </div>
          <div class="desc-block">
            <h3>声明</h3>
            <p>本次为群友之间相互学习，希望大家踊跃参与。由于是第一期，可能有做的不好的地方，欢迎指出。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 时间安排 -->
    <section class="schedule-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><Calendar /></el-icon>
          时间安排
        </h2>
        <div class="schedule-table">
          <div class="schedule-header">
            <span class="col-phase">阶段</span>
            <span class="col-start">开始时间</span>
            <span class="col-end">结束时间</span>
          </div>
          <div
            v-for="item in schedule"
            :key="item.phase"
            class="schedule-row"
          >
            <span class="col-phase">{{ item.phase }}</span>
            <span class="col-start">{{ item.start }}</span>
            <span class="col-end">{{ item.end }}</span>
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
          <div v-for="entry in entries" :key="entry.code" class="entries-row">
            <span class="col-code">{{ entry.code }}</span>
            <span class="col-work">{{ entry.work }}</span>
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

    <!-- 赞助信息 -->
    <section class="sponsors-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><Star /></el-icon>
          赞助者
        </h2>
        <p class="sponsors-desc">感谢以下群友对本次比赛的大力支持！</p>
        <div class="sponsors-grid">
          <div v-for="sponsor in sponsors" :key="sponsor" class="sponsor-card">
            <el-icon><UserFilled /></el-icon>
            <span>{{ sponsor }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Trophy, Calendar, Star, Document, UserFilled, ArrowLeft, List, User } from '@element-plus/icons-vue'

interface ScheduleItem {
  phase: string
  start: string
  end: string
}

interface Entry {
  code: string
  work: string
  author: string
}

const schedule: ScheduleItem[] = [
  { phase: '游戏提交', start: '2025年5月7日', end: '2025年5月14日 00:00' },
  { phase: '游戏评审', start: '2025年5月14日', end: '2025年5月15日 24:00前' }
]

const entries: Entry[] = [
  { code: '-', work: 'astar_test.exe', author: '王大狗' },
  { code: '-', work: '老白的连连看.zip', author: '老白' },
  { code: '-', work: 'Carrotv05 (2).zip', author: '没有昵称' },
  { code: '-', work: 'TCdd的消消乐.rar', author: '何处是神州~' },
  { code: '-', work: 'TCdd的消消乐_MacOS.zip', author: '何处是神州~' },
  { code: '-', work: '连连看看.exe', author: '戈多戈' },
  { code: '-', work: '塔防连连看.7z', author: '滑老稽' },
  { code: '-', work: '湮灭.exe', author: '斓' },
  { code: '-', work: 'family_guy.exe', author: '三川' },
  { code: '-', work: '连连看之捅捅看_1.1.exe', author: '荒庭' },
  { code: '-', work: '无尽连连看.exe', author: '暀倳洳煙' },
  { code: '-', work: '无尽连连看-V2.exe', author: '暀倳洳煙' }
]

const winner = { work: '湮灭.exe', author: '斓' }

const sponsors: string[] = [
  '陌上竹（moshangzhu@qq.com）',
  '下划线瞎子（394096626）'
]
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

  &:hover {
    color: var(--text-primary);
  }
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

/* 比赛说明 */
.desc-section {
  margin-bottom: 56px;

  .desc-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 28px;
  }

  .desc-block {
    margin-bottom: 24px;

    &:last-child { margin-bottom: 0; }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        position: relative;
        padding-left: 16px;
        font-size: 14px;
        color: var(--text-regular);
        line-height: 2;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 12px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FBBF24;
        }
      }
    }

    p {
      font-size: 14px;
      color: var(--text-regular);
      line-height: 1.8;
    }
  }
}

/* 时间安排 */
.schedule-section {
  margin-bottom: 56px;

  .schedule-table {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  .schedule-header {
    display: flex;
    padding: 14px 20px;
    background: var(--color-secondary);
    font-size: 13px;
    font-weight: 600;
    color: var(--text-regular);
    border-bottom: 1px solid var(--border-color);
  }

  .schedule-row {
    display: flex;
    padding: 14px 20px;
    font-size: 14px;
    color: var(--text-regular);
    border-bottom: 1px solid var(--border-color);
    transition: background 0.2s;

    &:last-child { border-bottom: none; }
    &:hover { background: var(--color-secondary); }
  }

  .col-phase { flex: 1; }
  .col-start { width: 200px; text-align: center; color: var(--text-regular); }
  .col-end { width: 200px; text-align: center; color: var(--text-regular); }
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
  }

  .col-code { width: 80px; text-align: center; color: var(--text-secondary); flex-shrink: 0; }
  .col-work { flex: 1; }
  .col-author { width: 160px; color: var(--text-regular); flex-shrink: 0; }
}

/* 获奖者 */
.winner-section {
  margin-bottom: 56px;

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

/* 赞助者 */
.sponsors-section {
  .sponsors-desc {
    font-size: 14px;
    color: var(--text-regular);
    margin-bottom: 20px;
  }

  .sponsors-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .sponsor-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--text-regular);
    transition: all 0.2s;

    &:hover { background: var(--color-secondary); transform: translateY(-1px); }
    .el-icon { color: #FBBF24; flex-shrink: 0; }
  }
}

@media (max-width: 768px) {
  .jam-hero .hero-title { font-size: 32px; }
  .jam-hero .hero-stats { gap: 24px; }
  .sponsors-grid { grid-template-columns: repeat(2, 1fr); }

  .schedule-table {
    .col-start, .col-end { width: 140px; font-size: 12px; }
    .schedule-row, .schedule-header { padding: 12px 14px; font-size: 13px; }
  }

  .entries-table {
    .col-code { width: 60px; }
    .col-author { width: 120px; }
    .entries-row, .entries-header { padding: 12px 14px; font-size: 13px; }
  }

  .winner-card { min-width: auto; padding: 24px; }
}

@media (max-width: 480px) {
  .sponsors-grid { grid-template-columns: 1fr; }
}
</style>
