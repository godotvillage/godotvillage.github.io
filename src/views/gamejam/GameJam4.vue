<template>
  <div class="gamejam-page">
    <!-- 返回 -->
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
          第四届
        </div>
        <h1 class="hero-title">Godot新手村游戏制作大赛</h1>
        <p class="hero-desc">经过12天的赛程，本次比赛已经圆满结束。感谢群友积极响应和支持。</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-num">25</span>
            <span class="stat-label">参赛人数</span>
          </div>
          <div class="hero-stat">
            <span class="stat-num">12</span>
            <span class="stat-label">提交作品</span>
          </div>
          <div class="hero-stat">
            <span class="stat-num">14</span>
            <span class="stat-label">参与投票</span>
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

    <!-- 获奖名单 -->
    <section class="winners-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><Trophy /></el-icon>
          获奖名单
        </h2>

        <!-- 主要奖项 -->
        <div class="award-group">
          <h3 class="award-group-title">主要奖项</h3>
          <div class="award-cards">
            <div
              v-for="item in mainAwards"
              :key="item.code"
              class="award-card"
              :class="'award-' + item.level"
            >
              <div class="award-badge">{{ item.label }}</div>
              <div class="award-info">
                <h4>{{ item.work }}</h4>
                <p class="award-author">{{ item.author }}</p>
                <p class="award-code">代号-{{ item.code }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 受欢迎奖 -->
        <div class="award-group">
          <h3 class="award-group-title">受欢迎奖</h3>
          <div class="popular-list">
            <div
              v-for="item in popularAwards"
              :key="item.code + item.label"
              class="popular-item"
            >
              <span class="popular-label">{{ item.label }}</span>
              <span class="popular-code">{{ item.code }}</span>
              <span class="popular-work">{{ item.work }}</span>
              <span class="popular-author">{{ item.author }}</span>
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
          <div
            v-for="sponsor in sponsors"
            :key="sponsor"
            class="sponsor-card"
          >
            <el-icon><UserFilled /></el-icon>
            <span>{{ sponsor }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 总结 -->
    <section class="summary-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><Document /></el-icon>
          比赛总结
        </h2>
        <div class="summary-card">
          <p>最终有25位群友参赛，12名群友成功提交作品，14位观众为自己喜欢的游戏投出了重要的一票。</p>
          <p>以下为获奖名单：</p>
          <p>一等奖：I-阿鱼-爆炸箱</p>
          <p>二等奖：A-斓-极速爆冲</p>
          <p>三等奖：B-轻风云再起-经营农场</p>
          <p>受欢迎第一名：I-阿鱼-爆炸箱</p>
          <p>受欢迎第二名：B-轻风云再起-经营农场 / H-新手Freeman-农场大作战 / V-传梦-克制与爆炸</p>
          <p>受欢迎第五名：A-斓-极速爆冲 / Q-热爱生活-炸弹飞人 / W-BYEBYE-像素戈多堂 / X-戈多戈-爆裂深海</p>
          <p>奖金将通过QQ群内红包发放，如无法接收，请联系管理员通过其他渠道发放。</p>
          <p class="summary-thanks">再次感谢群友的支持与响应。请期待下次比赛！</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Trophy, Calendar, Star, Document, UserFilled, ArrowLeft } from '@element-plus/icons-vue'

interface ScheduleItem {
  phase: string
  start: string
  end: string
}

interface AwardItem {
  label: string
  level: string
  code: string
  work: string
  author: string
}

interface PopularAward {
  label: string
  code: string
  work: string
  author: string
}

const schedule: ScheduleItem[] = [
  { phase: '预热', start: '2025年12月8日', end: '2025年12月14日' },
  { phase: '报名', start: '2025年12月8日', end: '2025年12月20日' },
  { phase: '参赛人员制作', start: '2025年12月15日', end: '2025年12月22日' },
  { phase: '参赛人员提交', start: '2025年12月20日', end: '2025年12月22日' },
  { phase: '提交截止', start: '2025年12月22日', end: '2025年12月22日' },
  { phase: '评委+观众评分+投票', start: '2025年12月23日', end: '2025年12月26日' },
  { phase: '发奖', start: '2025年12月27日', end: '2025年12月27日' }
]

const mainAwards: AwardItem[] = [
  { label: '一等奖', level: '1', code: 'I', work: '爆炸箱', author: '阿鱼' },
  { label: '二等奖', level: '2', code: 'A', work: '极速爆冲', author: '斓' },
  { label: '三等奖', level: '3', code: 'B', work: '经营农场', author: '轻风云再起' }
]

const popularAwards: PopularAward[] = [
  { label: '受欢迎第一名', code: 'I', work: '爆炸箱', author: '阿鱼' },
  { label: '受欢迎第二名', code: 'B', work: '经营农场', author: '轻风云再起' },
  { label: '受欢迎第二名', code: 'H', work: '农场大作战', author: '新手Freeman' },
  { label: '受欢迎第二名', code: 'V', work: '克制与爆炸', author: '传梦' },
  { label: '受欢迎第五名', code: 'A', work: '极速爆冲', author: '斓' },
  { label: '受欢迎第五名', code: 'Q', work: '炸弹飞人', author: '热爱生活' },
  { label: '受欢迎第五名', code: 'W', work: '像素戈多堂', author: 'BYEBYE' },
  { label: '受欢迎第五名', code: 'X', work: '爆裂深海', author: '戈多戈' }
]

const sponsors: string[] = [
  '陌上竹',
  '【闭门FW】-Monky、',
  'Valar',
  '斓',
  '下划线瞎子',
  '小咩咩',
  'Goodman',
  '花开富贵',
  '杀手冷血小浣熊',
  '来看看'
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

  &:hover {
    color: #F8FAFC;
  }
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

      .stat-label {
        font-size: 14px;
        color: #64748B;
      }
    }
  }
}

/* 时间安排 */
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

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }
  }

  .col-phase {
    flex: 1;
  }

  .col-start {
    width: 180px;
    text-align: center;
    color: #94A3B8;
  }

  .col-end {
    width: 180px;
    text-align: center;
    color: #94A3B8;
  }
}

/* 获奖名单 */
.winners-section {
  margin-bottom: 56px;

  .award-group {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .award-group-title {
    font-size: 16px;
    font-weight: 600;
    color: #F8FAFC;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
}

/* 主要奖项卡片 */
.award-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.award-card {
  background: #1E293B;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 28px 20px 20px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }

  &.award-1 {
    border-color: rgba(251, 191, 36, 0.4);
  }

  &.award-2 {
    border-color: rgba(148, 163, 184, 0.35);
  }

  &.award-3 {
    border-color: rgba(180, 83, 9, 0.3);
  }

  .award-badge {
    display: inline-block;
    padding: 4px 16px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
  }

  &.award-1 .award-badge {
    background: linear-gradient(135deg, #FBBF24, #F59E0B);
  }

  &.award-2 .award-badge {
    background: linear-gradient(135deg, #94A3B8, #64748B);
  }

  &.award-3 .award-badge {
    background: linear-gradient(135deg, #B45309, #92400E);
  }

  .award-code {
    font-size: 12px;
    color: #64748B;
    margin-top: 8px;
  }

  .award-info {
    h4 {
      font-size: 20px;
      font-weight: 700;
      color: #F8FAFC;
      margin-bottom: 6px;
    }

    .award-author {
      font-size: 14px;
      color: #94A3B8;
      margin-bottom: 0;
    }
  }
}

/* 受欢迎奖列表 */
.popular-list {
  background: #1E293B;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
}

.popular-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 14px;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .popular-label {
    color: #60A5FA;
    font-weight: 600;
    white-space: nowrap;
  }

  .popular-code {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(96, 165, 250, 0.15);
    color: #60A5FA;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 15px;
    flex-shrink: 0;
  }

  .popular-work {
    flex: 1;
    color: #F8FAFC;
    font-weight: 500;
  }

  .popular-author {
    color: #94A3B8;
    flex-shrink: 0;
  }
}

/* 赞助者 */
.sponsors-section {
  margin-bottom: 56px;

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

    &:hover {
      background: #273549;
      transform: translateY(-1px);
    }

    .el-icon {
      color: #FBBF24;
      flex-shrink: 0;
    }
  }
}

/* 总结 */
.summary-section {
  .summary-card {
    background: #1E293B;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 28px;
    line-height: 2;
    font-size: 14px;
    color: #CBD5E1;

    p {
      margin-bottom: 0;
    }

    .summary-thanks {
      margin-top: 16px;
      font-weight: 600;
      color: #F8FAFC;
      font-size: 15px;
    }
  }
}

@media (max-width: 768px) {
  .jam-hero .hero-title {
    font-size: 32px;
  }

  .jam-hero .hero-stats {
    gap: 24px;
  }

  .award-cards {
    grid-template-columns: 1fr;
  }

  .sponsors-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .schedule-table {
    .col-start,
    .col-end {
      width: 120px;
      font-size: 12px;
    }

    .schedule-row,
    .schedule-header {
      padding: 12px 14px;
      font-size: 13px;
    }
  }

  .popular-item {
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .sponsors-grid {
    grid-template-columns: 1fr;
  }
}
</style>
