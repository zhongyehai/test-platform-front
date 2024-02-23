<template>
  <div class="layout-container">
    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-radio-group v-model="timeSlot" size="smail" @change="getOverviewData">
          <el-radio-button v-for="(value, key) in timeSlotMapping" :key="key" :label="key" />
        </el-radio-group>
      </div>
    </div>

    <div>
      <Card v-for="row in useCardRes" :key="row.title" :row="row"/>
    </div>

    <div style="margin:30px">
      <overviewChart :chart-data="useChartRes" :key="useChartRes.options_list"></overviewChart>
    </div>


  </div>
</template>

<script setup lang="ts">
import {onMounted, ref } from "vue";
import Card from '@/components/card/index.vue'
import overviewChart from './chart.vue'
import {GetUseCard, GetUseChart} from "@/api/business-api/stat";

const timeSlot = ref('近7天')
const timeSlotMapping = ref({'近7天': -7, '近14天': -14, '近30天': -30, '近90天': -90, '近180天': -180})
const useCardRes = ref({
  "page_trigger_count": 0,
  // "page_trigger_pass_count": 0,
  "page_trigger_pass_rate": 0,
  "patrol_count": 0,
  // "patrol_pass_count": 0,
  "patrol_pass_rate": 0
})
const useChartRes = ref({
  'options_list': [],
  'items': [
    { 'name': '人工触发次数', 'type': 'bar', 'data': 0 },
    { 'name': '人工通过次数', 'type': 'bar', 'data': 0 },
    { 'name': '巡检次数', 'type': 'bar', 'data': 0 },
    { 'name': '巡检通过次数', 'type': 'bar', 'data': 0 }
  ]
})
const getOverviewData = () => {
  getUseCard()
  getUseChart()
}


const getUseCard = () => {
  GetUseCard({ time_slot: timeSlotMapping.value[timeSlot.value] }).then(response => {
    useCardRes.value = [
      {title: '人工触发次数', color: '#36b9cc', icon: 'iconfont icon-testwodexiao', total: response.data.page_trigger_count},
      {title: '人工通过率', color: '#4e73df', icon: 'iconfont icon-testcharts-curve', total: response.data.page_trigger_pass_rate},
      {title: '巡检次数', color: '#1cc88a', icon: 'iconfont icon-testremind-btn-fill', total: response.data.patrol_count},
      {title: '巡检通过率', color: '#f6c23e', icon: 'iconfont icon-testcharts-line', total: response.data.patrol_pass_rate}
    ]
  })
}

// 统计图
const getUseChart = () => {
  GetUseChart({ time_slot: timeSlotMapping.value[timeSlot.value] }).then(response => {
    useChartRes.value = response.data
  })
}

onMounted(() => {
  getOverviewData()
})

</script>

<style scoped lang="scss">

</style>
