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

type ApiEnvelope<T> = { success: boolean; data: T }

export async function getMyGameJamRatings(edition: string): Promise<GameJamMyRatingItem[]> {
  const res = (await request.get('/gamejam/vote/my', {
    params: { edition }
  })) as ApiEnvelope<GameJamMyRatingItem[]>
  return res.data ?? []
}

export function submitGameJamRatings(body: GameJamRatingSubmitDto) {
  return request.post('/gamejam/vote', body)
}
