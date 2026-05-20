<template>
  <div class="talent-my-page page-container" v-loading="loading">
    <!-- ==================== 展示模式 ==================== -->
    <template v-if="previewMode && profileData">
      <div class="page-header">
        <h1 class="page-title">我的档案</h1>
        <div class="header-actions">
          <el-button type="primary" @click="previewMode = false">
            <el-icon><Edit /></el-icon>编辑
          </el-button>
          <el-button type="danger" plain @click="handleDelete" :loading="deleting">
            <el-icon><Delete /></el-icon>删除档案
          </el-button>
        </div>
      </div>

      <div class="detail-header card">
        <el-avatar :size="64" :src="avatarUrl">
          {{ profileData.nickname || profileData.userName?.charAt(0) }}
        </el-avatar>
        <div class="header-info">
          <h1 class="header-name">{{ profileData.nickname || profileData.userName }}</h1>
          <span class="header-time">
            更新于 {{ dayjs(profileData.updatedTime || profileData.createdTime).format('YYYY-MM-DD HH:mm') }}
          </span>
        </div>
      </div>

      <div class="detail-body">
        <div class="card chart-card">
          <h3 class="card-title">六维能力图</h3>
          <TalentRadarChart :scores="radarScores" />
        </div>
        <div class="card scores-card">
          <h3 class="card-title">能力评分</h3>
          <div class="scores-list">
            <div v-for="dim in DIMENSION_KEYS" :key="dim.key" class="score-row">
              <span class="score-label">{{ dim.label }}</span>
              <el-progress
                :percentage="(profileData[dim.key as keyof typeof profileData] as number) * 10"
                :stroke-width="8"
                color="var(--color-primary)"
              />
              <span class="score-num">{{ profileData[dim.key as keyof typeof profileData] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card tags-card" v-if="groupedTags.length > 0">
        <h3 class="card-title">技能标签</h3>
        <div v-for="group in groupedTags" :key="group.category" class="tag-group">
          <span class="tag-category">{{ group.category }}</span>
          <div class="tag-items">
            <el-tag v-for="tag in group.tags" :key="tag" type="info">{{ tag }}</el-tag>
          </div>
        </div>
      </div>

      <div class="card desc-card" v-if="profileData.description">
        <h3 class="card-title">自我介绍</h3>
        <div class="markdown-body" v-html="renderedDescription"></div>
      </div>
    </template>

    <!-- ==================== 编辑模式 ==================== -->
    <template v-else>
      <div class="page-header">
        <h1 class="page-title">我的档案</h1>
        <div class="header-actions">
          <el-button v-if="profileData" @click="previewMode = true">
            <el-icon><ArrowLeft /></el-icon>返回查看
          </el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            <el-icon><Check /></el-icon>保存
          </el-button>
          <el-button v-if="hasProfile" type="danger" plain @click="handleDelete" :loading="deleting">
            <el-icon><Delete /></el-icon>删除档案
          </el-button>
        </div>
      </div>

      <div class="section card">
        <el-alert
          v-if="!hasProfile"
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          未找到您的档案数据，请在下方填写并保存。
        </el-alert>
        <div class="section-header">
          <h3 class="section-title">七维能力自评</h3>
          <el-button text type="primary" @click="showLevelTable = !showLevelTable">
            <el-icon><InfoFilled /></el-icon>
            {{ showLevelTable ? '收起' : '查看' }}评分标准
          </el-button>
        </div>
        <p class="score-hint">
          自评分数仅供参考。若您已具备高分对应的大部分能力，仅某项低分技能尚未掌握，可按高分填写并自行酌情下调即可。
        </p>

        <div v-show="showLevelTable" class="level-table-wrap">
          <div class="level-table-scroll">
            <table class="level-table">
              <thead>
                <tr>
                  <th>等级</th>
                  <th v-for="dim in DIMENSION_KEYS" :key="dim.key">{{ dim.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lvl in 11" :key="lvl - 1">
                  <td class="level-name"><strong>{{ lvl - 1 }}</strong> {{ LEVEL_NAMES[lvl - 1] }}</td>
                  <td v-for="dim in DIMENSION_KEYS" :key="dim.key">
                    {{ LEVEL_DESCRIPTIONS[dim.label][lvl - 1] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="scores-grid">
          <div v-for="dim in DIMENSION_KEYS" :key="dim.key" class="score-slider">
            <label class="slider-label">
              {{ dim.label }}
              <span class="slider-value">{{ scores[dim.key] }}</span>
            </label>
            <el-slider
              v-model="scores[dim.key]"
              :min="0"
              :max="10"
              :step="0.5"
              :marks="scoreMarks"
            />
            <div class="level-info">
              <span class="level-badge" :class="`level-${getLevelInfo(dim.label, scores[dim.key]).level}`">
                Lv.{{ getLevelInfo(dim.label, scores[dim.key]).level }}
                {{ getLevelInfo(dim.label, scores[dim.key]).name }}
              </span>
              <span class="level-desc">
                {{ getLevelInfo(dim.label, scores[dim.key]).description }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="section card">
        <h3 class="section-title">技能标签</h3>
        <div class="tags-grid">
          <div v-for="cat in TALENT_CATEGORIES" :key="cat.key" class="tag-group">
            <label class="tag-label">{{ cat.label }}</label>
            <el-select
              v-model="tagsByCategory[cat.key]"
              multiple
              filterable
              allow-create
              default-first-option
              :placeholder="`选择或输入${cat.label}标签`"
              style="width: 100%"
            >
              <el-option
                v-for="tag in TALENT_TAG_OPTIONS[cat.key]"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
          </div>
        </div>
      </div>

      <div class="section card">
        <h3 class="section-title">自我描述与作品集</h3>
        <MdEditor
          v-model="description"
          :theme="themeStore.theme"
          previewTheme="smart-blue"
          :preview="false"
          :toolbars="toolbars"
          placeholder="在这里介绍自己、展示作品集链接……支持 Markdown"
          @onUploadImg="handleUploadImg"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Delete, Edit, ArrowLeft, InfoFilled } from '@element-plus/icons-vue'
import { MdEditor, type ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { talentApi } from '@/api/talent'
import type { TalentDto } from '@/api/talent'
import { DIMENSION_KEYS, TALENT_CATEGORIES, TALENT_TAG_OPTIONS, getLevelInfo, LEVEL_NAMES, LEVEL_DESCRIPTIONS } from '@/data/talentTags'
import { useThemeStore } from '@/stores/theme'
import { getAvatarUrl } from '@/utils/avatar'
import { marked } from 'marked'
import dayjs from 'dayjs'
import request from '@/api/request'

const router = useRouter()
const themeStore = useThemeStore()

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const hasProfile = ref(false)
const showLevelTable = ref(false)
const previewMode = ref(true)
const profileData = ref<TalentDto | null>(null)

const scoreMarks: Record<number, string> = {}
for (let i = 0; i <= 10; i++) {
  scoreMarks[i] = ' '
}

const toolbars: (ToolbarNames | number)[] = [
  'bold', 'italic', 'strikeThrough', 'title',
  'quote', 'unorderedList', 'orderedList',
  'codeRow', 'code', 'link', 'image', 'table',
  '-', 0,
  'revoke', 'next', 'preview',
]

const defaultScores: Record<string, number> = {}
for (const dim of DIMENSION_KEYS) {
  defaultScores[dim.key] = 0
}

const scores = reactive<Record<string, number>>({ ...defaultScores })
const description = ref('')
const tagsByCategory = reactive<Record<string, string[]>>({})

for (const cat of TALENT_CATEGORIES) {
  tagsByCategory[cat.key] = []
}


const avatarUrl = computed(() => getAvatarUrl(profileData.value?.nickname || profileData.value?.userName))

const radarScores = computed(() => {
  if (!profileData.value) return {}
  const scores: Record<string, number> = {}
  for (const dim of DIMENSION_KEYS) {
    scores[dim.key] = (profileData.value as any)[dim.key] ?? 0
  }
  return scores
})

const groupedTags = computed(() => {
  if (!profileData.value?.tags) return []
  const groups: Record<string, string[]> = {}
  for (const t of profileData.value.tags) {
    if (!groups[t.category]) groups[t.category] = []
    groups[t.category].push(t.tag)
  }
  return Object.entries(groups).map(([category, tags]) => ({ category, tags }))
})

const renderedDescription = computed(() => {
  if (!profileData.value?.description) return ''
  return marked(profileData.value.description) as string
})

const buildTags = () => {
  const result: { category: string; tag: string }[] = []
  for (const cat of TALENT_CATEGORIES) {
    for (const tag of tagsByCategory[cat.key]) {
      result.push({ category: cat.key, tag })
    }
  }
  return result
}

const fillForm = (profile: TalentDto) => {
  for (const dim of DIMENSION_KEYS) {
    scores[dim.key] = (profile as any)[dim.key] ?? 0
  }
  description.value = profile.description || ''
  for (const cat of TALENT_CATEGORIES) {
    tagsByCategory[cat.key] = []
  }
  if (profile.tags) {
    for (const t of profile.tags) {
      if (tagsByCategory[t.category]) {
        tagsByCategory[t.category].push(t.tag)
      }
    }
  }
}

const loadProfile = async () => {
  loading.value = true
  try {
    const res = await talentApi.getMy()
    const profile = res.data
    if (profile) {
      hasProfile.value = true
      profileData.value = profile
      fillForm(profile)
    } else {
      hasProfile.value = false
      previewMode.value = false
    }
  } catch {
    previewMode.value = false
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    const res = await talentApi.createOrUpdate({
      designScore: scores.designScore,
      programmingScore: scores.programmingScore,
      artScore: scores.artScore,
      musicScore: scores.musicScore,
      organizationScore: scores.organizationScore,
      fundingScore: scores.fundingScore,
      marketingScore: scores.marketingScore,
      description: description.value,
      tags: buildTags(),
    })
    profileData.value = res.data
    hasProfile.value = true
    ElMessage.success('档案已保存')
    previewMode.value = true
  } catch {
    // error handled by interceptor
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除你的档案吗？此操作不可撤销。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  deleting.value = true
  try {
    await talentApi.remove()
    hasProfile.value = false
    profileData.value = null
    previewMode.value = false
    ElMessage.success('档案已删除')
    router.push('/talent')
  } catch {
    // error handled by interceptor
  } finally {
    deleting.value = false
  }
}

const handleUploadImg = async (_files: File[], callback: (urls: string[]) => void) => {
  const urls: string[] = []
  for (const file of _files) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await request.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    urls.push(res.data.url)
  }
  callback(urls)
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped lang="scss">
.talent-my-page {
  padding: 24px 32px;
  max-width: 900px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

// ===== 展示模式 =====
.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  margin-bottom: 24px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.header-time {
  font-size: 13px;
  color: var(--text-secondary);
}

.detail-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 16px 0;
}

.chart-card,
.scores-card {
  padding: 24px;
}

.scores-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 10px;

  .score-label {
    font-size: 14px;
    color: var(--text-secondary);
    width: 56px;
    flex-shrink: 0;
  }

  .score-num {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    width: 28px;
    text-align: right;
    flex-shrink: 0;
  }

  :deep(.el-progress) {
    flex: 1;
  }
}

.tags-card {
  padding: 24px;
  margin-bottom: 24px;
}

.tag-group {
  margin-bottom: 14px;
  &:last-child { margin-bottom: 0; }
}

.tag-category {
  font-size: 14px;
  color: var(--text-secondary);
  margin-right: 12px;
  vertical-align: middle;
}

.tag-items {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  vertical-align: middle;
}

.desc-card {
  padding: 24px;
}

.markdown-body {
  color: var(--color-text);
  line-height: 1.8;
  font-size: 15px;

  :deep(h1), :deep(h2), :deep(h3) {
    color: var(--color-text);
    margin: 16px 0 8px;
  }
  :deep(p) { margin: 8px 0; }
  :deep(a) { color: var(--color-primary); }
  :deep(img) { max-width: 100%; border-radius: 8px; }
  :deep(code) { background: var(--color-secondary); padding: 2px 6px; border-radius: 4px; }
  :deep(pre) { background: var(--color-secondary); padding: 16px; border-radius: 8px; overflow-x: auto; }
}

// ===== 编辑模式 =====
.section {
  margin-bottom: 24px;
  padding: 24px;
}

.talent-my-page :deep(.el-alert) {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.score-hint {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.level-table-wrap { margin-bottom: 20px; }
.level-table-scroll { overflow-x: auto; }

.level-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  line-height: 1.5;

  th, td {
    padding: 6px 8px;
    border: 1px solid var(--color-secondary);
    text-align: left;
    vertical-align: top;
    color: var(--color-text);
  }

  th {
    background: var(--color-secondary);
    font-weight: 600;
    white-space: nowrap;
    font-size: 13px;
  }

  .level-name {
    white-space: nowrap;
    font-size: 12px;
  }
}

.scores-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px 32px;
}

.score-slider {
  .slider-label {
    font-size: 14px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .slider-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-primary);
  }
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
}

.level-badge {
  font-size: 12px;
  font-weight: 600;
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
  align-self: flex-start;
}

.level-0  { background: rgb(211, 209, 199); }
.level-1,
.level-2  { background: rgb(181, 212, 244); }
.level-3,
.level-4  { background: rgb(192, 221, 151); }
.level-5,
.level-6  { background: rgb(159, 225, 203); }
.level-7,
.level-8  { background: rgb(206, 203, 246); }
.level-9  { background: rgb(245, 196, 179); }
.level-10 { background: rgb(244, 192, 209); }

.level-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
}

.tag-label {
  font-size: 14px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .talent-my-page {
    padding: 16px;
  }
  .detail-body {
    grid-template-columns: 1fr;
  }
  .scores-grid {
    grid-template-columns: 1fr;
  }
  .tags-grid {
    grid-template-columns: 1fr;
  }
}
</style>
