<template>
  <div class="awards-wrap">
    <!-- 最佳作品 -->
    <article
      class="award-card award-card--featured"
      role="button"
      tabindex="0"
      @click="openReview(featured.entryId)"
      @keydown.enter="openReview(featured.entryId)"
    >
      <el-image :src="coverUrl(featured.entryId)" fit="cover" class="award-cover">
        <template #error>
          <div class="award-cover-fallback">{{ featured.authors.charAt(0) }}</div>
        </template>
      </el-image>
      <div class="award-body">
        <div class="award-header">
          <span class="award-title">{{ featured.title }}</span>
          <span class="award-prize">奖金 {{ featured.prizeShare }}</span>
        </div>
        <h3 class="award-work">{{ featured.work }}</h3>
        <p class="award-author">
          <el-icon><User /></el-icon>
          {{ featured.authors }}
        </p>
        <span class="award-hint">查看评委点评</span>
      </div>
    </article>

    <!-- 其余奖项 -->
    <div class="award-grid">
      <article
        v-for="item in others"
        :key="item.id"
        class="award-card"
        role="button"
        tabindex="0"
        @click="openReview(item.entryId)"
        @keydown.enter="openReview(item.entryId)"
      >
        <el-image :src="coverUrl(item.entryId)" fit="cover" class="award-cover">
          <template #error>
            <div class="award-cover-fallback">{{ item.authors.charAt(0) }}</div>
          </template>
        </el-image>
        <div class="award-body">
          <div class="award-header">
            <span class="award-title">{{ item.title }}</span>
            <span class="award-prize">奖金 {{ item.prizeShare }}</span>
          </div>
          <h3 class="award-work">{{ item.work }}</h3>
          <p class="award-author">
            <el-icon><User /></el-icon>
            {{ item.authors }}
          </p>
          <span class="award-hint">查看评委点评</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { User } from '@element-plus/icons-vue'
import { gameJam5CoverUrl } from '@/data/gameJam5Entries'
import { gameJam5FeaturedAward, gameJam5OtherAwards } from '@/data/gameJam5Awards'
import { gameJam5DisplayEntriesKey } from '@/composables/useGameJam5DisplayEntries'

const featured = gameJam5FeaturedAward
const others = gameJam5OtherAwards

const { openEntryById } = inject(gameJam5DisplayEntriesKey)!

function coverUrl(entryId: string): string {
  return gameJam5CoverUrl(entryId)
}

function openReview(entryId: string) {
  openEntryById(entryId)
}
</script>

<style scoped lang="scss">
.awards-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.award-card {
  display: flex;
  gap: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
    border-color: rgba(251, 191, 36, 0.35);
  }

  &:focus-visible {
    outline: 2px solid #fbbf24;
    outline-offset: 2px;
  }

  &--featured {
    border-color: rgba(251, 191, 36, 0.45);
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.06), var(--card-bg));

    .award-cover {
      width: 200px;
      height: 140px;
    }

    .award-work {
      font-size: 18px;
    }
  }
}

.award-cover {
  width: 120px;
  height: 90px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-secondary);
}

.award-cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.award-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.award-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.award-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-heading);
}

.award-prize {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.award-work {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.45;
  margin-bottom: 8px;
  word-break: break-word;
}

.award-author {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: auto;
}

.award-hint {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.85;
}

.award-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .award-card {
    flex-direction: column;
    padding: 16px;
  }

  .award-cover {
    width: 100%;
    height: 120px;
  }
}

@media (max-width: 768px) {
  .award-card--featured {
    flex-direction: column;

    .award-cover {
      width: 100%;
      height: 160px;
    }
  }

  .award-grid {
    grid-template-columns: 1fr;
  }
}
</style>
