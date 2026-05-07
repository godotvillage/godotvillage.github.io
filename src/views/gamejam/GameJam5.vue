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
        <p class="hero-desc">49人报名参赛，比赛火热进行中。</p>
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

    <!-- 获奖名单（待公布） -->
    <section class="winner-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><Trophy /></el-icon>
          获奖名单
        </h2>
        <div class="pending-card">
          <el-icon :size="32"><Clock /></el-icon>
          <p>投票结束后公布最终排名与点评，敬请期待</p>
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
import { Trophy, Calendar, Star, UserFilled, ArrowLeft, List, User, Clock } from '@element-plus/icons-vue'

interface ScheduleItem {
  phase: string
  desc: string
}

interface Entry {
  author: string
  work: string
}

const schedule: ScheduleItem[] = [
  { phase: '主题公布', desc: '赛事开始时一并公布主题，计时随即开始' },
  { phase: '制作阶段', desc: '2026年4月29日 10:00 开始，共 7 天，参赛者自由安排开发时间' },
  { phase: '提交截止', desc: '2026年5月6日 10:00（中国标准时间），逾期将不予受理' },
  { phase: '投票阶段', desc: '提交截止后开放，具体时间由主办方公布' },
  { phase: '结果公布', desc: '投票结束后公布最终排名与点评' }
]

const entries: Entry[] = [
  { author: 'Valar', work: '十秒臭豆腐，挣够100就收手' },
  { author: '凉城清风', work: '十秒爬塔' },
  { author: '百泽', work: '因为吃外卖没有勺子然后发现了一个比赛冠军能获得无限的金钱或者一把勺子所以前进吧' },
  { author: '傅霜', work: '十秒跑酷' },
  { author: '陌上竹', work: '十秒无双' },
  { author: '热爱生活', work: '分头行动' },
  { author: '戈多戈', work: '十秒快答' },
  { author: '三川', work: '我的小猫能撑十秒' },
  { author: '大吉赐福', work: '重生之我是五月食伍' },
  { author: '无人知晓', work: '10sec1.2' },
  { author: 'JrD', work: '10sec' },
  { author: '哈气的～', work: '购物狂欢节' },
  { author: '雪里蕻', work: '十秒速消' },
  { author: '发光', work: '抓史莱姆' },
  { author: '轻风云再起', work: '小鸡冒险记' },
  { author: '帆帆月影', work: '针要射了' },
  { author: '鸽鸽鸽鸽鸽鸽鸽', work: '十秒不动' },
  { author: '夜𝒟𝑎𝑦 ¹⁹⁰', work: '10秒跳一跳' },
  { author: '咩咩青羽', work: '10秒无限突破' }
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
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
  width: 90%;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #94A3B8;
  text-decoration: none;
  font-size: 14px;
  padding: 16px 0;
  transition: color 0.2s;

  &:hover { color: #F8FAFC; }
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #F8FAFC;
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
    color: #F8FAFC;
    margin-bottom: 16px;
    line-height: 1.2;
  }

  .hero-desc {
    font-size: 16px;
    color: #94A3B8;
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
      .stat-label { font-size: 14px; color: #64748B; }
    }
  }
}

/* 赛程安排 */
.schedule-section {
  margin-bottom: 56px;

  .schedule-table {
    background: #1E293B;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    overflow: hidden;
  }

  .schedule-header {
    display: flex;
    padding: 14px 20px;
    background: rgba(255, 255, 255, 0.04);
    font-size: 13px;
    font-weight: 600;
    color: #94A3B8;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .schedule-row {
    display: flex;
    padding: 14px 20px;
    font-size: 14px;
    color: #CBD5E1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.2s;

    &:last-child { border-bottom: none; }
    &:hover { background: rgba(255, 255, 255, 0.03); }
  }

  .col-phase {
    width: 140px;
    flex-shrink: 0;
    font-weight: 600;
    color: #F8FAFC;
  }

  .col-desc {
    flex: 1;
    color: #94A3B8;
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
    background: #1E293B;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: all 0.2s;

    &:hover {
      background: #273549;
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
      color: #F8FAFC;
      margin-bottom: 4px;
      word-break: break-word;
      line-height: 1.4;
    }

    p {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #64748B;
    }
  }
}

/* 获奖名单（待公布） */
.winner-section {
  margin-bottom: 56px;

  .pending-card {
    background: #1E293B;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 48px 24px;
    text-align: center;
    color: #64748B;

    .el-icon {
      margin-bottom: 12px;
    }

    p {
      font-size: 15px;
      color: #94A3B8;
    }
  }
}

/* 赞助者 */
.sponsors-section {
  .sponsors-desc {
    font-size: 14px;
    color: #94A3B8;
    margin-bottom: 20px;
  }

  .sponsors-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .sponsor-card {
    background: #1E293B;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #CBD5E1;
    transition: all 0.2s;

    &:hover { background: #273549; transform: translateY(-1px); }
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
