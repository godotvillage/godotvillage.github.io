<template>
    <div>
        <iframe :width="width" :height="height" :src="url" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
    </div>
</template>

<script>
export default {
    name: 'BiliBlackboard',
    props: {
        width: {
            type: String,
            default: "100%"
        },
        height: {
            type: String,
            default: "500px"
        },
        link: {
            type: String,
            required: true
        }
    },
    computed: {
        url() {
            if (!this.link) {
                return "";
            }
            return `https://player.bilibili.com/player.html?isOutside=true&bvid=${this.link}&p=1&autoplay=false&poster=true&danmaku=false&muted=true`;
        }
    }
};
</script>

<style scoped>
</style>