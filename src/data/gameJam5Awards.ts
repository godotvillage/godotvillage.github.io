/** 第五届 GameJam 获奖名单（来源：奖项获奖名单.csv） */
export interface GameJam5Award {
  id: string
  title: string
  prizeShare: string
  authors: string
  work: string
  entryId: string
  featured: boolean
}

export const gameJam5Awards: GameJam5Award[] = [
  {
    id: 'best-work',
    title: '🏆 最佳作品',
    prizeShare: '30%',
    authors: '百泽，毒蛇',
    work: '因为吃外卖没有勺子然后发现了一个比赛冠军能获得无限的金钱或者一把勺子所以前进吧',
    entryId: 'f5e60000-0000-4000-8000-000000000003',
    featured: true
  },
  {
    id: 'best-creative',
    title: '💡 最佳创意',
    prizeShare: '15%',
    authors: 'JrD',
    work: '10sec',
    entryId: 'f5e60000-0000-4000-8000-00000000000b',
    featured: false
  },
  {
    id: 'best-playability',
    title: '🎮 最佳可玩性',
    prizeShare: '15%',
    authors: '凉城清风',
    work: '十秒爬塔',
    entryId: 'f5e60000-0000-4000-8000-000000000002',
    featured: false
  },
  {
    id: 'most-popular',
    title: '❤️ 最受欢迎',
    prizeShare: '20%',
    authors: '咩咩青羽',
    work: '10秒无限突破',
    entryId: 'f5e60000-0000-4000-8000-000000000013',
    featured: false
  },
  {
    id: 'best-completion',
    title: '✅ 最佳完成度',
    prizeShare: '10%',
    authors: '轻风云再起',
    work: '小鸡冒险记',
    entryId: 'f5e60000-0000-4000-8000-00000000000f',
    featured: false
  }
]

export const gameJam5FeaturedAward = gameJam5Awards.find((a) => a.featured)!
export const gameJam5OtherAwards = gameJam5Awards.filter((a) => !a.featured)
