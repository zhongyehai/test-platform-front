<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'

require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

const animationDuration = 6000

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    chartData: {
      type: Object,
      required: true
    }
    /*
      chartData:
      {
        'data': [20, 1, 19, 1, 13, 6],
        'options': ['总数', '启用中', '禁用中', '始终发送报告的任务', '不发送报告的任务', '失败时发送报告的任务'],
        'title': '定时任务'
      }
    */
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({

        // 图列提示框，默认不显示
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },

        legend: {
          show: true,
          // top: '6%' //与上方的距离 可百分比% 可像素px
        },

        // 图像区域
        grid: {
          top: '10%',
          left: '2%',
          right: '2%',
          bottom: '3%',
          containLabel: true
        },

        // x轴
        xAxis: [{
          type: 'category',
          axisLabel:{
            interval: 0,
            rotate: 0
          },
          // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: this.chartData.options,
          axisTick: {
            alignWithLabel: true
          }
        }],

        // y轴
        yAxis: [{
          type: 'value',
          axisTick: {
            show: false
          }
        }],

        // 数据
        series: [{
          name: this.chartData.title,
          type: 'bar',
          stack: 'vistors',
          barWidth: '60%',
          data: this.chartData.data
          // animationDuration
        }]
        // series: [{
        //   name: 'pageA',
        //   type: 'bar',
        //   stack: 'vistors',
        //   barWidth: '60%',
        //   data: [79, 52, 200, 334, 390, 330, 220],
        //   animationDuration
        // }, {
        //   name: 'pageB',
        //   type: 'bar',
        //   stack: 'vistors',
        //   barWidth: '60%',
        //   data: [80, 52, 200, 334, 390, 330, 220],
        //   animationDuration
        // }, {
        //   name: 'pageC',
        //   type: 'bar',
        //   stack: 'vistors',
        //   barWidth: '60%',
        //   data: [30, 52, 200, 334, 390, 330, 220],
        //   animationDuration
        // }]
      })
    }
  }
}
</script>
