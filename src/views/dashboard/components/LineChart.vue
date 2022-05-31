<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'

require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

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
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
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
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
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
      // this.setOptions(this.chartData)
      //
      this.setOptions()
    },
    // setOptions({ expectedData, actualData } = {}) {
    // setOptions({ title, options, data } = {}) {
    setOptions() {
      this.chart.setOption({
        xAxis: {
          axisLabel:{
            interval: 0,
            rotate: 0
          },
          // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: this.chartData.options,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 20,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          //y轴刻度线
          axisTick: {
            show: false
          }
        },
        // 图像title，用list
        legend: {
          // data: ['expected', 'actual']
          data: [this.chartData.title],
        },
        series: [
          {
            // name: 'expected', itemStyle: {
            name: this.chartData.title, itemStyle: {
              normal: {
                color: '#FF005A',
                lineStyle: {
                  color: '#FF005A',
                  width: 2
                }
              }
            },
            smooth: true,
            type: 'line',
            // data: expectedData,  // [100, 120, 161, 134, 105, 160, 165]
            data: this.chartData.data,  // 数据
            animationDuration: 2800,
            animationEasing: 'cubicInOut'
          },
          // {
          //   name: 'actual',
          //   smooth: true,
          //   type: 'line',
          //   itemStyle: {
          //     normal: {
          //       color: '#3888fa',
          //       lineStyle: {
          //         color: '#3888fa',
          //         width: 2
          //       },
          //       areaStyle: {
          //         color: '#f3f8ff'
          //       }
          //     }
          //   },
          //   data: actualData,
          //   animationDuration: 2800,
          //   animationEasing: 'quadraticOut'
          // }
        ]
      })
    }
  }
}
</script>
