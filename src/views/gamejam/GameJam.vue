<template>
  <div class="gamejam-list-page">
    <!-- Hero -->
    <section class="list-hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <el-icon><Trophy /></el-icon>
          GameJam
        </div>
        <h1 class="hero-title">往届记录</h1>
        <p class="hero-desc">Godot新手村游戏制作大赛历届回顾</p>
      </div>
    </section>

    <!-- 历届列表 -->
    <section class="editions-section">
      <div class="section-container">
        <div class="editions-grid">
          <router-link
            v-for="edition in editions"
            :key="edition.num"
            :to="edition.hasData ? '/gamejam/' + edition.num : '#'"
            class="edition-card"
            :class="{ clickable: edition.hasData, placeholder: !edition.hasData }"
            @click.prevent="!edition.hasData && $event.preventDefault()"
          >
            <div class="edition-num">第{{ edition.label }}届</div>
            <h2 class="edition-title">{{ edition.title }}</h2>
            <div class="edition-date" v-if="edition.date">
              <el-icon><Calendar /></el-icon>
              {{ edition.date }}
            </div>
            <div class="edition-stats" v-if="edition.stats">
              <span v-for="stat in edition.stats" :key="stat" class="stat-chip">{{ stat }}</span>
            </div>
            <div class="edition-action" v-if="edition.hasData">
              <span>查看详情</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
            <div class="edition-coming" v-else>
              <span>敬请期待</span>
            </div>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Trophy, Calendar, ArrowRight } from '@element-plus/icons-vue'

interface Edition {
  num: number
  label: string
  title: string
  date?: string
  stats?: string[]
  hasData: boolean
}

const editions: Edition[] = [
  {
    num: 5,
    label: '五',
    title: 'Godot新手村游戏制作大赛',
    date: '2026年4月',
    stats: ['49人报名', '19个作品'],
    hasData: true
  },
  {
    num: 4,
    label: '四',
    title: 'Godot新手村游戏制作大赛',
    date: '2025年12月',
    stats: ['25人参赛', '12个作品', '14人投票'],
    hasData: true
  },
  {
    num: 3,
    label: '三',
    title: 'Godot新手村游戏制作大赛',
    date: '2025年9月',
    stats: ['17人参赛', '10个作品', '9票'],
    hasData: true
  },
  {
    num: 2,
    label: '二',
    title: '编程比赛',
    date: '2025年',
    stats: ['13个作品'],
    hasData: true
  },
  {
    num: 1,
    label: '一',
    title: '编程比赛 · 连连看',
    date: '2025年5月',
    stats: ['12个作品', '连连看主题'],
    hasData: true
  }
]
</script>

<style scoped lang="scss">
.gamejam-list-page {
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

/* Hero */
.list-hero {
  position: relative;
  padding: 80px 24px 64px;
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

  .hero-content {
    position: relative;
    z-index: 1;
  }

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
  }
}

/* Editions */
.editions-section {
  .editions-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .edition-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 28px 32px;
    text-decoration: none;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 24px;

    &.clickable:hover {
      background: var(--color-secondary);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      border-color: rgba(251, 191, 36, 0.3);
    }

    &.placeholder {
      opacity: 0.5;
      cursor: default;
    }
  }

  .edition-num {
    font-size: 14px;
    font-weight: 700;
    color: #FBBF24;
    background: rgba(251, 191, 36, 0.12);
    padding: 6px 14px;
    border-radius: 8px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .edition-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
    min-width: 0;
  }

  .edition-date {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-secondary);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .edition-stats {
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    .stat-chip {
      font-size: 12px;
      color: var(--text-regular);
      background: rgba(255, 255, 255, 0.05);
      padding: 3px 10px;
      border-radius: 6px;
      white-space: nowrap;
    }
  }

  .edition-action {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #60A5FA;
    font-size: 14px;
    white-space: nowrap;
    flex-shrink: 0;
    transition: gap 0.2s;

    .clickable:hover & {
      gap: 10px;
    }
  }

  .edition-coming {
    font-size: 13px;
    color: var(--text-secondary);
    white-space: nowrap;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .list-hero .hero-title {
    font-size: 32px;
  }

  .edition-card {
    flex-wrap: wrap;
    gap: 14px;
    padding: 20px 24px;
  }

  .edition-stats {
    width: 100%;
    order: 1;
  }
}
</style>
