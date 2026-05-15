/**
 * 从三位评委的 Excel 评分表生成 src/data/gameJam5JudgeScores.ts
 *
 * 用法: node scripts/import-gamejam5-judge-scores.mjs
 * 环境变量 JAM5_SCORE_XLSX_DIR 可覆盖 xlsx 所在目录（默认 d:\Download）
 */

import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outPath = join(root, 'src/data/gameJam5JudgeScores.ts')
const pyPath = join(__dirname, 'import-gamejam5-judge-scores.py')

const judges = [
  { id: 'bayun', name: '八云铀柚子' },
  { id: 'qiyi', name: '祺奕祺可' },
  { id: 'lan', name: '斓' }
]

const jsonOut = execSync(`python "${pyPath}"`, {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024,
  env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
})

const data = JSON.parse(jsonOut.trim())

function tsString(s) {
  return JSON.stringify(s)
}

function tsReview(r) {
  return `    {
      judgeId: '${r.judgeId}',
      judgeName: ${tsString(r.judgeName)},
      theme: ${r.theme},
      themeNote: ${tsString(r.themeNote)},
      play: ${r.play},
      playNote: ${tsString(r.playNote)},
      complete: ${r.complete},
      completeNote: ${tsString(r.completeNote)},
      polish: ${r.polish},
      polishNote: ${tsString(r.polishNote)},
      total: ${r.total},
      summary: ${tsString(r.summary)}
    }`
}

const lines = [
  '/** 第五届 GameJam 评委评分（由 scripts/import-gamejam5-judge-scores.mjs 生成，请勿手改） */',
  '',
  "export type GameJam5JudgeId = 'bayun' | 'qiyi' | 'lan'",
  '',
  'export interface GameJam5JudgeMeta {',
  '  id: GameJam5JudgeId',
  '  name: string',
  '}',
  '',
  'export interface GameJam5JudgeReview {',
  '  judgeId: GameJam5JudgeId',
  '  judgeName: string',
  '  theme: number',
  '  themeNote: string',
  '  play: number',
  '  playNote: string',
  '  complete: number',
  '  completeNote: string',
  '  polish: number',
  '  polishNote: string',
  '  total: number',
  '  summary: string',
  '}',
  '',
  'export interface GameJam5EntryJudgeScores {',
  '  entryId: string',
  '  author: string',
  '  work: string',
  '  reviews: GameJam5JudgeReview[]',
  '  averageTotal: number',
  '  displayScore: number',
  '}',
  '',
  'export const gameJam5Judges: GameJam5JudgeMeta[] = [',
  ...judges.map((j) => `  { id: '${j.id}', name: ${tsString(j.name)} },`),
  ']',
  '',
  'export const gameJam5JudgeScores: GameJam5EntryJudgeScores[] = [',
  ...data.map(
    (e) => `  {
    entryId: '${e.entryId}',
    author: ${tsString(e.author)},
    work: ${tsString(e.work)},
    averageTotal: ${e.averageTotal},
    displayScore: ${e.displayScore},
    reviews: [
${e.reviews.map(tsReview).join(',\n')}
    ]
  },`
  ),
  ']',
  '',
  '/** 评委均分（0–60）；综合百分制请用 computeGameJam5FinalScore */',
  'export function formatJudgeAverageTotal(reviews: { total: number }[]): number {',
  '  if (!reviews.length) return 0',
  '  const sum = reviews.reduce((n, r) => n + r.total, 0)',
  '  return Math.round((sum / reviews.length) * 100) / 100',
  '}',
  '',
  'export function getJudgeScoresByEntryId(entryId: string): GameJam5EntryJudgeScores | undefined {',
  '  return gameJam5JudgeScores.find((e) => e.entryId === entryId)',
  '}',
  ''
]

writeFileSync(outPath, lines.join('\n'), 'utf8')
console.log(
  `Wrote ${outPath} (${data.length} entries, ${data.reduce((n, e) => n + e.reviews.length, 0)} reviews)`
)
