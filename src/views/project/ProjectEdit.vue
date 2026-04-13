<template>
  <div class="project-edit-page page-container">
    <div class="page-header">
      <h1 class="page-title">编辑项目</h1>
    </div>

    <div class="project-form card" v-if="form.title">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="项目名称" prop="title">
          <el-input v-model="form.title" placeholder="输入项目名称" size="large" />
        </el-form-item>

        <el-form-item label="项目类型" prop="type">
          <el-select v-model="form.type" placeholder="选择类型" style="width: 100%">
            <el-option label="游戏" value="游戏" />
            <el-option label="工具" value="工具" />
            <el-option label="插件" value="插件" />
            <el-option label="教程" value="教程" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="项目状态" prop="status">
          <el-select v-model="form.status" placeholder="选择状态" style="width: 100%">
            <el-option label="进行中" value="进行中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已暂停" value="已暂停" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>

        <el-form-item label="联系方式">
          <el-input v-model="form.contact" placeholder="邮箱或其他联系方式" />
        </el-form-item>

        <el-form-item label="项目描述">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="描述你的项目..." />
        </el-form-item>

        <el-form-item label="进度">
          <el-slider v-model="form.progress" :min="0" :max="100" show-input />
        </el-form-item>

        <el-form-item label="预计完成时间">
          <el-date-picker
            v-model="form.expectedTime"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-input v-model="form.tagsInput" placeholder="多个标签用逗号分隔" />
        </el-form-item>

        <el-form-item label="仓库地址">
          <el-input v-model="form.repository" placeholder="GitHub 仓库地址" />
        </el-form-item>

        <el-form-item label="演示地址">
          <el-input v-model="form.demoUrl" placeholder="在线演示地址" />
        </el-form-item>

        <el-form-item label="团队成员">
          <el-input v-model="form.teamMembers" placeholder="团队成员列表" />
        </el-form-item>

        <el-form-item label="招募信息">
          <el-input v-model="form.recruitmentInfo" type="textarea" :rows="3" placeholder="招募需求..." />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="form.isOpenSource">开源项目</el-checkbox>
          <el-checkbox v-model="form.needHelp">需要帮助</el-checkbox>
          <el-checkbox v-model="form.allowCollaboration">允许协作</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button @click="$router.back()">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="loading">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-else-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { projectApi } from '@/api/project'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const loading = ref(true)

const form = reactive({
  title: '',
  contact: '',
  type: '',
  status: '',
  description: '',
  progress: 0,
  expectedTime: '',
  tagsInput: '',
  repository: '',
  demoUrl: '',
  teamMembers: '',
  recruitmentInfo: '',
  isOpenSource: false,
  needHelp: false,
  allowCollaboration: false
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择项目状态', trigger: 'change' }]
}

const projectId = route.params.id as string

onMounted(() => {
  loadProject()
})

const loadProject = async () => {
  try {
    const res = await projectApi.getById(projectId)
    const project = res.data
    form.title = project.title
    form.contact = project.contact || ''
    form.type = project.type
    form.status = project.status
    form.description = project.description || ''
    form.progress = project.progress
    form.expectedTime = project.expectedTime || ''
    form.tagsInput = project.tags?.join(', ') || ''
    form.repository = project.repository || ''
    form.demoUrl = project.demoUrl || ''
    form.teamMembers = project.teamMembers || ''
    form.recruitmentInfo = project.recruitmentInfo || ''
    form.isOpenSource = project.isOpenSource
    form.needHelp = project.needHelp
    form.allowCollaboration = project.allowCollaboration
  } catch (error) {
    ElMessage.error('加载项目失败')
    router.push('/project')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const tags = form.tagsInput
        ? form.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
        : undefined

      await projectApi.update(projectId, {
        title: form.title,
        contact: form.contact || undefined,
        type: form.type,
        status: form.status,
        description: form.description || undefined,
        progress: form.progress,
        expectedTime: form.expectedTime || undefined,
        tags,
        repository: form.repository || undefined,
        demoUrl: form.demoUrl || undefined,
        teamMembers: form.teamMembers || undefined,
        recruitmentInfo: form.recruitmentInfo || undefined,
        isOpenSource: form.isOpenSource,
        needHelp: form.needHelp,
        allowCollaboration: form.allowCollaboration
      })
      ElMessage.success('保存成功')
      router.push(`/project/${projectId}`)
    } catch (error) {
      // 错误已在拦截器处理
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.project-edit-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.project-form {
  padding: 32px;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 80px 20px;
  background: var(--card-bg);
  border-radius: 12px;
}
</style>
