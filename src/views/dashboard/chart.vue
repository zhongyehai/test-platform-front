<template>
  <div class="echarts" id="detailChart" :style="charSize"></div>
</template>

<script lang="ts" setup>
import {echarts, themeName} from '@/components/echarts/echarts'
import {ref, onMounted, onBeforeUnmount, computed } from "vue";
import {bus, busEvent} from "@/utils/bus-events";
import {getDetailCount} from "@/api/business-api/dashboard";

const option = ref({
  title: {
    text: '统计'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#283b56'
      }
    }
  },
  legend: {},
  toolbox: {  // 图表右侧的 刷新、下载 按钮
    show: false,
    feature: {
      dataView: { readOnly: false },
      restore: {},
      saveAsImage: {}
    }
  },
  dataZoom: {
    show: false,
    start: 0,
    end: 1000000
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: true,
      data: []
    },
    {
      type: 'category',
      boundaryGap: true,
      data: []
    }
  ],
  yAxis: [
    {
      type: 'value',
      boundaryGap: [0, 0]
    },
    {
      type: 'value',
      boundaryGap: [0, 0]
    }
  ],
  series: [
    {
      name: '柱状图',
      type: 'bar',
      showBackground: true,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#2378f7' },
            { offset: 0.7, color: '#2378f7' },
            { offset: 1, color: '#83bff6' }
          ])
        }
      },
      data: []
    },
    {
      name: '折线图',
      type: 'line',
      symbolSize: 9, //设置拐点大小
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: '#fe9d9a66' // 0% 处的颜色
          }, {
            offset: 1, color: '#fe9d9a00' // 100% 处的颜色
          }],
          global: false // 缺省为 false
        }
      },
      color: '#FE9D9A', //设置折线颜色
      lineStyle: {
        width: 2,
        type: 'solid'  //'dotted'虚线 'solid'实线
      },
      data: []
    }
  ]
})

const charSize = computed(() => {
  return {
    width: innerWidth > 1600 ? `${innerWidth * 0.9}px` : `${innerWidth * 0.86}px`,
    height: innerHeight > 800 ? `${innerHeight * 0.79}px` : `${innerHeight * 0.69}px`
  }
})

let chart: any = ref(null)

function initChart() {
  chart = echarts.init(document.getElementById("detailChart"), themeName);
  chart.setOption(option.value);
  window.onresize = function() {
    //自适应大小
    chart.resize();
  };
}

const getDetail = (message: any) => {
  if (message.type === 'dashboardCard') {
    getDetailCount(message.name).then(response => {
      option.value.title.text = `${response.data.title}统计`
      option.value.xAxis[0].data = response.data.options
      option.value.xAxis[1].data = response.data.options
      option.value.series[0].name = `${response.data.title}统计-柱状图`
      option.value.series[0].data = response.data.data
      option.value.series[1].name = `${response.data.title}统计-折线图`
      option.value.series[1].data = response.data.data

      // 销毁并重新初始化图表
      chart.clear()
      initChart();
    })
  }
}

onMounted(() => {
  initChart();
  bus.on(busEvent.changeData, getDetail);
})

onBeforeUnmount(() => {
  bus.off(busEvent.changeData, getDetail);
})



</script>

<style lang="scss" scoped>

</style>
