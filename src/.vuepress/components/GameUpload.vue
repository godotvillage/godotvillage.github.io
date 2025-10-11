<template>
  <div class="game-upload-container">
    <h1>游戏ZIP文件上传</h1>
    <p>
        请上传一个由 Godot 导出的 Web 版本 ZIP 包，文件内必须包含 <code>index.html</code>。<br>
        上传前请填写作者、游戏名、版本、封面等相关信息。仅支持 ZIP 格式，最大 200MB。
    </p>

    <!-- 游戏信息表单 -->
    <form @submit.prevent="uploadGame" class="game-info-form">
      <div class="form-group">
        <label for="author">作者 *</label>
        <input 
          type="text" 
          id="author" 
          v-model="gameInfo.author" 
          required 
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label for="game_name">游戏名 *</label>
        <input 
          type="text" 
          id="game_name" 
          v-model="gameInfo.game_name" 
          required 
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label for="description">游戏简介</label>
        <textarea 
          id="description" 
          v-model="gameInfo.description" 
          rows="3" 
          class="form-textarea"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="version">版本 *</label>
        <input 
          type="text" 
          id="version" 
          v-model="gameInfo.version" 
          required 
          placeholder="例: 1.0.0" 
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="gameInfo.is_online_playable" 
            disabled
          >
          支持在线游玩
        </label>
      </div>

      <div class="form-group">
        <label for="coverImage">游戏封面</label>
        <input 
          type="file" 
          id="coverImage" 
          @change="handleCoverImageChange" 
          accept="image/*" 
          class="form-input"
        >
        <img 
          v-if="coverPreview" 
          :src="coverPreview" 
          alt="封面预览" 
          class="cover-preview"
        >
      </div>
    </form>

    <div class="file-upload-section">
      <h3>游戏文件上传</h3>
      <div 
        class="upload-area" 
        :class="{ dragover: isDragOver }"
        @click="triggerFileInput"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @drop.prevent="handleFileDrop"
      >
        <p v-if="!selectedFile">点击选择ZIP文件或拖拽文件到这里</p>
        <p v-if="!selectedFile"><small>支持ZIP格式，最大200MB</small></p>
        <div v-if="selectedFile">
          <p>已选择文件: {{ selectedFile.name }}</p>
          <p><small>大小: {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</small></p>
        </div>
        <input 
          ref="fileInput"
          type="file" 
          accept=".zip"
          @change="handleFileSelection"
          style="display: none"
        >
      </div>
    </div>

    <button 
      type="button"
      @click="uploadGame" 
      :disabled="!selectedFile || uploading"
      class="upload-btn"
    >
      {{ uploading ? '上传中...' : '上传游戏' }}
    </button>

    <button 
      type="button"
      @click="loadGames" 
      :disabled="loadingGames"
      class="upload-btn load-games-btn"
    >
      {{ loadingGames ? '加载中...' : '查看游戏列表' }}
    </button>

    <div v-if="uploading" class="progress">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>

    <div v-if="result.message" :class="['result', result.type]">
      <div v-html="result.message"></div>
    </div>

    <!-- 游戏列表显示区域 -->
    <div v-if="showGamesList" class="games-list">
      <h2>游戏列表</h2>
      <div v-if="games.length === 0" class="no-games">
        <p>暂无游戏</p>
      </div>
      <div v-else class="games-container">
        <div 
          v-for="game in games" 
          :key="game.game_id" 
          class="game-card"
        >
          <div class="game-card-content">
            <div class="game-cover">
              <img 
                v-if="game.cover_image" 
                :src="`${imageBaseUrl}/${game.cover_image}`" 
                :alt="`${game.game_name} 封面`"
                class="cover-image"
              >
              <p v-else class="no-cover">暂无封面</p>
            </div>
            <div class="game-info">
              <h3>{{ game.game_name }}</h3>
              <p><strong>作者:</strong> {{ game.author }}</p>
              <p><strong>版本:</strong> {{ game.version }}</p>
              <p><strong>游戏ID:</strong> {{ game.game_id }}</p>
              <p><strong>简介:</strong> {{ game.description || '暂无简介' }}</p>
              <p><strong>在线游玩:</strong> {{ game.is_online_playable ? '支持' : '不支持' }}</p>
              <p><strong>上传时间:</strong> {{ formatDate(game.upload_time) }}</p>
              <p><strong>文件大小:</strong> {{ (game.file_size / 1024 / 1024).toFixed(2) }} MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gameApi, imageBaseUrl } from '../utils/request.js'

export default {
  name: 'GameUpload',
  data() {
    return {
      imageBaseUrl: imageBaseUrl,
      gameInfo: {
        author: '',
        game_name: '',
        description: '',
        version: '',
        is_online_playable: true
      },
      selectedFile: null,
      selectedCoverImage: null,
      coverPreview: null,
      isDragOver: false,
      uploading: false,
      loadingGames: false,
      progress: 0,
      result: {
        message: '',
        type: ''
      },
      showGamesList: false,
      games: []
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    handleFileSelection(event) {
      const file = event.target.files[0]
      if (file) {
        this.validateAndSetFile(file)
      }
    },
    
    handleFileDrop(event) {
      this.isDragOver = false
      const files = event.dataTransfer.files
      if (files.length > 0) {
        this.validateAndSetFile(files[0])
      }
    },
    
    validateAndSetFile(file) {
      // 检查文件类型
      if (!file.name.toLowerCase().endsWith('.zip')) {
        this.showResult('请选择ZIP格式的文件', 'error')
        return
      }
      
      // 检查文件大小 (200MB)
      if (file.size > 200 * 1024 * 1024) {
        this.showResult('文件大小超过200MB限制', 'error')
        return
      }
      
      this.selectedFile = file
      this.clearResult()
    },
    
    handleCoverImageChange(event) {
      const file = event.target.files[0]
      if (!file) {
        this.selectedCoverImage = null
        this.coverPreview = null
        return
      }
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        this.showResult('请选择图片格式的文件', 'error')
        event.target.value = ''
        return
      }
      
      // 检查文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showResult('封面图片大小超过5MB限制', 'error')
        event.target.value = ''
        return
      }
      
      this.selectedCoverImage = file
      
      // 显示预览
      const reader = new FileReader()
      reader.onload = (e) => {
        this.coverPreview = e.target.result
      }
      reader.readAsDataURL(file)
    },
    
    validateForm() {
      return this.gameInfo.author.trim() && 
             this.gameInfo.game_name.trim() && 
             this.gameInfo.version.trim()
    },
    
    async uploadGame() {
      if (!this.selectedFile) return
      
      // 验证表单
      if (!this.validateForm()) {
        this.showResult('❌ 请填写所有必填字段（作者、游戏名、版本）', 'error')
        return
      }
      
      const formData = new FormData()
      formData.append('zipfile', this.selectedFile)
      
      // 添加封面图片（如果有）
      if (this.selectedCoverImage) {
        formData.append('coverImage', this.selectedCoverImage)
      }
      
      // 添加游戏信息
      formData.append('author', this.gameInfo.author.trim())
      formData.append('game_name', this.gameInfo.game_name.trim())
      formData.append('description', this.gameInfo.description.trim())
      formData.append('version', this.gameInfo.version.trim())
      formData.append('is_online_playable', this.gameInfo.is_online_playable)
      
      this.uploading = true
      this.progress = 0
      
      try {
        const data = await gameApi.uploadGame(formData)
        
        if (data.success) {
          let message = `✅ ${data.message}<br>`
          message += `游戏ID: ${data.game_id}<br>`
          message += `文件夹: ${data.folderName}<br>`
          if (data.gameInfo) {
            message += `作者: ${data.gameInfo.author}<br>`
            message += `游戏名: ${data.gameInfo.game_name}<br>`
            message += `版本: ${data.gameInfo.version}<br>`
            message += `在线游玩: ${data.gameInfo.is_online_playable ? '是' : '否'}`
          }
          this.showResult(message, 'success')
          
          // 清空表单
          this.resetForm()
        } else {
          this.showResult(`❌ ${data.error}`, 'error')
        }
      } catch (error) {
        this.showResult(`❌ ${error.message}`, 'error')
      } finally {
        this.uploading = false
        this.progress = 0
      }
    },
    
    async loadGames() {
      this.loadingGames = true
      
      try {
        const data = await gameApi.getGames()
        
        if (data.success) {
          this.games = data.data
          this.showGamesList = true
        } else {
          this.showResult(`❌ 获取游戏列表失败: ${data.error}`, 'error')
        }
      } catch (error) {
        this.showResult(`❌ ${error.message}`, 'error')
      } finally {
        this.loadingGames = false
      }
    },
    
    resetForm() {
      this.gameInfo = {
        author: '',
        game_name: '',
        description: '',
        version: '',
        is_online_playable: true
      }
      this.selectedFile = null
      this.selectedCoverImage = null
      this.coverPreview = null
      this.$refs.fileInput.value = ''
    },
    
    showResult(message, type) {
      this.result = { message, type }
    },
    
    clearResult() {
      this.result = { message: '', type: '' }
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.game-upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.game-info-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  resize: vertical;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  font-weight: normal !important;
}

.checkbox-label input {
  width: auto !important;
  margin-right: 8px;
}

.cover-preview {
  max-width: 200px;
  max-height: 200px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.file-upload-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  margin: 20px 0;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover, .upload-area.dragover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.upload-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;
}

.upload-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.load-games-btn {
  background-color: #28a745;
}

.progress {
  width: 100%;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  margin: 10px 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s;
}

.result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 5px;
}

.result.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.result.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.games-list {
  margin-top: 30px;
}

.no-games {
  text-align: center;
  color: #666;
}

.games-container {
  display: grid;
  gap: 15px;
}

.game-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
}

.game-card-content {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.game-cover {
  flex-shrink: 0;
}

.cover-image {
  max-width: 150px;
  max-height: 150px;
  border-radius: 5px;
}

.no-cover {
  color: #888;
  font-style: italic;
  margin: 0;
}

.game-info {
  flex-grow: 1;
}

.game-info h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.game-info p {
  margin: 5px 0;
}
</style>
