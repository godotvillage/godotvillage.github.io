<template>
  <div class="mascot-page">
    <!-- 角色信息 -->
    <section class="profile-section">
      <div class="profile-card">
        <div class="profile-images">
          <div class="design-image main-image">
            <img src="/godotvillagegirl.png" alt="看板娘人设" />
          </div>
          <div class="design-image sub-image">
            <img src="/mascot/魔法学徒2.png" alt="魔法学徒形态" />
          </div>
        </div>

        <div class="profile-info">
          <div class="name-block">
            <div class="name-hidden">███</div>
            <span class="name-label">名字暂不公开</span>
          </div>

          <div class="info-list">
            <div class="info-item">
              <span class="info-icon">📖</span>
              <div class="info-body">
                <h4>身份</h4>
                <p>魔法学徒 · 见习研究者</p>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">🎨</span>
              <div class="info-body">
                <h4>外貌</h4>
                <p>白色长发如月光倾泻，一副细框眼镜衬着专注的眉眼。腰间那本厚重的魔法书从不离身——那是她研习法术的伙伴，也是她记录旅途的日记。</p>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">✨</span>
              <div class="info-body">
                <h4>性格</h4>
                <p>沉静而好学，话虽不多却总能一针见血。比起喧闹的讨论，她更享受独自翻阅古籍的时光。遇到难题时不会轻易求助，而是先默默翻遍手边的资料——不过，若有人真诚请教，她也会推一推眼镜，耐心解答。</p>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">💎</span>
              <div class="info-body">
                <h4>偏好</h4>
                <p>对 Godot 主题的蓝色有着近乎执着的偏爱，从发带上的装饰到魔法书签的穗子，处处可见那一抹蓝。擅长记录与整理，她的魔法笔记被前辈们评价为"比正式文献还好用"。</p>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">🔮</span>
              <div class="info-body">
                <h4>魔法体系</h4>
                <p>以腰间的魔法书为媒介施展法术。不同于传统法师的咒语吟唱，她将法术公式与代码逻辑融合，创造出独树一帜的"脚本魔法"。据说她正在研究如何用一行优雅的咒语同时召唤出十个节点……</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 表情包 -->
    <section class="emotes-section">
      <h2 class="section-title">表情包合集</h2>

      <div v-for="(episode, idx) in episodes" :key="idx" class="episode-block">
        <h3 class="episode-title">
          <span class="episode-num">第{{ toChineseNum(idx + 1) }}弹</span>
        </h3>
        <div class="emote-grid">
          <div v-for="img in episode.images" :key="img" class="emote-item">
            <img :src="`/mascot/emotes/${img}`" :alt="img" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const episodes = [
  {
    images: ['1-1.png', '1-2.png', '1-3.png', '1-4.png']
  },
  {
    images: ['2-1.jpeg', '2-2.jpg', '2-3.jpg', '2-4.jpg', '2-5.jpg']
  },
  {
    images: ['3-1.jpg', '3-2.png', '3-3.jpg', '3-4.jpg']
  },
  {
    images: ['4-1.jpg', '4-2.jpg', '4-3.jpg', '4-4.jpg']
  }
]

function toChineseNum(n: number): string {
  return ['一', '二', '三', '四'][n - 1] || String(n)
}
</script>

<style scoped lang="scss">
.mascot-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 24px 80px;
  width: 90%;
}

/* Profile */
.profile-section {
  margin-bottom: 64px;
}

.profile-card {
  display: flex;
  gap: 48px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 32px;
  }
}

.profile-images {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 300px;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: row;
    gap: 12px;
  }
}

.design-image {
  border-radius: 16px;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid var(--border-color);

  img {
    display: block;
    width: 100%;
    height: auto;
  }

  &.main-image {
    @media (max-width: 768px) {
      flex: 1;
    }
  }

  &.sub-image {
    @media (max-width: 768px) {
      flex: 1;
    }
  }
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.name-block {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;

  .name-hidden {
    background: #1a1a2e;
    color: #1a1a2e;
    font-size: 32px;
    font-weight: 700;
    padding: 4px 24px;
    border-radius: 8px;
    letter-spacing: 8px;
    user-select: none;
  }

  .name-label {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-item {
  display: flex;
  gap: 14px;

  .info-icon {
    font-size: 22px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .info-body {
    h4 {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px;
    }

    p {
      font-size: 14px;
      color: var(--text-regular);
      line-height: 1.7;
      margin: 0;
    }
  }
}

/* Emotes */
.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 32px;
  font-family: var(--font-heading);
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '🎭';
  }
}

.episode-block {
  margin-bottom: 40px;

  &:last-child {
    margin-bottom: 0;
  }
}

.episode-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;

  .episode-num {
    background: linear-gradient(135deg, #60A5FA, #3B82F6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.emote-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.emote-item {
  border-radius: 12px;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.03);
  }

  img {
    display: block;
    width: 100%;
    height: auto;
  }
}
</style>
