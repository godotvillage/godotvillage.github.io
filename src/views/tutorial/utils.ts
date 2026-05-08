export interface TutorialMetadata {
  title?: string
  author?: string
  date?: string
  tag?: string
  description?: string
  category?: string
  sticky?: boolean
  star?: boolean
}

/**
 * 解析 VuePress 风格的 YAML frontmatter。
 * 格式: ---\nkey: value\n---\ncontent
 */
export function parseFrontmatter(raw: string): { metadata: TutorialMetadata; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { metadata: {}, content: raw }
  }

  const frontmatterBlock = match[1]
  const body = match[2]

  const metadata: TutorialMetadata = {}
  const lines = frontmatterBlock.split(/\r?\n/)
  let currentKey = ''
  let currentArray: string[] = []

  function flushArray() {
    if (currentKey && currentArray.length > 0) {
      ;(metadata as Record<string, unknown>)[currentKey] = currentArray.join(', ')
      currentArray = []
    }
    currentKey = ''
  }

  for (const line of lines) {
    const arrayMatch = line.match(/^\s+-\s+(.*)/)
    if (arrayMatch && currentKey) {
      currentArray.push(arrayMatch[1].trim())
      continue
    }

    flushArray()

    const kvMatch = line.match(/^(\w+):\s*(.*)/)
    if (kvMatch) {
      const key = kvMatch[1]
      const value = kvMatch[2].trim()
      if (value === '') {
        currentKey = key
      } else {
        ;(metadata as Record<string, unknown>)[key] = value
      }
    }
  }
  flushArray()

  return { metadata, content: body }
}

/**
 * 预处理 markdown 内容：
 * - <BiliBlackboard> → B站视频 iframe
 */
export function preprocessContent(content: string): string {
  return content.replace(
    /<BiliBlackboard\s+width="([^"]*)"\s+link="([^"]*)"\s*\/>/g,
    (_match, width, bvid) => {
      return `<div class="bilibili-wrapper" style="max-width:${width || '750px'};margin:16px 0;">
  <iframe
    src="//player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=false"
    scrolling="no"
    border="0"
    frameborder="no"
    framespacing="0"
    allowfullscreen="true"
    style="width:100%;aspect-ratio:16/9;border-radius:8px;"
  ></iframe>
</div>`
    }
  )
}
