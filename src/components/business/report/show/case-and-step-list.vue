<template>
  <el-row style="margin-left: 5px; margin-right: 5px">
    <el-col :xs="10" :sm="9" :md="10" :lg="11" :xl="11" style="border:3px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
      <el-tabs v-model="caseListTab">
        <el-tab-pane :label="caseListTab" :name="caseListTab">
          <el-table
              v-loading="caseTableIsLoading"
              element-loading-text="数据获取中"
              element-loading-spinner="el-icon-loading"
              :data="showCaseList"
              row-key="id"
              :row-class-name="tableRowClassName"
              :height="tableHeight"
              size="small"
              :expand-row-keys="expandIds"
              stripe
              @expand-change="changeExpandStatus"
              @row-click="clickRow"
          >

            <!-- 步骤列表 -->
            <el-table-column type="expand" min-width="5%">
              <template #default="scope">
                <el-table
                    :ref="scope.row.id"
                    v-loading="stepTableIsLoading"
                    :show-header="false"
                    element-loading-text="数据获取中"
                    element-loading-spinner="el-icon-loading"
                    :data="showStepList"
                    row-key="id"
                    :header-cell-style="{'text-align':'center'}"
                    :row-class-name="tableRowClassName"
                    size="small"
                    stripe
                    @row-click="clickRow"
                >
                  <el-table-column prop="num" label="序号" align="center" min-width="10%">
                    <template #default="scope">
                      <span> {{ scope.$index + 1 }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip prop="name" label="名称" align="left" min-width="45%">
                    <template #default="scope">
                        <span
                            :style="{'textDecoration': scope.row.result === 'skip' ? 'line-through' : ''}"
                        >
                          {{ scope.row.name }}
                        </span>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip prop="duration" label="耗时" align="center" min-width="20%">
                    <template #default="scope">
                      <!--                        <span v-if="scope.row.row_id.indexOf('case') !== -1"> {{ scope.row.result !== 'error' ? scope.row.summary.time.duration || '-' : '-' }}秒 </span>-->
                      <!--                        <span v-else> {{ scope.row.summary.elapsed_ms ? `${scope.row.summary.elapsed_ms}毫秒` : '-' }} </span>-->
                      <span> {{ scope.row.summary.elapsed_ms ? `${scope.row.summary.elapsed_ms}毫秒` : '-' }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column prop="operate" align="center" label="操作" min-width="12%">
                    <template #default="scope">
                      <el-button
                          v-show="scope.row.case_id && scope.row.result !== 'waite'"
                          type="text"
                          size="small"
                          @click="showCaseEditor(scope.row)"
                      >
                        编辑
                      </el-button>
                    </template>
                  </el-table-column>

                </el-table>
              </template>
            </el-table-column>

            <el-table-column prop="num" label="序号" align="center" min-width="10%">
              <template #default="scope">
                <span> {{ scope.$index + 1 }} </span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip prop="name" label="名称" align="left" min-width="45%">
              <template #default="scope">
                  <span
                      :style="{'textDecoration': scope.row.result === 'skip' ? 'line-through' : ''}"
                  >
                    {{ scope.row.name }}
                  </span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip prop="duration" label="耗时" align="center" min-width="17%">
              <template #default="scope">
                <!--                  <span v-if="scope.row.row_id.indexOf('case') !== -1"> {{ scope.row.result !== 'error' ? scope.row.summary.time.case_duration || '-' : '-' }}秒 </span>-->
                <!--                  <span v-else> {{ scope.row.summary.elapsed_ms ? `${scope.row.summary.elapsed_ms}毫秒` : '-' }} </span>-->
                <span> {{
                    scope.row.result !== 'error' ? scope.row.summary.time.case_duration || '-' : '-'
                  }}秒 </span>
              </template>
            </el-table-column>

            <el-table-column prop="operate" align="center" label="操作" min-width="12%">
              <template #default="scope">
                <el-button
                    v-show="scope.row.case_id && scope.row.result !== 'waite'"
                    type="text"
                    size="small"
                    @click="showCaseEditor(scope.row)"
                >编辑</el-button>
              </template>
            </el-table-column>

          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-col>

    <el-col :xs="14" :sm="15" :md="14" :lg="13" :xl="13">
      <div style="margin-left: 5px">
        <el-tabs v-show="reportStepDetailIsShow" v-model="stepDataTab">
          <el-tab-pane :label="stepDataTab" :name="stepDataTab">
            <el-scrollbar class="aside_scroll" :style="{height: `${scrollHeight}`}">
              <showReportStepDetailView
                  :test-type="testType"
                  :report-step-data="reportStep"
                  :before-img-is-loading="beforeImgIsLoading"
                  :after-img-is-loading="afterImgIsLoading"
              />
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>

        <el-tabs v-show="reportCaseDetailIsShow" v-model="caseDataTab">
          <el-tab-pane :label="caseDataTab" :name="caseDataTab">
            <el-scrollbar class="aside_scroll" :style="{height: `${scrollHeight}`}">
              <showReportCaseDetailView :test-type="testType" :report-case-data="reportCase"/>
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount, watch, nextTick, computed} from "vue";
import {GetReportCaseList, GetReportStepDetail, GetReportStepImg, GetReportStepList} from "@/api/business-api/report";
import {bus, busEvent} from "@/utils/bus-events";
import showReportCaseDetailView from './case-detail.vue'
import showReportStepDetailView from './step-detail.vue'

const props = defineProps({
  testType: {
    default: '',
    type: String
  },
  showCaseType: {
    default: '',
    type: String
  },
  showStepType: {
    default: '',
    type: String
  },
})

watch(() => props.showCaseType, (newValue, oldValue) => {
  if (newValue === 'all') {
    showCaseList.value = allCaseList.value
  } else if (newValue === 'success') {
    showCaseList.value = successCaseList.value
  } else if (newValue === 'fail') {
    showCaseList.value = failCaseList.value
  } else if (newValue === 'skip') {
    showCaseList.value = skipCaseList.value
  } else if (newValue === 'error') {
    showCaseList.value = errorCaseList.value
  }
})

watch(() => props.showStepType, (newValue, oldValue) => {
  if (newValue === 'all') {
    showStepList.value = allStepList.value
  } else if (newValue === 'success') {
    showStepList.value = successStepList.value
  } else if (newValue === 'fail') {
    showStepList.value = failStepList.value
  } else if (newValue === 'skip') {
    showStepList.value = skipStepList.value
  } else if (newValue === 'error') {
    showStepList.value = errorStepList.value
  }
})

const reportId = ref()
const caseTableIsLoading = ref(false)
const stepTableIsLoading = ref(false)
const showCaseList = ref([])
const showStepList = ref([])
const allStepList = ref([])
const successStepList = ref([])
const failStepList = ref([])
const skipStepList = ref([])
const errorStepList = ref([])
const allCaseList = ref([])
const successCaseList = ref([])
const failCaseList = ref([])
const skipCaseList = ref([])
const errorCaseList = ref([])

const tableHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.70}px`
  }else {  // 大屏
    return `${innerHeight * 0.83}px`
  }
})
const scrollHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.70}px`
  }else {  // 大屏
    return `${innerHeight * 0.83}px`
  }
})
const expandIds = ref([])  // 要展开的行数据的id
const caseListTab =  '用例列表'
const caseDataTab =  '用例明细'
const stepDataTab =  '步骤明细'
const reportCaseDetailIsShow = ref(false)
const reportStepDetailIsShow = ref(false)
const reportCase = ref({
  name: '测试用例',
  result: 'success',
  summary: {
    stat: {fail: 0, skip: 0, error: 0, total: 0, success: 0},
    time: {end_at: '', start_at: '', case_duration: 0, step_duration: 0, all_duration: 0},
    result: 'success'
  },
  case_data: {
    id: 18,
    env: null,
    num: 0,
    desc: '测试用例',
    name: '测试用例',
    status: 1,
    headers: [],
    skip_if: [],
    suite_id: 20,
    module_id: null,
    run_times: 1,
    variables: [],
    create_user: 1,
    script_list: []
  },
  error_msg: ''
})
const reportStep = ref({
  case_id: undefined,
  name: undefined,
  stat: {elapsed_ms: undefined, content_size: undefined, request_at: undefined, response_at: undefined},
  redirect_print: undefined,
  variables_mapping: {},
  extract_msgs: {},
  validation_results: [],
  before: null,
  after: null,
  request: {
    url: undefined,
    method: undefined,
    headers: {},
    body: {},
    timeout: 60,
    params: {},
    json: {},
    data: {},
    files: {},
    verify: false,
    allow_redirects: false
  },
  response: {
    ok: true,
    url: undefined,
    status_code: 200,
    reason: 'OK',
    cookies: {},
    encoding: 'utf-8',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': '84',
      Server: 'Werkzeug/2.0.1 Python/3.9.6',
      Date: 'Tue, 20 Jun 2023 05:56:20 GMT'
    },
    content_type: 'text/html; charset=utf-8',
    json: {}
  },
  test_action: {
    execute_name: '',
    action: '',
    by_type: '',
    screen: '',
    element: '',
    text: '',
    wait_time_out: ''
  }
})
const beforeImgIsLoading = ref(false)
const afterImgIsLoading = ref(false)


const tableRowClassName = ({ row, rowIndex }) => {
  return `${row.result}-row`
}

const changeExpandStatus = (row, status) => {
  reportCaseDetailIsShow.value = false
  const expandIdIndex = expandIds.value.indexOf(row.id)
  if (expandIdIndex === -1) { // 打开用例
    expandIds.value.push(row.id)
    getReportStepList(row.id)
  } else {
    expandIds.value.splice(expandIdIndex, 1)
  }
}

const clickRow = (row, column, event) => {
  if (row.row_id.indexOf('step') !== -1 && column.property === 'name') { // 点步骤
    getStepData(row.id)
    reportCaseDetailIsShow.value = false
  } else if (row.row_id.indexOf('case') !== -1 && column.property === 'name') { // 点用例
    reportCase.value = JSON.parse(JSON.stringify(row))
    reportStepDetailIsShow.value = false
    reportCaseDetailIsShow.value = true
  }
}

const getStepData = (reportStepId: any) => {
  GetReportStepDetail(props.testType, { id: reportStepId }).then(response => {
    reportStep.value = response.data.step_data
    reportStepDetailIsShow.value = true

    // 非接口测试，获取对应的步骤截图
    if (props.testType !== 'api') {
      // 获前置取截图
      beforeImgIsLoading.value = true
      GetReportStepImg(props.testType, { report_id: reportId.value, report_step_id: reportStepId, img_type: 'before_page' }).then(response => {
        reportStep.value.before = response.data.data
        beforeImgIsLoading.value = false
      })

      // 获后置取截图
      afterImgIsLoading.value = true
      GetReportStepImg(props.testType, { report_id: reportId.value, report_step_id: reportStepId, img_type: 'after_page' }).then(response => {
        reportStep.value.after = response.data.data
        afterImgIsLoading.value = false
      })
    }
  })
}

const getReportCaseList = () => {
  caseTableIsLoading.value = true
  GetReportCaseList(props.testType, { detail: true, report_id: reportId.value }).then(response => {
    caseTableIsLoading.value = false
    parseReportCaseList(response.data)
  })
}

const parseReportCaseList = (caseList: any[]) => {
  // 展示用例信息
  if (caseList.length > 0) {
    reportCase.value = caseList[0]
    reportCaseDetailIsShow.value = true
  }
  caseList.forEach(caseData => {
    caseData['row_id'] = `case_${caseData.id}`
    caseData.case_data = parseVariables(caseData)

    // 判断用例下有没有步骤
    if (caseData.result !== 'error') {
      caseData.children = []
      const summary = caseData.summary
      caseData.hasStep = summary.stat.total > 0 // 直接跳过的用例、用例下所有步骤都跳过的，total为0
      caseData.summary = summary
    }

    // 分开储存用例
    if (caseData.result === 'success') {
      successCaseList.value.push(caseData)
    } else if (caseData.result === 'fail') {
      failCaseList.value.push(caseData)
    } else if (caseData.result === 'skip') {
      skipCaseList.value.push(caseData)
    } else {
      errorCaseList.value.push(caseData)
    }
    allCaseList.value.push(caseData)
  })
  showCaseList.value = allCaseList.value
}

const getReportStepList = (reportCaseId) => {
  showStepList.value = []
  allStepList.value = []
  successStepList.value = []
  failStepList.value = []
  skipStepList.value = []
  errorStepList.value = []

  stepTableIsLoading.value = true
  GetReportStepList(props.testType, { report_case_id: reportCaseId, detail: true }).then(response => {
    stepTableIsLoading.value = false
    // 自动获取第一个步骤的数据
    if (response.data.length > 0) {
      getStepData(response.data[0].id)
    }
    parseReportStepList(response.data) // 分状态存储步骤数据
  })
}

const parseReportStepList = (stepList: any[]) => {
  stepList.forEach(step => {
    step['row_id'] = `step_${step.id}`

    // 分开储存步骤
    if (step.result === 'success') {
      successStepList.value.push(step)
    } else if (step.result === 'fail') {
      failStepList.value.push(step)
    } else if (step.result === 'skip') {
      skipStepList.value.push(step)
    } else {
      errorStepList.value.push(step)
    }
    allStepList.value.push(step)
  })

  showStepList.value = allStepList.value
}

const parseVariables = (caseData: { case_data: any; }) => {
  const case_data = caseData.case_data

  const variables = []
  for (var variable_key in case_data.variables) {
    variables.push({ key: variable_key, value: case_data.variables[variable_key] })
  }
  case_data.variables = variables

  const headers = []
  for (var header_key in case_data.headers) {
    headers.push({ key: header_key, value: case_data.variables[header_key] })
  }
  case_data.headers = headers

  return case_data
}

const showCaseEditor = (row: { case_id: any; }) => {
  bus.emit(busEvent.drawerIsShow, {
    eventType: 'report-show-edit-case',
    content: {
      caseId: row.case_id
    },
  })
}

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'show-report-case-list') {
    reportId.value = message.reportId
    getReportCaseList()
  }
}

</script>

<style scoped lang="scss">
:deep(.error-row){
  color: rgb(232, 124, 37);
}

:deep(.success-row){
  color: rgb(25, 212, 174);
}

:deep(.fail-row){
  color: rgb(250, 110, 134);
}

:deep(.skip-row){
  color: #909399;
}

</style>
