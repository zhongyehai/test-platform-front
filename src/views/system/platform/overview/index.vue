<template>
  <el-radio-group v-model="timeSlot" size="smail" @change="getOverviewData">
    <el-radio-button v-for="(value, key) in timeSlotMapping" :key="key" :label="key"/>
  </el-radio-group>

  <div>
    <Card v-for="row in useCardRes" :key="row.title" :row="row"/>
  </div>

  <div style="margin-top:10px">
    <overviewChart :chart-data="useChartRes" :key="useChartRes.options_list"></overviewChart>
  </div>

</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import Card from '@/components/card/index.vue'
import overviewChart from './chart.vue'
import {GetUseCard, GetUseChart} from "@/api/business-api/stat";

const timeSlot = ref('近7天')
const timeSlotMapping = ref({'近7天': -7, '近14天': -14, '近30天': -30, '近90天': -90, '近180天': -180})
const useCardRes = ref([
    {
      title: '人工触发次数',
      color: '#36b9cc',
      icon: 'everyUser',
      total: 0
    },
    {
      title: '人工通过率',
      color: '#4e73df',
      icon: 'chartLine',
      total: 0
    },
    {
      title: '巡检次数',
      color: '#1cc88a',
      icon: 'calendar',
      total: 0
    },
    {
      title: '巡检通过率',
      color: '#f6c23e',
      icon: 'chartLine',
      total: 0
    }
])
const useChartRes = ref({
  'options_list': [],
  'items': [
    {'name': '人工触发次数', 'type': 'bar', 'data': 0},
    {'name': '人工通过次数', 'type': 'bar', 'data': 0},
    {'name': '巡检次数', 'type': 'bar', 'data': 0},
    {'name': '巡检通过次数', 'type': 'bar', 'data': 0}
  ]
})
const getOverviewData = () => {
  getUseCard()
  getUseChart()
}


const getUseCard = () => {
  GetUseCard({time_slot: timeSlotMapping.value[timeSlot.value]}).then(response => {
    useCardRes.value[0].total = response.data.page_trigger_count
    useCardRes.value[1].total = response.data.page_trigger_pass_rate
    useCardRes.value[2].total = response.data.patrol_count
    useCardRes.value[3].total = response.data.patrol_pass_rate
  })
}

// 统计图
const getUseChart = () => {
  GetUseChart({time_slot: timeSlotMapping.value[timeSlot.value]}).then(response => {
    useChartRes.value = response.data
  })
}

onMounted(() => {
  getOverviewData()
})

</script>

<style scoped lang="scss">

</style>
