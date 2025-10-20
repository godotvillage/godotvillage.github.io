import { defineClientConfig } from 'vuepress/client'
// @ts-ignore
import DiscussionDetailLayout from './layouts/DiscussionDetailLayout.vue'
import EmptyLayout from './layouts/EmptyLayout.vue'

export default defineClientConfig({
  layouts: {
    DiscussionDetailLayout,
    EmptyLayout
  },
})
