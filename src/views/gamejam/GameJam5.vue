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
          第五届
        </div>
        <h1 class="hero-title">Godot新手村游戏制作大赛</h1>
        <p class="hero-desc">49人报名参赛，19件作品提交，获奖名单已公布。</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-num">49</span>
            <span class="stat-label">报名人数</span>
          </div>
          <div class="hero-stat">
            <span class="stat-num">19</span>
            <span class="stat-label">提交作品</span>
          </div>
          <div class="hero-stat">
            <span class="stat-num">12</span>
            <span class="stat-label">赞助者</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 获奖名单 -->
    <section class="winner-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><Trophy /></el-icon>
          获奖名单
        </h2>
        <GameJam5Awards />
      </div>
    </section>

    <!-- 评委点评 -->
    <section id="judge-reviews" class="judge-wall-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><ChatDotRound /></el-icon>
          评委点评
        </h2>
        <GameJam5JudgeWall />
      </div>
    </section>

    <!-- 赛程安排 -->
    <section class="schedule-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><Calendar /></el-icon>
          赛程安排
        </h2>
        <div class="schedule-table">
          <div class="schedule-header">
            <span class="col-phase">阶段</span>
            <span class="col-desc">说明</span>
          </div>
          <div v-for="item in schedule" :key="item.phase" class="schedule-row">
            <span class="col-phase">{{ item.phase }}</span>
            <span class="col-desc">{{ item.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 提交作品 -->
    <section class="entries-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><List /></el-icon>
          提交作品
        </h2>
        <div class="entries-grid">
          <div v-for="entry in entries" :key="entry.author" class="entry-card">
            <div class="entry-avatar">
              <span>{{ entry.author.charAt(0) }}</span>
            </div>
            <div class="entry-info">
              <h4>{{ entry.work }}</h4>
              <p>
                <el-icon><User /></el-icon>
                {{ entry.author }}
              </p>
            </div>
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

    <GameJam5EntryReviewDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :entry="dialogEntry"
      :score-hint="dialogScoreHintText"
      :star-count="starCount"
      :dimensions="dimensions"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import { Trophy, Calendar, Star, UserFilled, ArrowLeft, List, User, ChatDotRound } from '@element-plus/icons-vue'
import { gameJam5Entries } from '@/data/gameJam5Entries'
import GameJam5Awards from '@/components/gamejam/GameJam5Awards.vue'
import GameJam5EntryReviewDialog from '@/components/gamejam/GameJam5EntryReviewDialog.vue'
import GameJam5JudgeWall from '@/components/gamejam/GameJam5JudgeWall.vue'
import {
  gameJam5DisplayEntriesKey,
  useGameJam5DisplayEntries
} from '@/composables/useGameJam5DisplayEntries'

const displayEntries = useGameJam5DisplayEntries()
provide(gameJam5DisplayEntriesKey, displayEntries)

const dialogVisible = displayEntries.dialogVisible
const dialogEntry = displayEntries.dialogEntry
const dialogTitle = displayEntries.dialogTitle
const starCount = displayEntries.starCount
const dimensions = displayEntries.dimensions

const dialogScoreHintText = computed(() =>
  dialogEntry.value ? displayEntries.dialogScoreHint(dialogEntry.value) : ''
)

interface ScheduleItem {
  phase: string
  desc: string
}

const entries = gameJam5Entries

const schedule: ScheduleItem[] = [
  { phase: '主题公布', desc: '赛事开始时一并公布主题，计时随即开始' },
  { phase: '制作阶段', desc: '2026年4月29日 10:00 开始，共 7 天，参赛者自由安排开发时间' },
  { phase: '提交截止', desc: '2026年5月6日 10:00（中国标准时间），逾期将不予受理' },
  { phase: '投票阶段', desc: '提交截止后开放，具体时间由主办方公布' },
  { phase: '结果公布', desc: '已公布获奖名单与评委点评' }
]

const sponsors: string[] = [
  '八云铀柚子',
  'JrD',
  '陌上竹',
  '下划线瞎子',
  '百泽',
  '花开富贵',
  '轻风云再起',
  'Monky、',
  'Jaxson',
  '大吉赐福',
  '老白',
  '三川'
]
</script>

<style scoped lang="scss">
.gamejam-page {
  width: 100%;
  padding-bottom: 64px;
  color: var(--text-primary);
}

.section-container {
  // uses .page-container max-width
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
    margin: 0 auto 20px;
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

/* 赛程安排 */
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

  .col-phase {
    width: 140px;
    flex-shrink: 0;
    font-weight: 600;
    color: var(--text-primary);
  }

  .col-desc {
    flex: 1;
    color: var(--text-regular);
  }
}

/* 提交作品 */
.entries-section {
  margin-bottom: 56px;

  .entries-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .entry-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: all 0.2s;

    &:hover {
      background: var(--color-secondary);
      transform: translateY(-1px);
    }
  }

  .entry-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    span {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
    }
  }

  .entry-info {
    flex: 1;
    min-width: 0;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
      word-break: break-word;
      line-height: 1.4;
    }

    p {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
}

/* 评委点评 */
.judge-wall-section {
  margin-bottom: 56px;
}

/* 获奖名单 */
.winner-section {
  margin-bottom: 56px;
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
  .entries-grid { grid-template-columns: 1fr; }
  .sponsors-grid { grid-template-columns: repeat(2, 1fr); }

  .schedule-table {
    .col-phase { width: 100px; }
    .schedule-row, .schedule-header { padding: 12px 14px; font-size: 13px; }
  }
}

@media (max-width: 480px) {
  .sponsors-grid { grid-template-columns: 1fr; }
}
</style>
