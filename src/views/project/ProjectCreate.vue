<template>
  <div class="project-create-page page-container">
    <div class="page-header">
      <h1 class="page-title">创建项目</h1>
    </div>

    <div class="project-form card">
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

        <el-form-item label="负责人/作者" prop="author">
          <el-input v-model="form.author" placeholder="输入作者名称" />
        </el-form-item>

        <el-form-item label="GitHub 用户名">
          <el-input v-model="form.githubUser" placeholder="输入 GitHub 用户名" />
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
          <el-button type="primary" @click="handleCreate" :loading="loading">
            创建项目
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { projectApi } from '@/api/project'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  title: '',
  author: authStore.userInfo?.nickname || authStore.userInfo?.userName || '',
  githubUser: '',
  contact: '',
  type: '',
  status: '进行中',
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
  author: [{ required: true, message: '请输入作者名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择项目状态', trigger: 'change' }]
}

const handleCreate = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const tags = form.tagsInput
        ? form.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
        : undefined

      await projectApi.create({
        title: form.title,
        author: form.author,
        githubUser: form.githubUser || undefined,
        contact: form.contact || undefined,
        type: form.type,
        status: form.status,
        description: form.description || undefined,
        progress: form.progress || undefined,
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
      ElMessage.success('项目创建成功')
      router.push('/project')
    } catch (error) {
      // 错误已在拦截器处理
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.project-create-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.project-form {
  padding: 32px;
}
</style>
