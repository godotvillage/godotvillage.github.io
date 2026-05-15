import request from './request'

export interface GameJamRatingSubmitItem {
  entryId: string
  /** 1～10；未玩过跳过为 `null`，不参与作品均分统计 */
  score: number | null
}

export interface GameJamRatingSubmitDto {
  edition: string
  items: GameJamRatingSubmitItem[]
}

export interface GameJamMyRatingItem {
  entryId: string
  /** `null` 表示该作品已选择跳过 */
  score: number | null
}

/** 单件作品观众投票汇总（GET /gamejam/vote/aggregate） */
export interface GameJamEntryAudienceScore {
  entryId: string
  /** 1–10 均分；无有效投票为 null */
  averageScore: number | null
  voteCount: number
}

type ApiEnvelope<T> = { success: boolean; data: T }

function unwrapPayload<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) {
    return (res as { data: T }).data
  }
  return res as T
}

function normalizeAudienceRow(raw: Record<string, unknown>): GameJamEntryAudienceScore {
  const entryId = String(raw.entryId ?? raw.EntryId ?? '')
  const avgRaw = raw.averageScore ?? raw.AverageScore
  const voteRaw = raw.voteCount ?? raw.VoteCount
  return {
    entryId,
    averageScore: avgRaw == null ? null : Number(avgRaw),
    voteCount: Number(voteRaw ?? 0)
  }
}

export async function getMyGameJamRatings(edition: string): Promise<GameJamMyRatingItem[]> {
  const res = (await request.get('/gamejam/vote/my', {
    params: { edition }
  })) as ApiEnvelope<GameJamMyRatingItem[]>
  return res.data ?? []
}

export function submitGameJamRatings(body: GameJamRatingSubmitDto) {
  return request.post('/gamejam/vote', body)
}

/** 按作品汇总观众评分（公开接口，无需登录） */
export async function getGameJamAudienceAggregates(
  edition: string
): Promise<GameJamEntryAudienceScore[]> {
  const res = await request.get('/gamejam/vote/aggregate', { params: { edition } })
  const list = unwrapPayload<unknown[]>(res)
  if (!Array.isArray(list)) return []
  return list
    .filter((row): row is Record<string, unknown> => !!row && typeof row === 'object')
    .map(normalizeAudienceRow)
    .filter((row) => row.entryId.length > 0)
}
