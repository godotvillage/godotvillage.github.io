<template>
  <div ref="chartRef" class="radar-chart" :style="{ height: `${height}px` }"></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { DIMENSION_KEYS } from '@/data/talentTags'
import { useThemeStore } from '@/stores/theme'

const props = defineProps<{
  scores: Record<string, number>
  size?: number
}>()

const themeStore = useThemeStore()
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const height = computed(() => props.size ?? 360)
const small = computed(() => (props.size ?? 360) < 280)

const buildOption = (): echarts.EChartsOption => {
  const isDark = themeStore.theme === 'dark'
  const textColor = isDark ? '#e5e7eb' : '#374151'
  const axisColor = isDark ? '#4b5563' : '#9ca3af'
  const areaColor = isDark ? 'rgba(102, 126, 234, 0.25)' : 'rgba(102, 126, 234, 0.2)'
  const s = small.value

  return {
    radar: {
      center: ['50%', '50%'],
      radius: '62%',
      indicator: DIMENSION_KEYS.map((d) => ({
        name: d.label,
        max: 10,
      })),
      axisName: {
        color: textColor,
        fontSize: s ? 10 : 13,
      },
      splitArea: {
        areaStyle: {
          color: [isDark ? '#1f2937' : '#fff', isDark ? '#111827' : '#f9fafb'],
        },
      },
      splitLine: {
        lineStyle: { color: axisColor },
      },
      axisLine: {
        lineStyle: { color: axisColor },
      },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: DIMENSION_KEYS.map((d) => props.scores[d.key] ?? 0),
            name: '能力值',
            areaStyle: { color: areaColor },
            lineStyle: { color: '#667eea', width: s ? 1.5 : 2 },
            itemStyle: { color: '#667eea' },
          },
        ],
        symbol: 'circle',
        symbolSize: s ? 4 : 5,
      },
    ],
  }
}

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(buildOption())
}

const resizeChart = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})

watch(() => themeStore.theme, () => {
  chartInstance?.setOption(buildOption())
})

watch(() => props.scores, () => {
  chartInstance?.setOption(buildOption())
}, { deep: true })
</script>

<style scoped lang="scss">
.radar-chart {
  width: 100%;
}
</style>
