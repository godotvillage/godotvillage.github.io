<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="min(600px, 92vw)"
    class="entry-dialog"
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <template v-if="entry">
      <div class="dialog-header">
        <el-image :src="coverUrl" fit="cover" class="dialog-cover">
          <template #error>
            <div class="dialog-cover-fallback">{{ entry.author.charAt(0) }}</div>
          </template>
        </el-image>
        <div class="dialog-header-text">
          <p class="dialog-author">
            <el-icon><User /></el-icon>
            {{ entry.author }}
          </p>
          <div class="dialog-score-badge">
            <el-icon class="dialog-score-icon"><Lightning /></el-icon>
            <span class="dialog-score-num">{{ entry.finalScore.toFixed(1) }}</span>
            <span class="dialog-score-hint">{{ scoreHint }}</span>
          </div>
        </div>
      </div>

      <div class="dialog-reviews">
        <section
          v-for="review in entry.reviews"
          :key="review.judgeId"
          class="dialog-review-block"
        >
          <header class="review-header">
            <div class="review-judge">
              <div class="judge-avatar">{{ review.judgeName.charAt(0) }}</div>
              <span class="judge-name">{{ review.judgeName }}</span>
            </div>
            <div class="review-stars">
              <el-icon
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= starCount(review.total) }"
              >
                <StarFilled v-if="i <= starCount(review.total)" />
                <Star v-else />
              </el-icon>
            </div>
            <span class="review-total">{{ review.total }} / 60</span>
          </header>
          <div class="dimension-list">
            <div
              v-for="dim in dimensions(review)"
              :key="dim.key"
              class="dimension-row"
            >
              <div class="dimension-label">
                <span>{{ dim.label }}</span>
                <span class="dimension-score">{{ dim.score }} / {{ dim.max }}</span>
              </div>
              <el-progress
                :percentage="Math.round((dim.score / dim.max) * 100)"
                :stroke-width="8"
                color="#fbbf24"
                :show-text="false"
              />
              <p v-if="dim.note" class="dimension-note">{{ dim.note }}</p>
            </div>
          </div>
          <p v-if="review.summary" class="dialog-summary">{{ review.summary }}</p>
        </section>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Lightning, Star, StarFilled, User } from '@element-plus/icons-vue'
import { gameJam5CoverUrl } from '@/data/gameJam5Entries'
import type { DimensionRow } from '@/composables/useGameJam5DisplayEntries'
import type { GameJam5DisplayEntry } from '@/utils/gameJam5Score'
import type { GameJam5JudgeReview } from '@/data/gameJam5JudgeScores'

const props = defineProps<{
  visible: boolean
  title: string
  entry: GameJam5DisplayEntry | null
  scoreHint: string
  starCount: (total: number) => number
  dimensions: (review: GameJam5JudgeReview) => DimensionRow[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const coverUrl = computed(() =>
  props.entry ? gameJam5CoverUrl(props.entry.entryId) : ''
)
</script>

<style scoped lang="scss">
.dialog-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.dialog-cover {
  width: 120px;
  height: 68px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #0f172a;
}

.dialog-cover-fallback {
  width: 120px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 8px;
}

.dialog-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.dialog-author {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.dialog-score-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.12));
  border: 1px solid rgba(251, 191, 36, 0.35);
  align-self: flex-start;
}

.dialog-score-icon {
  font-size: 16px;
  color: #fbbf24;
}

.dialog-score-num {
  font-size: 24px;
  font-weight: 800;
  color: #fbbf24;
  font-family: var(--font-heading);
}

.dialog-score-hint {
  font-size: 11px;
  color: var(--text-secondary);
}

.dialog-reviews {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: min(60vh, 520px);
  overflow-y: auto;
  padding-right: 4px;
}

.dialog-review-block {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
}

.review-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  margin-bottom: 14px;
}

.review-judge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.judge-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.judge-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.review-stars {
  display: flex;
  gap: 2px;

  .star {
    font-size: 16px;
    color: #475569;

    &.filled {
      color: #fbbf24;
    }
  }
}

.review-total {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--color-secondary);
  padding: 4px 10px;
  border-radius: 6px;
}

.dimension-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dimension-row {
  .dimension-label {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .dimension-score {
    color: #fbbf24;
    font-weight: 600;
  }

  .dimension-note {
    margin: 8px 0 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-regular);
  }
}

.dialog-summary {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-regular);
}

@media (max-width: 600px) {
  .review-total {
    margin-left: 0;
  }

  .dialog-header {
    flex-direction: column;
  }

  .dialog-cover,
  .dialog-cover-fallback {
    width: 100%;
    height: 140px;
  }
}
</style>
