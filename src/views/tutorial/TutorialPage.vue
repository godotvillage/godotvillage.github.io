<template>
  <div class="tutorial-page">
    <!-- 404 -->
    <div class="tutorial-not-found card" v-if="!mdContent && !loading">
      <el-empty description="教程未找到">
        <el-button type="primary" @click="$router.push('/tutorial')">返回教程列表</el-button>
      </el-empty>
    </div>

    <!-- 教程内容 -->
    <template v-else>
      <!-- 头部元信息 -->
      <header class="tutorial-header card" v-if="metadata.title">
        <h1 class="tutorial-title">{{ metadata.title }}</h1>
        <div class="tutorial-meta">
          <span v-if="metadata.author" class="meta-item">
            <el-icon><User /></el-icon>
            {{ metadata.author }}
          </span>
          <span v-if="metadata.date" class="meta-item">
            <el-icon><Calendar /></el-icon>
            {{ metadata.date }}
          </span>
          <span v-if="metadata.tag" class="meta-item">
            <el-tag
              v-for="tag in tagList"
              :key="tag"
              size="small"
              effect="plain"
              class="tutorial-tag"
            >
              {{ tag }}
            </el-tag>
          </span>
        </div>
      </header>

      <!-- Markdown 内容 -->
      <div class="tutorial-content card">
        <MdPreview
          :theme="themeStore.theme"
          :modelValue="processedContent"
          previewTheme="smart-blue"
        />
      </div>

      <!-- 底部导航 -->
      <div class="tutorial-footer card">
        <el-button @click="$router.push('/tutorial')">
          <el-icon><ArrowLeft /></el-icon>
          返回教程列表
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { User, Calendar, ArrowLeft } from '@element-plus/icons-vue'
import { parseFrontmatter, preprocessContent, type TutorialMetadata } from './utils'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

// ── 预加载所有 MD 文件 ──
const mdModules = import.meta.glob('./content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// ── 构建路径映射 ──
// e.g. ./content/navigation.md → navigation
// e.g. ./content/shader/intro.md → shader/intro
// e.g. ./content/example/chat.md → example/chat
function buildPathMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const [filePath, content] of Object.entries(mdModules)) {
    // ./content/xxx.md → xxx
    // ./content/category/xxx.md → category/xxx
    const key = filePath
      .replace('./content/', '')
      .replace(/\.md$/i, '')
    map[key] = content
    // Also add lowercase key for case-insensitive matching
    map[key.toLowerCase()] = content
  }
  return map
}

const pathMap = buildPathMap()

// ── 根据路由参数获取 MD 内容 ──
const routePath = computed(() => {
  const category = route.params.category as string | undefined
  const page = route.params.page as string
  if (category) {
    return `${category}/${page}`.toLowerCase()
  }
  return page.toLowerCase()
})

const mdContent = computed(() => {
  return pathMap[routePath.value] || null
})

const loading = ref(false)

const parsed = computed(() => {
  if (!mdContent.value) return { metadata: {} as TutorialMetadata, content: '' }
  return parseFrontmatter(mdContent.value)
})

const metadata = computed(() => parsed.value.metadata)
const rawContent = computed(() => parsed.value.content)

const tagList = computed(() => {
  const tag = metadata.value.tag
  if (!tag) return []
  return tag.split(',').map(t => t.trim()).filter(Boolean)
})

const processedContent = computed(() => {
  return preprocessContent(rawContent.value)
})
</script>

<style scoped lang="scss">
.tutorial-page {
  // uses .page-container max-width
  margin: 0 auto;
  padding: 32px 24px 64px;
  width: 90%;
}

.tutorial-header {
  padding: 32px 40px;
  margin-bottom: 24px;

  .tutorial-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 20px;
    line-height: 1.4;
  }

  .tutorial-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    font-size: 14px;
    color: var(--text-regular);

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tutorial-tag {
      margin-left: 4px;
    }
  }
}

.tutorial-content {
  padding: 40px;

  :deep(.md-editor) {
    background: transparent;
  }
}

.tutorial-footer {
  margin-top: 24px;
  padding: 20px 40px;
  display: flex;
  justify-content: center;
}

.tutorial-not-found {
  padding: 80px 40px;
  display: flex;
  justify-content: center;
}

// 卡片样式（与其他页面保持一致）
.card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}
</style>
