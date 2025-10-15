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
                theme="https://unpkg.com/vuepress-theme-hope@2.0.0-rc.94/templates/giscus/light.css"
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
            }
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
            return JSON.parse(decodeURIComponent(this.$route.query.category))
        },
        category() {
            return this.discussionCategory.name
        },
        categoryId() {
            return this.discussionCategory.id
        }
    }
}
</script>
<style scoped>
.giscus-container {
    min-width: 900px;
}
</style>