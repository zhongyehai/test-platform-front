<template>
  <div ref="chart" class="chart" :style="{height:height,width:width}" />
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {getNewChart} from '@/components/echarts/echarts'
const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  className: {
    type: String,
    default: 'chart'
  },
  width: {
    type: String,
    default: '99%'
  },
  height: {
    type: String,
    default: innerHeight > 800 ? `${innerHeight * 0.83}px` : `${innerHeight * 0.74}px`

  }
})
const chart = ref()

const  initChart = () => {
  const newChart = getNewChart(chart.value)
  let option = {
    title: {
      text: props.chartData.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: props.chartData.title,
        type: 'pie',
        radius: '50%',
        data: props.chartData.stat_list,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  newChart.setOption(option)
}


onMounted(() => {
  initChart()
})


</script>

<style scoped lang="scss">

</style>
