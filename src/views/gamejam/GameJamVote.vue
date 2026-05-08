<template>
  <div class="vote-page">
    <div class="section-container">
      <router-link to="/gamejam/5" class="back-link">
        <el-icon><ArrowLeft /></el-icon>
        返回第五届活动页
      </router-link>
    </div>

    <template v-if="!supported">
      <div class="section-container">
        <el-result icon="warning" title="暂不支持投票" sub-title="当前仅第五届开放作品打分。">
          <template #extra>
            <el-button type="primary" @click="$router.push('/gamejam/list')">往届记录</el-button>
          </template>
        </el-result>
      </div>
    </template>

    <template v-else>
      <div v-loading="loading" class="vote-shell section-container">
        <header class="vote-header">
          <h1>作品打分</h1>
          <p class="vote-hint">
            请依次为每件作品给出 1～10 分。全部完成后提交；同一账号可多次提交，以<strong>最后一次</strong>为准。
          </p>
        </header>

        <div v-if="!loading && currentEntry" class="vote-card">
          <div class="progress-row">
            <span class="progress-label">进度</span>
            <el-progress
              :percentage="Math.round(((currentIndex + 1) / total) * 100)"
              :stroke-width="10"
              color="#fbbf24"
            />
            <span class="progress-num">{{ currentIndex + 1 }} / {{ total }}</span>
          </div>

          <div class="work-block">
            <div class="cover-wrap">
              <el-image :src="coverSrc" fit="cover" class="cover-img">
                <template #error>
                  <div class="cover-fallback">
                    <el-icon :size="48"><Picture /></el-icon>
                    <span>暂无截图（可将图片放到 public/gamejam5/covers/{{ currentEntry.entryId }}.webp）</span>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="work-meta">
              <h2 class="work-title">{{ currentEntry.work }}</h2>
              <p class="work-author">
                <el-icon><User /></el-icon>
                {{ currentEntry.author }}
              </p>
            </div>
          </div>

          <div class="score-block">
            <div class="score-label">为作品打分（1～10）</div>
            <div class="score-row">
              <span class="score-num">{{ currentScore }}</span>
              <el-slider
                v-model="currentScore"
                :min="1"
                :max="10"
                :step="1"
                :show-tooltip="true"
                class="score-slider"
              />
            </div>
          </div>

          <div class="nav-actions">
            <el-button :disabled="currentIndex <= 0" @click="currentIndex--">上一件</el-button>
            <el-button v-if="currentIndex < total - 1" type="primary" @click="currentIndex++">下一件</el-button>
            <el-button
              v-else
              type="primary"
              :loading="submitting"
              @click="onSubmit"
            >
              提交全部评分
            </el-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Picture, User } from '@element-plus/icons-vue'
import { gameJam5Edition, gameJam5Entries, gameJam5CoverUrl } from '@/data/gameJam5Entries'
import { getMyGameJamRatings, submitGameJamRatings } from '@/api/gameJamVote'

const route = useRoute()
const router = useRouter()

const edition = computed(() => String(route.params.edition ?? ''))
const supported = computed(() => edition.value === gameJam5Edition)

const total = gameJam5Entries.length
const currentIndex = ref(0)
const scores = ref<Record<string, number>>({})
const loading = ref(true)
const submitting = ref(false)

const currentEntry = computed(() => gameJam5Entries[currentIndex.value] ?? null)
const coverSrc = computed(() =>
  currentEntry.value ? gameJam5CoverUrl(currentEntry.value.entryId) : ''
)

const currentScore = computed({
  get() {
    const id = currentEntry.value?.entryId
    if (!id) return 5
    const v = scores.value[id]
    return v === undefined || v === null ? 5 : v
  },
  set(v: number) {
    const id = currentEntry.value?.entryId
    if (!id) return
    scores.value = { ...scores.value, [id]: v }
  }
})

async function loadSaved() {
  loading.value = true
  try {
    const list = await getMyGameJamRatings(gameJam5Edition)
    const map: Record<string, number> = {}
    for (const e of gameJam5Entries) {
      map[e.entryId] = 5
    }
    for (const r of list) {
      map[r.entryId] = r.score
    }
    scores.value = map
  } catch {
    const map: Record<string, number> = {}
    for (const e of gameJam5Entries) {
      map[e.entryId] = 5
    }
    scores.value = map
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (supported.value) {
    loadSaved()
  } else {
    loading.value = false
  }
})

watch(
  () => route.params.edition,
  () => {
    if (supported.value) {
      currentIndex.value = 0
      loadSaved()
    }
  }
)

async function onSubmit() {
  for (const e of gameJam5Entries) {
    const s = scores.value[e.entryId]
    if (s === undefined || s === null || s < 1 || s > 10) {
      ElMessage.warning('请为所有作品完成 1～10 分评分')
      return
    }
  }

  submitting.value = true
  try {
    await submitGameJamRatings({
      edition: gameJam5Edition,
      items: gameJam5Entries.map((e) => ({
        entryId: e.entryId,
        score: scores.value[e.entryId]!
      }))
    })
    ElMessage.success('提交成功，如需修改可再次提交覆盖')
    router.push('/gamejam/5')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.vote-page {
  width: 100%;
  padding-bottom: 64px;
  color: var(--text-primary);
}

.section-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 24px;
  width: 90%;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  padding: 16px 0;
  transition: color 0.2s;

  &:hover {
    color: #f8fafc;
  }
}

.vote-header {
  text-align: center;
  margin-bottom: 28px;

  h1 {
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 700;
    color: #f8fafc;
    margin-bottom: 12px;
  }

  .vote-hint {
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.6;
    max-width: 560px;
    margin: 0 auto;
  }
}

.vote-card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 24px;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  .progress-label {
    font-size: 13px;
    color: #64748b;
    flex-shrink: 0;
  }

  .el-progress {
    flex: 1;
  }

  .progress-num {
    font-size: 13px;
    font-weight: 600;
    color: #fbbf24;
    flex-shrink: 0;
    min-width: 52px;
    text-align: right;
  }
}

.work-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;

  @media (min-width: 600px) {
    flex-direction: row;
    align-items: flex-start;
  }
}

.cover-wrap {
  flex-shrink: 0;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;

  @media (min-width: 600px) {
    width: 280px;
    margin: 0;
  }
}

.cover-img {
  width: 100%;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  background: #0f172a;
}

.cover-fallback {
  width: 100%;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
  background: linear-gradient(135deg, #1e293b, #334155);

  .el-icon {
    color: #475569;
  }
}

.work-meta {
  flex: 1;
  min-width: 0;

  .work-title {
    font-size: 18px;
    font-weight: 700;
    color: #f8fafc;
    line-height: 1.45;
    margin-bottom: 10px;
    word-break: break-word;
  }

  .work-author {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #94a3b8;
  }
}

.score-block {
  margin-bottom: 28px;

  .score-label {
    font-size: 14px;
    color: #cbd5e1;
    margin-bottom: 12px;
  }

  .score-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .score-num {
    font-size: 32px;
    font-weight: 800;
    color: #fbbf24;
    font-family: var(--font-heading);
    min-width: 40px;
    text-align: center;
  }

  .score-slider {
    flex: 1;
  }
}

.nav-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
