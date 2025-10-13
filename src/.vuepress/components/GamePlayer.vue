<template>
  <div class="game-player-container">
    <div v-if="loading" class="loading">
      <p>正在加载游戏...</p>
    </div>

    <div v-if="error" class="error-message">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button @click="$router.go(-1)" class="back-btn">返回游戏列表</button>
    </div>

    <div v-if="!loading && !error && !gameId" class="no-game-selected">
      <h2>未选择游戏</h2>
      <p>请从游戏列表中选择一个游戏进行游玩。</p>
      <button @click="goToGameList" class="back-btn">前往游戏列表</button>
    </div>

    <div v-if="gameInfo && !loading && !error" class="game-container">
      <!-- 游戏信息 -->
      <div class="game-header">
        <div class="game-info">
          <h1>{{ gameInfo.game_name }}</h1>
          <div class="game-meta">
            <span class="author">作者: {{ gameInfo.author }}</span>
            <span class="version">版本: {{ gameInfo.version }}</span>
            <span class="upload-time">上传时间: {{ formatDate(gameInfo.upload_time) }}</span>
          </div>
          <p v-if="gameInfo.description" class="description">{{ gameInfo.description }}</p>
        </div>
        <div class="game-cover" v-if="gameInfo.cover_image">
          <img 
            :src="`${imageBaseUrl}/${gameInfo.cover_image}`" 
            :alt="`${gameInfo.game_name} 封面`"
            class="cover-image"
          >
        </div>
      </div>

      <!-- 游戏控制按钮 -->
      <div class="game-controls">
        <button @click="goToGameList" class="control-btn secondary">返回列表</button>
        <button 
          v-if="gameInfo.is_online_playable" 
          @click="startGame" 
          :disabled="gameStarting"
          class="control-btn primary"
        >
          {{ gameStarting ? '加载中...' : '开始游戏' }}
        </button>
        <button 
          v-else 
          @click="downloadGame" 
          class="control-btn primary"
        >
          下载游戏
        </button>
      </div>

      <!-- 游戏播放区域 -->
      <div v-if="showGameFrame && gameInfo.is_online_playable" class="game-frame-container">
        <div class="game-frame-header">
          <span>{{ gameInfo.game_name }}</span>
          <button @click="stopGame" class="close-game-btn">×</button>
        </div>
        <iframe 
          :src="gameUrl" 
          class="game-frame"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>

      <!-- 不支持在线游玩的提示 -->
      <div v-if="!gameInfo.is_online_playable" class="offline-notice">
        <h3>此游戏不支持在线游玩</h3>
        <p>请下载游戏文件到本地运行。游戏文件大小: {{ (gameInfo.file_size / 1024 / 1024).toFixed(2) }} MB</p>
      </div>
    </div>
  </div>
</template>

<script>
import { gameApi, imageBaseUrl, gameBaseUrl } from '../utils/request.js'

export default {
  name: 'GamePlayer',
  data() {
    return {
      imageBaseUrl: imageBaseUrl,
      gameBaseUrl: gameBaseUrl,
      gameId: null,
      gameInfo: null,
      loading: false,
      error: null,
      showGameFrame: false,
      gameStarting: false,
      gameUrl: ''
    }
  },
  mounted() {
    this.initGame()
  },
  methods: {
    initGame() {
      // 从URL参数中获取游戏ID
      const urlParams = new URLSearchParams(window.location.search)
      this.gameId = urlParams.get('id')
      
      if (this.gameId) {
        this.loadGameInfo()
      }
    },
    
    async loadGameInfo() {
      this.loading = true
      this.error = null
      
      try {
        // 获取游戏列表，然后找到对应的游戏
        const data = await gameApi.getGames()
        
        if (data.success) {
          const game = data.data.find(g => g.folder_name === this.gameId)
          if (game) {
            this.gameInfo = game
          } else {
            this.error = '未找到指定的游戏'
          }
        } else {
          this.error = `获取游戏信息失败: ${data.error}`
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async startGame() {
      if (!this.gameInfo.is_online_playable) return
      
      this.gameStarting = true
      
      try {
        // 构建游戏URL - 假设游戏文件在特定路径下
        this.gameUrl = `${gameBaseUrl}/${this.gameId}/index.html`
        this.showGameFrame = true
      } catch (error) {
        this.error = `启动游戏失败: ${error.message}`
      } finally {
        this.gameStarting = false
      }
    },
    
    stopGame() {
      this.showGameFrame = false
      this.gameUrl = ''
    },
    
    downloadGame() {
      // 下载游戏文件
      const downloadUrl = gameApi.getDownloadUrl(this.gameId)
      window.open(downloadUrl, '_blank')
    },
    
    goToGameList() {
      window.location.href = '/game/list.html'
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.game-player-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error-message, .no-game-selected {
  text-align: center;
  padding: 40px;
}

.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  border-radius: 8px;
}

.no-game-selected {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.back-btn, .control-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 0 5px;
  transition: background-color 0.3s ease;
}

.back-btn:hover, .control-btn:hover {
  background-color: #0056b3;
}

.control-btn.secondary {
  background-color: #6c757d;
}

.control-btn.secondary:hover {
  background-color: #545b62;
}

.control-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.game-container {
  margin-top: 20px;
}

.game-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.game-info {
  flex-grow: 1;
}

.game-info h1 {
  margin: 0 0 15px 0;
  color: #333;
}

.game-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.game-meta span {
  font-size: 14px;
  color: #666;
}

.description {
  color: #555;
  line-height: 1.6;
  margin: 0;
}

.game-cover {
  flex-shrink: 0;
}

.cover-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.game-controls {
  text-align: center;
  margin-bottom: 30px;
}

.game-frame-container {
  margin-top: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.game-frame-header {
  background-color: #f8f9fa;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
}

.close-game-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-game-btn:hover {
  color: #333;
  background-color: #e9ecef;
  border-radius: 4px;
}

.game-frame {
  width: 100%;
  height: 600px;
  border: none;
}

.offline-notice {
  text-align: center;
  padding: 40px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  color: #856404;
}

.offline-notice h3 {
  margin: 0 0 15px 0;
}

.offline-notice p {
  margin: 0;
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
  }
  
  .game-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .game-frame {
    height: 400px;
  }
}
</style>
