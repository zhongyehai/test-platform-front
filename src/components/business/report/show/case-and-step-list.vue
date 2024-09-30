<template>
  <div style="margin-left: 5px; margin-right: 5px">
    <el-row>
      <el-col :xs="9" :sm="8" :md="9" :lg="10" :xl="10"
              style="border:3px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <el-tabs v-model="caseListTab">
          <el-tab-pane :label="caseListTab" :name="caseListTab">
            <span>
              <el-input v-model="filterText" placeholder="输入关键字过滤" style="width: 70%;margin-right: 10px"/>
              <el-button type="primary" @click="treeIsShowAll('expand')" style="margin: 0 5px 0 0; padding: 4px; float: right">展开全部</el-button>
              <el-button type="primary" @click="treeIsShowAll('collapse')" style="margin: 0 5px 0 0; padding: 4px; float: right">收起全部</el-button>
            </span>
            <el-scrollbar class="aside_scroll" :style="{height: `${treeScrollHeight}`}">
              <el-tree
                  v-loading="treeIsLoading"
                  ref="treeRef"
                  class="filter-tree"
                  node-key="id"
                  :data="suiteList"
                  :props="defaultProps"
                  highlight-current
                  :default-expanded-keys="suiteIdList"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  @node-click="clickTree"
              >
                <template #default="{ node, data }">
                  <div class="custom-tree-node" @mouseenter="mouseenter(data)" @mouseleave="mouseleave(data)">
                  <span :style="{
                    'color': getColor(data),
                    'textDecoration': data.result === 'skip' ? 'line-through' : ''
                  }"
                  >
                    <span style="font-size: 12px">【{{ getTage(data) }}】{{ getDuration(data) }}</span>
                    <span>{{ node.label }}</span>
                  </span>
                    <span v-show="data.id === currentNode.id && data.suite_id && data.result !== 'waite'">
                      <el-button type="primary" @click.stop="showCaseEditor(data)" style="margin: 0; padding: 4px">编辑</el-button>
                  </span>
                  </div>
                </template>
              </el-tree>
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <el-col :xs="15" :sm="16" :md="15" :lg="14" :xl="14">
        <div style="margin-left: 5px">
          <!-- 测试步骤详情 -->
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

          <!-- 测试用例详情 -->
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
  </div>

</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount, watch, nextTick, computed} from "vue";
import {ElTree} from 'element-plus'
import {
  GetReportStepDetail,
  GetReportStepImg,
  GetReportSuiteList
} from "@/api/business-api/report";
import {bus, busEvent} from "@/utils/bus-events";
import showReportCaseDetailView from './case-detail.vue'
import showReportStepDetailView from './step-detail.vue'
import {ellipsis} from "@/utils/parse-data";

const props = defineProps({
  testType: {
    default: '',
    type: String
  }
})


interface Tree {
  [key: string]: any
}

const filterText = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()
const tempLabel = ref()
const defaultProps = {
  children: 'children',
  label: 'name',
}

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.name.includes(value)
}

// 鼠标滑入
const mouseenter = (data: { name: string; showDropdownMenu: boolean; }) => {
  data.realName = data.name
  currentNode.value = data
  tempLabel.value = JSON.parse(JSON.stringify(data.name))
  data.name = ellipsis(data.name, 8)
}

// 鼠标滑出
const mouseleave = (data: { name: any; showDropdownMenu: boolean; }) => {
  currentNode.value = {}
  data.name = tempLabel.value
}

const getColor = (data) => {
  return data.result === 'error' ? 'rgb(232, 124, 37)'
      : data.result === 'fail' ? 'rgb(250, 110, 134)'
          : data.result === 'skip' ? '#909399'
              : 'rgb(25, 212, 174)'
}

const getTage = (data) => {
  return data.report_case_id ? '步骤'
      : data.suite_id ? '用例'
      : data.result ? '用例集' : '接口'
}

const getDuration = (data) => {
  if (!data.summary) return ''
  return data.summary.time ? `【${data.summary.time.all_duration}秒】` : `【${data.summary.elapsed_ms}毫秒】`
}

const clickTree = (data: any) => {
  if (data.report_case_id) { // 点步骤
    getStepData(data.id)
    reportCaseDetailIsShow.value = false
  } else if (data.suite_id) { // 点用例
    reportCase.value = JSON.parse(JSON.stringify(data))
    reportStepDetailIsShow.value = false
    reportCaseDetailIsShow.value = true
  }
}

const reportId = ref()
const treeIsLoading = ref(false)
const suiteList = ref([])
const suiteIdList = ref([])
const currentNode = ref({id: undefined})
const treeScrollHeight = computed(() => {
  if (innerHeight < 800) {  // 小屏
    return `${innerHeight * 0.70}px`
  } else {  // 大屏
    return `${innerHeight * 0.80}px`
  }
})
const scrollHeight = computed(() => {
  if (innerHeight < 800) {  // 小屏
    return `${innerHeight * 0.70}px`
  } else {  // 大屏
    return `${innerHeight * 0.83}px`
  }
})

const caseListTab = '用例列表'
const caseDataTab = '用例明细'
const stepDataTab = '步骤明细'
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
  result: '',
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

const getStepData = (reportStepId: any) => {
  treeIsLoading.value = true
  GetReportStepDetail(props.testType, {id: reportStepId}).then(response => {
    treeIsLoading.value = false
    reportStep.value = response.data.step_data
    reportStep.value.result = response.data.result
    reportStepDetailIsShow.value = true

    // 非接口测试，获取对应的步骤截图
    if (props.testType !== 'api') {
      // 获前置取截图
      beforeImgIsLoading.value = true
      GetReportStepImg(props.testType, {
        report_id: reportId.value,
        report_step_id: reportStepId,
        img_type: 'before_page'
      }).then(response => {
        reportStep.value.before = response.data.data
        beforeImgIsLoading.value = false
      })

      // 获后置取截图
      afterImgIsLoading.value = true
      GetReportStepImg(props.testType, {
        report_id: reportId.value,
        report_step_id: reportStepId,
        img_type: 'after_page'
      }).then(response => {
        reportStep.value.after = response.data.data
        afterImgIsLoading.value = false
      })
    }
  })
}

const getReportSuiteList = () => {
  treeIsLoading.value = true
  GetReportSuiteList(props.testType, {report_id: reportId.value}).then(response => {
    treeIsLoading.value = false
    suiteList.value = response.data
    response.data.forEach(item => {
      suiteIdList.value.push(item.id)
    })
  })
}

// 控制展开全部和收起全部
const treeIsShowAll = (option: string) => {
  const isExpand = option === 'expand'
  const nodes = treeRef.value.store.nodesMap
  for (const node in nodes)
    nodes[node].expanded = isExpand
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
    reportId.value = message.content.id
    getReportSuiteList()
  }
}

</script>

<style scoped lang="scss">
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

</style>
