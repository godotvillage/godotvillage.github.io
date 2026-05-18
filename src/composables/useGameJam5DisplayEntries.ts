import { computed, onMounted, ref, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import { getGameJamAudienceAggregates } from '@/api/gameJamVote'
import { gameJam5Edition } from '@/data/gameJam5Entries'
import { gameJam5JudgeScores, type GameJam5JudgeReview } from '@/data/gameJam5JudgeScores'
import {
  buildGameJam5DisplayEntries,
  type GameJam5AudienceAggregate,
  type GameJam5DisplayEntry
} from '@/utils/gameJam5Score'

export interface GameJam5DisplayEntriesContext {
  audienceLoading: Ref<boolean>
  scores: ComputedRef<GameJam5DisplayEntry[]>
  dialogVisible: Ref<boolean>
  dialogEntry: Ref<GameJam5DisplayEntry | null>
  dialogTitle: Ref<string>
  openEntryDetail: (entry: GameJam5DisplayEntry) => void
  openEntryById: (entryId: string) => void
  starCount: (total: number) => number
  dialogScoreHint: (entry: GameJam5DisplayEntry) => string
  dimensions: (review: GameJam5JudgeReview) => DimensionRow[]
}

export interface DimensionRow {
  key: string
  label: string
  score: number
  max: number
  note: string
}

export const gameJam5DisplayEntriesKey: InjectionKey<GameJam5DisplayEntriesContext> =
  Symbol('gameJam5DisplayEntries')

export function useGameJam5DisplayEntries(): GameJam5DisplayEntriesContext {
  const audienceByEntryId = ref<Map<string, GameJam5AudienceAggregate>>(new Map())
  const audienceLoading = ref(true)
  const dialogVisible = ref(false)
  const dialogEntry = ref<GameJam5DisplayEntry | null>(null)
  const dialogTitle = ref('')

  const scores = computed(() =>
    buildGameJam5DisplayEntries(gameJam5JudgeScores, audienceByEntryId.value)
  )

  onMounted(async () => {
    try {
      const list = await getGameJamAudienceAggregates(gameJam5Edition)
      const map = new Map<string, GameJam5AudienceAggregate>()
      for (const row of list) {
        map.set(row.entryId.toLowerCase(), {
          entryId: row.entryId,
          averageScore: row.averageScore,
          voteCount: row.voteCount
        })
      }
      audienceByEntryId.value = map
    } catch {
      audienceByEntryId.value = new Map()
    } finally {
      audienceLoading.value = false
    }
  })

  function openEntryDetail(entry: GameJam5DisplayEntry) {
    dialogEntry.value = entry
    dialogTitle.value = `${entry.work} · 评委点评`
    dialogVisible.value = true
  }

  function openEntryById(entryId: string) {
    const entry = scores.value.find((e) => e.entryId.toLowerCase() === entryId.toLowerCase())
    if (entry) openEntryDetail(entry)
  }

  function starCount(total: number): number {
    return Math.max(0, Math.min(5, Math.round((total / 60) * 5)))
  }

  function dialogScoreHint(entry: GameJam5DisplayEntry): string {
    const judge = entry.averageTotal.toFixed(1)
    if (entry.audienceAverage == null || entry.audienceVoteCount === 0) {
      return `满分 100 · 评委 ${judge} + 观众暂无`
    }
    const audience = entry.audienceAverage.toFixed(1)
    return `满分 100 · 评委 ${judge} + 观众 ${audience}×4（${entry.audienceVoteCount} 票）`
  }

  function dimensions(review: GameJam5JudgeReview): DimensionRow[] {
    return [
      { key: 'theme', label: '创意诠释', score: review.theme, max: 20, note: review.themeNote },
      { key: 'play', label: '可玩性', score: review.play, max: 20, note: review.playNote },
      {
        key: 'complete',
        label: '主题契合',
        score: review.complete,
        max: 14,
        note: review.completeNote
      },
      { key: 'polish', label: '完整度', score: review.polish, max: 6, note: review.polishNote }
    ]
  }

  return {
    audienceLoading,
    scores,
    dialogVisible,
    dialogEntry,
    dialogTitle,
    openEntryDetail,
    openEntryById,
    starCount,
    dialogScoreHint,
    dimensions
  }
}
