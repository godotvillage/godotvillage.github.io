<template>
  <div class="tool-card" @click="navigateToTool">
    <div class="tool-cover">
      <img :src="cover" :alt="name" />
    </div>
    <div class="tool-info">
      <h3 class="tool-name">{{ name }}</h3>
      <p class="tool-author" v-if="author">
        <span class="author-label">作者：</span>
        <span class="author-name">{{ author }}</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToolCard',
  props: {
    cover: {
      type: String,
      required: true,
      default: ''
    },
    url: {
      type: String,
      required: true,
      default: ''
    },
    name: {
      type: String,
      required: true,
      default: ''
    },
    author: {
      type: String,
      default: ''
    }
  },
  methods: {
    navigateToTool() {
      if (this.url) {
        window.location.href = this.url;
      }
    }
  }
}
</script>

<style scoped>
.tool-card {
  background: var(--card-bg-color, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--theme-color, #3eaf7c);
}

.tool-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--cover-bg, #f3f4f6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.tool-card:hover .tool-cover img {
  transform: scale(1.05);
}

.tool-info {
  padding: 16px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #1f2937);
  line-height: 1.4;
}

.tool-author {
  margin: 0;
  font-size: 14px;
  color: var(--text-color-secondary, #6b7280);
  display: flex;
  align-items: center;
  gap: 4px;
}

.author-label {
  font-weight: 500;
}

.author-name {
  color: var(--theme-color, #3eaf7c);
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .tool-card {
    --card-bg-color: #1f2937;
    --border-color: #374151;
    --text-color: #f9fafb;
    --text-color-secondary: #9ca3af;
    --cover-bg: #111827;
  }
}

html.dark .tool-card {
  --card-bg-color: #1f2937;
  --border-color: #374151;
  --text-color: #f9fafb;
  --text-color-secondary: #9ca3af;
  --cover-bg: #111827;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .tool-cover {
    height: 160px;
  }

  .tool-info {
    padding: 12px 16px;
  }

  .tool-name {
    font-size: 16px;
  }

  .tool-author {
    font-size: 13px;
  }
}
</style>

