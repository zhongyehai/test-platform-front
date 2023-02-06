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

    // 图片数据
    dataObj: {
      type: Object
    },

    className: {
      type: String,
      default: 'chart'
    },

    // 图片宽度
    width: {
      type: String,
      default: '100%'
    },

    // 图片高度
    height: {
      type: String,
      default: '350px'
    },
  },
  data() {
    return {
      titleList: [],
      dataList: [],
      chart: null,
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
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          // data: ['成功数', '失败数']  // 饼图元素
          data: this.dataObj.titleList  // 饼图元素
        },
        series: [
          {
            name: '用例统计',  // 饼图描述
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            // 各元素对应的值
            // data: [
            //   { value: 320, name: '成功数' },
            //   { value: 240, name: '失败数' },
            // ],
            data: this.dataObj.dataList,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
