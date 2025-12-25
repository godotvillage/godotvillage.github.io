import { defineClientConfig } from 'vuepress/client'
// @ts-ignore
import DiscussionDetailLayout from './layouts/DiscussionDetailLayout.vue'
import EmptyLayout from './layouts/EmptyLayout.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'

export default defineClientConfig({
  layouts: {
    Layout: DefaultLayout,
    DiscussionDetailLayout,
    EmptyLayout
  },
})
