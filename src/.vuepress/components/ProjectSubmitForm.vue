<template>
  <div class="project-submit-form">
    <div class="form-header">
      <h3>🌱 种下你的创意种子</h3>
      <p>分享你的项目想法，让社区一起来帮助实现！</p>
    </div>
    
    <form @submit.prevent="submitProject" class="submit-form">
      <div class="form-group">
        <label for="submitter">填写人 *</label>
        <input
          id="submitter"
          v-model="form.submitter"
          type="text"
          placeholder="请输入您的姓名或ID"
          required
          maxlength="30"
        />
        <span class="char-count">{{ form.submitter.length }}/30</span>
      </div>

      <div class="form-group">
        <label for="projectName">项目名称 *</label>
        <input
          id="projectName"
          v-model="form.name"
          type="text"
          placeholder="给你的项目起个响亮的名字"
          required
          maxlength="50"
        />
        <span class="char-count">{{ form.name.length }}/50</span>
      </div>

      <div class="form-group">
        <label for="projectDescription">详细灵感描述 *</label>
        <textarea
          id="projectDescription"
          v-model="form.description"
          placeholder="详细描述你的项目想法、目标、技术栈等..."
          required
          rows="6"
          maxlength="1000"
        ></textarea>
        <span class="char-count">{{ form.description.length }}/1000</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="projectCategory">项目分类</label>
          <select id="projectCategory" v-model="form.category">
            <option value="">选择分类</option>
            <option value="2D">🎨 2D</option>
            <option value="3D">🎯 3D</option>
          </select>
        </div>

        <div class="form-group">
          <label for="expectedTime">预期完成时间</label>
          <select id="expectedTime" v-model="form.expectedTime">
            <option value="">选择时间</option>
            <option value="1周内">⚡ 1周内</option>
            <option value="1个月内">🚀 1个月内</option>
            <option value="3个月内">📅 3个月内</option>
            <option value="半年内">⏰ 半年内</option>
            <option value="长期项目">🎯 长期项目</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="customTags">自定义标签</label>
        <input
          id="customTags"
          v-model="tagInput"
          type="text"
          placeholder="输入标签后按回车添加，如：肉鸽，模拟经营，回合制"
          @keydown.enter.prevent="addTag"
        />
        <div class="tags-container" v-if="form.tags.length > 0">
          <span
            v-for="(tag, index) in form.tags"
            :key="index"
            class="tag"
          >
            {{ tag }}
            <button type="button" @click="removeTag(index)" class="tag-remove">×</button>
          </span>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary">
          🔄 重置表单
        </button>
        <button type="submit" class="btn-primary" :disabled="!isFormValid">
          🌱 种下种子
        </button>
      </div>
    </form>

    <div v-if="showSuccess" class="success-message">
      <h4>🎉 项目提交成功！</h4>
      <p>你的创意种子已经种下，期待它茁壮成长！</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const form = ref({
  submitter: '',
  name: '',
  description: '',
  category: '',
  expectedTime: '',
  tags: []
})

const tagInput = ref('')
const showSuccess = ref(false)

const isFormValid = computed(() => {
  return form.value.submitter.trim() && form.value.name.trim() && form.value.description.trim()
})

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 10) {
    form.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index) => {
  form.value.tags.splice(index, 1)
}

const resetForm = () => {
  form.value = {
    submitter: '',
    name: '',
    description: '',
    category: '',
    expectedTime: '',
    tags: []
  }
  tagInput.value = ''
  showSuccess.value = false
}

const submitProject = () => {
  if (!isFormValid.value) return

  const project = {
    id: Date.now().toString(),
    ...form.value,
    status: '进行中',
    createdAt: new Date().toISOString(),
    author: form.value.submitter // 使用填写人作为作者
  }

  // 保存到localStorage（实际项目中应该发送到后端API）
  const projects = JSON.parse(localStorage.getItem('farmProjects') || '[]')
  projects.unshift(project)
  localStorage.setItem('farmProjects', JSON.stringify(projects))

  // 触发自定义事件通知其他组件更新
  window.dispatchEvent(new CustomEvent('projectAdded', { detail: project }))

  showSuccess.value = true
  setTimeout(() => {
    resetForm()
  }, 2000)
}
</script>

<style scoped>
.project-submit-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.5em;
}

.form-header p {
  color: #7f8c8d;
  font-size: 1.1em;
}

.submit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  position: relative;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 0.95em;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px 15px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #27ae60;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 0.8em;
  color: #95a5a6;
  background: rgba(255,255,255,0.9);
  padding: 2px 6px;
  border-radius: 4px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tag {
  background: #27ae60;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2em;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.tag-remove:hover {
  background: rgba(255,255,255,0.2);
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
  border: 2px solid #bdc3c7;
}

.btn-secondary:hover {
  background: #d5dbdb;
  border-color: #95a5a6;
}

.success-message {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  border-radius: 10px;
  margin-top: 20px;
  animation: slideIn 0.5s ease;
}

.success-message h4 {
  margin-bottom: 10px;
  font-size: 1.3em;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .project-submit-form {
    padding: 20px;
    margin: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>