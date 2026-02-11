<template>
  <div class="gamejam-result">
    <!-- Header Stats -->
    <div class="stats-container">
      <div class="stat-item">
        <div class="number">25</div>
        <div class="label">参赛群友</div>
      </div>
      <div class="stat-item">
        <div class="number">12</div>
        <div class="label">成功提交</div>
      </div>
      <div class="stat-item">
        <div class="number">14</div>
        <div class="label">参与投票</div>
      </div>
    </div>

    <!-- Winners Section -->
    <div class="winners-section">
      <h2 class="section-title">🏆 获奖名单</h2>
      
      <!-- Top 3 -->
      <div class="podium">
        <div class="rank-card rank-2">
          <div class="medal">🥈</div>
          <div class="rank-title">二等奖</div>
          <div class="game-name">极速爆冲</div>
          <div class="author">A-斓</div>
        </div>
        
        <div class="rank-card rank-1">
          <div class="medal">🥇</div>
          <div class="rank-title">一等奖</div>
          <div class="game-name">爆炸箱</div>
          <div class="author">I-阿鱼</div>
        </div>
        
        <div class="rank-card rank-3">
          <div class="medal">🥉</div>
          <div class="rank-title">三等奖</div>
          <div class="game-name">经营农场</div>
          <div class="author">B-轻风云再起</div>
        </div>
      </div>

      <!-- Popularity Awards -->
      <h3 class="sub-title">💖 最受欢迎奖</h3>
      
      <div class="pop-category">
        <div class="pop-title">第一名</div>
        <div class="pop-list">
           <div class="pop-item">I-阿鱼 - 爆炸箱</div>
        </div>
      </div>

      <div class="pop-category">
        <div class="pop-title">第二名</div>
        <div class="pop-list">
           <div class="pop-item">B-轻风云再起 - 经营农场</div>
           <div class="pop-item">H-新手Freeman - 农场大作战</div>
           <div class="pop-item">V-传梦 - 克制与爆炸</div>
        </div>
      </div>

      <div class="pop-category">
        <div class="pop-title">第五名</div>
        <div class="pop-list">
           <div class="pop-item">A-斓 - 极速爆冲</div>
           <div class="pop-item">Q-热爱生活 - 炸弹飞人</div>
           <div class="pop-item">W-BYEBYE - 像素戈多堂</div>
           <div class="pop-item">X-戈多戈 - 爆裂深海</div>
        </div>
      </div>
    </div>

    <!-- Sponsors -->
    <div class="sponsors-section">
      <h2 class="section-title">🤝 感谢赞助</h2>
      <div class="sponsor-list">
        <span class="sponsor" v-for="name in sponsors" :key="name">{{ name }}</span>
      </div>
    </div>
    
    <div class="footer-note">
      奖金将通过QQ群内红包发放，如无法接收，请联系管理员通过其他渠道发放。<br>
      再次感谢群友的支持与响应。请期待下次比赛！
    </div>
  </div>
</template>

<script setup lang="ts">
const sponsors = [
  "Monky",
  "Valar",
  "斓",
  "陌上竹",
  "下划线瞎子",
  "小咩咩",
  "Goodman",
  "花开富贵",
  "杀手冷血小浣熊",
  "来看看"
];
</script>

<style lang="scss" scoped>
.gamejam-result {
  padding: 2rem 0;
}

.stats-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: 3rem;
  background: var(--c-bg-soft);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
  .stat-item {
    text-align: center;
    
    .number {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--c-brand);
      line-height: 1.2;
    }
    
    .label {
      font-size: 0.9rem;
      color: var(--c-text-lighter);
    }
  }
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  border: none;
}

.sub-title {
  text-align: center;
  margin: 2rem 0 1rem;
  font-size: 1.4rem;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;

  .rank-card {
    background: var(--c-bg-soft);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: transform 0.3s;
    width: 180px;
    
    &:hover {
      transform: translateY(-5px);
    }

    .medal {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }

    .rank-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: var(--c-text-light);
    }

    .game-name {
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--c-brand);
      margin-bottom: 0.25rem;
    }

    .author {
      font-size: 0.9rem;
      color: var(--c-text-lighter);
    }

    &.rank-1 {
      order: 2;
      padding-bottom: 3rem;
      background: linear-gradient(to bottom, var(--c-bg-soft), rgba(255, 215, 0, 0.1));
      border: 2px solid rgba(255, 215, 0, 0.3);
      transform: scale(1.1);
      z-index: 2;
      
      &:hover {
        transform: scale(1.1) translateY(-5px);
      }
    }
    
    &.rank-2 {
      order: 1;
      border: 1px solid rgba(192, 192, 192, 0.3);
    }
    
    &.rank-3 {
      order: 3;
      border: 1px solid rgba(205, 127, 50, 0.3);
    }
  }
}

.pop-category {
  margin-bottom: 1.5rem;
  text-align: center;
  
  .pop-title {
    font-weight: bold;
    color: var(--c-brand);
    margin-bottom: 0.5rem;
  }
  
  .pop-list {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    
    .pop-item {
      background: var(--c-bg-soft);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.95rem;
      border: 1px solid var(--c-border);
    }
  }
}

.sponsors-section {
  margin-top: 4rem;
  text-align: center;
  padding: 2rem;
  background: var(--c-bg-soft);
  border-radius: 12px;
  
  .sponsor-list {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
    
    .sponsor {
      font-weight: bold;
      color: var(--c-text);
      padding: 0.25rem 0.5rem;
      
      &:first-child {
        width: 100%;
        margin-bottom: 0.5rem;
        color: var(--c-brand);
      }
    }
  }
}

.footer-note {
  margin-top: 3rem;
  text-align: center;
  color: var(--c-text-lighter);
  font-size: 0.9rem;
  line-height: 1.6;
}

// Mobile adaptation
@media (max-width: 719px) {
  .podium {
    flex-direction: column;
    align-items: center;
    
    .rank-card {
      width: 100%;
      max-width: 280px;
      
      &.rank-1 {
        order: -1;
        transform: none;
        
        &:hover {
          transform: translateY(-5px);
        }
      }
    }
  }
}
</style>
