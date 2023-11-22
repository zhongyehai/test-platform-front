<template>
  <div>
    <div class="reportShow" style="line-height: 36px;">
      <!-- 用例列表组件根据条件加载只能用v-show，不能用v-if -->
      <!-- 有测试报告数据 -->
      <div v-show="reportSummary && reportSummary.stat.count.step > 0">

        <!-- 第一行，头部信息 -->
        <div class="grid-content" style="background-color: #f5f5f5 !important;">
          <el-button
            type="primary"
            size="mini"
            round
            style="margin-left: 10px; margin-top: 5px;padding: 4px 10px ;"
            @click="isShowStatImg = !isShowStatImg"
          >{{ isShowStatImg ? '隐藏统计图' : '展示统计图' }}
          </el-button>

          <el-select
            v-model="showCaseResultType"
            placeholder="用例展示类型"
            size="mini"
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

          <!--          <el-select-->
          <!--            v-model="showStepResultType"-->
          <!--            placeholder="步骤展示类型"-->
          <!--            size="mini"-->
          <!--            style="margin-left: 10px; width: 130px"-->
          <!--            filterable-->
          <!--            default-first-option-->
          <!--          >-->
          <!--            <el-option-->
          <!--              v-for="item in showStepResultTypeList"-->
          <!--              :key="item.value"-->
          <!--              :label="item.label"-->
          <!--              :value="item.value"-->
          <!--            />-->
          <!--          </el-select>-->

          <span style="float: right;font-size: 13px;color: #3a8ee6">
            <span v-if="dataType !== 'appUi'" style="margin-right: 10px">环境: {{
              runEnvDict[reportSummary.env.code]
            }}</span>
            <span style="margin-right: 10px">模式: {{ reportSummary.is_async === 1 ? '并行运行' : '串行运行' }}</span>
            <span style="margin-right: 10px">开始: {{ reportSummary.time.start_at }}</span>
            <!-- 执行耗时保留3为小数 -->
            <span style="margin-right: 10px"> 耗时: {{ reportSummary.time.case_duration ? reportSummary.time.case_duration.toString().slice(0, 5) : '-' }} 秒</span>

            <el-button
              v-if="reportSummary.result !== 'success'"
              type="primary"
              size="mini"
              style="margin-right: 5px"
              @click.native="showHitDrawer('add')"
            >记录问题</el-button>

            <!-- Python脚本 -->
            <el-button
              type="primary"
              size="mini"
              style="margin-right: 5px"
              @click="showPythonScriptManage = true"
            >Python脚本</el-button>

            <!-- Python脚本 -->
            <el-button
              type="primary"
              size="mini"
              style="margin-right: 10px"
              @click="reRun()"
            >重跑</el-button>

            <!-- 删除报告 -->
            <el-popover
              v-model="deletePopoverIsShow"
              placement="top"
              popper-class="down-popover"
            >
              <p>确定删除此报告?</p>
              <p style="color: red">关联了失败记录的测试报告不会被删除</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="deletePopoverIsShow = false">取消</el-button>
                <el-button type="primary" size="mini" @click="deleteReport()">确定</el-button>
              </div>
              <el-button
                slot="reference"
                type="danger"
                size="mini"
                style="margin-right: 10px"
              >删除
              </el-button>
            </el-popover>

          </span>
        </div>

        <!-- 第二行，饼图 -->
        <el-row v-show="isShowStatImg">
          <!-- 步骤 -->
          <el-col :span="12">
            <div style="height: 200px;float:left;">
              <ve-pie :data="caseChartData" :settings="caseChartSettings" height="200px" width="400px" />
            </div>
            <div style="margin-top:40px;font-size:14px;line-height:25px;font-weight:600">
              <div style="color: #927B8B">总数: {{ reportSummary.stat.test_step.total }}</div>
              <div style="color: #19D4AE">成功: {{ reportSummary.stat.test_step.success }}</div>
              <div style="color: #FA6E86">失败: {{ reportSummary.stat.test_step.fail }}</div>
              <div style="color: #E87C25">错误: {{ reportSummary.stat.test_step.errors }}</div>
              <div style="color: #60C0DD">跳过: {{ reportSummary.stat.test_step.skipped }}</div>
            </div>
          </el-col>

          <!-- 用例 -->
          <el-col :span="12">
            <div style="height: 200px;float:left;">
              <ve-ring :data="suiteChartData" :settings="suiteChartSettings" height="200px" width="350px" />
            </div>
            <div style="margin-top:40px;font-size:14px;line-height:25px;font-weight:600">
              <div style="color: #927B8B">总数: {{ reportSummary.stat.test_case.total }}</div>
              <div style="color: #19D4AE">成功: {{ reportSummary.stat.test_case.success }}</div>
              <div style="color: #FA6E86">失败: {{ reportSummary.stat.test_case.fail }}</div>
            </div>
          </el-col>
        </el-row>

        <!-- 用例/步骤详情 -->
        <showCaseAndStepListView
          :data-type="dataType"
          :show-case-type="showCaseResultType"
          :show-step-type="showStepResultType"
        />
      </div>

      <!-- 无测试报告数据，历史的测试报告没有数据 -->
      <div v-show="!reportSummary || reportSummary.stat.test_case.total === 0" class="str">
        无运行数据或所有运行数据均已跳过
      </div>

      <!-- 记录问题 -->
      <hitDrawer
        :run-test-type-list="runTestTypeList"
        :run-env-list="envList"
      />

      <!-- 打开用例 -->
      <caseDrawer
        :data-type="dataType"
        :current-project-id="caseProjectId"
        :current-set-id="caseSuiteId"
      />

      <!-- 选择运行环境 -->
      <selectRunEnv
        :data-type="dataType"
        :project-business-id="projectBusinessId"
      />

      <!-- 测试执行进度 -->
      <runProcess
        :data-type="dataType"
      />

      <el-drawer
        title="脚本管理"
        size="85%"
        :append-to-body="true"
        :visible.sync="showPythonScriptManage"
        :direction="direction"
      >
        <pythonScriptIndex />
      </el-drawer>

    </div>
  </div>

</template>

<script>
import hitDrawer from '@/views/assist/hits/drawer'
import pythonScriptIndex from '@/views/assist/script/index'
import caseDrawer from '@/components/business/case/editDrawer.vue'
import showCaseAndStepListView from '@/components/business/report/showCaseAndStepList.vue'

import { runEnvList } from '@/apis/config/runEnv'
import {
  deleteReport as deleteApiReport,
  getReport as apiGetReport
} from '@/apis/apiTest/report'
import { getProject as apiGetProject } from '@/apis/apiTest/project'
import { runApi as apiRun } from '@/apis/apiTest/api'
import { caseSuiteRun as apiRunCaseSuite } from '@/apis/apiTest/suite'
import { runTask as apiRunTask } from '@/apis/apiTest/task'
import { getCase as apiGetCase, caseRun as apiCaseRun, caseProject as apiGetCaseProject } from '@/apis/apiTest/case'

import {
  deleteReport as deleteWebUiReport,
  getReport as webUiGetReport
} from '@/apis/webUiTest/report'
import {
  getCase as webUiGetCase,
  caseRun as webUiCaseRun,
  caseProject as webUiGetCaseProject
} from '@/apis/webUiTest/case'
import { getProject as webUiGetProject } from '@/apis/webUiTest/project'
import { caseSuiteRun as webUiRunCaseSuite } from '@/apis/webUiTest/suite'
import { runTask as webUiRunTask } from '@/apis/webUiTest/task'

import {
  deleteReport as deleteAppUiReport,
  getReport as appUiGetReport
} from '@/apis/appUiTest/report'
import {
  getCase as appUiGetCase,
  caseRun as appUiCaseRun,
  caseProject as appUiGetCaseProject
} from '@/apis/appUiTest/case'
import { getProject as appUiGetProject } from '@/apis/appUiTest/project'
import { caseSuiteRun as appUiRunCaseSuite } from '@/apis/appUiTest/suite'
import { runTask as appUiRunTask } from '@/apis/appUiTest/task'

import { reportStepResultMapping } from '@/utils/mapping'
import selectRunEnv from '@/components/selectRunEnv.vue'
import runProcess from '@/components/runProcess.vue'
import { phoneList, serverList } from '@/apis/appUiTest/device'

export default {
  name: 'ReportShow',
  components: {
    runProcess, selectRunEnv,
    caseDrawer,
    pythonScriptIndex,
    hitDrawer,
    showCaseAndStepListView
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['dataType'],

  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      deletePopoverIsShow: false,
      showPythonScriptManage: false,
      runTestTypeList: [],
      envList: [],
      runEnvDict: {},

      // 选中打开用例
      caseProjectId: '',
      caseSuiteId: '',
      projectBusinessId: '',

      msg: { copyText: 'copy', copiedText: 'copied' },
      defaultShowDetailInfo: ['01', '03', '04', '05', '08'], // 默认展开报告详情的项
      defaultShowRequestInFo: ['request_05'], // 接口自动化，请求信息
      defaultShowResponseInFo: ['response_02'], // 接口自动化，响应信息
      defaultShowExecuteInFo: ['execute_01', 'execute_02'], // UI自动化，执行信息

      // 要展示的用例类型
      showCaseResultType: 'all',
      showCaseResultTypeList: [
        { label: '展示全部用例', value: 'all' },
        { label: '展示成功的用例', value: 'success' },
        { label: '展示失败的用例', value: 'fail' },
        { label: '展示跳过的用例', value: 'skip' }
      ], // 根据用例结果类型展示报告

      // 要展示的步骤类型
      showStepResultType: 'all',
      showStepResultTypeList: [
        { label: '展示全部步骤', value: 'all' },
        { label: '展示成功的步骤', value: 'success' },
        { label: '展示失败的步骤', value: 'fail' },
        { label: '展示错误的步骤', value: 'error' },
        { label: '展示跳过的步骤', value: 'skip' }
      ], // 根据步骤结果类型展示报告

      caseChartSettings: {
        radius: 80,
        avoidLabelOverlap: false,
        offsetY: 110,
        itemStyle: {
          normal: {
            color: function(params) {
              const colorList = [
                'rgb(25,212,174)', 'rgb(250,110,134)', '#FE8463', '#60C0DD', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ]
              return colorList[params.dataIndex]
            }
          }
        },
        label: {
          normal: { position: 'center', show: false }
        },
        labelLine: {
          normal: { show: false }
        }

      },

      suiteChartSettings: {
        radius: [50, 80],
        avoidLabelOverlap: false,
        offsetY: 110,
        itemStyle: {
          normal: {
            color: function(params) {
              const colorList = [
                'rgb(25,212,174)', 'rgb(250,110,134)', '#fb2828', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ]
              return colorList[params.dataIndex]
            }
          }
        },
        label: {
          normal: { position: 'center', show: false }
        },
        labelLine: {
          normal: { show: false }
        }
      },
      caseScrollbarHeight: `${window.innerHeight * 0.85}px`, // 用例和步骤内容的高度
      isShowStatImg: false, // 是否展示统计饼图
      showColor: [],
      caseChartData: {
        columns: ['caseName', 'num'],
        rows: [
          { 'caseName': '成功步骤', num: 0 },
          { 'caseName': '失败步骤', num: 0 },
          { 'caseName': '错误步骤', num: 0 },
          { 'caseName': '跳过步骤', num: 0 }
        ]
      },
      suiteChartData: {
        columns: ['name', 'num'],
        rows: [
          { 'name': '成功case', 'num': 0 }, { 'name': '失败case', 'num': 0 }
        ]
      },

      reportSummary: {
        'result': 'success',
        'stat': {
          'test_case': {
            'fail': 0,
            'skip': 0,
            'error': 0,
            'total': 1,
            'success': 1
          },
          'test_step': {
            'fail': 0,
            'skip': 0,
            'error': 0,
            'total': 1,
            'success': 1
          },
          'count': {
            'api': 1,
            'step': 1,
            'element': 0
          }
        },
        'time': {
          'end_at': '',
          'start_at': '2023-09-11 09:47:59.584603',
          'case_duration': 2.0637,
          'step_duration': 2063.686,
          'all_duration': 0
        },
        'env': {
          'code': 'dev_qa',
          'name': '开发环境'
        }
      },
      resultMapping: reportStepResultMapping,
      reRunReport: {},
      apiRunUrl: '',
      caseRunUrl: '',
      taskRunUrl: '',
      caseSuiteRunUrl: '',
      getProjectUrl: '',
      getReportUrl: '',
      getCaseUrl: '',
      deleteReportUrl: '',
      getCaseProjectUrl: ''
    }
  },

  mounted() {
    // 提交选择运行环境，执行运行
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, _runUnit, runDict) => {
      if (_type === 'selectRunEnv' && _runUnit === 'reportShow') {
        this.runCase(runDict)
      }
    })

    // 监听列表上的打开用例
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, caseId) => {
      if (_type === 'reportShowCaseInfo') {
        this.showCaseEditDrawer(caseId)
      }
    })
  },

  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  created() {
    if (this.dataType === 'api') {
      this.apiRunUrl = apiRun
      this.caseRunUrl = apiCaseRun
      this.taskRunUrl = apiRunTask
      this.caseSuiteRunUrl = apiRunCaseSuite
      this.getCaseUrl = apiGetCase
      this.getReportUrl = apiGetReport
      this.getProjectUrl = apiGetProject
      this.deleteReportUrl = deleteApiReport
      this.getCaseProjectUrl = apiGetCaseProject
    } else if (this.dataType === 'webUi') {
      this.taskRunUrl = webUiRunTask
      this.caseSuiteRunUrl = webUiRunCaseSuite
      this.caseRunUrl = webUiCaseRun
      this.getCaseUrl = webUiGetCase
      this.getReportUrl = webUiGetReport
      this.getProjectUrl = webUiGetProject
      this.deleteReportUrl = deleteWebUiReport
      this.getCaseProjectUrl = webUiGetCaseProject
    } else {
      this.taskRunUrl = appUiRunTask
      this.caseSuiteRunUrl = appUiRunCaseSuite
      this.caseRunUrl = appUiCaseRun
      this.getCaseUrl = appUiGetCase
      this.getReportUrl = appUiGetReport
      this.getProjectUrl = appUiGetProject
      this.deleteReportUrl = deleteAppUiReport
      this.getCaseProjectUrl = appUiGetCaseProject
    }

    // 获取环境列表
    runEnvList({ page_num: 1, page_size: 99999 }).then(response => {
      this.envList = response.data.data
      this.envList.forEach(env => {
        this.runEnvDict[env.code] = env.name
      })
    })

    this.getReportDataById()
  },

  methods: {
    deleteReport() {
      this.deleteReportUrl({ id_list: [this.$route.query.id] }).then(response => {
        if (this.showMessage(this, response)) {
          open(location, '_self').close()
        }
      })
    },

    // 打开用例信息
    showCaseEditDrawer(caseId) {
      this.getCaseProjectUrl({ id: caseId }).then(response => {
        this.projectBusinessId = response.data.project.business_id
        this.caseProjectId = response.data.project.id
        this.caseSuiteId = response.data.suite.id
        this.$bus.$emit(
          this.$busEvents.drawerIsShow,
          'caseInfo',
          'edit',
          JSON.parse(JSON.stringify(response.data.case))
        )
      })
    },

    // 记录问题
    showHitDrawer(status) {
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'hit',
        status,
        {
          date: this.reportSummary.time.start_at,
          test_type: this.reportSummary.run_type,
          run_env: this.reportSummary.env.code,
          report_id: this.$route.query.id
        })
    },

    // 获取测试报告具体内容
    getReportDataById() {
      const loading = this.$loading({
        lock: true,
        text: '数据获取中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.getReportUrl({ 'id': this.$route.query.id }).then((response) => {
        loading.close()
        if (this.showMessage(this, response)) {
          this.reRunReport = response.data
          this.reportSummary = response.data.summary

          this.$bus.$emit(this.$busEvents.drawerIsShow, 'showReportCaseList', this.reRunReport.id)

          // 渲染饼图需要的数据, 如果是没完成的报告，则饼图统计为0
          if (this.reportSummary.stat) {
            this.caseChartData['rows'][0]['num'] = this.reportSummary.stat.test_step.success
            this.caseChartData['rows'][1]['num'] = this.reportSummary.stat.test_step.fail
            this.caseChartData['rows'][2]['num'] = this.reportSummary.stat.test_step.errors
            this.caseChartData['rows'][3]['num'] = this.reportSummary.stat.test_step.skipped
            this.suiteChartData['rows'][0]['num'] = this.reportSummary.stat.test_case.success
            this.suiteChartData['rows'][1]['num'] = this.reportSummary.stat.test_case.fail
          }
        }
      }
      )
    },

    // 触发重跑
    reRun() {
      // 获取运行服务器和设备
      if (this.dataType === 'appUi') {
        if (this.$busEvents.data.runServerList.length < 1) {
          serverList({ page_num: 1, page_size: 99999 }).then(response => {
            this.$busEvents.data.runServerList = response.data.data
          })
        }

        if (this.$busEvents.data.runPhoneList.length < 1) {
          phoneList({ page_num: 1, page_size: 99999 }).then(response => {
            this.$busEvents.data.runPhoneList = response.data.data
          })
        }
      }

      // 获取报告对应的服务的业务线id
      let project = null

      // 获取服务
      this.getProjectUrl({ id: this.reRunReport.project_id }).then(response => {
        project = response.data

        const run_type = this.reRunReport.run_type
        if (run_type === 'case') {
          const temp_variables = this.reRunReport.temp_variables
          if (temp_variables) { // 本身就有临时参数
            this.sendReRun(project.business_id, temp_variables)
          } else { // 没有就获取用例的数据
            if (this.reRunReport.trigger_id.length === 1) {
              this.getCaseUrl({ id: this.reRunReport.trigger_id[0] }).then(response => {
                const case_data = response.data
                this.sendReRun(project.business_id, {
                  skip_if: case_data.skip_if,
                  variables: case_data.variables,
                  run_times: case_data.run_times,
                  headers: case_data.headers
                })
              })
            } else {
              this.sendReRun(project.business_id, null)
            }
          }
        } else {
          this.sendReRun(project.business_id, null)
        }
      })
    },

    sendReRun(business_id, temp_run_args) {
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'selectRunEnv',
        'reportShow',
        ['task', 'suite'].indexOf(this.reRunReport.run_type) !== -1,
        business_id,
        temp_run_args
      )
    },

    getRunUrl() {
      const run_type = this.reRunReport.run_type
      return run_type === 'task' ? this.taskRunUrl
        : run_type === 'suite' ? this.caseSuiteRunUrl
          : run_type === 'case' ? this.caseRunUrl
            : this.apiRunUrl
    },

    // 运行用例
    runCase(runConf) {
      const runUrl = this.getRunUrl()

      runUrl({
        api_list: this.reRunReport.run_type === 'api' ? this.reRunReport.trigger_id : undefined,
        case_id_list: this.reRunReport.run_type === 'case' ? this.reRunReport.trigger_id : undefined,
        id: ['task', 'suite'].indexOf(this.reRunReport.run_type) !== -1 ? this.reRunReport.trigger_id : undefined,
        env_list: runConf.runEnv,
        is_async: runConf.runType,
        browser: runConf.browser,
        server_id: runConf.runServer,
        phone_id: runConf.runPhone,
        no_reset: runConf.noReset,
        temp_variables: runConf.temp_variables,
        'trigger_type': 'page'
      }).then(response => {
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.batch_id, response.data.report_id)
        }
      })
    }
  }
}

</script>

<style scoped>
.el-collapse-item-title {
  font-weight: 600;
  font-size: 15px;
  margin-left: 10px;
  color: #409eff
}

.el-collapse-item-content {
  text-align: center;
}

.el-main {
  line-height: 36px;
}

.wire {
  border-top: 1px solid #eee;

}

.active {
  background: #f7f7f7;
  font-weight: 600;
}

.grid-content {
  min-height: 36px;
}

.content {
  height: auto;
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
  border-bottom: 1px solid #d0d0d0;
}

/* 用例名文字描述 */
/deep/ .el-collapse-item__header {
  /*height: 40px;*/
  /*line-height: 25px;*/
  line-height: 150%;
  height: auto;
  padding: 10px 0;
}

.str {
  font-size: 30px;
  text-align: center;
  margin-top: 10%;
}
</style>
