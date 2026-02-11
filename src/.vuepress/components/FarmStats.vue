<template>
  <div class="farm-stats">
    <div class="stat-card">
      <div class="stat-icon">🌱</div>
      <div class="stat-info">
        <div class="stat-number" ref="totalProjects">{{ stats.total }}</div>
        <div class="stat-label">总项目数</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🚀</div>
      <div class="stat-info">
        <div class="stat-number" ref="activeProjects">{{ stats.active }}</div>
        <div class="stat-label">进行中</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">✅</div>
      <div class="stat-info">
        <div class="stat-number" ref="completedProjects">{{ stats.completed }}</div>
        <div class="stat-label">已完成</div>
      </div>
    </div>
  </div>
</template>

<script>
import { farmApi } from '../utils/request.ts';

export default {
  name: 'FarmStats',
  data() {
    return {
      stats: {
        total: 0,
        active: 0,
        completed: 0
      },
      updateInterval: null
    }
  },
  mounted() {
    // 页面加载时更新统计
    this.updateStats();
    
    // 监听项目添加事件
    window.addEventListener('projectAdded', this.updateStats);
    
    // 定期更新统计（以防其他地方修改了数据）
    this.updateInterval = setInterval(this.updateStats, 5000);
  },
  beforeUnmount() {
    // 清理定时器和事件监听器
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    window.removeEventListener('projectAdded', this.updateStats);
  },
  methods: {
    async updateStats() {
      try {
        // 先基于 /api/Farm 列表计算统计（避免猜测后端 stats 路由）
        const statsResponse = await farmApi.getFarmListStats();
        if (statsResponse && statsResponse.success) {
          const newStats = statsResponse.data || {};
          
          // 添加更新动画效果
          this.animateUpdate('totalProjects', this.stats.total, newStats.total || 0);
          this.animateUpdate('activeProjects', this.stats.active, newStats.active || 0);
          this.animateUpdate('completedProjects', this.stats.completed, newStats.completed || 0);
          
          // 更新数据
          this.stats = {
            total: newStats.total || 0,
            active: newStats.active || 0,
            completed: newStats.completed || 0
          };
        } else {
          throw new Error(statsResponse?.error || '获取项目统计失败');
        }
      } catch (error) {
        console.error('获取项目统计失败:', error);
        // 如果API调用失败，回退到localStorage方式
        this.updateStatsFromLocalStorage();
      }
    },
    
    updateStatsFromLocalStorage() {
      const projects = JSON.parse(localStorage.getItem('farmProjects') || '[]');
      const activeCount = projects.filter(p => p.status === '进行中').length;
      const completedCount = projects.filter(p => p.status === '已完成').length;
      
      // 添加更新动画效果
      this.animateUpdate('totalProjects', this.stats.total, projects.length);
      this.animateUpdate('activeProjects', this.stats.active, activeCount);
      this.animateUpdate('completedProjects', this.stats.completed, completedCount);
      
      // 更新数据
      this.stats = {
        total: projects.length,
        active: activeCount,
        completed: completedCount
      };
    },
    
    animateUpdate(refName, oldValue, newValue) {
      if (oldValue !== newValue && this.$refs[refName]) {
        this.$refs[refName].classList.add('updating');
        setTimeout(() => {
          if (this.$refs[refName]) {
            this.$refs[refName].classList.remove('updating');
          }
        }, 300);
      }
    }
  }
}
</script>

<style scoped>
.farm-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.stat-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 150px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2em;
}

.stat-info {
  text-align: left;
}

.stat-number {
  font-size: 1.8em;
  font-weight: bold;
  line-height: 1;
  transition: all 0.3s ease;
}

.stat-number.updating {
  transform: scale(1.2);
  color: #27ae60;
}

.stat-label {
  font-size: 0.9em;
  opacity: 0.8;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .farm-stats {
    gap: 15px;
  }
  
  .stat-card {
    min-width: 120px;
    padding: 15px;
  }
  
  .stat-number {
    font-size: 1.5em;
  }
}
</style>
