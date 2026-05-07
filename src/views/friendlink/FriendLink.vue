<template>
  <div class="friendlink-page">
    <!-- Hero -->
    <section class="fl-hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <!-- <div class="hero-badge">
          <el-icon><Link /></el-icon>
          友链
        </div> -->
        <h1 class="hero-title">友情链接</h1>
        <p class="hero-desc">欢迎来到友链页面！这里收录了社区成员的个人网站、博客及 B 站主页等链接。如果你也想加入友链，欢迎联系我们～</p>
      </div>
    </section>

    <!-- 链接列表 -->
    <section class="links-section">
      <div class="section-container">
        <h2 class="section-title">
          <el-icon><Connection /></el-icon>
          链接列表
        </h2>
        <div class="links-grid">
          <a
            v-for="link in friendLinks"
            :key="link.id"
            :href="link.url"
            target="_blank"
            class="link-card"
          >
            <div class="link-avatar">
              <img v-if="link.avatar" :src="link.avatar" :alt="link.name" />
              <span v-else class="avatar-text">{{ link.name.charAt(0) }}</span>
            </div>
            <div class="link-info">
              <h3>{{ link.name }}</h3>
              <p class="link-platform">
                <el-icon><Platform /></el-icon>
                {{ link.platform }}
              </p>
              <p class="link-note" v-if="link.note">{{ link.note }}</p>
            </div>
            <div class="link-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- 加入友链 -->
    <section class="join-section">
      <div class="section-container">
        <div class="join-card">
          <div class="join-content">
            <h2>想加入友链？</h2>
            <p>如果你是 Godot 开发者或有相关的内容创作，欢迎加入我们的友链列表！在社区中联系我们即可。</p>
          </div>
          <el-button type="primary" size="large" @click="handleJoin">
            <el-icon><Plus /></el-icon>
            加入友链
          </el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Link, Connection, Platform, ArrowRight, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface FriendLink {
  id: number
  name: string
  url: string
  platform: string
  avatar?: string
  note?: string
}

const friendLinks: FriendLink[] = [
  {
    id: 1,
    name: 'Valar',
    url: 'https://space.bilibili.com/214217611',
    platform: 'B站',
    note: 'Godot教程UP主'
  },
  {
    id: 2,
    name: '拔刀谦逊',
    url: 'https://space.bilibili.com/30014736',
    platform: 'B站',
    note: '独立游戏开发者'
  },
  {
    id: 3,
    name: 'Freeman',
    url: 'https://space.bilibili.com/281430873',
    platform: 'B站',
    note: 'Godot 2D游戏开发'
  },
  {
    id: 4,
    name: '传梦',
    url: 'https://space.bilibili.com/3691002818726537',
    platform: 'B站',
    note: '游戏开发与设计'
  },
  {
    id: 5,
    name: '局域联网',
    url: 'https://space.bilibili.com/346100122',
    platform: 'B站',
    note: 'Godot技术分享'
  },
  {
    id: 6,
    name: 'Godot中文社区',
    url: 'https://godotengine.org',
    platform: '官网',
    note: 'Godot官方引擎官网'
  }
]

const handleJoin = () => {
  ElMessage.info('请在社区中联系管理员加入友链')
}
</script>

<style scoped lang="scss">
.friendlink-page {
  width: 100%;
  padding-bottom: 64px;
}

.section-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
  width: 90%;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #F8FAFC;
  font-family: var(--font-heading);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

/* Hero */
.fl-hero {
  position: relative;
  padding: 64px 24px 48px;
  text-align: center;
  overflow: hidden;

  .hero-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40vw;
    height: 40vw;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(15, 23, 42, 0) 70%);
    z-index: 0;
    pointer-events: none;
  }

  .hero-content {
    position: relative;
    z-index: 1;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    padding: 6px 20px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    color: #60A5FA;
    margin-bottom: 20px;
  }

  .hero-title {
    font-family: var(--font-heading);
    font-size: 40px;
    font-weight: 700;
    color: #F8FAFC;
    margin-bottom: 16px;
  }

  .hero-desc {
    font-size: 15px;
    color: #94A3B8;
    max-width: 560px;
    margin: 0 auto;
    line-height: 1.7;
  }
}

/* Links grid */
.links-section {
  margin-bottom: 48px;

  .links-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .link-card {
    background: #1E293B;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      background: #273549;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

      .link-arrow {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .link-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      flex-shrink: 0;
      background: linear-gradient(135deg, #3B82F6, #8B5CF6);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-text {
        font-size: 20px;
        font-weight: 700;
        color: #fff;
      }
    }

    .link-info {
      flex: 1;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #F8FAFC;
        margin-bottom: 4px;
      }

      .link-platform {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #64748B;
        margin-bottom: 4px;
      }

      .link-note {
        font-size: 13px;
        color: #94A3B8;
      }
    }

    .link-arrow {
      color: #475569;
      opacity: 0;
      transform: translateX(-8px);
      transition: all 0.3s ease;
    }
  }
}

/* Join section */
.join-section {
  .join-card {
    background: linear-gradient(135deg, #1E293B, #273549);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;

    .join-content {
      h2 {
        font-size: 22px;
        font-weight: 700;
        color: #F8FAFC;
        margin-bottom: 8px;
      }

      p {
        font-size: 14px;
        color: #94A3B8;
        line-height: 1.6;
      }
    }
  }
}

@media (max-width: 640px) {
  .fl-hero .hero-title {
    font-size: 28px;
  }

  .links-section .links-grid {
    grid-template-columns: 1fr;
  }

  .join-section .join-card {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
}
</style>
