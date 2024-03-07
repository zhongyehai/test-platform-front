<template>

  <el-select v-model="queryItems.business_id" filterable placeholder="选择业务线" size="small"
             style="margin-right: 10px">
    <el-option v-for="item in businessList" :key="item.id" :label="item.name" :value="item.id"/>
  </el-select>

  <el-select v-model="queryItems.trigger_type" filterable placeholder="选择触发方式" size="small" clearable
             style="margin-right: 10px">
    <el-option v-for="item in triggerTypeList" :key="item.value" :label="item.label" :value="item.value"/>
  </el-select>

  <el-date-picker
      style="margin-right: 10px"
      v-model="timeList"
      type="daterange"
      unlink-panels
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      :shortcuts="pickerOptions"
      value-format="YYYY-MM-DD"
      size="small"
  />

  <el-button type="primary" @click="getAnalyseChart()"> 查询</el-button>


  <el-row style="margin-top: 10px;margin-left: 20px">

    <el-col :span="12">
      <count-chart :key="analyseChartRes.use_count.stat" :chart-data="analyseChartRes.use_count.stat"/>
      <div style="text-align: center; color: #409EFF">
        报告总计{{
          analyseChartRes.use_count.detail.all_count
        }}条，执行通过{{ analyseChartRes.use_count.detail.pass_count }}
        条，执行失败{{ analyseChartRes.use_count.detail.fail_count }}条，执行通过率
        {{
          ((analyseChartRes.use_count.detail.pass_count / analyseChartRes.use_count.detail.all_count) * 100).toFixed(3).toString()
        }}%
      </div>
    </el-col>

    <el-col :span="12">
      <count-chart :key="analyseChartRes.create.stat" :chart-data="analyseChartRes.create.stat"/>
    </el-col>
  </el-row>

</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import countChart from './chart.vue'
import {GetAnalyseChart} from "@/api/business-api/stat";
import {GetBusinessList} from "@/api/config/business";


const queryItems = ref({
  business_id: undefined,
  trigger_type: undefined,
  start_time: undefined,
  end_time: undefined
})
const timeList = ref([])
const triggerTypeList = ref([
  {label: '页面', value: 'page'},
  {label: '流水线', value: 'pipeline'},
  {label: '定时任务', value: 'cron'}
])
const pickerOptions = [
  {
    text: '7天内',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '30天内',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '90天内',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]
const analyseChartRes = ref({
  'use_count': {
    'stat': {
      'title': '执行次数统计',
      'stat_list': [
        {'name': '通过数量', 'value': 0},
        {'name': '不通过数量', 'value': 0}
      ]
    },
    'detail': {'all_count': 0, 'pass_count': 0, 'fail_count': 0}
  },
  'create': {
    'stat': {
      'title': '执行人员统计',
      'stat_list': [{'name': '', 'value': 0}]
    }
  }
})
const businessList = ref([])
const getBusinessList = () => {
  if (businessList.value.length < 1) {
    GetBusinessList({page_num: 1, page_size: 99999}).then(response => {
      businessList.value = response.data.data
      queryItems.value.business_id = businessList.value[0].id
      getAnalyseChart()
    })
  }
}

const getAnalyseChart = () => {
  if (timeList.value && timeList.value.length > 0) {
    queryItems.value.start_time = timeList.value[0]
    queryItems.value.end_time = timeList.value[1]
  } else {
    queryItems.value.start_time = undefined
    queryItems.value.end_time = undefined
  }
  GetAnalyseChart(queryItems.value).then(response => {
    analyseChartRes.value = response.data
  })
}

onMounted(() => {
  getBusinessList()
})

</script>

<style scoped lang="scss">

</style>
