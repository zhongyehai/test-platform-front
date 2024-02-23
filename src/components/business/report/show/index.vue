<template>
  <div class="layout-container">

    <!-- 无测试报告数据，或者测试报告中没有运行数据 -->
    <div v-show="!reportSummary || reportSummary.stat.test_case.total === 0" class="str">
      无运行数据或所有运行数据均已跳过
    </div>

    <!-- 有数据 -->
    <div v-show="reportSummary && reportSummary.stat.count.step > 0">
      <!-- 第一行，头部信息 -->
      <div class="report-header">

        <el-select
            v-model="showCaseResultType"
            placeholder="用例展示类型"
            size="small"
            style="margin-left: 10px; width: 130px"
            filterable
            default-first-option
        >
          <el-option
              v-for="item in showCaseResultTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>

        <span style="float: right;font-size: 13px;color: #3a8ee6">
              <span v-if="testType !== 'app'" style="margin-right: 10px">环境: {{
                  runEnvDict[reportSummary.env.code]
                }}</span>
              <span style="margin-right: 10px">模式: {{ report.is_async === 1 ? '并行运行' : '串行运行' }}</span>
              <span style="margin-right: 10px">开始: {{ reportSummary.time.start_at }}</span>
            <!-- 执行耗时保留3为小数 -->
              <span style="margin-right: 10px"> 耗时: {{
                  reportSummary.time.case_duration ? reportSummary.time.case_duration.toString().slice(0, 5) : '-'
                }} 秒</span>

              <el-button
                  v-if="report.run_type == 'api'"
                  type="primary"
                  size="small"
                  @click.native="saveAsCase"
              >存为用例</el-button>

              <el-button
                  v-if="reportSummary.result !== 'success'"
                  type="primary"
                  size="small"
                  @click.native="showHitDrawer"
              >记录问题</el-button>

              <el-button type="primary" size="small" @click="showPythonScript = true">Python脚本</el-button>

              <el-button type="primary" size="small" @click="clickReRun">重跑</el-button>

            <!-- 删除报告 -->
            <el-popover :visible="checkDeleteIsShow" placement="top" popper-class="down-popover" width="450px">
              确定删除所选中的测试报告?
              <div style="color: red">
                1、关联了问题记录的测试报告不会被删除 <br>
                2、触发方式为【定时任务】或者【流水线】的，只有管理员能删除
              </div>
              <div style="text-align: right; margin-right: 10px">
                <el-button size="small" type="text" @click="checkDeleteIsShow = false">取消</el-button>
                <el-button type="primary" size="small" @click="deleteReport">确定</el-button>
              </div>
              <template #reference>
                <el-button
                    type="danger"
                    size="small"
                    style="margin-right: 5px"
                    @click="checkDeleteIsShow = true"
                >删除
                </el-button>
              </template>
            </el-popover>

          </span>
      </div>

    </div>

    <!-- 用例/步骤列表查看 -->
    <showCaseAndStepListView
        :test-type="testType"
        :show-case-type="showCaseResultType"
        :show-step-type="showStepResultType"
    />

    <!-- 记录问题 -->
    <addHitDrawer />


    <!-- 打开用例 -->
    <editCaseDrawer :test-type="testType" :project-id="report.project_id" />

    <selectRunEnv :test-type="testType" :business-id="project.business_id"></selectRunEnv>
    <showRunProcess :test-type="testType"></showRunProcess>

    <el-drawer
        title="脚本管理"
        size="85%"
        :append-to-body="true"
        v-model="showPythonScript"
    >
      <pythonScriptIndex />
    </el-drawer>

  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount} from "vue";
import {useRoute} from "vue-router"
import {GetReport, DeleteReport} from "@/api/business-api/report";
import {GetProject} from "@/api/business-api/project";
import {GetRunEnvList} from "@/api/config/run-env";
import {bus, busEvent} from "@/utils/bus-events";

import addHitDrawer from '@/views/assist/hits/drawer.vue'
import editCaseDrawer from '@/components/business/case/edit-drawer.vue'
import showCaseAndStepListView from './case-and-step-list.vue'
import SelectRunEnv from "@/components/select-run-env.vue";
import ShowRunProcess from "@/components/show-run-process.vue";
import pythonScriptIndex from '@/views/assist/script/index.vue'
import {GetServerList} from "@/api/business-api/device-server";
import {GetPhoneList} from "@/api/business-api/device-phone";
import {GetCase, GetCaseFromProject, RunCase} from "@/api/business-api/case";
import {RunTask} from "@/api/business-api/task";
import {RunCaseSuite} from "@/api/business-api/case-suite";
import {RunApi} from "@/api/business-api/api";

const props = defineProps({
  testType: {
    default: '',
    type: String
  }
})

const route = useRoute()
const reportId = route.query.id
const report = ref({
  project_id: undefined,
  is_async: 0,
  run_type: '',
  trigger_id: [],
  temp_variables: []
})
const reportSummary = ref({
  result: 'success',
  stat: {
    test_case: {fail: 0, skip: 0, error: 0, total: 1, success: 0},
    test_step: {fail: 0, skip: 0, error: 0, total: 0, success: 0},
    count: {api: 0, step: 0, element: 0}
  },
  time: {end_at: '', start_at: '', case_duration: 0, step_duration: 0, all_duration: 0},
  env: {code: '', name: ''}
})

// 要展示的用例类型
const showCaseResultType = ref('all')
// 根据用例结果类型展示报告
const showCaseResultTypeList = ref([
  {label: '展示全部用例', value: 'all'},
  {label: '展示成功的用例', value: 'success'},
  {label: '展示失败的用例', value: 'fail'},
  {label: '展示跳过的用例', value: 'skip'}
])
// 要展示的步骤类型
const showStepResultType = ref('all')
// 根据步骤结果类型展示报告
const showStepResultTypeList = ref([
  {label: '展示全部步骤', value: 'all'},
  {label: '展示成功的步骤', value: 'success'},
  {label: '展示失败的步骤', value: 'fail'},
  {label: '展示错误的步骤', value: 'error'},
  {label: '展示跳过的步骤', value: 'skip'}
])

const runEnvList = ref([])
const runEnvDict = ref({})
const checkDeleteIsShow = ref(false)
const showPythonScript = ref(false)
const caseChartData = ref({
  columns: ['caseName', 'num'],
  rows: [
    {'caseName': '成功步骤', num: 0},
    {'caseName': '失败步骤', num: 0},
    {'caseName': '错误步骤', num: 0},
    {'caseName': '跳过步骤', num: 0}
  ]
})
const suiteChartData = ref({
  columns: ['name', 'num'],
  rows: [
    {'name': '成功case', 'num': 0}, {'name': '失败case', 'num': 0}
  ]
})

const project = ref({
  business_id: undefined
})

const triggerFrom = 'show-report'

const getReport = (reportId: any) => {
  GetReport(props.testType, {id: reportId}).then(response => {
    report.value = response.data
    reportSummary.value = response.data.summary

    bus.emit(busEvent.drawerIsShow, {eventType: 'show-report-case-list', reportId: reportId})

    // 渲染饼图需要的数据, 如果是没完成的报告，则饼图统计为0
    if (reportSummary.value.stat) {
      caseChartData.value['rows'][0]['num'] = reportSummary.value.stat.test_step.success
      caseChartData.value['rows'][1]['num'] = reportSummary.value.stat.test_step.fail
      caseChartData.value['rows'][2]['num'] = reportSummary.value.stat.test_step.error
      caseChartData.value['rows'][3]['num'] = reportSummary.value.stat.test_step.skip
      suiteChartData.value['rows'][0]['num'] = reportSummary.value.stat.test_case.success
      suiteChartData.value['rows'][1]['num'] = reportSummary.value.stat.test_case.fail
    }
  })
}

const deleteReport = () => {
  DeleteReport(props.testType, {id_list: [reportId]}).then(response => {
    if (response) {
      // window.opener = null;
      // window.open('about:blank', '_self')
      window.close();
    }
  })
}

const getRunEnvList = () => {
  GetRunEnvList({page_num: 1, page_size: 99999}).then(response => {
    runEnvList.value = response.data.data
    runEnvList.value.forEach((env: { code: string | number; name: any; }) => {
      runEnvDict.value[env.code] = env.name
    })
  })
}

const showHitDrawer = () => {
  bus.emit(busEvent.drawerIsShow, {
    eventType: 'hit',
    content:       {
      date: reportSummary.value.time.start_at,
      test_type: reportSummary.value.run_type,
      run_env: reportSummary.value.env.code,
      report_id: reportId,
      project_id: report.value.project_id
    }
  })
}

const saveAsCase = () => {

}

const getProjectAndSendEvent = () => {
  GetProject(props.testType, {id: report.value.project_id}).then(response => {
    project.value = response.data

    if (report.value.run_type === 'case') {
      const tempVariables = report.value.temp_variables
      if (tempVariables) { // 本身就有临时参数
        sendReRun(tempVariables)
      } else { // 没有就获取用例的数据
        if (report.value.trigger_id.length === 1) {
          GetCase(props.testType, { id: report.value.trigger_id[0] }).then(response => {
            const case_data = response.data
            sendReRun({
              skip_if: case_data.skip_if, variables: case_data.variables,
              run_times: case_data.run_times, headers: case_data.headers
            })
          })
        } else {
          sendReRun(null)
        }
      }
    }else {
      sendReRun(null)
    }
  })
}

const sendReRun = (tempRunArgs: any) => {
  bus.emit(busEvent.drawerIsShow, {
    eventType: 'select-run-env',
    triggerFrom: triggerFrom,
    showSelectRunModel: ['task', 'suite'].indexOf(report.value.run_type) !== -1,
    business_id: project.value.business_id,
    runArgs: tempRunArgs
  })
}

const clickReRun = () => {
  if (props.testType === 'app') {
    if (busEvent.data.runServerList.length < 1) {
      GetServerList({ page_num: 1, page_size: 99999 }).then(response => {
        busEvent.data.runServerList = response.data.data
      })
    }

    if (busEvent.data.runPhoneList.length < 1) {
      GetPhoneList({ page_num: 1, page_size: 99999 }).then(response => {
        busEvent.data.runPhoneList = response.data.data
      })
    }
  }

  getProjectAndSendEvent()
}

const getRunUrl = () => {
  const run_type = report.value.run_type
  return run_type === 'task' ? RunTask
      : run_type === 'suite' ? RunCaseSuite
          : run_type === 'case' ? RunCase
              : RunApi
}

const reRun = (runConf) => {
  const runUrl = getRunUrl()
  runUrl(props.testType, {
    api_list: report.value.run_type === 'api' ? report.value.trigger_id : undefined,
    case_id_list: report.value.run_type === 'case' ? report.value.trigger_id : undefined,
    id: ['task', 'suite'].indexOf(report.value.run_type) !== -1 ? report.value.trigger_id : undefined,
    env_list: runConf.runEnv,
    is_async: runConf.runType,
    browser: runConf.browser,
    server_id: runConf.runServer,
    phone_id: runConf.runPhone,
    no_reset: runConf.noReset,
    temp_variables: runConf.temp_variables,
    'trigger_type': 'page'
  }).then(response => {
    if (response) {
      bus.emit(busEvent.drawerIsShow, {
        eventType: 'run-process',
        batch_id: response.data.batch_id,
        report_id: response.data.report_id
      })
    }
  })
}

onMounted(() => {
  getReport(reportId)
  getRunEnvList()

  bus.on(busEvent.drawerIsShow, showCaseEditor);
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, showCaseEditor);
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'select-run-env' && message.triggerFrom === triggerFrom) {
    reRun(message)
  }
}

const showCaseEditor = (message: any) => {
  if (message.eventType === 'report-show-edit-case') {
    GetCaseFromProject(props.testType, { id: message.content.caseId }).then(response => {
      project.value = response.data.project
      bus.emit(busEvent.drawerIsShow, {
        eventType: 'edit-case',
        content: JSON.parse(JSON.stringify(response.data.case))
      })
    })
  }
}

</script>

<style scoped lang="scss">
.str {
  font-size: 30px;
  text-align: center;
  margin-top: 10%;
}

.report-header {
  margin-top: 10px;
}

</style>
