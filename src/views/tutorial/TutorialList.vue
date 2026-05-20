<template>
  <div class="tutorial-list-page">
    <div class="page-header">
      <h1 class="page-title">教程中心</h1>
      <p class="page-desc">Godot 引擎从入门到精通的系统化中文教程，涵盖基础概念、实战项目和进阶技巧</p>
    </div>

    <div v-for="category in categories" :key="category.name" class="tutorial-section">
      <h2 class="section-title">
        <el-icon :size="20"><component :is="iconMap[category.name]" /></el-icon>
        {{ category.name }}
      </h2>
      <div class="tutorial-grid">
        <router-link
          v-for="item in category.items"
          :key="item.path"
          :to="`/tutorial/${item.path}`"
          class="tutorial-card"
        >
          <div class="card-body">
            <h3 class="card-title">
              {{ item.metadata.title || item.path }}
              <el-tag v-if="item.metadata.sticky" size="small" type="danger" class="sticky-tag">置顶</el-tag>
              <el-tag v-if="item.metadata.star" size="small" type="warning" class="star-tag">精选</el-tag>
            </h3>
            <p class="card-desc" v-if="item.metadata.description">
              {{ item.metadata.description }}
            </p>
            <div class="card-meta">
              <span v-if="item.metadata.author" class="meta-author">
                <el-icon :size="14"><User /></el-icon>
                {{ item.metadata.author }}
              </span>
              <span v-if="item.metadata.date" class="meta-date">
                <el-icon :size="14"><Calendar /></el-icon>
                {{ item.metadata.date }}
              </span>
            </div>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, Calendar, ArrowRight, Reading, Box, MagicStick, Connection, VideoCamera } from '@element-plus/icons-vue'
import { parseFrontmatter, type TutorialMetadata } from './utils'
import type { Component } from 'vue'

const iconMap: Record<string, Component> = {
  '视频资源': VideoCamera,
  '基础教程': Reading,
  '示例项目': Box,
  'Shader着色器': MagicStick,
  '多人游戏教程': Connection,
}

// ── 加载所有 MD 文件 ──
const mdModules = import.meta.glob('./content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

interface TutorialItem {
  path: string
  metadata: TutorialMetadata
}

// ── 解析所有教程并排除 README ──
const allTutorials = computed<TutorialItem[]>(() => {
  const items: TutorialItem[] = []
  for (const [filePath, content] of Object.entries(mdModules)) {
    const key = filePath
      .replace('./content/', '')
      .replace(/\.md$/i, '')
    // 排除 README（作为列表页本身）
    if (key.toLowerCase() === 'readme') continue

    const { metadata } = parseFrontmatter(content)
    items.push({ path: key.toLowerCase(), metadata })
  }
  return items
})

// ── 按分类组织 ──
interface CategoryGroup {
  name: string
  items: TutorialItem[]
}

const categories = computed<CategoryGroup[]>(() => {
  const groups: Record<string, TutorialItem[]> = {
    '视频资源': [],
    '基础教程': [],
    '示例项目': [],
    'Shader着色器': [],
    '多人游戏教程': [],
  }

  for (const item of allTutorials.value) {
    const p = item.path
    if (p.startsWith('shader/')) {
      groups['Shader着色器'].push(item)
    } else if (p.startsWith('example/')) {
      groups['示例项目'].push(item)
    } else if (p.startsWith('mutiplayer_tutorial/')) {
      groups['多人游戏教程'].push(item)
    } else if (p === 'luoye' || p === 'otherbilibili') {
      groups['视频资源'].push(item)
    } else {
      groups['基础教程'].push(item)
    }
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([name, items]) => ({ name, items }))
})
</script>

<style scoped lang="scss">
.tutorial-list-page {
  // uses .page-container max-width
  margin: 0 auto;
  padding: 32px 24px 64px;
}

.page-header {
  text-align: center;
  padding: 40px 0;

  .page-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 12px;
  }

  .page-desc {
    font-size: 15px;
    color: var(--text-regular);
    max-width: 560px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

.tutorial-section {
  margin-bottom: 40px;

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 16px;
    padding-left: 4px;
  }
}

.tutorial-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.tutorial-card {
  display: flex;
  align-items: center;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 18px 24px;
  text-decoration: none;
  transition: border-color 0.2s, transform 0.2s;

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);

    .card-arrow {
      opacity: 1;
    }
  }

  .card-body {
    flex: 1;
    min-width: 0;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text);
      margin: 0 0 8px;
      display: flex;
      align-items: center;
      gap: 8px;

      .sticky-tag,
      .star-tag {
        flex-shrink: 0;
      }
    }

    .card-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0 0 10px;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 12px;
      color: var(--text-regular);

      .meta-author,
      .meta-date {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .card-arrow {
    color: var(--text-secondary);
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
    margin-left: 16px;
  }
}
</style>
