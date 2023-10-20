<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'

require('echarts/theme/macarons') // echarts theme

export default {

  props: {
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
      default: '100%'
    },
    height: {
      type: String,
      default: `${window.innerHeight * 0.9}px` // '500px'
    }

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
          data: this.chartData.options_list // ['公共业务线', '印尼业务线', '印度业务线']
        },
        series: [
          {
            name: '使用次数',
            type: 'bar',
            data: this.chartData.use_count_list // [18203, 23489, 29034]
          },
          {
            name: '整体通过次数',
            type: 'bar',
            data: this.chartData.use_pass_count_list // [19325, 23438, 31000]
          },
          // {
          //   name: '整体通过率',
          //   type: 'bar',
          //   data: this.chartData.use_pass_rate_list // [19325, 23438, 31000]
          // },
          {
            name: '巡检次数',
            type: 'bar',
            data: this.chartData.patrol_count_list // [19325, 23438, 31000]
          },
          {
            name: '巡检通过次数',
            type: 'bar',
            data: this.chartData.patrol_pass_count_list // [19325, 23438, 31000]
          },
          // {
          //   name: '巡检通过率',
          //   type: 'bar',
          //   data: this.chartData.patrol_pass_rate_list // [19325, 23438, 31000]
          // },
          {
            name: '造数据次数',
            type: 'bar',
            data: this.chartData.make_data_count_list // [19325, 23438, 31000]
          }
        ]
      })
    }
  }
}
</script>
