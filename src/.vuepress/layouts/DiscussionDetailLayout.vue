<template>
    <Layout>
        <Content />
        <div
            id="comments"
            class="giscus-container vp-comment" 
            vp-comment
        >
            <giscus-widget
                :repo="giscusConfig.repo"
                :repoId="giscusConfig.repoId"
                :category="category"
                :categoryId="categoryId"
                :mapping="giscusConfig.mapping"
                :term="discussionNumber"
                reactionsenabled="1"
                emitmetadata="0"
                inputposition="top"
                :theme="giscusTheme"
                lang="zh-CN"
                loading="lazy"
            ></giscus-widget>
        </div>
    </Layout>
</template>

<script>
import { Layout } from "vuepress-theme-hope/client";
import "giscus"
export default {
    name: 'DiscussionDetailLayout',
    data() {
        return {
            giscusConfig: {
                repo: 'godotvillage/godotvillage.github.io',
                repoId: 'R_kgDOP-_yiQ',
                mapping: 'number'
            },
            currentTheme: 'light'
        }
    },
    mounted() {
        // 初始化主题
        this.updateTheme()
        // 监听主题变化
        this.themeObserver = new MutationObserver(() => {
            this.updateTheme()
        })
        this.themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        })
    },
    beforeUnmount() {
        // 清理观察器
        if (this.themeObserver) {
            this.themeObserver.disconnect()
        }
    },
    methods: {
        updateTheme() {
            this.currentTheme = document.documentElement.getAttribute('data-theme') || 'light'
        }
    },
    components: {
        Layout
    },
    computed: {
        discussionNumber() {
            return this.$route.query.number
        },
        discussionCategory() {
            let category = this.$route.query.category
            if (category === undefined) {
                return {
                    name: 'general',
                    id: 'R_kgDOP-_yiQ'
                }
            }
            let categoryStr = decodeURIComponent(category)

            return JSON.parse(categoryStr)
        },
        category() {
            return this.discussionCategory.name
        },
        categoryId() {
            return this.discussionCategory.id
        },
        giscusTheme() {
            // 根据当前主题返回相应的CSS文件
            return this.currentTheme === 'dark'
                ? 'https://unpkg.com/vuepress-theme-hope@2.0.0-rc.94/templates/giscus/dark.css'
                : 'https://unpkg.com/vuepress-theme-hope@2.0.0-rc.94/templates/giscus/light.css'
        }
    }
}
</script>
<style scoped>
.giscus-container {
    min-width: 900px;
}
</style>