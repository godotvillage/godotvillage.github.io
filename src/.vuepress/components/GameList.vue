<template>
  <div class="game-list-container">
    <h1>游戏列表</h1>
    <p>探索由社区成员上传的精彩游戏作品</p>

    <div class="list-controls">
      <button 
        @click="loadGames" 
        :disabled="loadingGames"
        class="load-btn"
      >
        {{ loadingGames ? '加载中...' : '刷新列表' }}
      </button>
    </div>

    <div v-if="loadingGames && games.length === 0" class="loading">
      <p>正在加载游戏列表...</p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 游戏列表显示区域 -->
    <div v-if="!loadingGames && games.length === 0 && !error" class="no-games">
      <p>暂无游戏</p>
    </div>
    
    <div v-if="games.length > 0" class="games-container">
      <div 
        v-for="game in games" 
        :key="game.game_id" 
        class="game-card"
        @click="playGame(game)"
      >
        <div class="game-card-content">
          <div class="game-cover">
            <img 
              v-if="game.cover_image" 
              :src="`${imageBaseUrl}/${game.cover_image}`" 
              :alt="`${game.game_name} 封面`"
              class="cover-image"
            >
            <div v-else class="no-cover">
              <span>暂无封面</span>
            </div>
          </div>
          <div class="game-info">
            <h3>{{ game.game_name }}</h3>
            <p class="author"><strong>作者:</strong> {{ game.author }}</p>
            <p class="version"><strong>版本:</strong> {{ game.version }}</p>
            <p class="description">{{ game.description || '暂无简介' }}</p>
            <div class="game-meta">
              <span class="online-status" :class="{ 'playable': game.is_online_playable }">
                {{ game.is_online_playable ? '支持在线游玩' : '仅下载' }}
              </span>
              <span class="file-size">{{ (game.file_size / 1024 / 1024).toFixed(2) }} MB</span>
              <span class="upload-time">{{ formatDate(game.upload_time) }}</span>
            </div>
          </div>
          <div class="play-button">
            <span v-if="game.is_online_playable">点击游玩</span>
            <span v-else>查看详情</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { baseUrl, imageBaseUrl, gameApi } from '../utils/request.js'

export default {
  name: 'GameList',
  data() {
    return {
      baseUrl,
      imageBaseUrl: imageBaseUrl,
      games: [],
      loadingGames: false,
      error: null
    }
  },
  mounted() {
    this.loadGames()
  },
  methods: {
    async loadGames() {
      this.loadingGames = true
      this.error = null
      
      try {
        const data = await gameApi.getGames()
        
        if (data.success) {
          this.games = data.data
        } else {
          this.error = `获取游戏列表失败: ${data.error}`
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.loadingGames = false
      }
    },
    
    playGame(game) {
      // 跳转到游戏页面，传递游戏ID作为参数
      const playUrl = `/game/play.html?id=${game.folder_name}`
      window.location.href = playUrl
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.game-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.game-list-container h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

.game-list-container > p {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.list-controls {
  text-align: center;
  margin-bottom: 30px;
}

.load-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.load-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.loading, .no-games {
  text-align: center;
  color: #666;
  font-size: 18px;
  padding: 40px;
}

.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.games-container {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.game-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: #007bff;
}

.game-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.game-cover {
  margin-bottom: 15px;
  text-align: center;
}

.cover-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.no-cover {
  height: 120px;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-style: italic;
}

.game-info {
  flex-grow: 1;
}

.game-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 20px;
}

.game-info p {
  margin: 8px 0;
  line-height: 1.5;
}

.author, .version {
  color: #555;
  font-size: 14px;
}

.description {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.game-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.game-meta span {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f8f9fa;
  color: #6c757d;
}

.online-status.playable {
  background-color: #d4edda;
  color: #155724;
}

.play-button {
  margin-top: 15px;
  text-align: center;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border-radius: 6px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.game-card:hover .play-button {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .games-container {
    grid-template-columns: 1fr;
  }
  
  .game-card-content {
    flex-direction: column;
  }
  
  .game-cover {
    margin-bottom: 15px;
  }
}
</style>
