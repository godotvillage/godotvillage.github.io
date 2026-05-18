<template>
  <div class="judge-wall">
    <div class="track-wrap">
      <button
        type="button"
        class="nav-btn nav-btn--prev"
        aria-label="上一页"
        :disabled="currentPage === 0"
        @click="goPrev"
      >
        <el-icon><ArrowLeft /></el-icon>
      </button>

      <div v-loading="audienceLoading" class="entry-viewport">
        <Transition :name="transitionName" mode="out-in">
          <div :key="currentPage" class="entry-grid">
            <article
              v-for="entry in visibleEntries"
              :key="entry.entryId"
              class="entry-card"
              role="button"
              tabindex="0"
              @click="openEntryDetail(entry)"
              @keydown.enter="openEntryDetail(entry)"
            >
              <el-image :src="coverUrl(entry.entryId)" fit="cover" class="entry-cover">
                <template #error>
                  <div class="entry-cover-fallback">{{ entry.author.charAt(0) }}</div>
                </template>
              </el-image>
              <div class="entry-body">
                <div class="entry-meta">
                  <h3 class="entry-title">{{ entry.work }}</h3>
                  <p class="entry-author">
                    <el-icon><User /></el-icon>
                    {{ entry.author }}
                  </p>
                  <span class="entry-score">{{ entry.finalScore.toFixed(1) }}</span>
                </div>
                <div class="entry-judge-summaries">
                  <div
                    v-for="review in sortedCardReviews(entry.reviews)"
                    :key="review.judgeId"
                    class="entry-judge-summary"
                    :class="{ 'entry-judge-summary--empty': !hasJudgeSummary(review) }"
                  >
                    <span class="entry-judge-name">{{ review.judgeName }}</span>
                    <p class="entry-judge-text">{{ judgeSummaryText(review) }}</p>
                  </div>
                </div>
                <span class="entry-hint">点击查看详细点评</span>
              </div>
            </article>
          </div>
        </Transition>
      </div>

      <button
        type="button"
        class="nav-btn nav-btn--next"
        aria-label="下一页"
        :disabled="currentPage >= totalPages - 1"
        @click="goNext"
      >
        <el-icon><ArrowRight /></el-icon>
      </button>
    </div>

    <p class="entry-index">
      第 {{ pageRangeStart }}–{{ pageRangeEnd }} 件 / 共 {{ scores.length }} 件
      <span class="entry-page">（{{ currentPage + 1 }} / {{ totalPages }} 页）</span>
    </p>

  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { ArrowLeft, ArrowRight, User } from '@element-plus/icons-vue'
import { gameJam5CoverUrl } from '@/data/gameJam5Entries'
import { gameJam5DisplayEntriesKey } from '@/composables/useGameJam5DisplayEntries'
import type { GameJam5JudgeReview } from '@/data/gameJam5JudgeScores'

const PAGE_SIZE = 3

const { audienceLoading, scores, openEntryDetail } = inject(gameJam5DisplayEntriesKey)!

const currentPage = ref(0)
const slideDirection = ref<'next' | 'prev'>('next')

const totalPages = computed(() => Math.ceil(scores.value.length / PAGE_SIZE))

const visibleEntries = computed(() => {
  const start = currentPage.value * PAGE_SIZE
  return scores.value.slice(start, start + PAGE_SIZE)
})

const transitionName = computed(() =>
  slideDirection.value === 'next' ? 'slide-next' : 'slide-prev'
)

const pageRangeStart = computed(() => currentPage.value * PAGE_SIZE + 1)

const pageRangeEnd = computed(() =>
  Math.min((currentPage.value + 1) * PAGE_SIZE, scores.value.length)
)

function goPrev() {
  if (currentPage.value > 0) {
    slideDirection.value = 'prev'
    currentPage.value -= 1
  }
}

function goNext() {
  if (currentPage.value < totalPages.value - 1) {
    slideDirection.value = 'next'
    currentPage.value += 1
  }
}

function coverUrl(entryId: string) {
  return gameJam5CoverUrl(entryId)
}

function hasJudgeSummary(review: GameJam5JudgeReview): boolean {
  return Boolean(review.summary?.trim())
}

function judgeSummaryText(review: GameJam5JudgeReview): string {
  const text = review.summary?.trim()
  return text || '暂无总评'
}

/** 有总评的评委靠前，无总评的沉底展示 */
function sortedCardReviews(reviews: GameJam5JudgeReview[]): GameJam5JudgeReview[] {
  const withSummary: GameJam5JudgeReview[] = []
  const withoutSummary: GameJam5JudgeReview[] = []
  for (const review of reviews) {
    if (hasJudgeSummary(review)) withSummary.push(review)
    else withoutSummary.push(review)
  }
  return [...withSummary, ...withoutSummary]
}

</script>

<style scoped lang="scss">
.judge-wall {
  width: 100%;
}

.track-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-regular);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s, border-color 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-secondary);
    color: var(--text-primary);
    border-color: rgba(251, 191, 36, 0.45);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.entry-viewport {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.entry-page {
  margin-left: 4px;
  color: var(--text-secondary);
  opacity: 0.85;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    opacity 0.32s ease,
    transform 0.32s ease;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(28px);
}

.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-28px);
}

.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-28px);
}

.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(28px);
}

.slide-next-enter-active .entry-card,
.slide-prev-enter-active .entry-card {
  animation: card-rise 0.38s ease backwards;
}

.slide-next-enter-active .entry-card:nth-child(1),
.slide-prev-enter-active .entry-card:nth-child(1) {
  animation-delay: 0.04s;
}

.slide-next-enter-active .entry-card:nth-child(2),
.slide-prev-enter-active .entry-card:nth-child(2) {
  animation-delay: 0.1s;
}

.slide-next-enter-active .entry-card:nth-child(3),
.slide-prev-enter-active .entry-card:nth-child(3) {
  animation-delay: 0.16s;
}

@keyframes card-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.entry-viewport :deep(.entry-grid) {
  width: 100%;
}

.entry-index {
  margin: 12px 0 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
}

.entry-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  text-align: left;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(251, 191, 36, 0.55);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }

  &:focus-visible {
    outline: 2px solid #fbbf24;
    outline-offset: 2px;
  }
}

.entry-cover {
  width: 100%;
  height: 158px;
  display: block;
  background: #0f172a;
}

.entry-cover-fallback {
  width: 100%;
  height: 158px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.entry-body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.entry-meta {
  position: relative;
  padding-right: 52px;
}

.entry-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-heading);
  line-height: 1.4;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.entry-author {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.entry-score {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 22px;
  font-weight: 800;
  color: #fbbf24;
  font-family: var(--font-heading);
  line-height: 1;
}

.entry-judge-summaries {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
}

.entry-judge-summary {
  margin: 0;

  &:not(.entry-judge-summary--empty) + .entry-judge-summary--empty {
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px dashed var(--border-color);
  }

  &--empty {

    .entry-judge-name {
      color: var(--text-secondary);
    }

    .entry-judge-text {
      color: var(--text-secondary);
      font-style: italic;
    }
  }
}

.entry-judge-name {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #fbbf24;
  margin-bottom: 4px;
}

.entry-judge-text {
  font-size: 12px;
  line-height: 1.55;
  color: var(--text-regular);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.entry-hint {
  font-size: 12px;
  color: #60a5fa;
}

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

@media (max-width: 960px) {
  .entry-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .nav-btn {
    width: 36px;
    height: 36px;
  }

  .track-wrap {
    gap: 8px;
  }

  .entry-cover,
  .entry-cover-fallback {
    height: 135px;
  }

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
