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
    default: '98%'
  },
  height: {
    type: String,
    default: innerHeight > 800 ? `${innerHeight * 0.68}px` : `${innerHeight * 0.6}px`
  }
})
const chart = ref()

const  initChart = () => {
  const newChart = getNewChart(chart.value) // echarts.init(chart.value, themeName)
  let option = {
    // title: {
    //   text: '统计图'
    // },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {},
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      axisLabel: {
        interval: 0
      },
      data: props.chartData.options_list // ['公共业务线', 'xx业务线']
    },
    series: props.chartData.items
  }

  newChart.setOption(option)
}


onMounted(() => {
  initChart()
})


</script>

<style scoped lang="scss">

</style>
