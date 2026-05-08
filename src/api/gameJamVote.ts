import request from './request'

export interface GameJamRatingSubmitItem {
  entryId: string
  score: number
}

export interface GameJamRatingSubmitDto {
  edition: string
  items: GameJamRatingSubmitItem[]
}

export interface GameJamMyRatingItem {
  entryId: string
  score: number
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
