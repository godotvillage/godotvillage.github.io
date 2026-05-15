import type { GameJam5EntryJudgeScores } from '@/data/gameJam5JudgeScores'

/** 观众投票汇总（来自 /gamejam/vote/aggregate） */
export interface GameJam5AudienceAggregate {
  entryId: string
  averageScore: number | null
  voteCount: number
}

export interface GameJam5DisplayEntry extends GameJam5EntryJudgeScores {
  /** 观众 1–10 均分；无投票为 null */
  audienceAverage: number | null
  audienceVoteCount: number
  /** 百分制总分：评委均分（满分 60）+ 观众均分 × 4（满分 40） */
  finalScore: number
}

/**
 * 第五届综合分（百分制，满分 100）
 * @param judgeAverageTotal 三位评委 total 的算术平均（0–60）
 * @param audienceAverage 观众 1–10 均分；无投票传 null
 */
export function computeGameJam5FinalScore(
  judgeAverageTotal: number,
  audienceAverage: number | null
): number {
  const audiencePart = (audienceAverage ?? 0) * 4
  return Math.round((judgeAverageTotal + audiencePart) * 10) / 10
}

export function buildGameJam5DisplayEntries(
  judges: GameJam5EntryJudgeScores[],
  audienceByEntryId: Map<string, GameJam5AudienceAggregate>
): GameJam5DisplayEntry[] {
  return judges.map((entry) => {
    const audience = audienceByEntryId.get(entry.entryId.toLowerCase())
    const audienceAverage = audience?.averageScore ?? null
    return {
      ...entry,
      audienceAverage,
      audienceVoteCount: audience?.voteCount ?? 0,
      finalScore: computeGameJam5FinalScore(entry.averageTotal, audienceAverage)
    }
  })
}
